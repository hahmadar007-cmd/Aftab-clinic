export interface LabTest {
  id: string;
  code: string;
  name: string;
  rate: number;
  sample: string;
  reportingTime: string;
  category: 'Hematology' | 'Biochemistry' | 'Hormones' | 'Microbiology' | 'PCR & Virology' | 'General';
}

export interface HealthPackage {
  id: string;
  code: string;
  name: string;
  price: number;
  regularPrice: number;
  testsIncluded: string[];
  recommendedFor: string;
  sample: string;
  reportingTime: string;
}

export const HEALTH_PACKAGES: HealthPackage[] = [
  {
    id: 'pkg-01',
    code: 'PKG-01',
    name: '01 BASIC HEALTH SCREENING',
    price: 1999,
    regularPrice: 2900,
    testsIncluded: [
      'CBC / Blood Complete Examination',
      'ESR (Erythrocyte Sedimentation Rate)',
      'Fasting Blood Glucose',
      'Urine Routine Examination (Urine C/E)',
      'Creatinine (Renal Function)',
      'Uric Acid (Gout Screen)',
    ],
    recommendedFor: 'Routine annual checkups & basic health evaluation',
    sample: '3CC EDTA Blood + Fasting Fluoride + Spot Urine',
    reportingTime: 'Same Day After 8 Hours',
  },
  {
    id: 'pkg-02',
    code: 'PKG-02',
    name: '02 DIABETES & HEART CHECKUP',
    price: 3999,
    regularPrice: 5750,
    testsIncluded: [
      'Fasting Blood Glucose',
      'HbA1c (Glycated Hemoglobin 3-Month Average)',
      'Lipid Profile (Cholesterol, Triglycerides, HDL, LDL)',
      'Creatinine (Kidney Function)',
      'Uric Acid',
      'Urine Routine Examination (Urine C/E)',
    ],
    recommendedFor: 'Diabetic management, cholesterol & cardiovascular risk assessment',
    sample: 'Fasting Blood + EDTA Blood + Spot Urine',
    reportingTime: 'Same Day After 8 Hours',
  },
  {
    id: 'pkg-03',
    code: 'PKG-03',
    name: '03 COMPLETE HEALTH CHECKUP',
    price: 6999,
    regularPrice: 9650,
    testsIncluded: [
      'CBC / Blood Complete Examination',
      'Fasting Blood Glucose',
      'HbA1c (Glycated Hemoglobin)',
      'Complete Lipid Profile',
      'LFT (Liver Function Tests - Bilirubin, SGPT/ALT, SGOT, ALP)',
      'Creatinine & Uric Acid',
      'Urine Routine Examination (Urine C/E)',
      'TSH (Thyroid Stimulating Hormone)',
    ],
    recommendedFor: 'Comprehensive organ function & metabolic screening',
    sample: 'Clotted Serum + EDTA Blood + Fasting Fluoride + Spot Urine',
    reportingTime: 'Same Day After 8 Hours',
  },
  {
    id: 'pkg-04',
    code: 'PKG-04',
    name: '04 PREMIUM EXECUTIVE HEALTH PACKAGE',
    price: 9999,
    regularPrice: 16250,
    testsIncluded: [
      'CBC / Blood Complete Examination',
      'Fasting Blood Glucose',
      'HbA1c (Glycated Hemoglobin)',
      'Complete Lipid Profile',
      'LFT (Liver Function Tests)',
      'Creatinine & Uric Acid',
      'Urine Routine Examination (Urine C/E)',
      'TFT (Thyroid Profile: FT3, FT4, TSH)',
      '25-Hydroxy Vitamin D Level',
      'Vitamin B12 Level',
    ],
    recommendedFor: 'Full executive body screening, vitamin deficiencies & endocrine health',
    sample: 'Serum Clotted + EDTA Blood + Fasting Samples + Spot Urine',
    reportingTime: '24 to 48 Hours',
  },
];

