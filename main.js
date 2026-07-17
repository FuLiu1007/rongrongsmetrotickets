// main.js

// 预设城市配置
const CITIES = [
  { id: 'beijing', name: '北京地铁', color: '#004a99', logoText: 'BJM' },
  { id: 'shanghai', name: '上海地铁', color: '#ed1c24', logoText: 'SHM' },
  { id: 'guangzhou', name: '广州地铁', color: '#cb2c30', logoText: 'GZM' },
  { id: 'shenzhen', name: '深圳地铁', color: '#009944', logoText: 'SZM' },
  { id: 'chengdu', name: '成都地铁', color: '#005b9f', logoText: 'CDM' },
  { id: 'chongqing', name: '重庆轨道交通', color: '#007044', logoText: 'CRT' },
  { id: 'hangzhou', name: '杭州地铁', color: '#e83929', logoText: 'HZM' },
  { id: 'wuhan', name: '武汉地铁', color: '#00529b', logoText: 'WHM' },
  { id: 'xian', name: '西安地铁', color: '#c41230', logoText: 'XAM' },
  { id: 'custom', name: '自定义地铁', color: '#333333', logoText: 'SUB' },
];

// 初始化数据
let data = {
  cityId: 'beijing',
  customCityName: '某某地铁',
  lineColor: '#004a99', // 线路颜色（现在主色调由它决定）
  line: '1号线',
  startStation: '笑笑橙',
  endStation: 'Do都城',
  // 日期只截取前10位，即 YYYY-MM-DD
  date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
  price: '¥5.00',
};

// 初始化 Lucide 图标
lucide.createIcons();

// 填充城市下拉菜单
const citySelect = document.getElementById('cityId');
CITIES.forEach(city => {
  const option = document.createElement('option');
  option.value = city.id;
  option.textContent = city.name;
  citySelect.appendChild(option);
});

// 获取所有输入框 DOM
const inputs = {
  cityId: document.getElementById('cityId'),
  customCityName: document.getElementById('customCityName'),
  lineColor: document.getElementById('lineColor'), // 获取颜色选择器
  line: document.getElementById('line'),
  startStation: document.getElementById('startStation'),
  endStation: document.getElementById('endStation'),
  date: document.getElementById('date'),
  price: document.getElementById('price'),
};

const customCityOptions = document.getElementById('customCityOptions');

// 获取票面需要更新的 DOM
const ticketElements = {
  accentBorder: document.getElementById('ticketAccentBorder'),
  logoBg: document.getElementById('ticketLogoBg'),
  cityName: document.getElementById('ticketCityName'),
  startStation: document.getElementById('ticketStartStation'),
  line: document.getElementById('ticketLine'),
  dotLeft: document.getElementById('ticketDotLeft'),
  dotRight: document.getElementById('ticketDotRight'),
  endStation: document.getElementById('ticketEndStation'),
  date: document.getElementById('ticketDate'),
  price: document.getElementById('ticketPrice'),
  ticketNo: document.getElementById('ticketNo'),
  qrcodeContainer: document.getElementById('qrcodeContainer'),
};

// 绑定事件监听：输入框变化时更新数据并重新渲染车票
Object.keys(inputs).forEach(key => {
  if (inputs[key]) {
    inputs[key].value = data[key];
    inputs[key].addEventListener('input', (e) => {
      data[key] = e.target.value;
      
      // 温馨的小细节：如果你切换了城市，我会自动把线路颜色改成这个城市的主题色
      if (key === 'cityId' && data.cityId !== 'custom') {
        const cityInfo = CITIES.find(c => c.id === data.cityId);
        if (cityInfo) {
          data.lineColor = cityInfo.color;
          inputs.lineColor.value = cityInfo.color;
        }
      }
      
      updateTicket();
    });
  }
});

