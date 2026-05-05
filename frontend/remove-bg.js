const { Jimp } = require("jimp");

async function removeWhiteBackground() {
  const imagePath = "public/astra-flow-logo.png";
  try {
    const image = await Jimp.read(imagePath);
    const tolerance = 240; // Pixels with R,G,B > tolerance will be made transparent

    image.scan((x, y, idx) => {
      const red = image.bitmap.data[idx + 0];
      const green = image.bitmap.data[idx + 1];
      const blue = image.bitmap.data[idx + 2];
      
      // Check if the pixel is close to white
      if (red > tolerance && green > tolerance && blue > tolerance) {
        image.bitmap.data[idx + 3] = 0; // Set alpha to 0
      }
    });

    await image.write(imagePath);
    console.log("Background removed successfully.");
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

removeWhiteBackground();
