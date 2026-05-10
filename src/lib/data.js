export const CITY = 'Kochi'
export const TEMP = 31
export const CONDITION = 'Partly Cloudy'
export const FEELS_LIKE = 34
export const HUMIDITY = 78
export const WIND_KMH = 14
export const UV_INDEX = 7
export const VISIBILITY_KM = 8

export const HOURLY = [
  { time: '6AM',  temp: 27 }, { time: '8AM',  temp: 28 },
  { time: '10AM', temp: 30 }, { time: '12PM', temp: 33 },
  { time: '2PM',  temp: 35 }, { time: '4PM',  temp: 34 },
  { time: '6PM',  temp: 31 }, { time: '8PM',  temp: 29 },
  { time: '10PM', temp: 27 },
]

export const WEEK = [
  { day: 'Mon', icon: '☀️', hi: 33, lo: 26 },
  { day: 'Tue', icon: '⛅', hi: 30, lo: 25 },
  { day: 'Wed', icon: '🌧️', hi: 28, lo: 24 },
  { day: 'Thu', icon: '☀️', hi: 34, lo: 27 },
  { day: 'Fri', icon: '⛅', hi: 31, lo: 25 },
  { day: 'Sat', icon: '☀️', hi: 35, lo: 28 },
  { day: 'Sun', icon: '☀️', hi: 36, lo: 29 },
]

export const PRESETS = [
  {
    id: 'baddate',
    label: 'Bad Date',
    emoji: '💔',
    color: 'from-rose-500 to-pink-600',
    alertType: 'baddate',
    tools: ['fakecall', 'alert', 'breadcrumb', 'deadman'],
  },
  {
    id: 'commute',
    label: 'Unsafe Commute',
    emoji: '🚶',
    color: 'from-orange-500 to-red-500',
    alertType: 'commute',
    tools: ['alarm', 'alert', 'safeplaces', 'breadcrumb'],
  },
  {
    id: 'domestic',
    label: 'Domestic Situation',
    emoji: '🏠',
    color: 'from-purple-600 to-indigo-600',
    alertType: 'domestic',
    tools: ['record', 'alert', 'decoy', 'breadcrumb'],
  },
  {
    id: 'medical',
    label: 'Medical Emergency',
    emoji: '🏥',
    color: 'from-emerald-500 to-teal-600',
    alertType: 'medical',
    tools: ['alert', 'safeplaces', 'fakecall', 'breadcrumb'],
  },
  {
    id: 'shady',
    label: 'Shady Outing',
    emoji: '👤',
    color: 'from-slate-600 to-gray-700',
    alertType: 'shady',
    tools: ['deadman', 'breadcrumb', 'record', 'alert'],
  },
  {
    id: 'abduction',
    label: 'Abduction Threat',
    emoji: '🚨',
    color: 'from-red-600 to-red-800',
    alertType: 'abduction',
    tools: ['alarm', 'alert', 'breadcrumb', 'safeplaces'],
  },
]

export const NEWS_ARTICLE = {
  publication: 'The Indian Express',
  date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
  headline: "India's infrastructure push continues as new metro corridors set for 2025 launch",
  author: 'Priya Nair',
  body: [
    `The Union Ministry of Housing and Urban Affairs on Thursday confirmed the operationalisation of three new metro corridors across Bengaluru, Pune, and Hyderabad, marking a significant milestone in the government's urban mobility mission. The corridors, spanning a combined length of 47 kilometres, are expected to benefit over 2.3 million daily commuters.`,
    `Officials at the ministry said the projects had been fast-tracked following the completion of final civil works and procurement of rolling stock from domestic manufacturers. "The corridors are ready. We are completing the last round of safety inspections before the public launch," said a senior official who asked not to be named. Trial runs on the Bengaluru corridor were completed last month and drew positive feedback from residents.`,
    `Urban planners have highlighted the broader economic impact of expanding rapid transit in Tier-1 cities. A report by the National Institute of Urban Affairs noted that every rupee invested in mass transit generates approximately 3.8 rupees in economic activity over a ten-year period. With ridership on existing metro networks recovering strongly in 2024, transport authorities are optimistic about utilisation rates on the new lines.`,
  ],
}
