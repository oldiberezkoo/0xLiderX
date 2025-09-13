/**
 * Распарсить JWT токен
 */
export function parseJwt(token: string) {
  try {
    const base64 = token.split('.')[1]
    const payload = atob(base64)
    return JSON.parse(payload)
  } catch {
    return null
  }
}

/**
 * Проверить, живой ли токен
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return false

  const now = Math.floor(Date.now() / 1000) // секунды
  return payload.exp > now
}

/**
 * Сгенерировать фейковый токен для тестов
 * @param ttlSeconds время жизни токена
 */
export function createFakeJwt(ttlSeconds = 60): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + ttlSeconds,
      iat: Math.floor(Date.now() / 1000),
      userId: '123',
    }),
  )
  const signature = 'fake-signature'
  return `${header}.${payload}.${signature}`
}
