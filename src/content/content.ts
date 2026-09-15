import { getProblemSlug } from "./utils";
import { extractProblem } from "./extractor";

console.log("Helper content script loaded!")
const slug = getProblemSlug();
console.log("Problem slug:", slug);
if (slug) {
    const problemData = extractProblem();

    chrome.runtime.sendMessage({
    type: "PROBLEM_DATA",
    data: problemData,
    });
}