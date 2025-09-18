const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const readline = require('readline');

// Utility function to ask yes/no question
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}


// Load config.json
let config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/config.json'), 'utf8'));

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

// Function to check if input is a GitHub URL
function isGitUrl(str) {
  return (str.startsWith("http://") || str.startsWith("https://")) && str.endsWith(".git");
}

//Add a new async cloneRepo function
async function cloneRepo(gitUrl) {
  const tempDir = path.join(__dirname, 'temp-repo');

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log(`Cloning repository with isomorphic-git: ${gitUrl}`);

  await git.clone({
    fs,
    http,
    dir: tempDir,
    url: gitUrl,
    singleBranch: true,
    depth: 1   
  });

  return tempDir;
}


function detectProjectType(sourceDir) {
  const files = fs.readdirSync(sourceDir);

  if (files.includes("package.json")) return "node";
  if (files.includes("requirements.txt") || files.some(f => f.endsWith(".py"))) return "python";
  if (files.includes("pom.xml") || files.some(f => f.endsWith(".java"))) return "java";
  if (files.some(f => f.endsWith(".csproj"))) return "dotnet";
  return "unknown";
}


// Main function
async function main() {
  const inputPath = process.argv[2]; // local path or GitHub URL

  if (!inputPath) {
    console.error("Please provide a source directory or GitHub repo URL");
    return;
  }

  let sourceDir = inputPath;

  if (isGitUrl(inputPath)) {
    sourceDir = await cloneRepo(inputPath);
  }

  if (!fs.existsSync(sourceDir)) {
    console.error(`Error: Source directory '${sourceDir}' does not exist!`);
    return;
  }

  // Detect project type
  const projectType = detectProjectType(sourceDir);
  console.log(`Detected project type: ${projectType}`);

  if (projectType !== "unknown") {
    const answer = await askQuestion(`We detected a ${projectType} project. Use default includes/excludes? (Y/N): `);
    if (answer === "y" || answer === "yes") {
      switch (projectType) {
        case "node":
          config.includes = [".js", ".ts", ".tsx", ".jsx", ".json", ".html", ".css"];
          config.excludes = ["node_modules", "dist", "build", "public", "package-lock.json"];
          break;
        case "python":
          config.includes = [".py", ".yml", ".ini"];
          config.excludes = ["venv", "__pycache__"];
          break;
        case "java":
          config.includes = [".java", ".xml", ".properties"];
          config.excludes = ["target", "bin"];
          break;
        case "dotnet":
          config.includes = [".cs", ".config"];
          config.excludes = ["bin", "obj"];
          break;
      }
    } else {
      console.log("Using includes/excludes from config.json instead.");
    }
  } else {
    console.log("Unknown project type → using config.json values");
  }

  console.log(`Processing files from: ${sourceDir}`);
  console.log(`Output file: ${config.outputFile}`);

  let result = { tree: '', contents: '' };
  readAndMerge(sourceDir, '', 0, result);

  const treeSection = config.showTree ? treeTpl.replace('{{tree}}', result.tree) : '';
  const finalOutput = promptTpl
    .replace('{{tree}}', treeSection)
    .replace('{{contents}}', result.contents);

  fs.writeFileSync(config.outputFile, finalOutput);
  console.log(`Successfully merged files to: ${config.outputFile}`);
}


main().catch(err => console.error("Error:", err));

