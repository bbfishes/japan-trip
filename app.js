const navBtns = document.querySelectorAll('.nav-btn');
const tabs = document.querySelectorAll('.tab');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    navBtns.forEach(b => b.classList.remove('active'));
    tabs.forEach(t => t.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(tabId).classList.remove('hidden');
    // 切換分頁時自動捲回頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    const targetDay = document.getElementById('day-' + day);
    targetDay.classList.remove('hidden');
    
    // 修正：直接滑動到該天旅程的內容起始位置，而非只到選擇器
    // 使用 scrollIntoView 並考量到上方 sticky 導航列的空間
    const yOffset = -80; // 預留上方導航列的空間
    const y = targetDay.getBoundingClientRect().top + window.pageYOffset + yOffset;
    
    window.scrollTo({ top: y, behavior: 'smooth' });
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

loadPackingState();
loadEmergencyInfo();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW failed'));
  });
}
