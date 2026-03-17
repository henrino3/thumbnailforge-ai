type UsageRecord = {
  day: string;
  count: number;
};

const DAILY_FREE_LIMIT = 3;

// Demo-friendly in-memory limiter. This works for a single runtime instance but is not
// durable across serverless cold starts or multiple regions. Production should move this
// to Redis, Postgres, or another shared store.
declare global {
  // eslint-disable-next-line no-var
  var __thumbnailForgeUsage: Map<string, UsageRecord> | undefined;
}

const usageStore = globalThis.__thumbnailForgeUsage ?? new Map<string, UsageRecord>();
if (!globalThis.__thumbnailForgeUsage) {
  globalThis.__thumbnailForgeUsage = usageStore;
}

export function getRequestKey(ip: string | null, cookieId: string | undefined) {
  return ip || cookieId || "anonymous";
}

export function getRemainingGenerations(key: string) {
  const today = new Date().toISOString().slice(0, 10);
  const current = usageStore.get(key);
  if (!current || current.day !== today) {
    return DAILY_FREE_LIMIT;
  }

  return Math.max(DAILY_FREE_LIMIT - current.count, 0);
}

export function consumeGeneration(key: string) {
  const today = new Date().toISOString().slice(0, 10);
  const current = usageStore.get(key);

  if (!current || current.day !== today) {
    usageStore.set(key, { day: today, count: 1 });
    return { allowed: true, remaining: DAILY_FREE_LIMIT - 1 };
  }

  if (current.count >= DAILY_FREE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  usageStore.set(key, current);
  return { allowed: true, remaining: Math.max(DAILY_FREE_LIMIT - current.count, 0) };
}
