import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { width: 200, height: 54 },
    md: { width: 280, height: 75 },
    lg: { width: 360, height: 96 },
    xl: { width: 480, height: 128 },
  }

  const { width, height } = sizes[size]

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* Logo Image */}
      <div className="relative" style={{ width, height }}>
        <Image
          src="/carvalytics-logo.png"
          alt="Carvalytics Expense Splitter"
          fill
          priority
          className="object-contain"
        />
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
        fill
        priority
        className="object-contain"
      />
    </div>
  )
}
