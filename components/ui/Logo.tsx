import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { container: 'h-8', text: 'text-lg', subtext: 'text-[8px]', icon: 16 },
    md: { container: 'h-12', text: 'text-2xl', subtext: 'text-xs', icon: 24 },
    lg: { container: 'h-16', text: 'text-3xl', subtext: 'text-sm', icon: 32 },
    xl: { container: 'h-24', text: 'text-5xl', subtext: 'text-lg', icon: 48 },
  }

  const { text, subtext, icon } = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon: Split/divide symbol with currency */}
      <div className="relative flex-shrink-0">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Square container with rounded corners */}
          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="8"
            fill="#1e293b"
          />

          {/* Vertical split line */}
          <line
            x1="24"
            y1="10"
            x2="24"
            y2="38"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Horizontal split line */}
          <line
            x1="10"
            y1="24"
            x2="38"
            y2="24"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Four dollar signs in quadrants - positioned away from center */}
          <text
            x="14"
            y="18.5"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            $
          </text>
          <text
            x="34"
            y="18.5"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            $
          </text>
          <text
            x="14"
            y="30.5"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            $
          </text>
          <text
            x="34"
            y="30.5"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            $
          </text>
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <div className={`font-bold text-slate-900 ${text} tracking-tight`}>
          Carvalytics
        </div>
        <div className={`text-slate-600 ${subtext} tracking-wide uppercase mt-0.5`}>
          Expense Splitter
        </div>
      </div>
    </div>
  )
}

// Alternative icon-only version
export function LogoIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="4" width="40" height="40" rx="8" fill="#1e293b" />
      <line x1="24" y1="10" x2="24" y2="38" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="24" x2="38" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <text x="14" y="18.5" textAnchor="middle" dominantBaseline="middle" fill="#cbd5e1" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">$</text>
      <text x="34" y="18.5" textAnchor="middle" dominantBaseline="middle" fill="#cbd5e1" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">$</text>
      <text x="14" y="30.5" textAnchor="middle" dominantBaseline="middle" fill="#cbd5e1" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">$</text>
      <text x="34" y="30.5" textAnchor="middle" dominantBaseline="middle" fill="#cbd5e1" fontSize="12" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">$</text>
    </svg>
  )
}
