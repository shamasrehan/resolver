function requestReaudit() {
  const contractId = document.getElementById('contract-id-input').value.trim();
  
  if (!contractId) {
    addNotification('Please enter a contract ID', 'warning');
    
    // Add visual feedback
    const inputField = document.getElementById('contract-id-input');
    inputField.style.borderColor = 'var(--warning-color)';
    inputField.style.backgroundColor = 'var(--warning-light)';
    
    // Reset after a delay
    setTimeout(() => {
      inputField.style.borderColor = '';
      inputField.style.backgroundColor = '';
    }, 1500);
    
    return;
  }
  
  // Show progress
  addNotification(`Re-audit requested for contract ${contractId}`, 'info');
  
  // Disable button while processing
  const reauditButton = document.querySelector('.reaudit-button');
  if (reauditButton) {
    reauditButton.disabled = true;
    reauditButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  }
  
  // Here would normally be an API call
  setTimeout(() => {
    addNotification('Re-audit scheduled', 'success');
    
    // Update status in UI
    const statusValue = document.querySelector('.status-value');
    if (statusValue) {
      statusValue.className = 'status-value in-progress';
      statusValue.textContent = 'Scheduled';
    }
    
    // Reset button
    if (reauditButton) {
      reauditButton.disabled = false;
      reauditButton.innerHTML = '<i class="fas fa-sync-alt"></i> <span>Request Re-audit</span>';
    }
    
    // Add message to chat
    addMessage('assistant', `
      <div style="background-color: #fff8e1; padding: 16px; border-radius: 8px; border-left: 4px solid #ffb300;">
        <h3 style="margin-top: 0; color: #f57c00;">
          <i class="fas fa-clock"></i> Audit Scheduled
        </h3>
        <p>
          Your re-audit for contract <strong>${contractId}</strong> has been scheduled. 
          The process typically takes 24-48 hours.
        </p>
        <p style="margin-bottom: 0;">
          You will receive a notification when the audit is complete.
        </p>
      </div>
    `);
  }, 2000);
}

