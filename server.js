const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3002;
const promClient = require('prom-client');
promClient.collectDefaultMetrics();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        service: 'order-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Basic order endpoints
app.get('/api/orders', (req, res) => {
    res.json({
        message: 'Order service is running',
        orders: [
            { id: 1, userId: 1, total: 99.99, status: 'completed' },
            { id: 2, userId: 2, total: 149.50, status: 'pending' }
        ]
    });
});

app.get('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        id: parseInt(id),
        userId: 1,
        items: ['Product A', 'Product B'],
        total: 99.99,
        status: 'completed',
        message: 'Order retrieved successfully'
    });
});

app.post('/api/orders', (req, res) => {
    res.status(201).json({
        message: 'Order created successfully',
        order: {
            id: 3,
            userId: req.body.userId || 1,
            total: req.body.total || 0,
            status: 'pending'
        }
    });
});

// Get orders by user
app.get('/api/orders/user/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({
        userId: parseInt(userId),
        orders: [
            { id: 1, total: 99.99, status: 'completed' }
        ],
        message: 'User orders retrieved successfully'
    });
});

// Simple service communication test
app.get('/api/orders/test-user-service', async (req, res) => {
    try {
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
        const response = await axios.get(`${userServiceUrl}/health`);
        res.json({
            message: 'User service communication successful',
            userServiceStatus: response.data
        });
    } catch (error) {
        res.status(500).json({
            message: 'User service communication failed',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
