import json
import logging
import re
from typing import Any, Dict, List

from openai import OpenAI

from app.core.settings import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


def _get_openai_client() -> OpenAI | None:
    """Get OpenAI client if API key is configured."""
    if not settings.openai_api_key:
        logger.warning("AI:mock fallback reason=no_key")
        return None
    
    key_type = settings.openai_key_type()
    
    if key_type in ["project", "service_account"]:
        if not settings.openai_org_id or not settings.openai_project_id:
            logger.warning("AI:mock fallback reason=missing_org_project_for_%s_key", key_type)
            return None
        
        try:
            return OpenAI(
                api_key=settings.openai_api_key,
                organization=settings.openai_org_id,
                project=settings.openai_project_id,
                timeout=15.0
            )
        except Exception as e:
            logger.warning("AI:mock fallback reason=client_init_failed error=%s", str(e))
            return None
    
    elif key_type == "classic":
        try:
            return OpenAI(
                api_key=settings.openai_api_key,
                timeout=15.0
            )
        except Exception as e:
            logger.warning("AI:mock fallback reason=client_init_failed error=%s", str(e))
            return None
    
    else:
        logger.warning("AI:mock fallback reason=unknown_key_type")
        return None


def _safe_json_parse(text: str, retry_prompt: str = None) -> Dict[str, Any] | List[Dict[str, Any]] | None:
    """Safely parse JSON from text, with optional retry for stricter parsing."""
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        # Try to extract JSON block from text
        json_match = re.search(r'\{.*\}|\[.*\]', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        return None


async def generate_tiny_step_from_mood(
    user_id: str, energy: int, emotion: str, note: str | None
) -> Dict[str, str]:
    """Generate a tiny step based on user's current mood."""
    client = _get_openai_client()
    
    if not client:
        # Deterministic fallback when no client
        content = "Take three deep breaths and notice how you're feeling right now"
        rationale = "Starting with breathing helps ground you in the present moment"
        return {"content": content, "rationale": rationale}
    
    try:
        mood_context = f"Energy level: {energy}/4, Emotion: {emotion}"
        if note:
            mood_context += f", Note: {note}"
        
        # Adjust tone based on energy and emotion
        if energy <= 1 or emotion.lower() in ["tired", "anxious", "low"]:
            size_guidance = "extremely tiny and gentle"
        elif energy == 2:
            size_guidance = "small and manageable"
        elif energy == 3:
            size_guidance = "achievable and moderately sized"
        elif energy == 4:
            size_guidance = "substantial but still manageable"
        else:  # energy >= 5
            size_guidance = "ambitious and energizing"
        
        system_prompt = f"""You are a gentle, empathetic productivity companion. Your role is to suggest {size_guidance} steps that honor the user's current emotional state. Never judge or shame. Always respond with understanding and compassion.

Return ONLY a JSON object with exactly two fields:
- "content": A single, tiny action the user can take right now (max 80 characters)
- "rationale": A brief, kind explanation of why this step is helpful (max 120 characters)

Keep suggestions:
- Emotionally appropriate for their current state
- Shame-free and encouraging
- Focused on self-care when energy is low"""

        user_prompt = f"Based on this mood check-in, suggest one tiny step: {mood_context}"
        
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_completion_tokens=200
        )
        
        key_type = settings.openai_key_type()
        logger.info("AI:openai used model=%s key_type=%s", settings.openai_model, key_type)
        
        result = _safe_json_parse(response.choices[0].message.content)
        if result and isinstance(result, dict) and "content" in result and "rationale" in result:
            return {
                "content": result["content"][:80],
                "rationale": result["rationale"][:120]
            }
        
        # Retry with stricter prompt
        retry_response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt + "\n\nReturn ONLY valid JSON, no other text."},
                {"role": "user", "content": user_prompt}
            ],
            max_completion_tokens=200
        )
        
        retry_result = _safe_json_parse(retry_response.choices[0].message.content)
        if retry_result and isinstance(retry_result, dict) and "content" in retry_result and "rationale" in retry_result:
            return {
                "content": retry_result["content"][:80],
                "rationale": retry_result["rationale"][:120]
            }
        
    except Exception as e:
        logger.warning("AI:mock fallback reason=api_error error=%s", str(e))
    
    # Fallback on any error
    content = "Take a moment to notice one thing you appreciate about yourself"
    rationale = "Self-appreciation helps shift perspective gently"
    return {"content": content, "rationale": rationale}


