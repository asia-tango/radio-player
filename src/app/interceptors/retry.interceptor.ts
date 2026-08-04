import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timeout, timer } from 'rxjs';

import { RADIO_BROWSER_API_BASE } from '../data/radio-browser.config';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  requestTimeoutMs: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 2, // plus the initial attempt, that's 3 attempts total
  baseDelayMs: 500,
  // A request that never responds counts as a failure too. Kept short: with 3
  // attempts and backoff, a dead backend would otherwise take ~25s (3x8s) to
  // surface the "Try again" button instead of ~11s (3x3s).
  requestTimeoutMs: 3000,
};

// Delay grows exponentially (500ms -> 1000ms) instead of linearly, giving the
// backend increasingly more time to recover after each failed attempt.
function backoffMs(baseDelayMs: number, retryCount: number): number {
  return baseDelayMs * 2 ** (retryCount - 1);
}

// Retries failed (or hung) GET requests to the Radio Browser API before giving
// up. A request that never responds at all (e.g. a dropped connection) would
// otherwise leave the caller waiting forever, since `retry` only reacts to an
// observable actually erroring - `timeout` turns "no response" into an error too.
// Other requests and methods pass through untouched.
export function createRetryInterceptor(config: RetryConfig = DEFAULT_CONFIG): HttpInterceptorFn {
  return (req, next) => {
    if (req.method !== 'GET' || !req.url.startsWith(RADIO_BROWSER_API_BASE)) {
      return next(req);
    }

    return next(req).pipe(
      timeout(config.requestTimeoutMs),
      retry({
        count: config.maxRetries,
        delay: (_error, retryCount) => timer(backoffMs(config.baseDelayMs, retryCount)),
      }),
    );
  };
}

export const retryInterceptor = createRetryInterceptor();
