import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'HeaderParser.html'));
});

router.get('/api', (req, res) => {
  let ipaddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  if (ipaddress.startsWith("::ffff:")) {
    ipaddress = ipaddress.substring(7);
  }

  if (ipaddress === '::1') {
    ipaddress = '127.0.0.1';
  }

  const language = req.headers['accept-language'] || '';
  const software = req.headers['user-agent'] || '';

  res.json({ ipaddress, language, software });
});

export default router;