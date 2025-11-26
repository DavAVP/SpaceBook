require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const app = express()
const path = require('path')

/* const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:4173'; */
const allowedOrigins = [
    'http://localhost:4173',
    'http://localhost:5173',
    'https://spacebook-lime.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use(cors({
    /* origin: [allowedOrigin], */
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Routes - rutas del servidor 
app.use(require('./routes/index'))

// Static Content
const frontendPath = path.join(__dirname, '../dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

module.exports = app;
