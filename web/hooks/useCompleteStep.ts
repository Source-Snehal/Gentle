'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useApi } from './useApi'

export function useCompleteStep() {
  const api = useApi()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation<{ taskCompleted: boolean }, Error, { stepId: string; taskId?: string }>({
    mutationFn: async ({ stepId }: { stepId: string; taskId?: string }) => {
      const response = await api.post(`/v1/steps/${stepId}/complete`)
      return response
    },
    
    onMutate: async ({ stepId, taskId }: { stepId: string; taskId?: string }) => {
      // Optimistic update: immediately consider the step completed
      // Store the step ID and task ID for potential rollback
      return { stepId, taskId }
    },
    
    onSuccess: (data, { taskId }) => {
      // Navigate to celebrate page with context about whether task is complete
      const searchParams = new URLSearchParams()
      if (taskId) {
        searchParams.set('taskId', taskId)
      }
      if (data?.taskCompleted) {
        searchParams.set('taskCompleted', 'true')
      }
      
      console.log('useCompleteStep - data:', data, 'taskId:', taskId, 'URL params:', searchParams.toString())
      
      router.push(`/celebrate?${searchParams.toString()}`)
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['steps'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    
    onError: (error, stepId, context) => {
      // Rollback optimistic update if needed
      console.error('Failed to complete step:', error)
      
      // If we had optimistic updates in place, we could rollback here
      // For now, we'll just let the mutation error bubble up
    },
    
    retry: 1,
  })
}