async def breakdown_task(title: str, energy: int = None, emotion: str = None, granularity: str = "normal") -> List[Dict[str, str]]:
    """Break down a task into smaller, manageable steps."""
    client = _get_openai_client()
    
    if not client:
        # Deterministic fallback
        return [
            {"content": f"Start by gathering what you need for: {title[:40]}"},
            {"content": "Take the first small action"},
            {"content": "Continue with the next piece"},
            {"content": "Complete the final touches"}
        ]
    
    try:
        # Build mood context if provided
        mood_context = ""
        step_size = "small, achievable"
        
        if energy is not None and emotion:
            mood_context = f"\n\nUser's current state: Energy level {energy}/5, feeling {emotion}."
            
            if energy <= 1 or emotion.lower() in ["tired", "anxious", "low"]:
                step_size = "very small and gentle"
                mood_context += " Please make steps extremely small due to low energy/difficult emotions."
            elif energy == 2:
                step_size = "small and manageable"
                mood_context += " Please tailor steps to be manageable for moderate energy."
            elif energy == 3:
                step_size = "achievable and moderately sized"
                mood_context += " User has decent energy, steps can be moderate."
            elif energy == 4:
                step_size = "substantial but still manageable"
                mood_context += " User has good energy, steps can be more substantial."
            else:  # energy >= 5
                step_size = "ambitious and energizing"
                mood_context += " User has high energy, steps can be ambitious and challenging."

        system_prompt = f"""You are a gentle productivity companion. Break down tasks into {step_size} steps that reduce overwhelm. Be encouraging and practical.{mood_context}

Return ONLY a JSON array of 4-12 step objects, each with a "content" field containing a clear, actionable step (max 150 characters each).

Make steps:
- Sequential and logical, covering the complete task from start to finish
- Emotionally appropriate for the user's current state
- Clear, specific, and actionable
- Encouraging in tone
- Comprehensive enough to complete the entire task
- Include preparation, execution, and completion phases where appropriate"""

        user_prompt = f"Break down this task into steps: {title}"
        
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_completion_tokens=800
        )
        
        key_type = settings.openai_key_type()
        logger.info("AI:openai used model=%s key_type=%s", settings.openai_model, key_type)
        
        result = _safe_json_parse(response.choices[0].message.content)
        if result and isinstance(result, list):
            steps = []
            for item in result[:12]:  # Limit to 12 steps
                if isinstance(item, dict) and "content" in item:
                    steps.append({"content": item["content"][:150]})
            if steps:
                return steps
        
        # Retry with stricter prompt
        retry_response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt + "\n\nReturn ONLY valid JSON array, no other text."},
                {"role": "user", "content": user_prompt}
            ],
            max_completion_tokens=800
        )
        
        retry_result = _safe_json_parse(retry_response.choices[0].message.content)
        if retry_result and isinstance(retry_result, list):
            steps = []
            for item in retry_result[:12]:
                if isinstance(item, dict) and "content" in item:
                    steps.append({"content": item["content"][:150]})
            if steps:
                return steps
        
    except Exception as e:
        logger.warning("AI:mock fallback reason=api_error error=%s", str(e))
    
    # Fallback on any error
    return [
        {"content": f"Plan your approach for: {title[:50]}"},
        {"content": "Gather all necessary materials and resources"},
        {"content": "Set up your workspace and environment"},
        {"content": "Start with the first manageable piece"},
        {"content": "Work through each section systematically"},
        {"content": "Review progress and adjust if needed"},
        {"content": "Complete the final steps"},
        {"content": "Review and celebrate your completion"}
    ]


