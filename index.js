require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const urlDatabase = new Map();
let counter = 1;

// Define a route for creating short URLs
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    const url = new URL(originalUrl);

    // Validate the URL format (must start with http:// or https://)
    if (!url.protocol.startsWith('http') || !url.host) {
      throw new Error('Invalid URL format');
    }
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  // Check if the hostname is valid using dns.lookup
  const hostname = new URL(originalUrl).hostname;
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Generate a short URL using the counter
    const shortUrl = counter++;

    // Store the mapping in the database (Map)
    urlDatabase.set(shortUrl, originalUrl);

    // Send the response with the short URL
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Define a route for redirecting to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const originalUrl = urlDatabase.get(shortUrl);

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'short url not found' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
