'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className, delay = 0 }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.175, 0.885, 0.32, 1.275] }}
    >
      {children}
    </motion.div>
  )
}