function copyToClipboard(text) {
  const originalText = text;
  
  // Create a tooltip/badge that will appear when copying
  const copyBadge = document.createElement('div');
  copyBadge.className = 'copy-badge';
  copyBadge.innerHTML = 'Copying...';
  document.body.appendChild(copyBadge);
  
  // Position the badge near the cursor
  document.addEventListener('mousemove', positionBadge);
  
  function positionBadge(e) {
    copyBadge.style.left = (e.clientX + 15) + 'px';
    copyBadge.style.top = (e.clientY - 15) + 'px';
  }
  
  // Add styles for copy badge
  if (!document.getElementById('copy-badge-style')) {
    const style = document.createElement('style');
    style.id = 'copy-badge-style';
    style.textContent = `
      .copy-badge {
        position: fixed;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 0.8rem;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.2s ease;
      }
      
      .copy-badge.show {
        opacity: 1;
        transform: translateY(0);
      }
      
      .copy-badge.success {
        background-color: var(--success-color);
      }
      
      .copy-badge.error {
        background-color: var(--error-color);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Show the badge
  setTimeout(() => {
    copyBadge.classList.add('show');
  }, 50);
  
  // Try to copy
  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      
      if (successful) {
        copyBadge.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBadge.classList.add('success');
        addNotification(`Address copied: ${text}`, 'success');
      } else {
        copyBadge.innerHTML = '<i class="fas fa-times"></i> Failed';
        copyBadge.classList.add('error');
        addNotification('Failed to copy address', 'error');
      }
    } catch (err) {
      copyBadge.innerHTML = '<i class="fas fa-times"></i> Failed';
      copyBadge.classList.add('error');
      addNotification('Failed to copy address', 'error');
    } finally {
      document.body.removeChild(textArea);
    }
  } else {
    // Modern browsers
    navigator.clipboard.writeText(text)
      .then(() => {
        copyBadge.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBadge.classList.add('success');
        addNotification(`Address copied: ${originalText}`, 'success');
      })
      .catch((err) => {
        copyBadge.innerHTML = '<i class="fas fa-times"></i> Failed';
        copyBadge.classList.add('error');
        addNotification('Failed to copy address', 'error');
        console.error('Copy failed:', err);
      });
  }
  
  // Remove the badge after a delay
  setTimeout(() => {
    copyBadge.style.opacity = '0';
    copyBadge.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      document.body.removeChild(copyBadge);
      document.removeEventListener('mousemove', positionBadge);
    }, 300);
  }, 2000);
}

function toggleDeployments(toggleButton) {
  const networkList = toggleButton.nextElementSibling;
  if (!networkList) return;
  
  // Get the icon
  const icon = toggleButton.querySelector('i');

  if (networkList.style.display === 'none' || networkList.style.display === '') {
    // Show deployments
    networkList.style.display = 'block';
    
    // Animate arrow
    if (icon) {
      icon.style.transform = 'rotate(180deg)';
      icon.style.transition = 'transform 0.3s ease';
    }
    
    // Animate list expansion
    networkList.style.maxHeight = '0';
    networkList.style.opacity = '0';
    networkList.style.transition = 'max-height 0.5s ease, opacity 0.3s ease';
    
    // Trigger animation
    setTimeout(() => {
      networkList.style.maxHeight = networkList.scrollHeight + 'px';
      networkList.style.opacity = '1';
    }, 50);
  } else {
    // Hide deployments with animation
    networkList.style.maxHeight = '0';
    networkList.style.opacity = '0';
    
    // Reset arrow
    if (icon) {
      icon.style.transform = 'rotate(0deg)';
    }
    
    // Actually hide the element after animation completes
    setTimeout(() => {
      networkList.style.display = 'none';
    }, 500);
  }
}

/* --- DEMO FUNCTION CALLS with enhanced feedback --- */
// These functions demonstrate how the function calls would work
function demoBugFix() {
  showDemoStartNotification('Bug Fix Analysis');
  
  // Show typing animation in input
  elements.messageInput.value = "/bugFix";
  elements.messageInput.disabled = true;
  
  // Add "running" indicator
  addNotification('Running bug analysis...', 'info');
  
  // Show animated scanning effect on the contract
  const scanOverlay = document.createElement('div');
  scanOverlay.className = 'scan-overlay';
  scanOverlay.innerHTML = `
    <div class="scan-animation"></div>
  `;
  
  elements.finalContractDiv.parentNode.appendChild(scanOverlay);
  
  // Add styles for scanning effect
  if (!document.getElementById('scan-style')) {
    const style = document.createElement('style');
    style.id = 'scan-style';
    style.textContent = `
      .scan-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 5;
      }
      
      .scan-animation {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(to right, transparent, var(--primary-color), transparent);
        box-shadow: 0 0 8px var(--primary-color);
        animation: scandown 1.5s ease-in-out infinite;
      }
      
      @keyframes scandown {
        0% { top: 0; opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Submit after a brief delay
  setTimeout(() => {
    elements.form.dispatchEvent(new Event('submit'));
    elements.messageInput.value = '';
    elements.messageInput.disabled = false;
    
    // Remove scan overlay after analysis is "complete"
    setTimeout(() => {
      if (scanOverlay.parentNode) {
        scanOverlay.parentNode.removeChild(scanOverlay);
      }
    }, 2000);
  }, 1200);
}

function demoSecurityAudit() {
  showDemoStartNotification('Security Audit');
  
  // Show typing animation in input
  elements.messageInput.value = "/securityAudit";
  elements.messageInput.disabled = true;
  
  setTimeout(() => {
    elements.form.dispatchEvent(new Event('submit'));
    elements.messageInput.value = '';
    elements.messageInput.disabled = false;
  }, 1000);
}

function demoGasOptimization() {
  showDemoStartNotification('Gas Optimization');
  
  // Show typing animation in input
  elements.messageInput.value = "/gasOptimization";
  elements.messageInput.disabled = true;
  
  setTimeout(() => {
    elements.form.dispatchEvent(new Event('submit'));
    elements.messageInput.value = '';
    elements.messageInput.disabled = false;
  }, 1000);
}

function demoGenerateTests() {
  showDemoStartNotification('Test Generation');
  
  // Show typing animation in input
  elements.messageInput.value = "/generateTests";
  elements.messageInput.disabled = true;
  
  setTimeout(() => {
    elements.form.dispatchEvent(new Event('submit'));
    elements.messageInput.value = '';
    elements.messageInput.disabled = false;
  }, 1000);
}

// Helper for demo function notifications
function showDemoStartNotification(featureName) {
  // Create animated notification that fades in/out
  const notification = document.createElement('div');
  notification.className = 'demo-notification';
  notification.innerHTML = `
    <i class="fas fa-magic"></i>
    <span>Starting ${featureName} Demo...</span>
  `;
  
  document.body.appendChild(notification);
  
  // Add styles if not already added
  if (!document.getElementById('demo-notification-style')) {
    const style = document.createElement('style');
    style.id = 'demo-notification-style';
    style.textContent = `
      .demo-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #3f51b5;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        opacity: 0;
        transform: translateY(20px);
        animation: slideUpFadeIn 0.3s ease forwards, slideDownFadeOut 0.3s ease forwards 3s;
      }
      
      @keyframes slideUpFadeIn {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideDownFadeOut {
        to {
          opacity: 0;
          transform: translateY(20px);
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Remove the notification after animation completes
  setTimeout(() => {
    if (notification.parentNode) {
      document.body.removeChild(notification);
    }
  }, 3500);
}

/* --- NEW CHAT BUTTON FUNCTION with proper cleanup and animated transitions --- */
function startNewChat() {
  // Confirm if we're in phase 2 and have a contract
  if (AppState.phase === 2 && AppState.currentContract) {
    if (!confirm("This will start a new conversation and clear the current contract. Are you sure?")) {
      return;
    }
  }
  
  // Add loading animation to chat container
  elements.chatContainer.innerHTML = `
    <div class="chat-loading">
      <div class="chat-loading-spinner"></div>
      <p>Starting new conversation...</p>
    </div>
  `;
  
  // Add styles for loading animation if not added
  if (!document.getElementById('chat-loading-style')) {
    const style = document.createElement('style');
    style.id = 'chat-loading-style';
    style.textContent = `
      .chat-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-muted);
      }
      
      .chat-loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(63, 81, 181, 0.2);
        border-radius: 50%;
        border-top-color: var(--primary-color);
        animation: spin 1s infinite linear;
        margin-bottom: 16px;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Clear UI with animations
  elements.chatNotifications.innerHTML = '';
  elements.messageInput.value = '';
  elements.finalContractDiv.style.opacity = '0';
  
  // Reset state
  AppState.reset();
  
  // Notify the server side to reset conversation
  callServerAPI("New chat requested", true)
    .then(() => {
      // Clear loading state
      setTimeout(() => {
        elements.chatContainer.innerHTML = '';
        elements.finalContractDiv.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-file-contract" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
            <p>No contract generated yet. Complete Phase 1 to generate a contract.</p>
          </div>
        `;
        elements.finalContractDiv.style.opacity = '1';
        
        // Show welcome message
        addNotification('New conversation started. Tell me what kind of smart contract you need.', 'info');
        
        // Add welcome message to chat
        addMessage('assistant', `
          <div style="text-align: center;">
            <i class="fas fa-robot" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 16px;"></i>
            <h3 style="margin: 0 0 8px 0;">Welcome to SmartContractHub</h3>
            <p>I'm your AI assistant. I can help you create, audit, and optimize smart contracts.</p>
            <p>Tell me what kind of contract you need, and we'll build it together!</p>
          </div>
        `);
      }, 1000);
    })
    .catch((err) => {
      console.error("Error resetting chat:", err);
      addNotification("Error resetting chat on server", 'error');
      elements.chatContainer.innerHTML = '';
    });
}

/* --- ON LOAD with page animations --- */
window.onload = () => {
  // Initialize UI with fade-in animation
  document.body.classList.add('page-loaded');
  
  // Add page-load animation styles if not added
  if (!document.getElementById('page-load-style')) {
    const style = document.createElement('style');
    style.id = 'page-load-style';
    style.textContent = `
      body {
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      
      body.page-loaded {
        opacity: 1;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Display elements
  elements.generatorPanel.style.display = 'flex';
  updateStepIndicator(1);
  
  // Add welcome notification after a slight delay
  setTimeout(() => {
    addNotification(
      'Welcome! I\'ll help you create a custom smart contract. Let\'s start by discussing what type of contract you need.', 
      'info'
    );
  }, 500);
  
  // Show initial greeting in chat
  setTimeout(() => {
    addMessage('assistant', `
      <div style="text-align: center;">
        <i class="fas fa-robot" style="font-size: 2rem; color: var(--primary-color); margin-bottom: 16px;"></i>
        <h3 style="margin: 0 0 8px 0;">Welcome to SmartContractHub</h3>
        <p>I'm your AI assistant. I can help you create, audit, and optimize smart contracts.</p>
        <p>Tell me what kind of contract you need, and we'll build it together!</p>
      </div>
    `);
  }, 800);
  
  // Initialize any UI elements that need it
  renderContractContent();
  
  // Add event listeners for keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Enter to submit the form
    if (e.ctrlKey && e.key === 'Enter' && document.activeElement === elements.messageInput) {
      elements.form.dispatchEvent(new Event('submit'));
    }
    
    // Escape key to close any open dialogs
    if (e.key === 'Escape') {
      const openDialogs = document.querySelectorAll('.confirm-dialog');
      openDialogs.forEach(dialog => {
        document.body.removeChild(dialog);
      });
    }
  });
  
  // Add input focus animation
  elements.messageInput.addEventListener('focus', () => {
    elements.messageInput.style.boxShadow = '0 0 0 2px rgba(63, 81, 181, 0.2)';
    elements.messageInput.style.borderColor = 'var(--primary-color)';
  });
  
  elements.messageInput.addEventListener('blur', () => {
    elements.messageInput.style.boxShadow = '';
    elements.messageInput.style.borderColor = '';
  });
  
  // Add loading indicator when button is clicked
  elements.submitBtn.addEventListener('mousedown', () => {
    if (!elements.messageInput.value.trim()) return;
    elements.submitBtn.classList.add('clicked');
  });
  
  elements.submitBtn.addEventListener('mouseup', () => {
    elements.submitBtn.classList.remove('clicked');
  });
  
  // Add button click style
  if (!document.getElementById('button-click-style')) {
    const style = document.createElement('style');
    style.id = 'button-click-style';
    style.textContent = `
      #submit-btn.clicked {
        transform: scale(0.95);
      }
    `;
    
    document.head.appendChild(style);
  }
  // Add elements to the cached DOM elements object
  elements.approvalSection = document.querySelector('.approval-section');

  // Get initial mode from the select element
  const initialMode = elements.chatModeSelect.value;
  elements.generatorPanel.classList.add(`${initialMode}-mode`);

  // Setup toggle button if in basic mode
  if (initialMode === 'basic') {
    updateContractToggleButton('basic');
  }

  // If hovering out of the approval section in basic mode, hide it
  elements.approvalSection.addEventListener('mouseleave', (e) => {
    const toggleBtn = document.querySelector('.contract-toggle-btn');
    if (elements.generatorPanel.classList.contains('basic-mode') && 
        toggleBtn && !toggleBtn.classList.contains('locked')) {
      showContractPreview(false);
    }
  });
};/*******************************************************************************
 * FRONT-END LOGIC FOR UI & CHAT
 * Enhanced with better state management, UI feedback, and animations
 ******************************************************************************/

// Proper state management with a dedicated object
const AppState = {
  conversation: [],
  phase: 1,
  selectedLanguage: 'solidity',
  currentContract: null,
  viewMode: 'solidity',
  isLoading: false,
  errors: [],
  notificationCount: 0,
  notificationTimeout: null,
  
  // Constants
  CONTRACT_LANGUAGES: {
    SOLIDITY: 'solidity',
    VYPER: 'vyper',
    RUST: 'rust'
  },
  
  // Methods for state updates
  setPhase(newPhase) {
    this.phase = newPhase;
    updateStepIndicator(newPhase);
  },
  
  setLanguage(language) {
    if (Object.values(this.CONTRACT_LANGUAGES).includes(language)) {
      this.selectedLanguage = language;
      return true;
    }
    this.addError(`Invalid language: ${language}`);
    return false;
  },
  
  updateContract(contract) {
    this.currentContract = contract;
    renderContractContent();
  },
  
  setLoading(isLoading) {
    this.isLoading = isLoading;
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  },
  
  addError(error) {
    this.errors.push({ message: error, timestamp: new Date() });
    console.error(`App Error: ${error}`);
    addNotification(`Error: ${error}`, 'error');
  },
  
  clearErrors() {
    this.errors = [];
  },
  
  reset() {
    this.conversation = [];
    this.phase = 1;
    this.currentContract = null;
    this.errors = [];
    this.notificationCount = 0;
    
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }
    
    updateStepIndicator(1);
  }
};

// Enhanced API function with proper error handling and timeout
async function callServerAPI(message, newChat = false) {
  // Add a timeout to prevent hanging requests
  const timeoutDuration = 30000; // 30 seconds
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutDuration);
  });
  
  try {
    const fetchPromise = fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        newChat: newChat,
        selectedLanguage: AppState.selectedLanguage
      }),
    });
    
    // Race between the fetch request and the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error("API call error:", error);
    // Throw the error to be handled by the caller
    throw error;
  }
}

