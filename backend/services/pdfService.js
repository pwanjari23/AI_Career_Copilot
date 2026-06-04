const fs = require('fs');
const pdf = require('pdf-parse');

/**
 * Extract raw text from a PDF file
 * @param {string} filePath Absolute or relative path to PDF file
 * @returns {Promise<string>} Extracted text
 */
const parsePdf = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    // Return extracted text content
    return data.text || '';
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse resume PDF file: ' + error.message);
  }
};

module.exports = {
  parsePdf,
};
