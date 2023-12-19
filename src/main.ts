import './assets/css/main.sass'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initializeApp } from 'firebase/app'
import { VueFire, VueFireAuth } from 'vuefire'
import { Quasar, setCssVar } from 'quasar'
import { firebaseConfig } from '@/firebase-config'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
// Import Quasar css
import 'quasar/src/css/index.sass'
// Setting brand colors 
setCssVar('primary', '#86d2d8')

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: {} // import Quasar plugins and add here
})
app.use(VueFire, {
  firebaseApp: initializeApp(firebaseConfig),
  modules: [VueFireAuth()]
})

app.mount('#app')
