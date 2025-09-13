import { defineStore } from 'pinia'
import { createFakeJwt, isTokenValid } from '../lib/jwt'

export const useSessionStore = defineStore('session', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
  }),

  getters: {
    isAuth: (state) => !!state.accessToken && isTokenValid(state.accessToken),
  },

  actions: {
    loginFake() {
      this.accessToken = createFakeJwt(30) // 30 сек жизни
      this.refreshToken = 'fake-refresh'
      localStorage.setItem('accessToken', this.accessToken)
      localStorage.setItem('refreshToken', this.refreshToken)
    },

    loadTokens() {
      this.accessToken = localStorage.getItem('accessToken')
      this.refreshToken = localStorage.getItem('refreshToken')
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },
  },
})
