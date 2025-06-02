// 窗口管理功能
let windowManagementEnabled = false;

// 初始化时从存储中读取设置
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(['windowManagementEnabled']);
  windowManagementEnabled = result.windowManagementEnabled || false;
});

// 插件安装时初始化设置
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(['windowManagementEnabled']);
  windowManagementEnabled = result.windowManagementEnabled || false;
});

// 监听窗口创建事件
chrome.windows.onCreated.addListener(async (window) => {
  if (!windowManagementEnabled) return;
  
  // 如果是弹出窗口或应用窗口，不处理
  if (window.type !== 'normal') return;
  
  try {
    // 获取所有现有窗口
    const existingWindows = await chrome.windows.getAll({ windowTypes: ['normal'] });
    
    // 如果只有一个窗口（就是刚创建的），不需要处理
    if (existingWindows.length <= 1) return;
    
    // 找到第一个已存在的窗口
    const targetWindow = existingWindows.find(w => w.id !== window.id);
    if (!targetWindow) return;
    
    // 获取新窗口的所有标签页
    const newWindowTabs = await chrome.tabs.query({ windowId: window.id });
    
    // 将新窗口的标签页移动到已存在的窗口
    for (const tab of newWindowTabs) {
      await chrome.tabs.move(tab.id, {
        windowId: targetWindow.id,
        index: -1
      });
    }
    
    // 关闭空的新窗口
    await chrome.windows.remove(window.id);
    
    // 聚焦到目标窗口
    await chrome.windows.update(targetWindow.id, { focused: true });
    
  } catch (error) {
    console.error('窗口管理失败:', error);
  }
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'getWindowManagementStatus') {
    sendResponse({ enabled: windowManagementEnabled });
  } else if (request.action === 'setWindowManagement') {
    windowManagementEnabled = request.enabled;
    await chrome.storage.local.set({ windowManagementEnabled });
    sendResponse({ success: true });
  }
});