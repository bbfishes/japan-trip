const navBtns = document.querySelectorAll('.nav-btn');
const tabs = document.querySelectorAll('.tab');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    navBtns.forEach(b => b.classList.remove('active'));
    tabs.forEach(t => t.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(tabId).classList.remove('hidden');
  });
});

const dayBtns = document.querySelectorAll('.day-btn');
const dayContents = document.querySelectorAll('.day-content');

dayBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const day = btn.dataset.day;
    dayBtns.forEach(b => b.classList.remove('active'));
    dayContents.forEach(d => d.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById('day-' + day).classList.remove('hidden');
  });
});

const packingItems = document.querySelectorAll('.packing-item input');
const progressFill = document.getElementById('packing-progress');
const progressText = document.getElementById('packing-text');

function loadPackingState() {
  const saved = localStorage.getItem('packing-state');
  if (saved) {
    const state = JSON.parse(saved);
    packingItems.forEach(item => {
      if (state[item.dataset.item]) item.checked = true;
    });
  }
  updatePackingProgress();
}

function savePackingState() {
  const state = {};
  packingItems.forEach(item => {
    state[item.dataset.item] = item.checked;
  });
  localStorage.setItem('packing-state', JSON.stringify(state));
}

function updatePackingProgress() {
  const total = packingItems.length;
  const checked = Array.from(packingItems).filter(i => i.checked).length;
  const percent = total > 0 ? (checked / total) * 100 : 0;
  progressFill.style.width = percent + '%';
  progressText.textContent = checked + ' / ' + total;
}

packingItems.forEach(item => {
  item.addEventListener('change', () => {
    savePackingState();
    updatePackingProgress();
  });
});

document.getElementById('reset-packing').addEventListener('click', () => {
  if (confirm('確定要重設打包清單嗎？')) {
    packingItems.forEach(item => item.checked = false);
    savePackingState();
    updatePackingProgress();
  }
});

const editableFields = document.querySelectorAll('.editable');

function loadEmergencyInfo() {
  const saved = localStorage.getItem('emergency-info');
  if (saved) {
    const info = JSON.parse(saved);
    editableFields.forEach(field => {
      if (info[field.dataset.field]) field.textContent = info[field.dataset.field];
    });
  }
}

function saveEmergencyInfo() {
  const info = {};
  editableFields.forEach(field => {
    const value = field.textContent.trim();
    if (value && value !== '點擊輸入') info[field.dataset.field] = value;
  });
  localStorage.setItem('emergency-info', JSON.stringify(info));
}

editableFields.forEach(field => {
  field.addEventListener('blur', saveEmergencyInfo);
  field.addEventListener('focus', () => {
    if (field.textContent === '點擊輸入') field.textContent = '';
  });
});

let expenses = [];
let fundTotal = 0;

function loadFund() {
  const saved = localStorage.getItem('fund-total');
  if (saved) {
    fundTotal = parseInt(saved) || 0;
  }
  updateFundDisplay();
}

function saveFund() {
  localStorage.setItem('fund-total', fundTotal.toString());
}

function updateFundDisplay() {
  const fundEl = document.getElementById('fund-balance');
  const totalSpent = expenses.filter(e => e.payer === '共同').reduce((sum, e) => sum + e.amount, 0);
  const remaining = fundTotal - totalSpent;
  fundEl.textContent = '¥' + remaining.toLocaleString();
  if (remaining < 0) {
    fundEl.style.color = '#e94560';
  } else {
    fundEl.style.color = '#48bb78';
  }
}

function loadExpenses() {
  const saved = localStorage.getItem('expenses');
  if (saved) {
    expenses = JSON.parse(saved);
    renderExpenses();
  }
}

function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

function renderExpenses() {
  const list = document.getElementById('expense-list');
  const totalEl = document.getElementById('total-expense');
  const perPersonEl = document.getElementById('per-person');
  list.innerHTML = '';
  let total = 0;
  expenses.forEach((exp, index) => {
    total += exp.amount;
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = '<div class="expense-info"><h4>' + exp.name + '</h4><span>' + exp.payer + '</span></div><div style="display:flex;align-items:center;"><span class="expense-amount">¥' + exp.amount.toLocaleString() + '</span><button class="expense-delete" data-index="' + index + '">×</button></div>';
    list.appendChild(item);
  });
  totalEl.textContent = '¥' + total.toLocaleString();
  perPersonEl.textContent = '¥' + Math.round(total / 6).toLocaleString();
  updateFundDisplay();
  document.querySelectorAll('.expense-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      expenses.splice(parseInt(btn.dataset.index), 1);
      saveExpenses();
      renderExpenses();
    });
  });
}

document.getElementById('add-expense-btn').addEventListener('click', () => {
  const nameInput = document.getElementById('expense-name');
  const amountInput = document.getElementById('expense-amount');
  const payerInput = document.getElementById('expense-payer');
  const name = nameInput.value.trim();
  const amount = parseInt(amountInput.value) || 0;
  const payer = payerInput.value;
  if (!name || !amount) { alert('請輸入項目名稱和金額'); return; }
  expenses.push({ name, amount, payer });
  saveExpenses();
  renderExpenses();
  nameInput.value = '';
  amountInput.value = '';
});
document.getElementById('reset-expenses').addEventListener('click', () => {
  if (confirm('確定要清除所有花費紀錄嗎？')) {
    expenses = [];
    saveExpenses();
    renderExpenses();
  }
});

document.getElementById('set-fund-btn').addEventListener('click', () => {
  const input = document.getElementById('fund-amount');
  const perPerson = parseInt(input.value) || 0;
  if (!perPerson) { alert('請輸入每人出資金額'); return; }
  fundTotal = perPerson * 6;
  saveFund();
  updateFundDisplay();
  input.value = '';
  alert('公積金設定完成：¥' + fundTotal.toLocaleString() + '（每人 ¥' + perPerson.toLocaleString() + '）');
});

loadPackingState();
loadEmergencyInfo();
loadFund();
loadExpenses();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW failed'));
  });
}
