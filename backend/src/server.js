const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Read data file
const getData = async () => {
  const data = await fs.readFile(path.join(__dirname, '../db/data.json'), 'utf8');
  return JSON.parse(data);
};

// Sample routes
app.get('/api/recipes', async (req, res) => {
  try {
    const data = await getData();
    res.json(data.recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});