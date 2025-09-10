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
      // Invalidate related queries to refresh the task view
      queryClient.invalidateQueries({ queryKey: ['steps'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      // If task is completed, go to task list, otherwise stay on current task page
      if (data?.taskCompleted) {
        router.push('/tasks')
      }
      // If task is not completed, we stay on the current page which will update to show the next step
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