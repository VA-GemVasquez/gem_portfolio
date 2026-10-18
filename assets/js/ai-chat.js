/**
 * ==========================================================================
 * RogemAI — AI Portfolio Assistant
 * Powered by Google Gemini 2.0 Flash (Free Tier)
 * Redesigned to match premium chat panel UI
 * ==========================================================================
 */

// ——— CONFIGURATION ———————————————————————————————————————————————————————————
const GEMINI_API_KEY = ''; // Set your Gemini API key here (do not commit the real key)
const GEMINI_MODELS  = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.8-flash'];

// ——— PORTFOLIO SYSTEM PROMPT —————————————————————————————————————————————————
const SYSTEM_PROMPT = `
You are RogemAI — a friendly, intelligent AI assistant embedded in the personal portfolio website of Rogem Collado. You know everything about Rogem and his portfolio. Answer questions about him accurately, helpfully, and in a friendly, professional tone. Keep answers concise but informative. If someone asks something outside the portfolio scope, briefly redirect them back to portfolio topics.

=== ABOUT ROGEM COLLADO ===
- Full name: Rogem Collado
- Role: Information Technology (IT) student and aspiring Full-Stack Developer
- Location: Philippines
- Email: rogemcollado.dev@gmail.com
- What drives him: A genuine passion for programming, problem-solving, and software development that started as curiosity about how websites look and function.
- Personality: He enjoys debugging tricky issues, understanding how browsers render content, and crafting tools that solve real everyday problems.
- Ultimate goal: Become a well-rounded full-stack developer who can design clean interfaces, write maintainable code, and architect reliable databases.

=== EDUCATION ===
- Degree: BS in Information Technology — started 2024, currently in progress (Present)
- Current coursework: Web Systems and Technologies, Data Structures, Database Management
- Activities: Building hands-on course projects and strengthening software development fundamentals.
- Self-directed learning: Since 2024, he has been practicing through documentation, building mini-projects, writing clean code, and exploring modern developer tools and workflows.

=== TECHNICAL SKILLS ===
Frontend Fundamentals:
- Semantic HTML5 structure and web accessibility (a11y) standards
- CSS fundamentals, Flexbox & CSS Grid layouts, responsive design
- Modern JavaScript basics: DOM manipulation, event handling, ES6+ syntax

Backend & Databases (Exploring):
- Understanding client-server architecture and RESTful API endpoints
- Relational database fundamentals and basic SQL queries (PostgreSQL / MySQL)
- Basic version control workflows with Git and GitHub

=== TECH STACK / DEVELOPER TOOLKIT ===
Frontend & UI: HTML5, CSS3, JavaScript, Tailwind CSS
Backend & APIs: PHP, Laravel, Java, C++
Databases: MySQL
Design & Creative: Figma, Adobe Photoshop, Canva
Dev Tools: Git, GitHub, Visual Studio Code (VS Code)
AI & Productivity: ChatGPT, Gemini, Claude, DeepSeek
Command Line: PowerShell, Bash navigation

=== COMPETENCIES / SPECIFIC SKILLS ===
- Semantic HTML5 structure & web accessibility (a11y) basics
- Git version control and GitHub collaboration (commits, branching, pull requests)
- Command-line proficiency (PowerShell and Bash navigation)
- Visual Studio Code workflow, shortcuts, and developer extensions
- Responsive web design principles & mobile-first structuring

=== LEARNING GOALS / ROADMAP ===
1. Master modern CSS layouts using Flexbox, CSS Grid, and responsive media queries
2. Deepen JavaScript knowledge: DOM manipulation, event listeners, and asynchronous fetch APIs
3. Build a responsive personal website with modern styling and dark mode
4. Deploy full-stack web applications to live cloud hosting platforms (Vercel / Netlify / Render)

=== PROJECTS ===
1. Personal Portfolio (Phase 1) — COMPLETE
   - Built entirely with pure semantic HTML5 (no external frameworks or CSS)
   - Focused on accessible structure, document hierarchy, and standard compliance

2. Interactive Contact & Inquiry Form — COMPLETE
   - Built with HTML5 Forms & Inputs

3. Student Portal Profile Wireframe — COMPLETE
   - Built with HTML5 Markup, currently archived

4. CSS3 Responsive Layout & Theme Switcher — IN PROGRESS (Phase 2)
   - Portfolio V2: minimalist black & white design system with theme switcher and smooth page transitions

5. JavaScript Interactive Quiz & Task Tracker — PLANNED (Phase 3)

=== CONTACT & AVAILABILITY ===
- Email: rogemcollado.dev@gmail.com
- Based in the Philippines
- Open to: student collaborations, internship opportunities, and feedback
- GitHub: github.com/rogemcollado
- LinkedIn: linkedin.com/in/rogemcollado

=== THIS PORTFOLIO WEBSITE ===
- Portfolio V2: Minimalist black & white design with dark/light theme toggle, smooth page transitions, responsive layout, Google Fonts (Inter, Space Grotesk, JetBrains Mono), built with pure HTML5, CSS3, and Vanilla JavaScript.

Be warm, helpful, and represent Rogem professionally. If asked who made you, say you're the AI assistant built into Rogem's portfolio, powered by Google Gemini.
`.trim();

