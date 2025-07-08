import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// In-memory URL store
const urlDatabase = {};
let urlCounter = 1;

// URL validation helper
function isValidUrl(userInput) {
  try {
    const url = new URL(userInput);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Serve the HTML page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "URL-Shortner.html"));
});

// POST /api/shorturl - Create short URL
router.post("/api/shorturl", (req, res) => {
  const original_url = req.body.url;

  if (!isValidUrl(original_url)) {
    return res.json({ error: "invalid url" });
  }

  // Check for existing entry
  for (const [key, value] of Object.entries(urlDatabase)) {
    if (value === original_url) {
      return res.json({ original_url, short_url: Number(key) });
    }
  }

  // Save new entry
  const short_url = urlCounter++;
  urlDatabase[short_url] = original_url;

  res.json({ original_url, short_url });
});

// GET /api/shorturl/:short_url - Redirect to original URL
router.get("/api/shorturl/:short_url", (req, res) => {
  const short_url = Number(req.params.short_url); // Ensure number key

  const original_url = urlDatabase[short_url];

  if (original_url) {
    return res.redirect(original_url);
  } else {
    return res.json({ error: "No short URL found for the given input" });
  }
});

export default router;
