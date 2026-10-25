
const fs = require('fs');
const path = require('path');

const modelPath = path.resolve(__dirname, '../../../ml/model.json');

let model = null;

function loadModel() {
  if (model) return model;

  try {
    model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    return model;
  } catch (error) {
    console.error('Unable to load ML model:', error.message);
    return null;
  }
}

function predictMatchScore(features) {
  const trainedModel = loadModel();

  if (!trainedModel || !Array.isArray(trainedModel.trees)) {
    return null;
  }

  const featureNames = trainedModel.feature_names;
  let totalScore = 0;
  let validTrees = 0;

  for (const tree of trainedModel.trees) {
    let node = 0;
    let steps = 0;

    while (
      tree.children_left[node] !== tree.children_right[node] &&
      steps < tree.node_count
    ) {
      const featureIndex = tree.feature[node];
      const featureName = featureNames[featureIndex];
      const featureValue = Number(features[featureName] ?? 0);

      node =
        featureValue <= tree.threshold[node]
          ? tree.children_left[node]
          : tree.children_right[node];

      steps++;
    }

    const values = tree.value[node];
    if (!values || values.length < 2) continue;

    const total = values.reduce((sum, value) => sum + value, 0);
    if (total <= 0) continue;

    totalScore += (values[1] / total) * 100;
    validTrees++;
  }

  return validTrees > 0
    ? Math.round(totalScore / validTrees)
    : null;
}

module.exports = { predictMatchScore };
