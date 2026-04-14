export interface UserProfile {
  conditions: string[];
  goals: string[];
  allergies: string[];
}

export interface AnalyzeRequest {
  image: string;
  mime_type: string;
  profile: UserProfile | null;
}

export type AdditiveRisk = "low" | "medium" | "high";

export interface AdditiveWarning {
  name: string;
  risk: AdditiveRisk;
  description: string;
}

export interface SwapSuggestion {
  original: string;
  suggestion: string;
  benefit: string;
}

export interface AnalysisResult {
  food_name: string;
  category: string;
  health_score: number;
  verdict: string;
  ingredients: string[];
  harmful_additives: AdditiveWarning[];
  positives: string[];
  concerns: string[];
  swaps: SwapSuggestion[];
}

export interface AnalyzeResponse {
  success: boolean;
  data: AnalysisResult | null;
  provider: string | null;
  error: string | null;
}

export interface ScanEntry extends AnalysisResult {
  id: string;
  timestamp: string;
  image_data_url: string;
  provider?: string | null;
}

export interface PendingScan {
  dataUrl: string;
  base64: string;
  mimeType: string;
  createdAt: string;
}
