import { Station } from '../models/station.model';

const BANNED_COUNTRY_CODES = new Set(['RU', 'BY']);
const BANNED_COUNTRY_NAME_PATTERN = /russia|belarus/i;

function isBannedStation(station: Station): boolean {
  if (BANNED_COUNTRY_CODES.has(station.countrycode?.toUpperCase())) {
    return true;
  }
  return BANNED_COUNTRY_NAME_PATTERN.test(station.country ?? '');
}

export function excludeBannedStations(stations: Station[]): Station[] {
  return stations.filter((station) => !isBannedStation(station));
}
