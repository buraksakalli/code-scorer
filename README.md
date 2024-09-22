# VSCode Code Scorer Extension

This VSCode extension uses OpenAI's API to score your code files based on best practices, readability, and efficiency. Every time you save a file, the extension will provide a score between 0 and 100, displayed in the VSCode status bar.

## Features

- **Real-time Code Scoring**: Automatically evaluates your code whenever you save a file.
- **Status Bar Display**: Shows your code's score out of 100 in the VSCode status bar.
- **OpenAI Integration**: Leverages OpenAI’s GPT model for analyzing and scoring your code.

## Installation

### From the Marketplace

1. Install the extension from the [VSCode Marketplace].
2. Enter your OpenAI API Key in the extension settings:
   - Go to `File` > `Preferences` > `Settings`.
   - Search for "Code Scorer".
   - Enter your OpenAI API Key in the `codeScorer.apiKey` field.

### From Source

1. Clone the repository:

   ```bash
   git clone https://github.com/buraksakalli/code-scorer
   cd code-scorer
   ```
