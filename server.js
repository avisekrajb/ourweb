require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// GitHub routes
app.post('/api/github/save-letters', async (req, res) => {
  try {
    const { letters, token } = req.body;
    
    const response = await axios.put(
      `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/contents/love-letters.json`,
      {
        message: `Update love letters (${new Date().toLocaleString()})`,
        content: Buffer.from(JSON.stringify(letters)).toString('base64'),
        sha: req.body.sha || null
      },
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error saving to GitHub:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/github/load-letters', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/contents/love-letters.json`,
      {
        headers: {
          'Authorization': `token ${req.query.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    const content = Buffer.from(response.data.content, 'base64').toString();
    res.json({ success: true, letters: JSON.parse(content), sha: response.data.sha });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.json({ success: true, letters: [] });
    } else {
      console.error('Error loading from GitHub:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});