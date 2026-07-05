import time
import numpy as np

def compress_channel(channel: np.ndarray, k: int) -> np.ndarray:
    mean_vector = np.mean(channel, axis=0)

    centered = channel - mean_vector

    n_samples = channel.shape[0]
    covariance_matrix = (centered.T @ centered) / (n_samples - 1)

    eigenvalues, eigenvectors = np.linalg.eigh(covariance_matrix)

    descending_order = np.argsort(eigenvalues)[::-1]
    eigenvalues_sorted = eigenvalues[descending_order]
    eigenvectors_sorted = eigenvectors[:, descending_order]

    k = min(k, eigenvectors_sorted.shape[1])

    principal_components = eigenvectors_sorted[:, :k]

    projected = centered @ principal_components

    reconstructed = (projected @ principal_components.T) + mean_vector

    return reconstructed


def compress_image(image_array: np.ndarray, k: int) -> dict:
    start_time = time.time()

    height, width, num_channels = image_array.shape

    compressed_channels = []

    for channel_index in range(num_channels):
        channel_data = image_array[:, :, channel_index].astype(np.float64)
        compressed = compress_channel(channel_data, k)
        compressed_channels.append(compressed)

    compressed_image = np.stack(compressed_channels, axis=-1)
    compressed_image = np.clip(compressed_image, 0, 255).astype(np.uint8)

    runtime_seconds = time.time() - start_time

    original_size = height * width * num_channels

    k_used = min(k, width)
    size_per_channel = (width * k_used) + (height * k_used) + width
    compressed_size = size_per_channel * num_channels

    compression_percentage = (1 - (compressed_size / original_size)) * 100

    return {
        "compressed_image": compressed_image,
        "runtime_seconds": runtime_seconds,
        "original_size_bytes": original_size,
        "compressed_size_bytes": compressed_size,
        "compression_percentage": compression_percentage,
        "k_used": k_used,
    }


def get_max_k(image_array: np.ndarray) -> int:
    width = image_array.shape[1]
    return width