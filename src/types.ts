export interface IVendorStat {
  callTime: Date;
  apiLatency: number;
}

export interface IVendorStats {
  [name: string]: IVendorStat[];
}

export interface IPCache {
  [ipBClass: string]: string; // country
}

export interface IAPIInfo {
  success: boolean;
  errorCode?: string;

  countryName?: string;
  apiLatency?: number;
  vendor?: string;
}
