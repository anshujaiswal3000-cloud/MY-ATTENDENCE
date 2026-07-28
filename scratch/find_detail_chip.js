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
      if (content.includes('DetailChip')) {
        console.log('FOUND DetailChip IN FILE:', full)
        const lines = content.split('\n')
        lines.forEach((l, idx) => {
          if (l.includes('DetailChip')) {
            console.log(`Line ${idx + 1}: ${l}`)
          }
        })
      }
    }
  }
}

searchDir('C:/Users/REDMI/Desktop/MyAttendence/attendx/src')
