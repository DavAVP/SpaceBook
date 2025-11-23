require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const app = express()
const path = require('path')

app.use(cors({
    origin: ['http://localhost:4173', 'https://spacebook-lime.vercel.app'],
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