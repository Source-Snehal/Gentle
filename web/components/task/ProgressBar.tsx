interface ProgressBarProps {
  value: number // 0-100
  className?: string
  showPercentage?: boolean
}

export function ProgressBar({ 
  value, 
  className = '', 
  showPercentage = false 
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(100, Math.max(0, value))
  
  return (
    <div className={`space-y-2 ${className}`}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-gentle-600 dark:text-gentle-400">
          <span>Progress</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      
      <div 
        className="w-full bg-gentle-100 dark:bg-gentle-800 rounded-full h-2 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedValue}
        aria-label={`Progress: ${Math.round(clampedValue)}%`}
      >
        <div
          className="h-full bg-gradient-to-r from-gentle-500 to-gentle-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}