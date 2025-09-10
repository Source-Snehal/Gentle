'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sparkles, Heart, ArrowRight, X, Trophy, Star, Zap, Crown, Gift } from 'lucide-react'
import { useAuthSession } from '@/hooks/useAuthSession'
import { useTask } from '@/hooks/useTasks'
import { subscribeToCelebrations } from '@/lib/realtime'

// Dynamic celebration data
const celebrations = [
  {
    emoji: '🎉',
    icon: Trophy,
    title: 'Amazing work!',
    subtitle: 'You crushed it!',
    quote: 'Every accomplishment starts with the decision to try.',
    color: 'from-yellow-400 to-orange-500',
    confetti: ['🎊', '🌟', '✨']
  },
  {
    emoji: '🌟',
    icon: Star,
    title: 'You\'re a star!',
    subtitle: 'Shining bright today!',
    quote: 'Progress is impossible without change, and you\'re proof of that.',
    color: 'from-purple-400 to-pink-500',
    confetti: ['⭐', '💫', '✨']
  },
  {
    emoji: '⚡',
    icon: Zap,
    title: 'Incredible!',
    subtitle: 'You\'re unstoppable!',
    quote: 'Small steps in the right direction can turn out to be the biggest step of your life.',
    color: 'from-blue-400 to-cyan-500',
    confetti: ['⚡', '🌈', '💎']
  },
  {
    emoji: '👑',
    icon: Crown,
    title: 'You\'re royalty!',
    subtitle: 'Absolutely magnificent!',
    quote: 'The secret of getting ahead is getting started. You did it!',
    color: 'from-indigo-400 to-purple-600',
    confetti: ['👑', '💜', '🔮']
  },
  {
    emoji: '🎁',
    icon: Gift,
    title: 'What a gift!',
    subtitle: 'You gave yourself progress!',
    quote: 'Self-care is giving yourself permission to pause and celebrate your wins.',
    color: 'from-green-400 to-teal-500',
    confetti: ['🎁', '🍀', '🌿']
  },
  {
    emoji: '💪',
    icon: Heart,
    title: 'So proud of you!',
    subtitle: 'Your strength is showing!',
    quote: 'You are braver than you believe, stronger than you seem, and more capable than you imagine.',
    color: 'from-red-400 to-pink-500',
    confetti: ['💪', '❤️', '🌹']
  }
]

const getRandomCelebration = () => {
  return celebrations[Math.floor(Math.random() * celebrations.length)]
}