/*******************************************************************************
 * UI Elements & Utilities
 ******************************************************************************/
// Cache DOM elements for better performance
const elements = {
  // Layout elements
  sidebar: document.getElementById('sidebar'),
  generatorPanel: document.getElementById('generatorPanel'),
  examplePanel1: document.getElementById('examplePanel1'),
  examplePanel2: document.getElementById('examplePanel2'),
  sidebarToggleIcon: document.getElementById('sidebar-toggle-icon'),
  
  // Chat elements
  chatContainer: document.getElementById('chat-container'),
  chatNotifications: document.getElementById('chatNotifications'),
  form: document.getElementById('input-form'),
  messageInput: document.getElementById('message-input'),
  submitBtn: document.getElementById('submit-btn'),
  loadingSpinner: document.getElementById('loading-spinner'),
  buttonText: document.getElementById('button-text'),
  finalContractDiv: document.getElementById('finalContract'),
  chatModeSelect: document.getElementById('chatModeSelect'),
  
  // Language toggles
  solidityToggle: document.getElementById('solidityToggle'),
  vyperToggle: document.getElementById('vyperToggle'),
  rustToggle: document.getElementById('rustToggle')
};

/* --- Enhanced Notifications in chat with types and animations --- */
function addNotification(message, type = 'info') {
  const notificationId = `notification-${Date.now()}-${AppState.notificationCount++}`;
  const note = document.createElement('div');
  note.id = notificationId;
  note.className = `chat-notification ${type}`; 
  note.textContent = message;
  
  elements.chatNotifications.appendChild(note);
  
  // If notification container was empty, make it visible
  if (elements.chatNotifications.childElementCount === 1) {
    elements.chatNotifications.style.display = 'flex';
  }
  
  // Auto-remove notifications after a delay (except errors)
  if (type !== 'error') {
    AppState.notificationTimeout = setTimeout(() => {
      const noteToRemove = document.getElementById(notificationId);
      if (noteToRemove) {
        // Add fade-out animation
        noteToRemove.style.opacity = '0';
        noteToRemove.style.transform = 'translateY(-10px)';
        noteToRemove.style.transition = 'all 0.3s ease';
        
        // Remove after animation completes
        setTimeout(() => {
          if (noteToRemove.parentNode) {
            noteToRemove.parentNode.removeChild(noteToRemove);
            
            // If no more notifications, hide the container
            if (elements.chatNotifications.childElementCount === 0) {
              elements.chatNotifications.style.display = 'none';
            }
          }
        }, 300);
      }
    }, 5000);
  } else {
    // Add a close button for errors
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'notification-close';
    closeBtn.onclick = function() {
      // Add fade-out animation
      note.style.opacity = '0';
      note.style.transform = 'translateY(-10px)';
      note.style.transition = 'all 0.3s ease';
      
      // Remove after animation completes
      setTimeout(() => {
        if (note.parentNode) {
          note.parentNode.removeChild(note);
          
          // If no more notifications, hide the container
          if (elements.chatNotifications.childElementCount === 0) {
            elements.chatNotifications.style.display = 'none';
          }
        }
      }, 300);
    };
    note.appendChild(closeBtn);
  }
  
  return notificationId;
}

/* --- SIDEBAR TOGGLE with animation --- */
function toggleSidebar() {
  elements.sidebar.classList.toggle('collapsed');
  
  // Animate the icon rotation
  if (elements.sidebar.classList.contains('collapsed')) {
    elements.sidebarToggleIcon.classList.remove('fa-chevron-left');
    elements.sidebarToggleIcon.classList.add('fa-chevron-right');
  } else {
    elements.sidebarToggleIcon.classList.remove('fa-chevron-right');
    elements.sidebarToggleIcon.classList.add('fa-chevron-left');
  }
}

/* --- SHOW PANELS & highlight active sidebar item --- */
function showPanel(panelId, evt) {
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  if (evt) evt.currentTarget.classList.add('active');

  // Hide all panels with fade-out
  const allPanels = [elements.generatorPanel, elements.examplePanel1, elements.examplePanel2];
  allPanels.forEach(panel => {
    if (panel.style.display !== 'none') {
      // Only animate panels that are currently visible
      panel.style.opacity = '0';
      setTimeout(() => {
        panel.style.display = 'none';
      }, 300);
    } else {
      panel.style.display = 'none';
    }
  });

  // Show chosen panel with fade-in
  setTimeout(() => {
    if (panelId === 'generatorPanel') {
      elements.generatorPanel.style.display = 'flex';
      elements.generatorPanel.style.opacity = '0';
      setTimeout(() => {
        elements.generatorPanel.style.opacity = '1';
        elements.generatorPanel.style.transition = 'opacity 0.3s ease';
      }, 50);
    } 
    else if (panelId === 'examplePanel1') {
      elements.examplePanel1.style.display = 'block';
      elements.examplePanel1.style.opacity = '0';
      setTimeout(() => {
        elements.examplePanel1.style.opacity = '1';
        elements.examplePanel1.style.transition = 'opacity 0.3s ease';
      }, 50);
    }
    else if (panelId === 'examplePanel2') {
      elements.examplePanel2.style.display = 'block';
      elements.examplePanel2.style.opacity = '0';
      setTimeout(() => {
        elements.examplePanel2.style.opacity = '1';
        elements.examplePanel2.style.transition = 'opacity 0.3s ease';
      }, 50);
    }
  }, 300);
}

