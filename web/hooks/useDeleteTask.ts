'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      return await apiFetch(`/v1/tasks/${taskId}`, {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      // Invalidate and refetch tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error) => {
      console.error('Failed to delete task:', error)
    }
  })
}