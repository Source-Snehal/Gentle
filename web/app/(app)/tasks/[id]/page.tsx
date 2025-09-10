'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, RotateCcw, Calendar, Clock } from 'lucide-react'
import { useTask } from '@/hooks/useTasks'
import { useCompleteStep } from '@/hooks/useCompleteStep'
import { useTooBigStep } from '@/hooks/useTooBigStep'
import { StateBadge } from '@/components/task/StateBadge'
import { ProgressBar } from '@/components/task/ProgressBar'
import Link from 'next/link'

type SubStep = {
  id: string
  content: string
  rationale?: string
}

export default function TaskDetailPage() {
  const params = useParams()
  const taskId = params.id as string
  const { data: task, isLoading, error } = useTask(taskId)
  const completeStep = useCompleteStep()
  const tooBigStep = useTooBigStep()
  const [subStepsMap, setSubStepsMap] = useState<Record<string, SubStep[]>>({})
  const [completedStepId, setCompletedStepId] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const handleCompleteStep = (stepId: string) => {
    setCompletedStepId(stepId)
    setShowCelebration(true)
    completeStep.mutate({ stepId, taskId })
  }

  // Hide celebration after step completion
  useEffect(() => {
    if (completeStep.isSuccess && showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false)
        setCompletedStepId(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [completeStep.isSuccess, showCelebration])

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

  const motionProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }

  if (error) {
    return (
      <motion.div {...motionProps} className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-medium">Task not found</h1>
          <p className="text-gentle-600 text-balance">
            This task may have been deleted or you may not have permission to view it.
          </p>
        </div>
        <Link href="/tasks">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to tasks
          </Button>
        </Link>
      </motion.div>
    )
  }

  if (isLoading || !task) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading task details">
        <div className="space-y-4">
          <div className="h-8 bg-gentle-200 dark:bg-gentle-700 rounded animate-pulse w-3/4" />
          <div className="flex gap-4">
            <div className="h-6 bg-gentle-200 dark:bg-gentle-700 rounded animate-pulse w-20" />
            <div className="h-6 bg-gentle-200 dark:bg-gentle-700 rounded animate-pulse w-24" />
          </div>
          <div className="h-2 bg-gentle-200 dark:bg-gentle-700 rounded animate-pulse w-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 bg-white/50 dark:bg-gentle-800/50 backdrop-blur border-gentle-200 dark:border-gentle-700">
              <div className="space-y-4">
                <div className="h-4 bg-gentle-200 dark:bg-gentle-700 rounded animate-pulse w-full" />
                <div className="flex gap-2">
                  <div className="h-10 bg-gentle-200 dark:bg-gentle-700 rounded animate-pulse flex-1" />
                  <div className="h-10 bg-gentle-200 dark:bg-gentle-700 rounded animate-pulse flex-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const doneSteps = task.steps.filter(step => step.state === 'done').length
  const totalSteps = task.steps.length
  const progress = totalSteps > 0 ? (doneSteps / totalSteps) * 100 : 0

  return (
    <>
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gentle-800 rounded-3xl p-8 shadow-2xl text-center space-y-4"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-6xl"
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-medium">Step completed!</h2>
              <p className="text-gentle-600">Moving to next step...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div {...motionProps} className="space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <Link href="/tasks">
          <Button 
            variant="ghost" 
            className="mb-4 text-gentle-600 hover:text-gentle-700 hover:bg-gentle-50 dark:hover:bg-gentle-800 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to tasks
          </Button>
        </Link>

        <div className="space-y-4">
          <h1 className="text-2xl font-medium text-balance">
            {task.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm">
            <StateBadge state={task.state} />
            <div className="flex items-center gap-1 text-gentle-500">
              <Calendar className="w-4 h-4" />
              <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
            </div>
            {task.updated_at !== task.created_at && (
              <div className="flex items-center gap-1 text-gentle-500">
                <Clock className="w-4 h-4" />
                <span>Updated {new Date(task.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <ProgressBar value={progress} showPercentage className="mt-4" />
        </div>
      </div>

      {/* Steps */}
      {task.steps.length === 0 ? (
        <Card className="p-8 text-center bg-white/50 dark:bg-gentle-800/50 backdrop-blur border-gentle-200 dark:border-gentle-700">
          <div className="space-y-4">
            <p className="text-gentle-600">This task hasn't been broken down into steps yet.</p>
            <Button className="rounded-xl">Break it down</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Steps</h2>
          
          <div className="space-y-4">
            {task.steps.map((step, index) => {
              const subSteps = subStepsMap[step.id] || []
              const isCompleting = completeStep.isPending
              const isBreakingDown = tooBigStep.isPending
              const isLoading = isCompleting || isBreakingDown
              
              // Find the next pending step to highlight
              const nextPendingStep = task.steps.find(s => s.state === 'pending')
              const isNextStep = step.id === nextPendingStep?.id

              return (
                <motion.div
                  key={step.id}
                  {...(prefersReducedMotion ? {} : { 
                    initial: { opacity: 0, y: 10 }, 
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: index * 0.1 }
                  })}
                >
                  <Card className={`p-6 bg-white/50 dark:bg-gentle-800/50 backdrop-blur border-gentle-200 dark:border-gentle-700 ${
                    step.state === 'done' ? 'opacity-75' : ''
                  } ${
                    isNextStep ? 'ring-2 ring-gentle-400 border-gentle-400 bg-gentle-50/80 dark:bg-gentle-700/80' : ''
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          step.state === 'done' 
                            ? 'bg-green-500' 
                            : 'bg-gentle-300 dark:bg-gentle-600'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-balance ${
                            step.state === 'done' 
                              ? 'line-through text-gentle-600 dark:text-gentle-400' 
                              : 'text-gentle-900 dark:text-gentle-100'
                          }`}>
                            {step.content}
                          </p>
                        </div>
                      </div>

                      {step.state === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleCompleteStep(step.id)}
                            disabled={isLoading}
                            aria-busy={completeStep.isPending}
                            className="flex-1 h-12 rounded-2xl bg-gentle-600 hover:bg-gentle-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Do this now
                          </Button>
                          
                          <Button
                            onClick={() => handleTooBigStep(step.id)}
                            disabled={isLoading}
                            aria-busy={tooBigStep.isPending}
                            variant="outline"
                            className="flex-1 h-12 rounded-xl border-gentle-200 dark:border-gentle-700 hover:bg-gentle-50 dark:hover:bg-gentle-800"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Still too big
                          </Button>
                        </div>
                      )}

                      {/* Sub-steps if step was broken down */}
                      {subSteps.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-gentle-200 dark:border-gentle-700">
                          <p className="text-sm font-medium text-gentle-700 dark:text-gentle-300">
                            Choose a smaller step:
                          </p>
                          <div className="space-y-2">
                            {subSteps.map((subStep) => (
                              <Button
                                key={subStep.id}
                                onClick={() => completeStep.mutate({ stepId: subStep.id, taskId })}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full p-4 h-auto text-left justify-start rounded-xl border-gentle-200 dark:border-gentle-700 hover:bg-gentle-50 dark:hover:bg-gentle-800"
                              >
                                <div className="space-y-1">
                                  <p className="font-medium text-balance">{subStep.content}</p>
                                  {subStep.rationale && (
                                    <p className="text-sm text-gentle-600 dark:text-gentle-400 text-balance">
                                      {subStep.rationale}
                                    </p>
                                  )}
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
        </div>
      )}

      <div className="text-center text-xs text-gentle-500 space-y-1">
        <p>Tiny steps are real progress</p>
        <p>You're doing great—keep going at your own pace</p>
      </div>
    </motion.div>
    </>
  )
}