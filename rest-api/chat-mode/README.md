# Chat Mode REST API

A simple REST API built with Node.js and Express that provides endpoints to manage items.

## Features

- **GET /items** - Retrieve all items
- **POST /items** - Create a new item
- **GET /health** - Health check endpoint
- In-memory storage for quick testing
- Input validation and error handling
- JSON responses with consistent format

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on port 3000 by default (or use PORT environment variable).

## API Endpoints

### GET /items

Retrieve all items.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sample Item 1",
      "description": "This is the first sample item"
    }
  ],
  "count": 1
}
```

### POST /items

Create a new item.

**Request Body:**
```json
{
  "name": "New Item",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": 3,
    "name": "New Item",
    "description": "Optional description"
  }
}
```

**Validation:**
- `name` is required
- `description` is optional

### GET /health

Health check endpoint to verify the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Usage Examples

### Using curl

**Get all items:**
```bash
curl http://localhost:3000/items
```

**Create a new item:**
```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{"name": "My New Item", "description": "A great new item"}'
```

**Health check:**
```bash
curl http://localhost:3000/health
```

### Using JavaScript fetch

**Get all items:**
```javascript
fetch('http://localhost:3000/items')
  .then(response => response.json())
  .then(data => console.log(data));
```

**Create a new item:**
```javascript
fetch('http://localhost:3000/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My New Item',
    description: 'A great new item'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Error Handling

The API returns appropriate HTTP status codes:

- **200** - Success (GET requests)
- **201** - Created (POST requests)
- **400** - Bad Request (validation errors)
- **404** - Not Found (invalid routes)
- **500** - Internal Server Error

Error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Data Storage

This implementation uses in-memory storage for simplicity. The data will be reset when the server restarts. For production use, you would typically integrate with a database like MongoDB, PostgreSQL, or MySQL.

## Development

The project includes:
- Express.js for the web framework
- JSON middleware for parsing request bodies
- Error handling middleware
- Input validation
- Consistent response formatting

## License

ISC