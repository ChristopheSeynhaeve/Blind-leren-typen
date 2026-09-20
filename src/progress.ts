export type Result = { accuracy: number; wpm: number; seconds: number; date: string; passed: boolean; maxSeconds?: number };
export const MIN_ACCURACY = 95;
// Een rustig doeltempo per fase, met tien seconden speling en minstens 30 seconden.
export function timeLimit(characters: number, stage: string): number {
  const wpm = stage === 'De basisrij' ? 8 : stage === 'Woorden bouwen' ? 10 : stage === 'Vlotter typen' ? 12 : 15;
  return Math.max(30, Math.ceil(characters / 5 / wpm * 60 + 10));
}
export function formatTime(seconds: number): string {
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
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
      clean[key] = value.filter((r): r is Result => r && Number.isFinite(r.accuracy) && r.accuracy >= 0 && r.accuracy <= 100 && Number.isFinite(r.wpm) && r.wpm >= 0 && Number.isFinite(r.seconds) && r.seconds >= 0 && typeof r.date === 'string' && !Number.isNaN(Date.parse(r.date)) && typeof r.passed === 'boolean' && (r.maxSeconds === undefined || Number.isFinite(r.maxSeconds) && r.maxSeconds > 0)).slice(-30);
    }
    return clean;
  } catch { return {}; }
}
export function calculateResult(correct: number, attempts: number, elapsed: number, maxSeconds?: number): Result {
  const seconds = Math.max(1, elapsed / 1000);
  const accuracy = attempts ? Math.floor(correct / attempts * 1000) / 10 : 100;
  return {accuracy, wpm: Math.round(correct / 5 / (seconds / 60)), seconds:Math.ceil(seconds), date:new Date().toISOString(), passed:accuracy >= MIN_ACCURACY && (maxSeconds === undefined || seconds <= maxSeconds), ...(maxSeconds === undefined ? {} : {maxSeconds})};
}
