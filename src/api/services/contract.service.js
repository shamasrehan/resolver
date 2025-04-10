/**
 * Service for handling smart contract generation workflow
 */
const openaiService = require('./openai.service');
const promptUtils = require('../../utils/prompt.utils');
const codeGenerator = require('../../utils/code-generator.utils');
const functionExecutor = require('../../utils/function-executor.utils');
const config = require('../../config');

/**
 * The main multi-phase function for smart contract generation
 * 
 * @param {string} userInput - Message from the user
 * @param {Array} conversation - Current conversation history
 * @param {number} phase - Current phase (1 or 2)
 * @param {string} selectedLanguage - Selected contract language
 * @returns {Object} Result object with phase, conversation, message, etc.
 */
async function handleSmartContractAssistant(userInput, conversation = [], phase = 1, selectedLanguage) {
  try {
    if (phase === 1) {
      return await handlePhase1(userInput, conversation, selectedLanguage);
    } else if (phase === 2) {
      return await handlePhase2(userInput, conversation, selectedLanguage);
    }
  } catch (error) {
    console.error("Error in handleSmartContractAssistant:", error);
    return {
      phase: phase,
      conversation: conversation,
      error: "An unexpected error occurred. Please try again or start a new conversation."
    };
  }
}

/**
 * Handle Phase 1: Requirements gathering
 */
async function handlePhase1(userInput, conversation, selectedLanguage) {
  if (conversation.length === 0) {
    // Starting Phase 1
    const newConversation = await startPhase1(userInput, selectedLanguage);
    return {
      phase: 1,
      conversation: newConversation,
      message: newConversation[newConversation.length - 1].content
    };
  } else {
    // Continue Phase 1
    const result = await continuePhase1(conversation, userInput, selectedLanguage);
    
    // Check if we should transition to Phase 2
    const isRequirementsSummary = result.message.includes("=== REQUIREMENTS SUMMARY ===") || 
                                  result.message.includes("REQUIREMENTS SUMMARY");
                                  
    const userConfirms = userInput.toLowerCase().match(/\b(yes|confirm|agree|ok|proceed|generate|phase 2|correct|sounds good|looks good|that's right|that is right)\b/);
    
    const readyForPhase2 = (isRequirementsSummary && conversation.length > 6) || 
                         (userConfirms && result.message.includes("summary") && conversation.length > 6);

    if (readyForPhase2) {
      // Transition to Phase 2
      try {
        const contract = await generateSmartContract(result.conversation, selectedLanguage);
        
        return {
          phase: 2,
          conversation: result.conversation,
          contract,
          message: contract.error 
            ? `I encountered an issue generating the contract: ${contract.error}. Would you like to provide additional details or try again?`
            : "Smart contract has been generated based on your requirements. You can view it in the Contract Preview tab."
        };
      } catch (error) {
        console.error("Error transitioning to Phase 2:", error);
        return {
          phase: 1,
          conversation: result.conversation,
          message: "I encountered an issue while generating your contract. Could you provide more details about what you're looking for?"
        };
      }
    } else {
      return {
        phase: 1,
        conversation: result.conversation,
        message: result.message
      };
    }
  }
}

/**
 * Start Phase 1 conversation
 */
async function startPhase1(userQuery, selectedLanguage, contractType = 'default') {
  try {
    const systemPrompt = promptUtils.compilePrompt('phase1.system', {
      language: selectedLanguage,
      contractType: contractType
    });
    
    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "assistant",
        content:
          userQuery ||
          "Hi there! I'll help you create a custom smart contract. To get started:  \n\nWhat type of smart contract are you looking to create? (Examples: token, marketplace, vesting schedule, multisig wallet, voting system, etc.)\n\n(If anything is unclear, you can ask for clarification before answering.)"
      }
    ];
    
    try {
      const response = await openaiService.createChatCompletion(messages, 'phase1');
      
      const assistantReply = response.choices[0].message.content;
      return [...messages, { role: "assistant", content: assistantReply }];
    } catch (openaiError) {
      console.error("OpenAI API error during Phase 1 start:", openaiError);
      
      // Return a graceful error message
      return [
        ...messages,
        { 
          role: "assistant", 
          content: "I'm sorry, I encountered an issue while processing your request. Please try again in a moment. If the problem persists, please check your network connection or try refreshing the page."
        }
      ];
    }
  } catch (error) {
    console.error("Problem during Phase 1 start:", error);
    return [{ role: "assistant", content: "I apologize, but there was a technical issue starting our conversation. Please try again or contact support if the issue persists." }];
  }
}

