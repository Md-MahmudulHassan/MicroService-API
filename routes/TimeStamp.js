import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve the frontend page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'TimeStamp.html'));
});

// No date parameter: return current date
router.get("/api", (req, res) => {
  const currentDate = new Date();
  res.json({
    unix: currentDate.getTime(),
    utc: currentDate.toUTCString()
  });
});

// Date parameter provided
router.get("/api/:date", (req, res) => {
  const dateParam = req.params.date;

  const isUnix = /^\d+$/.test(dateParam); // Check if all digits
  const date = isUnix
    ? new Date(Number(dateParam))
    : new Date(dateParam);

  if (date.toString() === "Invalid Date") {
    return res.json({ error: "Invalid Date" });
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

export default router;
