require('express-async-errors');
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require('path');
const sequelize = require('./config/db');

const authRoutes = require('./api/routes/authRoutes');
const clientRoutes = require('./web/routes/clientRoutes');
const adminRoutes = require('./api/routes/adminRoutes');
const userRoutes = require('./api/routes/userRoutes');
const uploadRoutes = require('./api/routes/uploadRoutes');

const requestIp = require('request-ip');
const logger = require('./utils/logger');
const notFoundMiddleware = require('./api/middlewares/notFound');
const errorMiddleware = require('./api/middlewares/errorHandler');

// Multilingual
const i18nextMiddleware = require('i18next-http-middleware');
const i18next = require('./config/i18next');

// Security
//const cors = require('cors');
const xss = require('xss-clean');

/*
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'http://127.0.0.1:3000'],
        scriptSrc: ["'self'", "cdn.jsdelivr.net"], // if you load scripts from a cdn.
      }
    })
)
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
}))
*/


const uploadDir = path.join(__dirname, '..', 'client', 'public', 'static', 'uploads', 'profiles');
process.env.UPLOAD_DIR = uploadDir;

const app = express();
app.set('trust proxy', 1) // trust first proxy
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'web', 'views'));
//app.use(cors());
app.use(xss());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(requestIp.mw());
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'prod', 
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(i18nextMiddleware.handle(i18next));


// Health Checker
app.get("/healthz", (req, res) => {
    const start = process.hrtime();
    
    res.status(200).json({
        status: "ok",
        timestamp: Date.now(),
        responseTime: process.hrtime(start)[1] / 1000000 // Convert to milliseconds
    });
});
  
// Client Routes
app.use('/', clientRoutes);

// REST API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Error Handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connected');
        app.listen(process.env.SERVER_PORT, () => logger.info(`Server operating on port ${process.env.SERVER_PORT}`));
    } catch(error) {
        logger.error('Error connecting to database:', error);
        process.exit(1);
    }
}

startServer();
