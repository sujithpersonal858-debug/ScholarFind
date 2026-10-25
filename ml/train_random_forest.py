"""
================================================================================
ScholarFind: Machine Learning Module - Random Forest Model Training
================================================================================

1. ACADEMIC INTEGRITY & DATASET DISCLOSURE:
------------------------------------------
Due to statutory privacy regulations (Digital Personal Data Protection Act,
GDPR, and institutional confidentiality), verified individual student
application records containing household income, affirmative action caste
identities, and governmental scholarship grant decisions are strictly private
and cannot be released publicly.

Consequently, this dataset ('scholarship_match_dataset.csv') was generated using
a calibrated multi-criteria simulation representing 250 diverse synthetic
student profiles interacting with 20 real-world Indian scholarship schemes
(Central NSP, AICTE Pragati/Saksham, State SSPs, MahaDBT, Corporate CSRs).

Target Label Definition:
  - `target_match` = 1 (High Fit Match): The student satisfies ALL mandatory
    eligibility criteria (marks >= min, income <= max, domicile, course, caste,
    gender, disability) AND scores highly on competitive merit and socio-economic
    priority weighting.
  - `target_match` = 0 (Low Fit / Ineligible): The student either fails at least
    one mandatory criterion (hard failure) OR falls below the competitive
    threshold among eligible candidates.

DISCLAIMER:
  Synthetic benchmark metrics demonstrate algorithmic validity, model
  convergence, and feature importance within this defined decision boundary.
  They must NOT be claimed as empirical real-world scholarship award accuracy.

2. DATA LEAKAGE MITIGATION:
---------------------------
To prevent data leakage, student interactions are partitioned using
`GroupShuffleSplit` grouped strictly by `student_id`. This guarantees that
every synthetic student in the held-out test split is completely unseen during
model training.

3. MODEL ARCHITECTURE & EXPORT:
-------------------------------
  - Algorithm: Random Forest Classifier (scikit-learn `RandomForestClassifier`)
  - Trees: 50 estimators, max depth: 8, balanced class weighting.
  - Artifacts:
      a) `ml/random_forest_model.joblib` (Python serialization)
      b) `ml/model.json` (Full decision tree hierarchy for native Node.js inference)
      c) `ml/feature_schema.json` (Feature definitions & metadata)
================================================================================
"""

import os
import sys
import json
import numpy as np

# Verify required third-party scientific libraries
try:
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import GroupShuffleSplit
    from sklearn.metrics import (
        accuracy_score,
        precision_score,
        recall_score,
        f1_score,
        confusion_matrix,
        classification_report,
    )
    from sklearn.dummy import DummyClassifier
    import joblib
except ImportError as err:
    print(f"\n[ERROR] Missing required Python package: {err.name}")
    print("Please install required dependencies by running:")
    print("    pip install scikit-learn pandas numpy joblib")
    sys.exit(1)

# Feature columns used for training the Random Forest
FEATURE_COLUMNS = [
    "marks_margin",             # Student marks - scholarship min marks (float)
    "income_headroom_ratio",    # (max_income - income) / max_income (float)
    "course_match",             # Binary (1 = eligible course, 0 = ineligible)
    "qualification_match",      # Binary (1 = eligible degree level, 0 = ineligible)
    "state_match",              # Binary (1 = eligible domicile state, 0 = ineligible)
    "category_match",           # Binary (1 = eligible caste/category, 0 = ineligible)
    "gender_match",             # Binary (1 = eligible gender, 0 = ineligible)
    "disability_match",         # Binary (1 = satisfies disability rule, 0 = fails)
    "is_first_generation",      # Binary (1 = first-gen learner, 0 = not)
    "hard_criteria_passed",     # Binary (1 = all mandatory gates passed, 0 = any failed)
]

TARGET_COLUMN = "target_match"
GROUP_COLUMN = "student_id"


