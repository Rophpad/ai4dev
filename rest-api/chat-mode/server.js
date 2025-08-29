const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// In-memory storage for items (in a real app, you'd use a database)
let items = [
    { id: 1, name: 'Sample Item 1', description: 'This is the first sample item' },
    { id: 2, name: 'Sample Item 2', description: 'This is the second sample item' }
];

// Counter for generating new item IDs
let nextId = 3;

// GET /items - Retrieve all items
app.get('/items', (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: items,
            count: items.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error occurred while fetching items'
        });
    }
});

// POST /items - Create a new item
app.post('/items', (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        // Create new item
        const newItem = {
            id: nextId++,
            name: name.trim(),
            description: description ? description.trim() : ''
        };

        // Add to items array
        items.push(newItem);

        // Return the created item
        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            data: newItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error occurred while creating item'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Handle 404 for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  GET  http://localhost:${PORT}/items`);
    console.log(`  POST http://localhost:${PORT}/items`);
    console.log(`  GET  http://localhost:${PORT}/health`);
});

module.exports = app;
