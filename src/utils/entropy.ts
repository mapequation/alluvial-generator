import { clamp, normalize as _normalize } from "./math";

function log2(p: number) {
  return p > 0 && Number.isFinite(p) ? Math.log2(p) : 0;
}

export function plogp(p: number) {
  return p * log2(p);
}

export function entropy(p: number[], normalize = false) {
  if (normalize) {
    p = _normalize(p);
  }
  return -p.reduce((acc, p) => acc + plogp(p), 0);
}

export function kl_div(p: number[], q: number[], normalize = false) {
  if (q.length !== p.length) {
    throw new Error("p and q must be the same length");
  }

  if (normalize) {
    p = _normalize(p);
    q = _normalize(q);
  }

  return p.reduce((acc, p, i) => acc + p * log2(p / q[i]), 0);
}

export function js_div(p: number[], q: number[], normalize = false) {
  if (q.length !== p.length) {
    throw new Error("p and q must be the same length");
  }

  if (normalize) {
    p = _normalize(p);
    q = _normalize(q);
  }

  const mix = p.map((p, i) => 0.5 * (p + q[i]));

  const dp = kl_div(p, mix, false);
  const dq = kl_div(q, mix, false);

  const jsd = 0.5 * (dp + dq);

  if (jsd < 0) {
    throw new Error("JSD should be non-negative");
  }

  return clamp(jsd, 0, 1);
}
