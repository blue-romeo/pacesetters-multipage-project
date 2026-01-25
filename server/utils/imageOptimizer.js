/**
 * Image Optimization Utilities
 * Helper functions for optimizing images before storage
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Optimize and resize image
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} options - Optimization options
 * @returns {Promise<Buffer>} Optimized image buffer
 */

async function optimizeImage(imageBuffer, options = {}) {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 80,
        format = 'jpeg'
    } = options;

    try {
        let image = sharp(imageBuffer);
        
        // Get metadata
        const metadata = await image.metadata();
        
        // Resize if needed
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
            image = image.resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        
        // Compress based on format
        if (format === 'jpeg' || format === 'jpg') {
            image = image.jpeg({ quality, progressive: true });
        } else if (format === 'png') {
            image = image.png({ quality, compressionLevel: 9 });
        } else if (format === 'webp') {
            image = image.webp({ quality });
        }
        
        return await image.toBuffer();
    } catch (error) {
        console.error('Image optimization error:', error);
        throw new Error('Failed to optimize image');
    }
}


/**
 * Create thumbnail from image
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {number} size - Thumbnail size (width and height)
 * @returns {Promise<Buffer>} Thumbnail buffer
 */

async function createThumbnail(imageBuffer, size = 300) {
    try {
        return await sharp(imageBuffer)
            .resize(size, size, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 70 })
            .toBuffer();
    } catch (error) {
        console.error('Thumbnail creation error:', error);
        throw new Error('Failed to create thumbnail');
    }
}


/**
 * Get image dimensions
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} Image dimensions {width, height, format}
 */

async function getImageInfo(imageBuffer) {
    try {
        const metadata = await sharp(imageBuffer).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: metadata.size
        };
    } catch (error) {
        console.error('Get image info error:', error);
        throw new Error('Failed to get image information');
    }
}


/**
 * Validate image file
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - Validation options
 * @returns {Promise<boolean>} Is valid
 */

async function validateImage(imageBuffer, options = {}) {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB
        allowedFormats = ['jpeg', 'jpg', 'png', 'webp']
    } = options;
    
    try {
        const metadata = await sharp(imageBuffer).metadata();
        
        // Check format
        if (!allowedFormats.includes(metadata.format)) {
            throw new Error(`Invalid format. Allowed: ${allowedFormats.join(', ')}`);
        }
        
        // Check size
        if (metadata.size > maxSize) {
            throw new Error(`Image too large. Max size: ${maxSize / 1024 / 1024}MB`);
        }
        
        return true;
    } catch (error) {
        console.error('Image validation error:', error);
        throw error;
    }
}


// Example usage in controller:

const { optimizeImage, createThumbnail } = require('../utils/imageOptimizer');

exports.uploadGalleryImage = async (req, res) => {
    try {
        // Get image from request (e.g., multer)
        const imageBuffer = req.file.buffer;
        
        // Optimize main image
        const optimizedImage = await optimizeImage(imageBuffer, {
            maxWidth: 1920,
            quality: 85
        });
        
        // Create thumbnail
        const thumbnail = await createThumbnail(imageBuffer, 300);
        
        // Save to storage (S3, local, etc.)
        // const imageUrl = await saveToStorage(optimizedImage);
        // const thumbnailUrl = await saveToStorage(thumbnail);
        
        // Save to database
        // ...
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    optimizeImage,
    createThumbnail,
    getImageInfo,
    validateImage
};
