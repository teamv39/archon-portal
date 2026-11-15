const BASE_URL = process.env.BFF_URL || 'http://localhost:5000'

const endpoints = [
  { path: '/api/services', name: 'Каталог сервисов' },
  { path: '/api/services/order-service', name: 'Паспорт сервиса (order-service)' },
  { path: '/api/findings', name: 'Инбокс находок' },
  { path: '/api/diagrams/c4', name: 'C4 диаграмма' },
]

async function runSmokeTests() {
  console.log(`Запуск smoke-тестирования BFF: ${BASE_URL}\n`)
  let failed = false
  let cookieHeader = ''

  try {
    // Для прогона основных эндпонтов нужна авторизация, пока что через хардкодный админ-профиль
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' }),
    })

    if (loginRes.status === 200) {
      console.log('[200 OK] Авторизация (/api/auth/login)')
      const rawCookie = loginRes.headers.get('set-cookie')
      if (rawCookie) {
        cookieHeader = rawCookie.split(';')[0]
      }
    } else {
      console.error(`<X> [${loginRes.status}] Ошибка авторизации (/api/auth/login)`)
      failed = true
    }
  } catch (err) {
    console.error(`<X> [Сбой соединения] Авторизация (/api/auth/login): ${err.message}`)
    console.error(`\nПроверьте, запущен ли сервер BFF на ${BASE_URL} (npm start или npm run dev)`)
    process.exit(1)
  }

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${BASE_URL}${ep.path}`, {
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
      })

      if (res.status === 200) {
        const data = await res.json()
        const countInfo = Array.isArray(data) ? ` (${data.length} записей)` : ''
        console.log(`[200 OK] ${ep.name} -> ${ep.path}${countInfo}`)
      } else {
        console.error(`<X> [${res.status}] ${ep.name} -> ${ep.path}`)
        failed = true
      }
    } catch (err) {
      console.error(`<X> [Сбой] ${ep.name} -> ${ep.path}: ${err.message}`)
      failed = true
    }
  }

  if (failed) {
    console.error('\n<X> Smoke-тестирование завершилось с ошибками!')
    process.exit(1)
  } else {
    console.log('\n>> Все ключевые эндпоинты успешно ответили 200 OK!')
  }
}

runSmokeTests()
