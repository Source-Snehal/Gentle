'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export type TaskListItem = {
  id: string
  title: string
  state: 'pending' | 'active' | 'done' | 'archived'
  created_at: string
  updated_at: string
}

export type StepResponse = {
  id: string
  task_id: string
  content: string
  order: number
  state: 'pending' | 'done'
  created_at: string
}

export type TaskDetailResponse = {
  id: string
  title: string
  state: 'pending' | 'active' | 'done' | 'archived'
  created_at: string
  updated_at: string
  steps: StepResponse[]
}

export function useTasks() {
  return useQuery<TaskListItem[], Error>({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        const data = await apiFetch('/v1/tasks')
        return data
      } catch (error) {
        throw new Error(
          error instanceof Error 
            ? error.message 
            : 'Failed to load tasks. Please try again.'
        )
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTask(taskId: string) {
  return useQuery<TaskDetailResponse, Error>({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      try {
        const data = await apiFetch(`/v1/tasks/${taskId}`)
        return data
      } catch (error) {
        throw new Error(
          error instanceof Error 
            ? error.message 
            : 'Failed to load task details. Please try again.'
        )
      }
    },
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}