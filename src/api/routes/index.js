/**
 * API route definitions
 */
const express = require('express');
const contractController = require('../controllers/contract.controller');

const router = express.Router();

// Chat endpoint
router.post('/chat', contractController.handleChat);

// Health check endpoint
router.get('/health', contractController.healthCheck);

// Language check/set endpoint
router.post('/language', contractController.setLanguage);
router.get('/language', contractController.getLanguage);

router.post('/generate-code', contractController.generateCode);

module.exports = router;