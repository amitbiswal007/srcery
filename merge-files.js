
let fs = require('fs')
const readline = require('readline')

const FILE_EXTENSIONS = [
  '.scss',
  '.ts',
  '.tsx',
  '.html',
  '.json',
  '.mjs'
]

const EXCLUDED_FILES = [ 'jquery*', 'font-*', 'public', 'node_modules', 'package-lock.json' ]
const LINE = '  '.repeat(40)

// Create readline interface for CLI input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Function to prompt for user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

// Function to prompt for source directory
async function getSourceDirectory() {
  const sourceDir = await askQuestion('Enter source directory path: ')
  if (!sourceDir.trim()) {
    console.log('Source directory is required!')
    return getSourceDirectory()
  }
  return sourceDir.trim()
}

// Function to prompt for target file
async function getTargetFile() {
  const targetFile = await askQuestion('Enter target file path (default: ./prompt.txt): ')
  return targetFile.trim() || './prompt.txt'
}

// Recursively read all files in the source directory
// Add the file name to the beginning of the file content
// Append the file content to the target file
function readAndMerge(dir, baseDir, level, result) {
  console.log('Reading', baseDir)
  const files = fs.readdirSync(dir)
  files.forEach(file => {
    const fullPath = `${dir}/${file}`
    const stats = fs.statSync(fullPath)
    
    if (stats.isDirectory() && !file.startsWith('.') && !EXCLUDED_FILES.some(excludedFile => file.match(excludedFile))) {
      result.tree += `  ${'  '.repeat(level)} - ${file}\n`
      readAndMerge(fullPath, baseDir + '/' + file, level + 1, result)
    } else {
      if (EXCLUDED_FILES.some(excludedFile => file.match(excludedFile))) {   
        return
      }

      result.tree += `  ${'  '.repeat(level)} - ${file}\n`
      if (FILE_EXTENSIONS.some(extension => file.endsWith(extension))) {
        const content = fs.readFileSync(fullPath, 'utf8')
        result.contents += `File: ${baseDir}/${file}\n${content}\n------------------------------\n\n`
      }
    }
  })
}

// Main execution function
async function main() {
  try {
    console.log('File Merger - CLI Mode')
    console.log('=====================')
    
    const SOURCE_DIR = await getSourceDirectory()
    const TARGET_FILE = await getTargetFile()
    
    // Validate source directory exists
    if (!fs.existsSync(SOURCE_DIR)) {
      console.log(`Error: Source directory '${SOURCE_DIR}' does not exist!`)
      rl.close()
      return
    }
    
    console.log(`\nProcessing files from: ${SOURCE_DIR}`)
    console.log(`Output file: ${TARGET_FILE}`)
    console.log('Starting merge process...\n')
    
    let result = {tree: '', contents: ''} 
    readAndMerge(SOURCE_DIR, '', 0, result)

    const prompt = `
  ------------------------------------------------------------
  Here is the tree of the code:
  ${result.tree}

  ------------------------------------------------------------

  Here is the code:
  ${result.contents}

  ------------------------------------------------------------
`

    fs.writeFileSync(TARGET_FILE, prompt)
    console.log(`\n✅ Successfully merged files to: ${TARGET_FILE}`)
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    rl.close()
  }
}

// Run the main function
main()