function CelebratePageContent() {
  const { user } = useAuthSession()
  const searchParams = useSearchParams()
  const taskId = searchParams.get('taskId')
  const { data: task, isLoading: isTaskLoading } = useTask(taskId || '')
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')
  const [currentCelebration] = useState(() => getRandomCelebration())
  
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = subscribeToCelebrations(user.id, (payload) => {
      // Show transient banner when celebration event arrives
      setCelebrationMessage(payload.payload?.message || 'Another step completed!')
      setShowCelebrationBanner(true)
      
      // Auto-hide banner after 5 seconds
      setTimeout(() => {
        setShowCelebrationBanner(false)
      }, 5000)
    })

    return unsubscribe
  }, [user?.id])

  const motionProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
  }

  const sparkleMotionProps = prefersReducedMotion ? {} : {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { delay: 0.2, type: 'spring', stiffness: 200 }
  }

  const confettiMotionProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 0 },
    animate: { opacity: [0, 1, 0], y: [-20, -40, -60] },
    transition: { duration: 2 }
  }

  // Determine next step URL based on whether task is completed
  const taskCompleted = searchParams.get('taskCompleted') === 'true'
  const nextStepUrl = taskCompleted ? '/tasks' : (taskId ? `/tasks/${taskId}` : '/tasks')
  
  // Debug logging
  console.log('Celebrate page - taskId:', taskId, 'taskCompleted:', taskCompleted, 'nextStepUrl:', nextStepUrl)
  

  return (
    <>
      {/* Celebration Banner */}
      {showCelebrationBanner && (
        <motion.div
          {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: -50 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -50 } })}
          className="fixed top-4 left-4 right-4 z-50 bg-gradient-to-r from-gentle-500 to-gentle-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">{celebrationMessage}</span>
          </div>
          <button
            onClick={() => setShowCelebrationBanner(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss celebration"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          {...(prefersReducedMotion ? {} : {
            animate: { 
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            },
            transition: { duration: 20, repeat: Infinity, ease: 'linear' }
          })}
          className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-gentle-200/20 to-ocean-200/20 rounded-full blur-xl"
        />
        <motion.div
          {...(prefersReducedMotion ? {} : {
            animate: { 
              rotate: [360, 0],
              scale: [1, 1.2, 1],
            },
            transition: { duration: 25, repeat: Infinity, ease: 'linear' }
          })}
          className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-green-200/20 to-gentle-200/20 rounded-full blur-xl"
        />
      </div>

      <motion.div {...motionProps} className="relative space-y-8 text-center">
        <div className="space-y-6">
          <motion.div {...sparkleMotionProps} className="relative">
            <div className={`w-24 h-24 bg-gradient-to-br ${currentCelebration.color} rounded-full flex items-center justify-center mx-auto shadow-xl`}>
              <currentCelebration.icon className="w-12 h-12 text-white" />
            </div>
            
            {/* Dynamic confetti */}
            <div className="absolute inset-0 pointer-events-none">
              {currentCelebration.confetti.map((emoji, index) => (
                <motion.div
                  key={index}
                  {...confettiMotionProps}
                  transition={{ 
                    ...confettiMotionProps.transition, 
                    delay: 0.5 + (index * 0.2),
                    duration: 2 + (index * 0.3)
                  }}
                  className={`absolute text-2xl ${
                    index === 0 ? 'top-0 left-1/2 transform -translate-x-1/2' :
                    index === 1 ? 'top-2 left-1/4 transform -translate-x-1/2' :
                    'top-2 right-1/4 transform translate-x-1/2'
                  }`}
                >
                  <span>{emoji}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 } })}
            className="space-y-4"
          >
            <h1 className="text-4xl font-medium text-balance">
              {currentCelebration.title} {currentCelebration.emoji}
            </h1>
            
            <p className="text-xl text-gentle-600 font-light italic text-balance max-w-md mx-auto">
              {currentCelebration.subtitle}
            </p>
            
            <motion.p 
              {...(prefersReducedMotion ? {} : { 
                initial: { opacity: 0, y: 10 }, 
                animate: { opacity: 1, y: 0 }, 
                transition: { delay: 0.6 } 
              })}
              className="text-gentle-700 dark:text-gentle-300 text-lg text-balance max-w-lg mx-auto font-medium leading-relaxed"
            >
              "{currentCelebration.quote}"
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.6 } })}
        >
          <Card className={`p-6 space-y-4 bg-gradient-to-br from-white/80 to-gentle-50/80 dark:from-gentle-800/50 dark:to-gentle-700/50 backdrop-blur border-gentle-200 dark:border-gentle-600 shadow-lg ring-1 ring-gradient-to-r ${currentCelebration.color} ring-opacity-20`}>
            <div className="flex items-center gap-3 justify-center text-gentle-700 dark:text-gentle-300">
              <motion.div
                {...(prefersReducedMotion ? {} : {
                  animate: { rotate: [0, 10, -10, 0] },
                  transition: { duration: 1, repeat: Infinity, repeatDelay: 3 }
                })}
              >
                <Heart className="w-5 h-5 text-red-500" />
              </motion.div>
              <span className="font-medium">This moment matters</span>
            </div>
            
            <div className="space-y-3 text-sm text-gentle-600 dark:text-gentle-400">
              <p className="text-balance">
                You showed up today and took action. In a world that often feels overwhelming, 
                choosing to move forward - even with tiny steps - is an act of courage.
              </p>
              
              <p className="text-balance">
                Your future self is thanking you for this moment of progress. Keep going!
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-gentle-500 text-xs">
              <motion.div
                {...(prefersReducedMotion ? {} : {
                  animate: { scale: [1, 1.2, 1] },
                  transition: { duration: 2, repeat: Infinity }
                })}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <span>You're creating positive change in your life</span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          {...(prefersReducedMotion ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.8 } })}
          className="space-y-4"
        >
          <Link href={nextStepUrl}>
            <Button 
              disabled={isTaskLoading && !!taskId}
              className={`w-full h-14 text-lg font-medium rounded-2xl bg-gradient-to-r ${currentCelebration.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 group disabled:opacity-50 hover:scale-105`}
            >
              {taskCompleted ? 'View all tasks' : 'Continue with next step'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </Link>
          
          <p className="text-sm text-gentle-500">
            Ready when you are—no pressure
          </p>
        </motion.div>

        <motion.div
          {...(prefersReducedMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 1 } })}
          className="text-xs text-gentle-400 space-y-1"
        >
          <motion.p
            {...(prefersReducedMotion ? {} : {
              animate: { opacity: [0.7, 1, 0.7] },
              transition: { duration: 3, repeat: Infinity }
            })}
          >
            Take a moment to appreciate what you just accomplished
          </motion.p>
          <p>Every small action is a form of self-care</p>
        </motion.div>
      </motion.div>
    </>
  )
}

export default function CelebratePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">Loading...</div>}>
      <CelebratePageContent />
    </Suspense>
  )
}

// Testing notes:
// - After authenticating, open /celebrate in one tab and complete a step from /decompose in another to simulate an event
// - If your backend doesn't yet broadcast celebrations, log the event payload in subscribeToCelebrations to verify the channel connection