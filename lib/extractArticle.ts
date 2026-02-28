import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const FETCH_TIMEOUT_MS = 15_000;
const MIN_EXTRACTED_LENGTH = 50;
// Use a common browser User-Agent so sites (e.g. Reuters) don't return 401 for bot-like requests.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Fetch a URL, extract main article text using Readability, and return plain text.
 * @throws Error with a user-facing message for invalid URL, fetch failure, non-HTML, or extraction failure.
 */
export async function extractArticleFromUrl(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error("URL is empty.");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("Invalid URL format.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL must use http or https.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(trimmed, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out. The page took too long to load.");
      }
      throw new Error(`Could not fetch URL: ${err.message}`);
    }
    throw new Error("Could not fetch URL.");
  }
  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`URL returned ${res.status}. The page may be unavailable.`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!/text\/html/i.test(contentType)) {
    throw new Error("URL did not return HTML. Only web pages can be analyzed.");
  }

  const html = await res.text();
  const dom = new JSDOM(html, { url: trimmed });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error("Could not extract article content from this page.");
  }

  const text = (article.textContent ?? "").trim();
  if (text.length < MIN_EXTRACTED_LENGTH) {
    throw new Error(
      "Extracted content was too short. The page may not contain a readable article."
    );
  }

  return text;
}