/* --- SWITCH TABS (Contract Preview, My Contracts, etc.) with smooth transitions --- */
function switchTab(e, tabId) {
  // First deactivate all tabs
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  
  // Get the currently active tab
  const activeTab = document.querySelector('.tab-content.active');
  
  // Activate the clicked tab button
  e.currentTarget.classList.add('active');
  
  // Fade out active tab
  if (activeTab) {
    activeTab.style.opacity = '0';
    
    setTimeout(() => {
      // Hide all tabs
      document.querySelectorAll('.tab-content').forEach(tabContent => {
        tabContent.classList.remove('active');
      });
      
      // Show and fade in the target tab
      const targetTab = document.getElementById(tabId);
      if (targetTab) {
        targetTab.classList.add('active');
        setTimeout(() => {
          targetTab.style.opacity = '1';
        }, 50);
      }
    }, 250);
  } else {
    // If no active tab, just show the target tab
    document.querySelectorAll('.tab-content').forEach(tabContent => {
      tabContent.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
      targetTab.classList.add('active');
      targetTab.style.opacity = '0';
      setTimeout(() => {
        targetTab.style.opacity = '1';
      }, 50);
    }
  }
}

/* --- IMPROVED LANGUAGE TOGGLE with validation and visual feedback --- */
function setLanguage(lang) {
  if (!AppState.setLanguage(lang)) {
    return;
  }
  
  // Update UI to reflect the selected language with animation
  const allToggles = [elements.solidityToggle, elements.vyperToggle, elements.rustToggle];
  
  // First remove active class from all
  allToggles.forEach(toggle => {
    toggle.classList.remove('active');
    // Add subtle transition effect
    toggle.style.transform = 'scale(0.95)';
  });

  // Add active class to selected toggle with animation
  setTimeout(() => {
    if (lang === 'solidity') {
      elements.solidityToggle.classList.add('active');
      elements.solidityToggle.style.transform = 'scale(1)';
    } 
    else if (lang === 'vyper') {
      elements.vyperToggle.classList.add('active');
      elements.vyperToggle.style.transform = 'scale(1)';
    }
    else if (lang === 'rust') {
      elements.rustToggle.classList.add('active');
      elements.rustToggle.style.transform = 'scale(1)';
    }
    
    // Reset transform for other toggles
    allToggles.forEach(toggle => {
      if (!toggle.classList.contains('active')) {
        toggle.style.transform = 'scale(1)';
      }
    });
  }, 150);
  
  // Show confirmation notification
  addNotification(`Switched to ${lang.charAt(0).toUpperCase() + lang.slice(1)}`, 'success');
}

/* --- MODE CHANGE (Basic / Advanced) with feedback --- */
/* --- MODE CHANGE (Basic / Advanced) with contract panel toggle --- */
function changeChatMode() {
  const mode = elements.chatModeSelect.value;
  const modeText = mode === 'basic' ? 'Basic' : 'Advanced';
  
  // Visual feedback animation for the select
  elements.chatModeSelect.style.transform = 'scale(0.95)';
  elements.chatModeSelect.style.borderColor = 'var(--primary-color)';
  setTimeout(() => {
    elements.chatModeSelect.style.transform = 'scale(1)';
    elements.chatModeSelect.style.borderColor = 'var(--border-color)';
  }, 300);
  
  // Remove previous mode classes
  elements.generatorPanel.classList.remove('basic-mode', 'advanced-mode');
  
  // Apply new mode class
  elements.generatorPanel.classList.add(`${mode}-mode`);
  
  // Create or remove the toggle button
  updateContractToggleButton(mode);
  
  addNotification(`Switched to ${modeText} Mode`, 'info');
  
  // Update UI elements based on mode
  if (mode === 'advanced') {
    addNotification('Advanced features unlocked. Contract preview panel is now visible.', 'info');
  } else {
    addNotification('Switched to simplified interface. Use the side button to view contract details.', 'info');
  }
}

function updateContractToggleButton(mode) {
  // Remove any existing toggle button
  const existingBtn = document.querySelector('.contract-toggle-btn');
  if (existingBtn) {
    existingBtn.parentNode.removeChild(existingBtn);
  }
  
  // Only add toggle button in basic mode
  if (mode === 'basic') {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'contract-toggle-btn';
    toggleBtn.innerHTML = '<i class="fas fa-code"></i>';
    toggleBtn.title = "Show Contract Preview";
    toggleBtn.setAttribute('aria-label', 'Show Contract Preview');
    
    toggleBtn.addEventListener('mouseenter', () => {
      showContractPreview(true);
    });
    
    toggleBtn.addEventListener('click', () => {
      // On click, keep the panel visible until clicked elsewhere
      const isLocked = toggleBtn.classList.contains('locked');
      
      if (isLocked) {
        toggleBtn.classList.remove('locked');
        toggleBtn.innerHTML = '<i class="fas fa-code"></i>';
        toggleBtn.title = "Show Contract Preview";
        showContractPreview(false);
      } else {
        toggleBtn.classList.add('locked');
        toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
        toggleBtn.title = "Hide Contract Preview";
        showContractPreview(true);
        
        // Add click event listener to hide panel when clicking outside
        setTimeout(() => {
          document.addEventListener('click', hideContractOnClickOutside);
        }, 10);
      }
    });
    
    elements.chatColumn.appendChild(toggleBtn);
  }
}

function showContractPreview(show) {
  if (show) {
    elements.approvalSection.classList.add('temp-visible');
  } else {
    elements.approvalSection.classList.remove('temp-visible');
  }
}

function hideContractOnClickOutside(e) {
  const toggleBtn = document.querySelector('.contract-toggle-btn');
  const approvalSection = elements.approvalSection;
  
  // If clicking outside both the toggle button and approval section
  if (!approvalSection.contains(e.target) && !toggleBtn.contains(e.target)) {
    toggleBtn.classList.remove('locked');
    toggleBtn.innerHTML = '<i class="fas fa-code"></i>';
    toggleBtn.title = "Show Contract Preview";
    showContractPreview(false);
    document.removeEventListener('click', hideContractOnClickOutside);
  }
}

/* --- STEP INDICATOR with visual feedback --- */
function updateStepIndicator(step) {
  console.log("Current Step =>", step);
  
  // Clear any existing step notifications
  document.querySelectorAll('.chat-notification.step-notification').forEach(node => {
    node.parentNode.removeChild(node);
  });
  
  // Create a new step notification with appropriate styling
  if (step === 1) {
    addNotification('Phase 1: Gathering Requirements', 'info');
    // Update UI elements for Phase 1
    document.querySelector('.approval-buttons').style.opacity = '0.6';
  } else if (step === 2) {
    // Celebrate Phase 2 with a more prominent notification
    const note = document.createElement('div');
    note.className = 'chat-notification success step-notification'; 
    note.innerHTML = `
      <strong>Phase 2: Contract Creation & Refinement</strong>
      <p style="margin-top: 8px; font-size: 0.9em;">
        Your contract is now being generated. You can review it in the Contract Preview tab and request changes.
      </p>
    `;
    elements.chatNotifications.appendChild(note);
    
    // Update UI elements for Phase 2
    document.querySelector('.approval-buttons').style.opacity = '1';
    
    // Auto-switch to contract preview if needed
    const previewTabButton = document.querySelector('.tab-button[onclick*="contract-preview"]');
    if (previewTabButton && !previewTabButton.classList.contains('active')) {
      previewTabButton.click();
    }
  }
}

/* --- LOADING STATES with improved visual feedback --- */
function showLoading() {
  elements.submitBtn.disabled = true;
  elements.buttonText.style.display = 'none';
  elements.submitBtn.querySelector('i').style.display = 'none';
  elements.loadingSpinner.style.display = 'block';
  elements.messageInput.disabled = true;
  
  // Add pulsing effect to input
  elements.messageInput.style.opacity = '0.7';
}

function hideLoading() {
  elements.submitBtn.disabled = false;
  elements.buttonText.style.display = 'inline';
  elements.submitBtn.querySelector('i').style.display = 'inline-block';
  elements.loadingSpinner.style.display = 'none';
  elements.messageInput.disabled = false;
  
  // Remove pulsing effect
  elements.messageInput.style.opacity = '1';
}

/* --- MESSAGING UTILS with enhanced formatting and animations --- */
function addMessage(role, content) {
  const messageDiv = document.createElement('div');
  
  if (role === 'assistant') {
    messageDiv.className = 'message bot-message';
  } else if (role === 'user') {
    messageDiv.className = 'message user-message';
  } else {
    messageDiv.className = 'message system-notification';
  }
  
  // Process content for special formatting
  const formattedContent = processMessageContent(content);
  messageDiv.innerHTML = formattedContent;
  
  // Add to container with animation delay based on content length
  elements.chatContainer.appendChild(messageDiv);
  
  // Smooth scroll to the new message
  setTimeout(() => {
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 100);
  
  // If code blocks are present, apply syntax highlighting
  if (messageDiv.querySelector('pre code') && window.Prism) {
    setTimeout(() => Prism.highlightAllUnder(messageDiv), 100);
  }
}

// Process message content for improved formatting
function processMessageContent(content) {
  // Convert markdown code blocks with improved syntax highlighting
  content = content.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_, language, code) => {
    return `<pre><code class="language-${language || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
  });
  
  // Convert markdown-style links with target blank and security
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Convert inline code with matching backticks
  content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Convert bold text with matching asterisks
  content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic text with matching underscores
  content = content.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Convert line breaks to <br>
  content = content.replace(/\n/g, '<br>');
  
  return content;
}

// Helper function to escape HTML for code blocks
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/* --- CONTRACT PREVIEW RENDERING with improved display --- */
function updateContractPreview(responseData) {
  AppState.updateContract(responseData);
}

function generateSolidityCode(contractData) {
  if (!contractData) {
    return '// No contract data available.';
  }
  
  // Check if we have properly formatted contracts array
  if (contractData.contracts && Array.isArray(contractData.contracts) && contractData.contracts.length > 0) {
    const contractObj = contractData.contracts[0];
    if (contractObj && contractObj.content) {
      return `// Contract Name: ${contractObj.name || 'Unnamed'}\n${contractObj.content}`;
    }
  }
  
  // Fallback to legacy format or JSON spec
  if (contractData.jsonSpec) {
    const name = contractData.jsonSpec.contractName || 'SmartContract';
    return `// Contract Name: ${name}\n// This is a JSON specification. Switch to JSON view for details.`;
  }
  
  return '// Unable to generate proper code view. Please check JSON view.';
}

function generateAbiFromContract(contractData) {
  // This is a simplified placeholder - in a real app this would parse the contract
  return [
    {
      type: 'function',
      name: 'transfer',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [
        { name: '', type: 'bool' }
      ],
      stateMutability: 'nonpayable'
    },
    {
      type: 'event',
      name: 'Transfer',
      inputs: [
        { name: 'from', type: 'address', indexed: true },
        { name: 'to', type: 'address', indexed: true },
        { name: 'amount', type: 'uint256', indexed: false }
      ],
      anonymous: false
    }
  ];
}

