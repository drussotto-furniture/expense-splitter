import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { width: 152, height: 50 },
    md: { width: 183, height: 60 },
    lg: { width: 195, height: 64 },
    xl: { width: 244, height: 80 },
  }

  const { width, height } = sizes[size]

  return (
    <div className={className}>
      <Image
        src="/carvalytics-logo.png"
        alt="Carvalytics Expense Splitter"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
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
