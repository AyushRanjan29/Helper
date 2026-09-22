import type { ProblemData, ChatMessage } from "../shared/types";
import { marked } from "marked";
import hljs from "highlight.js/lib/common";
import chatbotStyles from "./chatbot.css?inline";
import { getCurrentLanguage, getCurrentCode } from "./utils";

let currentProblemData: ProblemData | null = null;
let conversationHistory: ChatMessage[] = [];

// ======================================================
// CREATE CHATBOT
// ======================================================

export function createHelperChatbot(problemData: ProblemData) {
  currentProblemData = problemData;
  conversationHistory = [];

  // Prevent duplicate chatbot
  if (document.getElementById("helper-chatbot")) {
    return;
  }

  injectChatbotStyles();

  const container = document.createElement("div");

  container.id = "helper-chatbot";

  container.innerHTML = `
    <!-- Chat window -->
    <div id="helper-window" style="display: none;">

      <!-- Header -->
      <div id="helper-header">

        <div class="helper-header-left">

          <div class="helper-logo">
            🤖
          </div>

          <div>
            <div class="helper-title">
              Helper
            </div>

            <div class="helper-status">
              <span class="helper-status-dot"></span>
              AI Coding Assistant
            </div>
          </div>

        </div>

        <button
          id="helper-close"
          class="helper-icon-button"
          title="Close Helper"
        >
          ×
        </button>

      </div>

      <!-- Messages -->
      <div id="helper-messages">

        <div class="helper-message helper-ai">

          <div class="helper-avatar">
            🤖
          </div>

          <div class="helper-message-content">

            <div class="helper-message-name">
              Helper
            </div>

            <div class="helper-message-body">
              Hi! I'm Helper 👋
              <br />
              Ask me anything about this problem.
            </div>

          </div>

        </div>

      </div>

      <!-- Input -->
      <div id="helper-input-container">

        <div id="helper-input-wrapper">

          <textarea
            id="helper-input"
            rows="1"
            placeholder="Ask Helper anything..."
          ></textarea>

          <button
            id="helper-send"
            title="Send message"
          >
            <span>➤</span>
          </button>

        </div>

        <div class="helper-input-hint">
          Press <b>Enter</b> to send · <b>Shift + Enter</b> for new line
        </div>

      </div>

    </div>

    <!-- Floating button -->
    <button
      id="helper-toggle"
      title="Open Helper"
    >
      🤖
    </button>
  `;

  document.body.appendChild(container);

  // ======================================================
  // ELEMENTS
  // ======================================================

  const toggleButton = document.getElementById(
    "helper-toggle",
  ) as HTMLButtonElement;

  const closeButton = document.getElementById(
    "helper-close",
  ) as HTMLButtonElement;

  const helperWindow = document.getElementById(
    "helper-window",
  ) as HTMLDivElement;

  const input = document.getElementById("helper-input") as HTMLTextAreaElement;

  const sendButton = document.getElementById(
    "helper-send",
  ) as HTMLButtonElement;

  // ======================================================
  // OPEN / CLOSE
  // ======================================================

  toggleButton.addEventListener("click", () => {
    helperWindow.style.display = "flex";
    toggleButton.style.display = "none";

    setTimeout(() => {
      input.focus();
    }, 50);
  });

  closeButton.addEventListener("click", () => {
    helperWindow.style.display = "none";
    toggleButton.style.display = "flex";
  });

  // ======================================================
  // SEND MESSAGE
  // ======================================================

async function sendMessage() {
  const question = input.value.trim();

  if (!question) {
    return;
  }

  // Show user's message
  addMessage(question, "user");

  // Save user message in conversation history
  conversationHistory.push({
    role: "user",
    content: question,
  });

  // Clear input
  input.value = "";

  resizeInput();

  // Disable input
  sendButton.disabled = true;
  input.disabled = true;

  // Show typing indicator
  const typing = addTypingIndicator();

  try {
    console.log("Sending conversation:", conversationHistory);
    const currentLanguage = getCurrentLanguage();
    const currentCode = getCurrentCode();
    const response = await fetch(
      "http://localhost:5000/api/ai/chat",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          problem: currentProblemData,
          messages: conversationHistory,
          language: currentLanguage,
          code: currentCode,
        }),
      },
    );

    const data = await response.json();

    console.log("Backend response:", data);

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to get AI response.",
      );
    }

    // Remove typing indicator
    typing.remove();

    // Save AI response
    conversationHistory.push({
      role: "assistant",
      content: data.answer,
    });

    // Display AI response
    addMessage(data.answer, "ai");

  } catch (error) {
    typing.remove();

    console.error("Helper chat error:", error);

    addMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong.",
      "ai",
      true,
    );

  } finally {
    sendButton.disabled = false;
    input.disabled = false;

    input.focus();
  }
}

  // ======================================================
  // SEND BUTTON
  // ======================================================

  sendButton.addEventListener("click", sendMessage);

  // ======================================================
  // ENTER TO SEND
  // ======================================================

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      sendMessage();
    }
  });

  // ======================================================
  // AUTO RESIZE TEXTAREA
  // ======================================================

  input.addEventListener("input", resizeInput);

  function resizeInput() {
    input.style.height = "auto";

    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  }
}

