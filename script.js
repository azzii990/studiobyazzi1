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
  navToggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
}
document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => document.body.classList.remove('nav-open'));
});

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
  });
}

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
  launcher.title = 'Chat with Azzi';
  launcher.textContent = '💬';
  const win = document.createElement('div');
  win.className = 'chat-window';
  win.innerHTML = `
    <div class="chat-header">
      <h3>Chat with Azzi</h3>
      <button class="btn btn-outline" data-close-chat title="Close">×</button>
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

  const chatBody = win.querySelector('#chatBody');
  const chatForm = win.querySelector('#chatForm');
  const chatInput = win.querySelector('#chatInput');
  const closeBtn = win.querySelector('[data-close-chat]');

  function open(){ win.classList.add('open'); chatInput.focus(); }
  function close(){ win.classList.remove('open'); }
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
      const typing = document.createElement('div'); typing.className = 'chat-msg bot'; typing.textContent = '…'; chatBody.appendChild(typing); chatBody.scrollTop = chatBody.scrollHeight;
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

      // Also log as lead in background
      const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/);
      const nameMatch = text.split(/[\.!?]/)[0].split(' ').slice(0,2).join(' ');
      await fetch(`${BACKEND_BASE_URL}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameMatch, email: emailMatch?.[0] || '', message: text, page: location.pathname })
      });
    } catch (err) {
      pushBot("I'm here, but something went wrong sending your message. You can WhatsApp me: +91 99066 17652");
    }
  });
})();

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

