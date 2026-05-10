import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const STEPS = [
  {
    title: 'Your secret unlock',
    body: 'This looks like a regular weather app. Tap the ☀️ Sun, then the ☁️ Cloud icon within 1.5 seconds to open your safety vault.',
    hint: 'Try it after this tour ends.',
    position: 'bottom',
  },
  {
    title: 'Choose your situation',
    body: 'Inside the vault, tap a preset tile that matches what\'s happening. It instantly loads the right tools and pre-writes your alert message.',
    hint: '6 presets cover the most common danger situations.',
    position: 'center',
  },
  {
    title: 'Alert your trusted contact',
    body: 'One tap sends a pre-written WhatsApp message to your trusted contact. Set their number in Settings first.',
    hint: 'Set your contact in Settings → Trusted Contact.',
    position: 'center',
  },
  {
    title: 'Leave a breadcrumb trail',
    body: 'Tap "Log" to timestamp your location. Add a short note. Your guardian sees this update live on their device — silently, no notification.',
    hint: 'Share your Guardian View link from Settings.',
    position: 'center',
  },
  {
    title: 'Silent SOS — your secret gesture',
    body: 'From the weather screen: tap ☁️ Cloud → ☀️ Sun → ☁️ Cloud within 2.5 seconds. This fires an SOS to your contact without opening the vault.',
    hint: 'The screen never changes. No one sees you do it.',
    position: 'center',
  },
]

export default function OnboardingTour({ onDone }) {
  const [step, setStep] = useState(0)
  const s = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex flex-col items-center justify-end pb-10"
        style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(2px)' }}>

        {/* Skip */}
        <button onClick={onDone}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-300 transition-colors">
          <X size={20}/>
        </button>

        {/* Step counter dots */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-white' : 'w-1.5 bg-gray-600'}`}/>
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gray-900 border border-gray-700 rounded-3xl mx-5 p-6 w-full max-w-[340px]">

          <p className="text-[10px] uppercase tracking-widest text-teal-400 mb-2">
            Step {step + 1} of {STEPS.length}
          </p>
          <h3 className="text-base font-medium text-white mb-2">{s.title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">{s.body}</p>
          <p className="text-xs text-gray-600 italic">{s.hint}</p>

          <div className="flex gap-3 mt-5">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="flex-1 bg-gray-800 text-sm text-gray-400 py-3 rounded-xl hover:bg-gray-700 transition-colors">
                Back
              </button>
            )}
            <button onClick={() => isLast ? onDone() : setStep(s => s + 1)}
              className="flex-1 bg-teal-600 text-white text-sm font-medium py-3 rounded-xl hover:bg-teal-500 transition-colors">
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
