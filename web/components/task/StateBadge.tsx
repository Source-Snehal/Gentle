type TaskState = 'pending' | 'active' | 'done' | 'archived'

interface StateBadgeProps {
  state: TaskState
  className?: string
}

const stateConfig = {
  pending: {
    label: 'Not started',
    className: 'bg-gentle-100 text-gentle-700 border-gentle-200 dark:bg-gentle-800 dark:text-gentle-300 dark:border-gentle-700'
  },
  active: {
    label: 'In progress',
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800'
  },
  done: {
    label: 'Complete',
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800'
  },
  archived: {
    label: 'Archived',
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  }
}

export function StateBadge({ state, className = '' }: StateBadgeProps) {
  const config = stateConfig[state]
  
  return (
    <span className={`
      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
      ${config.className} ${className}
    `}>
      {config.label}
    </span>
  )
}