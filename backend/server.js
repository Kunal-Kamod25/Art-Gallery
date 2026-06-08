const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

// Connect DB and auto-seed categories if empty
connectDB().then(async () => {
  try {
    const Category = require('./models/Category');
    const count = await Category.countDocuments();
    if (count === 0) {
      await Category.insertMany([
        { name: 'Painting',     description: 'Traditional and modern paintings',    slug: 'painting'     },
        { name: 'Sculpture',    description: 'Three-dimensional artworks',           slug: 'sculpture'    },
        { name: 'Photography',  description: 'Fine art photography',                 slug: 'photography'  },
        { name: 'Digital Art',  description: 'Digital and NFT artworks',             slug: 'digital-art'  },
        { name: 'Drawing',      description: 'Sketches and illustrations',           slug: 'drawing'      },
        { name: 'Printmaking',  description: 'Lithographs, etchings, and prints',    slug: 'printmaking'  },
        { name: 'Mixed Media',  description: 'Works combining multiple art forms',   slug: 'mixed-media'  },
      ]);
      console.log('✅ Default categories seeded automatically.');
    }
  } catch (err) {
    console.error('⚠️  Auto-seed categories failed:', err.message);
  }
});

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  // Also push variant without trailing slash if present
  const urlWithoutSlash = process.env.FRONTEND_URL.replace(/\/$/, "");
  if (!allowedOrigins.includes(urlWithoutSlash)) {
    allowedOrigins.push(urlWithoutSlash);
  }
}

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin: ' + origin;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/artworks', require('./routes/artworkRoutes'));
app.use('/api/artists', require('./routes/artistRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Art Gallery API is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎨 Art Gallery Server running on port ${PORT}`);
});