// ======================================================
// ADD MESSAGE
// ======================================================

function addMessage(text: string, sender: "user" | "ai", isError = false) {
  const messages = document.getElementById("helper-messages");

  if (!messages) {
    return;
  }

  const message = document.createElement("div");

  message.className =
    sender === "user"
      ? "helper-message helper-user"
      : "helper-message helper-ai";

  if (isError) {
    message.classList.add("helper-error");
  }

  // Avatar
  const avatar = document.createElement("div");

  avatar.className = "helper-avatar";

  avatar.textContent = sender === "user" ? "👤" : "🤖";

  // Content
  const content = document.createElement("div");

  content.className = "helper-message-content";

  // Name
  const name = document.createElement("div");

  name.className = "helper-message-name";

  name.textContent = sender === "user" ? "You" : "Helper";

  // Body
  const body = document.createElement("div");

  body.className = "helper-message-body";

  if (sender === "ai") {
    body.innerHTML = renderMarkdown(text);

    highlightCodeBlocks(body);

    renderMath(body);

    addCopyButtons(body);
  } else {
    body.textContent = text;
  }

  content.appendChild(name);
  content.appendChild(body);

  message.appendChild(avatar);
  message.appendChild(content);

  messages.appendChild(message);

  scrollToBottom();

  return message;
}

// ======================================================
// MARKDOWN
// ======================================================

function renderMarkdown(text: string): string {
  return marked.parse(text, {
    breaks: true,
    gfm: true,
  }) as string;
}

// ======================================================
// MATH
// ======================================================

function renderMath(container: HTMLElement) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

  const textNodes: Text[] = [];

  let node: Node | null;

  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const parent = textNode.parentElement;

    if (!parent) {
      continue;
    }

    // Never modify code blocks
    if (parent.closest("pre, code")) {
      continue;
    }

    const text = textNode.nodeValue || "";

    if (text.includes("$") || text.includes("\\(") || text.includes("\\[")) {
      textNodes.push(textNode);
    }
  }

  for (const textNode of textNodes) {
    const text = textNode.nodeValue || "";

    const regex =
      /(\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\))/g;

    const fragment = document.createDocumentFragment();

    let lastIndex = 0;

    let match: RegExpExecArray | null;

    let foundMath = false;

    while ((match = regex.exec(text)) !== null) {
      foundMath = true;

      // Normal text before math
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.slice(lastIndex, match.index)),
        );
      }

      const fullMatch = match[0];

      const latex = match[2] || match[3] || match[4] || match[5] || "";

      const isDisplay =
        fullMatch.startsWith("$$") || fullMatch.startsWith("\\[");

      const mathElement = document.createElement("span");

      mathElement.className = isDisplay
        ? "helper-math-display"
        : "helper-math-inline";

      mathElement.innerHTML = latexToHtml(latex);

      fragment.appendChild(mathElement);

      lastIndex = match.index + fullMatch.length;
    }

    // Text after math
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    if (foundMath) {
      textNode.parentNode?.replaceChild(fragment, textNode);
    }
  }
}

function latexToHtml(latex: string): string {
  let value = latex.trim();

  // Escape HTML first
  value = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Common LaTeX commands
  value = value
    .replace(/\\log\b/g, "log")
    .replace(/\\ln\b/g, "ln")
    .replace(/\\sin\b/g, "sin")
    .replace(/\\cos\b/g, "cos")
    .replace(/\\tan\b/g, "tan")
    .replace(/\\min\b/g, "min")
    .replace(/\\max\b/g, "max")
    .replace(/\\sum\b/g, "Σ")
    .replace(/\\infty\b/g, "∞")
    .replace(/\\leq\b/g, "≤")
    .replace(/\\le\b/g, "≤")
    .replace(/\\geq\b/g, "≥")
    .replace(/\\ge\b/g, "≥")
    .replace(/\\neq\b/g, "≠")
    .replace(/\\times\b/g, "×")
    .replace(/\\cdot\b/g, "·")
    .replace(/\\rightarrow\b/g, "→")
    .replace(/\\to\b/g, "→")
    .replace(/\\in\b/g, "∈")
    .replace(/\\notin\b/g, "∉")
    .replace(/\\pm\b/g, "±")
    .replace(/\\sqrt\b/g, "√")
    .replace(/\\textmaxLeftX\b/g, "maxLeftX")
    .replace(/\\textminRightY\b/g, "minRightY")
    .replace(/\\textmaxLeftY\b/g, "maxLeftY")
    .replace(/\\textminRightX\b/g, "minRightX")
    .replace(/\\textand\b/g, "and")
    .replace(/\\quad\b/g, "    ")
    .replace(/\\text\{([^{}]*)\}/g, "$1")
    .replace(
      /\\fracmax\(\s*\\?text?maxLeftX,\s*\\?text?maxLeftY\s*\)\s*\+\s*min\(\s*\\?text?minRightX,\s*\\?text?minRightY\s*\)\s*2/g,
      "(max(maxLeftX, maxLeftY) + min(minRightX, minRightY)) / 2",
    );

  // \frac{a}{b} -> a / b
  value = value.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1 / $2)");

  // Remove remaining grouping braces
  value = value.replace(/\{/g, "").replace(/\}/g, "");

  // x^2 -> x<sup>2</sup>
  value = value.replace(/\^([A-Za-z0-9+\-]+)/g, "<sup>$1</sup>");

  // x_i -> x<sub>i</sub>
  value = value.replace(/_([A-Za-z0-9]+)/g, "<sub>$1</sub>");

  return value;
}

