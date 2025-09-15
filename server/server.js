import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
// Node 18+ has global fetch

const app = express();
const PORT = process.env.PORT || 8080;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

// Config
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
// Resolve paths relative to this file so `npm start` from server/ or other CWDs work consistently
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Migrate legacy data directory (older versions wrote to server/server/data)
const LEGACY_DATA_DIR = path.join(__dirname, 'server', 'data');
const LEGACY_ORDERS_FILE = path.join(LEGACY_DATA_DIR, 'orders.json');
const LEGACY_MESSAGES_FILE = path.join(LEGACY_DATA_DIR, 'messages.json');

// Ensure data dir and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
// If legacy files exist and new ones do not, migrate them
if (fs.existsSync(LEGACY_ORDERS_FILE) && !fs.existsSync(ORDERS_FILE)) {
  fs.copyFileSync(LEGACY_ORDERS_FILE, ORDERS_FILE);
}
if (fs.existsSync(LEGACY_MESSAGES_FILE) && !fs.existsSync(MESSAGES_FILE)) {
  fs.copyFileSync(LEGACY_MESSAGES_FILE, MESSAGES_FILE);
}
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));

app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  }
}));

// Serve static frontend: prefer bundled public/ inside server, then fall back to project root
app.use(express.static(PUBLIC_DIR));
app.use(express.static(ROOT_DIR));

// Basic health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Services catalog (edit as needed)
const services = [
  { key: 'basic', title: 'Basic Plan', startingPrice: 8000, currency: 'INR', description: 'Single landing page (front-end). Responsive UI, SEO basics, analytics hookup.' },
  { key: 'standard', title: 'Standard Plan', startingPrice: 15000, currency: 'INR', description: 'Multi-page site (front-end). Up to 5 pages, navigation, SEO meta, sitemap.' },
  { key: 'premium', title: 'Premium Plan', startingPrice: 25000, currency: 'INR', description: 'Full-stack e-commerce with auth, catalog, cart, checkout, and admin.' },
  // Add-ons / monthly services
  { key: 'maintenance', title: 'Website Maintenance (Monthly)', startingPrice: 2000, currency: 'INR', description: 'Core/plugin updates, uptime checks, backups, minor fixes, priority support.' },
  { key: 'seo', title: 'SEO Monthly', startingPrice: 3000, currency: 'INR', description: 'On-page improvements, keywords, performance tuning, monthly report.' },
  { key: 'updates', title: 'Content & Image Updates', startingPrice: 1500, currency: 'INR', description: 'Up to 10 content/image changes per batch with optimization.' },
  { key: 'revisions', title: 'Extra Revisions Pack', startingPrice: 1000, currency: 'INR', description: 'Three extra design/content revision rounds on existing work.' },
];

app.get('/api/services', (_req, res) => {
  res.json({ services });
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { name, email, phone, serviceKey, details, budget } = req.body || {};
    if (!name || !email || !serviceKey) {
      return res.status(400).json({ error: 'Missing required fields: name, email, serviceKey' });
    }
    const service = services.find(s => s.key === serviceKey);
    if (!service) return res.status(400).json({ error: 'Invalid serviceKey' });

    const order = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      name,
      email,
      phone: phone || '',
      serviceKey,
      serviceTitle: service.title,
      details: details || '',
      budget: budget || '',
      status: 'pending',
    };

    // Persist
    const existing = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    existing.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(existing, null, 2));

    // Optional email notification
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT || 587;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    if (ADMIN_EMAIL && SMTP_HOST && SMTP_USER && SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT),
          secure: Number(SMTP_PORT) === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS }
        });
        await transporter.sendMail({
          from: `Studio by Azzi <${SMTP_USER}>`,
          to: ADMIN_EMAIL,
          subject:  `New Order ${order.id} — ${order.serviceTitle}`, 
          text: `New order received\n\nID: ${order.id}\nName: ${name}\nEmail: ${email}\nPhone: ${order.phone}\nService: ${order.serviceTitle}\nBudget: ${order.budget}\nDetails: ${order.details}\nCreated: ${order.createdAt}`
        });
      } catch (e) {
        console.error('Email failed:', e.message);
      }
    }

    // Placeholder for integrating payment links (Razorpay/Stripe)
    // Return basic confirmation for now
    return res.status(201).json({
      ok: true,
      orderId: order.id,
      message: 'Order created. We will contact you shortly to confirm and share payment instructions.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basic fetch order endpoint (no auth; keep minimal info)
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const existing = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  const order = existing.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json({ id: order.id, status: order.status, serviceTitle: order.serviceTitle, createdAt: order.createdAt });
});

