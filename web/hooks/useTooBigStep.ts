'use client'

import { useMutation } from '@tanstack/react-query'
import { useApi } from './useApi'

type SubStep = {
  id: string
  content: string
  rationale?: string
}

export function useTooBigStep() {
  const api = useApi()

  return useMutation<SubStep[], Error, string>({
    mutationFn: async (stepId: string) => {
      const response = await api.post(`/v1/steps/${stepId}/too-big`)
      
      // Ensure response is an array of sub-steps
      if (Array.isArray(response)) {
        return response.map(step => ({
          id: step.id || step.step_id,
          content: step.content,
          rationale: step.rationale,
        }))
      }
      
      // Handle case where API returns a single step or different format
      if (response.steps && Array.isArray(response.steps)) {
        return response.steps.map((step: any) => ({
          id: step.id || step.step_id,
          content: step.content,
          rationale: step.rationale,
        }))
      }
      
      throw new Error('Invalid response format from too-big API')
    },
    
    retry: 1,
  })
}