/**
 * Continue Phase 1 conversation
 */
async function continuePhase1(conversation, userMessage, selectedLanguage) {
  try {
    // Detect if user message appears to be asking for a contract type
    const contractTypeRegex = /\b(token|marketplace|dao|nft|vesting|multisig|auction|wallet|voting)\b/i;
    const contractTypeMatch = userMessage.match(contractTypeRegex);
    const contractType = contractTypeMatch ? contractTypeMatch[1].toLowerCase() : 'default';
    
    // Update system prompt if this is early in the conversation to optimize for contract type
    let updatedConversation = [...conversation];
    
    // Only update system message if we're in the first 3 messages (early stage)
    if (conversation.length <= 3 && contractType !== 'default') {
      const systemPrompt = promptUtils.compilePrompt('phase1.system', {
        language: selectedLanguage,
        contractType: contractType
      });
      
      // Replace the first system message
      if (updatedConversation[0].role === 'system') {
        updatedConversation[0] = { role: 'system', content: systemPrompt };
      }
    }
    
    // Add user message
    updatedConversation.push({ role: "user", content: userMessage });
    
    try {
      const response = await openaiService.createChatCompletion(updatedConversation, 'phase1');
      
      const assistantMessage = response.choices[0].message.content;
      updatedConversation.push({ role: "assistant", content: assistantMessage });
      return { conversation: updatedConversation, message: assistantMessage };
    } catch (openaiError) {
      console.error("OpenAI API error during Phase 1 continuation:", openaiError);
      
      // Add a graceful error message but preserve the conversation
      updatedConversation.push({ 
        role: "assistant", 
        content: "I'm sorry, I encountered an issue processing your message. Could we try again? If the problem persists, you might want to refresh the page or try a slightly different approach to your question." 
      });
      
      return { 
        conversation: updatedConversation, 
        message: "I'm sorry, I encountered an issue processing your message. Could we try again? If the problem persists, you might want to refresh the page or try a slightly different approach to your question." 
      };
    }
  } catch (error) {
    console.error("Problem continuing Phase 1:", error);
    return { 
      conversation, 
      message: "I apologize, but there was a technical issue continuing our conversation. Please try again or contact support if the issue persists." 
    };
  }
}

/**
 * Generate smart contract based on requirements summary
 */
async function generateSmartContract(conversation, selectedLanguage) {
  try {
    // Summarize the Phase 1 conversation
    const requirementsSummary = await summarizeRequirements(conversation, selectedLanguage);
    console.log("Generating contract from summary:", requirementsSummary.slice(0,100), "...");

    // Create Phase 2 prompts with the correct language and schema
    const phase2Messages = [
      { 
        role: "system", 
        content: promptUtils.compilePrompt('phase2.system', { 
          language: selectedLanguage
        }) 
      },
      {
        role: "user",
        content: `Here is the requirements summary for the smart contract:\n\n${requirementsSummary}`
      }
    ];

    try {
      const response = await openaiService.createChatCompletion(phase2Messages, 'phase2', true);
      const rawContent = response.choices[0].message.content;

      // Attempt to parse JSON output
      try {
        const parsedJson = JSON.parse(rawContent);
        
        // Generate sample contract code based on the JSON
        const contractCode = await codeGenerator.generateContractCode(parsedJson, selectedLanguage);
        
        // Return both the JSON spec and generated code
        return {
          jsonSpec: parsedJson,
          contracts: [
            {
              name: parsedJson.contractName || "SmartContract",
              content: contractCode
            }
          ]
        };
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        
        // Try to repair the JSON if possible
        const repairedJson = promptUtils.attemptJsonRepair(rawContent);
        if (repairedJson) {
          console.log("Successfully repaired JSON");
          
          // Generate sample contract code based on the repaired JSON
          const contractCode = await codeGenerator.generateContractCode(repairedJson, selectedLanguage);
          
          return {
            jsonSpec: repairedJson,
            contracts: [
              {
                name: repairedJson.contractName || "SmartContract",
                content: contractCode
              }
            ],
            warning: "The JSON had to be repaired - please review carefully."
          };
        }
        
        return { 
          error: "Failed to parse as JSON", 
          rawContent,
          errorDetails: jsonError.message
        };
      }
    } catch (openaiError) {
      console.error("OpenAI API error in Phase 2 generation:", openaiError);
      return { error: "Error communicating with AI service. Please try again." };
    }
  } catch (error) {
    console.error("Error in Phase 2 generation:", error);
    return { error: "Error generating the smart contract." };
  }
}

