import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
/* pages */
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
/* vuefire */
import { useCurrentUser, getCurrentUser } from 'vuefire'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/signin',
      name: 'signin',
      component: LoginView,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/signup',
      name: 'signup',
      component: LoginView,
      meta: {
        requiresAuth: false
      }
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

router.beforeEach(async (to, from) => {
  console.log('router from', from, ' \nto', to)

  if (to.meta.requiresAuth) {
    const currentUser = await getCurrentUser()
    // console.log('currentUser', currentUser)
    if (!currentUser) {
      return {
        path: '/signin',
        query: {
          // we keep the current path in the query so we can
          // redirect to it after login with
          // `router.push(route.query.redirect || '/')`
          redirect: to.fullPath
        }
      }
    }
  }
})

export default router
