// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();

// Replace bodyParser with express's built-in JSON parser (optional best practice)
app.use(express.json());

app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt with three-phase instructions
const systemPrompt = `
You are a Solidity Contract Developer AI assistant. You will follow these rules precisely and output only valid JSON when responding. Your behavior is governed by three possible phases of interaction:

--------------------------------------------------------------------------------
1. Requirements Gathering Phase (Q&A)
--------------------------------------------------------------------------------
- When to Use: If the user’s request or description of the contract is missing details or unclear, you must start by asking clarifying questions in JSON format.
- Format:
  {
    "question": "Your question text here"
  }
- Instructions:
  - Ask only one question at a time.
  - Only ask for information the user has not already provided.
  - Example types of questions:
    - For ERC20 tokens: Token name, symbol, decimals, total supply, ownership, burn/mint/pause features, etc.
    - For ERC721 tokens: Token name, symbol, metadata (base URI or per-token), mint/burn/pause features, royalties, etc.
  - Continue asking questions until all details are clear. Once everything is specified, move to the Code Generation Phase.
  - If the user has provided all information upfront, skip this phase entirely.

--------------------------------------------------------------------------------
2. Contract Code Generation Phase
--------------------------------------------------------------------------------
- When to Use: Once you have all technical details for the contract from the user (whether gathered in the Q&A phase or provided initially).
- Output Format: A single JSON object with the following structure:

{
  "contractName": "string",
  "compilerVersion": "string",
  "language": "Solidity",
  "license": "string",
  "contractBody": {
    "pragmas": [
      {
        "version": "string",
        "type": "solidity"
      }
    ],
    "imports": ["string"]?,
    "stateVariables": [
      {
        "name": "string",
        "type": "string",
        "visibility": "public|private|internal",
        "description": "string"
      }
    ],
    "functions": [
      {
        "name": "string",
        "type": "function",
        "inputs": [
          {
            "name": "string",
            "type": "string",
            "description": "string"
          }
        ]?,
        "outputs": [
          {
            "name": "string",
            "type": "string",
            "description": "string"
          }
        ]?,
        "visibility": "public|private|internal|external",
        "mutability": "pure|view|payable|nonpayable",
        "description": "string",
        "code": "string"
      }
    ],
    "events": [
      {
        "name": "string",
        "type": "event",
        "inputs": [
          {
            "name": "string",
            "type": "string",
            "indexed": "boolean",
            "description": "string"
          }
        ],
        "description": "string"
      }
    ]?,
    "modifiers": [
      {
        "name": "string",
        "description": "string"
      }
    ]?,
    "constructor": {
      "inputs": [
        {
          "name": "string",
          "type": "string",
          "description": "string"
        }
      ]?,
      "visibility": "public",
      "description": "string",
      "code": "string"
    }
  }
}

- Rules:
  - No Comments: The "code" fields must not contain any inline or block comments.
  - No Extra Text: Only output the JSON object, nothing else.
  - Matching Compiler Versions: If the user specifies a version, match that. Otherwise, default to a stable version like "0.8.17".
  - Valid License: Provide a valid SPDX license (e.g., "MIT", "GPL-3.0", etc.).
  - Always Provide Non-Empty Arrays: If an array is empty, output []. If truly optional, you can omit the field.

--------------------------------------------------------------------------------
3. Code Review Phase
--------------------------------------------------------------------------------
- When to Use: If the user provides existing Solidity code and asks for a review or improvements.
- Output Format: A single JSON object containing an array of detected issues, each with a description, severity, and recommendation:

{
  "issues": [
    {
      "description": "Issue description",
      "severity": "High|Medium|Low",
      "location": "Optional location info, e.g., function name or line number",
      "recommendation": "Fix suggestion"
    }
  ]
}

- Rules:
  - Always include at least one issue, even if it is a minor best-practice suggestion.
  - Identify security weaknesses, potential logic errors, or standard compliance issues.

--------------------------------------------------------------------------------
IMPORTANT REMINDERS:
- No Additional Commentary: Respond only with valid JSON in the specified structure.
- If Conflicts Arise: Seek clarification in Q&A format if the user’s requirements are contradictory.
- Implementation Focus: For code generation, provide fully functional Solidity code within the "code" fields, respecting the no-comments rule.
--------------------------------------------------------------------------------
`;

