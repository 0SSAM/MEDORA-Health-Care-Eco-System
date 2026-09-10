// GP MAX — KPI calculator (shared)
// يحسب درجة 0–100 لكل طبقة L0–L7 ودرجة إجمالية موزونة.
export interface GpMaxCheckpoint {
  code: string;
  layerCode: string;
  weight: number;
}

export interface GpMaxScoreResult {
  overall: number;
  perLayer: Record<string, { met: number; total: number; score: number }>;
  metWeight: number;
  totalWeight: number;
}

export function computeGpMaxScore(
  checkpoints: GpMaxCheckpoint[],
  answers: Record<string, boolean>,
): GpMaxScoreResult {
  const byLayer = new Map<string, { met: number; total: number; score: number }>();
  let metW = 0;
  let totalW = 0;
  for (const c of checkpoints) {
    const w = Math.max(1, Number(c.weight) || 1);
    const met = Boolean(answers[c.code]);
    totalW += w;
    if (met) metW += w;
    const l = byLayer.get(c.layerCode) ?? { met: 0, total: 0, score: 0 };
    l.total += w;
    if (met) l.met += w;
    byLayer.set(c.layerCode, l);
  }
  const perLayer: GpMaxScoreResult["perLayer"] = {};
  byLayer.forEach((v, k) => {
    perLayer[k] = { ...v, score: v.total ? Math.round((v.met / v.total) * 100) : 0 };
  });
  return {
    overall: totalW ? Math.round((metW / totalW) * 100) : 0,
    perLayer,
    metWeight: metW,
    totalWeight: totalW,
  };
}
