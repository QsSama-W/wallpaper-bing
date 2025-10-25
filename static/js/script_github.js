// 日期处理函数
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function formatDateToChinese(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

// 获取今天的日期
const today = new Date();
const todayFormatted = formatDate(today);
document.getElementById('current-date').textContent = formatDateToChinese(today);

// 计算360天前的日期
const oneYearAgo = new Date(today);
oneYearAgo.setFullYear(today.getFullYear() - 1);

// 壁纸数据
let wallpapers = [];
let wallpaperUrls = {}; // 存储从配置文件获取的URL映射
let currentPage = 0;
const wallpapersPerPage = 30;
let currentViewerIndex = 0;

// 从配置文件加载壁纸URL
async function loadWallpaperUrls() {
  try {
    // 动态获取当前页面的基础路径（兼容本地和 GitHub Pages）
    const basePath = window.location.pathname.includes('github.io') 
      ? window.location.pathname.split('/').slice(0, 2).join('/') + '/' 
      : '';
    const response = await fetch(`${basePath}img/wallpaper_urls.json`);
    wallpaperUrls = await response.json();
    return true;
  } catch (error) {
    console.error('加载壁纸URL失败:', error);
    return false;
  }
}

// 生成壁纸数据（基于配置文件中的URL）
function generateWallpapers(startPage = 0) {
  const result = [];
  for (let i = 0; i < wallpapersPerPage; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (startPage * wallpapersPerPage + i + 1));
    
    // 如果日期早于360天前，则停止生成
    if (date < oneYearAgo) {
      return result;
    }
    
    const dateStr = formatDate(date);
    // 只添加有URL的壁纸
    if (wallpaperUrls[dateStr]) {
      result.push({
        date: dateStr,
        dateChinese: formatDateToChinese(date),
        url: wallpaperUrls[dateStr]
      });
    }
  }
  return result;
}

// 检查是否还有更多壁纸可加载
function hasMoreWallpapers() {
  const lastDate = new Date(today);
  lastDate.setDate(today.getDate() - ((currentPage + 1) * wallpapersPerPage + 1));
  return lastDate >= oneYearAgo;
}

// 初始化壁纸数据
async function initializeWallpapers() {
  const loaded = await loadWallpaperUrls();
  if (loaded) {
    wallpapers = generateWallpapers();
    // 更新今日壁纸
    document.getElementById('current-wallpaper').src = wallpaperUrls[todayFormatted] || 'static/images/default-wallpaper.jpg';
    updateLoadMoreButton();
    
    // 添加下载按钮事件
    document.getElementById('download-btn').addEventListener('click', () => {
      downloadImage(wallpaperUrls[todayFormatted], `${todayFormatted}.jpg`, false);
    });
    
    document.getElementById('download-4k-btn').addEventListener('click', () => {
      downloadImage(wallpaperUrls[todayFormatted], `${todayFormatted}.jpg`, true);
    });
  }
}

// 更新查看更多按钮状态
function updateLoadMoreButton() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!hasMoreWallpapers()) {
    loadMoreBtn.innerHTML = '<i class="fa fa-calendar-check-o mr-2"></i> 已显示全部历史壁纸';
    loadMoreBtn.disabled = true;
    loadMoreBtn.classList.add('bg-gray-600');
    loadMoreBtn.classList.remove('bg-gray-700', 'hover:bg-gray-600', 'bg-gradient-to-r', 'from-gray-700', 'to-gray-800', 'hover:from-gray-600', 'hover:to-gray-700');
  } else {
    loadMoreBtn.innerHTML = '<i class="fa fa-refresh mr-2"></i> 查看更多壁纸';
    loadMoreBtn.disabled = false;
    loadMoreBtn.classList.remove('bg-gray-600');
    loadMoreBtn.classList.add('bg-gradient-to-r', 'from-gray-700', 'to-gray-800', 'hover:from-gray-600', 'hover:to-gray-700');
  }
}

