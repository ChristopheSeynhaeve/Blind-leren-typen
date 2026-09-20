export type Result = { accuracy: number; wpm: number; seconds: number; date: string; passed: boolean };
export type Progress = Record<string, Result[]>;
export const STORAGE_KEY = 'letterlijk.progress.v1';
export function parseProgress(raw: string | null): Progress {
  if (!raw) return {};
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    const clean: Progress = {};
    for (const [key, value] of Object.entries(data)) {
      if (!/^lesson-\d+-[0-2]$/.test(key) || !Array.isArray(value)) continue;
      clean[key] = value.filter((r): r is Result => r && Number.isFinite(r.accuracy) && r.accuracy >= 0 && r.accuracy <= 100 && Number.isFinite(r.wpm) && r.wpm >= 0 && Number.isFinite(r.seconds) && r.seconds >= 0 && typeof r.date === 'string' && !Number.isNaN(Date.parse(r.date)) && typeof r.passed === 'boolean').slice(-30);
    }
    return clean;
  } catch { return {}; }
}
export function calculateResult(correct: number, attempts: number, elapsed: number): Result {
  const seconds = Math.max(1, elapsed / 1000);
  const accuracy = attempts ? Math.round(correct / attempts * 100) : 100;
  return {accuracy, wpm: Math.round(correct / 5 / (seconds / 60)), seconds:Math.round(seconds), date:new Date().toISOString(), passed:accuracy >= 95};
}
