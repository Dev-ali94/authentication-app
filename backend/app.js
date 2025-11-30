const express = require('express');
const cookieParser = require("cookie-parser");
const cors =require('cors')
const AuthRoutes = require('./routes/AuthRoutes')
const userRoutes =require('./routes/UserRoutes')
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",  // ✅ exact frontend origin
  credentials: true                 // ✅ allow cookies, tokens
}));
app.use('/api/auth', AuthRoutes);
app.use('/api/user', userRoutes );

app.get('/', (req, res) => {
  res.send('This is my autentication app');
});

module.exports = app;
