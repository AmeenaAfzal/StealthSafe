// ── Alarm (Web Audio API) ─────────────────────────────────────────────────
let alarmCtx  = null
let alarmNode = null
let gainNode  = null

export function startAlarm() {
  if (alarmNode) return
  try {
    alarmCtx  = new (window.AudioContext || window.webkitAudioContext)()
    gainNode  = alarmCtx.createGain()
    alarmNode = alarmCtx.createOscillator()
    alarmNode.type = 'square'
    alarmNode.frequency.setValueAtTime(1000, alarmCtx.currentTime)
    gainNode.gain.setValueAtTime(1, alarmCtx.currentTime)
    alarmNode.connect(gainNode)
    gainNode.connect(alarmCtx.destination)
    alarmNode.start()
  } catch (e) { console.error('Alarm error', e) }
}

export function stopAlarm() {
  try {
    if (alarmNode) {
      alarmNode.stop()
      alarmNode.disconnect()
      alarmNode = null
    }
    if (gainNode)  { gainNode.disconnect();  gainNode = null }
    if (alarmCtx)  { alarmCtx.close();       alarmCtx = null }
  } catch {}
}

export function isAlarmRunning() { return alarmNode !== null }

// ── Recorder (MediaRecorder API) ─────────────────────────────────────────
let mediaRecorder   = null
let recordedChunks  = []
let recordingStream = null

// Pick the best supported MIME type for widest compatibility + sharing
function getBestMimeType() {
  const types = [
    'audio/mp4',       // Safari, iOS — WhatsApp compatible
    'audio/ogg;codecs=opus', // Firefox
    'audio/webm;codecs=opus',
    'audio/webm',
  ]
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return ''  // browser default
}

export async function startRecording() {
  try {
    recordedChunks  = []
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType  = getBestMimeType()
    const options   = mimeType ? { mimeType } : {}
    mediaRecorder   = new MediaRecorder(recordingStream, options)
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data)
    }
    mediaRecorder.start(1000)
    return true
  } catch (e) {
    console.error('Recording error', e)
    return false
  }
}

export function stopRecording() {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') { resolve(null); return }
    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || 'audio/webm'
      const blob = new Blob(recordedChunks, { type: mimeType })
      recordedChunks = []
      if (recordingStream) {
        recordingStream.getTracks().forEach(t => t.stop())
        recordingStream = null
      }
      resolve(blob)
    }
    mediaRecorder.stop()
  })
}

export function isRecording() {
  return !!(mediaRecorder && mediaRecorder.state === 'recording')
}

// ── FIX: Audio sharing — WhatsApp can't receive webm files.
// Strategy:
//   1. On mobile: try Web Share API with the file (works if WhatsApp supports the format)
//   2. If share fails or not available: download the file to device, then user can manually share
//   3. Show a clear instruction so user knows what to do
export async function shareOrDownloadAudio(blob, onStatus) {
  if (!blob) return

  const mimeType = blob.type || 'audio/webm'
  // Determine extension from mime
  const ext = mimeType.includes('mp4') ? 'm4a'
            : mimeType.includes('ogg') ? 'ogg'
            : 'webm'

  const filename = `recording-${Date.now()}.${ext}`
  const file = new File([blob], filename, { type: mimeType })

  // Try Web Share API first (mobile Chrome/Safari with WhatsApp installed)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'StealthSafe Recording' })
      onStatus?.('shared')
      return
    } catch (err) {
      // User cancelled or share failed — fall through to download
      if (err.name === 'AbortError') { onStatus?.('cancelled'); return }
    }
  }

  // Fallback: download to device, then user shares manually
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 3000)
  onStatus?.('downloaded')
}
