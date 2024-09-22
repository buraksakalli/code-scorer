import * as vscode from "vscode";
import { OpenAI } from "openai";

// Global variable to store the status bar item
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  initializeStatusBarItem(context);

  // Register an event listener for file save actions
  const onSaveHandler = vscode.workspace.onDidSaveTextDocument(
    async (document) => {
      const apiKey = getApiKeyFromConfig();

      if (!apiKey) {
        showErrorMessage("Please set your OpenAI API Key in the settings.");
        return;
      }

      const score = await evaluateCodeWithOpenAI(apiKey, document);

      if (score !== null) {
        updateStatusBar(score);
      }
    }
  );

  context.subscriptions.push(onSaveHandler);
}

export function deactivate() {
  disposeStatusBarItem();
}

/**
 * Initializes the status bar item and adds it to the context's subscriptions.
 */
function initializeStatusBarItem(context: vscode.ExtensionContext): void {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "Code Score: N/A";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
}

/**
 * Disposes the status bar item if it exists.
 */
function disposeStatusBarItem(): void {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}

/**
 * Retrieves the OpenAI API key from the VSCode configuration.
 * @returns {string | undefined} The API key, or undefined if not set.
 */
function getApiKeyFromConfig(): string | undefined {
  return vscode.workspace.getConfiguration().get<string>("codeScorer.apiKey");
}

/**
 * Shows an error message in VSCode.
 * @param {string} message - The error message to display.
 */
function showErrorMessage(message: string): void {
  vscode.window.showErrorMessage(message);
}

/**
 * Evaluates the code using the OpenAI API and returns a score.
 * @param {string} apiKey - The OpenAI API key.
 * @param {vscode.TextDocument} document - The VSCode document to evaluate.
 * @returns {Promise<number | null>} The score, or null if there was an error.
 */
async function evaluateCodeWithOpenAI(
  apiKey: string,
  document: vscode.TextDocument
): Promise<number | null> {
  const openai = new OpenAI({ apiKey });
  const codeContent = document.getText();
  const prompt = createCodeEvaluationPrompt(codeContent);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 5,
      temperature: 0,
      n: 1,
      stop: null,
    });

    const content = response.choices[0].message.content;
    const score = content ? parseScoreFromResponse(content) : null;

    if (score === null) {
      showErrorMessage("Error: Invalid response format from OpenAI.");
    }

    return score;
  } catch (error: any) {
    showErrorMessage(`Error: ${error.message}`);
    return null;
  }
}

/**
 * Creates the OpenAI prompt for evaluating the code.
 * @param {string} code - The code content to evaluate.
 * @returns {string} The generated prompt for OpenAI.
 */
function createCodeEvaluationPrompt(code: string): string {
  return `You are an expert software reviewer. Your task is to evaluate the following code for the following criteria:
1. Adherence to modern best practices
2. Code efficiency and performance
3. Readability and maintainability
4. Correctness and lack of bugs

Rate the code on a scale of 0 to 100, where 100 represents perfect code across all criteria.

Only return the score as a number (e.g., 85). Do not provide any explanations, comments, or additional content beyond the score.

Code:
${code}

Return only the score as a number out of 100.
`;
}

/**
 * Parses the score from the OpenAI response.
 * @param {string} responseContent - The content of the response message.
 * @returns {number | null} The parsed score, or null if parsing failed.
 */
function parseScoreFromResponse(responseContent: string): number | null {
  const score = Number(responseContent);
  return isNaN(score) ? null : score;
}

/**
 * Updates the status bar with the new score and an appropriate emoji.
 * @param {number} score - The score to display.
 */
function updateStatusBar(score: number): void {
  const emoji = getEmojiForScore(score);
  statusBarItem.text = `Code Score: ${score}/100 ${emoji}`;
}

/**
 * Returns an emoji based on the score.
 * @param {number} score - The score to evaluate.
 * @returns {string} The corresponding emoji.
 */
function getEmojiForScore(score: number): string {
  if (score >= 90) return "🎉";
  if (score >= 80) return "👍";
  if (score >= 70) return "🤔";
  return "👎";
}
