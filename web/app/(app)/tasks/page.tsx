'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { List, Plus, Calendar, Trash2, MoreVertical, AlertTriangle } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useDeleteTask } from '@/hooks/useDeleteTask'
import { StateBadge } from '@/components/task/StateBadge'

export default function TasksPage() {
  const { data: tasks, isLoading, error } = useTasks()
  const deleteTask = useDeleteTask()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  const handleDeleteTask = (taskId: string) => {
    deleteTask.mutate(taskId, {
      onSuccess: () => {
        setShowDeleteConfirm(null)
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
          <List className="w-12 h-12 text-gentle-400 mx-auto" />
          <h1 className="text-2xl font-medium">Something went wrong</h1>
          <p className="text-gentle-600 text-balance">
            {error.message}
          </p>
        </div>
        <Link href="/decompose">
          <Button className="rounded-2xl">Try creating a task instead</Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div {...motionProps} className="space-y-8">
      <div className="text-center space-y-4">
        <List className="w-12 h-12 text-gentle-400 mx-auto" />
        <h1 className="text-2xl font-medium">Your tasks</h1>
        <p className="text-gentle-600 text-sm text-balance">
          Every big thing starts with breaking it down
        </p>
      </div>

      {isLoading ? (
        <div 
          className="space-y-4"
          aria-busy="true"
          aria-label="Loading tasks"
        >
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 bg-white/50 dark:bg-gentle-800/50 backdrop-blur border-gentle-200 dark:border-gentle-700">
              <div className="space-y-3">
                <div className="h-4 bg-gentle-200 dark:bg-gentle-700 rounded animate-pulse w-3/4" />
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gentle-200 dark:bg-gentle-700 rounded animate-pulse w-20" />
                  <div className="h-3 bg-gentle-200 dark:bg-gentle-700 rounded animate-pulse w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <motion.div
          {...(prefersReducedMotion ? {} : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } })}
          className="text-center space-y-6"
        >
          <Card className="p-8 space-y-6 bg-white/50 dark:bg-gentle-800/50 backdrop-blur border-gentle-200 dark:border-gentle-700">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gentle-100 dark:bg-gentle-800 rounded-2xl flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-gentle-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-medium">Ready to begin?</h2>
                <p className="text-gentle-600 text-balance max-w-sm mx-auto">
                  Break down something that feels big into smaller, manageable steps.
                </p>
              </div>
            </div>
            <Link href="/decompose">
              <Button className="w-full h-12 rounded-2xl bg-gentle-600 hover:bg-gentle-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Break down a task
              </Button>
            </Link>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              {...(prefersReducedMotion ? {} : { 
                initial: { opacity: 0, y: 20 }, 
                animate: { opacity: 1, y: 0 },
                transition: { delay: index * 0.1 }
              })}
            >
              <Card className="relative p-6 glass-strong rounded-3xl border border-white/30 dark:border-white/20 shadow-xl shadow-gentle-500/10 overflow-hidden group hover:shadow-2xl hover:shadow-gentle-500/20 transition-all duration-300">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gentle-50/50 via-ocean-50/30 to-green-50/50 dark:from-gentle-800/30 dark:via-ocean-900/20 dark:to-green-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating sparkles */}
                <div className="absolute top-4 right-4 w-1 h-1 bg-gentle-400 rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 w-0.5 h-0.5 bg-ocean-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: '0.5s' }}></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <Link href={`/tasks/${task.id}`} className="flex-1">
                      <div className="space-y-2 cursor-pointer">
                        <h3 className="font-semibold text-xl text-gentle-900 dark:text-gentle-100 text-balance group-hover:text-gentle-700 dark:group-hover:text-gentle-200 transition-colors leading-tight">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-3">
                          <StateBadge state={task.state} />
                          <div className="flex items-center gap-1.5 text-sm text-gentle-500 dark:text-gentle-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(task.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Delete button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDeleteConfirm(task.id)
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-xl glass hover:glass-strong text-gentle-500 hover:text-red-500 dark:text-gentle-400 dark:hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </Card>
              
              {/* Delete confirmation modal */}
              {showDeleteConfirm === task.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-strong rounded-3xl p-8 max-w-md w-full border border-white/30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-gentle-900 dark:text-gentle-100">
                          Delete task?
                        </h3>
                        <p className="text-gentle-600 dark:text-gentle-400 text-balance">
                          This will permanently delete "{task.title}" and all its steps. This action cannot be undone.
                        </p>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setShowDeleteConfirm(null)}
                          variant="outline"
                          className="flex-1 h-12 rounded-2xl border-gentle-200 dark:border-gentle-700 hover:bg-gentle-50 dark:hover:bg-gentle-800"
                        >
                          Cancel
                        </Button>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1"
                        >
                          <Button
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deleteTask.isPending}
                            className="w-full h-12 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            {deleteTask.isPending ? 'Deleting...' : 'Delete'}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {tasks && tasks.length > 0 && (
        <motion.div
          {...(prefersReducedMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 } })}
          className="text-center pt-4"
        >
          <Link href="/decompose">
            <Button 
              variant="outline" 
              className="rounded-xl border-gentle-200 dark:border-gentle-700 hover:bg-gentle-50 dark:hover:bg-gentle-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Break down another task
            </Button>
          </Link>
        </motion.div>
      )}

      <div className="text-center text-xs text-gentle-500 space-y-1">
        <p>Tiny steps are real progress</p>
        <p>You're building momentum, one step at a time</p>
      </div>
    </motion.div>
  )
}