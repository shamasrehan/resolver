// Sidebar & Panels
const sidebar = document.getElementById('sidebar');
const generatorPanel = document.getElementById('generatorPanel');
const examplePanel1 = document.getElementById('examplePanel1');
const examplePanel2 = document.getElementById('examplePanel2');

// Chat & Contract Preview
const chatContainer = document.getElementById('chat-container');
const chatNotifications = document.getElementById('chatNotifications');
const form = document.getElementById('input-form');
const messageInput = document.getElementById('message-input');
const submitBtn = document.getElementById('submit-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const buttonText = document.getElementById('button-text');
const finalContractDiv = document.getElementById('finalContract');
const chatModeSelect = document.getElementById('chatModeSelect');

// Step & Contract State
let currentStep = 1;
let currentContract = null;
let viewMode = 'solidity';
let selectedLanguage = 'solidity';

// Language toggles
const solidityToggle = document.getElementById('solidityToggle');
const vyperToggle = document.getElementById('vyperToggle');
const rustToggle = document.getElementById('rustToggle');

/* --- "Toast" moved inside chat => We'll show them in a colorful area below toggles. --- */
function addNotification(message) {
  // Instead of a toast, we place a new div in chatNotifications
  const note = document.createElement('div');
  note.className = 'chat-notification'; 
  note.textContent = message;
  
  chatNotifications.appendChild(note);

  // Remove after a few seconds
  setTimeout(() => {
    if (note.parentNode) {
      note.parentNode.removeChild(note);
    }
  }, 5000);
}

/* --- SIDEBAR TOGGLE --- */
function toggleSidebar() {
  sidebar.classList.toggle('collapsed');
}

/* --- SHOW PANELS & highlight active sidebar item --- */
function showPanel(panelId, evt) {
  // Remove 'active' from all sidebar items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  // Mark this item active
  if (evt) {
    evt.currentTarget.classList.add('active');
  }

  // Hide all panels
  generatorPanel.style.display = 'none';
  examplePanel1.style.display = 'none';
  examplePanel2.style.display = 'none';

  // Show chosen panel
  if (panelId === 'generatorPanel') {
    generatorPanel.style.display = 'flex';
  } else if (panelId === 'examplePanel1') {
    examplePanel1.style.display = 'block';
  } else if (panelId === 'examplePanel2') {
    examplePanel2.style.display = 'block';
  }
}

/* --- SWITCH TABS (Contract Preview, My Contracts, Audit Report, Template Dapps) --- */
function switchTab(tabId) {
  // Deactivate all tab buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  // Deactivate all tab contents
  document.querySelectorAll('.tab-content').forEach(tabContent => {
    tabContent.classList.remove('active');
  });
  // Activate clicked tab
  event.currentTarget.classList.add('active');
  const targetTab = document.getElementById(tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }
}

/* --- LANGUAGE TOGGLE --- */
function setLanguage(lang) {
  selectedLanguage = lang;
  solidityToggle.classList.remove('active');
  vyperToggle.classList.remove('active');
  rustToggle.classList.remove('active');

  if (lang === 'solidity') solidityToggle.classList.add('active');
  if (lang === 'vyper') vyperToggle.classList.add('active');
  if (lang === 'rust') rustToggle.classList.add('active');

  console.log('Selected language => ', selectedLanguage);
}

/* --- MODE CHANGE (Basic / Advanced) --- */
function changeChatMode() {
  const mode = chatModeSelect.value;
  addNotification(`Switched to ${mode === 'basic' ? 'Basic' : 'Advanced'} Mode`);
  // Potentially change chat behavior based on mode...
}

/* --- STEP INDICATOR (Optional) --- */
function updateStepIndicator(step) {
  document.querySelectorAll('.step').forEach((el, index) => {
    el.classList.toggle('active', index + 1 === step);
    el.classList.toggle('completed', index + 1 < step);
  });
}

/* --- LOADING STATES --- */
function showLoading() {
  submitBtn.disabled = true;
  buttonText.style.display = 'none';
  loadingSpinner.style.display = 'block';
}
function hideLoading() {
  submitBtn.disabled = false;
  buttonText.style.display = 'block';
  loadingSpinner.style.display = 'none';
}

/* --- MESSAGING UTILS --- */
function addMessage(role, content) {
  const messageDiv = document.createElement('div');
  if (role === 'assistant') {
    messageDiv.className = 'message bot-message';
  } else if (role === 'user') {
    messageDiv.className = 'message user-message';
  } else if (role === 'system') {
    // We'll use addNotification instead of system chat messages
    messageDiv.className = 'message system-notification';
  }
  if (typeof content === 'object') {
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(content, null, 2);
    messageDiv.appendChild(pre);
  } else {
    messageDiv.innerHTML = content;
  }
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* --- CONTRACT PREVIEW --- */
function updateContractPreview(responseData) {
  currentContract = responseData;
  renderContractContent();
}

function generateSolidityCode(contractData) {
  if (!contractData?.contractBody) return 'No contract data available';

  const cb = contractData.contractBody;
  let code = '';

  // Pragmas
  if (cb.pragmas?.length) {
    code += `pragma solidity ${cb.pragmas[0].version};\n\n`;
  }
  // Imports
  if (cb.imports?.length) {
    code += cb.imports.map(i => `import "${i}";`).join('\n') + '\n\n';
  }
  // Contract name
  code += `contract ${contractData.contractName} {\n\n`;

  // State vars
  if (Array.isArray(cb.stateVariables)) {
    cb.stateVariables.forEach(variable => {
      code += `    ${variable.visibility} ${variable.type} ${variable.name};\n`;
    });
    code += '\n';
  }

  // Modifiers
  if (Array.isArray(cb.modifiers)) {
    cb.modifiers.forEach(modifier => {
      code += `    modifier ${modifier.name}() {\n`;
      code += `        _;\n    }\n\n`;
    });
  }

  // Constructor
  if (cb.constructor) {
    const ctorInputs = cb.constructor.inputs?.map(i => `${i.type} ${i.name}`).join(', ') || '';
    code += `    constructor(${ctorInputs}) {\n`;
    code += `        // constructor body\n`;
    code += `    }\n\n`;
  }

  // Functions
  if (Array.isArray(cb.functions)) {
    cb.functions.forEach(func => {
      const inputParams = func.inputs?.map(i => `${i.type} ${i.name}`).join(', ') || '';
      const outputParams = func.outputs
        ? `returns (${func.outputs.map(o => o.type).join(', ')})`
        : '';

      code += `    function ${func.name}(${inputParams})\n`;
      code += `        ${func.visibility}\n`;
      code += `        ${func.mutability}\n`;
      code += `        ${outputParams} {\n`;
      code += `        // function body\n`;
      code += `    }\n\n`;
    });
  }

  // Events
  if (Array.isArray(cb.events)) {
    cb.events.forEach(event => {
      code += `    event ${event.name}(\n`;
      code += event.inputs.map(inp =>
        `        ${inp.type}${inp.indexed ? ' indexed' : ''} ${inp.name}`
      ).join(',\n');
      code += '\n    );\n\n';
    });
  }

  code += '}';
  return code;
}

function generateAbiFromContract(contractData) {
  if (!contractData?.contractBody) return [];

  const cb = contractData.contractBody;
  const abi = [];

  // constructor
  if (cb.constructor) {
    const ctorInputs = cb.constructor.inputs?.map(input => ({
      name: input.name,
      type: input.type
    })) || [];

    abi.push({
      type: 'constructor',
      stateMutability: 'nonpayable',
      inputs: ctorInputs
    });
  }

  // functions
  if (Array.isArray(cb.functions)) {
    cb.functions.forEach(func => {
      const inputParams = func.inputs?.map(i => ({ name: i.name, type: i.type })) || [];
      const outputParams = func.outputs?.map(o => ({ name: '', type: o.type })) || [];

      abi.push({
        type: 'function',
        name: func.name,
        stateMutability: func.mutability || 'nonpayable',
        visibility: func.visibility || 'public',
        inputs: inputParams,
        outputs: outputParams
      });
    });
  }

  // events
  if (Array.isArray(cb.events)) {
    cb.events.forEach(event => {
      abi.push({
        type: 'event',
        name: event.name,
        inputs: event.inputs.map(inp => ({
          name: inp.name,
          type: inp.type,
          indexed: !!inp.indexed
        })),
        anonymous: false
      });
    });
  }

  return abi;
}

function generateNaturalLanguageDescription(contractData) {
  if (!contractData) return 'No contract data available';
  return `
    <h3>Contract: ${contractData.contractName}</h3>
    <p>This contract is set up according to the provided JSON structure. It includes:</p>
    <ul>
      <li>State variables: ${contractData.contractBody?.stateVariables?.length || 0}</li>
      <li>Functions: ${contractData.contractBody?.functions?.length || 0}</li>
      <li>Events: ${contractData.contractBody?.events?.length || 0}</li>
    </ul>
  `;
}

function renderContractContent() {
  if (!currentContract) return;

  let mainContent = '';
  if (viewMode === 'json') {
    mainContent = `<pre>${JSON.stringify(currentContract, null, 2)}</pre>`;
  } else if (viewMode === 'solidity') {
    const code = generateSolidityCode(currentContract);
    mainContent = `<pre><code class="language-solidity">${code}</code></pre>`;
  } else if (viewMode === 'abi') {
    const abi = generateAbiFromContract(currentContract);
    mainContent = `<pre>${JSON.stringify(abi, null, 2)}</pre>`;
  } else {
    // 'natural'
    mainContent = `<div>${generateNaturalLanguageDescription(currentContract)}</div>`;
  }

  finalContractDiv.innerHTML = mainContent;
  finalContractDiv.scrollTop = 0;
  if (viewMode === 'solidity') {
    Prism.highlightAllUnder(finalContractDiv);
  }
}

/* --- VIEW MODE SWITCHING (Natural / JSON / Solidity / ABI) --- */
function setViewMode(mode) {
  viewMode = mode;
  document.querySelectorAll('.view-button').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  renderContractContent();
}

/* --- HANDLE CHAT SUBMISSION --- */
async function handleFormSubmit(message) {
  showLoading();
  try {
    // Example fetch to your own backend endpoint
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, selectedLanguage })
    });
    const data = await response.json();
    const aiResponse = JSON.parse(data.response);

    addMessage('assistant', aiResponse);

    // Identify JSON type
    if (aiResponse.contractName) {
      currentStep = 3;
      updateContractPreview(aiResponse);
      addNotification('Contract JSON received. Check the Preview tab.');
    } else if (aiResponse.issues) {
      currentStep = 2;
      addNotification('Issues JSON received. Check them above.');
    } else if (aiResponse.question) {
      currentStep = 1;
      addNotification('Question JSON received. Please answer next.');
    }

    updateStepIndicator(currentStep);
  } catch (error) {
    addNotification('⚠️ Error processing request');
    console.error(error);
  } finally {
    hideLoading();
  }
}

