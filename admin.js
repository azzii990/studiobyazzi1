// Configure your backend base URL here
const BACKEND_BASE_URL = ''; // same-origin when served by backend

const els = {
  tokenInput: document.getElementById('adminToken'),
  authForm: document.getElementById('adminAuth'),
  refreshBtn: document.getElementById('refreshOrders'),
  search: document.getElementById('search'),
  tbody: document.querySelector('#ordersTable tbody'),
  chatRefresh: document.getElementById('refreshChats'),
  chatSearch: document.getElementById('searchChats'),
  chatBody: document.querySelector('#chatTable tbody')
};

const storageKey = 'ADMIN_TOKEN';

function getToken() {
  return localStorage.getItem(storageKey) || '';
}

function setToken(t) {
  localStorage.setItem(storageKey, t);
}

async function fetchOrders() {
  const token = getToken();
  if (!token) {
    els.tbody.innerHTML = '<tr><td colspan="9">Enter admin token above.</td></tr>';
    return;
  }
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
    renderOrders(data.orders || []);
  } catch (e) {
    els.tbody.innerHTML = `<tr><td colspan="9">Error: ${e.message}</td></tr>`;
  }
}

async function fetchChats() {
  const token = getToken();
  if (!token) { els.chatBody.innerHTML = '<tr><td colspan="8">Enter admin token above.</td></tr>'; return; }
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/chat`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch chats');
    renderChats(data.messages || []);
  } catch (e) {
    els.chatBody.innerHTML = `<tr><td colspan="8">Error: ${e.message}</td></tr>`;
  }
}

function renderChats(list) {
  const q = (els.chatSearch.value || '').trim().toLowerCase();
  const filtered = list.filter(m => {
    const t = `${m.id} ${m.name} ${m.email} ${m.page} ${m.message} ${m.status}`.toLowerCase();
    return t.includes(q);
  });
  if (!filtered.length) { els.chatBody.innerHTML = '<tr><td colspan="8">No messages</td></tr>'; return; }
  els.chatBody.innerHTML = filtered.map(m => chatRow(m)).join('');
  filtered.forEach(m => {
    const sel = document.getElementById(`cstatus-${m.id}`);
    if (sel) sel.addEventListener('change', () => updateChatStatus(m.id, sel.value));
    const del = document.getElementById(`cdel-${m.id}`);
    if (del) del.addEventListener('click', () => deleteChat(m.id));
  });
}

function chatRow(m) {
  const created = new Date(m.createdAt).toLocaleString();
  const statuses = ['unread','read','replied'];
  const options = statuses.map(s => `<option value="${s}" ${s===m.status?'selected':''}>${s}</option>`).join('');
  return `<tr>
    <td><code>${m.id}</code></td>
    <td>${created}</td>
    <td>${escapeHtml(m.name || '')}</td>
    <td><a href="mailto:${escapeHtml(m.email || '')}">${escapeHtml(m.email || '')}</a></td>
    <td>${escapeHtml(m.page || '')}</td>
    <td>${escapeHtml(m.message || '')}</td>
    <td><select id="cstatus-${m.id}" class="status-select">${options}</select></td>
    <td><button class="btn btn-outline" id="cdel-${m.id}">Delete</button></td>
  </tr>`;
}

async function updateChatStatus(id, status) {
  const token = getToken();
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/chat/${id}`, {
      method: 'PATCH', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');
  } catch (e) {
    alert('Update failed: ' + e.message);
  }
}

async function deleteChat(id) {
  if (!confirm('Delete this message?')) return;
  const token = getToken();
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/chat/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');
    fetchChats();
  } catch (e) {
    alert('Delete failed: ' + e.message);
  }
}

function renderOrders(orders) {
  const q = (els.search.value || '').trim().toLowerCase();
  const filtered = orders.filter(o => {
    const t = `${o.id} ${o.name} ${o.email} ${o.phone} ${o.serviceTitle} ${o.status}`.toLowerCase();
    return t.includes(q);
  });
  if (!filtered.length) {
    els.tbody.innerHTML = '<tr><td colspan="9">No orders found.</td></tr>';
    return;
  }
  els.tbody.innerHTML = filtered.map(o => rowHtml(o)).join('');
  // Attach handlers
  filtered.forEach(o => {
    const sel = document.getElementById(`status-${o.id}`);
    if (sel) sel.addEventListener('change', () => updateStatus(o.id, sel.value));
    const delBtn = document.getElementById(`del-${o.id}`);
    if (delBtn) delBtn.addEventListener('click', () => deleteOrder(o.id));
  });
}

function rowHtml(o) {
  const created = new Date(o.createdAt).toLocaleString();
  const statuses = ['pending','confirmed','in_progress','delivered','paid','cancelled'];
  const options = statuses.map(s => `<option value="${s}" ${s===o.status?'selected':''}>${s}</option>`).join('');
  return `<tr>
    <td><code>${o.id}</code></td>
    <td>${created}</td>
    <td>${escapeHtml(o.name || '')}</td>
    <td><a href="mailto:${escapeHtml(o.email)}">${escapeHtml(o.email)}</a></td>
    <td>${escapeHtml(o.phone || '')}</td>
    <td>${escapeHtml(o.serviceTitle || '')}</td>
    <td>${escapeHtml(o.budget || '')}</td>
    <td>
      <select id="status-${o.id}" class="status-select">${options}</select>
    </td>
    <td>
      <button class="btn btn-outline" id="del-${o.id}">Delete</button>
    </td>
  </tr>`;
}

async function updateStatus(id, status) {
  const token = getToken();
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');
  } catch (e) {
    alert('Update failed: ' + e.message);
  }
}

async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  const token = getToken();
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/admin/orders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete');
    fetchOrders();
  } catch (e) {
    alert('Delete failed: ' + e.message);
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

// Events
els.authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  setToken(els.tokenInput.value.trim());
  fetchOrders();
});

els.refreshBtn.addEventListener('click', fetchOrders);
els.search.addEventListener('input', fetchOrders);
els.chatRefresh.addEventListener('click', fetchChats);
els.chatSearch.addEventListener('input', fetchChats);

// Prefill token if stored
els.tokenInput.value = getToken();
fetchOrders();
fetchChats();
