export interface County {
  name: string;
  towns: string[];
}

export interface Country {
  name: string;
  code: string;
  phoneCode: string;
  counties: County[];
}

export const COUNTRIES: Country[] = [
  {
    name: "Kenya",
    code: "KE",
    phoneCode: "+254",
    counties: [
      { name: "Nairobi", towns: ["CBD", "Westlands", "Karen", "Kilimani", "Upper Hill", "Parklands", "Thika Road", "Gateway"] },
      { name: "Mombasa", towns: ["City Centre", "Likoni", "Changamwe", "Kisauni", "Tudor", "Serani"] },
      { name: "Kisumu", towns: ["CBD", "Nyamaranda", "Ondiek", "Muhoma", "Nyalenda"] },
      { name: "Nakuru", towns: ["CBD", "Kapseret", "Lanet", "Flamingo", "Nairobi Road"] },
      { name: "Eldoret", towns: ["CBD", "Kapsoit", "Langas", "Munyaka", "Mapesi"] },
      { name: "Kiambu", towns: ["Kiambu Town", "Limuru", "Thika", "Banana Hill", "Tigoni"] },
      { name: "Machakos", towns: ["Machakos Town", "Kangundo", "Athi River", "Matungulu", "Mbiuni"] },
      { name: "Naivasha", towns: ["Naivasha Town", "Olkaria", "Mai Mahiu", "Kongoni", "Biashara"] },
      { name: "Nyeri", towns: ["Nyeri Town", "Othaya", "Mukurweini", "Karatina", "Tetu"] },
      { name: "Kericho", towns: ["Kericho Town", "Belgaum", "Chepseon", "Kipchoge", "Silibwet"] },
    ]
  },
  {
    name: "Uganda",
    code: "UG",
    phoneCode: "+256",
    counties: [
      { name: "Kampala", towns: ["CBD", "Kololo", "Mulago", "Kasubi", "Makindye", "Kawempe"] },
      { name: "Wakiso", towns: ["Wakiso", "Namisindwa", "Mukono", "Mpigi"] },
      { name: "Jinja", towns: ["Jinja City", "Dohos", "Bugembe", "Njeru"] },
      { name: "Mbarara", towns: ["Mbarara City", "Kabale", "Kamwenge", "Kyotera"] },
    ]
  },
  {
    name: "Tanzania",
    code: "TZ",
    phoneCode: "+255",
    counties: [
      { name: "Dar es Salaam", towns: ["Dar City", "Kinondoni", "Temeke", "Ilala"] },
      { name: "Dodoma", towns: ["Dodoma City", "Chamwino", "Iringa", "Morogoro"] },
      { name: "Arusha", towns: ["Arusha City", "Moshi", "Kilimanjaro", "Tanga"] },
    ]
  },
  {
    name: "Rwanda",
    code: "RW",
    phoneCode: "+250",
    counties: [
      { name: "Kigali", towns: ["Kigali City", "Kicukiro", "Gasabo", "Nyarugenge"] },
      { name: "Huye", towns: ["Huye Town", "Nyamagabe", "Nyanza"] },
      { name: "Gitarama", towns: ["Gitarama Town", "Rwamagana", "Muhanga"] },
    ]
  },
  {
    name: "South Africa",
    code: "ZA",
    phoneCode: "+27",
    counties: [
      { name: "Gauteng", towns: ["Johannesburg", "Pretoria", "Sandton", "Midrand", "Centurion"] },
      { name: "Western Cape", towns: ["Cape Town", "Stellenbosch", "Bellville", "Observatory"] },
      { name: "KwaZulu-Natal", towns: ["Durban", "Pietermaritzburg", "Pinetown", "Umhlanga"] },
    ]
  },
];

export const COUNTRY_NAMES = COUNTRIES.map(c => c.name);
export const COUNTRY_PHONE_CODES = COUNTRIES.map(c => c.phoneCode);

export function getCountriesByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getCountriesByPhoneCode(phoneCode: string): Country | undefined {
  return COUNTRIES.find(c => c.phoneCode === phoneCode);
}

export function getCountiesByCountry(countryName: string): County[] {
  const country = COUNTRIES.find(c => c.name === countryName);
  return country?.counties || [];
}

export function getTownsByCounty(countryName: string, countyName: string): string[] {
  const country = COUNTRIES.find(c => c.name === countryName);
  const county = country?.counties.find(co => co.name === countyName);
  return county?.towns || [];
}
