import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import PhoneFrame      from './components/PhoneFrame.jsx'
import OnboardingTour  from './components/OnboardingTour.jsx'
import WeatherScreen   from './screens/WeatherScreen.jsx'
import PresetsScreen   from './screens/PresetsScreen.jsx'
import VaultScreen     from './screens/VaultScreen.jsx'
import FakeCallScreen  from './screens/FakeCallScreen.jsx'
import DecoyNewsScreen from './screens/DecoyNewsScreen.jsx'
import SettingsScreen  from './screens/SettingsScreen.jsx'
import GuardianView    from './screens/GuardianView.jsx'
import { useSettings } from './hooks/useSettings.js'

// ── Page transition wrapper ───────────────────────────────────────────────
const slide = {
  initial:  { opacity: 0, x: 30 },
  animate:  { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:     { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

function Slide({ children }) {
  return (
    <motion.div variants={slide} initial="initial" animate="animate" exit="exit"
      style={{ position: 'absolute', inset: 0 }}>
      {children}
    </motion.div>
  )
}

// ── View names ─────────────────────────────────────────────────────────────
// weather | presets | vault | fakecall | decoy | settings
function MainApp() {
  const [settings, setSettings]   = useSettings()
  const [view,     setView]       = useState('weather')
  const [preset,   setPreset]     = useState(null)
  const [showTour, setShowTour]   = useState(false)

  // Show onboarding on first visit
  useEffect(() => {
    if (!settings.onboardingDone) {
      const t = setTimeout(() => setShowTour(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  const doneTour = () => {
    setShowTour(false)
    setSettings(s => ({ ...s, onboardingDone: true }))
  }

  const unlock = () => setView('presets')

  const selectPreset = (p) => { setPreset(p); setView('vault') }
  const skipPreset   = ()  => { setPreset(null); setView('vault') }

  const goWeather  = () => { setView('weather'); setPreset(null) }
  const goSettings = () => setView('settings')
  const goDecoy    = () => setView('decoy')
  const goFakeCall = () => setView('fakecall')

  return (
    <PhoneFrame>
      <div className="relative overflow-hidden" style={{ minHeight: 780 }}>
        <AnimatePresence mode="wait">
          {view === 'weather' && (
            <Slide key="weather">
              <WeatherScreen onUnlock={unlock} settings={settings}/>
            </Slide>
          )}
          {view === 'presets' && (
            <Slide key="presets">
              <PresetsScreen onSelect={selectPreset} onSkip={skipPreset}/>
            </Slide>
          )}
          {view === 'vault' && (
            <Slide key="vault">
              <VaultScreen
                preset={preset}
                settings={settings}
                onBack={goWeather}
                onDecoy={goDecoy}
                onSettings={goSettings}
                onFakeCall={goFakeCall}
              />
            </Slide>
          )}
          {view === 'fakecall' && (
            <Slide key="fakecall">
              <FakeCallScreen settings={settings} onEnd={() => setView('vault')}/>
            </Slide>
          )}
          {view === 'decoy' && (
            <Slide key="decoy">
              <DecoyNewsScreen onBack={goWeather}/>
            </Slide>
          )}
          {view === 'settings' && (
            <Slide key="settings">
              <SettingsScreen
                settings={settings}
                setSettings={setSettings}
                onBack={() => setView('vault')}
                onRestartTour={() => { setView('weather'); setShowTour(true) }}
              />
            </Slide>
          )}
        </AnimatePresence>

        {/* Onboarding tour overlay */}
        <AnimatePresence>
          {showTour && <OnboardingTour onDone={doneTour}/>}
        </AnimatePresence>
      </div>
    </PhoneFrame>
  )
}

// ── Root with router ──────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/watch/:code" element={<GuardianView/>}/>
      <Route path="*"            element={<MainApp/>}/>
    </Routes>
  )
}
