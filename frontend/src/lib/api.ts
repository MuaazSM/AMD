import type { AnalysisResult, AnalyzeResponse, UserProfile } from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function analyzeFood(
  image: string,
  mimeType: string,
  profile: UserProfile | null,
): Promise<{ result: AnalysisResult; provider: string | null }> {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, mime_type: mimeType, profile }),
  });
  if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);
  const json = (await res.json()) as AnalyzeResponse;
  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Unknown error");
  }
  return { result: json.data, provider: json.provider };
}
