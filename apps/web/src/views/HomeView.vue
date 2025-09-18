<template>

  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4"
  >
    <div class="w-full max-w-md">
      <!-- Header -->

      <!-- Card -->
      <div class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <!-- Tabs -->
        <div class="flex border-b border-slate-200">
          <button
            @click="activeTab = 'login'"
            :class="[
              'flex-1 py-4 px-6 text-sm font-medium transition-all duration-200',
              activeTab === 'login'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            ]"
          >
            Авторизация
          </button>
          <button
            @click="activeTab = 'register'"
            :class="[
              'flex-1 py-4 px-6 text-sm font-medium transition-all duration-200',
              activeTab === 'register'
                ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
            ]"
          >
            Регистрация
          </button>
        </div>

        <!-- Form Content -->
        <div class="p-6">
          <!-- Login Form -->
          <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-2">
              <label for="login-email" class="text-sm font-medium text-slate-700"> Email </label>
              <input
                id="login-email"
                v-model="loginForm.email"
                type="email"
                name="email"
                autocomplete="email"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent',
                  loginErrors.email
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400',
                ]"
                placeholder="your@email.com"
              />
              <p v-if="loginErrors.email" class="text-xs text-red-600">
                {{ loginErrors.email }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="login-password" class="text-sm font-medium text-slate-700">
                Пароль
              </label>
              <input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                name="password"
                autocomplete="password"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent',
                  loginErrors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400',
                ]"
                placeholder="••••••••"
              />
              <p v-if="loginErrors.password" class="text-xs text-red-600">
                {{ loginErrors.password }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="loginLoading"
              class="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span v-if="loginLoading" class="flex items-center justify-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Вход...
              </span>
              <span v-else>Войти</span>
            </button>
          </form>

          <!-- Register Form -->
          <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-4">
            <div class="space-y-2">
              <label for="register-name" class="text-sm font-medium text-slate-700"> Имя </label>
              <input
                id="register-name"
                v-model="registerForm.name"
                type="text"
                name="name"
                autocomplete="name"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent',
                  registerErrors.name
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400',
                ]"
                placeholder="Ваше имя"
              />
              <p v-if="registerErrors.name" class="text-xs text-red-600">
                {{ registerErrors.name }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="register-email" class="text-sm font-medium text-slate-700"> Email </label>
              <input
                id="register-email"
                v-model="registerForm.email"
                type="email"
                name="email"
                autocomplete="email"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent',
                  registerErrors.email
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400',
                ]"
                placeholder="your@email.com"
              />
              <p v-if="registerErrors.email" class="text-xs text-red-600">
                {{ registerErrors.email }}
              </p>
            </div>

            <div class="space-y-2">
              <label for="register-password" class="text-sm font-medium text-slate-700">
                Пароль
              </label>
              <input
                id="register-password"
                v-model="registerForm.password"
                type="password"
                required
                :class="[
                  'w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent',
                  registerErrors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-300 hover:border-slate-400',
                ]"
                placeholder="••••••••"
              />
              <p v-if="registerErrors.password" class="text-xs text-red-600">
                {{ registerErrors.password }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="registerLoading"
              class="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span v-if="registerLoading" class="flex items-center justify-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Регистрация...
              </span>
              <span v-else>Зарегистрироваться</span>
            </button>
          </form>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div
        v-if="message"
        :class="[
          'mt-4 p-4 rounded-lg text-sm',
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200',
        ]"
      >
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, markRaw, shallowRef } from 'vue'
import { useSessionStore } from '@/entities/session/model/store'
import { useRouter } from 'vue-router'

const router = useRouter()
const sessionStore = useSessionStore()

const activeTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)
const message = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  name: '',
  email: '',
  password: '',
})

const loginErrors = reactive({
  email: '',
  password: '',
})

const registerErrors = reactive({
  name: '',
  email: '',
  password: '',
})

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const clearErrors = (form: 'login' | 'register') => {
  if (form === 'login') {
    loginErrors.email = ''
    loginErrors.password = ''
  } else {
    registerErrors.name = ''
    registerErrors.email = ''
    registerErrors.password = ''
  }
}

const handleLogin = async () => {
  clearErrors('login')

  if (!validateEmail(loginForm.email)) {
    loginErrors.email = 'Введите корректный email'
    return
  }

  if (loginForm.password.length < 6) {
    loginErrors.password = 'Пароль должен содержать минимум 6 символов'
    return
  }

  loginLoading.value = true
  try {
    // вместо setTimeout → используем стор
    sessionStore.loginFake()

    message.value = {
      type: 'success',
      text: 'Успешный вход!',
    }
    router.push('/about')

    loginForm.email = ''
    loginForm.password = ''
  } catch (error) {
    message.value = {
      type: 'error',
      text: 'Ошибка входа. Проверьте данные.',
    }
  } finally {
    loginLoading.value = false
    setTimeout(() => (message.value = null), 3000)
  }
}

const handleRegister = async () => {
  clearErrors('register')

  if (registerForm.name.length < 2) {
    registerErrors.name = 'Имя должно содержать минимум 2 символа'
    return
  }
  if (!validateEmail(registerForm.email)) {
    registerErrors.email = 'Введите корректный email'
    return
  }
  if (registerForm.password.length < 6) {
    registerErrors.password = 'Пароль должен содержать минимум 6 символов'
    return
  }

  registerLoading.value = true
  try {
    // тут регистрация пока фейковая
    await new Promise((resolve) => setTimeout(resolve, 1000))

    message.value = {
      type: 'success',
      text: 'Регистрация прошла успешно!',
    }

    registerForm.name = ''
    registerForm.email = ''
    registerForm.password = ''

    setTimeout(() => {
      activeTab.value = 'login'
    }, 1500)
  } catch (error) {
    message.value = {
      type: 'error',
      text: 'Ошибка регистрации. Попробуйте снова.',
    }
  } finally {
    registerLoading.value = false
    setTimeout(() => (message.value = null), 3000)
  }
}

onMounted(() => {
  sessionStore.loadTokens()
})
</script>
