document.addEventListener("DOMContentLoaded", () => {
  const imageInput = document.getElementById("imageInput");
  const fileNameDisplay = document.getElementById("fileNameDisplay");
  const compressionSlider = document.getElementById("compression");
  const sliderValueDisplay = document.getElementById("sliderValue");

  const beforeImage = document.getElementById("beforeImage");
  const beforePlaceholder = document.getElementById("beforePlaceholder");

  const originalFileSizeEl = document.getElementById("originalFileSize");
  const compressedFileSizeEl = document.getElementById("compressedFileSize");

  compressionSlider.addEventListener("input", (e) => {
    sliderValueDisplay.textContent = e.target.value;
  });

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file) {
      fileNameDisplay.textContent = file.name;

      originalFileSizeEl.textContent = window.formatBytes(file.size);
      compressedFileSizeEl.textContent = "-";

      const reader = new FileReader();
      reader.onload = function (event) {
        beforeImage.src = event.target.result;
        beforeImage.classList.remove("hidden");
        beforePlaceholder.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    } else {
      fileNameDisplay.textContent = "No File Chosen";
      beforeImage.src = "#";
      beforeImage.classList.add("hidden");
      beforePlaceholder.classList.remove("hidden");
      originalFileSizeEl.textContent = "-";
      compressedFileSizeEl.textContent = "-";
    }
  });
});

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}
window.formatBytes = formatBytes;
