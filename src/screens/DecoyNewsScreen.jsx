import { ArrowLeft } from 'lucide-react'
import { NEWS_ARTICLE } from '../lib/data.js'

export default function DecoyNewsScreen({ onBack }) {
  const a = NEWS_ARTICLE
  return (
    <div className="bg-white text-gray-900 overflow-y-auto scroll-thin" style={{ height: '100%' }}>

      {/* Publication header */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20}/>
        </button>
        <span className="text-sm font-bold tracking-tight text-gray-800">{a.publication}</span>
        <div className="w-6"/>
      </div>

      {/* Article */}
      <div className="px-5 py-5">
        {/* Category */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-600 mb-3">
          National · Infrastructure
        </p>

        {/* Headline */}
        <h1 className="text-xl font-bold leading-snug text-gray-900 mb-3">
          {a.headline}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 pb-4 border-b border-gray-100">
          <span>By <span className="text-gray-600 font-medium">{a.author}</span></span>
          <span>·</span>
          <span>{a.date}</span>
        </div>

        {/* Lead image placeholder */}
        <div className="w-full h-44 bg-gray-100 rounded-lg mb-1 flex items-center justify-center">
          <span className="text-gray-300 text-xs">Photo: PTI</span>
        </div>
        <p className="text-[10px] text-gray-400 mb-5">A metro construction site in Bengaluru. (File photo)</p>

        {/* Body */}
        {a.body.map((para, i) => (
          <p key={i} className="text-sm text-gray-700 leading-relaxed mb-4 font-serif">
            {para}
          </p>
        ))}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-5 mt-4">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} The Indian Express Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