let conversationHistory = [];

app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const userLang = req.body.selectedLanguage || 'solidity';

    // Store user message in conversation
    conversationHistory.push({ role: 'user', content: userMessage });

    // Build the system + user messages
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory
    ];

    // Example function definitions (optional)
    const functions = [
      {
        name: "askClarifyingQuestion",
        description: "Asks a clarifying question in the Q&A phase.",
        parameters: {
          type: "object",
          properties: {
            question: { type: "string" }
          },
          required: ["question"]
        }
      },
      {
        name: "generateSolidityContract",
        description: "Generate the contract JSON.",
        parameters: {
          type: "object",
          properties: {
            "contractName": { type: "string" },
            "compilerVersion": { type: "string" },
            "language": { type: "string" },
            "license": { type: "string" },
            "contractBody": {
              type: "object",
              properties: {
                "pragmas": {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      "version": { type: "string" },
                      "type": { type: "string" }
                    }
                  }
                },
                "imports": {
                  type: "array",
                  items: { type: "string" }
                },
                "stateVariables": {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      "name": { type: "string" },
                      "type": { type: "string" },
                      "visibility": { type: "string" },
                      "description": { type: "string" }
                    }
                  }
                },
                "functions": {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      "name": { type: "string" },
                      "type": { type: "string" },
                      "inputs": {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            "name": { type: "string" },
                            "type": { type: "string" },
                            "description": { type: "string" }
                          }
                        }
                      },
                      "outputs": {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            "name": { type: "string" },
                            "type": { type: "string" },
                            "description": { type: "string" }
                          }
                        }
                      },
                      "visibility": { type: "string" },
                      "mutability": { type: "string" },
                      "description": { type: "string" },
                      "code": { type: "string" }
                    }
                  }
                },
                "events": {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      "name": { type: "string" },
                      "type": { type: "string" },
                      "inputs": {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            "name": { type: "string" },
                            "type": { type: "string" },
                            "indexed": { type: "boolean" },
                            "description": { type: "string" }
                          }
                        }
                      },
                      "description": { type: "string" }
                    }
                  }
                },
                "modifiers": {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      "name": { type: "string" },
                      "description": { type: "string" }
                    }
                  }
                },
                "constructor": {
                  type: "object",
                  properties: {
                    "inputs": {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          "name": { type: "string" },
                          "type": { type: "string" },
                          "description": { type: "string" }
                        }
                      }
                    },
                    "visibility": { type: "string" },
                    "description": { type: "string" },
                    "code": { type: "string" }
                  }
                }
              }
            }
          }
        }
      },
      {
        name: "reviewSolidityCode",
        description: "Perform code review",
        parameters: {
          type: "object",
          properties: {
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  severity: { type: "string", enum: ["High", "Medium", "Low"] },
                  location: { type: "string" },
                  recommendation: { type: "string" }
                },
                required: ["description", "severity", "recommendation"]
              }
            }
          },
          required: ["issues"]
        }
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106', // or 'gpt-3.5-turbo' if needed
      messages: messages,
      functions: functions,
      function_call: 'auto',
      temperature: 0.3,
      max_tokens: 1500
    });

    const choice = response.choices[0].message;
    let aiResponse;

    // If GPT used a function_call, parse its arguments as JSON
    if (choice.function_call && choice.function_call.arguments) {
      try {
        aiResponse = JSON.parse(choice.function_call.arguments);
      } catch (err) {
        // If parsing fails, wrap the raw arguments in JSON
        aiResponse = {
          error: "Failed to parse function_call arguments",
          raw: choice.function_call.arguments
        };
      }
    } 
    // Otherwise, attempt to parse the direct content
    else {
      try {
        aiResponse = JSON.parse(choice.content);
      } catch (err) {
        // If content isn't valid JSON, wrap it
        aiResponse = {
          error: "Assistant response was not valid JSON",
          raw: choice.content
        };
      }
    }

    // Keep track of conversation in memory
    // Store the assistant response as stringified JSON to maintain consistency
    conversationHistory.push({ role: 'assistant', content: JSON.stringify(aiResponse) });

    // Return a string so the front-end can `JSON.parse` it
    res.json({ response: JSON.stringify(aiResponse) });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
