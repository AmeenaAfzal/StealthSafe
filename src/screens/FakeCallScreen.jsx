import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Phone, PhoneOff } from 'lucide-react'

export default function FakeCallScreen({ settings, onEnd }) {
  const [step,      setStep]      = useState('config') // config | countdown | ringing | active
  const [delay,     setDelay]     = useState('now')
  const [custom,    setCustom]    = useState(2)
  const [caller,    setCaller]    = useState(settings.callerName || 'Mum')
  const [countdown, setCountdown] = useState(null)
  const [callSecs,  setCallSecs]  = useState(0)

  const countdownRef = useRef(null)
  const callTimerRef = useRef(null)
  // ── FIX: Track AudioContext + oscillator in refs so we can ALWAYS stop them ──
  const ringCtxRef  = useRef(null)
  const ringOscRef  = useRef(null)  // array of active oscillators

  const callerOptions = [settings.callerName || 'Mum', 'Friend', 'Work']

  const getDelaySecs = () => {
    if (delay === 'now') return 0
    if (delay === '30s') return 30
    if (delay === '2m')  return 120
    return custom * 60
  }

  // ── FIX: Centralised ring stop — stops ALL oscillators and closes context ──
  const stopRing = () => {
    try {
      if (ringOscRef.current) {
        ringOscRef.current.forEach(osc => { try { osc.stop(); osc.disconnect() } catch {} })
        ringOscRef.current = null
      }
      if (ringCtxRef.current) {
        ringCtxRef.current.close()
        ringCtxRef.current = null
      }
    } catch {}
  }

  // ── FIX: Ring uses refs, not local variables that go out of scope ──
  const playRing = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      ringCtxRef.current = ctx
      const oscs = []
      ringOscRef.current = oscs

      const scheduleBeep = (startTime) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = 440
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.4, startTime + 0.05)
        gain.gain.setValueAtTime(0.4, startTime + 0.9)
        gain.gain.linearRampToValueAtTime(0, startTime + 1.0)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + 1.1)
        oscs.push(osc)
        osc.onended = () => {
          try { osc.disconnect() } catch {}
          const idx = oscs.indexOf(osc)
          if (idx > -1) oscs.splice(idx, 1)
        }
      }

      // Schedule 12 beeps (24 seconds of ringing max)
      for (let i = 0; i < 12; i++) scheduleBeep(ctx.currentTime + i * 2)
    } catch (e) {
      console.error('Ring error', e)
    }
  }

  const start = () => {
    const secs = getDelaySecs()
    if (secs === 0) {
      setStep('ringing')
      playRing()
      return
    }
    setCountdown(secs)
    setStep('countdown')
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(countdownRef.current)
          setStep('ringing')
          playRing()
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  // ── FIX: accept() stops ring THEN switches to active call ──
  const accept = () => {
    stopRing()  // ← stop ring before switching step
    setStep('active')
    clearInterval(countdownRef.current)
    callTimerRef.current = setInterval(() => setCallSecs(s => s + 1), 1000)
  }

  // ── FIX: decline() also stops ring and cleans up ──
  const decline = () => {
    stopRing()
    clearInterval(countdownRef.current)
    clearInterval(callTimerRef.current)
    onEnd()
  }

  const hangUp = () => {
    stopRing()
    clearInterval(callTimerRef.current)
    onEnd()
  }

  // ── FIX: cleanup on unmount covers all cases (navigating away mid-call) ──
  useEffect(() => {
    return () => {
      stopRing()
      clearInterval(countdownRef.current)
      clearInterval(callTimerRef.current)
    }
  }, [])

  const fmtSecs = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // ── Config screen ─────────────────────────────────────────────────────────
  if (step === 'config') return (
    <div className="bg-gray-950 text-white flex flex-col px-6 pt-8 overflow-y-auto scroll-thin" style={{ height: '100%' }}>
      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Fake Call</p>
      <h2 className="text-xl font-light mb-6">Set up your call</h2>

      <p className="text-xs text-gray-400 mb-2">Caller name</p>
      <div className="flex gap-2 mb-5">
        {callerOptions.map(n => (
          <button key={n} onClick={() => setCaller(n)}
            className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
              caller === n ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}>
            {n}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-2">Call delay</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[['now','Now'], ['30s','30 sec'], ['2m','2 min'], ['custom','Custom']].map(([v, l]) => (
          <button key={v} onClick={() => setDelay(v)}
            className={`py-2.5 rounded-xl text-sm transition-colors ${
              delay === v ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {delay === 'custom' && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Delay (minutes)</span>
            <span className="text-emerald-400 font-mono">{custom} min</span>
          </div>
          <input type="range" min={1} max={10} value={custom}
            onChange={e => setCustom(+e.target.value)}
            className="w-full accent-emerald-400" />
        </div>
      )}

      <div className="flex gap-3 mt-auto mb-10 pt-6">
        <button onClick={onEnd}
          className="flex-1 bg-gray-800 text-gray-400 py-3.5 rounded-2xl text-sm hover:bg-gray-700 transition-colors">
          Cancel
        </button>
        <button onClick={start}
          className="flex-1 bg-emerald-600 text-white py-3.5 rounded-2xl text-sm font-medium hover:bg-emerald-500 transition-colors">
          Start
        </button>
      </div>
    </div>
  )

  // ── Countdown screen ──────────────────────────────────────────────────────
  if (step === 'countdown') return (
    <div className="bg-gray-950 text-white flex flex-col items-center justify-center gap-4" style={{ height: '100%' }}>
      <p className="text-gray-500 text-sm">Call from <span className="text-white">{caller}</span> in</p>
      <p className="text-7xl font-thin text-emerald-400 font-mono">{countdown}</p>
      <p className="text-gray-600 text-xs">seconds</p>
      <button onClick={decline} className="mt-8 text-sm text-gray-600 hover:text-gray-400 transition-colors">
        Cancel
      </button>
    </div>
  )

  // ── Ringing screen ────────────────────────────────────────────────────────
  if (step === 'ringing') return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 text-white flex flex-col items-center justify-between py-16" style={{ height: '100%' }}>
      <div className="flex flex-col items-center gap-4 mt-8">
        <motion.div
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl">
          <span className="text-5xl font-light text-white">{caller[0].toUpperCase()}</span>
        </motion.div>
        <h2 className="text-2xl font-light mt-2">{caller}</h2>
        <p className="text-gray-400 text-sm">Incoming call…</p>
      </div>

      <div className="flex gap-14 pb-8">
        <div className="flex flex-col items-center gap-2">
          <button onClick={decline}
            className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:bg-red-500 active:scale-95 transition-all">
            <PhoneOff size={28} className="text-white" />
          </button>
          <span className="text-xs text-gray-500">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button onClick={accept}
            className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg hover:bg-emerald-400 active:scale-95 transition-all">
            <Phone size={28} className="text-white" />
          </button>
          <span className="text-xs text-gray-500">Accept</span>
        </div>
      </div>
    </div>
  )

  // ── Active call screen ────────────────────────────────────────────────────
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 text-white flex flex-col items-center justify-between py-16" style={{ height: '100%' }}>
      <div className="flex flex-col items-center gap-3 mt-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl">
          <span className="text-4xl font-light">{caller[0].toUpperCase()}</span>
        </div>
        <h2 className="text-2xl font-light mt-2">{caller}</h2>
        <p className="text-emerald-400 font-mono text-lg">{fmtSecs(callSecs)}</p>
        <p className="text-gray-500 text-xs">Call in progress</p>
      </div>

      <div className="flex flex-col items-center gap-3 pb-10">
        <button onClick={hangUp}
          className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg hover:bg-red-500 active:scale-95 transition-all">
          <PhoneOff size={28} className="text-white" />
        </button>
        <span className="text-xs text-gray-500">End call</span>
      </div>
    </div>
  )
}
