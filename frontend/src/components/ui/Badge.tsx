import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'subtle'
  size?: 'sm' | 'md'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full font-semibold whitespace-nowrap',
        size === 'sm' && 'px-2.5 py-0.5 text-[11px]',
        size === 'md' && 'px-4 py-2 text-sm',
        variant === 'default' && 'bg-surface-2 text-text-secondary border border-border',
        variant === 'success' && 'bg-success/10 text-success border border-success/20',
        variant === 'warning' && 'bg-warning/10 text-warning border border-warning/20',
        variant === 'error' && 'bg-error/10 text-error border border-error/20',
        variant === 'info' && 'bg-info/10 text-info border border-info/20',
        variant === 'subtle' && 'bg-primary/10 text-primary border border-primary/20',
        className
      )}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge }
