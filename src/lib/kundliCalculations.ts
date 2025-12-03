// This file wraps the original kundli.js calculations
// The heavy astronomical calculations are loaded from /kundli.js

declare global {
  interface Window {
    // VSOP87 calculation functions from kundli.js
    calc_earth: (T: number) => void;
    calc_mars: (T: number) => void;
    calc_mercury: (T: number) => void;
    calc_jupiter: (T: number) => void;
    calc_venus: (T: number) => void;
    calc_shani: (T: number) => void;
    earth: number[];
    mars: number[];
    mercury: number[];
    jupiter: number[];
    venus: number[];
    shani: number[];
  }
}

// Constants
const DEGS = 180 / Math.PI;
const RADS = Math.PI / 180;

export const AS = 0, SU = 1, MO = 2, MA = 3, ME = 4, JU = 5, VE = 6, SA = 7, RA = 8, KE = 9;

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
    const a = Math.floor(0.01 * yy);
    b = 0 * (2 - a + Math.floor(0.25 * a));
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
  const t2 = 0, t3 = 0, t4 = 0, t5 = 0;
  
  if (y <= -500) {
    const u = (y - 1820) / 100;
    dt = -20 + 32 * u * u + c;
  } else if (y < -500 && y <= 500) {
    const u = y / 100;
    dt = 10583.6 - 1014.41 * u + 33.78311 * u * u - 5.952053 * u * u * u
      - 0.1798452 * u * u * u * u + 0.022174192 * u * u * u * u * u + 0.0090316521 * u * u * u * u * u * u + c;
  } else if (y > 500 && y <= 1600) {
    const u = (y - 1000) / 100;
    dt = 1574.2 - 556.01 * u + 71.23472 * u * u + 0.319781 * u * u * u
      - 0.8503463 * u * u * u * u - 0.005050998 * u * u * u * u * u + 0.0083572073 * u * u * u * u * u * u + c;
  } else if (y > 1600 && y <= 1700) {
    const t = (y - 1600);
    dt = 120 - 0.9808 * t - 0.01532 * t * t + t * t * t / 7129 + c;
  } else if (y > 1700 && y <= 1800) {
    const t = (y - 1800);
    dt = 13.72 - 0.332447 * t + 0.0068612 * t * t + 0.0041116 * t * t * t
      - 0.00037436 * t * t * t * t + 0.0000121272 * t * t * t * t * t - 0.0000001699 * t * t * t * t * t * t
      + 0.000000000875 * t * t * t * t * t * t * t + c;
  } else if (y > 1860 && y <= 1900) {
    const t = (y - 1860);
    dt = 7.62 + 0.5737 * t - 0.251754 * t * t + 0.01680668 * t * t * t
      - 0.0004473624 * t * t * t * t + t * t * t * t * t / 233174 + c;
  } else if (y > 1900 && y <= 1920) {
    const t = (y - 1920);
    dt = 21.20 + 0.84493 * t - 0.076100 * t * t + 0.0020936 * t * t * t + c;
  } else if (y > 1941 && y <= 1961) {
    const t = (y - 1950);
    dt = 29.07 + 0.407 * t - t * t / 233 + t * t * t / 2547;
  } else if (y > 1961 && y <= 1986) {
    const t = (y - 1975);
    dt = 45.45 + 1.067 * t - t * t / 260 - t * t * t / 718;
  } else if (y > 1986 && y <= 2005) {
    const t = (y - 2000);
    dt = 3.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t
      + 0.000651814 * t * t * t * t + 0.00002373599 * t * t * t * t * t;
  } else if (y > 2005 && y <= 2050) {
    const t = (y - 2000);
    dt = 62.92 + 0.32217 * t + 0.005589 * t * t + c;
  } else if (y > 2050 && y <= 2150) {
    dt = -20 + 32 * ((y - 1820) / 100) * ((y - 1820) / 100) - 0.5628 * (2150 - y) + c;
  } else if (y > 2150) {
    const u = (y - 1820) / 100;
    dt = -20 + 32 * u * u + c;
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
  const { lon } = birthData;
  const dn = calcDayNumber(birthData);
  const t = dn / 36525.0;
  const tt = t * 36525.0;
  const LMST = mod360(280.46061837 + 360.98564736629 * tt
    + 0.000387933 * t * t - (t * t * t) / 38710000 + lon);
  return LMST;
}

function calcEclipticObliquity(jd: number): number {
  const terms = [-4680.93 / 3600.0, -1.55 / 3600.0, 1999.25 / 3600.0,
    -51.38 / 3600.0, -249.67 / 3600.0, -39.05 / 3600.0,
    7.12 / 3600.0, 27.87 / 3600.0, 5.79 / 3600.0, 2.45 / 3600.0];
  
  let eps = 23 + (26 / 60.0) + (21.448 / 3600.0);
  const cy = jd / 36525.0;
  let u = (jd - 2415020.0) / (cy * 100);
  let v = u;
  
  if (Math.abs(u) < 1.0) {
    for (let i = 0; i < 10; i++) {
      eps += terms[i] * v;
      v *= u;
    }
  }
  
  return eps;
}

function calcAscendant(birthData: BirthData): number {
  const { lat } = birthData;
  const t = calcSiderealTime(birthData);
  const jd = calcJulianDate(birthData);
  const ecl = calcEclipticObliquity(jd);
  
  const asc = Math.atan2(Math.cos(t * RADS), -Math.sin(t * RADS) * Math.cos(ecl * RADS)
    - Math.tan(lat * RADS) * Math.sin(ecl * RADS));
  
  return asc * DEGS;
}

// VSOP87 calculation using the loaded kundli.js
function calcVSOP87(planet: number, jd: number): number {
  const X = 0, Y = 1;
  let Xp: number, Yp: number, Zp: number;
  let Xe: number, Ye: number, Ze: number;
  
  // Number of Julian millennia elapsed from J2000
  const T = (jd - 2451545.0) / 365250.0;
  
  // Calculate heliocentric rectangular coordinates of Earth
  if (window.calc_earth) {
    window.calc_earth(T);
    Xe = window.earth[X];
    Ye = window.earth[Y];
    Ze = window.earth[2];
  } else {
    return 0;
  }
  
  switch (planet) {
    case 1: // Sun
      Xp = -window.earth[X];
      Yp = -window.earth[Y];
      Zp = -window.earth[2];
      break;
    case 3: // Mars
      if (window.calc_mars) {
        window.calc_mars(T);
        Xp = window.mars[X];
        Yp = window.mars[Y];
        Zp = window.mars[2];
      } else return 0;
      break;
    case 4: // Mercury
      if (window.calc_mercury) {
        window.calc_mercury(T);
        Xp = window.mercury[X];
        Yp = window.mercury[Y];
        Zp = window.mercury[2];
      } else return 0;
      break;
    case 5: // Jupiter
      if (window.calc_jupiter) {
        window.calc_jupiter(T);
        Xp = window.jupiter[X];
        Yp = window.jupiter[Y];
        Zp = window.jupiter[2];
      } else return 0;
      break;
    case 6: // Venus
      if (window.calc_venus) {
        window.calc_venus(T);
        Xp = window.venus[X];
        Yp = window.venus[Y];
        Zp = window.venus[2];
      } else return 0;
      break;
    case 7: // Saturn
      if (window.calc_shani) {
        window.calc_shani(T);
        Xp = window.shani[X];
        Yp = window.shani[Y];
        Zp = window.shani[2];
      } else return 0;
      break;
    default:
      return 0;
  }
  
  // Sun coordinates
  if (planet === SU) { Xe = 0; Ye = 0; Ze = 0; }
  
  // True geocentric ecliptical coordinates
  const Xa = (Xp! - Xe);
  const Ya = (Yp! - Ye);
  
  // Spherical geocentric coordinates
  const Ra = Math.atan2(Ya, Xa) * DEGS;
  
  return Ra;
}

