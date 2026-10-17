import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Поиск файлов фикстур, чтобы не зависить от места запуска бека
export function getDataFilePath(fileName: string): string {
  const candidates = [
    path.resolve(__dirname, '../../data', fileName),
    path.resolve(__dirname, '../data', fileName),
    path.resolve(process.cwd(), 'backend/data', fileName),
    path.resolve(process.cwd(), 'data', fileName),
  ]

  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }

  throw new Error(`Файл ${fileName} не найден среди путей: ${candidates.join(', ')}`)
}


export function readJsonFixture<T>(fileName: string): T {
  const filePath = getDataFilePath(fileName)
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content) as T
}
