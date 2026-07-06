# Interface Backend PCA — Panduan untuk Frontend & Web Integrator

## Fungsi yang Perlu Dipanggil dari Flask

### 1. Membaca gambar yang diupload user

```python
from image_utils import load_image

```

### 2. Mengompresi gambar

```python
from pca_compressor import compress_image, get_max_k

```

`result` adalah sebuah **dictionary** dengan isi:

| Key | Tipe | Keterangan |
|---|---|---|
| `compressed_image` | `np.ndarray` | Array gambar hasil kompresi, siap disimpan/ditampilkan |
| `runtime_seconds` | `float` | Waktu eksekusi algoritma PCA (dalam detik) |
| `original_size_bytes` | `int` | Estimasi jumlah angka data gambar asli |
| `compressed_size_bytes` | `int` | Estimasi jumlah angka data setelah kompresi |
| `compression_percentage` | `float` | Persentase pengurangan data (bisa negatif jika k terlalu besar!) |
| `k_used` | `int` | Nilai k aktual yang dipakai (sudah divalidasi/dipotong jika perlu) |

### 3. Menyimpan hasil kompresi (untuk fitur download)

```python
from image_utils import save_image

save_image(result['compressed_image'], 'static/output/hasil.jpg')
```

## Contoh Lengkap Pemakaian di Flask (untuk referensi)

```python
from flask import Flask, request, jsonify, send_file
from image_utils import load_image, save_image
from pca_compressor import compress_image
import os

app = Flask(__name__)

@app.route('/compress', methods=['POST'])
def compress():
    file = request.files['image']
    k = int(request.form['k'])

    input_path = os.path.join('uploads', file.filename)
    file.save(input_path)

    image_array = load_image(input_path)
    result = compress_image(image_array, k)

    output_path = os.path.join('static/output', f'compressed_{file.filename}')
    save_image(result['compressed_image'], output_path)

    return jsonify({
        'output_url': f'/{output_path}',
        'runtime_seconds': result['runtime_seconds'],
        'compression_percentage': result['compression_percentage'],
        'k_used': result['k_used'],
    })
```

## Hal-Hal yang HARUS Diperhatikan Frontend Developer

1. **k harus integer positif**, minimal 1. Kalau user input desimal/string kosong,
   harus divalidasi dulu sebelum dipanggil ke `compress_image()`.
2. **k maksimum tergantung ukuran gambar** (`min(height, width)`). Gunakan
   `get_max_k(image_array)` untuk membuat batas atas slider/input di UI,
   supaya user tidak bisa input k yang tidak valid.
3. `compression_percentage` **bisa negatif** kalau k terlalu besar (mendekati
   k maksimum) — ini bukan bug, tapi memang sifat matematis dari metode ini
   (lihat penjelasan "break-even point" di laporan Bab 4). Sebaiknya UI
   menampilkan ini dengan jelas (misal warna merah kalau negatif), bukan
   disembunyikan/dianggap error.
4. Proses ini **butuh waktu** untuk gambar besar (SVD adalah operasi yang
   cukup berat secara komputasi). Sebaiknya ada indikator loading di UI.

## Format Data Gambar (Untuk yang Ingin Tahu Detail)

- `image_array` yang dikembalikan `load_image()` selalu RGB (3 channel),
  walau gambar asli grayscale atau punya transparency (PNG).
- Tipe data: `numpy.uint8`, shape `(height, width, 3)`.
- `compressed_image` di hasil `compress_image()` juga sudah dalam format
  yang sama, siap langsung dipakai `save_image()` tanpa konversi tambahan.
