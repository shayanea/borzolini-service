import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as Jimp from 'jimp';

@Injectable()
export class ImagePreprocessingService {
  private readonly logger = new Logger(ImagePreprocessingService.name);

  /**
   * Maximum allowed image size in bytes (10MB)
   */
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

  /**
   * ImageNet normalization constants
   */
  private readonly IMAGENET_MEAN = [0.485, 0.456, 0.406];
  private readonly IMAGENET_STD = [0.229, 0.224, 0.225];

  /**
   * Target image size for DINOv2 (224x224)
   */
  private readonly TARGET_SIZE = 224;

  /**
   * Validate and preprocess image for DINOv2
   */
  async preprocessImage(
    imageBuffer: Buffer,
    targetSize: number = this.TARGET_SIZE
  ): Promise<tf.Tensor4D> {
    try {
      // Validate file size
      if (imageBuffer.length > this.MAX_FILE_SIZE) {
        throw new BadRequestException(
          `Image size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
        );
      }

      // Validate image format
      const mimeType = this.detectMimeType(imageBuffer);
      if (!mimeType || !['image/jpeg', 'image/png'].includes(mimeType)) {
        throw new BadRequestException(
          'Only JPEG and PNG images are supported'
        );
      }

      // Load and process image with Jimp
      const image = await Jimp.read(imageBuffer);

      // Resize to target size (maintaining aspect ratio if needed)
      image.resize(targetSize, targetSize, Jimp.RESIZE_BILINEAR);

      // Convert to RGB array (DINOv2 expects RGB, not RGBA)
      const pixels = new Float32Array(targetSize * targetSize * 3);
      let pixelIndex = 0;

      image.scan(
        0,
        0,
        targetSize,
        targetSize,
        (_x, _y, idx) => {
          const r = image.bitmap.data[idx] / 255.0;
          const g = image.bitmap.data[idx + 1] / 255.0;
          const b = image.bitmap.data[idx + 2] / 255.0;

          pixels[pixelIndex++] = r;
          pixels[pixelIndex++] = g;
          pixels[pixelIndex++] = b;
        }
      );

      // Create tensor from pixel data
      const tensor = tf.tensor3d(pixels, [targetSize, targetSize, 3]);

      // Normalize with ImageNet statistics
      const meanTensor = tf.tensor1d(this.IMAGENET_MEAN);
      const stdTensor = tf.tensor1d(this.IMAGENET_STD);

      // Normalize: (pixel - mean) / std
      const normalized = tensor
        .sub(meanTensor)
        .div(stdTensor);

      // Add batch dimension [1, 224, 224, 3]
      const batched = normalized.expandDims(0) as tf.Tensor4D;

      // Cleanup intermediate tensors
      tensor.dispose();
      meanTensor.dispose();
      stdTensor.dispose();
      normalized.dispose();

      this.logger.debug(
        `Image preprocessed: ${targetSize}x${targetSize}, size: ${imageBuffer.length} bytes`
      );

      return batched;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('Image preprocessing failed:', error);
      throw new BadRequestException(
        'Failed to process image. Please ensure the file is a valid image.'
      );
    }
  }

  /**
   * Detect MIME type from buffer signature
   */
  private detectMimeType(buffer: Buffer): string | null {
    const signatures: Record<string, string> = {
      '89504e47': 'image/png',
      'ffd8ffe0': 'image/jpeg',
      'ffd8ffe1': 'image/jpeg',
      'ffd8ffdb': 'image/jpeg',
    };

    const hex = buffer.toString('hex', 0, 4);
    return signatures[hex] || null;
  }

  /**
   * Validate image buffer
   */
  validateImage(buffer: Buffer): void {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('Empty image file');
    }

    if (buffer.length > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Image too large. Maximum size: ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    const mimeType = this.detectMimeType(buffer);
    if (!mimeType) {
      throw new BadRequestException('Unsupported image format');
    }
  }
}

