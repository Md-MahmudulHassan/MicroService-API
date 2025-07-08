// File: MicroService-API/index.js
import express from 'express';
import dotenv from 'dotenv';

// Import routes
import { ExerciseTracker, FileMetadata,HeaderParser,URLShortener ,TimeStamp} from './routes/Routes.js';
dotenv.config();

const app = express();

// Middleware
app.use(express.static('public')); // Serve static files from 'public' folder
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use('/exercise', ExerciseTracker);
app.use('/file-metadata', FileMetadata);
app.use('/header-parser', HeaderParser);
app.use('/url-shortener', URLShortener);
app.use('/timestamp', TimeStamp);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
