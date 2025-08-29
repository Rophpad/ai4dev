const express = require("express");
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory storage for items
let items = [];
let nextId = 1;

// GET /items - retrieve all items
app.get("/items", (req, res) => {
  res.json(items);
});

// POST /items - create a new item
app.post("/items", (req, res) => {
  const newItem = {
    id: nextId++,
    ...req.body,
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