/**
 * Summarize requirements from conversation
 */
async function summarizeRequirements(conversation, selectedLanguage) {
  try {
    const summaryMessages = [
      {
        role: "system",
        content: promptUtils.compilePrompt('summarize.system', { language: selectedLanguage })
      },
      ...conversation,
      {
        role: "user",
        content: "Please provide a structured summary of all the requirements for this smart contract."
      }
    ];
    
    try {
      const response = await openaiService.createChatCompletion(summaryMessages, 'summary');
      
      return response.choices[0].message.content;
    } catch (openaiError) {
      console.error("OpenAI API error summarizing requirements:", openaiError);
      
      // Create a basic summary from the conversation as a fallback
      return promptUtils.createBasicSummary(conversation);
    }
  } catch (error) {
    console.error("Error summarizing requirements:", error);
    return "Error summarizing requirements. Using raw conversation instead.";
  }
}

/**
 * Handle Phase 2: Contract refinement
 */
async function handlePhase2(userInput, conversation, selectedLanguage) {
  // Check if it's a function call
  if (userInput.startsWith("/")) {
    return handleFunctionCall(userInput, conversation);
  } else {
    // Normal message in Phase 2 - Use GPT to refine or discuss
    return handleDiscussion(userInput, conversation, selectedLanguage);
  }
}

/**
 * Handle function call in Phase 2
 */
async function handleFunctionCall(userInput, conversation) {
  const parts = userInput.substring(1).split(" ");
  const command = parts[0];
  const functionArgs = userInput.substring(command.length + 2);
  const allFunctions = ["bugFix", "securityAudit", "gasOptimization", "generateTests"];

  if (allFunctions.includes(command)) {
    try {
      let params;
      try {
        params = functionArgs.trim().length > 0 ? JSON.parse(functionArgs) : {};
      } catch (jsonError) {
        console.warn("Invalid JSON for function args, using empty object:", jsonError);
        params = {};
      }
      
      const funcResult = await functionExecutor.executeFunction(command, params);
      
      return {
        phase: 2,
        conversation: [
          ...conversation,
          { role: "user", content: userInput },
          { role: "assistant", content: `Function result: ${JSON.stringify(funcResult, null, 2)}` }
        ],
        functionResult: funcResult,
        message: `Function ${command} executed successfully.`
      };
    } catch (err) {
      console.error("Error executing function:", err);
      return { 
        phase: 2, 
        conversation: [
          ...conversation,
          { role: "user", content: userInput },
          { role: "assistant", content: `Error executing function: ${err.message}` }
        ],
        error: `Error executing function: ${err.message}` 
      };
    }
  } else {
    return { 
      phase: 2, 
      conversation: [
        ...conversation,
        { role: "user", content: userInput },
        { role: "assistant", content: `Unknown command: ${command}. Available commands are: ${allFunctions.join(', ')}` }
      ],
      error: `Unknown command: ${command}` 
    };
  }
}

/**
 * Handle discussion in Phase 2
 */
async function handleDiscussion(userInput, conversation, selectedLanguage) {
  try {
    // Create a system message to explain Phase 2 context
    const phase2SystemMessage = {
      role: "system",
      content: `You are an expert ${selectedLanguage} developer assisting with a smart contract that has already been generated. 
The user wants to discuss, refine, or ask questions about the contract. 
Focus on providing helpful information about the contract, explaining functionality, or suggesting improvements.
If the user wants significant changes, guide them on how to articulate those changes clearly.`
    };
    
    // Add the system message at the start of the conversation for this specific message
    // but don't persist it in the stored conversation
    const refinementConversation = [
      phase2SystemMessage,
      ...conversation,
      { role: "user", content: userInput }
    ];
    
    const response = await openaiService.createChatCompletion(refinementConversation, 'discussion');
    
    const assistantMessage = response.choices[0].message.content;
    
    return {
      phase: 2,
      conversation: [
        ...conversation,
        { role: "user", content: userInput },
        { role: "assistant", content: assistantMessage }
      ],
      message: assistantMessage
    };
  } catch (error) {
    console.error("Error in Phase 2 discussion:", error);
    return {
      phase: 2,
      conversation: [
        ...conversation,
        { role: "user", content: userInput }
      ],
      message: "I'm sorry, I encountered an issue processing your message. Could you try rephrasing or providing more details?"
    };
  }
}

module.exports = {
  handleSmartContractAssistant
};