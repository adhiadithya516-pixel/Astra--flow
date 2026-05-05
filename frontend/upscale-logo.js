const { Jimp } = require("jimp");

async function upscale() {
  try {
    const imagePath = "public/astra-flow-logo.png";
    const image = await Jimp.read(imagePath);
    console.log(`Original dimensions: ${image.bitmap.width}x${image.bitmap.height}`);
    
    // Scale to 4K (roughly 3840 width or height depending on aspect ratio)
    // If it's square, 3840x3840.
    const targetSize = 3840;
    let newWidth = targetSize;
    let newHeight = targetSize;
    
    if (image.bitmap.width > image.bitmap.height) {
      newHeight = Math.round(targetSize * (image.bitmap.height / image.bitmap.width));
    } else {
      newWidth = Math.round(targetSize * (image.bitmap.width / image.bitmap.height));
    }
    
    image.resize({ w: newWidth, h: newHeight }); // Resize
    await image.write(imagePath);
    console.log(`Upscaled to: ${newWidth}x${newHeight}`);
  } catch(e) {
    console.error(e);
  }
}
upscale();