// High precision Moon position (Jean Meeus algorithm)
function calcMoonPosition(birthData: BirthData): number {
  const jd = calcJulianDate(birthData);
  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T * T * T;
  const T4 = T * T * T * T;
  
  const lrCoeff = [
    [0, 0, 1, 0], [2, 0, -1, 0], [2, 0, 0, 0], [0, 0, 2, 0], [0, 1, 0, 0], [0, 0, 0, 2], [2, 0, -2, 0],
    [2, -1, -1, 0], [2, 0, 1, 0], [2, -1, 0, 0], [0, 1, -1, 0], [1, 0, 0, 0], [0, 1, 1, 0], [2, 0, 0, -2],
    [0, 0, 1, 2], [0, 0, 1, -2], [4, 0, -1, 0], [0, 0, 3, 0], [4, 0, -2, 0], [2, 1, -1, 0], [2, 1, 0, 0],
    [1, 0, -1, 0], [1, 1, 0, 0], [2, -1, 1, 0], [2, 0, 2, 0], [4, 0, 0, 0], [2, 0, -3, 0], [0, 1, -2, 0],
    [2, 0, -1, 2], [2, -1, -2, 0], [1, 0, 1, 0], [2, -2, 0, 0], [0, 1, 2, 0], [0, 2, 0, 0], [2, -2, -1, 0],
    [2, 0, 1, -2], [2, 0, 0, 2], [4, -1, -1, 0], [0, 0, 2, 2], [3, 0, -1, 0], [2, 1, 1, 0], [4, -1, -2, 0],
    [0, 2, -1, 0], [2, 2, -1, 0], [2, 1, -2, 0], [2, -1, 0, -2], [4, 0, 1, 0], [0, 0, 4, 0], [4, -1, 0, 0],
    [1, 0, -2, 0], [2, 1, 0, -2], [0, 0, 2, -2], [1, 1, 1, 0], [3, 0, -2, 0], [4, 0, -3, 0], [2, -1, 2, 0],
    [0, 2, 1, 0], [1, 1, -1, 0], [2, 0, 3, 0], [2, 0, -1, -2]
  ];
  
  const lTerms = [
    6288774, 1274027, 658314, 213618, -185116, -114332, 58793, 57066, 53322, 45758, -40923, -34720,
    -30383, 15327, -12528, 10980, 10675, 10034, 8548, -7888, -6766, -5163, 4987, 4036, 3994, 3861, 3665,
    -2689, -2602, 2390, -2348, 2236, -2120, -2069, 2048, -1773, -1595, 1215, -1110, -892, -810, 759, -713,
    -700, 691, 596, 549, 537, 520, -487, -399, -381, 351, -340, 330, 327, -323, 299, 294, 0
  ];
  
  let lprime = mod2pi((218.3164591 + 481267.88134236 * T - 0.0013268 * T2 + T3 / 538841.0 - T4 / 65194000.0) * RADS);
  const d = mod2pi((297.8502042 + 445267.1115168 * T - 0.00163 * T2 + T3 / 545868.0 - T4 / 113065000.0) * RADS);
  const m = mod2pi((357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000.0) * RADS);
  const mprime = mod2pi((134.9634114 + 477198.8676313 * T + 0.008997 * T2 + T3 / 69699.0 - T4 / 14712000.0) * RADS);
  const f = mod2pi((93.2720993 + 483202.0175273 * T - 0.0034029 * T2 - T3 / 3526000.0 + T4 / 863310000.0) * RADS);
  
  const a1 = mod2pi((119.75 + 131.849 * T) * RADS);
  const a2 = mod2pi((53.09 + 479264.29 * T) * RADS);
  
  const e: number[] = [];
  e[0] = 1;
  e[1] = 1 - 0.002516 * T - 0.0000074 * T2;
  e[2] = e[1] * e[1];
  
  let sigmaL = 0;
  for (let i = 0; i < 60; i++) {
    const ang = lrCoeff[i][0] * d + lrCoeff[i][1] * m + lrCoeff[i][2] * mprime + lrCoeff[i][3] * f;
    sigmaL += lTerms[i] * Math.sin(ang) * e[Math.abs(lrCoeff[i][1])];
  }
  
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

function createPlanet(name: string, index: number, ra: number): Planet {
  const deg = mod360(ra);
  const zodiacIndex = calcZodiac(deg);
  const nakshatra = calcNakshatra(deg);
  
  return {
    name,
    index,
    ra: deg,
    zodiac: zodiacNames[zodiacIndex],
    degree: deg % 30,
    rasizn: zodiacIndex,
    navzn: calcZodiac(mod2pi(deg * 9 * RADS) * DEGS),
    nakshatra: nakshatra.name,
    nakshatraLord: nakshatra.lord,
    nakshatraPada: nakshatra.pada
  };
}

export function calculateChart(birthData: BirthData): { planets: Planet[]; rashis: number[]; houses: string[][] } {
  const ay = calcAyanamsa(birthData.date);
  const jd = calcJulianDate(birthData);
  
  // Calculate Ascendant
  const ascDeg = calcAscendant(birthData) - ay;
  const ascZodiac = calcZodiac(mod360(ascDeg));
  
  // Calculate Rashis (zodiac signs for each house)
  const rashis: number[] = [];
  let x = 1;
  for (let i = 0; i < 12; i++) {
    if (ascZodiac + i > 12) { rashis[i] = x; x++; }
    else { rashis[i] = ascZodiac + i; }
  }
  
  const planets: Planet[] = [];
  
  // Ascendant
  planets[AS] = createPlanet('As', AS, mod360(ascDeg));
  
  // Sun - using VSOP87
  const sunRa = calcVSOP87(1, jd) - ay;
  planets[SU] = createPlanet('Su', SU, sunRa);
  
  // Moon - high precision
  const moonRa = calcMoonPosition(birthData) - ay;
  planets[MO] = createPlanet('Mo', MO, moonRa);
  
  // Mars - using VSOP87
  const marsRa = calcVSOP87(3, jd) - ay;
  planets[MA] = createPlanet('Ma', MA, marsRa);
  
  // Mercury - using VSOP87
  const mercRa = calcVSOP87(4, jd) - ay;
  planets[ME] = createPlanet('Me', ME, mercRa);
  
  // Jupiter - using VSOP87
  const jupRa = calcVSOP87(5, jd) - ay;
  planets[JU] = createPlanet('Ju', JU, jupRa);
  
  // Venus - using VSOP87
  const venRa = calcVSOP87(6, jd) - ay;
  planets[VE] = createPlanet('Ve', VE, venRa);
  
  // Saturn - using VSOP87
  const satRa = calcVSOP87(7, jd) - ay;
  planets[SA] = createPlanet('Sa', SA, satRa);
  
  // Rahu
  const rahuRa = calcMoonAscendingNode(birthData);
  planets[RA] = createPlanet('Ra', RA, rahuRa);
  
  // Ketu (opposite to Rahu)
  const ketuRa = mod360(rahuRa + 180);
  planets[KE] = createPlanet('Ke', KE, ketuRa);
  
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

// Function to check if kundli.js is loaded
export function isKundliLoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.calc_earth === 'function';
}