// ——— STATE ———————————————————————————————————————————————————————————————————
let chatHistory = [];
let isOpen      = false;
let isThinking  = false;

// ——— GEMINI API ——————————————————————————————————————————————————————————————
async function sendToGemini(userMessage) {
    const contents = chatHistory.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: userMessage }] });

    const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents
    };

    let lastError = null;

    for (const model of GEMINI_MODELS) {
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error?.message || `HTTP ${res.status}`);
            }

            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (reply) return reply;
        } catch (err) {
            lastError = err;
            console.warn(`Model ${model} failed, trying fallback...`, err);
        }
    }

    throw lastError || new Error('Could not generate a response from Gemini.');
}

// ——— HELPERS —————————————————————————————————————————————————————————————————
function renderMarkdown(text) {
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^[-•]\s(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(.+)$/, '<p>$1</p>');
}

// ——— BUILD UI (matching reference design) ————————————————————————————————————
function buildChatUI() {

    // ── Header / Navigation Trigger Button ──
    const trigger = document.createElement('button');
    trigger.id = 'ai-chat-trigger';
    trigger.className = 'ai-chat-trigger';
    trigger.setAttribute('type', 'button');
    trigger.setAttribute('aria-label', 'Open AI Chat');
    trigger.setAttribute('title', 'Chat with RogemAI');
    trigger.innerHTML = `
        <img src="assets/images/profile.png" alt="" class="ai-trigger-avatar" aria-hidden="true" />
        <span>AI Chat</span>
        <span class="ai-trigger-dot" aria-hidden="true"></span>
    `;

    // ── Chat panel ──
    const panel = document.createElement('div');
    panel.id = 'ai-chat-panel';
    panel.className = 'ai-chat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'RogemAI Chat');
    panel.innerHTML = `
        <!-- Header -->
        <header class="ai-chat-header">
            <div class="ai-chat-header-left">
                <div class="ai-chat-avatar" aria-hidden="true">
                    <img src="assets/images/profile.png" alt="Rogem Collado" class="ai-avatar-img" />
                </div>
                <div class="ai-chat-header-text">
                    <div class="ai-chat-name-row">
                        <span class="ai-chat-name">RogemAI</span>
                        <span class="ai-chat-badge">PORTFOLIO CONTEXT</span>
                    </div>
                    <div class="ai-chat-status">
                        <span class="ai-status-dot"></span>
                        <span>Online</span>
                    </div>
                </div>
            </div>
            <button id="ai-chat-close" class="ai-chat-close-btn" aria-label="Close chat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </header>

        <!-- Messages area -->
        <div id="ai-chat-messages" class="ai-chat-messages" role="log" aria-live="polite"></div>

        <!-- Suggested questions (full-width cards) -->
        <div class="ai-chat-suggestions" id="ai-chat-suggestions">
            <p class="ai-suggest-label">SUGGESTED QUESTIONS</p>
            <button class="ai-suggest-card" data-q="What are Rogem's technical skills?">
                <span>What are Rogem's technical skills?</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button class="ai-suggest-card" data-q="Tell me about his projects.">
                <span>Tell me about his projects.</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button class="ai-suggest-card" data-q="What kind of roles is Rogem open to?">
                <span>What kind of roles is Rogem open to?</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
        </div>

        <!-- Input bar -->
        <form id="ai-chat-form" class="ai-chat-form" autocomplete="off">
            <input id="ai-chat-input" class="ai-chat-input" type="text" placeholder="Ask about projects, skills, background..." maxlength="400" autocomplete="off" aria-label="Chat input" required />
            <button type="submit" id="ai-chat-send" class="ai-chat-send-btn" aria-label="Send message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
            </button>
        </form>
    `;

    // Append trigger to header navigation so it moves smoothly with scroll
    const navActions = document.querySelector('.nav-actions-group');
    if (navActions) {
        navActions.appendChild(trigger);
    } else {
        document.body.appendChild(trigger);
    }
    document.body.appendChild(panel);
}

