function cleanTitle(title: string): string {
    return title
    .replace(/\s*-\s*LeetCode\s*$/i, "")
    .trim();
}

function getTitle(): string {

    const ogTitle = document.querySelector(
    'meta[property="og:title"]'
    ) as HTMLMetaElement | null;

    if (ogTitle?.content) {
    return cleanTitle(ogTitle.content);
    }

    if (document.title) {
    return cleanTitle(document.title);
    }

    return "";
}

function getDifficulty(): string {
    const difficulties = ["Easy", "Medium", "Hard"];

    const elements = document.querySelectorAll("div, span");

    for (const element of elements) {
        const text = element.textContent?.trim();
        if (text && difficulties.includes(text)) {
            return text;
        }
    }
    
    return "";
}

function getDescription(): string {
    const descriptionElement = document.querySelector(
    '[data-track-load="description_content"]'
    ) as HTMLElement | null;

    if (!descriptionElement) {
    return "";
    }

    const text = descriptionElement.innerText;
    const descriptionSection = text.match(
        /^[\s\S]*?(?=Example 1:|Examples?:|Constraints:|$)/i
    );

    if (!descriptionSection) {
        return "";
    }


    return descriptionSection[0].trim();
}


function getExamples(): string[] {
    const descriptionElement = document.querySelector(
    '[data-track-load="description_content"]'
    ) as HTMLElement | null;

    if (!descriptionElement) {
    return [];
    }

    const text = descriptionElement.innerText;

    const examplesSection = text.match(
    /Example 1:[\s\S]*?(?=Constraints:|Follow-up:|$)/i
    );

    if (!examplesSection) {
    return [];
    }

    return examplesSection[0]
    .split(/(?=Example \d+:)/i)
    .map((example) => example.trim())
    .filter(Boolean);
}

function getConstraints(): string[] {
    const descriptionElement = document.querySelector(
    '[data-track-load="description_content"]'
    ) as HTMLElement | null;

    if (!descriptionElement) {
    return [];
    }

    const text = descriptionElement.innerText;

    const constraintsSection = text.match(
    /Constraints:\s*([\s\S]*?)(?=Follow-up:|$)/i
    );

    if (!constraintsSection) {
    return [];
    }

    return constraintsSection[1]
    .split("\n")
    .map((constraint) => constraint.trim())
    .filter(Boolean);
}

export function extractProblem(): void {
    const title = getTitle();
    const difficulty = getDifficulty();
    const description = getDescription();
    const example = getExamples();
    const constraints = getConstraints();
    
    console.log("Problem title:", title);
    console.log("Difficulty:", difficulty);
    console.log("Description:", description);
    console.log("Example: ", example);
    console.log("Constraints:", constraints);
    }