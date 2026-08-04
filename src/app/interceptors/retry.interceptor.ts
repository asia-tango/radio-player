import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

import { RADIO_BROWSER_API_BASE } from '../data/radio-browser.config';

const MAX_RETRIES = 2; // plus the initial attempt, that's 3 attempts total
const BASE_DELAY_MS = 500;

// Delay grows exponentially (500ms -> 1000ms) instead of linearly, giving the
// backend increasingly more time to recover after each failed attempt.
function backoffMs(retryCount: number): number {
  return BASE_DELAY_MS * 2 ** (retryCount - 1);
}

// Retries failed GET requests to the Radio Browser API before giving up. Other
// requests and methods pass through untouched.
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET' || !req.url.startsWith(RADIO_BROWSER_API_BASE)) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (_error, retryCount) => timer(backoffMs(retryCount)),
    }),
  );
};