// 加载更多壁纸 - 优化版
function loadMoreWallpapers() {
  currentPage++;
  const loadMoreBtn = document.getElementById('load-more-btn');
  
  // 禁用按钮并显示加载状态
  loadMoreBtn.disabled = true;
  loadMoreBtn.innerHTML = '<i class="fa fa-spinner fa-spin mr-2"></i> 加载中...';
  loadMoreBtn.classList.add('bg-gray-600');
  loadMoreBtn.classList.remove('bg-gradient-to-r', 'from-gray-700', 'to-gray-800', 'hover:from-gray-600', 'hover:to-gray-700');
  
  // 先创建占位框
  createLoadingPlaceholders();
  
  // 模拟加载延迟，然后逐个加载真实壁纸
  setTimeout(() => {
    const moreWallpapers = generateWallpapers(currentPage);
    if (moreWallpapers.length > 0) {
      wallpapers = [...wallpapers, ...moreWallpapers];
      loadHistoryWallpapersProgressive(moreWallpapers); // 渐进式加载
    }
    updateLoadMoreButton();
  }, 500);
}

// 创建加载占位框
function createLoadingPlaceholders() {
  const gallery = document.getElementById('history-gallery');
  
  // 创建最多30个占位框（但不超过实际可能的数量）
  const maxPlaceholders = Math.min(wallpapersPerPage, getRemainingWallpapersCount());
  
  for (let i = 0; i < maxPlaceholders; i++) {
    const placeholder = document.createElement('div');
    placeholder.className = 'bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg opacity-0 card-hover';
    placeholder.style.animation = `slideIn 0.6s ease-out forwards ${i * 0.05}s`;
    placeholder.innerHTML = `
      <div class="aspect-[4/3] overflow-hidden relative">
        <div class="w-full h-full loading-skeleton rounded"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <i class="fa fa-spinner fa-spin text-gray-400 text-2xl"></i>
        </div>
      </div>
      <div class="p-4">
        <div class="w-3/4 h-4 loading-skeleton rounded mb-2"></div>
        <div class="w-1/2 h-3 loading-skeleton rounded"></div>
      </div>
    `;
    gallery.appendChild(placeholder);
  }
}

// 渐进式加载历史壁纸
function loadHistoryWallpapersProgressive(newWallpapers) {
  const gallery = document.getElementById('history-gallery');
  const placeholders = Array.from(gallery.children).slice(-newWallpapers.length);
  
  newWallpapers.forEach((wallpaper, index) => {
    // 延迟加载每个壁纸，创建逐个出现的效果
    setTimeout(() => {
      if (placeholders[index]) {
        const wallpaperCard = createWallpaperCard(wallpaper, index);
        // 替换占位框
        gallery.replaceChild(wallpaperCard, placeholders[index]);
      }
    }, index * 150); // 每个壁纸间隔150ms加载
  });
  
  // 为所有历史壁纸下载按钮添加事件监听
  setTimeout(() => {
    setupHistoryDownloadButtons();
  }, newWallpapers.length * 150);
}

// 创建壁纸卡片
function createWallpaperCard(wallpaper, index) {
  const wallpaperCard = document.createElement('div');
  wallpaperCard.className = 'bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 opacity-0 card-hover';
  wallpaperCard.style.animation = `slideIn 0.6s ease-out forwards`;
  wallpaperCard.innerHTML = `
    <div class="aspect-[4/3] overflow-hidden relative group">
      <img src="${wallpaper.url}" alt="${wallpaper.dateChinese}壁纸" 
           class="w-full h-full object-cover transition-transform duration-7000 ease-in-out hover:scale-110 image-loading"
           onload="this.classList.remove('image-loading')">
      <!-- 历史壁纸下载按钮组 -->
      <div class="absolute bottom-4 right-4 flex gap-3">
        <button class="download-hd bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm flex items-center btn-pop" 
                data-date="${wallpaper.date}">
          <i class="fa fa-download mr-1.5"></i> HD
        </button>
        <button class="download-4k bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm flex items-center btn-pop" 
                data-date="${wallpaper.date}">
          <i class="fa fa-download mr-1.5"></i> 4K
        </button>
      </div>
    </div>
    <div class="p-4">
      <h3 class="font-medium text-gray-100">${wallpaper.dateChinese}</h3>
      <p class="text-sm text-gray-400 mt-1">点击图片预览</p>
    </div>
  `;
  
  wallpaperCard.addEventListener('click', (e) => {
    // 只有点击图片区域才打开查看器
    if (!e.target.closest('button')) {
      openWallpaperViewer(wallpapers.findIndex(w => w.date === wallpaper.date));
    }
  });
  
  return wallpaperCard;
}

