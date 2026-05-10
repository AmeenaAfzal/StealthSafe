import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone, Bell, MessageSquare, MapPin, Mic, Clock,
  Map, Settings, ArrowLeft, Shield, Trash2, X,
} from 'lucide-react'
import { sendWhatsApp, buildMessage, openSafePlaces } from '../lib/alerts.js'
import {
  startAlarm, stopAlarm,
  startRecording, stopRecording, shareOrDownloadAudio,
} from '../lib/audio.js'
import {
  addBreadcrumb, formatTs,
  getDMSState, setDMSState,
} from '../hooks/useSettings.js'
import { db } from '../lib/firebase.js'
import { ref, push, remove } from 'firebase/database'

export default function VaultScreen({
  onBack, onDecoy, onSettings, onFakeCall, preset, settings,
}) {
  const [alarm,      setAlarm]      = useState(false)
  const [recording,  setRecording]  = useState(false)
  const [audioBlob,  setAudioBlob]  = useState(null)
  const [audioStatus,setAudioStatus]= useState('')  // feedback after share/download
  const [crumbs,     setCrumbs]     = useState([])
  const [crumbKeys,  setCrumbKeys]  = useState({}) // ts → firebase key map
  const [noteInput,  setNoteInput]  = useState('')
  const [showCrumbs, setShowCrumbs] = useState(false)
  const [dms,        setDms]        = useState(getDMSState)
  const [dmsNote,    setDmsNote]    = useState(settings.deadManNote || '')
  const [dmsHours,   setDmsHours]   = useState(settings.deadManHours || 2)
  const [dmsLeft,    setDmsLeft]    = useState(null)
  const [showDMS,    setShowDMS]    = useState(false)
  const [showSP,     setShowSP]     = useState(false)
  const dmsInterval = useRef(null)

  // ── Load breadcrumbs ──────────────────────────────────────────────────────
  const loadCrumbs = () => {
    try { setCrumbs(JSON.parse(localStorage.getItem('ss_breadcrumbs') || '[]')) }
    catch { setCrumbs([]) }
  }
  useEffect(loadCrumbs, [])

  // ── DMS countdown ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!dms?.expiry) return
    const tick = () => {
      const left = dms.expiry - Date.now()
      if (left <= 0) {
        clearInterval(dmsInterval.current)
        setDMSState(null); setDms(null); setDmsLeft(null)
        sendWhatsApp(settings.contactPhone, `⏱ Dead Man's Switch fired.\n${dms.note || ''}`)
      } else {
        setDmsLeft(left)
      }
    }
    tick()
    dmsInterval.current = setInterval(tick, 1000)
    return () => clearInterval(dmsInterval.current)
  }, [dms])

  // ── Alarm toggle ──────────────────────────────────────────────────────────
  const toggleAlarm = () => {
    if (alarm) { stopAlarm(); setAlarm(false) }
    else        { startAlarm(); setAlarm(true) }
  }

  // ── FIX: Recording — ONLY starts on button press, never auto-starts ───────
  const toggleRecording = async () => {
    if (recording) {
      const blob = await stopRecording()
      setRecording(false)
      setAudioBlob(blob)
      setAudioStatus('')
    } else {
      const ok = await startRecording()
      if (ok) { setRecording(true); setAudioBlob(null); setAudioStatus('') }
      else     { setAudioStatus('Microphone permission denied.') }
    }
  }

  // ── FIX: Audio share with status feedback ────────────────────────────────
  const handleShareAudio = () => {
    shareOrDownloadAudio(audioBlob, (status) => {
      if (status === 'shared')     setAudioStatus('Shared successfully.')
      if (status === 'downloaded') setAudioStatus('Saved to device. Open it from your files to share via WhatsApp.')
      if (status === 'cancelled')  setAudioStatus('Share cancelled.')
    })
  }

  // ── Breadcrumb: log ───────────────────────────────────────────────────────
  const dropCrumb = async () => {
    const entry = addBreadcrumb(noteInput)
    setNoteInput('')
    loadCrumbs()
    if (settings.guardianCode) {
      try {
        const fbRef = ref(db, `guardians/${settings.guardianCode}`)
        const result = await push(fbRef, entry)
        // Store firebase key so we can delete it later
        setCrumbKeys(prev => ({ ...prev, [entry.ts]: result.key }))
      } catch {}
    }
  }

  // ── FIX: Delete individual breadcrumb (local + Firebase) ─────────────────
  const deleteCrumb = async (crumb) => {
    // Remove from localStorage
    const updated = crumbs.filter(c => c.ts !== crumb.ts)
    localStorage.setItem('ss_breadcrumbs', JSON.stringify(updated))
    setCrumbs(updated)

    // Remove from Firebase if we have the key
    if (settings.guardianCode && crumbKeys[crumb.ts]) {
      try {
        await remove(ref(db, `guardians/${settings.guardianCode}/${crumbKeys[crumb.ts]}`))
        setCrumbKeys(prev => { const n = { ...prev }; delete n[crumb.ts]; return n })
      } catch {}
    }
  }

  // ── FIX: Delete ALL breadcrumbs (local + Firebase) ────────────────────────
  const deleteAllCrumbs = async () => {
    localStorage.removeItem('ss_breadcrumbs')
    setCrumbs([])
    if (settings.guardianCode) {
      try { await remove(ref(db, `guardians/${settings.guardianCode}`)) } catch {}
    }
    setCrumbKeys({})
  }

  // ── Alert ─────────────────────────────────────────────────────────────────
  const sendAlert = () => {
    const type = preset?.alertType || 'sos'
    sendWhatsApp(settings.contactPhone, buildMessage(type, settings.contactName))
  }

  // ── DMS ───────────────────────────────────────────────────────────────────
  const startDMS = () => {
    const ms = settings.demoMode ? 10_000 : dmsHours * 3_600_000
    const state = { expiry: Date.now() + ms, note: dmsNote, hours: dmsHours }
    setDMSState(state); setDms(state)
  }
  const cancelDMS = () => {
    clearInterval(dmsInterval.current)
    setDMSState(null); setDms(null); setDmsLeft(null)
  }
  const triggerDMSNow = () => {
    cancelDMS()
    sendWhatsApp(settings.contactPhone, `⏱ Dead Man's Switch triggered manually.\n${dmsNote}`)
  }

  const fmtLeft = (ms) => {
    if (!ms || ms < 0) return '0:00'
    const s = Math.floor(ms / 1000)
    const m = Math.floor(s / 60)
    const h = Math.floor(m / 60)
    if (h > 0) return `${h}h ${m % 60}m`
    return `${m}:${String(s % 60).padStart(2, '0')}`
  }

  const toolOrder = preset?.tools || ['fakecall', 'alarm', 'alert', 'breadcrumb', 'record', 'deadman', 'safeplaces']

  // ── Tool definitions ──────────────────────────────────────────────────────
  const TOOLS = {
    fakecall: (
      <ToolCard key="fakecall" icon={<Phone size={20} />} label="Fake Call"
        color="bg-emerald-900/60 border-emerald-700/40" onClick={onFakeCall}>
        <p className="text-xs text-gray-400 mt-1">Instant or delayed incoming call</p>
      </ToolCard>
    ),

    alarm: (
      <ToolCard key="alarm" icon={<Bell size={20} />}
        label={alarm ? 'Alarm ON — tap to stop' : 'Sound Alarm'}
        color={alarm ? 'bg-red-900/80 border-red-500/60' : 'bg-red-900/40 border-red-800/40'}
        onClick={toggleAlarm}>
        <p className="text-xs text-gray-400 mt-1">Loud 1000Hz siren — audible from 10m</p>
      </ToolCard>
    ),

    alert: (
      <ToolCard key="alert" icon={<MessageSquare size={20} />} label="Alert Contact"
        color="bg-blue-900/60 border-blue-700/40" onClick={sendAlert}>
        <p className="text-xs text-gray-400 mt-1">
          → {settings.contactName || 'Not set'} via WhatsApp
        </p>
      </ToolCard>
    ),

    breadcrumb: (
      <div key="breadcrumb" className="bg-gray-900 border border-gray-700/40 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={18} className="text-amber-400" />
          <span className="text-sm font-medium text-white">Breadcrumb</span>
          <button onClick={() => setShowCrumbs(s => !s)}
            className="ml-auto text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
            {showCrumbs ? 'Hide log' : `View log (${crumbs.length})`}
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={noteInput}
            onChange={e => setNoteInput(e.target.value.slice(0, 60))}
            placeholder="Short note (optional)"
            className="flex-1 bg-gray-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none"
          />
          <button onClick={dropCrumb}
            className="bg-amber-500 text-black text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-amber-400 transition-colors">
            Log
          </button>
        </div>

        <AnimatePresence>
          {showCrumbs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden">
              <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto scroll-thin">
                {crumbs.length === 0 && (
                  <p className="text-xs text-gray-600 py-2 text-center">No entries yet.</p>
                )}
                {crumbs.map((c, i) => (
                  <div key={c.ts} className="flex items-start gap-2 text-xs text-gray-400 bg-gray-800 rounded-lg px-2.5 py-1.5">
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-500">{formatTs(c.ts)}</span>
                      {c.note && <span className="ml-2 text-gray-300">{c.note}</span>}
                    </div>
                    {/* FIX: Delete individual entry */}
                    <button onClick={() => deleteCrumb(c)}
                      className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* FIX: Delete all button */}
              {crumbs.length > 0 && (
                <button onClick={deleteAllCrumbs}
                  className="mt-2 flex items-center gap-1.5 text-[10px] text-red-500/70 hover:text-red-400 transition-colors">
                  <Trash2 size={11} /> Delete all logs
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),

    record: (
      <div key="record" className="bg-gray-900 border border-gray-700/40 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic size={18} className={recording ? 'text-red-400' : 'text-gray-400'} />
            <span className="text-sm font-medium text-white">
              {recording ? 'Recording…' : 'Audio Record'}
            </span>
          </div>
          <button onClick={toggleRecording}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
              recording
                ? 'bg-red-800/60 text-red-300 hover:bg-red-700/60'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}>
            {recording ? 'Stop' : 'Start'}
          </button>
        </div>

        {/* FIX: Status message after share/download */}
        {audioStatus && (
          <p className="mt-2 text-[11px] text-gray-400 leading-relaxed">{audioStatus}</p>
        )}

        {audioBlob && !recording && (
          <button onClick={handleShareAudio}
            className="mt-2 w-full bg-gray-800 text-xs text-blue-400 hover:text-blue-300 py-1.5 rounded-xl text-left px-3 transition-colors">
            Share / save recording →
          </button>
        )}
      </div>
    ),

    deadman: (
      <div key="deadman" className="bg-gray-900 border border-gray-700/40 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={18} className="text-orange-400" />
          <span className="text-sm font-medium text-white">Dead Man's Switch</span>
          {!dms && (
            <button onClick={() => setShowDMS(s => !s)}
              className="ml-auto text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
              {showDMS ? 'hide' : 'configure'}
            </button>
          )}
        </div>

        {dms ? (
          <div className="space-y-2">
            <p className="text-xs text-orange-400 font-mono">
              Fires in: <span className="text-2xl font-bold">{fmtLeft(dmsLeft)}</span>
            </p>
            <div className="flex gap-2">
              <button onClick={cancelDMS}
                className="flex-1 bg-gray-700 text-xs text-gray-300 py-2 rounded-xl hover:bg-gray-600 transition-colors">
                ✅ I'm safe — cancel
              </button>
              <button onClick={triggerDMSNow}
                className="flex-1 bg-red-800/70 text-xs text-red-300 py-2 rounded-xl hover:bg-red-700/70 transition-colors">
                Trigger now
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {showDMS ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2">
                <textarea
                  value={dmsNote} onChange={e => setDmsNote(e.target.value)}
                  placeholder="Write your note (person's details, destination…)"
                  rows={3}
                  className="w-full bg-gray-800 text-xs text-white placeholder-gray-600 rounded-xl px-3 py-2 outline-none resize-none"
                />
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Timer:</span>
                  <input type="range" min={1} max={12} value={dmsHours}
                    onChange={e => setDmsHours(+e.target.value)}
                    className="flex-1 accent-orange-400" />
                  <span className="text-orange-400 font-mono w-12 text-right">
                    {settings.demoMode ? '10s' : `${dmsHours}h`}
                  </span>
                </div>
                <button onClick={startDMS}
                  className="w-full bg-orange-700/60 text-orange-200 text-xs font-medium py-2 rounded-xl hover:bg-orange-600/60 transition-colors">
                  Start timer
                </button>
              </motion.div>
            ) : (
              <button onClick={() => setShowDMS(true)}
                className="w-full bg-gray-800 text-xs text-gray-400 py-2 rounded-xl hover:bg-gray-700 transition-colors">
                Configure &amp; start
              </button>
            )}
          </AnimatePresence>
        )}
      </div>
    ),

    safeplaces: (
      <div key="safeplaces" className="bg-gray-900 border border-gray-700/40 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Map size={18} className="text-teal-400" />
          <span className="text-sm font-medium text-white">Safe Places Nearby</span>
          <button onClick={() => setShowSP(s => !s)}
            className="ml-auto text-[10px] text-gray-500 hover:text-gray-300 transition-colors">
            {showSP ? 'hide' : 'open'}
          </button>
        </div>
        <AnimatePresence>
          {showSP && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden grid grid-cols-2 gap-2">
              {[
                ['police',   '🚔', 'Police Station'],
                ['hospital', '🏥', 'Hospital'],
                ['mall',     '🏬', 'Mall / Shopping'],
                ['public',   '🌳', 'Public Area'],
                ['pharmacy', '💊', '24hr Pharmacy'],
              ].map(([type, emoji, label]) => (
                <button key={type} onClick={() => openSafePlaces(type)}
                  className="bg-gray-800 hover:bg-gray-700 rounded-xl py-2.5 px-3 text-xs text-gray-300 flex items-center gap-1.5 transition-colors">
                  <span>{emoji}</span>{label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {!showSP && (
          <button onClick={() => setShowSP(true)}
            className="w-full bg-gray-800 text-xs text-gray-400 py-2 rounded-xl hover:bg-gray-700 transition-colors">
            Find safe locations →
          </button>
        )}
      </div>
    ),
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    // FIX: height:100% fills the fixed phone frame. flex-col + overflow-y-auto
    // on the tool list means the top bar + preset banner are always visible,
    // and only the tool list scrolls. Expanding dropdowns push content down
    // inside the scroll container — no content ever hides behind the frame.
    <div className="bg-gray-950 text-white flex flex-col" style={{ height: '100%' }}>

      {/* Top bar — fixed, never scrolls */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <button onClick={onBack}
          className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 text-sm">
          <ArrowLeft size={16} /> Weather
        </button>
        <div className="flex items-center gap-1">
          <Shield size={13} className="text-gray-600" />
          <span className="text-[10px] text-gray-600 uppercase tracking-widest">Vault</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onDecoy}
            className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors uppercase tracking-wider">
            Decoy
          </button>
          <button onClick={onSettings} className="text-gray-500 hover:text-gray-300 transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Preset banner — fixed, never scrolls */}
      {preset && (
        <div className={`mx-5 mb-3 bg-gradient-to-r ${preset.color} rounded-2xl px-4 py-2.5 flex items-center gap-2 flex-shrink-0`}>
          <span className="text-xl">{preset.emoji}</span>
          <p className="text-sm font-medium">{preset.label}</p>
          <span className="ml-auto text-xs opacity-70">Tools loaded</span>
        </div>
      )}

      {/* FIX: Tool list is the ONLY thing that scrolls.
          overflow-y-auto here means expanding a dropdown (safe places, log)
          pushes content down within this scroll area — you can always scroll down
          to reach buttons. Nothing is ever trapped off-screen. */}
      <div className="flex-1 overflow-y-auto scroll-thin px-5 pb-8 space-y-3">
        {toolOrder.map(id => TOOLS[id]).filter(Boolean)}
        {Object.entries(TOOLS)
          .filter(([id]) => !toolOrder.includes(id))
          .map(([, c]) => c)}
      </div>
    </div>
  )
}

function ToolCard({ icon, label, color, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`w-full ${color} border rounded-2xl p-4 text-left hover:brightness-110 active:scale-[0.98] transition-all`}>
      <div className="flex items-center gap-2 text-white">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {children}
    </button>
  )
}
