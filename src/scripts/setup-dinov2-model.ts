/**
 * Setup script for TensorFlow.js skin detection model
 * This script sets up the directory structure and provides instructions
 * for training a custom model using TensorFlow.js
 */

import * as fs from 'fs';
import * as path from 'path';

const MODELS_DIR = path.join(process.cwd(), 'models', 'skin-detection-model');

async function setupTensorFlowModel() {
  console.log('Setting up TensorFlow.js model for skin disease detection...\n');

  // Create models directory
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
    console.log(`Created models directory: ${MODELS_DIR}`);
  }

  console.log(`
================================================================================
TensorFlow.js Skin Detection Model Setup
================================================================================

1. TRAINING YOUR OWN MODEL (Recommended):

   Step 1: Prepare Training Data
   - Organize images into directories by disease class:
     training_data/
       train/
         healthy/
         bacterial_dermatosis/
         fungal_infection/
         ...
       val/
         ...
       test/
         ...

   Step 2: Train the Model
   cd api
   NODE_OPTIONS="--max-old-space-size=8192" pnpm run ts-node src/scripts/train-skin-model.ts

   Step 3: Model will be saved to:
   ${MODELS_DIR}/

2. MODEL STRUCTURE:

   The trained model directory will contain:
   ${MODELS_DIR}/
   ├── model.json          # Model architecture
   ├── weights_*.bin       # Model weights (split files)
   └── model.json.meta     # Metadata

3. DISEASE PROTOTYPES:

   Disease prototypes are used for zero-shot classification.
   They can be generated from the trained model:
   
   - After training, extract features for reference images
   - Compute average features per class
   - Update constants/disease-prototypes.ts with real values

4. VERIFICATION:

   After training, start the API and check logs for:
   "TensorFlow.js model loaded successfully"

================================================================================

For now, the system will use placeholder features until a model is trained.
The API will still function but with reduced accuracy.

To proceed:
1. Collect labeled training images
2. Organize them into the directory structure above
3. Run the training script
4. Restart the API server

The system will automatically detect and use the trained model!

================================================================================
`);

  // Create a README
  const readmePath = path.join(MODELS_DIR, 'README.md');
  const readmeContent = `# TensorFlow.js Skin Detection Model

This directory should contain the trained TensorFlow.js model for skin disease detection.

## Model Training

To train a custom model:

\`\`\`bash
# Prepare training data (organize images by class)
# training_data/train/healthy/
# training_data/train/bacterial_dermatosis/
# etc.

# Train the model
cd api
NODE_OPTIONS="--max-old-space-size=8192" pnpm run ts-node src/scripts/train-skin-model.ts
\`\`\`

## Required Files

After training, this directory should contain:
- \`model.json\` - Model architecture definition
- \`weights_*.bin\` - Model weights (may be split into multiple files)

## Model Architecture

The model uses a custom CNN architecture optimized for skin disease classification:
- 4 convolutional blocks with batch normalization
- Global average pooling
- Dense layers with dropout for regularization
- Softmax output for multi-class classification

## Usage

The model is automatically loaded by TensorFlowFeatureExtractorService on API startup.
If no trained model is found, the system falls back to placeholder features.
`;

  fs.writeFileSync(readmePath, readmeContent);
  console.log(`Created README at ${readmePath}`);
  console.log('\nSetup script completed. See instructions above for manual model setup.\n');
}

// Run setup
setupTensorFlowModel().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});

