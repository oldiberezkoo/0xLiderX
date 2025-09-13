import { useSessionStore } from '@/entities/session/model/store'
import type { Router } from 'vue-router'

export function createAuthGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const session = useSessionStore()
    session.loadTokens()

    if (to.meta.requiresAuth && !session.isAuth) {
      return next({ name: 'home' })
    }

    next()
  })
}
