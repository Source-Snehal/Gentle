'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BubbleOption {
  value: string | number
  label: string
  color?: 'blue' | 'green' | 'ocean' | 'gentle'
  emoji?: string
}

interface BubbleSelectorProps {
  options: BubbleOption[]
  value: string | number | null
  onChange: (value: string | number) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function BubbleSelector({
  options,
  value,
  onChange,
  className,
  size = 'md'
}: BubbleSelectorProps) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base'
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto p-2">
      {options.map((option, index) => {
        const isSelected = value === option.value
        const colorClasses = {
          blue: 'glass hover:glass-strong text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 hover:scale-105',
          green: 'glass hover:glass-strong text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 hover:scale-105',
          ocean: 'glass hover:glass-strong text-ocean-700 dark:text-ocean-300 hover:text-ocean-800 dark:hover:text-ocean-200 hover:scale-105',
          gentle: 'glass hover:glass-strong text-gentle-700 dark:text-gentle-300 hover:text-gentle-800 dark:hover:text-gentle-200 hover:scale-105'
        }

        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative rounded-3xl border border-transparent overflow-hidden',
              'flex flex-col items-center justify-center gap-2',
              'font-semibold transition-all duration-500 whitespace-nowrap',
              'focus:outline-none focus:ring-4 focus:ring-gentle-400/30 focus:ring-offset-0',
              'hover:shadow-2xl hover:shadow-gentle-500/25 active:scale-95',
              'w-full aspect-square backdrop-blur-xl group',
              sizeClasses[size],
              isSelected 
                ? 'scale-105 shadow-2xl border-white/40 bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-700/90 dark:to-gray-800/70 text-gentle-800 dark:text-white'
                : colorClasses[option.color || 'gentle']
            )}
            whileHover={{ 
              scale: isSelected ? 1.05 : 1.08, 
              y: -5,
              rotateY: 5 
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotateY: 0,
              transition: { 
                delay: index * 0.1, 
                type: 'spring', 
                stiffness: 200,
                duration: 0.6
              }
            }}
          >
            {/* Floating glow effect */}
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-br from-gentle-400/20 via-ocean-400/20 to-green-400/20 rounded-3xl blur-xl"></div>
            )}
            
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center gap-2">
              {option.emoji && (
                <motion.span 
                  className="text-2xl"
                  animate={isSelected ? { 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {option.emoji}
                </motion.span>
              )}
              <span className="text-center leading-tight text-sm font-medium">
                {option.label}
              </span>
            </div>
          </motion.button>
        )
      })}
      </div>
    </div>
  )
}