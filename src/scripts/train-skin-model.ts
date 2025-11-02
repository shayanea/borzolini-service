/**
 * Train skin disease detection model using TensorFlow.js
 * This script trains a CNN model for pet skin disease classification
 */

import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import * as Jimp from 'jimp';

interface TrainingConfig {
  modelType: 'mobilenet' | 'custom_cnn';
  numClasses: number;
  batchSize: number;
  epochs: number;
  learningRate: number;
  dataPath: string;
  outputPath: string;
  imageSize: number;
}

class SkinDiseaseTrainer {
  private model: tf.LayersModel | null = null;
  private config: TrainingConfig;

  constructor(config: TrainingConfig) {
    this.config = config;
  }

  /**
   * Create model architecture
   */
  async createModel(): Promise<tf.LayersModel> {
    console.log(`Creating ${this.config.modelType} model...`);

    if (this.config.modelType === 'mobilenet') {
      return await this.createMobileNetModel();
    } else {
      return await this.createCustomCNNModel();
    }
  }

  /**
   * Create custom CNN model
   */
  private async createCustomCNNModel(): Promise<tf.LayersModel> {
    const model = tf.sequential();

    // Input: 224x224x3
    // Conv Block 1
    model.add(
      tf.layers.conv2d({
        inputShape: [this.config.imageSize, this.config.imageSize, 3],
        filters: 32,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Conv Block 2
    model.add(
      tf.layers.conv2d({
        filters: 64,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Conv Block 3
    model.add(
      tf.layers.conv2d({
        filters: 128,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Conv Block 4
    model.add(
      tf.layers.conv2d({
        filters: 256,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      })
    );
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.globalAveragePooling2d());

    // Dense layers
    model.add(
      tf.layers.dense({
        units: 512,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      })
    );
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(
      tf.layers.dense({
        units: 256,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      })
    );
    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(
      tf.layers.dense({
        units: this.config.numClasses,
        activation: 'softmax',
      })
    );

    // Compile model
    model.compile({
      optimizer: tf.train.adam(this.config.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    console.log('Custom CNN model created');
    model.summary();

    return model;
  }

  /**
   * Create MobileNetV2-based model with transfer learning
   * Uses pre-trained weights from TensorFlow Hub
   */
  private async createMobileNetModel(): Promise<tf.LayersModel> {
    console.log('Loading MobileNetV2 base model for transfer learning...');
    
    try {
      // Try to load pre-trained MobileNetV2 from TensorFlow.js models
      // Note: This requires internet connection or cached model
      const baseModel = await tf.loadLayersModel(
        'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v2_1.0_224/model.json'
      );
      
      console.log('MobileNetV2 loaded successfully, creating transfer learning model...');
      
      // Find the layer before the final dense/classification layer
      // MobileNet typically has the feature extractor ending before the final dense layer
      const numLayers = baseModel.layers.length;
      const featureLayerIndex = numLayers - 2; // Usually second-to-last layer
      const baseOutput = baseModel.layers[featureLayerIndex].output;
      
      // Freeze base model layers (fine-tuning strategy)
      baseModel.layers.forEach((layer) => {
        layer.trainable = false;
      });
      
      // Create new classification head
      let x = tf.layers.globalAveragePooling2d().apply(baseOutput) as tf.SymbolicTensor;
      
      // Add dropout for regularization
      x = tf.layers.dropout({ rate: 0.5 }).apply(x) as tf.SymbolicTensor;
      
      // Dense layers for classification
      x = tf.layers.dense({
        units: 512,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      }).apply(x) as tf.SymbolicTensor;
      
      x = tf.layers.batchNormalization().apply(x) as tf.SymbolicTensor;
      x = tf.layers.dropout({ rate: 0.3 }).apply(x) as tf.SymbolicTensor;
      
      x = tf.layers.dense({
        units: 256,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      }).apply(x) as tf.SymbolicTensor;
      
      const output = tf.layers.dense({
        units: this.config.numClasses,
        activation: 'softmax',
      }).apply(x) as tf.SymbolicTensor;
      
      const model = tf.model({ inputs: baseModel.inputs, outputs: output });
      
      // Compile with lower learning rate for fine-tuning
      model.compile({
        optimizer: tf.train.adam(this.config.learningRate * 0.1), // Lower LR for transfer learning
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });
      
      console.log('Transfer learning model created');
      model.summary();
      
      return model;
    } catch (error) {
      console.warn('Failed to load MobileNetV2, falling back to custom CNN:', error);
      console.warn('For better accuracy, ensure you have internet connection or cached MobileNet model');
      return this.createCustomCNNModel();
    }
  }

  /**
   * Load and preprocess images from directory
   */
  async loadImagesFromDirectory(
    dirPath: string,
    classToIndex: Map<string, number>,
    applyAugmentation: boolean = true
  ): Promise<{ images: Float32Array[]; labels: number[] }> {
    const images: Float32Array[] = [];
    const labels: number[] = [];

    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory not found: ${dirPath}`);
      return { images, labels };
    }

    const classes = fs
      .readdirSync(dirPath)
      .filter((item) => {
        const itemPath = path.join(dirPath, item);
        return fs.statSync(itemPath).isDirectory();
      });

    for (const className of classes) {
      const classIndex = classToIndex.get(className);
      if (classIndex === undefined) {
        console.warn(`Unknown class: ${className}`);
        continue;
      }

      const classPath = path.join(dirPath, className);
      const imageFiles = fs
        .readdirSync(classPath)
        .filter((f) => f.match(/\.(jpg|jpeg|png)$/i));

      console.log(`Loading ${imageFiles.length} images from ${className}...`);

      for (const imageFile of imageFiles) {
        try {
          const imagePath = path.join(classPath, imageFile);
          const imageData = await this.loadAndPreprocessImage(imagePath, applyAugmentation);
          images.push(imageData);
          labels.push(classIndex);
        } catch (error) {
          console.warn(`Failed to load ${imageFile}:`, error);
        }
      }
    }

    return { images, labels };
  }

  /**
   * Load and preprocess single image with enhanced augmentation
   */
  private async loadAndPreprocessImage(
    imagePath: string,
    applyAugmentation: boolean = true
  ): Promise<Float32Array> {
    const image = await Jimp.read(imagePath);
    
    // Always resize first
    image.resize(this.config.imageSize, this.config.imageSize);

    // Enhanced data augmentation (only for training data)
    if (applyAugmentation) {
      // Horizontal flip (50% chance)
      if (Math.random() > 0.5) {
        image.flip(true, false);
      }

      // Vertical flip (30% chance) - sometimes useful for skin images
      if (Math.random() > 0.7) {
        image.flip(false, true);
      }

      // Rotation (-20 to +20 degrees, 60% chance)
      if (Math.random() > 0.4) {
        const angle = (Math.random() - 0.5) * 40;
        image.rotate(angle);
      }

      // Brightness adjustment (±20%, 50% chance)
      if (Math.random() > 0.5) {
        const brightness = 0.8 + Math.random() * 0.4; // 0.8-1.2
        image.brightness(brightness);
      }

      // Contrast adjustment (±15%, 50% chance)
      if (Math.random() > 0.5) {
        const contrast = 0.85 + Math.random() * 0.3; // 0.85-1.15
        image.contrast(contrast);
      }

      // Color saturation adjustment (±20%, 40% chance)
      if (Math.random() > 0.6) {
        const saturation = 0.8 + Math.random() * 0.4;
        image.color([
          { apply: 'saturate', params: [saturation] }
        ]);
      }

      // Add slight noise (20% chance) - helps with robustness
      if (Math.random() > 0.8) {
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
          const noise = (Math.random() - 0.5) * 10;
          image.bitmap.data[idx] = Math.max(0, Math.min(255, image.bitmap.data[idx] + noise)); // R
          image.bitmap.data[idx + 1] = Math.max(0, Math.min(255, image.bitmap.data[idx + 1] + noise)); // G
          image.bitmap.data[idx + 2] = Math.max(0, Math.min(255, image.bitmap.data[idx + 2] + noise)); // B
        });
      }
    }

    // Convert to normalized pixel array (ImageNet normalization)
    const pixels = new Float32Array(
      this.config.imageSize * this.config.imageSize * 3
    );
    let idx = 0;

    image.scan(0, 0, this.config.imageSize, this.config.imageSize, (x, y) => {
      const pixel = Jimp.intToRGBA(image.getPixelColor(x, y));
      // ImageNet normalization
      pixels[idx++] = (pixel.r / 255.0 - 0.485) / 0.229;
      pixels[idx++] = (pixel.g / 255.0 - 0.456) / 0.224;
      pixels[idx++] = (pixel.b / 255.0 - 0.406) / 0.225;
    });

    return pixels;
  }

  /**
   * Convert images to tensor
   */
  private imagesToTensor(images: Float32Array[]): tf.Tensor4D {
    if (images.length === 0) {
      throw new Error('No images to process');
    }

    const buffer = new Float32Array(
      images.length * this.config.imageSize * this.config.imageSize * 3
    );
    images.forEach((img, i) => {
      buffer.set(img, i * this.config.imageSize * this.config.imageSize * 3);
    });
    return tf.tensor4d(buffer, [
      images.length,
      this.config.imageSize,
      this.config.imageSize,
      3,
    ]);
  }

  /**
   * Convert labels to one-hot encoded tensor
   */
  private labelsToTensor(labels: number[], numClasses: number): tf.Tensor2D {
    return tf.tidy(() => {
      const labelsTensor = tf.tensor1d(labels, 'int32');
      return tf.oneHot(labelsTensor, numClasses);
    });
  }

  /**
   * Calculate class weights for imbalanced datasets
   */
  private calculateClassWeights(labels: number[]): { [key: number]: number } {
    const classCounts: { [key: number]: number } = {};

    labels.forEach(label => {
      classCounts[label] = (classCounts[label] || 0) + 1;
    });

    const total = labels.length;
    const numClasses = Object.keys(classCounts).length;

    const weights: { [key: number]: number } = {};
    Object.keys(classCounts).forEach(key => {
      const classIndex = parseInt(key);
      // Inverse frequency weighting - gives more weight to underrepresented classes
      weights[classIndex] = total / (numClasses * classCounts[classIndex]);
    });

    return weights;
  }

  /**
   * Calculate detailed metrics per class (precision, recall, F1)
   */
  private async evaluateModel(
    testData: tf.Tensor4D,
    testLabels: tf.Tensor2D,
    classNames: string[]
  ): Promise<void> {
    if (!this.model) {
      throw new Error('Model not trained yet');
    }

    console.log('\n=== Evaluating Model on Test Set ===');
    const predictions = this.model.predict(testData) as tf.Tensor2D;
    const predArray = await predictions.array() as number[][];
    const trueLabels = await testLabels.array() as number[][];

    // Calculate per-class metrics
    const metrics: { [className: string]: { precision: number; recall: number; f1: number; support: number } } = {};

    for (let i = 0; i < classNames.length; i++) {
      let truePositives = 0;
      let falsePositives = 0;
      let falseNegatives = 0;
      let support = 0;

      predArray.forEach((pred, idx) => {
        const predClass = pred.indexOf(Math.max(...pred));
        const trueClass = trueLabels[idx].indexOf(1);
        
        support += trueClass === i ? 1 : 0;

        if (predClass === i && trueClass === i) truePositives++;
        else if (predClass === i && trueClass !== i) falsePositives++;
        else if (predClass !== i && trueClass === i) falseNegatives++;
      });

      const precision = truePositives / (truePositives + falsePositives) || 0;
      const recall = truePositives / (truePositives + falseNegatives) || 0;
      const f1 = 2 * (precision * recall) / (precision + recall) || 0;

      metrics[classNames[i]] = { precision, recall, f1, support };
    }

    // Calculate overall metrics
    let totalTruePositives = 0;

    predArray.forEach((pred, idx) => {
      const predClass = pred.indexOf(Math.max(...pred));
      const trueClass = trueLabels[idx].indexOf(1);
      if (predClass === trueClass) totalTruePositives++;
    });

    const overallAccuracy = totalTruePositives / predArray.length;
    const macroPrecision = Object.values(metrics).reduce((sum, m) => sum + m.precision, 0) / classNames.length;
    const macroRecall = Object.values(metrics).reduce((sum, m) => sum + m.recall, 0) / classNames.length;
    const macroF1 = Object.values(metrics).reduce((sum, m) => sum + m.f1, 0) / classNames.length;

    console.log('\n=== Per-Class Metrics ===');
    console.log('Class\t\tPrecision\tRecall\t\tF1-Score\tSupport');
    console.log('─'.repeat(70));
    Object.entries(metrics).forEach(([className, metric]) => {
      console.log(
        `${className.padEnd(15)}\t${metric.precision.toFixed(4)}\t\t${metric.recall.toFixed(4)}\t\t${metric.f1.toFixed(4)}\t\t${metric.support}`
      );
    });

    console.log('\n=== Overall Metrics ===');
    console.log(`Overall Accuracy: ${(overallAccuracy * 100).toFixed(2)}%`);
    console.log(`Macro Precision: ${(macroPrecision * 100).toFixed(2)}%`);
    console.log(`Macro Recall: ${(macroRecall * 100).toFixed(2)}%`);
    console.log(`Macro F1-Score: ${(macroF1 * 100).toFixed(2)}%`);

    predictions.dispose();
  }

  /**
   * Train the model
   */
  async train(): Promise<void> {
    console.log('Starting training...\n');

    // Create model
    this.model = await this.createModel();

    // Load dataset
    const classes = fs.readdirSync(path.join(this.config.dataPath, 'train'));
    const classToIndex = new Map(classes.map((cls, idx) => [cls, idx]));
    console.log(`Found ${classes.length} classes: ${classes.join(', ')}\n`);

    const { images: trainImages, labels: trainLabels } =
      await this.loadImagesFromDirectory(
        path.join(this.config.dataPath, 'train'),
        classToIndex,
        true // Apply augmentation for training
      );
    const { images: valImages, labels: valLabels } =
      await this.loadImagesFromDirectory(
        path.join(this.config.dataPath, 'val'),
        classToIndex,
        false // No augmentation for validation
      );
    
    // Load test set if available
    let testImages: Float32Array[] = [];
    let testLabels: number[] = [];
    const testPath = path.join(this.config.dataPath, 'test');
    if (fs.existsSync(testPath)) {
      const testData = await this.loadImagesFromDirectory(
        testPath,
        classToIndex,
        false // No augmentation for test
      );
      testImages = testData.images;
      testLabels = testData.labels;
    }

    if (trainImages.length === 0) {
      throw new Error('No training images found!');
    }

    console.log(
      `\nLoaded ${trainImages.length} training images, ${valImages.length} validation images\n`
    );

    // Convert to tensors
    const trainData = this.imagesToTensor(trainImages);
    const trainLabelsTensor = this.labelsToTensor(
      trainLabels,
      this.config.numClasses
    );
    const valData =
      valImages.length > 0
        ? this.imagesToTensor(valImages)
        : tf.tensor4d([], [0, this.config.imageSize, this.config.imageSize, 3]);
    const valLabelsTensor =
      valLabels.length > 0
        ? this.labelsToTensor(valLabels, this.config.numClasses)
        : tf.tensor2d([], [0, this.config.numClasses]);

    // Calculate class weights for imbalanced datasets
    const classWeights = this.calculateClassWeights(trainLabels);
    console.log('\n=== Class Distribution ===');
    const classCounts: { [key: number]: number } = {};
    trainLabels.forEach(label => {
      classCounts[label] = (classCounts[label] || 0) + 1;
    });
    const classNames = Array.from(classToIndex.keys());
    classNames.forEach((className, idx) => {
      const count = classCounts[idx] || 0;
      const weight = classWeights[idx] || 1;
      console.log(`${className}: ${count} samples, weight: ${weight.toFixed(3)}`);
    });

    // Enhanced training callbacks with learning rate scheduling and early stopping
    const trainingState = {
      bestValAcc: 0,
      epochsWithoutImprovement: 0,
      patience: 15, // Early stopping patience
      initialLearningRate: this.config.learningRate,
    };

    const callbacks = {
      onEpochEnd: async (epoch: number, logs: any) => {
        const valAcc = logs.val_acc || 0;
        const currentLR = (this.model!.optimizer as any).learningRate || trainingState.initialLearningRate;
        
        console.log(
          `Epoch ${epoch + 1}/${this.config.epochs} - ` +
            `loss: ${logs.loss.toFixed(4)}, ` +
            `acc: ${logs.acc.toFixed(4)}, ` +
            `val_loss: ${logs.val_loss?.toFixed(4) || 'N/A'}, ` +
            `val_acc: ${logs.val_acc?.toFixed(4) || 'N/A'}, ` +
            `LR: ${currentLR.toFixed(6)}`
        );

        // Learning rate scheduling (reduce on plateau)
        if ((epoch + 1) % 10 === 0 && epoch > 0) {
          const newLR = currentLR * 0.5; // Reduce by 50% every 10 epochs
          (this.model!.optimizer as any).learningRate = newLR;
          console.log(`\n📉 Learning rate reduced to: ${newLR.toFixed(6)}`);
        }

        // Save best model
        if (valAcc > trainingState.bestValAcc) {
          const improvement = valAcc - trainingState.bestValAcc;
          trainingState.bestValAcc = valAcc;
          trainingState.epochsWithoutImprovement = 0;
          await this.saveModel('best');
          console.log(`✅ New best model saved! Validation accuracy: ${(trainingState.bestValAcc * 100).toFixed(2)}% (+${(improvement * 100).toFixed(2)}%)`);
        } else {
          trainingState.epochsWithoutImprovement++;
        }

        // Early stopping check
        if (trainingState.epochsWithoutImprovement >= trainingState.patience && epoch > 10) {
          console.log(`\n⏹️  Early stopping triggered. No improvement for ${trainingState.patience} epochs.`);
          // Note: TensorFlow.js doesn't support early stopping callback directly
          // This just logs - you'd need to manually stop or return from fit
        }

        // Save checkpoints
        if ((epoch + 1) % 10 === 0) {
          await this.saveModel(`epoch-${epoch + 1}`);
        }
      },
    };

    // Train model with class weights
    await this.model.fit(trainData, trainLabelsTensor, {
      batchSize: this.config.batchSize,
      epochs: this.config.epochs,
      validationData:
        valImages.length > 0 ? [valData, valLabelsTensor] : undefined,
      shuffle: true,
      callbacks,
      classWeight: classWeights, // Handle class imbalance
    });

    // Evaluate on test set if available
    if (testImages.length > 0) {
      console.log(`\nEvaluating on ${testImages.length} test images...`);
      const testData = this.imagesToTensor(testImages);
      const testLabelsTensor = this.labelsToTensor(testLabels, this.config.numClasses);
      
      await this.evaluateModel(testData, testLabelsTensor, classNames);
      
      testData.dispose();
      testLabelsTensor.dispose();
    }

    // Cleanup tensors
    trainData.dispose();
    trainLabelsTensor.dispose();
    if (valImages.length > 0) {
      valData.dispose();
      valLabelsTensor.dispose();
    }

    console.log('\n✅ Training complete!');
    console.log(`Best validation accuracy: ${(trainingState.bestValAcc * 100).toFixed(2)}%`);
  }

  /**
   * Save model
   */
  async saveModel(suffix: string = ''): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }

    const modelPath = path.join(
      this.config.outputPath,
      suffix ? `model-${suffix}` : 'model'
    );
    fs.mkdirSync(modelPath, { recursive: true });

    await this.model.save(`file://${path.resolve(modelPath)}`);
    console.log(`Model saved to: ${modelPath}`);
  }
}

// Main execution
async function main() {
  const config: TrainingConfig = {
    modelType: 'mobilenet', // Use transfer learning for better accuracy
    numClasses: 10, // Adjust based on your disease classes
    batchSize: 32, // Reduce to 16 if you encounter memory issues
    epochs: 100, // Increased for better convergence
    learningRate: 0.0001, // Lower learning rate for transfer learning (will be further reduced during training)
    dataPath: './training_data', // Should contain train/, val/, test/ directories
    outputPath: './models/skin-detection-model',
    imageSize: 224,
  };

  // Check if data directory exists
  if (!fs.existsSync(config.dataPath)) {
    console.error(
      `\nError: Data directory not found: ${config.dataPath}\n` +
        `Please organize your training data as follows:\n` +
        `  ${config.dataPath}/\n` +
        `    train/\n` +
        `      healthy/\n` +
        `      bacterial_dermatosis/\n` +
        `      ...\n` +
        `    val/\n` +
        `      ...\n` +
        `    test/\n` +
        `      ...\n`
    );
    process.exit(1);
  }

  const trainer = new SkinDiseaseTrainer(config);

  try {
    await trainer.train();
    await trainer.saveModel();
    console.log('\n✅ Training completed successfully!');
  } catch (error) {
    console.error('\n❌ Training failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { SkinDiseaseTrainer, TrainingConfig };

