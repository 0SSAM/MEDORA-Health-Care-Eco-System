#!/usr/bin/env python3
"""Light load test: concurrent requests against MEDORA production server, measuring latency distribution."""
import concurrent.futures, statistics, sys, time
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4174"
ROUTES = ["/", "/api/health"]
ITERATIONS = 40  # per route

def fetch(route):
    start = time.perf_counter()
    try:
        with urllib.request.urlopen(BASE + route, timeout=30) as r:
            _ = r.read()
            return time.perf_counter() - start, r.status
    except Exception as e:
        return time.perf_counter() - start, str(e)

results = {r: [] for r in ROUTES}
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
    for r in ROUTES:
        for d in ex.map(lambda _: fetch(r), range(ITERATIONS)):
            results[r].append(d)

for r in ROUTES:
    times = [t for t, s in results[r] if isinstance(s, int)]
    errs = sum(1 for _, s in results[r] if not isinstance(s, int))
    if not times:
        print(f"{r}: no successful responses, errors={errs}")
        continue
    print(f"{r}: n={len(times)} errors={errs} "
          f"min={min(times)*1000:.1f}ms mean={statistics.mean(times)*1000:.1f}ms "
          f"p50={statistics.median(times)*1000:.1f}ms p95={sorted(times)[int(0.95*len(times))]*1000:.1f}ms "
          f"max={max(times)*1000:.1f}ms")
