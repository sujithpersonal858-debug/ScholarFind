# ScholarFind Machine Learning Module (Random Forest)

This module provides a reproducible Random Forest recommendation pipeline designed to complement ScholarFind's deterministic rule-based eligibility engine.

---

## 1. Academic Integrity & Dataset Disclosure

- **Privacy Statement:** Real-world scholarship award decisions and applicant dossiers contain protected personal data (household income, affirmative action caste data, and disability certifications under the Digital Personal Data Protection Act and institutional confidentiality).
- **Simulated Demonstration Data:** The dataset `scholarship_match_dataset.csv` contains 3,009 simulated interaction records generated across 250 diverse synthetic student profiles and 20 verified Indian scholarship schemes (Central NSP, AICTE, State SSPs, Corporate CSRs).
- **Target Label Definition (`target_match`):**
  - `1` (**High Fit Match**): The candidate satisfies **all** mandatory eligibility requirements (hard gates) AND exhibits strong academic merit margins and socio-economic priority weighting.
  - `0` (**Low Fit / Ineligible**): The candidate either fails one or more mandatory criteria (strict exclusion) OR falls below the competitive percentile among eligible applicants.
- **Academic Limitation Notice:** Synthetic benchmark metrics demonstrate internal consistency and mathematical convergence. They do **not** represent real-world empirical scholarship award rates.

---

## 2. Feature Schema & Engineering

| Feature Name | Type | Description |
| :--- | :--- | :--- |
| `marks_margin` | Float | Student marks (%) minus scholarship minimum marks threshold. Negative if below threshold. |
| `income_headroom_ratio` | Float | `(scholarship_max_income - student_income) / scholarship_max_income`. Higher means greater economic need. |
| `course_match` | Binary | `1` if student course is eligible or scheme is All-Course; `0` otherwise. |
| `qualification_match` | Binary | `1` if student education level matches scheme; `0` otherwise. |
| `state_match` | Binary | `1` if student domicile matches or scheme is All-India; `0` otherwise. |
| `category_match` | Binary | `1` if student caste/category matches or scheme is open; `0` otherwise. |
| `gender_match` | Binary | `1` if student gender matches or scheme is open to all; `0` otherwise. |
| `disability_match` | Binary | `1` if scheme does not require disability OR student meets benchmark %; `0` otherwise. |
| `is_first_generation` | Binary | `1` if student is a first-generation college learner; `0` otherwise. |
| `hard_criteria_passed` | Binary | `1` if all mandatory criteria are met; `0` if any single mandatory criterion fails. |

---

## 3. Data Leakage Prevention

- Interactions are partitioned using `GroupShuffleSplit` on `student_id` (75% train / 25% test).
- This guarantees that **no synthetic student in the test set appears anywhere in the training set**.
- The model is evaluated on completely unseen students, matching production behavior where new users register on ScholarFind.

---

## 4. Setup & Execution Instructions

### Prerequisites
1. Install **Python 3.10+** (download from [python.org](https://www.python.org/downloads/) or Microsoft Store).
2. Ensure Python is added to your system `PATH`.

### Step 1: Install Dependencies
Open your PowerShell or Command Prompt:

```powershell
pip install -r ml/requirements.txt
```

*(Or manually: `pip install scikit-learn pandas numpy joblib`)*

### Step 2: Run Training & Evaluation
```powershell
python ml/train_random_forest.py
```

### Outputs Generated:
1. `ml/scholarship_match_dataset.csv` – 3,009 interaction rows with 250 students.
2. `ml/feature_schema.json` – Formal feature contract and target specification.
3. `ml/random_forest_model.joblib` – Serialized Python scikit-learn model.
4. `ml/model.json` – Fully serialized decision tree nodes for Node.js JavaScript inference.