function generateNaturalLanguageDescription(contractData) {
  if (!contractData) return 'No contract data available';
  
  let description = '<div class="natural-description">';
  
  // Try to use the JSON spec if available
  if (contractData.jsonSpec) {
    const spec = contractData.jsonSpec;
    description += `
      <h3>Contract: ${spec.contractName || 'Unnamed'}</h3>
      <p>
        <strong>Language:</strong> ${AppState.selectedLanguage.charAt(0).toUpperCase() + AppState.selectedLanguage.slice(1)}<br>
        <strong>Compiler version:</strong> ${spec.solidity || spec.vyper || spec.rust || 'unspecified'}<br>
        <strong>License:</strong> ${spec.license || 'unspecified'}
      </p>
      
      <h4>Features:</h4>
      <ul>
    `;
    
    // State Variables
    if (spec.stateVariables && spec.stateVariables.length > 0) {
      description += `<li>${spec.stateVariables.length} state variables defined</li>`;
    }
    
    // Functions
    if (spec.functions && spec.functions.length > 0) {
      description += `<li>${spec.functions.length} functions implemented</li>`;
    }
    
    // Events
    if (spec.events && spec.events.length > 0) {
      description += `<li>${spec.events.length} events defined</li>`;
    }
    
    // Inheritance
    if (spec.inheritance && spec.inheritance.length > 0) {
      description += `<li>Inherits from: ${spec.inheritance.join(', ')}</li>`;
    }
    
    description += `
      </ul>
      <p><em>Switch to JSON or Solidity view for more details.</em></p>
    `;
  } else {
    // Legacy format or unknown structure
    description += `
      <h3>Contract: ${contractData.contractName || 'Unnamed'}</h3>
      <p>
        This contract is set up with name <strong>${contractData.contractName || 'Unnamed'}</strong>.<br/>
        <em>Additional details would be here if we had a more complex JSON.</em>
      </p>
    `;
  }
  
  description += '</div>';
  return description;
}

function renderContractContent() {
  if (!AppState.currentContract) {
    elements.finalContractDiv.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-file-contract" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
        <p>No contract generated yet. Complete Phase 1 to generate a contract.</p>
      </div>
    `;
    return;
  }
  
  let mainContent = '';
  const viewMode = AppState.viewMode;

  if (viewMode === 'json') {
    // Show raw JSON with improved formatting
    try {
      const formattedJson = JSON.stringify(AppState.currentContract, null, 2);
      mainContent = `<pre><code class="language-json">${escapeHtml(formattedJson)}</code></pre>`;
    } catch (err) {
      console.error("Error formatting JSON:", err);
      mainContent = `<pre><code class="language-json">Error formatting JSON: ${err.message}</code></pre>`;
    }
  } else if (viewMode === 'solidity') {
    // Show Solidity code
    const code = generateSolidityCode(AppState.currentContract);
    mainContent = `<pre><code class="language-solidity">${escapeHtml(code)}</code></pre>`;
  } else if (viewMode === 'abi') {
    // Show ABI with improved formatting
    try {
      const abi = generateAbiFromContract(AppState.currentContract);
      mainContent = `<pre><code class="language-json">${escapeHtml(JSON.stringify(abi, null, 2))}</code></pre>`;
    } catch (err) {
      console.error("Error generating ABI:", err);
      mainContent = `<pre><code class="language-json">Error generating ABI: ${err.message}</code></pre>`;
    }
  } else {
    // Natural language view
    mainContent = generateNaturalLanguageDescription(AppState.currentContract);
  }

  // Apply changes with transition
  elements.finalContractDiv.style.opacity = '0';
  setTimeout(() => {
    elements.finalContractDiv.innerHTML = mainContent;
    elements.finalContractDiv.style.opacity = '1';
    
    // Apply syntax highlighting if needed
    if ((viewMode === 'solidity' || viewMode === 'json' || viewMode === 'abi') && window.Prism) {
      Prism.highlightAllUnder(elements.finalContractDiv);
    }
  }, 300);
}

/* --- VIEW MODE SWITCHING with smooth transitions --- */
function setViewMode(e, mode) {
  // Store previous mode for transition effects
  const previousMode = AppState.viewMode;
  
  // Update state
  AppState.viewMode = mode;
  
  // Update UI
  document.querySelectorAll('.view-button').forEach(btn => {
    btn.classList.remove('active');
  });
  e.target.classList.add('active');
  
  // Only re-render if the mode actually changed
  if (previousMode !== mode) {
    renderContractContent();
  }
}

/*******************************************************************************
 * HANDLE CHAT SUBMISSION with improved error handling and user feedback
 ******************************************************************************/
elements.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = elements.messageInput.value.trim();
  if (!userMessage) return;

  // Show the user message
  addMessage('user', userMessage);
  elements.messageInput.value = '';

  // Set loading state
  AppState.setLoading(true);

  try {
    // Call the server with the user's message
    const responseData = await callServerAPI(userMessage);
    
    // Store the response data for use in conversation
    AppState.conversation = responseData.conversation || AppState.conversation;
    
    // Display the assistant's reply in chat
    if (responseData.message) {
      // Add small typing delay for more natural feeling
      setTimeout(() => {
        addMessage('assistant', responseData.message);
      }, 500);
    } else if (responseData.error) {
      setTimeout(() => {
        addMessage('assistant', `I encountered an error: ${responseData.error}`);
        AppState.addError(responseData.error);
      }, 500);
    }

    // If there's a contract in responseData, show it in the left panel
    if (responseData.contract) {
      updateContractPreview(responseData.contract);
      
      // If the server says we're in Phase 2 *and* there's a contract, auto-switch to contract preview
      if (responseData.phase === 2) {
        // Delay contract preview switch for better UX
        setTimeout(() => {
          // Switch left panel tab to "Contract Preview" if not already
          const previewTabButton = document.querySelector('.tab-button[onclick*="contract-preview"]');
          if (previewTabButton && !previewTabButton.classList.contains('active')) {
            previewTabButton.click();
          }
          
          // Switch sub-view based on contract format
          if (responseData.contract.jsonSpec) {
            // If we have a JSON spec, show JSON view by default
            const jsonViewButton = document.querySelector('.view-button[onclick*="json"]');
            if (jsonViewButton) {
              jsonViewButton.click();
            }
          } else {
            // Otherwise show Solidity view
            const solidityViewButton = document.querySelector('.view-button[onclick*="solidity"]');
            if (solidityViewButton) {
              solidityViewButton.click();
            }
          }
          
          addNotification('Contract generated! Check the Contract Preview tab.', 'success');
        }, 1000);
      }
    }

    // Update phase if it changed
    if (responseData.phase !== AppState.phase) {
      AppState.setPhase(responseData.phase);
    }

    // Handle function results
    if (responseData.functionResult) {
      handleFunctionResult(responseData.functionResult);
    }

  } catch (err) {
    console.error("Error calling /api/chat:", err);
    
    // Show error message with retry option
    const errorMessage = `
      <div style="color: var(--error-color);">
        <strong>I'm sorry, I encountered an error communicating with the server.</strong><br>
        Error details: ${err.message}
      </div>
      <div style="margin-top: 10px;">
        <button class="retry-btn" onclick="retryLastMessage()" style="background-color: var(--primary-color); color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
    
    addMessage('assistant', errorMessage);
    AppState.addError(`API Error: ${err.message}`);
  } finally {
    AppState.setLoading(false);
  }
});

// Function to retry last failed message
function retryLastMessage() {
  // Get the last user message from the chat
  const userMessages = Array.from(elements.chatContainer.querySelectorAll('.user-message'));
  if (userMessages.length > 0) {
    const lastUserMessage = userMessages[userMessages.length - 1].textContent.trim();
    
    // Remove the error message and retry button
    const errorMessage = elements.chatContainer.querySelector('.bot-message:last-child');
    if (errorMessage) {
      errorMessage.remove();
    }
    
    // Add notification
    addNotification('Retrying your last message...', 'info');
    
    // Set message in input and submit
    elements.messageInput.value = lastUserMessage;
    elements.form.dispatchEvent(new Event('submit'));
  }
}