export const TEST_CATALOG: LabTest[] = [
  // Hematology
  { id: 't-1300', code: '1300', name: 'Blood Complete Examination (CBC)', rate: 700, sample: '3CC EDTA Blood', reportingTime: 'Same Day After 8 Hours', category: 'Hematology' },
  { id: 't-1351', code: '1351', name: 'CBC For (Dengue Profile)', rate: 90, sample: '3CC EDTA Blood', reportingTime: 'Same Day After 8 Hours', category: 'Hematology' },
  { id: 't-1304', code: '1304', name: 'ESR (Erythrocyte Sedimentation Rate)', rate: 250, sample: '3CC EDTA Blood', reportingTime: 'NEXT DAY', category: 'Hematology' },
  { id: 't-1301', code: '1301', name: 'Hemoglobin (HB)', rate: 200, sample: '3CC EDTA Blood', reportingTime: 'Same Day After 8 Hours', category: 'Hematology' },
  { id: 't-2893', code: '2893', name: 'Blood Group & Rh Factor', rate: 700, sample: '3CC EDTA Blood', reportingTime: 'DAILY', category: 'Hematology' },
  { id: 't-1311', code: '1311', name: 'Platelet Count', rate: 400, sample: '3-5cc Clotted Blood', reportingTime: 'Same Day After 8 Hours', category: 'Hematology' },
  { id: 't-1302', code: '1302', name: 'WBC Count (TLC)', rate: 450, sample: '3CC EDTA Blood', reportingTime: 'Same Day After 8 Hours', category: 'Hematology' },
  { id: 't-1303', code: '1303', name: 'DLC (Differential Leukocyte Count)', rate: 450, sample: '3CC EDTA Blood', reportingTime: 'Same Day After 8 Hours', category: 'Hematology' },
  { id: 't-1305', code: '1305', name: 'Prothrombin Time (PT With INR)', rate: 800, sample: 'Sodium Citrate Tube (PT Vial)', reportingTime: 'Same Day After 8 Hours', category: 'Hematology' },
  { id: 't-1306', code: '1306', name: 'APTT', rate: 950, sample: 'Sodium Citrate Tube (PT Vial)', reportingTime: 'Same Day After 8 Hours', category: 'Hematology' },
  { id: 't-1309', code: '1309', name: 'Plasma D-Dimer', rate: 2600, sample: 'Sodium Citrate Tube (PT Vial)', reportingTime: 'NEXT DAY', category: 'Hematology' },

  // Biochemistry & Metabolic
  { id: 't-1401', code: '1401', name: 'Blood Glucose (Fasting)', rate: 300, sample: 'Sodium Fluoride Containing Sample', reportingTime: 'Same Day After 6 Hours', category: 'Biochemistry' },
  { id: 't-2800', code: '2800', name: 'Blood Glucose (Random)', rate: 300, sample: 'Sodium Fluoride Containing Sample', reportingTime: 'Same Day After 6 Hours', category: 'Biochemistry' },
  { id: 't-4802', code: '4802', name: 'Hemoglobin A1C (HBA1C)', rate: 1800, sample: '3CC EDTA Blood', reportingTime: 'NEXT DAY', category: 'Biochemistry' },
  { id: 't-1900', code: '1900', name: 'Serum Lipid Profile - Fasting', rate: 2000, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'DAILY', category: 'Biochemistry' },
  { id: 't-1902', code: '1902', name: 'Cholesterol (Total)', rate: 600, sample: '(Fasting) 3-5cc Clotted Blood', reportingTime: 'SAME DAY', category: 'Biochemistry' },
  { id: 't-1904', code: '1904', name: 'HDL (Cholesterol)', rate: 700, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Biochemistry' },
  { id: 't-1905', code: '1905', name: 'LDL Cholesterol', rate: 700, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'DAILY', category: 'Biochemistry' },
  { id: 't-1903', code: '1903', name: 'Triglycerides', rate: 600, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Biochemistry' },
  { id: 't-1509', code: '1509', name: 'Liver Function Test (LFTs)', rate: 1800, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'Same Day After 6 Hours', category: 'Biochemistry' },
  { id: 't-1503', code: '1503', name: 'SGPT (ALT)', rate: 600, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Biochemistry' },
  { id: 't-1504', code: '1504', name: 'SGOT (AST)', rate: 600, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Biochemistry' },
  { id: 't-1505', code: '1505', name: 'Alkaline Phosphatase (ALP)', rate: 500, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Biochemistry' },
  { id: 't-1501', code: '1501', name: 'Bilirubin Total', rate: 600, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'DAILY', category: 'Biochemistry' },
  { id: 't-1618', code: '1618', name: 'Renal Function Test (RFTs)', rate: 1300, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'Same Day After 6 Hours', category: 'Biochemistry' },
  { id: 't-1845', code: '1845', name: 'Creatinine (Serum)', rate: 600, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Biochemistry' },
  { id: 't-2704', code: '2704', name: 'Uric Acid (Serum)', rate: 600, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Biochemistry' },
  { id: 't-1701', code: '1701', name: 'Sodium (Serum)', rate: 600, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Biochemistry' },
  { id: 't-1702', code: '1702', name: 'Potassium (Serum)', rate: 600, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Biochemistry' },
  { id: 't-1700', code: '1700', name: 'Serum Electrolytes (Na, K, Cl)', rate: 1300, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'Same Day After 6 Hours', category: 'Biochemistry' },
  { id: 't-1705', code: '1705', name: 'Calcium (Serum)', rate: 650, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Biochemistry' },

  // Hormones & Vitamins
  { id: 't-41000', code: '41000', name: 'Thyroid Function Tests (TFTs - FT3, FT4, TSH)', rate: 3500, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'Same Day After 6 Hours', category: 'Hormones' },
  { id: 't-4103', code: '4103', name: 'Thyroid-Stimulating Hormone (TSH)', rate: 1400, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'AFTER ONE DAY', category: 'Hormones' },
  { id: 't-4106', code: '4106', name: 'Free Thyroxine (FT4)', rate: 2000, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'AFTER ONE DAY', category: 'Hormones' },
  { id: 't-4109', code: '4109', name: 'Free Triiodothyronine (FT3)', rate: 2000, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Hormones' },
  { id: 't-5050', code: '5050', name: '25-Hydroxy Vitamin D Level', rate: 3100, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'AFTER TWO DAYS', category: 'Hormones' },
  { id: 't-4111', code: '4111', name: 'Vitamin B12 Level', rate: 2000, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'AFTER ONE DAY', category: 'Hormones' },
  { id: 't-4105', code: '4105', name: 'Follicle-Stimulating Hormone (FSH)', rate: 1800, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'Same Day After 6 Hours', category: 'Hormones' },
  { id: 't-4104', code: '4104', name: 'Serum Luteinizing Hormone (LH)', rate: 1800, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'AFTER ONE DAY', category: 'Hormones' },
  { id: 't-4107', code: '4107', name: 'Serum Prolactin Level', rate: 1800, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'AFTER ONE DAY', category: 'Hormones' },
  { id: 't-4124', code: '4124', name: 'Serum Testosterone Level', rate: 1600, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'DAILY', category: 'Hormones' },
  { id: 't-4304', code: '4304', name: 'PSA (Prostate Specific Antigen)', rate: 2500, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'AFTER ONE DAY', category: 'Hormones' },
  { id: 't-4303', code: '4303', name: 'Serum Beta HCG Level', rate: 1800, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'Hormones' },

  // Virology & PCR Diagnostics
  { id: 't-4189', code: '4189', name: 'Dengue NS1 Antigen by ELISA', rate: 1500, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'AFTER ONE DAY', category: 'PCR & Virology' },
  { id: 't-5100', code: '5100', name: 'Dengue IgG by ELISA', rate: 1500, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'Same Day After 12 Hours', category: 'PCR & Virology' },
  { id: 't-5101', code: '5101', name: 'Dengue IgM by ELISA', rate: 1500, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'Same Day After 12 Hours', category: 'PCR & Virology' },
  { id: 't-4201', code: '4201', name: 'HBs Ag Screening (Hepatitis B)', rate: 800, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'PCR & Virology' },
  { id: 't-4233', code: '4233', name: 'Anti HCV Screening (Hepatitis C)', rate: 800, sample: 'EDTA & Clotted Blood', reportingTime: 'DAILY', category: 'PCR & Virology' },
  { id: 't-4617', code: '4617', name: 'HBV PCR Quantitative (Hepatitis B Load)', rate: 9000, sample: 'EDTA Vials Blood / Plasma', reportingTime: 'AFTER THREE DAYS', category: 'PCR & Virology' },
  { id: 't-4610', code: '4610', name: 'HCV PCR Quantitative (Hepatitis C Load)', rate: 9000, sample: 'EDTA Blood / Plasma', reportingTime: 'AFTER TWO DAYS', category: 'PCR & Virology' },
  { id: 't-5090', code: '5090', name: 'COVID-19 (Corona) Virus PCR (Routine)', rate: 4500, sample: 'Nasopharyngeal / Oropharyngeal Swab', reportingTime: 'AFTER ONE DAY', category: 'PCR & Virology' },
  { id: 't-4244', code: '4244', name: 'Anti HIV - 1 & 2 Screening', rate: 800, sample: '3-5cc Clotted Blood or Serum', reportingTime: 'SAME DAY', category: 'PCR & Virology' },
  { id: 't-2211', code: '2211', name: 'QuantiFERON-TB Gold / IGRA (Tuberculosis)', rate: 10500, sample: '2 Vials Lithium Heparin', reportingTime: 'AFTER 7 DAYS', category: 'PCR & Virology' },

  // Microbiology & Culture Tests
  { id: 't-1100', code: '1100', name: 'Urine Routine Examination (Urine C/E)', rate: 450, sample: 'Urine (Random/Spot)', reportingTime: 'Same Day After 8 Hours', category: 'Microbiology' },
  { id: 't-1101', code: '1101', name: 'Urine Culture & Sensitivity (Urine C/S)', rate: 2200, sample: 'Midstream Clean Catch Urine', reportingTime: 'AFTER THREE DAYS', category: 'Microbiology' },
  { id: 't-1200', code: '1200', name: 'Stool Routine Examination (Stool C/E)', rate: 600, sample: 'Fresh Stool Sample', reportingTime: 'SAME DAY', category: 'Microbiology' },
  { id: 't-1710', code: '1710', name: 'Blood Culture & Sensitivity (Aerobic C/S)', rate: 3800, sample: 'Blood in Aerobic Culture Vial', reportingTime: 'AFTER 7 DAYS', category: 'Microbiology' },
  { id: 't-1210', code: '1210', name: 'Sputum Culture & Sensitivity (Sputum C/S)', rate: 2200, sample: 'Morning Sputum', reportingTime: 'AFTER THREE DAYS', category: 'Microbiology' },
  { id: 't-2557', code: '2557', name: 'Pus / Wound Swab Culture & Sensitivity', rate: 2200, sample: 'Pus / Wound Swab', reportingTime: 'AFTER THREE DAYS', category: 'Microbiology' },
  { id: 't-1216', code: '1216', name: 'Throat Swab Culture & Sensitivity', rate: 2200, sample: 'Throat Swab', reportingTime: 'AFTER THREE DAYS', category: 'Microbiology' },
  { id: 't-1228', code: '1228', name: 'HVS Culture & Sensitivity (High Vaginal Swab)', rate: 2200, sample: 'HVS Swab', reportingTime: 'AFTER THREE DAYS', category: 'Microbiology' },
  { id: 't-2501', code: '2501', name: 'AFB Stain / ZN Stain (Tuberculosis Screening)', rate: 950, sample: 'Sputum / Body Fluid / Tissue', reportingTime: 'SAME DAY', category: 'Microbiology' },
];

export interface DiagnosticReport {
  reportId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female';
  cnicPhone: string;
  bookingDate: string;
  testName: string;
  category: string;
  results: {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: 'Normal' | 'Abnormal' | 'Attention';
  }[];
  pathologist: string;
}

export const MOCK_REPORTS: Record<string, DiagnosticReport> = {};

export interface StandardParameterPreset {
  name: string;
  unit: string;
  referenceRange: string;
  defaultValue: string;
}

export const STANDARD_MEDICAL_PARAMETERS: StandardParameterPreset[] = [
  // Hematology / CBC
  { name: 'Hemoglobin (Hb)', unit: 'g/dL', referenceRange: '13.5 - 17.5 (Male), 12.0 - 15.5 (Female)', defaultValue: '14.2' },
  { name: 'TLC / White Blood Cells (WBC)', unit: '/cmm', referenceRange: '4,000 - 11,000', defaultValue: '7,400' },
  { name: 'Platelet Count', unit: '/cmm', referenceRange: '150,000 - 450,000', defaultValue: '250,000' },
  { name: 'RBC Count', unit: 'x10^6/uL', referenceRange: '4.5 - 5.9', defaultValue: '4.8' },
  { name: 'Hematocrit (HCT)', unit: '%', referenceRange: '41.0 - 50.0', defaultValue: '44.0' },
  { name: 'MCV (Mean Corpuscular Volume)', unit: 'fL', referenceRange: '80 - 96', defaultValue: '88' },
  { name: 'MCH (Mean Corpuscular Hemoglobin)', unit: 'pg', referenceRange: '27.0 - 33.0', defaultValue: '29.5' },
  { name: 'MCHC', unit: 'g/dL', referenceRange: '32.0 - 36.0', defaultValue: '34.0' },
  { name: 'Neutrophils', unit: '%', referenceRange: '40 - 75', defaultValue: '62' },
  { name: 'Lymphocytes', unit: '%', referenceRange: '20 - 45', defaultValue: '30' },
  { name: 'Eosinophils', unit: '%', referenceRange: '1 - 6', defaultValue: '3' },
  { name: 'Monocytes', unit: '%', referenceRange: '2 - 10', defaultValue: '5' },
  { name: 'Basophils', unit: '%', referenceRange: '0 - 1', defaultValue: '0' },
  { name: 'ESR (Erythrocyte Sedimentation Rate)', unit: 'mm/hr', referenceRange: '0 - 15 (Male), 0 - 20 (Female)', defaultValue: '8' },

  // Blood Glucose / Diabetes
  { name: 'Blood Glucose (Fasting)', unit: 'mg/dL', referenceRange: '70 - 100 Fasting', defaultValue: '92' },
  { name: 'Blood Glucose (Random)', unit: 'mg/dL', referenceRange: '< 140 Random', defaultValue: '115' },
  { name: 'HbA1c (Glycated Hemoglobin)', unit: '%', referenceRange: '< 5.7 Normal, 5.7 - 6.4 Prediabetes', defaultValue: '5.4' },
  { name: 'Fasting Insulin', unit: 'uIU/mL', referenceRange: '2.6 - 24.9', defaultValue: '8.5' },

  // Lipid Profile
  { name: 'Total Cholesterol', unit: 'mg/dL', referenceRange: '< 200 Desirable', defaultValue: '175' },
  { name: 'Triglycerides', unit: 'mg/dL', referenceRange: '< 150 Normal', defaultValue: '130' },
  { name: 'HDL Cholesterol (Good)', unit: 'mg/dL', referenceRange: '> 40 Normal', defaultValue: '48' },
  { name: 'LDL Cholesterol (Bad)', unit: 'mg/dL', referenceRange: '< 100 Optimal', defaultValue: '98' },
  { name: 'VLDL Cholesterol', unit: 'mg/dL', referenceRange: '5 - 40', defaultValue: '26' },

  // Liver Function Tests (LFT)
  { name: 'ALT (SGPT)', unit: 'U/L', referenceRange: '< 45 U/L', defaultValue: '32' },
  { name: 'AST (SGOT)', unit: 'U/L', referenceRange: '< 35 U/L', defaultValue: '26' },
  { name: 'Alkaline Phosphatase (ALP)', unit: 'U/L', referenceRange: '44 - 147', defaultValue: '85' },
  { name: 'Bilirubin Total', unit: 'mg/dL', referenceRange: '0.2 - 1.2', defaultValue: '0.8' },
  { name: 'Bilirubin Direct', unit: 'mg/dL', referenceRange: '0.0 - 0.3', defaultValue: '0.2' },
  { name: 'Serum Albumin', unit: 'g/dL', referenceRange: '3.5 - 5.2', defaultValue: '4.4' },
  { name: 'Serum Globulin', unit: 'g/dL', referenceRange: '2.0 - 3.5', defaultValue: '2.8' },
  { name: 'Total Protein', unit: 'g/dL', referenceRange: '6.0 - 8.3', defaultValue: '7.2' },

  // Renal / Kidney Function Tests (RFT)
  { name: 'Serum Creatinine', unit: 'mg/dL', referenceRange: '0.6 - 1.2', defaultValue: '0.9' },
  { name: 'Blood Urea', unit: 'mg/dL', referenceRange: '15 - 45', defaultValue: '24' },
  { name: 'BUN (Blood Urea Nitrogen)', unit: 'mg/dL', referenceRange: '7 - 20', defaultValue: '12' },
  { name: 'Serum Uric Acid', unit: 'mg/dL', referenceRange: '3.5 - 7.2', defaultValue: '5.2' },
  { name: 'Serum Sodium (Na+)', unit: 'mEq/L', referenceRange: '135 - 145', defaultValue: '140' },
  { name: 'Serum Potassium (K+)', unit: 'mEq/L', referenceRange: '3.5 - 5.1', defaultValue: '4.2' },
  { name: 'Serum Chloride (Cl-)', unit: 'mEq/L', referenceRange: '96 - 106', defaultValue: '101' },

  // Thyroid Profile
  { name: 'TSH (Thyroid Stimulating Hormone)', unit: 'uIU/mL', referenceRange: '0.40 - 4.20', defaultValue: '2.10' },
  { name: 'Free T3 (FT3)', unit: 'pg/mL', referenceRange: '2.0 - 4.4', defaultValue: '3.10' },
  { name: 'Free T4 (FT4)', unit: 'ng/dL', referenceRange: '0.93 - 1.70', defaultValue: '1.25' },
  { name: 'Total T3', unit: 'ng/dL', referenceRange: '80 - 200', defaultValue: '130' },
  { name: 'Total T4', unit: 'ug/dL', referenceRange: '5.1 - 14.1', defaultValue: '8.5' },

  // Vitamins & Minerals
  { name: 'Vitamin D (25-OH Total)', unit: 'ng/mL', referenceRange: '30 - 100 Sufficient', defaultValue: '38' },
  { name: 'Vitamin B12 (Cobalamin)', unit: 'pg/mL', referenceRange: '200 - 900', defaultValue: '450' },
  { name: 'Serum Calcium', unit: 'mg/dL', referenceRange: '8.5 - 10.5', defaultValue: '9.4' },
  { name: 'Serum Iron', unit: 'ug/dL', referenceRange: '60 - 170', defaultValue: '110' },
  { name: 'Serum Ferritin', unit: 'ng/mL', referenceRange: '30 - 400', defaultValue: '160' },

  // Urine Examination
  { name: 'Urine Color', unit: '-', referenceRange: 'Pale Yellow / Straw', defaultValue: 'Pale Yellow' },
  { name: 'Urine pH', unit: '-', referenceRange: '4.6 - 8.0', defaultValue: '6.0' },
  { name: 'Urine Specific Gravity', unit: '-', referenceRange: '1.005 - 1.030', defaultValue: '1.015' },
  { name: 'Urine Protein', unit: '-', referenceRange: 'Nil / Negative', defaultValue: 'Nil' },
  { name: 'Urine Sugar / Glucose', unit: '-', referenceRange: 'Nil / Negative', defaultValue: 'Nil' },
  { name: 'Pus Cells (WBC)', unit: '/HPF', referenceRange: '0 - 5 /HPF', defaultValue: '1 - 2' },
  { name: 'RBCs (Red Blood Cells)', unit: '/HPF', referenceRange: 'Nil / 0 - 2', defaultValue: 'Nil' },
  { name: 'Epithelial Cells', unit: '/HPF', referenceRange: 'Few', defaultValue: 'Few' },

  // Serology & Virology
  { name: 'HBsAg (Hepatitis B Surface Antigen)', unit: '-', referenceRange: 'Non-Reactive', defaultValue: 'Non-Reactive' },
  { name: 'Anti-HCV (Hepatitis C Antibody)', unit: '-', referenceRange: 'Non-Reactive', defaultValue: 'Non-Reactive' },
  { name: 'HIV I & II Antibodies', unit: '-', referenceRange: 'Non-Reactive', defaultValue: 'Non-Reactive' },
  { name: 'Typhi Dot (IgM)', unit: '-', referenceRange: 'Negative', defaultValue: 'Negative' },
  { name: 'Dengue NS1 Antigen', unit: '-', referenceRange: 'Negative', defaultValue: 'Negative' },
];
