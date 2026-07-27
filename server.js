import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

const distPath = path.join(__dirname, 'dist')

// Serve compiled static assets from dist
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))
}

// SPA fallback: render index.html for any request
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(200).send('<!DOCTYPE html><html><head><title>AttendX</title></head><body style="background:#070b13;color:#fff;font-family:sans-serif;display:grid;place-items:center;height:100vh;"><div><h2>AttendX App Initializing...</h2><p>Please refresh the page in 5 seconds.</p></div></body></html>')
  }
})

app.listen(PORT, () => {
  console.log(`AttendX server running on port ${PORT}`)
})