// ======================================================
// SYNTAX HIGHLIGHTING
// ======================================================

function highlightCodeBlocks(container: HTMLElement) {
  const codeBlocks = container.querySelectorAll("pre code");

  codeBlocks.forEach((block) => {
    const codeElement = block as HTMLElement;

    const languageClass = Array.from(codeElement.classList).find((className) =>
      className.startsWith("language-"),
    );

    const language = languageClass?.replace("language-", "");

    try {
      if (language && hljs.getLanguage(language)) {
        codeElement.innerHTML = hljs.highlight(codeElement.textContent || "", {
          language,
        }).value;
      } else {
        codeElement.innerHTML = hljs.highlightAuto(
          codeElement.textContent || "",
        ).value;
      }
    } catch {
      // Leave original code untouched
    }
  });
}

// ======================================================
// COPY CODE BUTTON
// ======================================================

function addCopyButtons(container: HTMLElement) {
  const codeBlocks = container.querySelectorAll("pre");

  codeBlocks.forEach((pre) => {
    const wrapper = document.createElement("div");

    wrapper.className = "helper-code-wrapper";

    pre.parentNode?.insertBefore(wrapper, pre);

    wrapper.appendChild(pre);

    const copyButton = document.createElement("button");

    copyButton.className = "helper-copy-button";

    copyButton.textContent = "Copy";

    copyButton.addEventListener("click", async () => {
      const code = pre.querySelector("code")?.textContent || "";

      try {
        await navigator.clipboard.writeText(code);

        copyButton.textContent = "Copied ✓";

        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1500);
      } catch {
        copyButton.textContent = "Failed";
      }
    });

    wrapper.appendChild(copyButton);
  });
}

// ======================================================
// TYPING INDICATOR
// ======================================================

function addTypingIndicator() {
  const messages = document.getElementById("helper-messages");

  if (!messages) {
    throw new Error("Messages container not found.");
  }

  const message = document.createElement("div");

  message.className = "helper-message helper-ai";

  message.innerHTML = `
    <div class="helper-avatar">
      🤖
    </div>

    <div class="helper-message-content">

      <div class="helper-message-name">
        Helper
      </div>

      <div class="helper-typing">
        <span></span>
        <span></span>
        <span></span>
      </div>

    </div>
  `;

  messages.appendChild(message);

  scrollToBottom();

  return message;
}

// ======================================================
// AUTO SCROLL
// ======================================================

function scrollToBottom() {
  const messages = document.getElementById("helper-messages");

  if (!messages) {
    return;
  }

  messages.scrollTo({
    top: messages.scrollHeight,
    behavior: "smooth",
  });
}

// ======================================================
// STYLE INJECTION
// ======================================================

function injectChatbotStyles() {
  if (document.getElementById("helper-chatbot-styles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "helper-chatbot-styles";

  style.textContent = chatbotStyles;

  document.head.appendChild(style);
}

export function updateHelperProblem(problemData: ProblemData) {
  currentProblemData = problemData;
  conversationHistory = [];

  const messages = document.getElementById("helper-messages");

  if (!messages) {
    return;
  }

  // Clear previous conversation
  messages.innerHTML = `
    <div class="helper-message helper-ai">

      <div class="helper-avatar">
        🤖
      </div>

      <div class="helper-message-content">

        <div class="helper-message-name">
          Helper
        </div>

        <div class="helper-message-body">
          Problem changed to <strong>${problemData.title}</strong> 👋
          <br />
          Ask me anything about this problem.
        </div>

      </div>

    </div>
  `;

  scrollToBottom();
}
