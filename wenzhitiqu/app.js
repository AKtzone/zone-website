// 依赖 Tesseract.js 进行 OCR 识别
// 需在 HTML 中引入 Tesseract.js CDN
const uploadArea = document.querySelector('.upload-area');
const fileInput = document.getElementById('fileInput');
const previewImg = document.getElementById('previewImg');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const ocrBtn = document.getElementById('ocrBtn');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
let currentImage = null;
let enlargedModal = null;

// 拖拽上传
uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
});
uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        showPreview(file);
    }
});
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        showPreview(file);
    }
});
function showPreview(file) {
    const reader = new FileReader();
    reader.onload = e => {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
        currentImage = file;
        resultText.textContent = '';
        progressBar.style.width = '0%';
        progressText.textContent = '';
    };
    reader.readAsDataURL(file);
}

// 预览图片放大功能
previewImg.addEventListener('click', () => {
    if (!previewImg.src) return;
    if (enlargedModal) return;
    enlargedModal = document.createElement('div');
    enlargedModal.style.position = 'fixed';
    enlargedModal.style.left = 0;
    enlargedModal.style.top = 0;
    enlargedModal.style.width = '100vw';
    enlargedModal.style.height = '100vh';
    enlargedModal.style.background = 'rgba(0,0,0,0.7)';
    enlargedModal.style.display = 'flex';
    enlargedModal.style.alignItems = 'center';
    enlargedModal.style.justifyContent = 'center';
    enlargedModal.style.zIndex = 9999;
    enlargedModal.innerHTML = `<img src="${previewImg.src}" style="max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 4px 32px #0008;">`;
    enlargedModal.addEventListener('click', () => {
        document.body.removeChild(enlargedModal);
        enlargedModal = null;
    });
    document.body.appendChild(enlargedModal);
});

// 智能预处理图片（灰度、二值化、增强）
function preprocessImage(img, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    // 灰度
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        let avg = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        data[i] = data[i+1] = data[i+2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
    // 自适应二值化
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    data = imageData.data;
    let threshold = 180;
    for (let i = 0; i < data.length; i += 4) {
        let v = data[i] > threshold ? 255 : 0;
        data[i] = data[i+1] = data[i+2] = v;
    }
    ctx.putImageData(imageData, 0, 0);
    // 返回base64
    callback(canvas.toDataURL('image/png'));
}

// 识别按钮
ocrBtn.addEventListener('click', async () => {
    if (!currentImage) return;
    ocrBtn.disabled = true;
    ocrBtn.textContent = '识别中...';
    resultText.textContent = '';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    // 预处理图片提升识别率
    const img = new window.Image();
    img.onload = async () => {
        preprocessImage(img, async (preprocessedDataUrl) => {
            // Tesseract 识别
            const lang = 'mya+eng+chi_sim+chi_tra+osd';
            try {
                const { data: { text } } = await Tesseract.recognize(
                    preprocessedDataUrl,
                    lang,
                    {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                const percent = Math.round(m.progress * 100);
                                progressBar.style.width = percent + '%';
                                progressText.textContent = percent + '%';
                            } else if (m.status) {
                                progressText.textContent = m.status;
                            }
                        },
                        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
                        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
                    }
                );
                // 保持原始排版，使用 <pre> 标签展示
                resultText.innerHTML = '<pre style="margin:0;font-family:inherit;white-space:pre-wrap;word-break:break-all;">' +
                    text.trim().replace(/[<>]/g, c => c === '<' ? '&lt;' : '&gt;') + '</pre>';
                progressBar.style.width = '100%';
                progressText.textContent = '识别完成';
            } catch (e) {
                resultText.textContent = '识别失败，请重试';
                progressText.textContent = '识别失败';
            }
            ocrBtn.disabled = false;
            ocrBtn.textContent = '一键识别';
        });
    };
    img.src = previewImg.src;
});

// 复制按钮
copyBtn.addEventListener('click', () => {
    if (!resultText.textContent) return;
    navigator.clipboard.writeText(resultText.textContent);
    copyBtn.textContent = '已复制!';
    setTimeout(() => copyBtn.textContent = '复制', 1200);
});
// 下载按钮
downloadBtn.addEventListener('click', () => {
    if (!resultText.textContent) return;
    const blob = new Blob([resultText.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '提取结果.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
});
