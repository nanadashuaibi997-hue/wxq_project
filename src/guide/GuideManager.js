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
  const el = resolveEl(step?.selector)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function getTarget() {
  const step = currentStep()
  const el = resolveEl(step?.selector)
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

export default { state, start, stop, next, prev, getTarget }
