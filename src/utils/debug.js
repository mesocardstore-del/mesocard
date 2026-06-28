const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

// Define log directories
const logDir = path.join(__dirname, '..', '..', 'logs');

// Create logger
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        
        // Rotate application logs daily
        new winston.transports.DailyRotateFile({
            filename: path.join(logDir, 'debug', 'debug-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d'
        })
    ]
});

const debug = (...messages) => {
    if (process.env.NODE_ENV === 'dev'){
        logger.debug(`${messages}`);
    }
}

module.exports = {
    debug
};
