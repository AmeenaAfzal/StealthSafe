import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function PhoneFrame({ children }) {
  const [siteUrl, setSiteUrl] = useState('')

  useEffect(() => {
    // ── FIX 1: Use window.location.origin (e.g. https://stealthsafe.vercel.app)
    // href includes the path and is localhost in dev — origin is always the right root URL
    setSiteUrl(window.location.origin)
  }, [])

  const isLocal = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      {/* Left branding */}
      <div className="hidden lg:flex flex-col items-end pr-14 text-right max-w-[260px]">
        <div className="text-3xl mb-3">🛡️</div>
        <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">StealthSafe</p>
        <h1 className="text-2xl font-light text-slate-700 leading-snug mb-4">
          Safety hidden<br />in plain sight.
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          A personal safety app disguised as a weather app. Secret gestures. Silent SOS. Guardian monitoring.
        </p>
      </div>

      {/* ── FIX 2: Fixed height 780px on both shell and frame div so content never bleeds out */}
      <div className="relative flex-shrink-0" style={{ width: 390, height: 780 }}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-20 pointer-events-none" />
        {/* Frame — overflow hidden, exact height, each screen handles its own scroll */}
        <div
          className="overflow-hidden rounded-[44px] shadow-2xl border-[6px] border-gray-900 bg-gray-950"
          style={{ height: 780 }}
        >
          {children}
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-900/30 rounded-full pointer-events-none" />
      </div>

      {/* Right — QR */}
      <div className="hidden lg:flex flex-col items-start pl-14 max-w-[260px]">
        {/* ── FIX 3: Show helpful message when on localhost instead of broken QR */}
        {isLocal ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-3 w-[152px]">
            <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Dev mode</p>
            <p className="text-[11px] text-amber-600 leading-relaxed">
              Deploy to Vercel — your live URL will generate the QR automatically.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-md mb-3">
            <QRCodeSVG value={siteUrl} size={120} level="M" fgColor="#111827" bgColor="#ffffff" />
          </div>
        )}
        <p className="text-xs text-slate-500 font-medium mb-1">
          {isLocal ? 'After deploy — scan to open on phone' : 'Scan to demo on your phone'}
        </p>
        <p className="text-[10px] text-slate-400 break-all">{siteUrl || '…'}</p>

        <div className="mt-5 space-y-2">
          {[
            ['☀️ → ☁️', 'Open vault'],
            ['☁️ → ☀️ → ☁️', 'Silent SOS'],
            ['S → C', 'Keyboard unlock'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <span className="font-mono text-slate-700 w-24 flex-shrink-0">{k}</span>
              <span className="text-slate-400">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