def export_forest_to_json(rf_model, feature_names, class_names, output_path):
    """
    Exports scikit-learn RandomForestClassifier trees to a pure JSON format.
    Preserves exact tree structure, splitting thresholds, feature indices,
    and node values for 100% faithful client/server-side JavaScript inference.
    """
    forest_dict = {
        "n_estimators": len(rf_model.estimators_),
        "n_classes": len(class_names),
        "classes": [int(c) for c in class_names],
        "feature_names": feature_names,
        "n_features": len(feature_names),
        "trees": [],
    }

    for idx, tree in enumerate(rf_model.estimators_):
        tree_ = tree.tree_
        tree_dict = {
            "tree_index": idx,
            "node_count": int(tree_.node_count),
            "children_left": [int(x) for x in tree_.children_left],
            "children_right": [int(x) for x in tree_.children_right],
            "feature": [int(x) for x in tree_.feature],
            "threshold": [float(x) for x in tree_.threshold],
            "value": [
                [float(v) for v in node_val[0]] for node_val in tree_.value
            ],
        }
        forest_dict["trees"].append(tree_dict)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(forest_dict, f, indent=2)

    print(f"Exported tree-level model representation to: {output_path}")


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, "scholarship_match_dataset.csv")

    if not os.path.exists(dataset_path):
        print(f"[ERROR] Dataset not found at: {dataset_path}")
        print("Please run `node ml/generate_dataset.js` to create the demonstration dataset first.")
        sys.exit(1)

    print("=================================================================")
    print(" ScholarFind: Random Forest Model Training & Evaluation Module")
    print("=================================================================\n")

    # 1. Load Dataset
    print(f"[1/6] Loading demonstration dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"      Total records loaded: {len(df)}")
    print(f"      Unique students:      {df[GROUP_COLUMN].nunique()}")
    print(f"      Target distribution:  {dict(df[TARGET_COLUMN].value_counts())}")

    # 2. Check Class Balance
    n_positive = (df[TARGET_COLUMN] == 1).sum()
    n_negative = (df[TARGET_COLUMN] == 0).sum()
    pct_positive = (n_positive / len(df)) * 100
    print(f"      Class balance: {n_positive} positive ({pct_positive:.1f}%), {n_negative} negative ({100 - pct_positive:.1f}%)\n")

    # 3. Grouped Train/Test Split (Prevents Student Leakage)
    print("[2/6] Performing Grouped Train/Test Split on `student_id` (test_size=0.25, random_state=42)...")
    splitter = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
    train_idx, test_idx = next(splitter.split(df, groups=df[GROUP_COLUMN]))

    train_df = df.iloc[train_idx].copy()
    test_df = df.iloc[test_idx].copy()

    # Verify no student overlap
    train_students = set(train_df[GROUP_COLUMN].unique())
    test_students = set(test_df[GROUP_COLUMN].unique())
    overlap = train_students.intersection(test_students)
    assert len(overlap) == 0, "Data leakage detected: students overlap across train/test splits!"

    print(f"      Training set size:  {len(train_df)} rows ({len(train_students)} unique students)")
    print(f"      Test set size:      {len(test_df)} rows ({len(test_students)} unique students)")
    print(f"      Student overlap:    {len(overlap)} (Clean split, 0 data leakage)\n")

    X_train = train_df[FEATURE_COLUMNS]
    y_train = train_df[TARGET_COLUMN]
    X_test = test_df[FEATURE_COLUMNS]
    y_test = test_df[TARGET_COLUMN]

    # 4. Train Baseline Classifiers for Comparison
    print("[3/6] Evaluating Baseline Models for Benchmark Comparison...")
    # Baseline A: Most Frequent Class Dummy
    dummy = DummyClassifier(strategy="most_frequent")
    dummy.fit(X_train, y_train)
    dummy_pred = dummy.predict(X_test)
    dummy_acc = accuracy_score(y_test, dummy_pred)
    dummy_f1 = f1_score(y_test, dummy_pred, zero_division=0)
    print(f"      Baseline A (Majority Class): Accuracy = {dummy_acc:.4f}, F1-Score = {dummy_f1:.4f}")

    # Baseline B: Simple Heuristic Rule (predict 1 if hard_criteria_passed == 1 and marks_margin >= 5)
    heuristic_pred = ((X_test["hard_criteria_passed"] == 1) & (X_test["marks_margin"] >= 5.0)).astype(int)
    heuristic_acc = accuracy_score(y_test, heuristic_pred)
    heuristic_f1 = f1_score(y_test, heuristic_pred, zero_division=0)
    print(f"      Baseline B (Static Heuristic): Accuracy = {heuristic_acc:.4f}, F1-Score = {heuristic_f1:.4f}\n")

    # 5. Train Random Forest Classifier
    print("[4/6] Training scikit-learn RandomForestClassifier...")
    print("      Parameters: n_estimators=50, max_depth=8, class_weight='balanced', random_state=42")
    rf_clf = RandomForestClassifier(
        n_estimators=50,
        max_depth=8,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    rf_clf.fit(X_train, y_train)
    print("      Model training complete.\n")

    # 6. Evaluation on Held-Out Test Data
    print("[5/6] Evaluating Random Forest on Held-Out Test Set (Unseen Students):")
    y_pred = rf_clf.predict(X_test)
    y_proba = rf_clf.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print("-----------------------------------------------------------------")
    print(f" Accuracy:       {acc * 100:.2f}%")
    print(f" Precision:      {prec * 100:.2f}%")
    print(f" Recall:         {rec * 100:.2f}%")
    print(f" F1-Score:       {f1 * 100:.2f}%")
    print("-----------------------------------------------------------------")
    print("\nConfusion Matrix (Test Set):")
    print(f"  [TN: {cm[0, 0]:4d} | FP: {cm[0, 1]:4d}]")
    print(f"  [FN: {cm[1, 0]:4d} | TP: {cm[1, 1]:4d}]")

    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Class 0 (Low Fit)", "Class 1 (Match)"]))

    print("Feature Importances:")
    importances = rf_clf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    for rank, idx in enumerate(sorted_idx, 1):
        feat = FEATURE_COLUMNS[idx]
        imp = importances[idx]
        bar = "#" * int(imp * 40)
        print(f"  {rank:2d}. {feat:25s}: {imp:.4f} {bar}")

    # 7. Save Artifacts
    print("\n[6/6] Saving Model Artifacts...")
    joblib_path = os.path.join(base_dir, "random_forest_model.joblib")
    joblib.dump(rf_clf, joblib_path)
    print(f"      Saved Python model artifact: {joblib_path}")

    json_path = os.path.join(base_dir, "model.json")
    export_forest_to_json(rf_clf, FEATURE_COLUMNS, rf_clf.classes_, json_path)

    print("\n=================================================================")
    print(" Training Module Execution Complete.")
    print("=================================================================")


if __name__ == "__main__":
    main()
