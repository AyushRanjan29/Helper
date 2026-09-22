export function getProblemSlug(): string | null {
    const match = window.location.pathname.match(/^\/problems\/([^/]+)/);

    return match ? match[1] : null;
}

export function getCurrentLanguage(): string {
    const languageButtons = document.querySelectorAll(
    'button[aria-haspopup="dialog"]',
    );

    const languageButton = languageButtons[1];

    return languageButton?.textContent?.trim() || "Unknown";
}

export function getCurrentCode(): string {
    const editors = document.querySelectorAll(".monaco-editor");

    const codeEditor = editors[0];

    if (!codeEditor) {
    return "";
    }

    const lines = codeEditor.querySelector(".view-lines");

    if (!lines) {
    return "";
    }

    return (lines as HTMLElement).innerText.trim();
}