// Function to handle special function results with improved visual feedback
function handleFunctionResult(result) {
  if (!result) return;
  
  // Display different UI based on function type
  if (result.status === 'success') {
    addNotification(`Function executed successfully: ${result.message}`, 'success');
    
    // Handle specific function results
    if (result.fixes) {
      // BugFix result
      const fixCount = result.fixes.length;
      addNotification(`Found ${fixCount} issues to fix`, 'info');
      
      // Show fixes in the chat with relevant code snippets
      setTimeout(() => {
        let fixesMessage = `<strong>🐛 Bug Fix Report:</strong><br><br>`;
        
        result.fixes.forEach((fix, index) => {
          fixesMessage += `
            <div style="margin-bottom: 12px;">
              <strong>${index + 1}. ${fix.title}</strong><br>
              <span style="color: var(--error-color);">Issue: ${fix.description}</span><br>
              <span style="color: var(--success-color);">Solution: ${fix.solution}</span>
            </div>
          `;
        });
        
        fixesMessage += `<br>Would you like me to apply these fixes automatically?`;
        addMessage('assistant', fixesMessage);
      }, 800);
      
    } else if (result.findings) {
      // SecurityAudit result
      const criticalCount = result.findings.filter(f => f.severity === 'critical').length;
      const highCount = result.findings.filter(f => f.severity === 'high').length;
      
      if (criticalCount > 0) {
        addNotification(`⚠️ CRITICAL: Found ${criticalCount} critical security issues!`, 'error');
      }
      
      if (highCount > 0) {
        addNotification(`⚠️ HIGH: Found ${highCount} high severity issues`, 'warning');
      }
      
      // Show audit findings in chat
      setTimeout(() => {
        let auditMessage = `<strong>🔒 Security Audit Report:</strong><br><br>`;
        
        if (result.findings.length === 0) {
          auditMessage += `No security issues found. Your contract looks secure!`;
        } else {
          result.findings.forEach((finding, index) => {
            const severityColor = finding.severity === 'critical' ? 'var(--error-color)' : 
                                finding.severity === 'high' ? 'var(--warning-color)' : 
                                finding.severity === 'medium' ? 'var(--secondary-color)' : 'var(--success-color)';
            
            auditMessage += `
              <div style="margin-bottom: 12px; border-left: 3px solid ${severityColor}; padding-left: 10px;">
                <strong>${index + 1}. ${finding.title}</strong><br>
                <span style="color: ${severityColor}; text-transform: uppercase; font-weight: bold;">
                  ${finding.severity} SEVERITY
                </span><br>
                <span>${finding.description}</span>
              </div>
            `;
          });
          
          auditMessage += `<br>Would you like detailed recommendations on how to fix these issues?`;
        }
        
        addMessage('assistant', auditMessage);
      }, 800);
    }
  } else {
    AppState.addError(`Function error: ${result.message}`);
  }
}

/*******************************************************************************
 * CONTRACT ACTIONS with improved UX and feedback
 ******************************************************************************/
function approveContract() {
  if (!AppState.currentContract) {
    addNotification('No contract to approve', 'warning');
    return;
  }
  
  // Show approval confirmation popup
  const confirmDialog = document.createElement('div');
  confirmDialog.className = 'confirm-dialog';
  confirmDialog.innerHTML = `
    <div class="confirm-dialog-content">
      <h3><i class="fas fa-check-circle"></i> Approve Contract</h3>
      <p>Are you sure you want to approve this contract?</p>
      <div class="confirm-dialog-buttons">
        <button class="confirm-btn" id="confirm-approve">Yes, Approve</button>
        <button class="cancel-btn" id="cancel-approve">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(confirmDialog);
  
  // Add event listeners
  document.getElementById('confirm-approve').addEventListener('click', () => {
    // Remove dialog
    document.body.removeChild(confirmDialog);
    
    // Show success notification with animation
    addNotification('Contract Approved ✅', 'success');
    
    // Add confirmation message in chat
    addMessage('assistant', `
      <div style="text-align: center;">
        <i class="fas fa-check-circle" style="color: var(--success-color); font-size: 2rem;"></i>
        <p style="margin-top: 10px; font-weight: bold;">Contract Approved</p>
        <p>Your contract has been approved and is ready for deployment.</p>
      </div>
    `);
  });
  
  document.getElementById('cancel-approve').addEventListener('click', () => {
    document.body.removeChild(confirmDialog);
  });
  
  // Add dialog style if not already added
  if (!document.getElementById('dialog-style')) {
    const style = document.createElement('style');
    style.id = 'dialog-style';
    style.textContent = `
      .confirm-dialog {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
      }
      
      .confirm-dialog-content {
        background-color: white;
        padding: 24px;
        border-radius: 8px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        animation: scaleIn 0.3s ease;
      }
      
      .confirm-dialog-content h3 {
        margin-top: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-color);
      }
      
      .confirm-dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 20px;
      }
      
      .confirm-btn {
        padding: 8px 16px;
        background-color: var(--success-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .cancel-btn {
        padding: 8px 16px;
        background-color: #f5f5f5;
        color: var(--text-color);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
  }
}

function requestChanges() {
  if (!AppState.currentContract) {
    addNotification('No contract to modify', 'warning');
    return;
  }
  
  addNotification('Requesting Changes...', 'info');
  
  // Show request changes modal with specific options
  const changeDialog = document.createElement('div');
  changeDialog.className = 'confirm-dialog';
  changeDialog.innerHTML = `
    <div class="confirm-dialog-content">
      <h3><i class="fas fa-edit"></i> Request Changes</h3>
      <p>What type of changes would you like to make?</p>
      <div class="change-options">
        <button class="change-option" data-change="functionality">
          <i class="fas fa-cogs"></i>
          <span>Functionality Changes</span>
        </button>
        <button class="change-option" data-change="security">
          <i class="fas fa-shield-alt"></i>
          <span>Security Improvements</span>
        </button>
        <button class="change-option" data-change="gas">
          <i class="fas fa-gas-pump"></i>
          <span>Gas Optimization</span>
        </button>
        <button class="change-option" data-change="custom">
          <i class="fas fa-pencil-alt"></i>
          <span>Custom Changes</span>
        </button>
      </div>
      <div class="confirm-dialog-buttons" style="justify-content: space-between;">
        <button class="cancel-btn" id="cancel-changes">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(changeDialog);
  
  // Add styles for change options if not already added
  if (!document.getElementById('change-options-style')) {
    const style = document.createElement('style');
    style.id = 'change-options-style';
    style.textContent = `
      .change-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 16px 0;
      }
      
      .change-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: #f9f9f9;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .change-option:hover {
        background: var(--primary-light);
        color: white;
        transform: translateY(-2px);
      }
      
      .change-option i {
        font-size: 1.5rem;
        margin-bottom: 8px;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Add event listeners for options
  document.querySelectorAll('.change-option').forEach(option => {
    option.addEventListener('click', () => {
      document.body.removeChild(changeDialog);
      
      // Handle different change types
      const changeType = option.getAttribute('data-change');
      let promptText = '';
      
      switch (changeType) {
        case 'functionality':
          promptText = "I'd like to modify the functionality of the contract by ";
          break;
        case 'security':
          promptText = "I'd like to improve the security of the contract by ";
          break;
        case 'gas':
          promptText = "I'd like to optimize the contract for gas efficiency by ";
          break;
        case 'custom':
          promptText = "I'd like to make the following changes to the contract: ";
          break;
      }
      
      elements.messageInput.value = promptText;
      elements.messageInput.focus();
      
      // Place cursor at end of text
      const len = elements.messageInput.value.length;
      elements.messageInput.setSelectionRange(len, len);
    });
  });
  
  document.getElementById('cancel-changes').addEventListener('click', () => {
    document.body.removeChild(changeDialog);
  });
}