// 获取剩余可加载的壁纸数量
function getRemainingWallpapersCount() {
  const lastPossibleDate = new Date(today);
  lastPossibleDate.setDate(today.getDate() - ((currentPage + 1) * wallpapersPerPage + 1));
  
  if (lastPossibleDate < oneYearAgo) {
    const daysDifference = Math.ceil((today - oneYearAgo) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysDifference - currentPage * wallpapersPerPage);
  }
  
  return wallpapersPerPage;
}

// 初始化历史壁纸加载
function loadHistoryWallpapers(append = false) {
  const gallery = document.getElementById('history-gallery');
  
  // 如果不是加载更多，清空画廊
  if (!append) {
    gallery.innerHTML = '';
  }
  
  // 过滤掉今天的壁纸
  const historyWallpapers = wallpapers.filter(wallpaper => wallpaper.date !== todayFormatted);
  
  // 渐进式加载
  historyWallpapers.forEach((wallpaper, index) => {
    setTimeout(() => {
      const wallpaperCard = createWallpaperCard(wallpaper, index);
      gallery.appendChild(wallpaperCard);
    }, index * 100); // 初始加载时每个卡片间隔100ms
  });
  
  // 为所有历史壁纸下载按钮添加事件监听
  setTimeout(() => {
    setupHistoryDownloadButtons();
  }, historyWallpapers.length * 100);
}

// 设置历史壁纸下载按钮事件
function setupHistoryDownloadButtons() {
  // HD下载按钮
  document.querySelectorAll('.download-hd').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const date = button.getAttribute('data-date');
      const wallpaper = wallpapers.find(w => w.date === date);
      if (wallpaper) {
        downloadImage(wallpaper.url, `${date}.jpg`, false);
      }
    });
  });
  
  // 4K下载按钮
  document.querySelectorAll('.download-4k').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const date = button.getAttribute('data-date');
      const wallpaper = wallpapers.find(w => w.date === date);
      if (wallpaper) {
        downloadImage(wallpaper.url, `${date}.jpg`, true);
      }
    });
  });
}

// 通用下载函数 - 支持4K和普通下载
async function downloadImage(url, filename, is4K = false) {
  try {
    // 如果是4K下载，替换URL中的分辨率
    let downloadUrl = url;
    if (is4K) {
      downloadUrl = url.replace('1920x1080', 'UHD');
      // 如果是4K，在文件名中添加4K标识
      filename = filename.replace('.jpg', '_4K.jpg');
    }
    
    // 显示下载中状态
    showDownloadNotification(is4K ? '4K壁纸下载中...' : 'HD壁纸下载中...');
    
    // 使用Fetch API获取图片
    const response = await fetch(downloadUrl, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }
    
    // 将响应转换为Blob对象
    const blob = await response.blob();
    // 创建指向Blob的URL
    const blobUrl = URL.createObjectURL(blob);
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.rel = 'noopener noreferrer';
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl); // 释放Blob URL
      showDownloadNotification(is4K ? '4K壁纸下载完成!' : 'HD壁纸下载完成!', true);
    }, 100);
    
  } catch (error) {
    console.error('下载失败:', error);
    showDownloadNotification(is4K ? '4K壁纸下载失败，请重试' : 'HD壁纸下载失败，请重试', false);
    
    // 失败时的备选方案
    let downloadUrl = url;
    if (is4K) {
      downloadUrl = url.replace('1920x1080', 'UHD');
      filename = filename.replace('.jpg', '_4k.jpg');
    }
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 100);
  }
}

