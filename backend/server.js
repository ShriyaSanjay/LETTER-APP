const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/letter-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Letter Schema
const letterSchema = new mongoose.Schema({
  content: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Letter = mongoose.model('Letter', letterSchema);

// Routes
app.get('/api/letters', async (req, res) => {
  try {
    const letter = await Letter.findOne().sort({ createdAt: -1 });
    res.json({ content: letter ? letter.content : '' });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching letters' });
  }
});

app.post('/api/letters', async (req, res) => {
  try {
    const { content } = req.body;
    const newLetter = new Letter({ content });
    await newLetter.save();
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: 'Error saving letter' });
  }
});

app.delete('/api/letters', async (req, res) => {
  try {
    await Letter.deleteMany({});
    res.json({ message: 'All letters deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting letters' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 