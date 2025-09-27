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

// 修改 loadWallpaperUrls 函数
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
  }
}

// 更新查看更多按钮状态
function updateLoadMoreButton() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (!hasMoreWallpapers()) {
    loadMoreBtn.innerHTML = '<i class="fa fa-calendar-check-o mr-2"></i> 已显示全部历史壁纸';
    loadMoreBtn.disabled = true;
    loadMoreBtn.classList.add('bg-gray-600');
    loadMoreBtn.classList.remove('bg-gray-700', 'hover:bg-gray-600');
  } else {
    loadMoreBtn.innerHTML = '<i class="fa fa-refresh mr-2"></i> 查看更多壁纸';
    loadMoreBtn.disabled = false;
    loadMoreBtn.classList.remove('bg-gray-600');
    loadMoreBtn.classList.add('bg-gray-700', 'hover:bg-gray-600');
  }
}

// 导航切换
document.getElementById('home-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('home-view').classList.remove('hidden');
  document.getElementById('history-view').classList.add('hidden');
  document.getElementById('about-view').classList.add('hidden');
  document.getElementById('home-link').classList.add('text-blue-400');
  document.getElementById('home-link').classList.remove('text-gray-300');
  document.getElementById('history-link').classList.remove('text-blue-400');
  document.getElementById('history-link').classList.add('text-gray-300');
  document.getElementById('about-link').classList.remove('text-blue-400');
  document.getElementById('about-link').classList.add('text-gray-300');
});

document.getElementById('history-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('history-view').classList.remove('hidden');
  document.getElementById('about-view').classList.add('hidden');
  document.getElementById('home-link').classList.remove('text-blue-400');
  document.getElementById('home-link').classList.add('text-gray-300');
  document.getElementById('history-link').classList.add('text-blue-400');
  document.getElementById('history-link').classList.remove('text-gray-300');
  document.getElementById('about-link').classList.remove('text-blue-400');
  document.getElementById('about-link').classList.add('text-gray-300');
  
  // 如果历史壁纸还没加载，则加载它们
  if (document.getElementById('history-gallery').children.length === 0) {
    loadHistoryWallpapers();
  }
});

document.getElementById('about-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('history-view').classList.add('hidden');
  document.getElementById('about-view').classList.remove('hidden');
  document.getElementById('home-link').classList.remove('text-blue-400');
  document.getElementById('home-link').classList.add('text-gray-300');
  document.getElementById('history-link').classList.remove('text-blue-400');
  document.getElementById('history-link').classList.add('text-gray-300');
  document.getElementById('about-link').classList.add('text-blue-400');
  document.getElementById('about-link').classList.remove('text-gray-300');
});

