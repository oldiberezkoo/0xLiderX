import { reactive } from 'vue'

const SOCKET_URL = import.meta?.env?.VITE_SOCKET_URL ?? 'wss://echo.websocket.org'

let socket: WebSocket | null = null
let idleTimer: number | null = null
let dropTimer: number | null = null
const IDLE_TIMEOUT = 1 * 60 * 1000 // 10 минут
const DROP_TIMEOUT = 15 * 60 * 1000 // 15 секунд

interface WebSocketEvent {
  type: 'foo' | 'bar'
  [key: string]: any
}

export const state = reactive({
  connected: false,
  fooEvents: [] as WebSocketEvent[],
  barEvents: [] as WebSocketEvent[],
})

function connect() {
  try {
    if (socket) {
      socket.close()
      socket = null
    }

    socket = new WebSocket(SOCKET_URL)
    socket.addEventListener('open', () => {
      state.connected = true
      console.log('🍍 WebSocket connected')
      resetIdleTimer()
      startDropTimer()
    })

    socket.addEventListener('message', (event) => {
      try {
        let data: WebSocketEvent | string
        try {
          data = JSON.parse(event.data)
        } catch {
          data = event.data
        }

        if (typeof data === 'string' && data.startsWith('Request served by')) {
          return
        }

        if (typeof data === 'object') {
          if (data.type === 'foo') {
            state.fooEvents.push(data)
          } else if (data.type === 'bar') {
            state.barEvents.push(data)
          }

          resetIdleTimer()
          startDropTimer()
        }
      } catch (e) {
        console.error('WebSocket message handling error:', e)
      }
    })

    socket.addEventListener('close', () => {
      state.connected = false
      clearDropTimer()
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (!state.connected) {
          connect()
        }
      }, 5000)
    })

    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error)
      state.connected = false
      // Clean up the socket on error
      if (socket) {
        socket.close()
        socket = null
      }
    })
  } catch (error) {
    console.error('WebSocket connection error:', error)
    state.connected = false
  }
}

function disconnect() {
  try {
    if (socket) {
      socket.close()
      socket = null
    }
    state.connected = false
    clearIdleTimer()
    clearDropTimer()
  } catch (error) {
    console.error('WebSocket disconnect error:', error)
  }
}

function resetIdleTimer() {
  clearIdleTimer()
  idleTimer = window.setTimeout(disconnect, IDLE_TIMEOUT)
}

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer)
    idleTimer = null
  }
}

function startDropTimer() {
  clearDropTimer()
  dropTimer = window.setTimeout(disconnect, DROP_TIMEOUT)
}

function clearDropTimer() {
  if (dropTimer) {
    clearTimeout(dropTimer)
    dropTimer = null
  }
}

// Only attempt to connect if the document is visible
if (!document.hidden) {
  connect()
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !state.connected) {
    connect()
  }
})

window.addEventListener('beforeunload', disconnect)
