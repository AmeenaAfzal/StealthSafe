import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../lib/firebase.js'
import { ref, onValue } from 'firebase/database'
import { formatTs } from '../hooks/useSettings.js'
import { Shield, Wifi } from 'lucide-react'

export default function GuardianView() {
  const { code }  = useParams()
  const [entries, setEntries] = useState([])
  const [live,    setLive]    = useState(false)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    if (!code) { setError(true); return }
    try {
      const dbRef = ref(db, `guardians/${code}`)
      const unsub = onValue(
        dbRef,
        (snap) => {
          setLive(true)

          // FIX: When all logs are deleted, snap.exists() returns false → show empty state
          if (!snap.exists()) { setEntries([]); return }

          const raw = snap.val()

          // FIX: Filter out null values (Firebase sets deleted children to null briefly)
          const list = Object.values(raw)
            .filter(v => v !== null && v !== undefined && v.ts)
            .sort((a, b) => b.ts - a.ts)

          setEntries(list)
        },
        () => setError(true)
      )
      return () => unsub()
    } catch {
      setError(true)
    }
  }, [code])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-teal-400" />
          <span className="text-[10px] uppercase tracking-widest text-gray-500">StealthSafe</span>
        </div>
        <h1 className="text-xl font-light text-white mb-1">Guardian View</h1>

        <div className="flex items-center gap-1.5 mb-8">
          <Wifi size={12} className={live ? 'text-green-400' : 'text-gray-600'} />
          <span className={`text-xs ${live ? 'text-green-400' : 'text-gray-600'}`}>
            {live ? 'Live' : 'Connecting…'}
          </span>
          {code && (
            <span className="text-xs text-gray-600 font-mono ml-2">#{code}</span>
          )}
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-800/40 rounded-2xl p-4 text-sm text-red-300 mb-6">
            Could not connect. Check your network or Firebase config in firebase.js.
          </div>
        )}

        {/* Empty state */}
        {entries.length === 0 && !error && live && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-sm">No breadcrumbs yet.</p>
            <p className="text-gray-700 text-xs mt-2">
              When your contact logs "I am here" in the app, it appears here instantly.
            </p>
          </div>
        )}

        {/* Entries */}
        <div className="space-y-3">
          {entries.map((e, i) => (
            <div
              key={`${e.ts}-${i}`}
              className={`bg-gray-900 border rounded-2xl px-4 py-3.5 ${
                i === 0 ? 'border-teal-700/50' : 'border-gray-800'
              }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">{formatTs(e.ts)}</span>
                {i === 0 && (
                  <span className="text-[10px] text-teal-400 uppercase tracking-wider">Latest</span>
                )}
              </div>
              {e.note
                ? <p className="text-sm text-white">{e.note}</p>
                : <p className="text-sm text-gray-500 italic">No note</p>
              }
            </div>
          ))}
        </div>

        <p className="text-[10px] text-gray-700 text-center mt-10">
          Read-only · Code <span className="font-mono">{code}</span>
        </p>
      </div>
    </div>
  )
}
