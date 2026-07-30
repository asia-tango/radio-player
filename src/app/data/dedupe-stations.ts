import { Station } from '../models/station.model';

// Radio Browser often lists the same physical stream twice under slightly
// different names (e.g. "...HD Opus" mirrors). Same url_resolved -> same
// station, so keep only the first (highest-voted, since results are sorted
// by votes) occurrence.
export function dedupeStations(stations: Station[]): Station[] {
  const seen = new Set<string>();
  const result: Station[] = [];

  for (const station of stations) {
    const key = (station.url_resolved || station.url).trim().toLowerCase();
    if (key) {
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
    }
    result.push(station);
  }

  return result;
}
