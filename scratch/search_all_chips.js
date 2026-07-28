import fs from 'fs'
import path from 'path'

function searchDir(dir) {
  const files = fs.readdirSync(dir)
  for (const f of files) {
    const full = path.join(dir, f)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      searchDir(full)
    } else if (f.endsWith('.jsx') || f.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8')
      const lines = content.split('\n')
      lines.forEach((l, idx) => {
        if (l.toLowerCase().includes('detailchip') || l.toLowerCase().includes('detail_chip') || l.toLowerCase().includes('detail chip')) {
          console.log(`FOUND IN FILE: ${full} at line ${idx + 1}: ${l}`)
        }
      })
    }
  }
}

searchDir('C:/Users/REDMI/Desktop/MyAttendence/attendx/src')
console.log('Search complete.')
