# **Srcery** ✨

[**Note**: This README was generated using a prompt created by Srcery in Gemini!]

Srcery is a command-line tool designed to **flatten source code** into a single, comprehensive text file. This is particularly useful for preparing a codebase for analysis by a **Large Language Model (LLM)**, as it consolidates all relevant files into a structured, readable format.

-----

## **Features** 🚀

  * **File Consolidation**: Merges multiple source code files into a single output file.
  * **Project Analysis**: Can analyze a project's source code and provide an overview, create a feature list, or generate a README.md.
  * **Customizable**: Supports custom file inclusions and exclusions through `config.json` to tailor the output to your needs.
  * **GitHub Integration**: Can clone and process a GitHub repository directly from a URL.
  * **Project Type Detection**: Automatically detects common project types (Node.js, Python, Java, .NET) and applies relevant default settings for file inclusion and exclusion.
  * **Structured Output**: Generates a file tree and includes the content of each file with clear delimiters, making the final output easy to navigate.

-----

## **Installation** 💻

To install and run this project, you'll need **Node.js** and **npm** (Node Package Manager) installed on your system.

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/rmadhuram/srcery.git
    cd srcery
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

-----

## **Usage** 💡

To use Srcery, run the `merge-files.js` script from the command line, providing a local directory path or a GitHub repository URL as an argument.

### **Examples**

1.  **Process a local directory**:

    ```bash
    node merge-files.js /path/to/your/project
    ```

    This command will scan the specified local directory and process the files based on the `config.json` settings or detected project type defaults.

2.  **Process a GitHub repository**:

    ```bash
    node merge-files.js https://github.com/your-username/your-repo.git
    ```

    This command will clone the specified GitHub repository into a temporary directory, process it, and then clean up the cloned files.

### **Configuration**

The `config/config.json` file allows you to customize which files are included or excluded, set the output file path, and toggle the file tree display.

```json
{
  "includes": [".js", ".ts", ".tsx", ".html", ".json"],
  "excludes": ["node_modules", "public", "package-lock.json", ".git"],
  "showTree": true,
  "outputFile": "./prompt.txt"
}
```

  * `includes`: An array of file extensions to include in the output.
  * `excludes`: An array of file or folder names to ignore.
  * `showTree`: A boolean to determine whether to include the file tree in the output.
  * `outputFile`: The path where the final consolidated file will be saved.

-----

## **Project Structure** 📁

```
.
├── config/
│   ├── config.json
│   ├── code.tpl
│   ├── analyze.tpl
│   ├── features.tpl
│   ├── readme.tpl
│   └── prompt.tpl
├── merge-files.js
└── package.json
```

  * `config/`: Contains configuration files and templates for different output formats.
      * `config.json`: Main configuration for file inclusion/exclusion and output.
      * `*.tpl`: Templates used to format the final output. The script uses different templates based on user choice.
  * `merge-files.js`: The main script that handles file processing, cloning, and output generation.
  * `package.json`: Manages project metadata and dependencies.

-----

## **Dependencies** 📦

  * `isomorphic-git`: A pure JavaScript implementation of Git. Used for cloning GitHub repositories.

-----

## **License** 📜

This project is licensed under the **ISC License**.

See the `LICENSE` file for more details.