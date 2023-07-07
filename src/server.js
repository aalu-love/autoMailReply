const express = require('express');
const mailRoutes = require('./routes/mailRoutes');

const app = express();
const port = 3000;

app.use(express.json());

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Mail routes API
app.use('/api', mailRoutes);

// Define a route handler for the root URL
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
