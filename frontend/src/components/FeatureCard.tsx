'use client'

import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon: string
  title: string
  description: string
  variants?: any
}

export function FeatureCard({ icon, title, description, variants }: FeatureCardProps) {
  return (
    <motion.div
      variants={variants}
      className="p-9 rounded-3xl bg-[#0E1118] border border-[#1C2333] hover:border-[rgba(232,25,10,0.3)] hover:shadow-lg transition-all group relative"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E8190A] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-14 h-14 rounded-2xl bg-[rgba(232,25,10,0.12)] border border-[rgba(232,25,10,0.2)] flex items-center justify-center text-2xl group-hover:bg-[rgba(232,25,10,0.2)] group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-sora mb-3">{title}</h3>
      <p className="text-sm text-[#8B95A8] leading-relaxed">{description}</p>
    </motion.div>
  )
}
