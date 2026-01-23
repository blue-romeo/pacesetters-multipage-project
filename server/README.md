# Pathfinders Club Backend API

Backend API server for the Pathfinders Club website built with Node.js, Express, and MongoDB Atlas.

## Features

- 🔐 RESTful API with secure endpoints
- 📊 MongoDB Atlas integration
- 🛡️ Security best practices (Helmet, CORS, Rate Limiting)
- ✅ Request validation with express-validator
- 📧 Email notifications support
- 🚀 Production-ready with compression and logging

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (ready for implementation)
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator

## Project Structure

```
server/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── contactController.js
│   ├── newsletterController.js
│   ├── donationController.js
│   ├── eventController.js
│   └── galleryController.js
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling
│   └── rateLimiter.js       # Rate limiting
├── models/
│   ├── Contact.js
│   ├── Newsletter.js
│   ├── Donation.js
│   ├── Event.js
│   └── Gallery.js
├── routes/
│   ├── contactRoutes.js
│   ├── newsletterRoutes.js
│   ├── donationRoutes.js
│   ├── eventRoutes.js
│   └── galleryRoutes.js
├── .env.example
├── .gitignore
├── package.json
└── server.js                # Main entry point
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account
- npm or yarn

### Setup Steps

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your credentials**
   - Set your MongoDB Atlas connection string
   - Configure email settings
   - Set JWT secret
   - Adjust other settings as needed

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

## MongoDB Atlas Setup

1. **Create a MongoDB Atlas account** at https://www.mongodb.com/cloud/atlas

2. **Create a new cluster**
   - Choose free tier (M0) for development
   - Select your preferred region

3. **Configure database access**
   - Create a database user with username and password
   - Note these credentials for your `.env` file

4. **Configure network access**
   - Add your IP address
   - For production, add your server's IP
   - Or use 0.0.0.0/0 (not recommended for production)

5. **Get connection string**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `pathfinders` (or your preferred name)

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Contacts/Registration
- `POST /api/contacts` - Submit registration form
- `GET /api/contacts` - Get all contacts (admin)
- `GET /api/contacts/:id` - Get single contact (admin)
- `PATCH /api/contacts/:id/status` - Update contact status (admin)
- `DELETE /api/contacts/:id` - Delete contact (admin)

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter
- `GET /api/newsletter` - Get all subscribers (admin)
- `DELETE /api/newsletter/:id` - Delete subscriber (admin)

### Donations
- `POST /api/donations` - Create donation record
- `GET /api/donations` - Get all donations (admin)
- `GET /api/donations/stats` - Get donation statistics (admin)
- `GET /api/donations/:id` - Get single donation (admin)
- `PATCH /api/donations/:id/status` - Update donation status (admin)

### Events
- `GET /api/events` - Get all published events
- `GET /api/events/:id` - Get single event
- `POST /api/events/:id/register` - Register for event
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Gallery
- `GET /api/gallery` - Get all published gallery items
- `GET /api/gallery/categories/list` - Get gallery categories
- `GET /api/gallery/:id` - Get single gallery item
- `POST /api/gallery` - Create gallery item (admin)
- `PUT /api/gallery/:id` - Update gallery item (admin)
- `DELETE /api/gallery/:id` - Delete gallery item (admin)

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB Atlas
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_secret_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@pathfindersclub.org

# Admin
ADMIN_EMAIL=admin@pathfindersclub.org

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Features

- **Helmet**: Sets security-related HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Validates and sanitizes all inputs
- **Error Handling**: Centralized error handling
- **JWT Ready**: Authentication middleware ready for implementation

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start
```

## Deployment

### With Nginx (Recommended)

1. **Build and deploy your Node.js app**
2. **Configure Nginx as reverse proxy** (see nginx.conf)
3. **Use PM2 or similar for process management**

```bash
# Install PM2
npm install -g pm2

# Start server with PM2
pm2 start server.js --name pathfinders-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Environment Variables in Production

- Never commit `.env` file
- Use environment variables in your hosting platform
- Update `CLIENT_URL` to your frontend domain
- Set `NODE_ENV=production`

## Testing

Test the API using:
- Postman
- Thunder Client (VS Code extension)
- cURL commands

Example cURL:
```bash
curl -X POST http://localhost:5000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "age": 12,
    "consent": true
  }'
```

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string format
- Check network access settings in MongoDB Atlas
- Ensure database user credentials are correct

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Kill the process or change PORT in .env
```

### CORS Errors
- Update `CLIENT_URL` in `.env`
- Check CORS configuration in `server.js`

## License

ISC

## Support

For issues or questions, contact the development team or open an issue in the repository.
