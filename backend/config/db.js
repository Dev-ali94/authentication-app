const mongoose = require('mongoose');
// mongodb connection function 
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('DB Connection Error:', err.message);
    process.exit(1);
  }
};
module.exports = connectDB;