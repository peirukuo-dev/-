const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const dataPath = path.join(__dirname, 'data', 'professors.json');

// Helper function to read data
function readData() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
}

// Helper function to write data
function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

// Routes

// GET /api/professors - Get all professors
app.get('/api/professors', (req, res) => {
  const professors = readData();
  res.json(professors);
});

// POST /api/professors - Add new professor
app.post('/api/professors', (req, res) => {
  const professors = readData();
  const newProfessor = req.body;
  newProfessor.id = Date.now().toString(); // Simple ID generation
  professors.push(newProfessor);
  writeData(professors);
  res.status(201).json(newProfessor);
});

// PUT /api/professors/:id - Update professor
app.put('/api/professors/:id', (req, res) => {
  const professors = readData();
  const id = req.params.id;
  const updatedProfessor = req.body;
  const index = professors.findIndex(p => p.id === id);
  if (index !== -1) {
    professors[index] = { ...professors[index], ...updatedProfessor };
    writeData(professors);
    res.json(professors[index]);
  } else {
    res.status(404).json({ error: 'Professor not found' });
  }
});

// POST /api/professors/:id/comments - Add comment to professor
app.post('/api/professors/:id/comments', (req, res) => {
  const professors = readData();
  const id = req.params.id;
  const newComment = req.body;
  newComment.id = Date.now().toString();
  const professor = professors.find(p => p.id === id);
  if (professor) {
    professor.comments.push(newComment);
    // Update average metrics
    const allMetrics = professor.comments.map(c => c.metrics);
    professor.avgMetrics = {
      score: allMetrics.reduce((sum, m) => sum + m.score, 0) / allMetrics.length,
      sweety: allMetrics.reduce((sum, m) => sum + m.sweety, 0) / allMetrics.length,
      coolness: allMetrics.reduce((sum, m) => sum + m.coolness, 0) / allMetrics.length,
      knowledge: allMetrics.reduce((sum, m) => sum + m.knowledge, 0) / allMetrics.length,
    };
    writeData(professors);
    res.status(201).json(newComment);
  } else {
    res.status(404).json({ error: 'Professor not found' });
  }
});

// PUT /api/professors/:id/beaten - Increment beaten count
app.put('/api/professors/:id/beaten', (req, res) => {
  const professors = readData();
  const id = req.params.id;
  const professor = professors.find(p => p.id === id);
  if (professor) {
    professor.beatenCount += 1;
    writeData(professors);
    res.json({ beatenCount: professor.beatenCount });
  } else {
    res.status(404).json({ error: 'Professor not found' });
  }
});

// PUT /api/professors/:id/search - Increment search count
app.put('/api/professors/:id/search', (req, res) => {
  const professors = readData();
  const id = req.params.id;
  const professor = professors.find(p => p.id === id);
  if (professor) {
    professor.searchCount += 1;
    writeData(professors);
    res.json({ searchCount: professor.searchCount });
  } else {
    res.status(404).json({ error: 'Professor not found' });
  }
});

// Serve frontend static files in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});