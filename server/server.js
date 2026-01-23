require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

connectDB();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false
}));


const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use(compression());


app.use('/api/events', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300'); 
  }
  next();
});

app.use('/api/leaders', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=600'); 
  }
  next();
});

app.use('/api/gallery', (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=600'); 
  }
  next();
});


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}


app.use('/api/', apiLimiter);


app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/leaders', require('./routes/leaderRoutes'));


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Pathfinders Club API',
    version: '1.0.0',
    endpoints: {
      contacts: '/api/contacts',
      newsletter: '/api/newsletter',
      donations: '/api/donations',
      events: '/api/events',
      gallery: '/api/gallery',
      leaders: '/api/leaders',
      health: '/health'
    }
  });
});


app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Pathfinders Club API Server        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                ║
║   Port: ${PORT}                           ║
║   Time: ${new Date().toLocaleTimeString()}              ║
╚═══════════════════════════════════════╝
  `);
});


process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);

  server.close(() => process.exit(1));
});

module.exports = app;
