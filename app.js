require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error Handler
const errorHandler = require('./middlewares/errorHandler');

app.use((req, res, next) => {
  res.sendError = errorHandler.bind(null, req, res);
  next();
});

// Response Handler
const responseHandler = require('./middlewares/responseHandler');

app.use((req, res, next) => {
  res.sendResponse = responseHandler.bind(null, res);
  next();
});

// CORS
const corsOptions = {
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Routes
app.use('/session', require('./routes/session'));
app.use('/message', require('./routes/message'));
app.use('/auth', require('./routes/auth'));


// 404
// app.use((req, res) => { res.status(404).send(null); });

// Logger
const { logger } = require('./utils/logger');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
app.listen(PORT, HOST, () => {
  logger.info(`Server running at http://${HOST}:${PORT}/`);
});

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
