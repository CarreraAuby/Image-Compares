import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

sys.path.insert(0, str(BASE_DIR))

from flask import Flask, request, jsonify, render_template, send_from_directory

from image_utils import load_image, save_image
from pca_compressor import compress_image, get_max_k

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "templates"),
    static_folder=str(BASE_DIR / "static"),
)

UPLOAD_FOLDER = BASE_DIR / "uploads"
OUTPUT_FOLDER = BASE_DIR / "static" / "output"
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/compress", methods=["POST"])
def compress():
    if "image" not in request.files:
        return jsonify({"error": "Tidak ada file gambar yang dikirim"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Nama file kosong"}), 400

    try:
        compression_percent = int(request.form.get("k", 50))
    except (TypeError, ValueError):
        return jsonify({"error": "Nilai compression rate harus berupa angka"}), 400

    if compression_percent < 1 or compression_percent > 100:
        return jsonify({"error": "Compression rate harus antara 1-100"}), 400

    input_path = UPLOAD_FOLDER / file.filename
    file.save(str(input_path))

    original_file_size_bytes = input_path.stat().st_size

    image_array = load_image(str(input_path))

    max_k = get_max_k(image_array)

    k = max(1, round(max_k * (1 - compression_percent / 100)))

    result = compress_image(image_array, k)

    jpeg_quality = max(20, round(95 - (compression_percent / 100) * 75))

    output_filename = f"compressed_{file.filename}"
    output_path = OUTPUT_FOLDER / output_filename
    save_image(result["compressed_image"], str(output_path), quality=jpeg_quality)

    compressed_file_size_bytes = output_path.stat().st_size

    return jsonify({
        "success": True,
        "output_url": f"/static/output/{output_filename}",
        "runtime_seconds": round(result["runtime_seconds"], 4),
        "original_size": result["original_size_bytes"],
        "compressed_size": result["compressed_size_bytes"],
        "original_file_size_bytes": original_file_size_bytes,
        "compressed_file_size_bytes": compressed_file_size_bytes,
        "compression_percentage": round(result["compression_percentage"], 2),
        "compression_requested": compression_percent,
        "k_used": result["k_used"],
        "max_k": max_k,
    })


@app.route("/download/<filename>")
def download(filename):
    return send_from_directory(str(OUTPUT_FOLDER), filename, as_attachment=True)


if __name__ == "__main__":
    app.run(debug=True)
