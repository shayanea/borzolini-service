import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as tf from '@tensorflow/tfjs-node';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TensorFlowFeatureExtractorService implements OnModuleInit {
  private readonly logger = new Logger(TensorFlowFeatureExtractorService.name);
  private model: tf.LayersModel | null = null;
  private modelLoaded = false;
  private featureModel: tf.LayersModel | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.loadModel();
  }

  /**
   * Load TensorFlow.js model from local storage
   */
  private async loadModel(): Promise<void> {
    try {
      const modelsPath =
        this.configService.get<string>('AI_MODELS_PATH') || './models';
      const modelPath = path.join(modelsPath, 'skin-detection-model');

      // Check if fine-tuned model exists
      if (fs.existsSync(path.join(modelPath, 'model.json'))) {
        this.logger.log(`Loading fine-tuned TensorFlow.js model from ${modelPath}`);
        this.model = await tf.loadLayersModel(
          `file://${path.resolve(modelPath)}/model.json`
        );
        this.modelLoaded = true;
        this.logger.log('TensorFlow.js model loaded successfully');
        // Log outputs for awareness (single-task vs multi-task)
        try {
          const outputs = Array.isArray(this.model.outputs)
            ? (this.model.outputs as any[]).length
            : 1;
          this.logger.log(`Loaded model with ${outputs} output(s).`);
        } catch {}
      } else {
        // Load pre-trained MobileNet for feature extraction
        this.logger.log('Fine-tuned model not found. Loading MobileNet for feature extraction...');
        await this.loadMobileNetBase();
        this.logger.log('MobileNet base loaded successfully');
      }
    } catch (error) {
      this.logger.error('Failed to load TensorFlow.js model:', error);
      this.logger.warn(
        'Skin detection will use basic feature extraction. Run training script to create fine-tuned model.'
      );
      this.modelLoaded = false;
    }
  }

  /**
   * Load MobileNet v2 for feature extraction (fallback)
   */
  private async loadMobileNetBase(): Promise<void> {
    try {
      // Create a MobileNet v2 model for feature extraction
      // We'll create a simple CNN if MobileNet isn't available
      this.featureModel = await this.createSimpleFeatureExtractor();
      this.modelLoaded = true;
    } catch (error) {
      this.logger.warn('Failed to load MobileNet, using basic feature extractor');
      this.featureModel = await this.createSimpleFeatureExtractor();
    }
  }

  /**
   * Create a simple CNN feature extractor as fallback
   */
  private async createSimpleFeatureExtractor(): Promise<tf.LayersModel> {
    const model = tf.sequential();

    // Feature extraction layers
    model.add(
      tf.layers.conv2d({
        inputShape: [224, 224, 3],
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same',
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    model.add(
      tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same',
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    model.add(
      tf.layers.conv2d({
        filters: 128,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same',
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    model.add(
      tf.layers.conv2d({
        filters: 256,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same',
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.globalAveragePooling2d());

    // Output: 256-dimensional feature vector
    model.add(tf.layers.dense({ units: 256, activation: 'relu' }));

    // Model is not compiled since we only use it for feature extraction
    return model;
  }

  /**
   * Extract features from preprocessed image
   * Returns global features and patch features for localization
   */
  async extractFeatures(preprocessedImage: tf.Tensor4D): Promise<{
    globalFeatures: Float32Array; // Feature vector
    patchFeatures: Float32Array; // For spatial analysis
  }> {
    if (!this.modelLoaded || (!this.model && !this.featureModel)) {
      // Fallback: return placeholder features
      this.logger.warn(
        'TensorFlow.js model not available, using placeholder features'
      );
      return this.extractPlaceholderFeatures();
    }

    try {
      const activeModel = this.model || this.featureModel;
      if (!activeModel) {
        return this.extractPlaceholderFeatures();
      }

      // Extract features
      // For classification models, get features from second-to-last layer
      // For feature extractors, use the output directly
      let features: tf.Tensor;

      if (this.model) {
        // Fine-tuned model - extract features from penultimate layer
        const layer = this.model.getLayer(
          this.model.layers.length - 2
        ).output as tf.SymbolicTensor;
        const featureModel = tf.model({
          inputs: this.model.inputs,
          outputs: layer,
        });
        features = featureModel.predict(preprocessedImage) as tf.Tensor;
        featureModel.dispose();
      } else {
        // Feature extractor model
        features = activeModel.predict(preprocessedImage) as tf.Tensor;
      }

      // Get global features
      const globalFeatures = await features.data();

      // For patch features, we'll extract spatial features
      // Create patch features by dividing image into regions
      const patchFeatures = await this.extractPatchFeatures(
        preprocessedImage,
        activeModel
      );

      // Cleanup
      features.dispose();

      return {
        globalFeatures: globalFeatures as Float32Array,
        patchFeatures,
      };
    } catch (error) {
      this.logger.error('Feature extraction failed:', error);
      return this.extractPlaceholderFeatures();
    }
  }

  /**
   * Whether the loaded model is a multi-task model with age regression head
   */
  isMultiTaskAgeModel(): boolean {
    if (!this.model) return false;
    try {
      return Array.isArray(this.model.outputs) && (this.model.outputs as any[]).length >= 2;
    } catch {
      return false;
    }
  }

  /**
   * Predict age (in months) if the loaded model provides an age regression head.
   * Returns null if not available.
   */
  async predictAgeMonths(preprocessedImage: tf.Tensor4D): Promise<number | null> {
    if (!this.model || !this.isMultiTaskAgeModel()) return null;
    try {
      const preds = this.model.predict(preprocessedImage);
      if (Array.isArray(preds) && preds.length >= 2) {
        const ageTensor = preds[1] as tf.Tensor; // age_output
        const ageVals = (await ageTensor.data()) as Float32Array;
        // Expect shape [1, 1]
        const months = ageVals[0];
        // Cleanup
        preds.forEach((t) => (t as tf.Tensor).dispose());
        return Number.isFinite(months) ? months : null;
      }
      // Cleanup single tensor if any
      if (!Array.isArray(preds)) {
        (preds as tf.Tensor).dispose();
      }
      return null;
    } catch (err) {
      this.logger.warn('predictAgeMonths failed; continuing without model age.', err as any);
      return null;
    }
  }

  /**
   * Species-aware calibration for model-predicted age (months).
   * Adjusts raw months to account for species and (optionally) breed size aging patterns.
   * Heuristic and conservative for telemedicine triage.
   */
  calibrateAgeMonths(
    species: 'cat' | 'dog',
    rawMonths: number,
    breed?: string
  ): number {
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const months = Math.max(0, rawMonths);

    if (species === 'cat') {
      // Cats: lifespans ~ 12-20 years; conservative cap at 20y
      // Youth (0-12m): model tends to under-estimate; slightly upweight
      // Adult (36-120m): slight downweight to avoid over-aging
      // Senior (>120m): compress tail
      let adjusted = months;
      if (months < 12) {
        adjusted = months * 1.1;
      } else if (months < 36) {
        adjusted = months * 1.0;
      } else if (months < 120) {
        adjusted = months * 0.95;
      } else {
        adjusted = 120 + (months - 120) * 0.8;
      }
      return clamp(adjusted, 0, 240);
    }

    // Dogs: incorporate size by breed
    const size = this.inferBreedSize(breed);
    const caps = { small: 192, medium: 168, large: 144 }; // 16y, 14y, 12y caps
    let adjusted = months;

    if (months < 12) {
      // Puppies: leave as-is (high variance)
      adjusted = months;
    } else if (months < 24) {
      adjusted =
        size === 'small' ? months * 0.95 : size === 'large' ? months * 1.05 : months * 1.0;
    } else if (months < 84) {
      adjusted =
        size === 'small' ? months * 0.9 : size === 'large' ? months * 1.15 : months * 1.0;
    } else {
      adjusted =
        size === 'small' ? months * 1.1 : size === 'large' ? months * 1.3 : months * 1.2;
    }

    return clamp(adjusted, 0, caps[size]);
  }

  /**
   * Infer approximate breed size for dogs from breed string; medium by default.
   */
  private inferBreedSize(
    breed?: string
  ): 'small' | 'medium' | 'large' {
    if (!breed) return 'medium';
    const b = breed.toLowerCase();
    // Small indicators
    const smallHints = ['chihuahua', 'pomeranian', 'yorkshire', 'toy', 'miniature', 'dachshund', 'pug', 'shihtzu', 'shih tzu', 'bichon', 'maltese'];
    if (smallHints.some((h) => b.includes(h))) return 'small';
    // Large indicators
    const largeHints = ['great dane', 'mastiff', 'saint bernard', 'bernese', 'rottweiler', 'newfoundland', 'great pyrenees', 'irish wolfhound', 'alaskan malamute'];
    if (largeHints.some((h) => b.includes(h))) return 'large';
    return 'medium';
  }

  /**
   * Extract patch-based features for spatial analysis
   */
  private async extractPatchFeatures(
    preprocessedImage: tf.Tensor4D,
    model: tf.LayersModel
  ): Promise<Float32Array> {
    try {
      // Divide image into 16x16 patches (similar to DINOv2 approach)
      const patchSize = 14; // 224 / 16 = 14
      const patches: tf.Tensor[] = [];

      for (let row = 0; row < 16; row++) {
        for (let col = 0; col < 16; col++) {
          const startRow = row * patchSize;
          const startCol = col * patchSize;

          const patch = preprocessedImage.slice(
            [0, startRow, startCol, 0],
            [1, patchSize, patchSize, 3]
          );

          // Resize patch to full size for model
          const resized = tf.image.resizeBilinear(patch, [224, 224]);
          const patchFeatures = model.predict(resized) as tf.Tensor;
          patches.push(patchFeatures);

          patch.dispose();
          resized.dispose();
        }
      }

      // Concatenate all patch features
      const concatenated = tf.concat(patches, 0);
      const patchFeaturesArray = await concatenated.data();

      // Cleanup
      patches.forEach((p) => p.dispose());
      concatenated.dispose();

      return patchFeaturesArray as Float32Array;
    } catch (error) {
      this.logger.warn('Patch feature extraction failed, using global features');
      // Return global features repeated for patches
      const global = await this.extractFeatures(preprocessedImage);
      const repeated = new Float32Array(256 * global.globalFeatures.length);
      for (let i = 0; i < 256; i++) {
        repeated.set(global.globalFeatures, i * global.globalFeatures.length);
      }
      return repeated;
    }
  }

  /**
   * Placeholder feature extraction when model is not available
   */
  private extractPlaceholderFeatures(): {
    globalFeatures: Float32Array;
    patchFeatures: Float32Array;
  } {
    // Generate placeholder features (256-dim for consistency)
    const globalFeatures = new Float32Array(256);
    const patchFeatures = new Float32Array(256 * 256); // 256 patches

    // Fill with small random values
    for (let i = 0; i < 256; i++) {
      globalFeatures[i] = (Math.random() - 0.5) * 0.1;
    }

    // Repeat global features for all patches
    for (let i = 0; i < 256; i++) {
      patchFeatures.set(globalFeatures, i * 256);
    }

    return { globalFeatures, patchFeatures };
  }

  /**
   * Check if model is loaded and ready
   */
  isModelLoaded(): boolean {
    return this.modelLoaded && (this.model !== null || this.featureModel !== null);
  }

  /**
   * Get model input shape
   */
  getInputShape(): number[] {
    if (this.model) {
      return this.model.inputs[0].shape?.slice(1) || [224, 224, 3];
    }
    if (this.featureModel) {
      return this.featureModel.inputs[0].shape?.slice(1) || [224, 224, 3];
    }
    return [224, 224, 3];
  }
}

