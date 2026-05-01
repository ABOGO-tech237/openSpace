'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-12 h-[70px] transition-all duration-300 ${
      scrolled ? 'bg-[rgba(8,10,15,0.97)]' : 'bg-[rgba(8,10,15,0.7)]'
    } backdrop-blur-[24px] border-b border-[rgba(255,255,255,0.04)]`}>
      <Link href="/" className="flex items-center text-2xl font-bold font-sora text-white">
        OS
      </Link>
      <div className="flex items-center gap-9">
        <a href="#feat" className="text-[#8B95A8] hover:text-white text-sm font-medium transition-colors">Fonctionnalités</a>
        <a href="#price" className="text-[#8B95A8] hover:text-white text-sm font-medium transition-colors">Tarifs</a>
        <a href="#dom" className="text-[#8B95A8] hover:text-white text-sm font-medium transition-colors">Domaines</a>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-6 py-2 rounded-lg border border-[#1C2333] text-[#F0F4FF] text-sm font-medium hover:border-[#E8190A] hover:text-[#E8190A] transition-colors">
          Se connecter
        </button>
        <button className="px-6 py-2 rounded-lg bg-[#E8190A] hover:bg-[#FF3D2E] text-white text-sm font-bold transition-all" style={{boxShadow: '0 4px 16px rgba(232, 25, 10, 0.35)'}}>
          Commencer →
        </button>
      </div>
    </nav>
  )
}