// --- AI chat (optional OpenAI) ---
function ruleBasedReply(user, services) {
  const msg = (user || '').toLowerCase();
  const bullets = services.map(s => `- ${s.title} â€” starting â‚¹${s.startingPrice}`).join('\n');
  if (/price|cost|rate|charges?/.test(msg)) {
    return `Here are my starting prices:\n${bullets}\nI can share a precise quote after a quick brief on features and timeline.`;
  }
  if (/logo|brand/.test(msg)) {
    return `I design distinctive logos and brand kits with multiple concepts and revisions. Youâ€™ll get vector, PNG, and SVG exports, plus a mini brand guide.`;
  }
  if (/front\s*-?end|landing|website/.test(msg)) {
    return `Frontâ€‘end sites are fast, responsive, and SEOâ€‘ready. Perfect for landing or marketing pages. If you need logins, dashboards, or payments, a fullâ€‘stack solution fits better.`;
  }
  if (/full\s*-?stack|backend|database|auth/.test(msg)) {
    return `Fullâ€‘stack includes database, APIs, and admin panels. Secure and scalable with clear documentation. We can scope features and integrations you need.`;
  }
  if (/time|timeline|how long|deliver/.test(msg)) {
    return `Typical timelines: logos 2â€‘5 days, frontâ€‘end websites 5â€‘10 days, fullâ€‘stack MVPs 2â€‘4 weeks depending on scope.`;
  }
  if (/pay|payment|upi|advance|price link/.test(msg)) {
    return `I accept UPI (9906617652@omni) and bank transfer. Usually itâ€™s 50% to start and the rest on delivery/approval. I can also send a payment link.`;
  }
  if (/contact|whats.?app|phone|email/.test(msg)) {
    return `You can reach me at WhatsApp +91 99066 17652 or email bhtazim2018@gmail.com. Happy to chat!`;
  }
  return `Tell me what youâ€™re looking to build (frontâ€‘end, fullâ€‘stack, logo, banners). Share any reference sites and deadlines â€” Iâ€™ll suggest the best plan and pricing.`;
}

