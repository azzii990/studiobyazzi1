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
const navMenu = document.querySelector('.main-nav');

if (navToggle) {
  if (navMenu && !navMenu.id) navMenu.id = 'siteNav';
  navToggle.type = 'button';
  if (navMenu) navToggle.setAttribute('aria-controls', navMenu.id);
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
(function heroSpotlight() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  let raf = 0;
  let px = 50;
  let py = 50;

  const set = (x, y) => {
    hero.style.setProperty('--mx', x + '%');
    hero.style.setProperty('--my', y + '%');
  };

  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      set(px, py);
      raf = 0;
    });
  };

  const moveTo = (clientX, clientY) => {
    const rect = hero.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    px = Math.max(0, Math.min(100, x));
    py = Math.max(0, Math.min(100, y));
    schedule();
  };

  const activate = () => hero.classList.add('spotlight-active');
  const deactivate = () => {
    hero.classList.remove('spotlight-active');
    px = 50;
    py = 50;
    schedule();
  };

  hero.addEventListener('mouseenter', activate);
  hero.addEventListener('mousemove', (event) => {
    activate();
    moveTo(event.clientX, event.clientY);
  });
  hero.addEventListener('mouseleave', deactivate);
  hero.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    activate();
    moveTo(touch.clientX, touch.clientY);
  }, { passive: true });
  hero.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (touch) moveTo(touch.clientX, touch.clientY);
  }, { passive: true });
  hero.addEventListener('touchend', deactivate);
  hero.addEventListener('touchcancel', deactivate);

  set(px, py);
})();

