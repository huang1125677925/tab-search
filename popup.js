// 存储所有标签页数据
let allTabs = [];
let currentWindowId = null;

// DOM 元素
const searchInput = document.getElementById('searchInput');
const tabsContainer = document.getElementById('tabsContainer');
const windowManagementToggle = document.getElementById('windowManagementToggle');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadTabs();
  await loadWindowManagementStatus();
  setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('keydown', handleKeyDown);
  windowManagementToggle.addEventListener('click', toggleWindowManagement);
}

// 加载窗口管理状态
async function loadWindowManagementStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getWindowManagementStatus' });
    updateToggleUI(response.enabled);
  } catch (error) {
    console.error('加载窗口管理状态失败:', error);
  }
}

// 切换窗口管理功能
async function toggleWindowManagement() {
  const isCurrentlyActive = windowManagementToggle.classList.contains('active');
  const newState = !isCurrentlyActive;
  
  try {
    await chrome.runtime.sendMessage({ 
      action: 'setWindowManagement', 
      enabled: newState 
    });
    updateToggleUI(newState);
  } catch (error) {
    console.error('切换窗口管理状态失败:', error);
  }
}

// 更新切换按钮UI
function updateToggleUI(enabled) {
  if (enabled) {
    windowManagementToggle.classList.add('active');
  } else {
    windowManagementToggle.classList.remove('active');
  }
}

// 加载当前窗口的所有标签页
async function loadTabs() {
  try {
    // 获取当前窗口
    const currentWindow = await chrome.windows.getCurrent();
    currentWindowId = currentWindow.id;
    
    // 获取当前窗口的所有标签页
    const tabs = await chrome.tabs.query({ windowId: currentWindowId });
    allTabs = tabs;
    
    renderTabs(allTabs);
  } catch (error) {
    console.error('加载标签页失败:', error);
    showError('加载标签页失败');
  }
}

// 渲染标签页列表
function renderTabs(tabs) {
  if (tabs.length === 0) {
    tabsContainer.innerHTML = '<div class="no-results">没有找到匹配的标签页</div>';
    return;
  }
  
  const tabsHTML = tabs.map(tab => {
    const favicon = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
    const title = tab.title || '无标题';
    const url = tab.url || '';
    const isActive = tab.active ? 'active' : '';
    
    return `
      <div class="tab-item ${isActive}" data-tab-id="${tab.id}">
        <img class="tab-favicon" src="${favicon}" alt="" onerror="this.style.display='none'">
        <div class="tab-info">
          <div class="tab-title">${escapeHtml(title)}</div>
          <div class="tab-url">${escapeHtml(url)}</div>
        </div>
      </div>
    `;
  }).join('');
  
  tabsContainer.innerHTML = tabsHTML;
  
  // 添加点击事件监听器
  tabsContainer.addEventListener('click', handleTabClick);
}

// 处理标签页点击
async function handleTabClick(event) {
  const tabItem = event.target.closest('.tab-item');
  if (!tabItem) return;
  
  const tabId = parseInt(tabItem.dataset.tabId);
  
  try {
    // 切换到指定标签页
    await chrome.tabs.update(tabId, { active: true });
    
    // 关闭弹出窗口
    window.close();
  } catch (error) {
    console.error('切换标签页失败:', error);
    showError('切换标签页失败');
  }
}

// 处理搜索
function handleSearch(event) {
  const query = event.target.value.toLowerCase().trim();
  
  if (!query) {
    renderTabs(allTabs);
    return;
  }
  
  const filteredTabs = allTabs.filter(tab => {
    const title = (tab.title || '').toLowerCase();
    const url = (tab.url || '').toLowerCase();
    return title.includes(query) || url.includes(query);
  });
  
  renderTabs(filteredTabs);
}

// 处理键盘事件
function handleKeyDown(event) {
  if (event.key === 'Enter') {
    // 如果按下回车，选择第一个可见的标签页
    const firstTab = tabsContainer.querySelector('.tab-item');
    if (firstTab) {
      firstTab.click();
    }
  } else if (event.key === 'Escape') {
    // 按下 ESC 关闭弹出窗口
    window.close();
  }
}

// HTML 转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 显示错误信息
function showError(message) {
  tabsContainer.innerHTML = `<div class="no-results">错误: ${escapeHtml(message)}</div>`;
}

// 聚焦搜索框
searchInput.focus();