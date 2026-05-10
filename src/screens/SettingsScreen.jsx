import { useState } from 'react'
import { ArrowLeft, RefreshCw, Copy, Check } from 'lucide-react'
import { generateCode } from '../hooks/useSettings.js'

const ACTION_LABELS = { checkin: '✅ Check-in', sos: '🚨 SOS Alert', deadman: '⏱ Dead Man\'s Switch' }

export default function SettingsScreen({ settings, setSettings, onBack, onRestartTour }) {
  const [copied, setCopied] = useState(false)

  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }))
  const updateSW = (i, field, val) => setSettings(s => {
    const sw = [...s.safewords]
    sw[i] = { ...sw[i], [field]: val }
    return { ...s, safewords: sw }
  })
  const newCode = () => update('guardianCode', generateCode())
  const copyCode = () => {
    navigator.clipboard?.writeText(
      `${window.location.origin}/watch/${settings.guardianCode}`
    ).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className="bg-gray-950 text-white overflow-y-auto scroll-thin" style={{ height: '100%' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4 border-b border-gray-800">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-300">
          <ArrowLeft size={18}/>
        </button>
        <h2 className="text-base font-medium">Settings</h2>
      </div>

      <div className="px-5 py-4 space-y-6 pb-10">

        {/* Trusted contact */}
        <section>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Trusted Contact</p>
          <div className="space-y-2">
            <input
              value={settings.contactName}
              onChange={e => update('contactName', e.target.value)}
              placeholder="Name (e.g. Mum)"
              className="w-full bg-gray-800 text-sm text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none"
            />
            <input
              value={settings.contactPhone}
              onChange={e => update('contactPhone', e.target.value.replace(/\D/g,''))}
              placeholder="Phone with country code e.g. 919876543210"
              type="tel"
              className="w-full bg-gray-800 text-sm text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none font-mono"
            />
            <p className="text-[10px] text-gray-600">Include country code, no + or spaces. India: 91XXXXXXXXXX</p>
          </div>
        </section>

        {/* Fake caller name */}
        <section>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Fake Caller Name</p>
          <input
            value={settings.callerName}
            onChange={e => update('callerName', e.target.value)}
            placeholder="e.g. Mum"
            className="w-full bg-gray-800 text-sm text-white placeholder-gray-600 rounded-xl px-4 py-3 outline-none"
          />
        </section>

        {/* Safewords */}
        <section>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Safewords</p>
          <p className="text-[10px] text-gray-600 mb-3">Type into the weather search bar + press Enter to trigger.</p>
          {settings.safewords.map((sw, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input
                value={sw.word}
                onChange={e => updateSW(i, 'word', e.target.value)}
                placeholder={['Word 1', 'Word 2', 'Word 3'][i]}
                className="flex-1 bg-gray-800 text-sm text-white placeholder-gray-600 rounded-xl px-3 py-2.5 outline-none font-mono"
              />
              <select
                value={sw.action}
                onChange={e => updateSW(i, 'action', e.target.value)}
                className="bg-gray-800 text-xs text-gray-300 rounded-xl px-2 py-2.5 outline-none">
                <option value="checkin">Check-in</option>
                <option value="sos">SOS Alert</option>
                <option value="deadman">Dead Man's</option>
              </select>
            </div>
          ))}
        </section>

        {/* Guardian view */}
        <section>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Guardian View</p>
          <p className="text-[10px] text-gray-600 mb-3">
            Share this link with a trusted person. They see your breadcrumb log live, silently.
          </p>
          {settings.guardianCode ? (
            <div className="bg-gray-800 rounded-xl px-4 py-3 space-y-2">
              <p className="font-mono text-sm text-teal-400">{settings.guardianCode}</p>
              <p className="text-[10px] text-gray-600 break-all">
                {window.location.origin}/watch/{settings.guardianCode}
              </p>
              <div className="flex gap-2">
                <button onClick={copyCode}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors">
                  {copied ? <Check size={12} className="text-green-400"/> : <Copy size={12}/>}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
                <button onClick={newCode} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 ml-4 transition-colors">
                  <RefreshCw size={12}/> New code
                </button>
              </div>
            </div>
          ) : (
            <button onClick={newCode}
              className="w-full bg-gray-800 text-sm text-teal-400 py-3 rounded-xl hover:bg-gray-700 transition-colors">
              Generate Guardian code
            </button>
          )}
        </section>

        {/* Demo mode */}
        <section>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Demo Mode</p>
          <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm text-white">Demo mode</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Dead man's switch uses 10-second timer for presentations</p>
            </div>
            <button onClick={() => update('demoMode', !settings.demoMode)}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.demoMode ? 'bg-orange-500' : 'bg-gray-600'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.demoMode ? 'translate-x-5' : 'translate-x-0.5'}`}/>
            </button>
          </div>
        </section>

        {/* Onboarding restart */}
        <section>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">Help</p>
          <button onClick={onRestartTour}
            className="w-full bg-gray-800 text-sm text-gray-300 py-3 rounded-xl hover:bg-gray-700 transition-colors">
            Restart onboarding tour
          </button>
        </section>

      </div>
    </div>
  )
}