// Form submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  
  addMessage('user', message);
  messageInput.value = '';
  await handleFormSubmit(message);
});

/* --- EXAMPLE CONTRACT ACTIONS --- */
function approveContract() {
  addNotification('Contract Approved ✅');
}
function requestChanges() {
  addNotification('Requesting Changes...');
  if (currentContract) {
    addNotification('Please specify desired changes in your next message.');
    messageInput.focus();
  }
}
function compileContract() {
  addNotification('Compiling contract...');
}
function quickAudit() {
  addNotification('Running Quick Audit...');
}
function archiveContract() {
  addNotification('Archiving contract...');
}
function requestReaudit() {
  addNotification('Re-audit requested.');
}
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    addNotification('Address copied: ' + text);
  }, () => {
    addNotification('Failed to copy address.');
  });
}

/* --- TOGGLE DEPLOYMENTS LIST --- */
function toggleDeployments(toggleButton) {
  const networkList = toggleButton.nextElementSibling;
  if (!networkList) return;

  if (networkList.style.display === 'none' || networkList.style.display === '') {
    networkList.style.display = 'block';
    toggleButton.querySelector('i').classList.remove('fa-chevron-down');
    toggleButton.querySelector('i').classList.add('fa-chevron-up');
  } else {
    networkList.style.display = 'none';
    toggleButton.querySelector('i').classList.remove('fa-chevron-up');
    toggleButton.querySelector('i').classList.add('fa-chevron-down');
  }
}

/* --- ON LOAD --- */
window.onload = () => {
  generatorPanel.style.display = 'flex';
  updateStepIndicator(1);
  addNotification('Welcome! The AI responds in JSON. Check the tabs for different features.');
};
