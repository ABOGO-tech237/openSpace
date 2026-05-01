'use client'

import { motion } from 'framer-motion'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <motion.div
      className={`${sizeMap[size]} rounded-full border-2 border-border border-t-red`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  )
}
