import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'red' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

export function Button({ variant = 'red', size = 'md', href, children, className, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'

  const variants = {
    red: 'bg-red text-white hover:bg-red-l hover:shadow-[0_8px_24px_rgba(232,25,10,0.35)]',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text',
    outline: 'bg-surface border border-border text-text-secondary hover:border-gray-500 hover:bg-surface-2 hover:text-text',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-sm',
  }

  const cls = cn(base, variants[variant], sizes[size], className)

  if (href) return <a href={href} className={cls}>{children}</a>
  return <button className={cls} {...props}>{children}</button>
}