function compileContract() {
  if (!AppState.currentContract) {
    addNotification('No contract to compile', 'warning');
    return;
  }
  
  // Show compilation in progress
  addNotification('Compiling contract...', 'info');
  
  // Add compilation animation to contract preview
  const compileOverlay = document.createElement('div');
  compileOverlay.className = 'compile-overlay';
  compileOverlay.innerHTML = `
    <div class="compile-spinner"></div>
    <p>Compiling...</p>
  `;
  
  elements.finalContractDiv.parentNode.appendChild(compileOverlay);
  
  // Add styles for compilation animation
  if (!document.getElementById('compile-style')) {
    const style = document.createElement('style');
    style.id = 'compile-style';
    style.textContent = `
      .compile-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        animation: fadeIn 0.3s ease;
      }
      
      .compile-spinner {
        width: 50px;
        height: 50px;
        border: 5px solid rgba(63, 81, 181, 0.2);
        border-radius: 50%;
        border-top-color: var(--primary-color);
        animation: spin 1s infinite linear;
        margin-bottom: 16px;
      }
      
      .compile-overlay p {
        font-weight: 600;
        color: var(--primary-color);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Simulate compilation
  setTimeout(() => {
    // Remove overlay
    compileOverlay.style.opacity = '0';
    compileOverlay.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
      if (compileOverlay.parentNode) {
        compileOverlay.parentNode.removeChild(compileOverlay);
      }
      
      // Simulate success/failure
      const success = Math.random() > 0.3; // 70% chance of success
      
      if (success) {
        addNotification('Compilation successful!', 'success');
        
        // Add success message to chat
        addMessage('assistant', `
          <div style="background-color: var(--success-light); padding: 12px; border-radius: 8px; border-left: 4px solid var(--success-color);">
            <strong><i class="fas fa-check-circle"></i> Compilation Successful</strong>
            <p style="margin-top: 8px;">Contract compiled without errors. You can now deploy it to a network.</p>
          </div>
        `);
      } else {
        addNotification('Compilation failed: Check for syntax errors', 'error');
        
        // Show error in chat
        addMessage('assistant', `
          <div style="background-color: var(--error-light); padding: 12px; border-radius: 8px; border-left: 4px solid var(--error-color);">
            <strong><i class="fas fa-exclamation-circle"></i> Compilation Failed</strong>
            <p style="margin-top: 8px;">The contract has syntax errors that need to be fixed:</p>
            <pre style="background-color: rgba(0,0,0,0.05); padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 0.9em;">
Error: DeclarationError: Undeclared identifier.
--> line 42: uint totalSupply = _calculateSupply();
                                 ^-------------^
Error: ParserError: Expected ',' but got identifier
--> line 78: function transfer(address to uint256 amount) public returns (bool) {
                                       ^
            </pre>
          </div>
          
          <p style="margin-top: 12px;">Would you like me to help fix these errors?</p>
        `);
      }
    }, 300);
  }, 2500);
}

function quickAudit() {
  if (!AppState.currentContract) {
    addNotification('No contract to audit', 'warning');
    return;
  }
  
  addNotification('Performing quick security audit...', 'info');
  
  // Show audit in progress animation
  const auditOverlay = document.createElement('div');
  auditOverlay.className = 'audit-overlay';
  auditOverlay.innerHTML = `
    <div class="audit-animation">
      <i class="fas fa-shield-alt"></i>
      <i class="fas fa-search"></i>
    </div>
    <p>Scanning contract...</p>
    <div class="audit-progress">
      <div class="audit-progress-bar"></div>
    </div>
  `;
  
  elements.finalContractDiv.parentNode.appendChild(auditOverlay);
  
  // Add styles for audit animation
  if (!document.getElementById('audit-style')) {
    const style = document.createElement('style');
    style.id = 'audit-style';
    style.textContent = `
      .audit-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        animation: fadeIn 0.3s ease;
      }
      
      .audit-animation {
        position: relative;
        width: 80px;
        height: 80px;
        margin-bottom: 16px;
      }
      
      .audit-animation .fas {
        position: absolute;
        font-size: 40px;
      }
      
      .audit-animation .fa-shield-alt {
        color: #673ab7;
        left: 0;
        animation: pulse 2s infinite;
      }
      
      .audit-animation .fa-search {
        color: var(--primary-color);
        font-size: 24px;
        right: 0;
        bottom: 0;
        animation: scanning 3s infinite;
      }
      
      .audit-overlay p {
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 16px;
      }
      
      .audit-progress {
        width: 200px;
        height: 6px;
        background-color: rgba(0,0,0,0.1);
        border-radius: 3px;
        overflow: hidden;
      }
      
      .audit-progress-bar {
        height: 100%;
        width: 0%;
        background-color: var(--primary-color);
        animation: progress 2.5s ease-in-out forwards;
      }
      
      @keyframes scanning {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-20px, -20px) scale(1.2); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      @keyframes progress {
        0% { width: 0%; }
        60% { width: 80%; }
        100% { width: 100%; }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Simulate audit process
  setTimeout(() => {
    // Remove overlay
    auditOverlay.style.opacity = '0';
    auditOverlay.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
      if (auditOverlay.parentNode) {
        auditOverlay.parentNode.removeChild(auditOverlay);
      }
      
      // Show audit results
      addMessage('assistant', `
        <div style="background-color: #e8eaf6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="margin-top: 0; display: flex; align-items: center; gap: 8px; color: #3f51b5;">
            <i class="fas fa-shield-alt"></i> Quick Audit Results
          </h3>
          
          <div style="display: flex; align-items: center; margin: 16px 0; gap: 8px;">
            <div style="flex-grow: 1; height: 8px; border-radius: 4px; background-color: #e3f2fd; overflow: hidden;">
              <div style="width: 85%; height: 100%; background-color: #2196f3;"></div>
            </div>
            <span style="font-weight: bold; color: #2196f3;">85/100</span>
          </div>
          
          <ul style="margin-bottom: 0; padding-left: 20px;">
            <li>No critical vulnerabilities detected</li>
            <li>Contract follows most security best practices</li>
            <li>Consider adding more input validation</li>
            <li>Events should be emitted for all state changes</li>
            <li>A full audit is recommended before production deployment</li>
          </ul>
        </div>
        
        <p>Would you like me to address any of these issues?</p>
      `);
    }, 300);
  }, 3000);
}

function archiveContract() {
  if (!AppState.currentContract) {
    addNotification('No contract to archive', 'warning');
    return;
  }
  
  // Create confirmation dialog
  const archiveDialog = document.createElement('div');
  archiveDialog.className = 'confirm-dialog';
  archiveDialog.innerHTML = `
    <div class="confirm-dialog-content">
      <h3><i class="fas fa-archive"></i> Archive Contract</h3>
      <p>This will save the current contract to your archived contracts. You can access it later from "My Contracts".</p>
      <div class="form-group">
        <label for="archive-name">Contract Name</label>
        <input type="text" id="archive-name" value="${AppState.currentContract.contractName || 'Untitled Contract'}" placeholder="Enter a name for this contract">
      </div>
      <div class="form-group">
        <label for="archive-description">Description (optional)</label>
        <textarea id="archive-description" placeholder="Add a brief description"></textarea>
      </div>
      <div class="confirm-dialog-buttons">
        <button class="confirm-btn" id="confirm-archive">Archive</button>
        <button class="cancel-btn" id="cancel-archive">Cancel</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(archiveDialog);
  
  // Add styles for the form if not already added
  if (!document.getElementById('form-style')) {
    const style = document.createElement('style');
    style.id = 'form-style';
    style.textContent = `
      .form-group {
        margin-bottom: 16px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--text-color);
      }
      
      .form-group input,
      .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.9rem;
      }
      
      .form-group input:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
      }
      
      .form-group textarea {
        min-height: 80px;
        resize: vertical;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Handle form submission
  document.getElementById('confirm-archive').addEventListener('click', () => {
    const name = document.getElementById('archive-name').value.trim();
    const description = document.getElementById('archive-description').value.trim();
    
    if (!name) {
      // Highlight the name field if empty
      document.getElementById('archive-name').style.borderColor = 'var(--error-color)';
      document.getElementById('archive-name').focus();
      return;
    }
    
    // Remove dialog
    document.body.removeChild(archiveDialog);
    
    // Show archiving animation
    addNotification('Archiving contract...', 'info');
    
    // Simulate archiving process
    setTimeout(() => {
      addNotification(`Contract "${name}" archived successfully`, 'success');
      
      // Update UI to show the contract is archived
      addMessage('assistant', `
        <div style="text-align: center;">
          <i class="fas fa-archive" style="color: #3fabb5; font-size: 2rem;"></i>
          <p style="margin-top: 10px; font-weight: bold;">Contract Archived</p>
          <p>Your contract "${name}" has been saved to "My Contracts".</p>
        </div>
      `);
      
      // Update the My Contracts tab with the new contract
      addContractToMyContracts(name, description);
    }, 1000);
  });
  
  document.getElementById('cancel-archive').addEventListener('click', () => {
    document.body.removeChild(archiveDialog);
  });
}

