'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'relative bg-bg border border-border rounded-xl shadow-2xl max-w-md w-full mx-4',
              className
            )}
          >
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold font-sora text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-muted hover:text-white transition-colors p-1 hover:bg-border rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
