import './assets/css/main.sass'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initializeApp } from 'firebase/app'
import { VueFire, VueFireAuth } from 'vuefire'
import { Quasar, setCssVar, Loading, Notify } from 'quasar'
import { firebaseConfig } from '@/firebase-config'

// #region Quasar
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
// Import Quasar css
import 'quasar/src/css/index.sass'
// Import lang pack
import langTW from 'quasar/lang/zh-TW'
// Setting brand colors
setCssVar('primary', '#86d2d8')
// set notify default
Notify.setDefaults({
  position: 'top',
  timeout: 2500,
  textColor: 'white'
  // actions: [{ icon: 'close', color: 'white' }]
})
// #endregion Quasar

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
  plugins: { Loading, Notify }, // import Quasar plugins and add here
  lang: langTW
})
app.use(VueFire, {
  firebaseApp: initializeApp(firebaseConfig),
  modules: [VueFireAuth()]
})

app.mount('#app')