async def rebalance_too_big(step_content: str) -> List[Dict[str, str]]:
    """Break down a step that feels too big into smaller sub-steps."""
    client = _get_openai_client()
    
    if not client:
        # Deterministic fallback
        return [
            {"content": f"Begin with the easiest part of: {step_content[:30]}"},
            {"content": "Take the next small piece"},
            {"content": "Finish the remaining part"}
        ]
    
    try:
        system_prompt = """You are a compassionate productivity guide. When someone feels a step is too big, help them break it into smaller, less overwhelming pieces.

Return ONLY a JSON array of 2-4 smaller step objects, each with a "content" field (max 100 characters each).

Make the new steps:
- Much smaller than the original
- Easy to start with
- Maintaining the same end goal
- Encouraging and gentle"""

        user_prompt = f"This step feels too big, help me break it down: {step_content}"
        
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_completion_tokens=300
        )
        
        key_type = settings.openai_key_type()
        logger.info("AI:openai used model=%s key_type=%s", settings.openai_model, key_type)
        
        result = _safe_json_parse(response.choices[0].message.content)
        if result and isinstance(result, list):
            steps = []
            for item in result[:4]:  # Limit to 4 steps
                if isinstance(item, dict) and "content" in item:
                    steps.append({"content": item["content"][:100]})
            if steps:
                return steps
        
        # Retry with stricter prompt
        retry_response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt + "\n\nReturn ONLY valid JSON array, no other text."},
                {"role": "user", "content": user_prompt}
            ],
            max_completion_tokens=300
        )
        
        retry_result = _safe_json_parse(retry_response.choices[0].message.content)
        if retry_result and isinstance(retry_result, list):
            steps = []
            for item in retry_result[:4]:
                if isinstance(item, dict) and "content" in item:
                    steps.append({"content": item["content"][:100]})
            if steps:
                return steps
        
    except Exception as e:
        logger.warning("AI:mock fallback reason=api_error error=%s", str(e))
    
    # Fallback on any error
    return [
        {"content": f"Start with just 5 minutes on: {step_content[:40]}"},
        {"content": "Continue for another small bit"},
        {"content": "Complete the final piece"}
    ]


async def generate_celebration_message(task_title: str, completion_count: int = 1) -> Dict[str, str]:
    """Generate a personalized celebration message for completing a task or step."""
    client = _get_openai_client()
    
    if not client:
        # Deterministic fallback celebrations
        fallback_messages = [
            {"message": f"You did it! Completing '{task_title[:30]}' is a real accomplishment.", "emoji": "🎉"},
            {"message": f"Amazing work on '{task_title[:30]}'! Every step forward matters.", "emoji": "✨"},
            {"message": f"Celebrate this win! You tackled '{task_title[:30]}' like a champion.", "emoji": "🌟"},
            {"message": f"Way to go! '{task_title[:30]}' is done and you should be proud.", "emoji": "💪"},
        ]
        return fallback_messages[completion_count % len(fallback_messages)]
    
    try:
        system_prompt = """You are a warm, encouraging celebration companion. Create uplifting messages that make people feel genuinely proud of their progress.

Return ONLY a JSON object with exactly two fields:
- "message": A personalized, encouraging celebration message (max 100 characters)
- "emoji": A single celebratory emoji that matches the tone

Make messages:
- Warm and genuinely celebratory
- Specific to their accomplishment
- Encouraging for future progress
- Authentic, not over-the-top"""

        user_prompt = f"Create a celebration message for someone who just completed: {task_title}"
        
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_completion_tokens=150
        )
        
        key_type = settings.openai_key_type()
        logger.info("AI:openai used model=%s key_type=%s", settings.openai_model, key_type)
        
        result = _safe_json_parse(response.choices[0].message.content)
        if result and isinstance(result, dict) and "message" in result and "emoji" in result:
            return {
                "message": result["message"][:100],
                "emoji": result["emoji"]
            }
        
    except Exception as e:
        logger.warning("AI:mock fallback reason=api_error error=%s", str(e))
    
    # Final fallback
    return {
        "message": f"Fantastic work completing '{task_title[:40]}'! You should be proud.",
        "emoji": "🎉"
    }


# Example curl for testing breakdown endpoint:
# curl -X POST "http://localhost:8000/v1/tasks/{task_id}/breakdown?energy=2&emotion=focused" \
#   -H "Authorization: Bearer <your-jwt-token>" \
#   -H "Content-Type: application/json"