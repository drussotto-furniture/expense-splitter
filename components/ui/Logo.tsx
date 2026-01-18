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
      {/* Icon: Abstract split/share symbol */}
      <div className="relative flex-shrink-0">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Three interconnected circles representing shared expenses */}
          <circle
            cx="24"
            cy="14"
            r="10"
            fill="#1e293b"
            opacity="0.9"
          />
          <circle
            cx="14"
            cy="30"
            r="10"
            fill="#334155"
            opacity="0.85"
          />
          <circle
            cx="34"
            cy="30"
            r="10"
            fill="#475569"
            opacity="0.85"
          />

          {/* Dollar sign in center */}
          <text
            x="24"
            y="28"
            textAnchor="middle"
            fill="white"
            fontSize="20"
            fontWeight="bold"
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
      <circle cx="24" cy="14" r="10" fill="#1e293b" opacity="0.9" />
      <circle cx="14" cy="30" r="10" fill="#334155" opacity="0.85" />
      <circle cx="34" cy="30" r="10" fill="#475569" opacity="0.85" />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fill="white"
        fontSize="20"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        $
      </text>
    </svg>
  )
}
