import { IVendorStat } from './types';

// Extract client IP from request
export function getClientIP(req) {
  let ip =
    (req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  ip = ip.split(':').pop();
  if (ip === '1') ip = '127.0.0.1';
  return ip;
}

// Calculate difference in hours between two dates
export function diffInHours(from, to) {
  var diffInSeconds = (to.getTime() - from.getTime()) / 1000;
  return Math.round(diffInSeconds / (60 * 60));
}

// Sort array ascending
const asc = (arr: number[]) => arr.sort((a, b) => a - b);

// Calculate quantile
const quantile = (arr: number[], q: number) => {
  if (arr.length === 0) return 0;

  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

// Calculate percentile for latency data
export function calcPercentiles(data: IVendorStat[]) {
  const latencyData = data.map((d) => d.apiLatency);
  const calc = (q) => Number(quantile(latencyData, q).toFixed(2));

  return {
    percentile50: calc(0.5),
    percentile75: calc(0.75),
    percentile95: calc(0.95),
    percentile99: calc(0.99),
  };
}
