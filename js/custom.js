/* ---------- elemen ---------- */
const color1 = document.getElementById("color1");
const color2 = document.getElementById("color2");
const hex1 = document.getElementById("hex1");
const hex2 = document.getElementById("hex2");
const dropArea = document.getElementById("dropArea");
const fileInput = document.getElementById("fileInput");
const loadingState = document.getElementById("loadingState");
const previewSection = document.getElementById("previewSection");
const originalImage = document.getElementById("originalImage");
const resultCanvas = document.getElementById("resultCanvas");
const downloadBtn = document.getElementById("downloadBtn");

const modal = document.getElementById("customModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalClose = document.getElementById("modalClose");

let currentImageSrc = "";

/* ---------- modal helper ---------- */
function showModal(title, msg) {
  modalTitle.textContent = title;
  modalMessage.textContent = msg;
  modal.classList.add("show");
}
modalClose.addEventListener("click", () => modal.classList.remove("show"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("show");
});

/* ---------- sinkronasi color-picker ↔ hex + auto refresh ---------- */
function syncPickerToText(picker, text) {
  text.value = picker.value;
}
function syncTextToPicker(text, picker) {
  if (/^#[0-9A-F]{6}$/i.test(text.value)) {
    picker.value = text.value;
    if (currentImageSrc) applyDuoToneEffect(currentImageSrc);
  } else {
    showModal("Format salah", "Gunakan format HEX 7-digit, misalnya #ff0055");
  }
}
color1.addEventListener("input", () => {
  syncPickerToText(color1, hex1);
  if (currentImageSrc) applyDuoToneEffect(currentImageSrc);
});
color2.addEventListener("input", () => {
  syncPickerToText(color2, hex2);
  if (currentImageSrc) applyDuoToneEffect(currentImageSrc);
});
hex1.addEventListener("change", () => {
  syncTextToPicker(hex1, color1);
});
hex2.addEventListener("change", () => {
  syncTextToPicker(hex2, color2);
});

/* ---------- drag & drop + click ---------- */
dropArea.addEventListener("click", () => fileInput.click());
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});
dropArea.addEventListener("dragleave", () =>
  dropArea.classList.remove("dragover")
);
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file.type.match(/image\/(jpeg|jpg|png)/))
    return showModal("Format tidak didukung", "Mohon pilih file JPG atau PNG!");
  if (file.size > 50 * 1024 * 1024)
    return showModal("Ukuran terlalu besar", "Maksimal ukuran file 50MB!");
  const reader = new FileReader();
  reader.onload = (e) => {
    currentImageSrc = e.target.result;
    originalImage.src = currentImageSrc;
    loadingState.classList.remove("hidden");
    setTimeout(() => applyDuoToneEffect(currentImageSrc), 300);
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
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const rgb1 = hexToRgb(color1.value);
    const rgb2 = hexToRgb(color2.value);

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const t = gray / 255;
      data[i] = Math.round(rgb2.r * t + rgb1.r * (1 - t));
      data[i + 1] = Math.round(rgb2.g * t + rgb1.g * (1 - t));
      data[i + 2] = Math.round(rgb2.b * t + rgb1.b * (1 - t));
    }
    ctx.putImageData(imgData, 0, 0);

    resultCanvas.width = canvas.width;
    resultCanvas.height = canvas.height;
    resultCanvas.getContext("2d").drawImage(canvas, 0, 0);

    loadingState.classList.add("hidden");
    previewSection.classList.remove("hidden");
  };
  img.src = imageSrc;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

downloadBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "duotone.png";
  a.href = resultCanvas.toDataURL();
  a.click();
});
