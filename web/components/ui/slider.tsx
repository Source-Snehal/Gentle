import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      onValueChange([newValue])
    }

    const currentValue = value[0] || min

    return (
      <div
        ref={ref}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
      >
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          className={cn(
            'w-full h-2 bg-gentle-200 dark:bg-gentle-700 rounded-lg appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-gentle-400 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gentle-600',
            '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white',
            '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-gentle-600 [&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-lg',
            '[&::-moz-range-track]:bg-gentle-200 dark:[&::-moz-range-track]:bg-gentle-700',
            '[&::-moz-range-track]:rounded-lg [&::-moz-range-track]:h-2'
          )}
        />
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div 
            className="h-2 bg-gentle-600 rounded-lg transition-all duration-200"
            style={{ width: `${((currentValue - min) / (max - min)) * 100}%` }}
          />
        </div>
      </div>
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }