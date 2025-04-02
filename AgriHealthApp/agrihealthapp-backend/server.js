const express = require('express');
const cors = require('cors');
const path = require('path');

// Debug log
console.log('Starting server...');

try {
  require('dotenv').config();
  console.log('Dotenv loaded');

  // Initialize Express app
  const app = express();
  const PORT = process.env.PORT || 3000;
  console.log(`Port set to ${PORT}`);

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  console.log('Middleware configured');

  // Mock data
  const mockPlantDiseases = [
    {
      id: "1",
      name: 'Late Blight',
      plantType: 'tomato',
      description: 'Late blight is a potentially serious disease of potato and tomato, caused by the fungus-like organism Phytophthora infestans.',
      symptoms: [
        'Dark brown spots on leaves',
        'White fungal growth on undersides of leaves'
      ],
      severity: 'high'
    },
    {
      id: "2",
      name: 'Powdery Mildew',
      plantType: 'cucumber',
      description: 'Powdery mildew is a fungal disease that affects a wide range of plants, particularly cucurbits.',
      symptoms: [
        'White powdery spots on leaves and stems',
        'Yellow leaves'
      ],
      severity: 'medium'
    }
  ];

  const mockUsers = [
    {
      id: "1",
      username: "demo_farmer",
      email: "farmer@example.com"
    }
  ];

  // Mock API routes
  app.get('/api/diseases/plants', (req, res) => {
    res.json({ success: true, data: mockPlantDiseases });
  });

  app.get('/api/diseases/plants/:id', (req, res) => {
    const disease = mockPlantDiseases.find(d => d.id === req.params.id);
    if (disease) {
      res.json({ success: true, data: disease });
    } else {
      res.status(404).json({ success: false, message: "Disease not found" });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
      res.json({
        success: true,
        token: "mock-jwt-token",
        user: mockUsers[0]
      });
    } else {
      res.status(400).json({ success: false, message: "Email and password are required" });
    }
  });

  app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    if (username && email && password) {
      res.json({
        success: true,
        message: "User registered successfully",
        user: { id: "2", username, email }
      });
    } else {
      res.status(400).json({ success: false, message: "Required fields missing" });
    }
  });

  app.post('/api/diagnosis/analyze', (req, res) => {
    res.json({
      success: true,
      data: {
        id: "123",
        diagnosedDisease: "Late Blight",
        confidence: 0.89,
        recommendations: "Apply fungicides and remove infected plants"
      }
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'AgriHealthApp API is running',
      status: 'OK',
      endpoints: {
        auth: ['/api/auth/login', '/api/auth/register'],
        diseases: ['/api/diseases/plants', '/api/diseases/plants/:id'],
        diagnosis: ['/api/diagnosis/analyze']
      }
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
  });

  // Start server - explicitly bind to all interfaces
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} - Open http://localhost:${PORT} in your browser`);
    console.log('API endpoints available:');
    console.log('  GET /');
    console.log('  GET /health');
    console.log('  GET /api/diseases/plants');
    console.log('  GET /api/diseases/plants/:id');
    console.log('  POST /api/auth/login');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/diagnosis/analyze');
  });
} catch (error) {
  console.error('Server startup error:', error);
}
