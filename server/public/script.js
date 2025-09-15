// Configure your backend base URL here (leave empty for same-origin)
const BACKEND_BASE_URL = '';

// Tabs switching
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.tab;
    tabs.forEach(b => b.classList.toggle('active', b === btn));
    panels.forEach(p => p.classList.toggle('active', p.id === `tab-${key}`));
  });
});

// Copy UPI ID
const copyBtn = document.getElementById('copyUpi');
const upi = document.getElementById('upiId');
if (copyBtn && upi) {
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(upi.textContent.trim());
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy UPI ID'), 1500);
    } catch (e) {
      const range = document.createRange();
      range.selectNode(upi);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('copy');
      sel.removeAllRanges();
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy UPI ID'), 1500);
    }
  });
}

// Current year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Smooth scroll for internal anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
  // Add SVG hamburger and ARIA state
  navToggle.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}
document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => document.body.classList.remove('nav-open'));
});

// Hero spotlight cursor effect
(function heroSpotlight(){
  const hero = document.querySelector('.hero');
  if (!hero) return;
  let raf = 0, px = 0, py = 0;
  const set = (x, y) => {
    hero.style.setProperty('--mx', x + '%');
    hero.style.setProperty('--my', y + '%');
  };
  const onMove = (clientX, clientY) => {
    const r = hero.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * 100;
    const y = ((clientY - r.top) / r.height) * 100;
    px = Math.max(0, Math.min(100, x));
    py = Math.max(0, Math.min(100, y));
    if (!raf) raf = requestAnimationFrame(() => { set(px, py); raf = 0; });
  };
  hero.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
  hero.addEventListener('mouseleave', () => set(50, 50));
  hero.addEventListener('touchstart', (e) => {
    const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY);
  }, { passive: true });
  hero.addEventListener('touchmove', (e) => {
    const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY);
  }, { passive: true });
})();

// Typography/copy cleanup for corrupted characters
(function cleanCopy(){
  const replacements = new Map([
    ['Frontï¿½?`end', 'Frontâ€‘end'],
    ['Fullï¿½?`stack', 'Fullâ€‘stack'],
    ['Backï¿½?`end', 'Backâ€‘end'],
    ['Eï¿½?`commerce', 'Eâ€‘commerce'],
    ['SEOï¿½?`ready', 'SEOâ€‘ready'],
    ['ï¿½?"', 'â€”'],
    ['Ac ', 'Â© '],
    ['ï¿½?ï¿½', 'â€¦'],
    ['ï¿½~ï¿½', 'â˜°'],
    ['ï¿½,1', 'â‚¹']
  ]);
  const walker = document.createTreeWalker(document, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    let t = n.nodeValue;
    let changed = false;
    replacements.forEach((to, from) => {
      if (t.includes(from)) { t = t.split(from).join(to); changed = true; }
    });
    if (changed) n.nodeValue = t;
  }
})();

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('is-visible');
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
}

// Lightbox for images
let lightbox;
function openLightbox(src, alt='') {
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<img alt="" />';
    lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
    document.body.appendChild(lightbox);
  }
  const img = lightbox.querySelector('img');
  img.src = src; img.alt = alt;
  lightbox.classList.add('open');
}
document.querySelectorAll('[data-lightbox]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const src = el.getAttribute('data-lightbox') || el.getAttribute('src');
    const alt = el.getAttribute('alt') || '';
    if (src) openLightbox(src, alt);
  });
});

// Simple confetti
function confetti(durationMs = 1200, colors = ['#4f7cff','#29c36a','#ffd166','#ef476f']) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:100';
  document.body.appendChild(canvas);
  const dpr = window.devicePixelRatio || 1;
  function resize(){ canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; }
  resize();
  const N = 120; const parts = [];
  for (let i=0;i<N;i++) parts.push({
    x: Math.random()*canvas.width, y: -Math.random()*canvas.height,
    r: 2 + Math.random()*4, c: colors[i%colors.length], v: 2+Math.random()*3, w: Math.random()*2
  });
  let start = performance.now();
  (function tick(t){
    const elapsed = t - start; ctx.clearRect(0,0,canvas.width,canvas.height);
    parts.forEach(p=>{ p.y += p.v*dpr; p.x += Math.sin((elapsed/200)+p.w)*dpr; ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*dpr,0,6.283); ctx.fill(); });
    if (elapsed < durationMs) requestAnimationFrame(tick); else canvas.remove();
  })(start);
}

