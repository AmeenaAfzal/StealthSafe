import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Cloud, Wind, Droplets, Eye, Thermometer } from 'lucide-react'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  CITY, TEMP, CONDITION, FEELS_LIKE, HUMIDITY,
  WIND_KMH, UV_INDEX, VISIBILITY_KM, HOURLY, WEEK,
} from '../lib/data.js'
import { sendWhatsApp, buildMessage } from '../lib/alerts.js'
import { addBreadcrumb } from '../hooks/useSettings.js'
import { db } from '../lib/firebase.js'
import { ref, push } from 'firebase/database'

export default function WeatherScreen({ onUnlock, settings }) {
  // ── Unlock state (Sun → Cloud) ───────────────────────────────────────────
  const [sunPrimed, setSunPrimed] = useState(false)
  const [ripple,    setRipple]    = useState(false)
  const sunTimer = useRef(null)

  // ── FIX: SOS state machine completely separated from unlock logic ─────────
  // sosStep: 0 = idle | 1 = cloud tapped | 2 = cloud+sun tapped
  const [sosStep,    setSosStep]    = useState(0)
  const [sosFlash,   setSosFlash]   = useState(false) // brief visual for dev
  const sosTimer = useRef(null)

  const [searchVal, setSearchVal] = useState('')
  const [showSW,    setShowSW]    = useState(false)

  // ── Keyboard: S then C ───────────────────────────────────────────────────
  useEffect(() => {
    let sDown = false
    let sTimer = null
    const onKey = (e) => {
      if (e.key === 's' || e.key === 'S') {
        sDown = true
        clearTimeout(sTimer)
        sTimer = setTimeout(() => { sDown = false }, 1500)
      }
      if ((e.key === 'c' || e.key === 'C') && sDown) {
        sDown = false; clearTimeout(sTimer); onUnlock()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onUnlock])

  // ── Safeword check ───────────────────────────────────────────────────────
  const checkSafeword = (val) => {
    if (!val) return
    for (const sw of settings.safewords) {
      if (sw.word && val.toLowerCase() === sw.word.toLowerCase()) {
        setSearchVal('')
        const phone = settings.contactPhone
        if (sw.action === 'checkin') sendWhatsApp(phone, buildMessage('checkin'))
        else if (sw.action === 'sos') sendWhatsApp(phone, buildMessage('sos'))
        else if (sw.action === 'deadman') {
          const note = settings.deadManNote || 'Emergency triggered via safeword.'
          sendWhatsApp(phone, `⚠️ Dead Man's Switch triggered.\n${note}`)
        }
        return
      }
    }
  }

  // ── FIX: Fire silent SOS ─────────────────────────────────────────────────
  const fireSilentSOS = useCallback(() => {
    const crumb = addBreadcrumb('Silent SOS triggered')
    if (settings.guardianCode) {
      push(ref(db, `guardians/${settings.guardianCode}`), crumb).catch(() => {})
    }
    sendWhatsApp(settings.contactPhone, buildMessage('sos'))
    // brief indicator only visible if you know to look
    setSosFlash(true)
    setTimeout(() => setSosFlash(false), 400)
  }, [settings])

  // ── Sun tap handler ───────────────────────────────────────────────────────
  const handleSunTap = () => {
    // Ripple + prime unlock
    setRipple(true)
    setTimeout(() => setRipple(false), 600)
    setSunPrimed(true)
    clearTimeout(sunTimer.current)
    sunTimer.current = setTimeout(() => setSunPrimed(false), 1500)

    // ── FIX: Sun is step 2 of SOS (Cloud → SUN → Cloud)
    if (sosStep === 1) {
      // Cloud already tapped → now Sun tapped → advance to step 2
      setSosStep(2)
      clearTimeout(sosTimer.current)
      // Give 2s to tap cloud again
      sosTimer.current = setTimeout(() => setSosStep(0), 2000)
    }
  }

  // ── Cloud tap handler ─────────────────────────────────────────────────────
  const handleCloudTap = () => {
    // ── Unlock check: Sun was primed, Cloud tapped → unlock vault
    if (sunPrimed) {
      setSunPrimed(false)
      clearTimeout(sunTimer.current)
      // Reset SOS state too so we don't carry stale state into vault
      setSosStep(0)
      clearTimeout(sosTimer.current)
      onUnlock()
      return
    }

    // ── FIX: SOS sequence (Cloud → Sun → Cloud) — completely independent
    if (sosStep === 0) {
      // Step 1: first cloud tap
      setSosStep(1)
      clearTimeout(sosTimer.current)
      sosTimer.current = setTimeout(() => setSosStep(0), 2500)
    } else if (sosStep === 2) {
      // Step 3: second cloud tap → sequence complete → FIRE SOS
      setSosStep(0)
      clearTimeout(sosTimer.current)
      fireSilentSOS()
    }
    // if sosStep === 1 and cloud tapped again (no sun in between) → reset
    else if (sosStep === 1) {
      // Re-start the sequence (user tapped cloud twice without sun)
      clearTimeout(sosTimer.current)
      sosTimer.current = setTimeout(() => setSosStep(0), 2500)
      // keep at step 1 — first cloud of a fresh attempt
    }
  }

  return (
    // ── FIX: height 100% fills the phone frame exactly. overflow-y-auto enables scroll.
    // pb-8 ensures Sunday is fully visible before the scroll ends.
    <div
      className="relative bg-gradient-to-b from-sky-400 via-blue-500 to-blue-700 text-white overflow-y-auto scroll-thin"
      style={{ height: '100%' }}
    >
      {/* Barely-visible SOS step indicator — a dev-only hint, observer won't notice */}
      {sosStep > 0 && <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30 pointer-events-none" />}
      {sosFlash    && <div className="absolute top-0 left-0 right-0 h-[2px] bg-green-400/60 pointer-events-none" />}

      {/* Status bar */}
      <div className="flex justify-between items-center px-6 pt-5 pb-1 text-xs font-medium">
        <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        <span className="tracking-widest opacity-70">●●●</span>
      </div>

      {/* Search bar */}
      <div className="relative mx-5 mb-4 mt-2">
        <input
          type="text"
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') checkSafeword(searchVal) }}
          placeholder={`📍 ${CITY}`}
          className="w-full bg-white/20 backdrop-blur rounded-full px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none pr-9"
        />
        <button
          onClick={() => setShowSW(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs font-bold">
          ?
        </button>
      </div>

      {/* Safeword reminder overlay */}
      <AnimatePresence>
        {showSW && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mx-5 mb-3 bg-black/60 backdrop-blur rounded-2xl p-4 text-xs z-10">
            <p className="font-semibold mb-2 text-white">Safewords (type + Enter):</p>
            {settings.safewords.map((sw, i) => sw.word ? (
              <p key={i} className="text-white/70 mb-1">
                <span className="font-mono text-white">{sw.word}</span>
                {' → '}
                {{ checkin: '✅ Check-in', sos: '🚨 SOS', deadman: '⏱ Dead Man\'s Switch' }[sw.action]}
              </p>
            ) : null)}
            {settings.safewords.every(s => !s.word) && (
              <p className="text-white/50">No safewords set. Add in Settings (inside vault).</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Temp + unlock icons */}
      <div className="flex items-start justify-between px-7 py-2">
        <div>
          <p className="text-8xl font-thin tracking-tighter">{TEMP}°</p>
          <p className="text-lg font-light mt-1 opacity-80">{CONDITION}</p>
          <p className="text-sm opacity-50 mt-0.5">Feels like {FEELS_LIKE}°</p>
        </div>

        <div className="flex flex-col gap-5 items-center pt-2">
          {/* SUN — tap first for unlock, tap second for SOS */}
          <button onClick={handleSunTap} className="relative focus:outline-none active:scale-95 transition-transform">
            <Sun
              size={52} strokeWidth={1.5}
              className={`transition-all duration-150 ${sunPrimed ? 'text-yellow-300 drop-shadow-lg scale-110' : 'text-white/90'}`}
            />
            {ripple && <span className="absolute inset-0 rounded-full border-2 border-yellow-300 ripple-anim" />}
          </button>
          {/* CLOUD — tap first for SOS step 1, tap second for SOS step 3, tap after Sun for unlock */}
          <button onClick={handleCloudTap} className="focus:outline-none active:scale-95 transition-transform">
            <Cloud
              size={38} strokeWidth={1.5}
              className={`transition-colors duration-150 ${sosStep > 0 ? 'text-white scale-105' : 'text-white/60'}`}
            />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-2 mx-5 mt-4">
        {[
          { icon: <Droplets size={15} />,    label: 'Humidity',   value: `${HUMIDITY}%` },
          { icon: <Wind size={15} />,         label: 'Wind',       value: `${WIND_KMH} km/h` },
          { icon: <Thermometer size={15} />,  label: 'UV',         value: `${UV_INDEX}` },
          { icon: <Eye size={15} />,          label: 'Visibility', value: `${VISIBILITY_KM} km` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-white/15 backdrop-blur rounded-2xl p-2.5 text-center">
            <div className="flex justify-center mb-1 opacity-70">{icon}</div>
            <p className="text-[10px] opacity-50 leading-none mb-0.5">{label}</p>
            <p className="text-xs font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Hourly chart */}
      <div className="mx-5 mt-4 bg-white/10 backdrop-blur rounded-3xl p-4">
        <p className="text-[10px] opacity-50 uppercase tracking-widest mb-2">24-Hour Temperature</p>
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={HOURLY} margin={{ top: 5, bottom: 0, left: -30, right: 5 }}>
            <defs>
              <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#fff" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#fff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }}
              formatter={v => [`${v}°C`, '']}
            />
            <Area type="monotone" dataKey="temp" stroke="#fff" strokeWidth={2} fill="url(#tg)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 7-day forecast — pb-8 ensures Sunday fully visible before scroll ends */}
      <div className="mx-5 mt-3 mb-8 bg-white/10 backdrop-blur rounded-3xl p-4">
        <p className="text-[10px] opacity-50 uppercase tracking-widest mb-3">7-Day Forecast</p>
        <div className="space-y-2.5">
          {WEEK.map(({ day, icon, hi, lo }) => (
            <div key={day} className="flex items-center justify-between text-sm">
              <span className="w-10 opacity-70 font-light">{day}</span>
              <span className="text-base">{icon}</span>
              <div className="flex gap-3">
                <span className="font-medium">{hi}°</span>
                <span className="opacity-40">{lo}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