// 生成 SVG 假二维码
function drawFakeQRCode(size, value, color) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash = hash & hash;
  }
  hash = Math.abs(hash);

  const cells = 29;
  let svgContent = '';

  const drawMarker = (x, y) => `
    <g>
      <rect x="${x}" y="${y}" width="7" height="7" fill="${color}" />
      <rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="white" />
      <rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="${color}" />
    </g>
  `;

  svgContent += drawMarker(0, 0);
  svgContent += drawMarker(cells - 7, 0);
  svgContent += drawMarker(0, cells - 7);

  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      if ((i < 8 && j < 8) || (i > cells - 9 && j < 8) || (i < 8 && j > cells - 9)) {
        continue;
      }
      const pseudoRandom = Math.sin(hash + i * 3.14 + j * 2.71) * 10000;
      const isFilled = (pseudoRandom - Math.floor(pseudoRandom)) > 0.5;

      if (isFilled) {
        svgContent += `<rect x="${i}" y="${j}" width="1" height="1" fill="${color}" />`;
      }
    }
  }

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${cells} ${cells}" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`;
}

// 核心更新逻辑：将数据映射到 DOM 上
function updateTicket() {
  const isCustom = data.cityId === 'custom';
  
  // 切换自定义输入框的显示状态
  if (isCustom) {
    customCityOptions.classList.remove('hidden');
  } else {
    customCityOptions.classList.add('hidden');
  }

  const city = isCustom
    ? { name: data.customCityName || '城市地铁', logoText: 'SUB' }
    : CITIES.find(c => c.id === data.cityId) || CITIES[0];

  // 【这里的关键】：现在整个票面的颜色都由你选的“线路颜色”决定
  const activeColor = data.lineColor;

  // 更新各种元素的颜色
  ticketElements.accentBorder.style.backgroundColor = activeColor;
  ticketElements.line.style.backgroundColor = activeColor;
  ticketElements.dotLeft.style.backgroundColor = activeColor;
  ticketElements.dotRight.style.backgroundColor = activeColor;
  ticketElements.price.style.color = activeColor;

  // 更新文本内容
  ticketElements.cityName.textContent = city.name;
  ticketElements.startStation.textContent = data.startStation || '----';
  ticketElements.endStation.textContent = data.endStation || '----';
  ticketElements.line.textContent = data.line || '----';
  ticketElements.price.textContent = data.price || '¥0.00';

  // 【这里的关键】：对杭州地铁的标志做特殊处理
  if (data.cityId === 'hangzhou') {
    // 隐藏背景色，插入图片 image.png
    ticketElements.logoBg.style.backgroundColor = 'transparent';
    ticketElements.logoBg.innerHTML = '<img src="image.png" alt="杭州地铁" style="width: 100%; height: 100%; object-fit: contain;" />';
  } else {
    // 其他城市恢复文字标志和背景色
    ticketElements.logoBg.style.backgroundColor = activeColor;
    ticketElements.logoBg.innerHTML = `<span id="ticketLogoText" style="font-weight:bold; font-size:14px;">${city.logoText}</span>`;
  }

  // 格式化时间并更新 (去掉了时分，只留年月日)
  let formattedDate = data.date;
  try {
    const d = new Date(data.date);
    if (!isNaN(d.getTime())) {
      formattedDate = new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(d);
    }
  } catch (e) {}
  ticketElements.date.textContent = formattedDate;

  // 动态生成防伪流水号
  const randomStr = Math.floor(Math.random() * 9000 + 1000);
  const hashVal = Math.abs(data.line.length * 1000 + data.startStation.length * 100 + city.name.charCodeAt(0) * 10 + data.date.length);
  const ticketNoValue = `NO.${hashVal.toString().padStart(8, '0')}-${randomStr}`;
  ticketElements.ticketNo.textContent = ticketNoValue;

  // 重新生成二维码
  ticketElements.qrcodeContainer.innerHTML = drawFakeQRCode(120, `${city.name}-${data.line}-${data.date}`, activeColor);
}

// 首次加载渲染
updateTicket();
// ====== 下载车票功能 ======
function downloadTicket() {
  // 找到我们刚刚命名的车票卡片元素
  const ticketElement = document.getElementById('ticket-container');
  
  if (!ticketElement) return;

  // 使用 html2canvas 将该区域渲染成图片
  html2canvas(ticketElement, {
    scale: 2, // 提高清晰度
    useCORS: true, // 允许加载跨域图片（比如如果图片在别的地方）
    backgroundColor: null // 保持圆角的透明背景
  }).then(canvas => {
    // 创建一个虚拟的链接并触发下载
    const link = document.createElement('a');
    // 设置下载的文件名，例如 "地铁票-hangzhou.png"
    link.download = `地铁票-${data.cityId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}