// Typography/copy cleanup for corrupted characters
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
      showQPStatus('Amount set to ₹' + val.toLocaleString('en-IN'));
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
  if (document.querySelector('.chat-launcher')) return;
  const launcher = document.createElement('button');
  launcher.className = 'chat-launcher';
  launcher.type = 'button';
  launcher.title = 'Ask AI';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12c0 4.418-4.03 8-9 8-1.03 0-2.015-.15-2.93-.427L3 21l1.53-4.59C3.56 15.14 3 13.62 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const win = document.createElement('div');
  win.className = 'chat-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-modal', 'false');
  win.setAttribute('aria-label', 'AI assistant chat');
  win.innerHTML = `
    <div class="chat-header">
      <h3 id="chatTitle">AI Assistant</h3>
      <button type="button" class="btn btn-outline" data-close-chat aria-label="Close chat">&times;</button>
    </div>
    <div class="chat-body" id="chatBody" aria-live="polite" aria-atomic="false"></div>
    <form class="chat-form" id="chatForm" aria-labelledby="chatTitle">
      <input type="text" id="chatInput" placeholder="Type your message..." autocomplete="off" required />
      <button type="submit" class="btn btn-primary">Send</button>
    </form>`;
  document.body.appendChild(launcher);
  document.body.appendChild(win);
  const chatBody = win.querySelector('#chatBody');
  const chatForm = win.querySelector('#chatForm');
  const chatInput = win.querySelector('#chatInput');
  const closeBtn = win.querySelector('[data-close-chat]');
  const initialMessage = "Hi! I'm Azzi's AI assistant. Ask anything about services, pricing, timelines, or tech.";
  const scrollToLatest = () => { chatBody.scrollTop = chatBody.scrollHeight; };
  const pushUser = (text) => {
    const node = document.createElement('div');
    node.className = 'chat-msg user';
    node.textContent = text;
    chatBody.appendChild(node);
    scrollToLatest();
  };
  const pushBot = (text) => {
    const node = document.createElement('div');
    node.className = 'chat-msg bot';
    node.textContent = text;
    chatBody.appendChild(node);
    scrollToLatest();
    return node;
  };
  pushBot(initialMessage);
  const open = () => {
    win.classList.add('open');
    launcher.setAttribute('aria-expanded', 'true');
    chatInput.focus();
  };
  const close = () => {
    win.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
  };
  window.openAIChat = open;
  launcher.addEventListener('click', () => {
    if (win.classList.contains('open')) close(); else open();
  });
  document.addEventListener('click', (event) => {
    if (!win.classList.contains('open')) return;
    if (event.target === launcher || launcher.contains(event.target)) return;
    if (win.contains(event.target)) return;
    close();
  });
  closeBtn?.addEventListener('click', close);
  win.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
      launcher.focus();
    }
  });
  const aiHistory = [];
  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    pushUser(text);
    chatInput.value = '';
    const typing = pushBot('AI is thinking...');
    typing.classList.add('typing');
    try {
      const aiRes = await fetch(`${BACKEND_BASE_URL}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: aiHistory })
      });
      const aiData = await aiRes.json().catch(() => ({ reply: '' }));
      typing.remove();
      if (!aiRes.ok || !aiData.reply) {
        pushBot('Thanks for reaching out! WhatsApp me at +91 99066 17652 and I\'ll reply right away.');
        return;
      }
      pushBot(aiData.reply);
      aiHistory.push({ role: 'user', content: text });
      aiHistory.push({ role: 'assistant', content: aiData.reply });
    } catch (error) {
      typing.remove();
      pushBot('I\'m here, but something went wrong sending your message. You can WhatsApp me at +91 99066 17652.');
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

// Redirect to payment with plan details instead of opening modal
const PLAN_AMOUNTS = { basic: 8999, standard: 16999, premium: 29999, maintenance: 2000, seo: 3000, updates: 1500, revisions: 1000 };
document.querySelectorAll('.order-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const key = btn.dataset.service || '';
    const amt = PLAN_AMOUNTS[key] || '';
    const title = btn.dataset.serviceTitle || '';
    const params = new URLSearchParams();
    if (key) params.set('plan', key);
    if (amt) params.set('amount', String(amt));
    if (title) params.set('title', title);
    const base = (location.pathname.endsWith('/services.html') || location.pathname.includes('/services.html')) ? 'payment.html' : '/payment.html';
    location.href = base + '?' + params.toString();
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

// Prefill payment page from URL query (plan, amount, title)
try {
  const qp = new URLSearchParams(location.search);
  const urlAmt = parseFloat(qp.get('amount') || '');
  const urlPlan = qp.get('plan') || '';
  const urlTitle = qp.get('title') || '';
  const urlNote = qp.get('note') || '';
  if (!Number.isNaN(urlAmt) && qpAmount) {
    qpAmount.value = urlAmt;
    if (typeof updateUpiQR === 'function') updateUpiQR();
  }
  if (qpNote && (urlNote || urlPlan || urlTitle)) {
    if (urlNote) {
      qpNote.value = urlNote;
    } else {
      const pieces = [];
      if (urlTitle) pieces.push(urlTitle);
      if (urlPlan) pieces.push('plan: ' + urlPlan);
      qpNote.value = pieces.join(' | ');
    }
  }
} catch {}

// --- Simple cart (localStorage) ---
(function cartInit(){
  const PLAN_AMOUNTS = { basic: 8999, standard: 16999, premium: 29999 };
  const CART_KEY = 'sba_cart';

  const getCart = () => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  };

  const getItemCount = (cart) => cart.reduce((sum, item) => sum + (item && item.qty ? Number(item.qty) : 1), 0);

  let drawer;
  let itemsEl;
  let emptyEl;
  let totalEl;
  let checkoutLink;
  let clearBtn;

  const updateCartCount = () => {
    const el = document.querySelector('[data-cart-count]') || document.getElementById('cartCount');
    if (el) el.textContent = String(getItemCount(getCart()));
  };

  const renderCartList = () => {
    if (!itemsEl || !totalEl || !emptyEl || !checkoutLink || !clearBtn) return;
    const cart = getCart();
    itemsEl.innerHTML = '';
    if (!cart.length) {
      emptyEl.style.display = 'block';
      totalEl.textContent = 'Rs 0';
      checkoutLink.classList.add('disabled');
      clearBtn.disabled = true;
      updateCartCount();
      return;
    }
    emptyEl.style.display = 'none';
    checkoutLink.classList.remove('disabled');
    clearBtn.disabled = false;
    let total = 0;
    cart.forEach((item, index) => {
      const qty = item && item.qty ? Number(item.qty) : 1;
      const price = item && item.price ? Number(item.price) : 0;
      const lineTotal = price * qty;
      total += lineTotal;
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div class="cart-item__info">
          <span class="cart-item__title">${item.title}</span>
          <span class="cart-item__meta">Rs ${price.toLocaleString('en-IN')} x ${qty}</span>
        </div>
        <div class="cart-item__actions">
          <span class="cart-item__amount">Rs ${lineTotal.toLocaleString('en-IN')}</span>
          <button type="button" class="cart-remove" data-remove-item="${index}">Remove</button>
        </div>`;
      itemsEl.appendChild(li);
    });
    totalEl.textContent = 'Rs ' + total.toLocaleString('en-IN');
    updateCartCount();
  };

  const setCart = (items) => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartCount();
    renderCartList();
  };

  const ensureQuantity = (value) => {
    const qty = Number(value);
    if (!Number.isFinite(qty) || qty <= 0) return 1;
    return Math.floor(qty);
  };

  const injectCartBtn = () => {
    const hdr = document.querySelector('.header-cta');
    if (!hdr || hdr.querySelector('[data-open-cart]')) return;
    const btn = document.createElement('a');
    btn.href = '#';
    btn.className = 'btn btn-outline cart-header-btn';
    btn.setAttribute('data-open-cart', '');
    btn.setAttribute('aria-label', 'Open cart');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M6 6h.01M6 6l1.2 9.6a2 2 0 0 0 2 1.8h6.9a2 2 0 0 0 1.98-1.7l1.3-7.7H7.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.6" fill="currentColor"/><circle cx="18" cy="20" r="1.6" fill="currentColor"/></svg><span class="cart-count" data-cart-count>0</span>';
    hdr.appendChild(btn);
    updateCartCount();
  };

  const closeCart = () => {
    if (!drawer) return;
    drawer.classList.remove('open');
    document.body.classList.remove('cart-open');
  };

  const ensureDrawer = () => {
    if (drawer) return drawer;
    drawer = document.createElement('div');
    drawer.className = 'cart-container';
    drawer.innerHTML = `
      <div class="cart-overlay" data-close-cart></div>
      <aside class="cart-panel" role="dialog" aria-label="Selected plans">
        <header class="cart-panel__header">
          <h3>Selected Plans</h3>
          <button type="button" class="cart-close" data-close-cart aria-label="Close cart">&times;</button>
        </header>
        <div class="cart-panel__body">
          <ul class="cart-items" data-cart-items></ul>
          <p class="cart-empty" data-cart-empty>No plans added yet.</p>
        </div>
        <footer class="cart-panel__footer">
          <div class="cart-total">
            <span>Total</span>
            <strong data-cart-total>Rs 0</strong>
          </div>
          <a class="btn btn-primary cart-checkout" data-cart-checkout href="payment.html">Proceed to Payment</a>
          <button type="button" class="btn btn-ghost cart-clear" data-cart-clear>Clear Cart</button>
        </footer>
      </aside>`;
    document.body.appendChild(drawer);
    itemsEl = drawer.querySelector('[data-cart-items]');
    emptyEl = drawer.querySelector('[data-cart-empty]');
    totalEl = drawer.querySelector('[data-cart-total]');
    checkoutLink = drawer.querySelector('[data-cart-checkout]');
    clearBtn = drawer.querySelector('[data-cart-clear]');

    drawer.addEventListener('click', (event) => {
      if (event.target.closest('[data-close-cart]')) {
        event.preventDefault();
        closeCart();
      }
    });

    clearBtn.addEventListener('click', () => setCart([]));

    checkoutLink.addEventListener('click', (event) => {
      const cart = getCart();
      if (!cart.length) {
        event.preventDefault();
        return;
      }
      const total = cart.reduce((sum, item) => sum + (item && item.price ? Number(item.price) : 0) * (item && item.qty ? Number(item.qty) : 1), 0);
      const note = cart.map(item => `${item.title} (Rs ${item.price}) x ${item.qty || 1}`).join(' | ');
      const params = new URLSearchParams({ amount: String(total), title: 'Cart', note });
      checkoutLink.href = 'payment.html?' + params.toString();
    });

    renderCartList();
    return drawer;
  };

  const openCart = () => {
    ensureDrawer();
    renderCartList();
    drawer.classList.add('open');
    document.body.classList.add('cart-open');
  };

  document.addEventListener('click', (event) => {
    const openBtn = event.target.closest('[data-open-cart]');
    if (openBtn) {
      event.preventDefault();
      openCart();
      return;
    }
    const removeBtn = event.target.closest('[data-remove-item]');
    if (removeBtn) {
      const index = Number(removeBtn.getAttribute('data-remove-item'));
      if (!Number.isNaN(index)) {
        const cart = getCart();
        cart.splice(index, 1);
        setCart(cart);
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCart();
  });

  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      const key = btn.dataset.planId || btn.dataset.service || '';
      const title = btn.dataset.planName || btn.dataset.serviceTitle || btn.getAttribute('data-title') || btn.textContent.trim() || 'Selected Service';
      const price = parseFloat(btn.dataset.planPrice || '') || PLAN_AMOUNTS[key] || 0;
      if (!key || !price) {
        openCart();
        return;
      }
      const cart = getCart();
      const existing = cart.find(item => item.key === key);
      if (existing) {
        existing.qty = ensureQuantity((existing.qty || 1) + 1);
      } else {
        cart.push({ key, title, price, qty: 1 });
      }
      setCart(cart);
      const originalText = btn.dataset.originalText || btn.textContent.trim();
      btn.dataset.originalText = originalText;
      btn.classList.add('added');
      btn.textContent = 'Added!';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('added');
      }, 1500);
      openCart();
    });
  });

  injectCartBtn();
  updateCartCount();
})();

