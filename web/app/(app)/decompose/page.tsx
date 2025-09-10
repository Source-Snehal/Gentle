'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { BubbleSelector } from '@/components/ui/bubble-selector'
import { Heart, ArrowRight, BarChart3, CheckCircle, RotateCcw } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useApi } from '@/hooks/useApi'
import { useCompleteStep } from '@/hooks/useCompleteStep'
import { useTooBigStep } from '@/hooks/useTooBigStep'

type Step = 'mood' | 'task' | 'breakdown'

const emotionOptions = [
  { value: 'calm', label: 'Calm', emoji: '😌', color: 'gentle' as const },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'ocean' as const },
  { value: 'tired', label: 'Tired', emoji: '😴', color: 'blue' as const },
  { value: 'energized', label: 'Energized', emoji: '⚡', color: 'green' as const },
  { value: 'low', label: 'Low', emoji: '🌧️', color: 'ocean' as const },
  { value: 'mixed', label: 'Mixed', emoji: '🌈', color: 'gentle' as const },
]

const energyOptions = [
  { value: 0, label: 'Drained', emoji: '🪫', color: 'blue' as const },
  { value: 1, label: 'Low', emoji: '🔋', color: 'ocean' as const },
  { value: 2, label: 'Okay', emoji: '🔋', color: 'gentle' as const },
  { value: 3, label: 'Good', emoji: '🔋', color: 'green' as const },
  { value: 4, label: 'High', emoji: '⚡', color: 'green' as const },
  { value: 5, label: 'Buzzing', emoji: '🌟', color: 'green' as const },
]

type TaskStep = {
  id: string
  content: string
  order: number
  state: 'pending' | 'done'
  created_at: string
}

