require('dotenv').config();

module.exports = {
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    MYSQL_DB: process.env.MYSQL_DB,
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS || 10,
    LOGIN_PROCESS_GAP_DELAY: process.env.LOGIN_PROCESS_GAP_DELAY,
}