require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const app = express()
const path = require('path')

const allowedOrigins = [
    'http://localhost:4173',
    'http://localhost:5173',
    'https://spacebook-lime.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({

    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Routes - rutas del servidor 
app.use(require('./routes/index'))

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

module.exports = app;