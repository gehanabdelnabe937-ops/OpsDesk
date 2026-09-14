//   import { createApp } from 'vue'
// import './style.css'
// import App from './App.vue'
// // import router from './router/index.js'
// // createApp(App).use(router).mount('#app')
// createApp(App).mount('#app')

// import { createApp } from 'vue'
// import { createPinia } from 'pinia'
// import App from './App.vue'

// const app = createApp(App)

// app.use(createPinia())

// app.mount('#app')
// import { createApp } from 'vue'
// import { createPinia } from 'pinia'
// import App from './App.vue'
// import router from './router'

// const app = createApp(App)

// app.use(createPinia())
// app.use(router)

// app.mount('#app')
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')