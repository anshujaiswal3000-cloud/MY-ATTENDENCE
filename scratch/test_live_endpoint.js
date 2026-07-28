import https from 'https'

console.log('Testing live Render endpoint https://my-attendence.onrender.com/api/sync/anshu ...')

https.get('https://my-attendence.onrender.com/api/sync/anshu', (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', () => {
    try {
      const json = JSON.parse(data)
      console.log('HTTP Status Code:', res.statusCode)
      console.log('Success Flag:', json.success)
      if (json.data) {
        console.log('Subjects Count:', json.data.subjects?.length)
        console.log('History Logs Count:', json.data.history?.length)
        console.log('Active Semester:', json.data.settings?.semester)
      }
    } catch (e) {
      console.error('Response parse error:', e.message, 'Raw response:', data.substring(0, 200))
    }
  })
}).on('error', (err) => {
  console.error('HTTPS request error:', err.message)
})