// ——— MESSAGES ————————————————————————————————————————————————————————————————
function appendMessage(role, text, isTyping = false) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return null;

    const wrap = document.createElement('div');
    wrap.className = `ai-msg ai-msg-${role}${isTyping ? ' ai-msg-typing' : ''}`;

    // AI messages get a small avatar icon
    if (role === 'ai') {
        const avatar = document.createElement('div');
        avatar.className = 'ai-msg-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.innerHTML = `<img src="assets/images/profile.png" alt="RogemAI" class="ai-avatar-img" />`;
        wrap.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'ai-msg-bubble';

    if (isTyping) {
        bubble.innerHTML = `<span class="ai-typing-dots"><span></span><span></span><span></span></span>`;
    } else {
        bubble.innerHTML = renderMarkdown(text);
    }

    wrap.appendChild(bubble);
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
    return wrap;
}

function showWelcome() {
    const container = document.getElementById('ai-chat-messages');
    if (!container || container.children.length > 0) return;
    appendMessage('ai', "Hello! I am Rogem's AI Assistant. Ask me anything about his technical projects, skills, experience, or background!");
}

// ——— OPEN / CLOSE ————————————————————————————————————————————————————————————
function openChat() {
    const panel = document.getElementById('ai-chat-panel');
    const trigger = document.getElementById('ai-chat-trigger');
    if (!panel) return;
    isOpen = true;
    panel.classList.add('is-open');
    trigger?.classList.add('is-active');
    showWelcome();
    setTimeout(() => document.getElementById('ai-chat-input')?.focus(), 300);
}

function closeChat() {
    const panel = document.getElementById('ai-chat-panel');
    const trigger = document.getElementById('ai-chat-trigger');
    if (!panel) return;
    isOpen = false;
    panel.classList.remove('is-open');
    trigger?.classList.remove('is-active');
}

// ——— SEND ————————————————————————————————————————————————————————————————————
async function handleSend(text) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    // Hide suggestions after first send
    const sugEl = document.getElementById('ai-chat-suggestions');
    if (sugEl) sugEl.style.display = 'none';

    appendMessage('user', trimmed);
    chatHistory.push({ role: 'user', text: trimmed });

    isThinking = true;
    const input   = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    if (input)   { input.value = ''; input.disabled = true; }
    if (sendBtn) sendBtn.disabled = true;

    const typingEl = appendMessage('ai', '', true);

    try {
        const reply = await sendToGemini(trimmed);
        typingEl?.remove();
        appendMessage('ai', reply);
        chatHistory.push({ role: 'ai', text: reply });
    } catch (err) {
        typingEl?.remove();
        const errMsg = err.message?.includes('API key not valid')
            ? 'API key is invalid. Please update `GEMINI_API_KEY` in `ai-chat.js`.'
            : `Something went wrong: ${err.message}`;
        appendMessage('ai', errMsg);
    } finally {
        isThinking = false;
        if (input)   { input.disabled = false; input.focus(); }
        if (sendBtn) sendBtn.disabled = false;
    }
}

// ——— INIT ————————————————————————————————————————————————————————————————————
function initAIChat() {
    buildChatUI();

    document.getElementById('ai-chat-trigger')?.addEventListener('click', () => {
        isOpen ? closeChat() : openChat();
    });

    document.getElementById('ai-chat-close')?.addEventListener('click', closeChat);

    document.getElementById('ai-chat-form')?.addEventListener('submit', e => {
        e.preventDefault();
        handleSend(document.getElementById('ai-chat-input')?.value || '');
    });

    document.querySelectorAll('.ai-suggest-card').forEach(card => {
        card.addEventListener('click', () => handleSend(card.dataset.q || card.textContent));
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isOpen) closeChat();
    });

    document.addEventListener('click', e => {
        const panel   = document.getElementById('ai-chat-panel');
        const trigger = document.getElementById('ai-chat-trigger');
        if (isOpen && panel && !panel.contains(e.target) && !trigger?.contains(e.target)) {
            closeChat();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIChat);
} else {
    initAIChat();
}
