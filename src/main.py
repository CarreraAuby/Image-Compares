import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

sys.path.insert(0, str(BASE_DIR))

from image_utils import load_image, save_image, get_image_size_info
from pca_compressor import compress_image, get_max_k


def main():
    INPUT_IMAGE_PATH = PROJECT_ROOT / "test" / "sample.jpg"
    OUTPUT_DIR = PROJECT_ROOT / "test" / "output"
    K_VALUES_TO_TEST = [5, 20, 50, 100] 

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Membaca gambar dari: {INPUT_IMAGE_PATH}")
    image_array = load_image(str(INPUT_IMAGE_PATH))

    info = get_image_size_info(image_array)
    print(f"Info gambar: {info}")

    max_k = get_max_k(image_array)
    print(f"Nilai k maksimum untuk gambar ini: {max_k}\n")

    for k in K_VALUES_TO_TEST:
        if k > max_k:
            print(f"[SKIP] k={k} melebihi batas maksimum ({max_k})")
            continue

        print(f"--- Mengompresi dengan k={k} ---")
        result = compress_image(image_array, k)

        print(f"  Runtime          : {result['runtime_seconds']:.4f} detik")
        print(f"  Ukuran asli       : {result['original_size_bytes']:,} angka")
        print(f"  Ukuran terkompresi: {result['compressed_size_bytes']:,} angka")
        print(f"  Persentase kompresi: {result['compression_percentage']:.2f}%")

        output_path = OUTPUT_DIR / f"hasil_k{k}.jpg"
        save_image(result["compressed_image"], str(output_path))
        print(f"  Tersimpan di: {output_path}\n")

    print("Selesai! Cek folder output untuk membandingkan hasil visual tiap k.")


if __name__ == "__main__":
    main()
