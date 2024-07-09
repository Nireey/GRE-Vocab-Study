const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

// Enable CORS for all requests
app.use(cors());

// Function to read words from words.json
const getWords = () => {
    try {
        const data = fs.readFileSync('words.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading words.json:', err);
        return [];
    }
};

// Example endpoint to serve flashcards.json
app.get('/flashcards.json', (req, res) => {
    const words = getWords();
    res.json({ words });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