// Quick Pay: build UPI deep link
const qpAmount = document.getElementById('qpAmount');
const qpNote = document.getElementById('qpNote');
const openUpi = document.getElementById('openUpi');
const copyUpiLink = document.getElementById('copyUpiLink');
const qpStatus = document.getElementById('qpStatus');
const upiQr = document.getElementById('upiQr');
const qrWrap = document.getElementById('qrWrap');
const UPI_ID = '9906617652@omni';
const UPI_PN = encodeURIComponent('Studio by Azzi');

function buildUpiLink() {
  const base = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${UPI_PN}&cu=INR`;
  const a = parseFloat(qpAmount?.value || '');
  const n = (qpNote?.value || '').trim();
  const parts = [base];
  if (!Number.isNaN(a) && a > 0) parts.push(`am=${encodeURIComponent(a.toFixed(2))}`);
  if (n) parts.push(`tn=${encodeURIComponent(n)}`);
  return parts.join('&');
}

function updateUpiQR() {
  if (!upiQr || !qrWrap) return;
  const link = buildUpiLink();
  upiQr.src = 'https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=' + encodeURIComponent(link);
  qrWrap.style.display = 'block';
}

function showQPStatus(msg) {
  if (!qpStatus) return; qpStatus.style.display = 'block'; qpStatus.textContent = msg;
}

if (openUpi) {
  openUpi.addEventListener('click', (e) => {
    e.preventDefault();
    const link = buildUpiLink();
    // Try to open UPI app
    window.location.href = link;
    showQPStatus('If nothing opens, copy the link and open on your phone.');
    confetti();
    updateUpiQR();
  });
}

if (copyUpiLink) {
  copyUpiLink.addEventListener('click', async () => {
    const link = buildUpiLink();
    try {
      await navigator.clipboard.writeText(link);
      showQPStatus('Payment link copied!');
      confetti();
    } catch {
      showQPStatus('Could not copy automatically. Select and copy: ' + link);
    }
    updateUpiQR();
  });
}

// Quick amount buttons
document.querySelectorAll('.quick-amounts [data-amount]')?.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = parseFloat(btn.getAttribute('data-amount'));
    if (qpAmount && !Number.isNaN(val)) {
      qpAmount.value = val;
      updateUpiQR();
      showQPStatus('Amount set to â‚¹' + val.toLocaleString('en-IN'));
    }
  });
});

// Update QR when amount/note changes
qpAmount?.addEventListener('input', updateUpiQR);
qpNote?.addEventListener('input', updateUpiQR);

// Tips toggle
const tipsToggle = document.getElementById('tipsToggle');
const tipsContent = document.getElementById('tipsContent');
if (tipsToggle && tipsContent) {
  tipsToggle.addEventListener('click', () => {
    const open = tipsContent.style.display !== 'none';
    tipsContent.style.display = open ? 'none' : 'block';
    tipsToggle.textContent = open ? 'Show Payment Tips' : 'Hide Payment Tips';
  });
}

// Floating chat widget (simple lead chat)
(function initChat(){
  // Avoid duplicate on admin where another script could run
  if (document.querySelector('.chat-launcher')) return;
  const launcher = document.createElement('button');
  launcher.className = 'chat-launcher';
  launcher.title = 'Ask AI';
  launcher.textContent = 'ðŸ’¬';
  const win = document.createElement('div');
  win.className = 'chat-window';
  win.innerHTML = `
    <div class="chat-header">
      <h3>AI Assistant</h3>
      <button class="btn btn-outline" data-close-chat title="Close">Ã—</button>
    </div>
    <div class="chat-body" id="chatBody">
      <div class="chat-msg bot">Hi! Tell me your name, email and what you need. I reply fast.</div>
    </div>
    <form class="chat-form" id="chatForm">
      <input type="text" id="chatInput" placeholder="Type your message..." required />
      <button type="submit" class="btn btn-primary">Send</button>
    </form>`;
  document.body.appendChild(launcher);
  document.body.appendChild(win);

  // Replace launcher text with SVG icon for a cleaner look
  launcher.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12c0 4.418-4.03 8-9 8-1.03 0-2.015-.15-2.93-.427L3 21l1.53-4.59C3.56 15.14 3 13.62 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  // Ensure close button shows a proper symbol
  const closeBtnFix = win.querySelector('[data-close-chat]');
  if (closeBtnFix) closeBtnFix.textContent = 'Ã—';

  const chatBody = win.querySelector('#chatBody');
  const chatForm = win.querySelector('#chatForm');
  const chatInput = win.querySelector('#chatInput');
  const closeBtn = win.querySelector('[data-close-chat]');

  function open(){ win.classList.add('open'); chatInput.focus(); }
  function close(){ win.classList.remove('open'); }
  // Expose a global opener for header buttons
  window.openAIChat = open;
  launcher.addEventListener('click', () => {
    if (win.classList.contains('open')) close(); else open();
  });
  closeBtn.addEventListener('click', close);

  function pushUser(text){
    const d = document.createElement('div'); d.className = 'chat-msg user'; d.textContent = text; chatBody.appendChild(d); chatBody.scrollTop = chatBody.scrollHeight;
  }
  function pushBot(text){
    const d = document.createElement('div'); d.className = 'chat-msg bot'; d.textContent = text; chatBody.appendChild(d); chatBody.scrollTop = chatBody.scrollHeight;
  }

  const aiHistory = [];
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim(); if (!text) return;
    pushUser(text); chatInput.value='';
    try {
      // Send to AI
      const typing = document.createElement('div'); typing.className = 'chat-msg bot'; typing.textContent = 'â€¦'; chatBody.appendChild(typing); chatBody.scrollTop = chatBody.scrollHeight;
      const aiRes = await fetch(`${BACKEND_BASE_URL}/api/ai-chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: aiHistory })
      });
      const aiData = await aiRes.json();
      typing.remove();
      const botReply = aiData.reply || 'Thanks!';
      pushBot(botReply);
      aiHistory.push({ role: 'user', content: text });
      aiHistory.push({ role: 'assistant', content: botReply });

      // AI-only mode: no background lead logging
    } catch (err) {
      pushBot("I'm here, but something went wrong sending your message. You can WhatsApp me: +91 99066 17652");
    }
  });
})();

