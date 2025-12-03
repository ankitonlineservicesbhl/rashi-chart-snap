// Astronomical calculation constants
const DEGS = 180 / Math.PI;
const RADS = Math.PI / 180;
const EPS = 1.0e-12;

// Planet indices
export const AS = 0, SU = 1, MO = 2, MA = 3, ME = 4, JU = 5, VE = 6, SA = 7, RA = 8, KE = 9;

// Zodiac signs
export const zodiacNames = [
  '', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export interface BirthData {
  name: string;
  date: Date;
  time: { hours: number; minutes: number };
  tz: number;
  lat: number;
  lon: number;
}

export interface Planet {
  name: string;
  index: number;
  ra: number;
  zodiac: string;
  degree: number;
  rasizn: number;
  navzn: number;
  nakshatra: string;
  nakshatraLord: string;
  nakshatraPada: number;
}

function _abs(x: number): number {
  return x >= 0.0 ? Math.floor(x) : Math.ceil(x);
}

function mod360(x: number): number {
  let a = 360 * ((x / 360) - _abs(x / 360));
  if (a < 0) a = a + 360;
  return a;
}

function mod2pi(x: number): number {
  let b = x / (2 * Math.PI);
  let a = (2 * Math.PI) * (b - _abs(b));
  if (a < 0) a = (2 * Math.PI) + a;
  return a;
}

function calcDayNumber(birthData: BirthData): number {
  const { date, time, tz } = birthData;
  let yy = date.getFullYear();
  let mm = date.getMonth() + 1;
  const dd = date.getDate();
  
  if (mm < 3) { yy -= 1; mm += 12; }
  
  let b: number;
  if (yy * 10000 + mm * 100 + dd > 15821004) {
    const a = Math.floor(0.01 * yy);
    b = 2 - a + Math.floor(0.25 * a);
  } else {
    b = 0;
  }
  
  const c = Math.floor(365.25 * yy);
  const d = Math.floor(30.6001 * (mm + 1));
  
  return (b + c + d - 730550.5 + dd + (((time.hours - tz)) + time.minutes / 60.0) / 24.0);
}

function calcJulianDate(birthData: BirthData): number {
  const { date, time, tz } = birthData;
  let yy = date.getFullYear();
  let mm = date.getMonth() + 1;
  const dd = date.getDate();
  
  let jy = yy;
  let jm: number;
  if (mm > 2) { jy = yy; jm = mm + 1; }
  else { jy--; jm = mm + 13; }
  
  let j = Math.floor(365.25 * jy) + Math.floor(30.6001 * jm) + dd + 1720995.0;
  if (dd + 31 * (mm + 12 * yy) >= 588829) {
    const a = Math.floor(0.01 * jy);
    j += 2 - a + Math.floor(0.25 * a);
  }
  
  let df = (time.hours - tz) / 24.0 - 0.5;
  if (df < 0.0) { df += 1.0; --j; }
  
  const dT = calcDeltaT(date.getFullYear());
  const fc = df + (time.minutes + dT / 60.0) / 60.0 / 24.0;
  let jd = Math.floor(((j + fc) * 10000000));
  if ((((j + fc) * 10000000) - jd) > 0.5) ++jd;
  else jd *= 1.0;
  return (jd * 0.0000001);
}

function calcDeltaT(year: number): number {
  const y = year + 0.5 / 12;
  const c = -0.000012932 * Math.pow((y - 1955), 2);
  let dt = 0;
  
  if (y > 2005 && y <= 2050) {
    const t = (y - 2000);
    dt = 62.92 + 0.32217 * t + 0.005589 * t * t + c;
  } else if (y > 1986 && y <= 2005) {
    const t = (y - 2000);
    dt = 3.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t
      + 0.000651814 * t * t * t * t + 0.00002373599 * t * t * t * t * t;
  }
  
  return dt;
}

function calcAyanamsa(date: Date): number {
  const yy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  
  const d = yy < 100 ? 10 : 1000;
  const c = yy * 1.0 / d;
  const a = -6.92416 + 16.90709 * c - 0.757371 * c * c;
  const b = (mm + dd / 30) * 1.1574074 / d;
  
  return a + b;
}

function calcSiderealTime(birthData: BirthData): number {
  const { time, lon } = birthData;
  const dn = calcDayNumber(birthData);
  const t = dn / 36525.0;
  const tt = t * 36525.0;
  const LMST = mod360(280.46061837 + 360.98564736629 * tt
    + 0.000387933 * t * t - (t * t * t) / 38710000 + lon);
  return LMST;
}

function calcEclipticObliquity(jd: number): number {
  const cy = jd / 36525.0;
  return 23 + (26 / 60.0) + (21.448 / 3600.0) - (46.815 * cy) / 3600;
}

function calcAscendant(birthData: BirthData): number {
  const { time, lat } = birthData;
  const t = calcSiderealTime(birthData);
  const jd = calcJulianDate(birthData);
  const ecl = calcEclipticObliquity(jd);
  
  const asc = Math.atan2(Math.cos(t * RADS), -Math.sin(t * RADS) * Math.cos(ecl * RADS)
    - Math.tan(lat * RADS) * Math.sin(ecl * RADS));
  
  return asc * DEGS;
}

// Simplified planetary calculations using mean elements
function calcPlanetPosition(planet: number, dn: number): number {
  const cy = dn / 36525;
  
  // Mean elements for planets (simplified)
  const elements: { [key: number]: { L: number; rate: number } } = {
    [SU]: { L: 280.46457, rate: 0.98564736 },
    [MO]: { L: 218.316, rate: 13.176396 },
    [MA]: { L: 355.4533, rate: 0.524071 },
    [ME]: { L: 252.251, rate: 4.09233 },
    [JU]: { L: 34.4044, rate: 0.08309 },
    [VE]: { L: 181.9798, rate: 1.60214 },
    [SA]: { L: 49.9443, rate: 0.03346 },
  };
  
  if (elements[planet]) {
    return mod360(elements[planet].L + elements[planet].rate * dn);
  }
  return 0;
}

// High precision Moon position calculation (simplified version)
function calcMoonPosition(birthData: BirthData): number {
  const jd = calcJulianDate(birthData);
  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T * T * T;
  const T4 = T * T * T * T;
  
  let lprime = mod2pi((218.3164591 + 481267.88134236 * T - 0.0013268 * T2 + T3 / 538841.0 - T4 / 65194000.0) * RADS);
  const d = mod2pi((297.8502042 + 445267.1115168 * T - 0.00163 * T2 + T3 / 545868.0 - T4 / 113065000.0) * RADS);
  const m = mod2pi((357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000.0) * RADS);
  const mprime = mod2pi((134.9634114 + 477198.8676313 * T + 0.008997 * T2 + T3 / 69699.0 - T4 / 14712000.0) * RADS);
  const f = mod2pi((93.2720993 + 483202.0175273 * T - 0.0034029 * T2 - T3 / 3526000.0 + T4 / 863310000.0) * RADS);
  
  const a1 = mod2pi((119.75 + 131.849 * T) * RADS);
  const a2 = mod2pi((53.09 + 479264.29 * T) * RADS);
  
  // Simplified sigma calculation
  let sigmaL = 6288774 * Math.sin(mprime)
    + 1274027 * Math.sin(2 * d - mprime)
    + 658314 * Math.sin(2 * d)
    + 213618 * Math.sin(2 * mprime)
    - 185116 * Math.sin(m)
    - 114332 * Math.sin(2 * f);
  
  sigmaL += 3958.0 * Math.sin(a1) + 1962.0 * Math.sin(lprime - f) + 318.0 * Math.sin(a2);
  
  const l = mod2pi(((lprime * DEGS) + sigmaL / 1000000.0) * RADS) * DEGS;
  
  return l;
}

function calcMoonAscendingNode(birthData: BirthData): number {
  const jd = calcJulianDate(birthData);
  const T = (jd - 2415020.5) / 36525.0;
  const ay = calcAyanamsa(birthData.date);
  
  const n = mod2pi((259.183275 - 1800 * T - 134.142008 * T + 0.002078 * T * T) * RADS) * DEGS;
  
  return n - ay;
}

function calcZodiac(deg: number): number {
  const d = mod360(deg);
  if (d >= 0 && d <= 30) return 1;
  if (d > 30 && d <= 60) return 2;
  if (d > 60 && d <= 90) return 3;
  if (d > 90 && d <= 120) return 4;
  if (d > 120 && d <= 150) return 5;
  if (d > 150 && d <= 180) return 6;
  if (d > 180 && d <= 210) return 7;
  if (d > 210 && d <= 240) return 8;
  if (d > 240 && d <= 270) return 9;
  if (d > 270 && d <= 300) return 10;
  if (d > 300 && d <= 330) return 11;
  return 12;
}

function calcNakshatra(deg: number): { name: string; lord: string; pada: number } {
  const nakshatras = [
    { name: 'Ashvini', lord: 'Ke' }, { name: 'Bharani', lord: 'Ve' }, { name: 'Krittika', lord: 'Su' },
    { name: 'Rohini', lord: 'Mo' }, { name: 'Mrigashir', lord: 'Ma' }, { name: 'Ardra', lord: 'Ra' },
    { name: 'Punarvasu', lord: 'Ju' }, { name: 'Pushya', lord: 'Sa' }, { name: 'Ashlesha', lord: 'Me' },
    { name: 'Magha', lord: 'Ke' }, { name: 'P.Phalg', lord: 'Ve' }, { name: 'U.Phalg', lord: 'Su' },
    { name: 'Hasta', lord: 'Mo' }, { name: 'Chitra', lord: 'Ma' }, { name: 'Svati', lord: 'Ra' },
    { name: 'Vishakha', lord: 'Ju' }, { name: 'Anuradha', lord: 'Sa' }, { name: 'Jyeshtha', lord: 'Me' },
    { name: 'Mula', lord: 'Ke' }, { name: 'P.Shadha', lord: 'Ve' }, { name: 'U.Shadha', lord: 'Su' },
    { name: 'Sravana', lord: 'Mo' }, { name: 'Dhanista', lord: 'Ma' }, { name: 'Shatabhi', lord: 'Ra' },
    { name: 'P.Bhadra', lord: 'Ju' }, { name: 'U.Bhadra', lord: 'Sa' }, { name: 'Revati', lord: 'Me' }
  ];
  
  let d = deg < 0 ? deg + 360 : deg;
  const nakshatraIndex = Math.floor(d / 13.3333) % 27;
  const posInNakshatra = d % 13.3333;
  const pada = Math.floor(posInNakshatra / 3.3333) + 1;
  
  return {
    name: nakshatras[nakshatraIndex].name,
    lord: nakshatras[nakshatraIndex].lord,
    pada: Math.min(pada, 4)
  };
}

export function calculateChart(birthData: BirthData): { planets: Planet[]; rashis: number[]; houses: string[][] } {
  const ay = calcAyanamsa(birthData.date);
  const dn = calcDayNumber(birthData);
  const jd = calcJulianDate(birthData);
  
  // Calculate Ascendant
  const ascDeg = calcAscendant(birthData) - ay;
  const ascZodiac = calcZodiac(ascDeg);
  
  // Calculate Rashis (zodiac signs for each house)
  const rashis: number[] = [];
  let x = 1;
  for (let i = 0; i < 12; i++) {
    if (ascZodiac + i > 12) { rashis[i] = x; x++; }
    else { rashis[i] = ascZodiac + i; }
  }
  
  // Calculate planets
  const planets: Planet[] = [];
  
  // Ascendant
  const ascNakshatra = calcNakshatra(mod360(ascDeg));
  planets[AS] = {
    name: 'As',
    index: AS,
    ra: mod360(ascDeg),
    zodiac: zodiacNames[ascZodiac],
    degree: mod360(ascDeg) % 30,
    rasizn: ascZodiac,
    navzn: calcZodiac(mod2pi(mod360(ascDeg) * 9 * RADS) * DEGS),
    nakshatra: ascNakshatra.name,
    nakshatraLord: ascNakshatra.lord,
    nakshatraPada: ascNakshatra.pada
  };
  
  // Sun
  const sunDeg = mod360(calcPlanetPosition(SU, dn) - ay);
  const sunNakshatra = calcNakshatra(sunDeg);
  planets[SU] = {
    name: 'Su',
    index: SU,
    ra: sunDeg,
    zodiac: zodiacNames[calcZodiac(sunDeg)],
    degree: sunDeg % 30,
    rasizn: calcZodiac(sunDeg),
    navzn: calcZodiac(mod2pi(sunDeg * 9 * RADS) * DEGS),
    nakshatra: sunNakshatra.name,
    nakshatraLord: sunNakshatra.lord,
    nakshatraPada: sunNakshatra.pada
  };
  
  // Moon
  const moonDeg = mod360(calcMoonPosition(birthData) - ay);
  const moonNakshatra = calcNakshatra(moonDeg);
  planets[MO] = {
    name: 'Mo',
    index: MO,
    ra: moonDeg,
    zodiac: zodiacNames[calcZodiac(moonDeg)],
    degree: moonDeg % 30,
    rasizn: calcZodiac(moonDeg),
    navzn: calcZodiac(mod2pi(moonDeg * 9 * RADS) * DEGS),
    nakshatra: moonNakshatra.name,
    nakshatraLord: moonNakshatra.lord,
    nakshatraPada: moonNakshatra.pada
  };
  
  // Mars
  const marsDeg = mod360(calcPlanetPosition(MA, dn) - ay);
  const marsNakshatra = calcNakshatra(marsDeg);
  planets[MA] = {
    name: 'Ma',
    index: MA,
    ra: marsDeg,
    zodiac: zodiacNames[calcZodiac(marsDeg)],
    degree: marsDeg % 30,
    rasizn: calcZodiac(marsDeg),
    navzn: calcZodiac(mod2pi(marsDeg * 9 * RADS) * DEGS),
    nakshatra: marsNakshatra.name,
    nakshatraLord: marsNakshatra.lord,
    nakshatraPada: marsNakshatra.pada
  };
  
  // Mercury
  const mercDeg = mod360(calcPlanetPosition(ME, dn) - ay);
  const mercNakshatra = calcNakshatra(mercDeg);
  planets[ME] = {
    name: 'Me',
    index: ME,
    ra: mercDeg,
    zodiac: zodiacNames[calcZodiac(mercDeg)],
    degree: mercDeg % 30,
    rasizn: calcZodiac(mercDeg),
    navzn: calcZodiac(mod2pi(mercDeg * 9 * RADS) * DEGS),
    nakshatra: mercNakshatra.name,
    nakshatraLord: mercNakshatra.lord,
    nakshatraPada: mercNakshatra.pada
  };
  
  // Jupiter
  const jupDeg = mod360(calcPlanetPosition(JU, dn) - ay);
  const jupNakshatra = calcNakshatra(jupDeg);
  planets[JU] = {
    name: 'Ju',
    index: JU,
    ra: jupDeg,
    zodiac: zodiacNames[calcZodiac(jupDeg)],
    degree: jupDeg % 30,
    rasizn: calcZodiac(jupDeg),
    navzn: calcZodiac(mod2pi(jupDeg * 9 * RADS) * DEGS),
    nakshatra: jupNakshatra.name,
    nakshatraLord: jupNakshatra.lord,
    nakshatraPada: jupNakshatra.pada
  };
  
  // Venus
  const venDeg = mod360(calcPlanetPosition(VE, dn) - ay);
  const venNakshatra = calcNakshatra(venDeg);
  planets[VE] = {
    name: 'Ve',
    index: VE,
    ra: venDeg,
    zodiac: zodiacNames[calcZodiac(venDeg)],
    degree: venDeg % 30,
    rasizn: calcZodiac(venDeg),
    navzn: calcZodiac(mod2pi(venDeg * 9 * RADS) * DEGS),
    nakshatra: venNakshatra.name,
    nakshatraLord: venNakshatra.lord,
    nakshatraPada: venNakshatra.pada
  };
  
  // Saturn
  const satDeg = mod360(calcPlanetPosition(SA, dn) - ay);
  const satNakshatra = calcNakshatra(satDeg);
  planets[SA] = {
    name: 'Sa',
    index: SA,
    ra: satDeg,
    zodiac: zodiacNames[calcZodiac(satDeg)],
    degree: satDeg % 30,
    rasizn: calcZodiac(satDeg),
    navzn: calcZodiac(mod2pi(satDeg * 9 * RADS) * DEGS),
    nakshatra: satNakshatra.name,
    nakshatraLord: satNakshatra.lord,
    nakshatraPada: satNakshatra.pada
  };
  
  // Rahu
  const rahuDeg = mod360(calcMoonAscendingNode(birthData));
  const rahuNakshatra = calcNakshatra(rahuDeg);
  planets[RA] = {
    name: 'Ra',
    index: RA,
    ra: rahuDeg,
    zodiac: zodiacNames[calcZodiac(rahuDeg)],
    degree: rahuDeg % 30,
    rasizn: calcZodiac(rahuDeg),
    navzn: calcZodiac(mod2pi(rahuDeg * 9 * RADS) * DEGS),
    nakshatra: rahuNakshatra.name,
    nakshatraLord: rahuNakshatra.lord,
    nakshatraPada: rahuNakshatra.pada
  };
  
  // Ketu
  const ketuDeg = mod360(rahuDeg + 180);
  const ketuNakshatra = calcNakshatra(ketuDeg);
  planets[KE] = {
    name: 'Ke',
    index: KE,
    ra: ketuDeg,
    zodiac: zodiacNames[calcZodiac(ketuDeg)],
    degree: ketuDeg % 30,
    rasizn: calcZodiac(ketuDeg),
    navzn: calcZodiac(mod2pi(ketuDeg * 9 * RADS) * DEGS),
    nakshatra: ketuNakshatra.name,
    nakshatraLord: ketuNakshatra.lord,
    nakshatraPada: ketuNakshatra.pada
  };
  
  // Calculate houses
  const houses: string[][] = Array(12).fill(null).map(() => []);
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 10; j++) {
      if (rashis[i] === planets[j].rasizn) {
        houses[i].push(planets[j].name);
      }
    }
  }
  
  return { planets, rashis, houses };
}

export function parseLatitude(input: string): number {
  const tmp = input.replace(/\s+/g, "").toUpperCase();
  if (tmp.indexOf("N") !== -1) {
    const parts = tmp.split("N");
    return parseInt(parts[0]) + (parseInt(parts[1]) || 0) / 60;
  } else if (tmp.indexOf("S") !== -1) {
    const parts = tmp.split("S");
    return -(parseInt(parts[0]) + (parseInt(parts[1]) || 0) / 60);
  }
  return parseFloat(input) || 0;
}

export function parseLongitude(input: string): number {
  const tmp = input.replace(/\s+/g, "").toUpperCase();
  if (tmp.indexOf("E") !== -1) {
    const parts = tmp.split("E");
    return parseInt(parts[0]) + (parseInt(parts[1]) || 0) / 60;
  } else if (tmp.indexOf("W") !== -1) {
    const parts = tmp.split("W");
    return -(parseInt(parts[0]) + (parseInt(parts[1]) || 0) / 60);
  }
  return parseFloat(input) || 0;
}
