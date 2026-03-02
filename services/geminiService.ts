
import { GoogleGenAI } from "@google/genai";

// Assume process.env.API_KEY is available in the environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const model = 'gemini-2.5-flash';

export const convertPdfToMarkdown = async (pdfBase64: string): Promise<string> => {
  try {
    const prompt = `You are an expert in document parsing and formatting. Your task is to convert the content of the provided PDF file into a single, well-structured, and beautifully formatted Markdown document.
- Analyze the PDF's structure, including headings, paragraphs, lists, tables, and code blocks.
- Preserve the semantic structure of the document.
- For mathematical equations, use inline and block-level LaTeX syntax (e.g., \`$...$\` for inline, \`$$...$$\` for block).
- If you encounter images, do not attempt to recreate them. Instead, provide a concise description of the image's content in a markdown blockquote. If the PDF includes a caption for the image (e.g., 'Figure 1: A diagram of...'), incorporate that caption into your description. Format the description like this: \`> *[Image: A detailed diagram of the solar system showing the orbits of all planets.]*\`
- For complex layouts or elements that don't translate well to standard Markdown, use appropriate HTML tags to maintain the structure and appearance.
- Ensure the final output is clean, readable, and aesthetically pleasing.
- Do not include any preamble, introduction, or explanation. Your response should contain ONLY the final Markdown content.`;

    const pdfPart = {
      inlineData: {
        mimeType: 'application/pdf',
        data: pdfBase64,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [textPart, pdfPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error converting PDF to Markdown:", error);
    if (error instanceof Error) {
        return `Error: Failed to convert PDF. ${error.message}`;
    }
    return "Error: An unknown error occurred during conversion.";
  }
};