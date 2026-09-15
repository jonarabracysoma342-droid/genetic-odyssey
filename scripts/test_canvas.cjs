const sharp = require('sharp');
const { createCanvas } = require('canvas') || {}; // check if canvas package is installed

// If canvas is not installed, we can write a quick SVG or HTML test or check node modules
console.log('Testing dependencies...');
