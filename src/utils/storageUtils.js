// Helpers for exporting/importing/backing up app data as JSON files.

export const STORAGE_KEYS = {
  subjects: 'attendx_subjects',
  history: 'attendx_history',
  settings: 'attendx_settings',
  notes: 'attendx_notes',
  themeMode: 'attendx_theme_mode',
  backup: 'attendx_backup',
}

export function collectAllData() {
  const data = {}
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const raw = window.localStorage.getItem(key)
    data[name] = raw ? JSON.parse(raw) : null
  })
  data.exportedAt = new Date().toISOString()
  return data
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function readJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result))
      } catch (err) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function applyImportedData(data) {
  ;['subjects', 'history', 'settings', 'notes'].forEach((name) => {
    if (data[name] !== undefined && data[name] !== null) {
      window.localStorage.setItem(STORAGE_KEYS[name], JSON.stringify(data[name]))
    }
  })
}
