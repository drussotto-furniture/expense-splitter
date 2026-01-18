import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { height: 32, textClass: 'text-lg', subtextClass: 'text-[8px]' },
    md: { height: 48, textClass: 'text-2xl', subtextClass: 'text-xs' },
    lg: { height: 64, textClass: 'text-3xl', subtextClass: 'text-sm' },
    xl: { height: 96, textClass: 'text-5xl', subtextClass: 'text-lg' },
  }

  const { height, textClass, subtextClass } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image */}
      <div className="relative flex-shrink-0" style={{ width: height * 1.2, height }}>
        <Image
          src="/carvalytics-logo.png"
          alt="Carvalytics Logo"
          width={height * 1.2}
          height={height}
          priority
          className="object-contain"
        />
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <div className={`font-bold ${textClass} tracking-tight`}>
          <span className="text-slate-900">Carva</span>
          <span className="text-blue-600">lytics</span>
        </div>
        <div className={`text-slate-600 ${subtextClass} tracking-wide uppercase mt-0.5`}>
          Expense Splitter
        </div>
      </div>
    </div>
  )
}

// Icon-only version - just the wallet/pie chart graphic
export function LogoIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/carvalytics-icon.png"
        alt="Carvalytics"
        width={size}
        height={size}
        priority
        className="object-contain"
      />
    </div>
  )
}
