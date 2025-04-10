/**
 * Application configuration settings
 */

// Contract language constants
const CONTRACT_LANGUAGES = {
  SOLIDITY: 'solidity',
  VYPER: 'vyper',
  RUST: 'rust'
};

// Environment configuration
const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: process.env.OPENAI_API_KEY,
  defaultLanguage: CONTRACT_LANGUAGES.SOLIDITY,
  defaultModel: 'gpt-4',
  
  // OpenAI API config
  openai: {
    timeout: 30000, // 30 seconds
    temperature: {
      phase1: 0.7,
      phase2: 0.3,
      summary: 0.3
    },
    maxTokens: {
      phase1: 500,
      phase2: 2000,
      summary: 2000
    }
  },
  
  // Contract languages
  contractLanguages: CONTRACT_LANGUAGES
};

module.exports = config;