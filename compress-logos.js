const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'assets/images';
const outputDir = 'assets/images/compressed';

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 压缩所有logo图片
async function compressLogos() {
  const files = fs.readdirSync(inputDir)
    .filter(file => file.startsWith('logo') && (file.endsWith('.jpg') || file.endsWith('.JPG')));

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    
    try {
      await sharp(inputPath)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toFile(outputPath);
      
      console.log(`压缩成功: ${file}`);
    } catch (err) {
      console.error(`压缩失败 ${file}:`, err);
    }
  }
}

compressLogos().then(() => {
  console.log('所有logo图片压缩完成');
});
