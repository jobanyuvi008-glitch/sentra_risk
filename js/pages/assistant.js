/* ==============================================
   PAGES/ASSISTANT.JS — AI Cyber Risk Assistant
   ============================================== */

const AssistantPage = {
  suggestedQuestions: [
    "What is our highest financial cyber risk?",
    "How can we reduce risk by 50%?",
    "Explain Expected Annual Loss (EAL).",
  ],

  render() {
    return `
      <div class="page" style="padding-bottom:0;max-width:900px;">
        <div class="page-header" style="margin-bottom:20px;">
          <h1 class="page-title">AI Risk Assistant</h1>
          <p class="page-subtitle">Powered by Llama-3 API. Ask anything about cybersecurity.</p>
        </div>

        <div class="chat-shell">
          <div class="chat-header">
            <div class="chat-header-left">
              <div class="chat-header-name">Sentra AI</div>
            </div>
          </div>

          <div class="chat-messages" id="chat-messages">
            <div class="chat-bubble ai">
              <div class="bubble-avatar ai">AI</div>
              <div class="bubble-content">Hello! I am Sentra AI. How can I assist you with your cyber risk today?</div>
            </div>
          </div>

          <div class="chat-chips" id="chat-chips">
            ${this.suggestedQuestions.map(q => `
              <button class="chat-chip" data-question="${q}">${q}</button>
            `).join('')}
          </div>

          <div class="chat-input-bar">
            <input type="text" class="chat-input" id="chat-input" placeholder="Ask about risks..." autocomplete="off"/>
            <button class="chat-send-btn" id="chat-send-btn">
              <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    const inputEl = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    sendBtn.addEventListener('click', () => this.sendMessage());
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.sendMessage();
    });

    document.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        inputEl.value = chip.dataset.question;
        this.sendMessage();
      });
    });
  },

  sendMessage() {
    const inputEl = document.getElementById('chat-input');
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = '';
    this.addUserBubble(text);
    this.showTyping();

    // Call the Python Flask AI Endpoint
    fetch('https://sentra-risk.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    })
    .then(res => res.json())
    .then(data => {
        this.removeTyping();
        this.addAIBubble(data.response);
    })
    .catch(err => {
        this.removeTyping();
        this.addAIBubble("Error connecting to Python backend. Is app.py running?");
    });
  },

  addUserBubble(text) {
    const msgs = document.getElementById('chat-messages');
    msgs.innerHTML += `<div class="chat-bubble user"><div class="bubble-content">${text}</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
  },

  addAIBubble(text) {
    const msgs = document.getElementById('chat-messages');
    msgs.innerHTML += `<div class="chat-bubble ai"><div class="bubble-avatar ai">AI</div><div class="bubble-content">${text}</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
  },

  showTyping() {
    const msgs = document.getElementById('chat-messages');
    msgs.innerHTML += `<div class="chat-bubble ai" id="typing"><div class="bubble-content">...</div></div>`;
    msgs.scrollTop = msgs.scrollHeight;
  },

  removeTyping() {
    const el = document.getElementById('typing');
    if (el) el.remove();
  }
};