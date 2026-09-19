export interface StateCities {
  state: string;
  cities: string[];
}

export interface LocationsPayload {
  success: boolean;
  data: StateCities[];
}

