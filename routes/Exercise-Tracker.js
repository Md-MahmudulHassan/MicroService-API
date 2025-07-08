import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Mongoose connection
mongoose.connect(process.env.MONGODB_EXERCISE_TRACKER_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schemas and models
const exerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  log: [exerciseSchema],
});

const User = mongoose.model('User', userSchema);

// Routes

// Home route
router.get('/', (req, res) => {
res.sendFile(path.join(__dirname, '..', 'public', 'Exercise-Tracker.html'));
});

// 1. POST /api/users - create new user
router.post('/api/users', async (req, res) => {
  try {
    const username = req.body.username;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    let user = await User.findOne({ username });
    if (user) return res.json({ username: user.username, _id: user._id });

    user = new User({ username, log: [] });
    await user.save();
    res.json({ username: user.username, _id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /exercise/api/users - get all users
router.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, _id: 1 }).exec();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /exercise/api/users/:_id/exercises - add exercise
router.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    if (!description || !duration) {
      return res.status(400).json({ error: 'Description and duration are required' });
    }

    const durationNum = Number(duration);
    if (isNaN(durationNum)) {
      return res.status(400).json({ error: 'Duration must be a number' });
    }

    let exerciseDate = date ? new Date(date) : new Date();
    if (isNaN(exerciseDate.getTime())) {
      exerciseDate = new Date();
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const exercise = {
      description,
      duration: durationNum,
      date: exerciseDate,
    };

    user.log.push(exercise);
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      date: exercise.date.toDateString(),
      duration: exercise.duration,
      description: exercise.description,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /api/users/:_id/logs - get user exercise logs
router.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const userId = req.params._id;
    const { from, to, limit } = req.query;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let logs = user.log;

    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) {
        logs = logs.filter(e => e.date >= fromDate);
      }
    }

    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) {
        logs = logs.filter(e => e.date <= toDate);
      }
    }

    logs.sort((a, b) => a.date - b.date);

    const limitNum = limit ? Number(limit) : logs.length;
    logs = logs.slice(0, limitNum);

    const logFormatted = logs.map(e => ({
      description: e.description,
      duration: e.duration,
      date: new Date(e.date).toDateString(),
    }));

    res.json({
      _id: user._id,
      username: user.username,
      count: logFormatted.length,
      log: logFormatted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