export default function DecomposePage() {
  const router = useRouter()
  const api = useApi()
  const completeStep = useCompleteStep()
  const tooBigStep = useTooBigStep()
  
  const [currentStep, setCurrentStep] = useState<Step>('mood')
  const [energy, setEnergy] = useState(2)
  const [emotion, setEmotion] = useState<string>('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskId, setTaskId] = useState<string | null>(null)
  const [steps, setSteps] = useState<TaskStep[]>([])
  const [subStepsMap, setSubStepsMap] = useState<Record<string, any[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      return await api.post('/v1/tasks', { title })
    },
  })

  const breakdownTaskMutation = useMutation({
    mutationFn: async ({ taskId, energy, emotion }: { taskId: string, energy: number, emotion: string }) => {
      return await api.post(`/v1/tasks/${taskId}/breakdown?energy=${energy}&emotion=${emotion}`)
    },
  })

  const handleMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emotion) {
      setErrors({ emotion: 'Please select how you\'re feeling' })
      return
    }
    setErrors({})
    setCurrentStep('task')
  }

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) {
      setErrors({ task: 'Please enter what feels big today' })
      return
    }

    try {
      setErrors({})
      
      // Create task
      const task = await createTaskMutation.mutateAsync(taskTitle.trim())
      setTaskId(task.id)
      
      // Break it down with mood context
      const steps = await breakdownTaskMutation.mutateAsync({
        taskId: task.id,
        energy,
        emotion
      })
      
      setSteps(steps)
      setCurrentStep('breakdown')
    } catch (error: any) {
      setErrors({ task: error.message || 'Something went wrong. Let\'s try again.' })
    }
  }

  const handleCompleteStep = (stepId: string) => {
    completeStep.mutate({ stepId, taskId: taskId || undefined }, {
      onSuccess: () => {
        // Update local state to mark as done
        setSteps(prev => prev.map(step => 
          step.id === stepId ? { ...step, state: 'done' as const } : step
        ))
      }
    })
  }

  const handleTooBigStep = (stepId: string) => {
    tooBigStep.mutate(stepId, {
      onSuccess: (newSteps) => {
        setSubStepsMap(prev => ({
          ...prev,
          [stepId]: newSteps
        }))
      }
    })
  }

  const isLoading = createTaskMutation.isPending || breakdownTaskMutation.isPending || completeStep.isPending || tooBigStep.isPending

  const motionProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  // Step 1: Mood Check-in
  if (currentStep === 'mood') {
    return (
      <motion.div {...motionProps} className="space-y-8">
        <div className="text-center space-y-4">
          <Heart className="w-12 h-12 text-gentle-400 mx-auto" />
          <h1 className="text-2xl font-medium">How are you feeling right now?</h1>
          <p className="text-gentle-600 text-sm text-balance max-w-sm mx-auto">
            Your energy and mood help us break things down in a way that works for you.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl mx-auto w-full"
        >
          <Card className="relative p-8 glass-strong rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl shadow-gentle-500/10 overflow-hidden group">
          <form onSubmit={handleMoodSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gentle-700 dark:text-gentle-300">
                  How's your energy level?
                </span>
                <div className="mt-4 w-full">
                  <BubbleSelector
                    options={energyOptions}
                    value={energy}
                    onChange={(value) => setEnergy(value as number)}
                    size="md"
                    className="w-full"
                  />
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gentle-700 dark:text-gentle-300">
                  How would you describe your mood?
                </span>
                <div className="mt-4 w-full">
                  <BubbleSelector
                    options={emotionOptions}
                    value={emotion}
                    onChange={(value) => setEmotion(value as string)}
                    size="md"
                    className="w-full"
                  />
                </div>
              </label>
              {errors.emotion && (
                <p className="text-sm text-red-600">{errors.emotion}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={!emotion}
              className="w-full h-14 text-lg font-medium rounded-2xl bg-gradient-to-r from-gentle-500 to-ocean-500 hover:from-gentle-600 hover:to-ocean-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  // Step 2: Task Input
  if (currentStep === 'task') {
    return (
      <motion.div {...motionProps} className="space-y-8">
        <div className="text-center space-y-8 relative">
          {/* Floating background elements */}
          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-gradient-to-r from-gentle-300/20 to-ocean-300/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -top-16 -right-8 w-24 h-24 bg-gradient-to-r from-green-300/15 to-gentle-300/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
            className="relative group mb-8"
          >
            {/* Animated glow ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-gentle-400 via-ocean-400 to-green-400 rounded-full animate-pulse-glow opacity-40 group-hover:opacity-80 transition-opacity duration-700 scale-150"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-gentle-400 to-ocean-400 rounded-full animate-pulse-glow opacity-30 group-hover:opacity-60 transition-opacity duration-500 scale-125" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Main icon container */}
            <div className="relative w-20 h-20 glass-strong rounded-full flex items-center justify-center mx-auto border border-white/40 group-hover:scale-110 transition-transform duration-500">
              <motion.div
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: 'linear'
                }}
              >
                <BarChart3 className="w-10 h-10 text-gentle-600 dark:text-gentle-400 group-hover:text-gentle-700 dark:group-hover:text-gentle-300 transition-colors duration-300" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            className="space-y-4"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-extralight bg-gradient-to-r from-gentle-600 via-ocean-500 via-green-500 to-gentle-600 bg-300% bg-clip-text text-transparent leading-tight tracking-tight"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                backgroundImage: 'linear-gradient(90deg, hsl(var(--gentle-600)), hsl(var(--ocean-500)), hsl(var(--green-500)), hsl(var(--gentle-600)))',
                backgroundSize: '300% 100%'
              }}
            >
              What feels big today?
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <motion.p 
                className="text-xl md:text-2xl text-gentle-700/90 dark:text-gentle-300/90 font-light leading-relaxed glass rounded-2xl px-8 py-4 border border-white/30 backdrop-blur-xl shadow-lg"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                Share what's on your mind, and we'll transform it into manageable, gentle steps that honor your energy.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl mx-auto w-full"
        >
          <Card className="relative p-8 glass-strong rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl shadow-gentle-500/10 overflow-hidden group">
          <form onSubmit={handleTaskSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gentle-700 dark:text-gentle-300">
                  What would you like to break down?
                </span>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileFocus={{ scale: 1.02 }}
                  className="relative mt-6"
                >
                  {/* Animated border glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gentle-400/30 via-ocean-400/30 to-green-400/30 rounded-3xl blur-sm opacity-0 transition-opacity duration-500 group-focus-within:opacity-100"></div>
                  
                  {/* Input container */}
                  <div className="relative glass-strong rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl shadow-gentle-500/10 overflow-hidden group">
                    {/* Floating sparkles */}
                    <div className="absolute top-4 right-6 w-1 h-1 bg-gentle-400 rounded-full animate-ping opacity-50"></div>
                    <div className="absolute bottom-4 left-6 w-0.5 h-0.5 bg-ocean-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full group-focus-within:translate-x-full transition-transform duration-1000"></div>
                    
                    <Input
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g., Clean my room, Write a report, Plan vacation, Learn a new skill..."
                      className="relative z-10 h-16 text-lg px-8 py-4 bg-transparent border-none focus:ring-0 focus:outline-none placeholder:text-gentle-500/70 dark:placeholder:text-gentle-400/70 text-gentle-800 dark:text-gentle-200 font-medium"
                      maxLength={200}
                    />
                    
                    {/* Character counter */}
                    <div className="absolute bottom-3 right-6 text-xs text-gentle-500/70 dark:text-gentle-400/70">
                      {taskTitle.length}/200
                    </div>
                  </div>
                  
                  {/* Floating label effect */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: taskTitle ? 1 : 0, 
                      y: taskTitle ? 0 : 10 
                    }}
                    className="absolute -top-3 left-6 px-3 glass rounded-full border border-white/30"
                  >
                    <span className="text-sm font-medium text-gentle-600 dark:text-gentle-400">
                      Your task
                    </span>
                  </motion.div>
                </motion.div>
              </label>
              {errors.task && (
                <p className="text-sm text-red-600">{errors.task}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setCurrentStep('mood')}
                variant="outline"
                className="flex-1 h-12 rounded-xl border-gentle-200 dark:border-gentle-700"
                disabled={isLoading}
              >
                Back
              </Button>
              
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 relative"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-gentle-500 via-ocean-500 to-green-500 rounded-3xl blur-lg opacity-50 animate-pulse-glow"></div>
                
                <Button
                  type="submit"
                  disabled={!taskTitle.trim() || isLoading}
                  className="relative w-full h-16 text-xl font-bold rounded-3xl bg-gradient-to-r from-gentle-500 via-ocean-500 to-green-500 hover:from-gentle-600 hover:via-ocean-600 hover:to-green-600 text-white shadow-2xl hover:shadow-3xl border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group overflow-hidden"
                >
                  {/* Animated background shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  {/* Button content */}
                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                        />
                        <span>Creating your gentle path...</span>
                      </>
                    ) : (
                      <>
                        <span>Break it down</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
                        </motion.div>
                      </>
                    )}
                  </div>
                  
                  {/* Success ripple effect */}
                  {!isLoading && taskTitle.trim() && (
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-3xl"
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    />
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  // Step 3: Breakdown Results
  return (
    <motion.div {...motionProps} className="space-y-8">
      <div className="text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
        <h1 className="text-2xl font-medium">Perfect! Here are your tiny steps</h1>
        <p className="text-gentle-600 text-sm text-balance max-w-md mx-auto">
          Here's your complete task breakdown. Take it one step at a time - you've got this!
        </p>
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {steps.map((step, index) => {
          const subSteps = subStepsMap[step.id] || []
          
          return (
            <motion.div
              key={step.id}
              {...(prefersReducedMotion ? {} : { 
                initial: { opacity: 0, y: 10 }, 
                animate: { opacity: 1, y: 0 },
                transition: { delay: index * 0.1 }
              })}
            >
              <Card className={`p-6 bg-gradient-to-br from-white/80 to-gentle-50/80 dark:from-gentle-800/50 dark:to-gentle-700/50 backdrop-blur border-gentle-200 dark:border-gentle-600 shadow-lg ${
                step.state === 'done' ? 'opacity-75' : ''
              }`}>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      step.state === 'done' 
                        ? 'bg-green-500' 
                        : 'bg-gentle-300 dark:bg-gentle-600'
                    }`} />
                    <p className={`font-medium text-balance flex-1 ${
                      step.state === 'done' 
                        ? 'line-through text-gentle-600 dark:text-gentle-400' 
                        : 'text-gentle-900 dark:text-gentle-100'
                    }`}>
                      {step.content}
                    </p>
                  </div>

                  {step.state === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCompleteStep(step.id)}
                        disabled={isLoading}
                        className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-gentle-500 to-ocean-500 hover:from-gentle-600 hover:to-ocean-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Did it!
                      </Button>
                      
                      <Button
                        onClick={() => handleTooBigStep(step.id)}
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1 h-12 rounded-xl border-gentle-200 dark:border-gentle-700"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Still too big
                      </Button>
                    </div>
                  )}

                  {subSteps.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gentle-200 dark:border-gentle-700">
                      <p className="text-sm font-medium text-gentle-700 dark:text-gentle-300">
                        Choose a smaller step:
                      </p>
                      <div className="space-y-2">
                        {subSteps.map((subStep) => (
                          <Button
                            key={subStep.id}
                            onClick={() => handleCompleteStep(subStep.id)}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full p-4 h-auto text-left justify-start rounded-xl"
                          >
                            <div className="space-y-1">
                              <p className="font-medium text-balance">{subStep.content}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {taskId && (
        <div className="text-center">
          <Button
            onClick={() => router.push(`/tasks/${taskId}`)}
            variant="outline"
            className="rounded-xl"
          >
            View full task details
          </Button>
        </div>
      )}

      <div className="text-center text-xs text-gentle-500 space-y-1">
        <p>Tiny steps are real progress</p>
        <p>You're doing great—keep going at your own pace</p>
      </div>
    </motion.div>
  )
}