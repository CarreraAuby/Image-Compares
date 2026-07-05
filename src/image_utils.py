import numpy as np
from PIL import Image


def load_image(filepath: str) -> np.ndarray:
    img = Image.open(filepath)
    img = img.convert("RGB")
    return np.array(img)


def save_image(array: np.ndarray, filepath: str, quality: int = 85) -> None:
    clipped = np.clip(array, 0, 255)
    img_array = clipped.astype(np.uint8)
    img = Image.fromarray(img_array)
    img.save(filepath, quality=quality)


def get_image_size_info(array: np.ndarray) -> dict:
    height, width = array.shape[0], array.shape[1]
    channels = array.shape[2] if array.ndim == 3 else 1
    return {
        "height": height,
        "width": width,
        "channels": channels,
        "total_pixels": height * width,
    }