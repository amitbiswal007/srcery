const fs = require('fs');
const path = require('path');

// Load config.json
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/config.json'), 'utf8'));

// Load templates
const promptTpl = fs.readFileSync(path.join(__dirname, 'config/prompt.tpl'), 'utf8');
const treeTpl = fs.readFileSync(path.join(__dirname, 'config/tree.tpl'), 'utf8');
const codeTpl = fs.readFileSync(path.join(__dirname, 'config/code.tpl'), 'utf8');

// Recursive function to read files and build tree
function readAndMerge(dir, baseDir, level, result) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    // Skip excluded files/folders
    if (config.excludes.some(ex => file.match(ex))) {
      return;
    }

    if (stats.isDirectory()) {
      result.tree += `${'  '.repeat(level)}- ${file}\n`;
      readAndMerge(fullPath, path.join(baseDir, file), level + 1, result);
    } else {
      result.tree += `${'  '.repeat(level)}- ${file}\n`;

      // Include only files matching allowed extensions
      if (config.includes.some(ext => file.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, 'utf8');

        // Apply code.tpl template
        const fileBlock = codeTpl
          .replace('{{filename}}', path.join(baseDir, file))
          .replace('{{filecontent}}', content);

        result.contents += fileBlock + '\n';
      }
    }
  });
}

// Main function
function main() {
  const sourceDir = process.argv[2]; // pass directory as argument
  if (!sourceDir) {
    console.error("Please provide a source directory: node merge-files.js ./src");
    return;
  }

  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Source directory '${sourceDir}' does not exist!`);
    return;
  }

  console.log(`Processing files from: ${sourceDir}`);
  console.log(` Output file: ${config.outputFile}`);

  let result = { tree: '', contents: '' };
  readAndMerge(sourceDir, '', 0, result);

  // Apply tree template if enabled
  const treeSection = config.showTree ? treeTpl.replace('{{tree}}', result.tree) : '';

  // Apply prompt template
  const finalOutput = promptTpl
    .replace('{{tree}}', treeSection)
    .replace('{{contents}}', result.contents);

  // Write output
  fs.writeFileSync(config.outputFile, finalOutput);
  console.log(` Successfully merged files to: ${config.outputFile}`);
}

main();
