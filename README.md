<h1 align="center">  Image Compres dengan PCA  </h1>

<p align="center">
  <strong>Kelompok 2 <br> informatika D <br> Universitas Sebelas Maret</strong>
</p>

---
## 👥 Anggota Kelompok
| NIM        | NAMA                           |
|:-----------|:-----------------              |
| L0125076   | Carrera Abi Saputra            |
| L0125129   | Ersandy Fahreza                |
| L0125137   | Regita Ariella Safa Wardani    |

**Dosen Pengampu:** Drs. Bambang Harjito, M.App.Sc., Ph.D.

---
## Cara Menjalankan Program

Program ini adalah website lokal sederhana untuk mengompresi gambar
menggunakan algoritma PCA (Principal Component Analysis) via SVD.

### Langkah 1: Pastikan Python sudah terinstall

Buka terminal/command prompt, ketik:
```
python --version
```
atau
```
python3 --version
```
Program ini diuji menggunakan Python 3.12. Disarankan menggunakan Python
3.9 atau lebih baru.

### Langkah 2: Install library yang dibutuhkan

Masuk ke folder `src`, lalu jalankan:
```
cd src
pip install -r requirements.txt
```

Jika muncul error `pip: command not found`, coba ganti `pip` dengan `pip3`.

Jika muncul error terkait permission/akses pada sistem Linux/Mac, coba
tambahkan `--user` di akhir command:
```
pip install -r requirements.txt --user
```

### Langkah 3: Jalankan aplikasi

Program ini dirancang agar tetap berjalan benar dari direktori manapun
Anda menjalankannya — baik dari dalam folder `src/`, maupun dari folder
project (root) di luar `src/`. Pilih salah satu cara berikut:

**Cara A — dari dalam folder `src`:**
```
cd src
python app.py
```

**Cara B — dari folder root project (tanpa masuk ke `src` dulu):**
```
python src/app.py
```

Kedua cara di atas akan menghasilkan perilaku yang sama persis. Jika
muncul error `python: command not found`, ganti `python` dengan `python3`.

Jika berhasil, akan muncul tulisan seperti ini di terminal:
```
 * Running on http://127.0.0.1:5000
```

### Langkah 4: Buka di browser

Buka browser (Chrome/Firefox/Edge), lalu kunjungi alamat:
```
http://127.0.0.1:5000
```

Akan muncul halaman untuk mengupload gambar dan memasukkan nilai k
(tingkat kompresi). Gambar contoh untuk uji coba tersedia di folder
`test/sample.jpg`.

### Menghentikan Program

Kembali ke terminal, tekan `CTRL + C` untuk menghentikan server.

---
## 🧮 Algoritma PCA
 
Kompresi gambar dilakukan menggunakan **Principal Component Analysis (PCA)** lewat eigendecomposition dari matriks kovariansi, diterapkan pada fungsi `compress_channel()` di `pca_compressor.py`:
 
1. **Hitung Mean tiap kolom**: `mean_vector = np.mean(channel, axis=0)`
2. **Pusatkan data**: kurangi setiap baris dengan mean → `centered = channel - mean_vector`
3. **Matriks Kovariansi**: `covariance_matrix = (centered.T @ centered) / (n_samples - 1)`
4. **Eigendekomposisi**: `eigenvalues, eigenvectors = np.linalg.eigh(covariance_matrix)`
5. **Pilih k Komponen**: urutkan eigenvalue descending (`np.argsort(eigenvalues)[::-1]`), ambil k eigenvector pertama sebagai `principal_components`
6. **Proyeksi & Rekonstruksi**: proyeksikan data ke ruang PC baru (`projected = centered @ principal_components`), lalu kembalikan ke ruang asli (`reconstructed = (projected @ principal_components.T) + mean_vector`)
Kompresi dilakukan **terpisah per channel warna (R, G, B)** di dalam `compress_image()`, agar warna asli gambar tetap terjaga.
 
---
## Struktur Folder

```
src/   -> source code program (Python)
test/  -> data uji (gambar contoh)
doc/   -> dokumentasi tambahan dan draft teori
```

## Troubleshooting (Jika Terjadi Masalah)

**Error: ModuleNotFoundError: No module named 'flask' (atau numpy/PIL)**
-> Jalankan ulang langkah 2 (`pip install -r requirements.txt`). Library
belum terinstall di komputer ini.

**Error: Address already in use / port 5000 sudah dipakai**
-> Aplikasi lain di komputer sedang memakai port 5000. Tutup aplikasi
tersebut, atau edit baris terakhir `app.py` menjadi:
`app.run(debug=True, port=5001)` lalu akses `http://127.0.0.1:5001`

**Halaman browser blank/tidak bisa diakses**
-> Pastikan terminal masih menjalankan `app.py` (jangan ditutup), dan
pastikan mengetik alamat dengan benar: `http://127.0.0.1:5000` (bukan
https, dan port harus 5000 kecuali diubah manual).