// Helper function to add a contract to My Contracts tab
function addContractToMyContracts(name, description) {
  const contractsList = document.querySelector('.contract-list');
  if (!contractsList) return;
  
  // Create new contract item
  const contractItem = document.createElement('li');
  contractItem.className = 'contract-item';
  contractItem.innerHTML = `
    <div class="contract-top-row">
      <div class="contract-left-info">
        <span class="contract-lang ${AppState.selectedLanguage}">
          <i class="fas fa-file-code"></i> ${AppState.selectedLanguage.charAt(0).toUpperCase() + AppState.selectedLanguage.slice(1)}
        </span>
        <span class="contract-name">${name}</span>
      </div>
      <div class="contract-actions">
        <button class="icon-button" title="View Audit"><i class="fas fa-shield-alt"></i></button>
        <button class="icon-button" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="icon-button" title="Share"><i class="fas fa-share-alt"></i></button>
        <button class="icon-button" title="Delete"><i class="fas fa-trash-alt"></i></button>
      </div>
    </div>
    ${description ? `<p class="contract-description">${description}</p>` : ''}
    <div class="deployments-toggle" onclick="toggleDeployments(this)">
      <span>Deployments</span>
      <i class="fas fa-chevron-down"></i>
    </div>
    <ul class="network-list">
      <li>
        <div class="network-left">
          <span class="network-symbol">DEV</span>
          <span class="network-name">Local Development</span>
        </div>
        <div class="network-right">
          <button class="deploy-btn">
            <i class="fas fa-rocket"></i>
            <span>Deploy</span>
          </button>
        </div>
      </li>
    </ul>
  `;
  
  // Add styles for contract description if not added
  if (!document.getElementById('contract-desc-style')) {
    const style = document.createElement('style');
    style.id = 'contract-desc-style';
    style.textContent = `
      .contract-description {
        margin: 8px 0 12px;
        font-size: 0.9rem;
        color: var(--text-light);
      }
      
      .deploy-btn {
        padding: 6px 12px;
        background-color: var(--success-color);
        color: white;
        border: none;
        border-radius: var(--border-radius);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .deploy-btn:hover {
        background-color: #388e3c;
        transform: translateY(-2px);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Add contract item to the list with animation
  contractItem.style.opacity = '0';
  contractItem.style.transform = 'translateY(20px)';
  contractsList.insertBefore(contractItem, contractsList.firstChild);
  
  // Apply animation
  setTimeout(() => {
    contractItem.style.opacity = '1';
    contractItem.style.transform = 'translateY(0)';
    contractItem.style.transition = 'all 0.3s ease';
  }, 50);
}

/* --- STEP INDICATOR FUNCTIONS --- */
function updateStepIndicator(step) {
  console.log("Current Step =>", step);
  
  // Convert numeric step to integer to ensure proper comparison
  const currentStep = parseInt(step, 10);
  
  // Get all step elements
  const steps = document.querySelectorAll('.process-stepper .step');
  
  // Update each step's state
  steps.forEach(stepEl => {
    const stepNumber = parseInt(stepEl.getAttribute('data-step'), 10);
    
    // Remove all possible states first
    stepEl.classList.remove('active', 'completed', 'animating');
    
    // Add appropriate classes
    if (stepNumber < currentStep) {
      // Previous steps are completed
      stepEl.classList.add('completed');
    } else if (stepNumber === currentStep) {
      // Current step is active
      stepEl.classList.add('active');
      
      // Add animation for newly activated step
      stepEl.classList.add('animating');
      setTimeout(() => {
        stepEl.classList.remove('animating');
      }, 1500);
    }
  });
  
  // Update UI elements based on current step
  updateUIForCurrentStep(currentStep);
  
  // Add appropriate notifications for step
  showStepNotification(currentStep);
}

function updateUIForCurrentStep(step) {
  // This function adjusts UI elements based on the current step
  switch(step) {
    case 1:
      // Phase 1: Define - Gathering Requirements
      document.querySelector('.approval-buttons').style.opacity = '0.6';
      // Ensure chat input is ready for requirement gathering
      elements.messageInput.placeholder = "Describe your smart contract requirements...";
      break;
      
    case 2:
      // Phase 2: Review - Confirm specifications
      document.querySelector('.approval-buttons').style.opacity = '0.8';
      elements.messageInput.placeholder = "Review the requirements or request changes...";
      
      // Auto-switch to contract preview if needed
      const previewTabButton = document.querySelector('.tab-button[onclick*="contract-preview"]');
      if (previewTabButton && !previewTabButton.classList.contains('active')) {
        previewTabButton.click();
      }
      break;
      
    case 3:
      // Phase 3: Develop - Generate contract code
      document.querySelector('.approval-buttons').style.opacity = '1';
      elements.messageInput.placeholder = "Ask questions about the generated contract...";
      break;
  }
}

function showStepNotification(step) {
  // Clear any existing step notifications
  document.querySelectorAll('.chat-notification.step-notification').forEach(node => {
    node.parentNode.removeChild(node);
  });
  
  // Create appropriate notification based on step
  switch(step) {
    case 1:
      addNotification('Phase 1: Gathering Requirements', 'info', 'step-notification');
      break;
      
    case 2:
      // More prominent notification for Phase 2
      const reviewNote = document.createElement('div');
      reviewNote.className = 'chat-notification success step-notification'; 
      reviewNote.innerHTML = `
        <strong>Phase 2: Review Requirements</strong>
        <p style="margin-top: 8px; font-size: 0.9em;">
          Please review the gathered requirements. Confirm if they're accurate or request changes.
        </p>
      `;
      elements.chatNotifications.appendChild(reviewNote);
      break;
      
    case 3:
      // Celebration for entering development phase
      const developNote = document.createElement('div');
      developNote.className = 'chat-notification success step-notification'; 
      developNote.innerHTML = `
        <strong>Phase 3: Generating Smart Contract</strong>
        <p style="margin-top: 8px; font-size: 0.9em;">
          Your requirements have been confirmed! Now generating the smart contract code.
        </p>
      `;
      elements.chatNotifications.appendChild(developNote);
      
      // Add "in progress" animation for code generation
      addMessage('assistant', `
        <div style="text-align: center; padding: 20px;">
          <div class="code-generation-indicator">
            <div class="code-gen-spinner"></div>
            <p>Generating smart contract...</p>
          </div>
        </div>
      `);
      
      // Add styles for the animation if not already added
      if (!document.getElementById('code-gen-style')) {
        const style = document.createElement('style');
        style.id = 'code-gen-style';
        style.textContent = `
          .code-generation-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            background-color: rgba(63, 81, 181, 0.05);
            border-radius: 8px;
          }
          
          .code-gen-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(63, 81, 181, 0.3);
            border-radius: 50%;
            border-top-color: var(--primary-color);
            animation: spin 1s infinite linear;
            margin-bottom: 16px;
          }
        `;
        document.head.appendChild(style);
      }
      break;
  }
}

// Enhanced notification function with class parameter
function addNotification(message, type = 'info', className = '') {
  const notificationId = `notification-${Date.now()}-${AppState.notificationCount++}`;
  const note = document.createElement('div');
  note.id = notificationId;
  note.className = `chat-notification ${type} ${className}`; 
  note.textContent = message;
  
  elements.chatNotifications.appendChild(note);
  
  // If notification container was empty, make it visible
  if (elements.chatNotifications.childElementCount === 1) {
    elements.chatNotifications.style.display = 'flex';
  }
  
  // Auto-remove notifications after a delay (except errors and step notifications)
  if (type !== 'error' && !className.includes('step-notification')) {
    AppState.notificationTimeout = setTimeout(() => {
      const noteToRemove = document.getElementById(notificationId);
      if (noteToRemove) {
        // Add fade-out animation
        noteToRemove.style.opacity = '0';
        noteToRemove.style.transform = 'translateY(-10px)';
        noteToRemove.style.transition = 'all 0.3s ease';
        
        // Remove after animation completes
        setTimeout(() => {
          if (noteToRemove.parentNode) {
            noteToRemove.parentNode.removeChild(noteToRemove);
            
            // If no more notifications, hide the container
            if (elements.chatNotifications.childElementCount === 0) {
              elements.chatNotifications.style.display = 'none';
            }
          }
        }, 300);
      }
    }, 5000);
  } else if (type === 'error') {
    // Add a close button for errors
    const closeBtn = document.createElement('span');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'notification-close';
    closeBtn.onclick = function() {
      // Add fade-out animation
      note.style.opacity = '0';
      note.style.transform = 'translateY(-10px)';
      note.style.transition = 'all 0.3s ease';
      
      // Remove after animation completes
      setTimeout(() => {
        if (note.parentNode) {
          note.parentNode.removeChild(note);
          
          // If no more notifications, hide the container
          if (elements.chatNotifications.childElementCount === 0) {
            elements.chatNotifications.style.display = 'none';
          }
        }
      }, 300);
    };
    note.appendChild(closeBtn);
  }
  
  return notificationId;
}

// Modify the AppState object to add a step transition method
// Add this to the AppState definition
/*
  // Methods for step updates with transition animation
  setStep(newStep) {
    // Save previous step to animate transition correctly
    const previousStep = this.phase;
    this.phase = newStep;
    
    // Update the visual step indicator with transition
    updateStepIndicator(newStep);
    
    // Log phase change
    console.log(`Transitioning from Phase ${previousStep} to Phase ${newStep}`);
    
    return true;
  }
*/

// Update the existing setPhase method in AppState to use our new stepper
// Replace the current AppState.setPhase with this:
/*
  setPhase(newPhase) {
    this.phase = newPhase;
    updateStepIndicator(newPhase);
  }
*/