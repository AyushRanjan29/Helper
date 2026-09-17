import { extractProblem } from "./extractor";
import { getProblemSlug } from "./utils";
import { createHelperChatbot, updateHelperProblem } from "./chatbot";

console.log("Helper content script loaded!");


let lastUrl = location.href;

// ======================================================
// INITIALIZE
// ======================================================

function initializeProblem() {
  const slug = getProblemSlug();

  console.log("Problem slug:", slug);

  if (!slug) {
    return;
  }

  const problemData = extractProblem();

  if (!problemData.title) {
    return;
  }


  console.log("Helper problem:", problemData.title);

  chrome.runtime.sendMessage({
    type: "PROBLEM_DATA",
    data: problemData,
  });

  if (document.getElementById("helper-chatbot")) {
    updateHelperProblem(problemData);
  } else {
    createHelperChatbot(problemData);
  }
}

// ======================================================
// INITIAL LOAD
// ======================================================

initializeProblem();

// ======================================================
// DETECT LEETCODE PROBLEM CHANGE
// ======================================================

setInterval(() => {
  const currentUrl = location.href;

  if (currentUrl === lastUrl) {
    return;
  }

  lastUrl = currentUrl;

  console.log("LeetCode problem changed:", currentUrl);

  // Give LeetCode time to render the new problem
  setTimeout(() => {
    initializeProblem();
  }, 800);
}, 500);
