const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const previewSection = document.getElementById("previewSection");
const originalImage = document.getElementById("originalImage");
const resultCanvas = document.getElementById("resultCanvas");
const downloadBtn = document.getElementById("downloadBtn");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");

// Click to upload
dropArea.addEventListener("click", () => fileInput.click());

// Drag and drop
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFile(files[0]);
  }
});

// File input change
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  // Validate file type
  if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
    alert("Mohon pilih file JPG atau PNG!");
    return;
  }

  // Validate file size (50MB max)
  if (file.size > 50 * 1024 * 1024) {
    alert("Ukuran file maksimal 50MB!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    originalImage.src = e.target.result;
    emptyState.classList.add("hidden");
    loadingState.classList.remove("hidden");

    setTimeout(() => {
      applyDuoToneEffect(e.target.result);
    }, 500);
  };
  reader.readAsDataURL(file);
}

function applyDuoToneEffect(imageSrc) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Apply duotone effect using official HEX colors
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

      // Apply duotone mapping using official HEX colors
      // Brave Pink (#f784c5) and Hero Green (#1b602f)
      const pinkIntensity = gray / 255;
      const greenIntensity = 1 - pinkIntensity;

      data[i] = Math.min(255, 247 * pinkIntensity + 27 * greenIntensity); // R - #f784c5 & #1b602f
      data[i + 1] = Math.min(255, 132 * pinkIntensity + 96 * greenIntensity); // G - #f784c5 & #1b602f
      data[i + 2] = Math.min(255, 197 * pinkIntensity + 47 * greenIntensity); // B - #f784c5 & #1b602f
    }

    ctx.putImageData(imageData, 0, 0);

    // Display result
    resultCanvas.width = canvas.width;
    resultCanvas.height = canvas.height;
    const resultCtx = resultCanvas.getContext("2d");
    resultCtx.drawImage(canvas, 0, 0);

    loadingState.classList.add("hidden");
    previewSection.classList.remove("hidden");
  };
  img.src = imageSrc;
}

// Download functionality
downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "duotone.png";
  link.href = resultCanvas.toDataURL();
  link.click();
});
