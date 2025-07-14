import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';

(async () => {
  const files = await imagemin(['assets/images/*.{jpg,jpeg}'], {
    destination: 'assets/images/compressed',
    plugins: [
      imageminMozjpeg({
        quality: 85,
        progressive: true
      })
    ]
  });
  
  console.log(`压缩完成: ${files.length}张图片已优化`);
})();
