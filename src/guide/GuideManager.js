import { reactive } from 'vue'
import flows from './flows'

const state = reactive({ active: false, flowId: null, steps: [], index: 0, debug: false, persist: false })

function resolveEl(sel) {
  if (!sel) return null
  if (Array.isArray(sel)) {
    for (const s of sel) {
      const el = document.querySelector(s)
      if (el) return el
    }
    return null
  }
  return document.querySelector(sel)
}

function aiResolve(step) {
  if (!step) return null
  const hints = Array.isArray(step.hints) ? step.hints : []
  const baseTexts = [step.title, step.content, ...hints].filter(Boolean).map(t => String(t).toLowerCase())
  if (baseTexts.length === 0) return null
  const candidates = Array.from(document.querySelectorAll('button, a, [role="button"], [aria-label], [data-testid], [data-action], [data-guide]'))
  let best = { el: null, score: 0 }
  for (const el of candidates) {
    // visibility check
    const visible = (el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden'
    if (!visible) continue
    const label = (el.getAttribute('aria-label') || el.textContent || '').toLowerCase()
    if (!label) continue
    let score = 0
    for (const t of baseTexts) {
      if (!t) continue
      if (label.includes(t)) score += 2
    }
    // prefer data-guide explicitly
    if (el.hasAttribute('data-guide')) score += 1
    if (score > best.score) best = { el, score }
  }
  return best.el
}

function currentStep() {
  return state.steps[state.index]
}

function start(flowId, opts = {}) {
  const flow = flows[flowId]
  if (!flow) return
  state.flowId = flowId
  state.steps = flow
  state.index = 0
  state.active = true
  state.debug = !!opts.debug
  state.persist = !!opts.persist
  if (opts.resume) {
    const p = Number(localStorage.getItem(`guide:progress:${flowId}`) || 0)
    if (!Number.isNaN(p) && p >= 0 && p < state.steps.length) state.index = p
  }
  scrollIntoView()
  applyOnEnter()
}

function stop() {
  state.active = false
}

function next() {
  if (state.index < state.steps.length - 1) {
    applyOnLeave()
    state.index++
    scrollIntoView()
    applyOnEnter()
  } else {
    applyOnLeave()
    stop()
  }
}

function prev() {
  if (state.index > 0) {
    applyOnLeave()
    state.index--
    scrollIntoView()
    applyOnEnter()
  }
}

function scrollIntoView() {
  const step = currentStep()
  const primary = resolveEl(step?.selector)
  const el = primary || aiResolve(step)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function getTarget() {
  const step = currentStep()
  const primary = resolveEl(step?.selector)
  const el = primary || aiResolve(step)
  return { el, step }
}

function applyOnEnter() {
  const step = currentStep()
  if (step && typeof step.onEnter === 'function') step.onEnter()
  if (state.persist) localStorage.setItem(`guide:progress:${state.flowId}` , String(state.index))
}

function applyOnLeave() {
  const step = currentStep()
  if (step && typeof step.onLeave === 'function') step.onLeave()
  if (state.persist && state.index === state.steps.length - 1) localStorage.setItem(`guide:completed:${state.flowId}` , '1')
}

function go(i) {
  if (!state.active) return
  const n = Math.max(0, Math.min(i, state.steps.length - 1))
  if (n === state.index) return
  applyOnLeave()
  state.index = n
  scrollIntoView()
  applyOnEnter()
}

function resolve(sel) {
  return resolveEl(sel)
}

function setDebug(flag) {
  state.debug = !!flag
}

function toggleDebug() {
  state.debug = !state.debug
}

export default { state, start, stop, next, prev, getTarget, go, resolve, setDebug, toggleDebug }
