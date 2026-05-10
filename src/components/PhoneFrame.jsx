import React from 'react'

export default function PhoneFrame({ children }) {
  return (
    // Changed bg-slate-100 to bg-slate-950 to match the dark aesthetic
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">

      {/* Left branding - Adjusted to items-start and text-left */}
      <div className="hidden lg:flex flex-col items-start pr-14 text-left max-w-[320px]">
        <div className="text-3xl mb-3">🛡️</div>
        {/* Changed text-slate-400 to text-blue-400 for a pop of color */}
        <p className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-2">StealthSafe</p>
        
        {/* Adjusted colors and weight for a more professional headline */}
        <h1 className="text-3xl font-bold text-slate-50 leading-snug mb-4">
          A personal safety app disguised as a weather app.
        </h1>
        
        {/* Adjusted text color for better readability against dark bg */}
        <p className="text-sm text-slate-400 leading-relaxed">
          Subtle protection for high-risk situations. Keep your safety tools hidden in plain sight.
        </p>
      </div>

      {/* Phone Frame Shell - No changes */}
      <div className="relative flex-shrink-0" style={{ width: 390, height: 780 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-20 pointer-events-none" />
        <div className="overflow-hidden rounded-[44px] shadow-2xl border-[6px] border-gray-900 bg-gray-950" style={{ height: 780 }}>
          {children}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-900/30 rounded-full pointer-events-none" />
      </div>

      {/* Right side — Updated colors to match the dark theme */}
      <div className="hidden lg:flex flex-col items-start pl-14 max-w-[260px]">
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-50 mb-4">Stealth Gestures</h3>
          <div className="space-y-3">
            {[['☀️ → ☁️', 'Open vault'],['☁️ → ☀️', 'Silent SOS'],
              ['S → C', 'Desktop unlock'],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3 text-xs items-center">
                {/* Darker background for keys */}
                <span className="font-mono bg-slate-900 px-2 py-1 rounded border border-slate-700 text-blue-300 w-28 text-center">
                  {k}
                </span>
                <span className="text-slate-400">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}