// 加载历史壁纸
function loadHistoryWallpapers() {
  const gallery = document.getElementById('history-gallery');
  
  // 过滤掉今天的壁纸
  const historyWallpapers = wallpapers.filter(wallpaper => wallpaper.date !== todayFormatted);
  
  historyWallpapers.forEach((wallpaper, index) => {
    const wallpaperCard = document.createElement('div');
    wallpaperCard.className = 'bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 opacity-0 relative';
    wallpaperCard.style.animation = `slideIn 0.5s ease-out forwards ${index * 0.05}s`;
    wallpaperCard.innerHTML = `
      <div class="aspect-[4/3] overflow-hidden relative group">
        <img src="${wallpaper.url}" alt="${wallpaper.dateChinese}壁纸" 
             class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
        <!-- 历史壁纸下载按钮组 - 增加间距和标签 -->
        <div class="absolute bottom-4 right-4 flex gap-3">
          <button class="download-hd bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm flex items-center" 
                  data-date="${wallpaper.date}">
            <i class="fa fa-download mr-1.5"></i> HD
          </button>
          <button class="download-4k bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm flex items-center" 
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
    
    gallery.appendChild(wallpaperCard);
  });
  
  // 为所有历史壁纸下载按钮添加事件监听
  setupHistoryDownloadButtons();
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
    notification.className = 'fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-20 opacity-0';
    document.body.appendChild(notification);
  }
  
  // 设置通知内容和样式
  notification.textContent = message;
  notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform ${
    isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`;
  
  // 显示通知
  setTimeout(() => {
    notification.classList.add('translate-y-0', 'opacity-100');
  }, 10);
  
  // 3秒后隐藏通知
  setTimeout(() => {
    notification.classList.remove('translate-y-0', 'opacity-100');
    notification.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

// 设置历史壁纸下载按钮
function setupHistoryDownloadButtons() {
  // 高清下载按钮
  document.querySelectorAll('#history-gallery button.download-hd').forEach(button => {
    button.removeEventListener('click', handleHistoryHDDownload);
    button.addEventListener('click', handleHistoryHDDownload);
  });
  
  // 4K下载按钮
  document.querySelectorAll('#history-gallery button.download-4k').forEach(button => {
    button.removeEventListener('click', handleHistory4KDownload);
    button.addEventListener('click', handleHistory4KDownload);
  });
}

// 历史壁纸高清下载处理函数
function handleHistoryHDDownload(e) {
  e.stopPropagation(); // 防止触发图片点击事件
  e.preventDefault(); // 阻止按钮默认行为
  
  const date = this.getAttribute('data-date');
  const wallpaper = wallpapers.find(w => w.date === date);
  
  if (wallpaper) {
    const filename = `wallpaper_${date}.jpg`;
    downloadImage(wallpaper.url, filename, false);
  }
}

// 历史壁纸4K下载处理函数
function handleHistory4KDownload(e) {
  e.stopPropagation(); // 防止触发图片点击事件
  e.preventDefault(); // 阻止按钮默认行为
  
  const date = this.getAttribute('data-date');
  const wallpaper = wallpapers.find(w => w.date === date);
  
  if (wallpaper) {
    const filename = `wallpaper_${date}.jpg`;
    downloadImage(wallpaper.url, filename, true);
  }
}

// 加载更多历史壁纸
function loadMoreWallpapers() {
  const button = document.getElementById('load-more-btn');
  button.innerHTML = '<i class="fa fa-circle-o-notch fa-spin mr-2"></i> 加载中...';
  button.disabled = true;
  
  setTimeout(() => {
    currentPage++;
    const newWallpapers = generateWallpapers(currentPage);
    wallpapers = [...wallpapers, ...newWallpapers];
    
    const gallery = document.getElementById('history-gallery');
    
    newWallpapers.forEach((wallpaper, index) => {
      const wallpaperCard = document.createElement('div');
      wallpaperCard.className = 'bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 opacity-0 relative';
      wallpaperCard.style.animation = `slideIn 0.5s ease-out forwards ${index * 0.05}s`;
      wallpaperCard.innerHTML = `
        <div class="aspect-[4/3] overflow-hidden relative group">
          <img src="${wallpaper.url}" alt="${wallpaper.dateChinese}壁纸" 
               class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
          <!-- 历史壁纸下载按钮组 - 增加间距和标签 -->
          <div class="absolute bottom-4 right-4 flex gap-3">
            <button class="download-hd bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm flex items-center" 
                    data-date="${wallpaper.date}">
              <i class="fa fa-download mr-1.5"></i> HD
            </button>
            <button class="download-4k bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm flex items-center" 
                    data-date="${wallpaper.date}">
              <i class="fa fa-download mr-1.5"></i> 4K
            </button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-medium text-gray-100">${wallpaper.dateChinese}</h3>
          <p class="text-sm text-gray-400 mt-1">点击图片预览</span></p>
        </div>
      `;
      
      wallpaperCard.addEventListener('click', (e) => {
        // 只有点击图片区域才打开查看器
        if (!e.target.closest('button')) {
          openWallpaperViewer(wallpapers.findIndex(w => w.date === wallpaper.date));
        }
      });
      
      gallery.appendChild(wallpaperCard);
    });
    
    // 为新加载的下载按钮添加事件监听
    setupHistoryDownloadButtons();
    
    // 更新按钮状态
    updateLoadMoreButton();
  }, 800);
}

// 壁纸查看器功能
let currentViewingIndex = 0;

// 打开壁纸查看器
document.getElementById('current-wallpaper').addEventListener('click', () => {
  // 查找今天壁纸在数组中的索引
  const todayIndex = wallpapers.findIndex(w => w.date === todayFormatted);
  if (todayIndex !== -1) {
    openWallpaperViewer(todayIndex);
  }
});

function openWallpaperViewer(index) {
  currentViewingIndex = index;
  const viewer = document.getElementById('wallpaper-viewer');
  const fullsizeImg = document.getElementById('fullsize-wallpaper');
  const dateDisplay = document.getElementById('wallpaper-date');
  
  fullsizeImg.src = wallpapers[index].url;
  fullsizeImg.alt = `${wallpapers[index].dateChinese}壁纸`;
  dateDisplay.textContent = wallpapers[index].dateChinese;
  
  viewer.classList.remove('hidden');
  viewer.classList.add('fade-in');
  
  // 防止背景滚动
  document.body.style.overflow = 'hidden';
  
  // 图片加载动画
  fullsizeImg.classList.add('scale-in');
  setTimeout(() => {
    fullsizeImg.classList.remove('scale-in');
  }, 300);
}

// 关闭壁纸查看器
document.getElementById('close-viewer').addEventListener('click', () => {
  const viewer = document.getElementById('wallpaper-viewer');
  viewer.classList.add('fade-out');
  
  setTimeout(() => {
    viewer.classList.add('hidden');
    viewer.classList.remove('fade-out');
    // 恢复背景滚动
    document.body.style.overflow = '';
  }, 300);
});

// 上一张壁纸
document.getElementById('prev-wallpaper').addEventListener('click', () => {
  currentViewingIndex = (currentViewingIndex - 1 + wallpapers.length) % wallpapers.length;
  updateViewerImage();
});

// 下一张壁纸
document.getElementById('next-wallpaper').addEventListener('click', () => {
  currentViewingIndex = (currentViewingIndex + 1) % wallpapers.length;
  updateViewerImage();
});

// 更新查看器中的图片
function updateViewerImage() {
  const fullsizeImg = document.getElementById('fullsize-wallpaper');
  const dateDisplay = document.getElementById('wallpaper-date');
  
  // 添加过渡效果
  fullsizeImg.style.opacity = '0';
  
  setTimeout(() => {
    fullsizeImg.src = wallpapers[currentViewingIndex].url;
    fullsizeImg.alt = `${wallpapers[currentViewingIndex].dateChinese}壁纸`;
    dateDisplay.textContent = wallpapers[currentViewingIndex].dateChinese;
    fullsizeImg.style.opacity = '1';
  }, 200);
}

// 键盘导航
document.addEventListener('keydown', (e) => {
  const viewer = document.getElementById('wallpaper-viewer');
  if (viewer.classList.contains('hidden')) return;
  
  if (e.key === 'Escape') {
    document.getElementById('close-viewer').click();
  } else if (e.key === 'ArrowLeft') {
    document.getElementById('prev-wallpaper').click();
  } else if (e.key === 'ArrowRight') {
    document.getElementById('next-wallpaper').click();
  }
});

// 点击背景关闭查看器
document.getElementById('wallpaper-viewer').addEventListener('click', (e) => {
  if (e.target === document.getElementById('wallpaper-viewer')) {
    document.getElementById('close-viewer').click();
  }
});

// 页面加载动画
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
  initializeWallpapers();
});

// 确保当前壁纸图片加载完成后才添加点击事件
document.getElementById('current-wallpaper').addEventListener('load', function() {
  this.style.cursor = 'pointer';
});

if (document.getElementById('current-wallpaper').complete) {
  document.getElementById('current-wallpaper').style.cursor = 'pointer';
}

// 今日壁纸下载功能区 - 优化按钮样式
document.getElementById('download-btn').addEventListener('click', function(e) {
  e.preventDefault(); // 阻止按钮默认行为
  
  if (wallpaperUrls[todayFormatted]) {
    const filename = `wallpaper_${todayFormatted}.jpg`;
    downloadImage(wallpaperUrls[todayFormatted], filename, false);
  }
});

// 4K下载按钮事件监听
document.getElementById('download-4k-btn').addEventListener('click', function(e) {
  e.preventDefault(); // 阻止按钮默认行为
  
  if (wallpaperUrls[todayFormatted]) {
    const filename = `wallpaper_${todayFormatted}.jpg`;
    downloadImage(wallpaperUrls[todayFormatted], filename, true);
  }
});

// 加载更多按钮事件
document.getElementById('load-more-btn').addEventListener('click', loadMoreWallpapers);
