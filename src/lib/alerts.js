import { getLastBreadcrumb, formatTs } from '../hooks/useSettings.js'

export function sendWhatsApp(phone, message) {
  if (!phone) { alert('Please set a trusted contact in Settings first.'); return }
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
}

export function sendSMS(phone, message) {
  if (!phone) return
  const encoded = encodeURIComponent(message)
  window.open(`sms:${phone}?body=${encoded}`, '_blank')
}

export function buildMessage(type, contactName) {
  const crumb = getLastBreadcrumb()
  const loc = crumb ? `Last logged: ${formatTs(crumb.ts)}${crumb.note ? ' – ' + crumb.note : ''}` : 'No location logged yet.'
  switch (type) {
    case 'sos':
      return `🚨 SOS from StealthSafe 🚨\nI need help immediately. ${loc}\nPlease call me or send help now.`
    case 'checkin':
      return `✅ I'm okay – StealthSafe check-in\n${loc}`
    case 'baddate':
      return `⚠️ I'm on a date and feeling uncomfortable. ${loc}\nPlease call me in the next few minutes.`
    case 'commute':
      return `⚠️ I feel unsafe on my commute. ${loc}\nPlease call me now.`
    case 'domestic':
      return `🚨 I need help at home. ${loc}\nPlease call or come immediately.`
    case 'medical':
      return `🏥 Medical emergency. ${loc}\nPlease call 112 or come now.`
    case 'shady':
      return `⚠️ I'm with someone I don't fully trust. ${loc}\nIf you don't hear from me in 2 hours please check on me.`
    case 'abduction':
      return `🚨 EMERGENCY – I may be in danger. ${loc}\nCall police immediately: 112`
    case 'deadman':
      return null // message built separately with user note
    default:
      return `⚠️ StealthSafe alert. ${loc}`
  }
}

export function openSafePlaces(type) {
  // Uses geolocation to build a Maps search URL — no API key needed
  const searches = {
    police:   'police+station',
    hospital: 'hospital',
    mall:     'shopping+mall',
    public:   'public+park+OR+bus+stand+OR+railway+station',
    pharmacy: 'pharmacy+24+hours',
  }
  const q = searches[type] || 'police+station'

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords
        window.open(
          `https://www.google.com/maps/search/${q}/@${lat},${lng},15z`,
          '_blank'
        )
      },
      () => {
        // fallback without coords
        window.open(`https://www.google.com/maps/search/${q}`, '_blank')
      },
      { timeout: 4000 }
    )
  } else {
    window.open(`https://www.google.com/maps/search/${q}`, '_blank')
  }
}
