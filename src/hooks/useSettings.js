import { useState, useEffect } from 'react'

const DEFAULTS = {
  contactName: 'Mum',
  contactPhone: '',        // e.g. "919876543210" (country code + number, no +)
  callerName: 'Mum',
  guardianCode: '',
  demoMode: false,
  safewords: [
    { word: '', action: 'checkin' },   // action: checkin | sos | deadman
    { word: '', action: 'sos' },
    { word: '', action: 'deadman' },
  ],
  onboardingDone: false,
  deadManNote: '',
  deadManHours: 2,
}

export function useSettings() {
  const [settings, setSettingsState] = useState(() => {
    try {
      const stored = localStorage.getItem('ss_settings')
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS
    } catch { return DEFAULTS }
  })

  const setSettings = (updater) => {
    setSettingsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      localStorage.setItem('ss_settings', JSON.stringify(next))
      return next
    })
  }

  return [settings, setSettings]
}

// ── Breadcrumb log ─────────────────────────────────────────────────────────
export function getBreadcrumbs() {
  try { return JSON.parse(localStorage.getItem('ss_breadcrumbs') || '[]') }
  catch { return [] }
}

export function addBreadcrumb(note = '') {
  const entry = { ts: Date.now(), note: note.trim().slice(0, 60) }
  const crumbs = [entry, ...getBreadcrumbs()].slice(0, 50)
  localStorage.setItem('ss_breadcrumbs', JSON.stringify(crumbs))
  return entry
}

export function getLastBreadcrumb() {
  const crumbs = getBreadcrumbs()
  if (!crumbs.length) return null
  return crumbs[0]
}

export function formatTs(ts) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Dead man's switch ───────────────────────────────────────────────────────
export function getDMSState() {
  try { return JSON.parse(localStorage.getItem('ss_dms') || 'null') }
  catch { return null }
}

export function setDMSState(state) {
  if (state === null) localStorage.removeItem('ss_dms')
  else localStorage.setItem('ss_dms', JSON.stringify(state))
}

// ── Guardian code generation ────────────────────────────────────────────────
export function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