async function callOpenAI(messages) {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature: 0.4,
    })
  });
  if (!resp.ok) throw new Error(`OpenAI error: ${resp.status}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message || typeof message !== 'string') return res.status(400).json({ error: 'message required' });
    const sys = {
      role: 'system',
      content: `You are Azzi's assistant for Studio by Azzi (web development).
Answer briefly, friendly, and helpful. Use INR pricing.
Services and starting prices:\n${services.map(s=>`${s.title}: ₹₹${s.startingPrice}+`).join('\n')}
UPI: 9906617652@omni. Phone/WhatsApp: +91 99066 17652. Email: bhtazim2018@gmail.com.`
    };
    let reply = '';
    if (OPENAI_API_KEY) {
      try {
        const messages = [sys, ...history, { role: 'user', content: message }];
        reply = await callOpenAI(messages);
      } catch (e) {
        // Fallback to rules if API call fails
        reply = webRuleBasedReply(message, services);
      }
    } else {
      reply = webRuleBasedReply(message, services);
    }
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Web-only rule-based replies (fallback)
function webRuleBasedReply(user, services) {
  const msg = (user || '').toLowerCase();
  const bullets = services.map(s => `- ${s.title} â€” starting â‚¹${s.startingPrice}`).join('\n');
  if (/price|cost|rate|charges?/.test(msg)) {
    return `Here are my plans and starting prices:\n${bullets}\nPayment terms: 50% upfront to start, 50% after completion.`;
  }
  if (/front\s*-?end|landing|website/.test(msg)) {
    return `Front-end sites are fast, responsive, and SEO-ready. The Basic plan (â‚¹8k) covers a clean landing page; Standard (â‚¹15k) covers a multi-page site.`;
  }
  if (/full\s*-?stack|backend|database|auth|e-?comm|commerce/.test(msg)) {
    return `Premium (â‚¹25k) is full-stack with auth, product catalog, cart, checkout, and an admin dashboard.`;
  }
  if (/time|timeline|how long|deliver/.test(msg)) {
    return `Typical timelines: Basic 3â€“5 days, Standard 7â€“12 days, Premium 2â€“4 weeks depending on scope.`;
  }
  if (/pay|payment|upi|advance|price link/.test(msg)) {
    return `I accept UPI (9906617652@omni) and bank transfer. Payment terms: 50% upfront, 50% on delivery.`;
  }
  if (/contact|whats.?app|phone|email/.test(msg)) {
    return `You can reach me at WhatsApp +91 99066 17652 or email bhtazim2018@gmail.com. Happy to chat!`;
  }
  return `Tell me about your project and which plan (Basic, Standard, Premium) youâ€™re considering. Share any references and deadlines â€” Iâ€™ll suggest the best approach and pricing.`;
}

// --- Chat (public submit) ---
app.post('/api/chat', async (req, res) => {
  try {
    const { name, email, message, page } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const chat = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      name: (name || '').toString().slice(0, 100),
      email: (email || '').toString().slice(0, 200),
      message: message.toString().slice(0, 2000),
      page: (page || '').toString().slice(0, 200),
      status: 'unread'
    };
    const list = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    list.push(chat);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2));

    // Optional email
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT || 587;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    if (ADMIN_EMAIL && SMTP_HOST && SMTP_USER && SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT),
          secure: Number(SMTP_PORT) === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS }
        });
        await transporter.sendMail({
          from: `Studio by Azzi <${SMTP_USER}>`,
          to: ADMIN_EMAIL,
          subject: `New Chat Message ${chat.id}`,
          text: `New chat message\n\nID: ${chat.id}\nName: ${chat.name}\nEmail: ${chat.email}\nPage: ${chat.page}\nMessage: ${chat.message}\nCreated: ${chat.createdAt}`
        });
      } catch (e) {
        console.error('Chat email failed:', e.message);
      }
    }

    res.status(201).json({ ok: true, id: chat.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Admin endpoints (token required) ---
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) return res.status(503).json({ error: 'Admin not configured' });
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// List all orders
app.get('/api/admin/orders', requireAdmin, (_req, res) => {
  const list = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  // sort newest first
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders: list });
});

// Update order status
app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowed = ['pending','confirmed','in_progress','delivered','paid','cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const list = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  const idx = list.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  list[idx].status = status;
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2));
  res.json({ ok: true, order: list[idx] });
});

// Delete order
app.delete('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const list = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  const idx = list.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = list.splice(idx, 1);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2));
  res.json({ ok: true, removedId: removed.id });
});

// Admin: list chat messages
app.get('/api/admin/chat', requireAdmin, (_req, res) => {
  const list = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ messages: list });
});

// Admin: update chat status
app.patch('/api/admin/chat/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowed = ['unread', 'read', 'replied'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const list = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  const idx = list.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  list[idx].status = status;
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2));
  res.json({ ok: true, message: list[idx] });
});

// Admin: delete chat
app.delete('/api/admin/chat/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const list = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  const idx = list.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = list.splice(idx, 1);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2));
  res.json({ ok: true, removedId: removed.id });
});

app.listen(PORT, () => {
  console.log(`Studio by Azzi backend listening on http://localhost:${PORT}`);
  console.log('Frontend available at the same URL. Open your browser to view the site.');
});

