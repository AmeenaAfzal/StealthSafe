import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { PRESETS } from '../lib/data.js'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const tile = {
  hidden: { opacity: 0, scale: 0.85 },
  show:   { opacity: 1, scale: 1 },
}

export default function PresetsScreen({ onSelect, onSkip }) {
  return (
    <div className="bg-gray-950 text-white flex flex-col" style={{ height: '100%' }}>

      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">StealthSafe</p>
        <h1 className="text-xl font-light text-white">What's happening?</h1>
        <p className="text-xs text-gray-500 mt-1">Select a situation to load the right tools instantly.</p>
      </div>

      {/* Tiles grid */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 gap-3 px-5 flex-1">
        {PRESETS.map((p) => (
          <motion.button key={p.id} variants={tile}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(p)}
            className={`bg-gradient-to-br ${p.color} rounded-3xl p-5 text-left flex flex-col justify-between aspect-square shadow-lg`}>
            <span className="text-3xl">{p.emoji}</span>
            <p className="text-sm font-medium leading-tight mt-2">{p.label}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* Skip */}
      <button onClick={onSkip}
        className="flex items-center justify-center gap-1 text-gray-500 text-sm py-6 hover:text-gray-300 transition-colors">
        Skip — open all tools <ChevronRight size={14} />
      </button>
    </div>
  )
}
