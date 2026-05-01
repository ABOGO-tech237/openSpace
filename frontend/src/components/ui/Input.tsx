import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

const inputVariants = cva(
  'flex w-full rounded-lg border border-border bg-surface px-3 text-sm text-text placeholder:text-text-secondary transition-all duration-150 focus-visible:outline-none focus-visible:border-red focus-visible:ring-2 focus-visible:ring-red/20 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-10',
        lg: 'h-12 text-base',
        sm: 'h-9 text-xs',
      },
      error: {
        true: 'border-error focus-visible:ring-error',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, error, ...props }, ref) => (
    <input
      className={cn(inputVariants({ size, error, className }))}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export { Input, inputVariants }
