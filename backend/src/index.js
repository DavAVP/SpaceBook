require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const app = express()
const path = require('path')

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:4173';
app.use(cors({
    origin: [allowedOrigin],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(morgan('dev'))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Routes - rutas del servidor 
app.use(require('./routes/index'))

// Static Content
const frontendPath = path.join(__dirname, '../../spacebook/dist');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(8080, () => console.log('Servidor corriendo en http://localhost:8080'));

module.exports = app;