// Header "Ask AI" buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-open-ai]');
  if (!btn) return;
  e.preventDefault();
  if (typeof window.openAIChat === 'function') window.openAIChat();
});

// Order modal logic (Services page)
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');
const orderStatus = document.getElementById('orderStatus');
const orderServiceName = document.getElementById('orderServiceName');
const orderServiceKey = document.getElementById('orderServiceKey');

document.querySelectorAll('.order-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!orderModal) return;
    orderServiceName.textContent = btn.dataset.serviceTitle || 'Selected Service';
    orderServiceKey.value = btn.dataset.service || '';
    orderStatus.style.display = 'none';
    orderStatus.textContent = '';
    orderModal.classList.add('open');
  });
});

document.querySelectorAll('[data-close-modal]').forEach(el => {
  el.addEventListener('click', () => orderModal?.classList.remove('open'));
});

if (orderForm) {
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(orderForm);
    const payload = Object.fromEntries(fd.entries());
    const submitBtn = document.getElementById('orderSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    orderStatus.style.display = 'block';
    orderStatus.textContent = 'Submitting your order...';
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      orderStatus.textContent = `Order placed! Your Order ID is ${data.orderId}. We will contact you shortly.`;
      submitBtn.textContent = 'Submitted';
    } catch (err) {
      orderStatus.textContent = `Error: ${err.message}`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Order';
    }
  });
}