// Payment page summary rendering
(function paymentSummary(){
  const box = document.getElementById('orderSummaryBox');
  if (!box) return;
  const listHost = document.getElementById('orderSummary');
  const totalEl = document.getElementById('orderTotal');
  const proceed = document.getElementById('proceedToPay');
  const CART_KEY = 'sba_cart';
  const storedCart = (() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  })();
  const qp = new URLSearchParams(location.search);
  const items = storedCart.length ? storedCart : (() => {
    const key = qp.get('plan') || '';
    const title = qp.get('title') || 'Selected Service';
    const price = parseFloat(qp.get('amount') || '') || 0;
    if (!key && !price) return [];
    return [{ key, title, price, qty: 1 }];
  })();
  let total = 0;
  listHost.innerHTML = '';
  if (!items.length) {
    listHost.innerHTML = '<p class="cart-empty">No plans selected yet.</p>';
  } else {
    items.forEach(item => {
      const qty = item.qty ? Number(item.qty) : 1;
      const price = item.price || 0;
      const lineTotal = price * qty;
      total += lineTotal;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `<div><b>${item.title}</b><div style="color:#b3c0d4;font-size:12px">Rs ${price.toLocaleString('en-IN')} x ${qty}</div></div><div><strong>Rs ${lineTotal.toLocaleString('en-IN')}</strong></div>`;
      listHost.appendChild(row);
    });
  }
  totalEl.textContent = 'Rs ' + total.toLocaleString('en-IN');
  if (typeof qpAmount !== 'undefined' && qpAmount) qpAmount.value = total || qpAmount.value;
  if (typeof qpNote !== 'undefined' && qpNote && items.length) {
    qpNote.value = items.map(item => `${item.title} (Rs ${item.price}) x ${item.qty || 1}`).join(' | ');
  }
  proceed?.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('openUpi')?.click();
  });
})();










