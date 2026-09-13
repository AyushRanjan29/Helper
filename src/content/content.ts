import { getProblemSlug } from "./utils";
import { extractProblem } from "./extractor";

console.log("Helper content script loaded!")
const slug = getProblemSlug();
console.log("Problem slug:", slug);
if (slug) {
    extractProblem();
}