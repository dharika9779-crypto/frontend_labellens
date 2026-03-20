import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ── TYPES ──────────────────────────────────────────────────────
export interface ClassifiedIngredient {
  name: string;
  category: "safe" | "moderate" | "harmful" | "unknown";
}

export interface HealthScore {
  raw_score: number;
  normalised: number;
  grade: string;
  verdict: string;
}

export interface Personalisation {
  diabetic_warnings: string[];
  allergy_warnings: string[];
  harmful_warnings: string[];
  general_advice: string;
  total_warnings: number;
}

export interface FullScanResponse {
  ingredients_raw_block: string;
  ingredients_list: string[];
  classified: ClassifiedIngredient[];
  counts: {
    safe: number;
    moderate: number;
    harmful: number;
    unknown: number;
  };
  health_score: HealthScore;
  personalisation: Personalisation;
}

// ── API SERVICE ────────────────────────────────────────────────
export const apiService = {

  // OCR — image upload karke text nikalo
  async uploadImage(file: File): Promise<{
    success: boolean;
    text: string;
    error: string | null;
    used_fallback: boolean;
  }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${BASE_URL}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Full scan — classify + personalise
  async fullScan(
  rawText: string,
  isDiabetic: boolean,
  allergies: string[],
  age: string = 'adult',
  dietType: string = 'none',
  medicalConditions: string[] = [],
): Promise<FullScanResponse> {
  const response = await axios.post(`${BASE_URL}/full-scan`, {
    raw_text: rawText,
    is_diabetic: isDiabetic,
    allergies: allergies,
    age: age,
    diet_type: dietType,
    medical_conditions: medicalConditions,
  });
  return response.data;
},

  // Barcode image upload karo
async scanBarcode(file: File): Promise<{
  success: boolean;
  barcode: string | null;
  product_name: string | null;
  brands: string | null;
  ingredients_text: string | null;
  image_url: string | null;
  error: string | null;
}> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post(`${BASE_URL}/scan-barcode`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
},

// Seedha barcode number se lookup karo
async lookupBarcode(barcode: string): Promise<{
  success: boolean;
  barcode: string | null;
  product_name: string | null;
  brands: string | null;
  ingredients_text: string | null;
  image_url: string | null;
  error: string | null;
}> {
  const response = await axios.post(`${BASE_URL}/lookup-barcode`, {
    barcode: barcode,
  });
  return response.data;
} , 
// PDF report download karo
async generatePDF(
  data: FullScanResponse,
  productName: string,
  userName: string
): Promise<void> {
  const response = await axios.post(
    `${BASE_URL}/generate-pdf`,
    {
      product_name: productName,
      ingredients_list: data.ingredients_list,
      classified: data.classified,
      counts: data.counts,
      health_score: data.health_score,
      personalisation: data.personalisation,
      user_name: userName,
    },
    { responseType: 'blob' }  // PDF bytes receive karo
  );

  // Browser mein download trigger karo
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'LabelLens-Report.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
},

};
