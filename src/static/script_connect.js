/**
 * script_connect.js
 * ------------------
 * File ini berisi logika koneksi antara frontend dan backend Flask.
 * Dibuat terpisah dari script.js agar kode milik Frontend & Web Integrator
 * tidak perlu diubah sama sekali.
 *
 * Yang ditangani file ini:
 * 1. Mengirim gambar dan nilai k ke endpoint /compress saat tombol diklik
 * 2. Menampilkan gambar hasil kompresi di kolom "After"
 * 3. Mengisi statistik: Original Size, Compressed Size, Compression Rate, Runtime
 * 4. Mengaktifkan tombol Download setelah hasil tersedia
 */

document.addEventListener("DOMContentLoaded", () => {
  // Ambil elemen-elemen yang sudah dibuat oleh temanmu di index.html
  // (tidak ada variabel baru yang bentrok karena script ini berjalan
  // di scope DOMContentLoaded tersendiri, terpisah dari script.js)
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

  // Tangani klik tombol "Compress Image"
  compressBtn.addEventListener("click", async () => {

    // Validasi: user harus sudah memilih file sebelum menekan tombol
    const file = imageInput.files[0];
    if (!file) {
      alert("Pilih gambar terlebih dahulu.");
      return;
    }

    // Ubah teks tombol selama proses berlangsung supaya user tahu
    // program sedang bekerja dan tidak mengira program hang
    compressBtn.textContent = "Processing...";
    compressBtn.disabled = true;

    // Nilai slider (1-100) dikirim langsung sebagai k ke backend.
    // Backend akan memvalidasi apakah k tidak melebihi batas maksimum
    // gambar tersebut, dan mengembalikan error jika melebihi.
    const kValue = parseInt(compressionSlider.value);

    // FormData adalah cara standar mengirim file lewat HTTP POST dari
    // JavaScript. Flask menerimanya di request.files['image'] dan
    // request.form['k'] di dalam fungsi compress() di app.py.
    const formData = new FormData();
    formData.append("image", file);
    formData.append("k", kValue);

    try {
      // Kirim request ke endpoint /compress di Flask (app.py)
      const response = await fetch("/compress", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Tangani error yang dikembalikan backend (misal k tidak valid)
      if (!response.ok || data.error) {
        alert("Error: " + (data.error || "Terjadi kesalahan pada server."));
        return;
      }

      // Tampilkan gambar hasil kompresi di kolom "After"
      // data.output_url berisi "/static/output/compressed_xxx.jpg"
      // yang langsung bisa dipakai sebagai src <img>
      afterImage.src = data.output_url;
      afterImage.classList.remove("hidden");
      afterPlaceholder.classList.add("hidden");

      // Isi statistik kompresi ke elemen-elemen yang sudah ada di HTML
      originalSizeEl.textContent    = data.original_size.toLocaleString() + " values";
      compressedSizeEl.textContent  = data.compressed_size.toLocaleString() + " values";
      compressionRateEl.textContent = data.compression_percentage.toFixed(2) + "%";
      runtimeEl.textContent         = data.runtime_seconds.toFixed(4) + " seconds";

      // Ukuran file asli & hasil kompresi (bytes nyata di disk, dari server)
      originalFileSizeEl.textContent   = window.formatBytes(data.original_file_size_bytes);
      compressedFileSizeEl.textContent = window.formatBytes(data.compressed_file_size_bytes);

      // Aktifkan tombol Download dengan memperbarui href ke URL hasil
      // dan menghapus class "disabled" yang dipasang temanmu di index.html
      downloadBtn.href = data.output_url;
      downloadBtn.download = "compressed_" + file.name;
      downloadBtn.classList.remove("disabled");

    } catch (err) {
      // Error ini muncul kalau Flask tidak jalan sama sekali
      alert(
        "Tidak bisa menghubungi server.\n" +
        "Pastikan app.py sudah dijalankan terlebih dahulu.\n\n" +
        "Detail: " + err.message
      );
    } finally {
      // Kembalikan tombol ke keadaan semula apapun hasilnya
      compressBtn.textContent = "Compress Image";
      compressBtn.disabled = false;
    }
  });
});