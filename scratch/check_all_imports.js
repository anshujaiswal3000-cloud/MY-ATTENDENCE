import fs from 'fs'
import path from 'path'

const muiComponents = ['Box', 'Typography', 'Button', 'Switch', 'TextField', 'MenuItem', 'Grid', 'Chip', 'Divider', 'Alert', 'Slider', 'InputAdornment', 'IconButton', 'Collapse', 'Dialog', 'DialogTitle', 'DialogContent', 'DialogActions', 'Tooltip', 'Avatar', 'LinearProgress', 'Tabs', 'Tab', 'CircularProgress', 'Snackbar', 'Slide', 'Link']

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const muiImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@mui\/material['"]/)
  if (!muiImportMatch) return

  const importedList = muiImportMatch[1].split(',').map(s => s.trim())
  
  for (const comp of muiComponents) {
    const jsxRegex = new RegExp(`<${comp}[\\s/>]`)
    if (jsxRegex.test(content) && !importedList.includes(comp)) {
      console.error(`🚨 MISSING IMPORT ERROR in ${filePath}: <${comp}> is used in JSX but not imported from @mui/material!`)
    }
  }
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f)
    if (fs.statSync(full).isDirectory()) walk(full)
    else if (f.endsWith('.jsx')) checkFile(full)
  }
}

walk('C:/Users/REDMI/Desktop/MyAttendence/attendx/src')
console.log('Import validation scan complete.')
