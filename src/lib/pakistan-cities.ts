// =============================================================================
// Pakistan Cities Database for Carrier Integration
// =============================================================================

export interface PakistanCity {
  name: string
  code: string       // TCS city code
  leopardsCode: string // Leopards Courier city code
  province: string
  isMajor: boolean   // Major city with full carrier coverage
}

export const PAKISTAN_CITIES: PakistanCity[] = [
  // Punjab
  { name: 'Lahore', code: 'LHE', leopardsCode: 'LHR', province: 'Punjab', isMajor: true },
  { name: 'Faisalabad', code: 'FSD', leopardsCode: 'FSD', province: 'Punjab', isMajor: true },
  { name: 'Rawalpindi', code: 'RWP', leopardsCode: 'RWP', province: 'Punjab', isMajor: true },
  { name: 'Multan', code: 'MUX', leopardsCode: 'MLT', province: 'Punjab', isMajor: true },
  { name: 'Gujranwala', code: 'GRW', leopardsCode: 'GRW', province: 'Punjab', isMajor: true },
  { name: 'Sialkot', code: 'SKT', leopardsCode: 'SKT', province: 'Punjab', isMajor: true },
  { name: 'Bahawalpur', code: 'BWP', leopardsCode: 'BWP', province: 'Punjab', isMajor: false },
  { name: 'Sargodha', code: 'SGD', leopardsCode: 'SGD', province: 'Punjab', isMajor: false },
  { name: 'Sahiwal', code: 'SWL', leopardsCode: 'SWL', province: 'Punjab', isMajor: false },
  { name: 'Okara', code: 'OKR', leopardsCode: 'OKR', province: 'Punjab', isMajor: false },
  { name: 'Kasur', code: 'KSR', leopardsCode: 'KSR', province: 'Punjab', isMajor: false },
  { name: 'Chiniot', code: 'CHT', leopardsCode: 'CHT', province: 'Punjab', isMajor: false },
  { name: 'Jhang', code: 'JHG', leopardsCode: 'JHG', province: 'Punjab', isMajor: false },
  { name: 'Gujrat', code: 'GRT', leopardsCode: 'GRT', province: 'Punjab', isMajor: false },
  { name: 'Mandi Bahauddin', code: 'MBD', leopardsCode: 'MBD', province: 'Punjab', isMajor: false },
  { name: 'Hafizabad', code: 'HFD', leopardsCode: 'HFD', province: 'Punjab', isMajor: false },
  { name: 'Khanewal', code: 'KNW', leopardsCode: 'KNW', province: 'Punjab', isMajor: false },
  { name: 'Vehari', code: 'VHR', leopardsCode: 'VHR', province: 'Punjab', isMajor: false },
  { name: 'Muzaffargarh', code: 'MZG', leopardsCode: 'MZG', province: 'Punjab', isMajor: false },
  { name: 'Rahim Yar Khan', code: 'RYK', leopardsCode: 'RYK', province: 'Punjab', isMajor: false },
  { name: 'Lodhran', code: 'LDR', leopardsCode: 'LDR', province: 'Punjab', isMajor: false },
  { name: 'Dera Ghazi Khan', code: 'DGK', leopardsCode: 'DGK', province: 'Punjab', isMajor: false },
  { name: 'Narowal', code: 'NWL', leopardsCode: 'NWL', province: 'Punjab', isMajor: false },
  { name: 'Sheikhupura', code: 'SKP', leopardsCode: 'SKP', province: 'Punjab', isMajor: false },
  { name: 'Nankana Sahib', code: 'NKS', leopardsCode: 'NKS', province: 'Punjab', isMajor: false },

  // Sindh
  { name: 'Karachi', code: 'KHI', leopardsCode: 'KHI', province: 'Sindh', isMajor: true },
  { name: 'Hyderabad', code: 'HYD', leopardsCode: 'HYD', province: 'Sindh', isMajor: true },
  { name: 'Sukkur', code: 'SKZ', leopardsCode: 'SKR', province: 'Sindh', isMajor: false },
  { name: 'Larkana', code: 'LRK', leopardsCode: 'LRK', province: 'Sindh', isMajor: false },
  { name: 'Mirpurkhas', code: 'MPK', leopardsCode: 'MPK', province: 'Sindh', isMajor: false },
  { name: 'Nawabshah', code: 'NWS', leopardsCode: 'NWS', province: 'Sindh', isMajor: false },
  { name: 'Jacobabad', code: 'JCB', leopardsCode: 'JCB', province: 'Sindh', isMajor: false },
  { name: 'Thatta', code: 'THA', leopardsCode: 'THA', province: 'Sindh', isMajor: false },
  { name: 'Badin', code: 'BDN', leopardsCode: 'BDN', province: 'Sindh', isMajor: false },
  { name: 'Dadu', code: 'DDU', leopardsCode: 'DDU', province: 'Sindh', isMajor: false },
  { name: 'Shikarpur', code: 'SKP2', leopardsCode: 'SKP2', province: 'Sindh', isMajor: false },
  { name: 'Khairpur', code: 'KHR', leopardsCode: 'KHR', province: 'Sindh', isMajor: false },

  // Khyber Pakhtunkhwa
  { name: 'Peshawar', code: 'PEW', leopardsCode: 'PSW', province: 'KPK', isMajor: true },
  { name: 'Abbottabad', code: 'ABT', leopardsCode: 'ABT', province: 'KPK', isMajor: false },
  { name: 'Mardan', code: 'MDN', leopardsCode: 'MDN', province: 'KPK', isMajor: false },
  { name: 'Swat', code: 'SWT', leopardsCode: 'SWT', province: 'KPK', isMajor: false },
  { name: 'Mansehra', code: 'MNS', leopardsCode: 'MNS', province: 'KPK', isMajor: false },
  { name: 'Kohat', code: 'KHT', leopardsCode: 'KHT', province: 'KPK', isMajor: false },
  { name: 'Dera Ismail Khan', code: 'DIK', leopardsCode: 'DIK', province: 'KPK', isMajor: false },
  { name: 'Bannu', code: 'BNU', leopardsCode: 'BNU', province: 'KPK', isMajor: false },
  { name: 'Nowshera', code: 'NWR', leopardsCode: 'NWR', province: 'KPK', isMajor: false },
  { name: 'Charsadda', code: 'CSD', leopardsCode: 'CSD', province: 'KPK', isMajor: false },
  { name: 'Swabi', code: 'SWB', leopardsCode: 'SWB', province: 'KPK', isMajor: false },
  { name: 'Haripur', code: 'HRP', leopardsCode: 'HRP', province: 'KPK', isMajor: false },
  { name: 'Mingora', code: 'MGR', leopardsCode: 'MGR', province: 'KPK', isMajor: false },

  // Balochistan
  { name: 'Quetta', code: 'UET', leopardsCode: 'QTA', province: 'Balochistan', isMajor: true },
  { name: 'Turbat', code: 'TBT', leopardsCode: 'TBT', province: 'Balochistan', isMajor: false },
  { name: 'Khuzdar', code: 'KZD', leopardsCode: 'KZD', province: 'Balochistan', isMajor: false },
  { name: 'Gwadar', code: 'GWD', leopardsCode: 'GWD', province: 'Balochistan', isMajor: false },
  { name: 'Chaman', code: 'CMN', leopardsCode: 'CMN', province: 'Balochistan', isMajor: false },
  { name: 'Zhob', code: 'ZHB', leopardsCode: 'ZHB', province: 'Balochistan', isMajor: false },
  { name: 'Sibi', code: 'SBI', leopardsCode: 'SBI', province: 'Balochistan', isMajor: false },
  { name: 'Lasbela', code: 'LSB', leopardsCode: 'LSB', province: 'Balochistan', isMajor: false },
  { name: 'Hub', code: 'HUB', leopardsCode: 'HUB', province: 'Balochistan', isMajor: false },

  // Islamabad Capital Territory
  { name: 'Islamabad', code: 'ISB', leopardsCode: 'ISB', province: 'ICT', isMajor: true },

  // Azad Jammu & Kashmir
  { name: 'Muzaffarabad', code: 'MZF', leopardsCode: 'MZF', province: 'AJK', isMajor: false },
  { name: 'Mirpur', code: 'MPR', leopardsCode: 'MPR', province: 'AJK', isMajor: false },
  { name: 'Kotli', code: 'KTL', leopardsCode: 'KTL', province: 'AJK', isMajor: false },
  { name: 'Bagh', code: 'BGH', leopardsCode: 'BGH', province: 'AJK', isMajor: false },
  { name: 'Rawalakot', code: 'RLK', leopardsCode: 'RLK', province: 'AJK', isMajor: false },

  // Gilgit-Baltistan
  { name: 'Gilgit', code: 'GIL', leopardsCode: 'GIL', province: 'GB', isMajor: false },
  { name: 'Skardu', code: 'SKD', leopardsCode: 'SKD', province: 'GB', isMajor: false },
  { name: 'Hunza', code: 'HNZ', leopardsCode: 'HNZ', province: 'GB', isMajor: false },
]

/** Get city by name (case-insensitive) */
export function getCityByName(name: string): PakistanCity | undefined {
  return PAKISTAN_CITIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  )
}

/** Get TCS city code by city name */
export function getTCSCityCode(cityName: string): string {
  return getCityByName(cityName)?.code || cityName.toUpperCase().slice(0, 3)
}

/** Get Leopards city code by city name */
export function getLeopardsCityCode(cityName: string): string {
  return getCityByName(cityName)?.leopardsCode || cityName.toUpperCase().slice(0, 3)
}

/** Get major cities (for carrier selection UI) */
export function getMajorCities(): PakistanCity[] {
  return PAKISTAN_CITIES.filter((c) => c.isMajor)
}

/** Get cities by province */
export function getCitiesByProvince(province: string): PakistanCity[] {
  return PAKISTAN_CITIES.filter(
    (c) => c.province.toLowerCase() === province.toLowerCase()
  )
}

/** Get all provinces */
export function getProvinces(): string[] {
  return [...new Set(PAKISTAN_CITIES.map((c) => c.province))]
}
