import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener';

mongoose.connect(MONGODB_URI, {
  dbName: 'urlshortener'
})
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Database URL:', MONGODB_URI);
    // Clean up any existing problematic data
    cleanupDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    console.error('Make sure MongoDB is running and accessible');
    process.exit(1);
  });

// URL Schema
const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true
  },
  visits: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Url = mongoose.model('Url', urlSchema);

// Clean up function to remove problematic records
const cleanupDatabase = async () => {
  try {
    // Remove any records with null shortCode
    await Url.deleteMany({ shortCode: null });
    console.log('Database cleanup completed');
  } catch (error) {
    console.error('Database cleanup error:', error);
  }
};

// Utility function to validate URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Routes
app.post('/api/shorten', async (req, res) => {
  try {
    console.log('POST /api/shorten - Request body:', req.body);
    
    const { originalUrl } = req.body;
    
    if (!originalUrl) {
      console.log('Error: URL is required');
      return res.status(400).json({ error: 'URL is required' });
    }
    
    if (!isValidUrl(originalUrl)) {
      console.log('Error: Invalid URL format:', originalUrl);
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Check if URL already exists
    let url = await Url.findOne({ originalUrl });
    
    if (url) {
      console.log('URL already exists, returning existing short code:', url.shortCode);
      return res.json({ 
        shortUrl: `${req.protocol}://${req.get('host')}/${url.shortCode}`,
        shortCode: url.shortCode 
      });
    }
    
    // Generate short code
    const shortCode = nanoid(6);
    console.log('Generated short code:', shortCode);
    
    // Create new URL entry
    url = new Url({
      originalUrl,
      shortCode
    });
    
    await url.save();
    console.log('URL saved successfully');
    
    res.json({ 
      shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
      shortCode 
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect route
app.get('/:shortcode', async (req, res) => {
  try {
    const { shortcode } = req.params;
    
    const url = await Url.findOne({ shortCode: shortcode });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    // Increment visit count
    url.visits += 1;
    await url.save();
    
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin routes
app.get('/api/admin/urls', async (req, res) => {
  try {
    console.log('GET /api/admin/urls - Fetching all URLs');
    const urls = await Url.find().sort({ createdAt: -1 });
    console.log('Found URLs:', urls.length);
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Make sure MongoDB is running on mongodb://localhost:27017');
});