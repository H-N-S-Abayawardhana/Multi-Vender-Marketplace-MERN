require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connection successfully"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// Start Server
const PORT = process.env.PORT || 9001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
