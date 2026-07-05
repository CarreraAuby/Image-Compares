document.addEventListener("DOMContentLoaded", () => {
 
  const compressBtn     = document.getElementById("compressBtn");
  const imageInput      = document.getElementById("imageInput");
  const compressionSlider = document.getElementById("compression");

  const afterImage      = document.getElementById("afterImage");
  const afterPlaceholder = document.getElementById("afterPlaceholder");
  const downloadBtn     = document.getElementById("downloadBtn");

  const originalSizeEl    = document.getElementById("originalSize");
  const compressedSizeEl  = document.getElementById("compressedSize");
  const compressionRateEl = document.getElementById("compressionRate");
  const runtimeEl         = document.getElementById("runtime");
  const originalFileSizeEl   = document.getElementById("originalFileSize");
  const compressedFileSizeEl = document.getElementById("compressedFileSize");

  compressBtn.addEventListener("click", async () => {

    const file = imageInput.files[0];
    if (!file) {
      alert("Pilih gambar terlebih dahulu.");
      return;
    }

    compressBtn.textContent = "Processing...";
    compressBtn.disabled = true;

    const kValue = parseInt(compressionSlider.value);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("k", kValue);

    try {
      const response = await fetch("/compress", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        alert("Error: " + (data.error || "Terjadi kesalahan pada server."));
        return;
      }

      afterImage.src = data.output_url;
      afterImage.classList.remove("hidden");
      afterPlaceholder.classList.add("hidden");

      originalSizeEl.textContent    = data.original_size.toLocaleString() + " values";
      compressedSizeEl.textContent  = data.compressed_size.toLocaleString() + " values";
      compressionRateEl.textContent = data.compression_percentage.toFixed(2) + "%";
      runtimeEl.textContent         = data.runtime_seconds.toFixed(4) + " seconds";

      originalFileSizeEl.textContent   = window.formatBytes(data.original_file_size_bytes);
      compressedFileSizeEl.textContent = window.formatBytes(data.compressed_file_size_bytes);

      downloadBtn.href = data.output_url;
      downloadBtn.download = "compressed_" + file.name;
      downloadBtn.classList.remove("disabled");

    } catch (err) {
      alert(
        "Tidak bisa menghubungi server.\n" +
        "Pastikan app.py sudah dijalankan terlebih dahulu.\n\n" +
        "Detail: " + err.message
      );
    } finally {
      compressBtn.textContent = "Compress Image";
      compressBtn.disabled = false;
    }
  });
});
