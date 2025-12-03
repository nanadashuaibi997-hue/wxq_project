import GuideOverlay from './GuideOverlay.vue'
import Guide from './GuideManager'

export default {
  install(app) {
    app.component('GuideOverlay', GuideOverlay)
    app.config.globalProperties.$guide = Guide
  },
}
