const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const crypto = require('crypto');

/**
 * Generate a secure, unique filename for the avatar
 * @param {string} userId - User's unique identifier
 * @param {string} originalExtension - Original file extension
 * @returns {string} Secure filename
 */
const generateSecureFilename = (userId, originalExtension = 'jpg') => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${userId}_${timestamp}_${randomString}.${originalExtension}`;
};

/**
 * Download a profile picture from a given URL and save it securely
 * @param {string} url - URL of the profile picture
 * @param {string} userId - User's unique identifier
 * @returns {Promise<string|null>} Path to the saved profile picture or null if download fails
 */

const downloadProfilePicture = async (url, saveDirPath, userId) => {
    try {
        // Ensure the uploads directory exists
        const uploadDir = saveDirPath;
        await fs.ensureDir(uploadDir);

        // Determine file extension (default to jpg)
        const urlExtension = path.extname(url).toLowerCase().replace('.', '') || 'jpg';
        const filename = generateSecureFilename(userId, urlExtension);
        const filepath = path.join(uploadDir, filename);

        const publicPath = path.join('/static', 'uploads', 'profiles', filename);

        // Download image
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            maxContentLength: 5 * 1024 * 1024, // 5MB limit
            headers: {
                'User-Agent': 'MesoCard Profile Picture Downloader'
            }
        });

        // Validate content type
        const contentType = response.headers['content-type'];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(contentType)) {
            throw new Error('Unsupported image type');
        }

        // Save image
        const writer = fs.createWriteStream(filepath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(publicPath));
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Profile picture download failed:', error);
        return null;
    }
};

module.exports = {
    downloadProfilePicture,
    generateSecureFilename
};