// 显示下载通知
function showDownloadNotification(message, isSuccess = false) {
  // 检查是否已存在通知元素
  let notification = document.getElementById('download-notification');
  
  if (!notification) {
    // 创建通知元素
    notification = document.createElement('div');
    notification.id = 'download-notification';
    notification.className = 'fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl z-50 transform transition-all duration-300 translate-y-20 opacity-0';
    document.body.appendChild(notification);
  }
  
  // 设置通知样式和内容
  notification.textContent = message;
  notification.className = 'fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl z-50 transform transition-all duration-300';
  
  if (isSuccess) {
    notification.classList.add('bg-green-600', 'text-white');
  } else if (isSuccess === false) {
    notification.classList.add('bg-red-600', 'text-white');
  } else {
    notification.classList.add('bg-blue-600', 'text-white');
  }
  
  // 显示通知
  setTimeout(() => {
    notification.classList.add('translate-y-0', 'opacity-100');
  }, 10);
  
  // 3秒后隐藏通知
  setTimeout(() => {
    notification.classList.remove('translate-y-0', 'opacity-100');
    notification.classList.add('translate-y-20', 'opacity-0');
    
    // 完全隐藏后移除元素
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// 壁纸查看器功能
function openWallpaperViewer(index) {
  const viewer = document.getElementById('wallpaper-viewer');
  const img = document.getElementById('fullsize-wallpaper');
  const dateEl = document.getElementById('wallpaper-date');
  
  currentViewerIndex = index;
  const wallpaper = wallpapers[index];
  
  img.src = wallpaper.url;
  dateEl.textContent = wallpaper.dateChinese;
  
  // 显示模态框并添加动画
  viewer.classList.remove('hidden');
  viewer.classList.add('fade-in');
  
  // 图片加载完成后添加缩放动画
  img.onload = () => {
    img.classList.add('scale-in');
  };
  
  // 阻止背景滚动
  document.body.style.overflow = 'hidden';
}

function closeWallpaperViewer() {
  const viewer = document.getElementById('wallpaper-viewer');
  const img = document.getElementById('fullsize-wallpaper');
  
  // 淡出动画
  viewer.classList.add('opacity-0');
  setTimeout(() => {
    viewer.classList.add('hidden');
    viewer.classList.remove('opacity-0', 'fade-in');
    img.classList.remove('scale-in');
    document.body.style.overflow = '';
  }, 300);
}

function prevWallpaper() {
  if (currentViewerIndex > 0) {
    const img = document.getElementById('fullsize-wallpaper');
    img.classList.remove('scale-in');
    setTimeout(() => {
      openWallpaperViewer(currentViewerIndex - 1);
    }, 200);
  }
}

function nextWallpaper() {
  if (currentViewerIndex < wallpapers.length - 1) {
    const img = document.getElementById('fullsize-wallpaper');
    img.classList.remove('scale-in');
    setTimeout(() => {
      openWallpaperViewer(currentViewerIndex + 1);
    }, 200);
  }
}

// 绑定查看器事件
document.getElementById('close-viewer').addEventListener('click', closeWallpaperViewer);
document.getElementById('prev-wallpaper').addEventListener('click', prevWallpaper);
document.getElementById('next-wallpaper').addEventListener('click', nextWallpaper);

// 点击查看器背景关闭
document.getElementById('wallpaper-viewer').addEventListener('click', (e) => {
  if (e.target === document.getElementById('wallpaper-viewer')) {
    closeWallpaperViewer();
  }
});

// 键盘导航
document.addEventListener('keydown', (e) => {
  const viewer = document.getElementById('wallpaper-viewer');
  if (!viewer.classList.contains('hidden')) {
    if (e.key === 'Escape') {
      closeWallpaperViewer();
    } else if (e.key === 'ArrowLeft') {
      prevWallpaper();
    } else if (e.key === 'ArrowRight') {
      nextWallpaper();
    }
  }
});

// 初始化加载更多按钮事件
document.getElementById('load-more-btn').addEventListener('click', loadMoreWallpapers);

// 页面加载完成后初始化
window.addEventListener('load', initializeWallpapers);
