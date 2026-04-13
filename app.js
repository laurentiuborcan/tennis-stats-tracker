/* ===================================================
   TENNIS STATS TRACKER — app.js
   =================================================== */

const API_KEY  = '5c5381ae4fmsh6848925ad4226f3p172ac0jsn3743e19f6b98';
const API_HOST = 'tennisapi1.p.rapidapi.com';

const ENDPOINTS = {
  atp:  `https://${API_HOST}/api/tennis/rankings/atp`,
  wta:  `https://${API_HOST}/api/tennis/rankings/wta`,
  live: `https://${API_HOST}/api/tennis/events/live`,
};

const TOURNAMENT_IDS = {
  'miami-open-atp':                { uniqueId: 2430 },
  'miami-open-wta':                { uniqueId: 2587 },
  'monte-carlo-rolex-masters-atp': { uniqueId: 2391 },
  'roland-garros-atp':             { uniqueId: 2480 },
  'roland-garros-wta':             { uniqueId: 2577 },
  'wimbledon-atp':                 { uniqueId: 2361 },
  'wimbledon-wta':                 { uniqueId: 2600 },
  'us-open-atp':                   { uniqueId: 2449 },
  'us-open-wta':                   { uniqueId: 2601 },
  'australian-open-atp':           { uniqueId: 2363 },
  'australian-open-wta':           { uniqueId: 2571 },
};

// Cache TTLs in milliseconds
const TTL = {
  atp:  24 * 60 * 60 * 1000,  // 24 hours
  wta:  24 * 60 * 60 * 1000,  // 24 hours
  live:  5 * 60 * 1000,        // 5 minutes
};

const CACHE_KEY = tour => `tennis_v1_${tour}`;

// ===== DEMO DATA (fallback when API quota is exhausted) =====
const DEMO = {
  atp: [
    { rank:  1, name: 'Carlos Alcaraz',              country: 'Spain',     countryCode: 'ES', points: 10945 },
    { rank:  2, name: 'Jannik Sinner',               country: 'Italy',     countryCode: 'IT', points:  9830 },
    { rank:  3, name: 'Novak Djokovic',              country: 'Serbia',    countryCode: 'RS', points:  7560 },
    { rank:  4, name: 'Alexander Zverev',            country: 'Germany',   countryCode: 'DE', points:  6890 },
    { rank:  5, name: 'Lorenzo Musetti',             country: 'Italy',     countryCode: 'IT', points:  4120 },
    { rank:  6, name: 'Alex de Minaur',              country: 'Australia', countryCode: 'AU', points:  3970 },
    { rank:  7, name: 'Taylor Fritz',                country: 'USA',       countryCode: 'US', points:  3740 },
    { rank:  8, name: 'Felix Auger-Aliassime',       country: 'Canada',    countryCode: 'CA', points:  3510 },
    { rank:  9, name: 'Ben Shelton',                 country: 'USA',       countryCode: 'US', points:  3280 },
    { rank: 10, name: 'Daniil Medvedev',             country: 'Russia',    countryCode: 'RU', points:  3050 },
    { rank: 11, name: 'Tommy Paul',                  country: 'USA',       countryCode: 'US', points:  2870 },
    { rank: 12, name: 'Stefanos Tsitsipas',          country: 'Greece',    countryCode: 'GR', points:  2740 },
    { rank: 13, name: 'Holger Rune',                 country: 'Denmark',   countryCode: 'DK', points:  2590 },
    { rank: 14, name: 'Ugo Humbert',                 country: 'France',    countryCode: 'FR', points:  2430 },
    { rank: 15, name: 'Andrey Rublev',               country: 'Russia',    countryCode: 'RU', points:  2280 },
    { rank: 16, name: 'Sebastian Korda',             country: 'USA',       countryCode: 'US', points:  2110 },
    { rank: 17, name: 'Frances Tiafoe',              country: 'USA',       countryCode: 'US', points:  1980 },
    { rank: 18, name: 'Francisco Cerundolo',         country: 'Argentina', countryCode: 'AR', points:  1850 },
    { rank: 19, name: 'Casper Ruud',                 country: 'Norway',    countryCode: 'NO', points:  1720 },
    { rank: 20, name: 'Grigor Dimitrov',             country: 'Bulgaria',  countryCode: 'BG', points:  1640 },
  ],
  wta: [
    { rank:  1, name: 'Aryna Sabalenka',      country: 'Belarus',    countryCode: 'BY', points: 11380 },
    { rank:  2, name: 'Elena Rybakina',       country: 'Kazakhstan', countryCode: 'KZ', points:  8240 },
    { rank:  3, name: 'Iga Swiatek',          country: 'Poland',     countryCode: 'PL', points:  7950 },
    { rank:  4, name: 'Coco Gauff',           country: 'USA',        countryCode: 'US', points:  6130 },
    { rank:  5, name: 'Jessica Pegula',       country: 'USA',        countryCode: 'US', points:  5210 },
    { rank:  6, name: 'Madison Keys',         country: 'USA',        countryCode: 'US', points:  4780 },
    { rank:  7, name: 'Mirra Andreeva',       country: 'Russia',     countryCode: 'RU', points:  4320 },
    { rank:  8, name: 'Jasmine Paolini',      country: 'Italy',      countryCode: 'IT', points:  3970 },
    { rank:  9, name: 'Emma Navarro',         country: 'USA',        countryCode: 'US', points:  3640 },
    { rank: 10, name: 'Paula Badosa',         country: 'Spain',      countryCode: 'ES', points:  3310 },
    { rank: 11, name: 'Daria Kasatkina',      country: 'Russia',     countryCode: 'RU', points:  3050 },
    { rank: 12, name: 'Barbora Krejcikova',   country: 'Czech Republic', countryCode: 'CZ', points: 2830 },
    { rank: 13, name: 'Qinwen Zheng',         country: 'China',      countryCode: 'CN', points:  2610 },
    { rank: 14, name: 'Karolina Muchova',     country: 'Czech Republic', countryCode: 'CZ', points: 2440 },
    { rank: 15, name: 'Anna Kalinskaya',      country: 'Russia',     countryCode: 'RU', points:  2250 },
    { rank: 16, name: 'Beatriz Haddad Maia',  country: 'Brazil',     countryCode: 'BR', points:  2090 },
    { rank: 17, name: 'Elina Svitolina',      country: 'Ukraine',    countryCode: 'UA', points:  1950 },
    { rank: 18, name: 'Caroline Garcia',      country: 'France',     countryCode: 'FR', points:  1820 },
    { rank: 19, name: 'Maria Sakkari',        country: 'Greece',     countryCode: 'GR', points:  1710 },
    { rank: 20, name: 'Liudmila Samsonova',   country: 'Russia',     countryCode: 'RU', points:  1590 },
  ],
};

// ===== TOURNAMENT DEMO DATA =====
const DEMO_TOURNAMENTS = {
  atp: [
    { name: 'Miami Open',                   location: 'Miami, USA',            surface: 'hard',  dates: 'Mar 17 – 29',     category: 'Masters 1000', status: 'completed' },
    { name: 'Monte Carlo Rolex Masters',    location: 'Monte Carlo, Monaco',   surface: 'clay',  dates: 'Apr 6 – 12',      category: 'Masters 1000', status: 'upcoming' },
    { name: 'Mutua Madrid Open',            location: 'Madrid, Spain',         surface: 'clay',  dates: 'Apr 27 – May 3',  category: 'Masters 1000', status: 'upcoming' },
    { name: "Internazionali BNL d'Italia",  location: 'Rome, Italy',           surface: 'clay',  dates: 'May 11 – 17',     category: 'Masters 1000', status: 'upcoming' },
    { name: 'Roland Garros',                location: 'Paris, France',         surface: 'clay',  dates: 'May 24 – Jun 7',  category: 'Grand Slam',   status: 'upcoming' },
    { name: 'Cinch Championships',          location: 'London, UK',            surface: 'grass', dates: 'Jun 15 – 21',     category: '500',          status: 'upcoming' },
    { name: 'Halle Open',                   location: 'Halle, Germany',        surface: 'grass', dates: 'Jun 15 – 21',     category: '500',          status: 'upcoming' },
    { name: 'Wimbledon',                    location: 'London, UK',            surface: 'grass', dates: 'Jun 29 – Jul 12', category: 'Grand Slam',   status: 'upcoming' },
    { name: 'National Bank Open',           location: 'Montreal, Canada',      surface: 'hard',  dates: 'Aug 3 – 9',       category: 'Masters 1000', status: 'upcoming' },
    { name: 'Western & Southern Open',      location: 'Cincinnati, USA',       surface: 'hard',  dates: 'Aug 10 – 16',     category: 'Masters 1000', status: 'upcoming' },
    { name: 'US Open',                      location: 'New York, USA',         surface: 'hard',  dates: 'Aug 24 – Sep 6',  category: 'Grand Slam',   status: 'upcoming' },
    { name: 'Rolex Shanghai Masters',       location: 'Shanghai, China',       surface: 'hard',  dates: 'Oct 5 – 11',      category: 'Masters 1000', status: 'upcoming' },
    { name: 'Nitto ATP Finals',             location: 'Turin, Italy',          surface: 'hard',  dates: 'Nov 8 – 15',      category: 'Finals',       status: 'upcoming' },
  ],
  wta: [
    { name: 'Miami Open',                   location: 'Miami, USA',            surface: 'hard',  dates: 'Mar 17 – 29',     category: 'WTA 1000',     status: 'completed' },
    { name: 'Porsche Tennis Grand Prix',    location: 'Stuttgart, Germany',    surface: 'clay',  dates: 'Apr 13 – 19',     category: 'WTA 500',      status: 'upcoming' },
    { name: 'Mutua Madrid Open',            location: 'Madrid, Spain',         surface: 'clay',  dates: 'Apr 27 – May 3',  category: 'WTA 1000',     status: 'upcoming' },
    { name: "Internazionali BNL d'Italia",  location: 'Rome, Italy',           surface: 'clay',  dates: 'May 11 – 17',     category: 'WTA 1000',     status: 'upcoming' },
    { name: 'Roland Garros',                location: 'Paris, France',         surface: 'clay',  dates: 'May 24 – Jun 7',  category: 'Grand Slam',   status: 'upcoming' },
    { name: 'Birmingham Classic',           location: 'Birmingham, UK',        surface: 'grass', dates: 'Jun 8 – 14',      category: 'WTA 250',      status: 'upcoming' },
    { name: 'Bad Homburg Open',             location: 'Bad Homburg, Germany',  surface: 'grass', dates: 'Jun 15 – 21',     category: 'WTA 250',      status: 'upcoming' },
    { name: 'Wimbledon',                    location: 'London, UK',            surface: 'grass', dates: 'Jun 29 – Jul 12', category: 'Grand Slam',   status: 'upcoming' },
    { name: 'National Bank Open',           location: 'Toronto, Canada',       surface: 'hard',  dates: 'Aug 2 – 8',       category: 'WTA 1000',     status: 'upcoming' },
    { name: 'Cincinnati Open',              location: 'Cincinnati, USA',       surface: 'hard',  dates: 'Aug 13 – 24',     category: 'WTA 1000',     status: 'upcoming' },
    { name: 'US Open',                      location: 'New York, USA',         surface: 'hard',  dates: 'Aug 24 – Sep 6',  category: 'Grand Slam',   status: 'upcoming' },
    { name: 'China Open',                   location: 'Beijing, China',        surface: 'hard',  dates: 'Sep 30 – Oct 11', category: 'WTA 1000',     status: 'upcoming' },
    { name: 'WTA Finals',                   location: 'Riyadh, Saudi Arabia',  surface: 'hard',  dates: 'Nov 7 – 14',      category: 'Finals',       status: 'upcoming' },
  ],
};

// ===== TOURNAMENT DRAW DATA =====
// Compact player helper: (name, countryCode, seed)
const _p = (name, cc, seed = null) => ({ name, cc, seed });
// Completed set pair helper
const _s = (a, b) => ({ p1: a, p2: b });

const DRAW_DATA = {
  // ---- MIAMI OPEN (ATP) ----
  'miami-open-atp': {
    rounds: [
      { name: 'Final', matches: [
        { p1:_p('Carlos Alcaraz','ES',1), p2:_p('Jannik Sinner','IT',2),
          status:'upcoming', sets:[], scheduled:'Mar 30', court:'Stadium Court' },
      ]},
      { name: 'Semi-Finals', matches: [
        { p1:_p('Carlos Alcaraz','ES',1), p2:_p('TBD','',null),
          status:'upcoming', sets:[] },
        { p1:_p('Jannik Sinner','IT',2),  p2:_p('TBD','',null),
          status:'upcoming', sets:[] },
      ]},
      { name: 'Quarter-Finals', matches: [
        { p1:_p('Carlos Alcaraz','ES',1),        p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('TBD','',null),                  p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Jannik Sinner','IT',2),         p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('TBD','',null),                  p2:_p('TBD','',null),  status:'upcoming', sets:[] },
      ]},
      { name: 'Round of 16', matches: [
        { p1:_p('Carlos Alcaraz','ES',1),        p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Taylor Fritz','US',7),          p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Alexander Zverev','DE',4),      p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('TBD','',null),                  p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Jannik Sinner','IT',2),         p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Ben Shelton','US',9),           p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Daniil Medvedev','RU',10),      p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('TBD','',null),                  p2:_p('TBD','',null),  status:'upcoming', sets:[] },
      ]},
    ],
  },

  // ---- MIAMI OPEN (WTA) ----
  'miami-open-wta': {
    rounds: [
      { name: 'Final', matches: [
        { p1:_p('Aryna Sabalenka','BY',1), p2:_p('Elena Rybakina','KZ',2),
          status:'upcoming', sets:[], scheduled:'Mar 29', court:'Stadium Court' },
      ]},
      { name: 'Semi-Finals', matches: [
        { p1:_p('Aryna Sabalenka','BY',1), p2:_p('TBD','',null),
          status:'upcoming', sets:[] },
        { p1:_p('Elena Rybakina','KZ',2),  p2:_p('TBD','',null),
          status:'upcoming', sets:[] },
      ]},
      { name: 'Quarter-Finals', matches: [
        { p1:_p('Aryna Sabalenka','BY',1),  p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('TBD','',null),             p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Elena Rybakina','KZ',2),   p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Coco Gauff','US',4),       p2:_p('TBD','',null),  status:'upcoming', sets:[] },
      ]},
      { name: 'Round of 16', matches: [
        { p1:_p('Aryna Sabalenka','BY',1),  p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Jessica Pegula','US',5),   p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Elena Rybakina','KZ',2),   p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Mirra Andreeva','RU',7),   p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Coco Gauff','US',4),       p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Emma Navarro','US',9),     p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Iga Swiatek','PL',3),      p2:_p('TBD','',null),  status:'upcoming', sets:[] },
        { p1:_p('Jasmine Paolini','IT',8),  p2:_p('TBD','',null),  status:'upcoming', sets:[] },
      ]},
    ],
  },

  // ---- MONTE CARLO ROLEX MASTERS (ATP) ----
  'monte-carlo-rolex-masters-atp': {
    rounds: [
      { name: 'Final', matches: [
        { p1:_p('TBD','',null), p2:_p('TBD','',null),
          status:'upcoming', sets:[], scheduled:'Apr 13', court:'Court Rainier III' },
      ]},
      { name: 'Semi-Finals', matches: [
        { p1:_p('TBD','',null), p2:_p('TBD','',null),
          status:'upcoming', sets:[], scheduled:'Apr 12', court:'Court Rainier III' },
        { p1:_p('TBD','',null), p2:_p('TBD','',null),
          status:'upcoming', sets:[], scheduled:'Apr 12', court:'Court Rainier III' },
      ]},
      { name: 'Quarter-Finals', matches: [
        { p1:_p('Carlos Alcaraz','ES',1),    p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 11' },
        { p1:_p('Alexander Zverev','DE',4),  p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 11' },
        { p1:_p('Jannik Sinner','IT',2),     p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 11' },
        { p1:_p('Novak Djokovic','RS',3),    p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 11' },
      ]},
      { name: 'Round of 16', matches: [
        { p1:_p('Carlos Alcaraz','ES',1),    p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 10' },
        { p1:_p('TBD','',null),              p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 10' },
        { p1:_p('Alexander Zverev','DE',4),  p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 10' },
        { p1:_p('TBD','',null),              p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 10' },
        { p1:_p('Jannik Sinner','IT',2),     p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 10' },
        { p1:_p('TBD','',null),              p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 10' },
        { p1:_p('Novak Djokovic','RS',3),    p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 10' },
        { p1:_p('TBD','',null),              p2:_p('TBD','',null),  status:'upcoming', sets:[], scheduled:'Apr 10' },
      ]},
    ],
  },
};

// ===== PLAYER PROFILE DATA =====
const PLAYER_DATA = {
  // ATP
  'Carlos Alcaraz':          { cc:'ES', ranking:1,  age:21, height:'185 cm', hand:'Right', backhand:'One-handed', season:{w:17,l:4,  titles:2, prize:'$3,120,000'}, career:{gs:4,  hi:1, titles:18}, surfaces:{hard:77,clay:83,grass:80}, recent:[{opp:'Jannik Sinner',    tourn:'AO 2026 R4',        score:'7-6, 6-3, 6-4',     r:'W'},{opp:'Jannik Sinner',     tourn:'Indian Wells 2026 F',score:'6-7, 6-7',           r:'L'},{opp:'Novak Djokovic',   tourn:'Wimbledon 2024 F',   score:'6-2, 6-2, 7-6',     r:'W'},{opp:'Novak Djokovic',   tourn:'Olympics 2024 F',    score:'2-6, 4-6',           r:'L'},{opp:'Daniil Medvedev',  tourn:'US Open 2024 F',     score:'6-3, 6-4, 6-2',     r:'W'}]},
  'Jannik Sinner':           { cc:'IT', ranking:2,  age:23, height:'188 cm', hand:'Right', backhand:'Two-handed', season:{w:19,l:3,  titles:3, prize:'$3,580,000'}, career:{gs:3,  hi:1, titles:20}, surfaces:{hard:84,clay:69,grass:73}, recent:[{opp:'Carlos Alcaraz',   tourn:'Indian Wells 2026 F',score:'7-6, 7-6',           r:'W'},{opp:'Alexander Zverev', tourn:'AO 2026 SF',         score:'6-4, 6-3, 6-2',     r:'W'},{opp:'Carlos Alcaraz',   tourn:'AO 2026 R4',        score:'6-7, 3-6, 4-6',     r:'L'},{opp:'Daniil Medvedev',  tourn:'AO 2025 F',          score:'3-6, 3-6, 6-4, 6-4, 6-3',r:'W'},{opp:'Alexander Zverev', tourn:'RG 2025 F',           score:'6-3, 6-4, 6-2',     r:'W'}]},
  'Novak Djokovic':          { cc:'RS', ranking:3,  age:38, height:'188 cm', hand:'Right', backhand:'Two-handed', season:{w:12,l:5,  titles:1, prize:'$1,240,000'}, career:{gs:24, hi:1, titles:99}, surfaces:{hard:84,clay:79,grass:82}, recent:[{opp:'Carlos Alcaraz',   tourn:'Wimbledon 2024 F',   score:'2-6, 2-6, 6-7',     r:'L'},{opp:'Carlos Alcaraz',   tourn:'Olympics 2024 F',    score:'7-6, 6-4',           r:'W'},{opp:'Carlos Alcaraz',   tourn:'RG 2024 SF',         score:'3-6, 2-6, 5-7, 4-6',r:'L'},{opp:'Jannik Sinner',    tourn:'AO 2025 QF',         score:'4-6, 6-7, 5-7',     r:'L'},{opp:'Alexander Zverev', tourn:'ATP Finals 2025 SF',  score:'6-7, 4-6',           r:'L'}]},
  'Alexander Zverev':        { cc:'DE', ranking:4,  age:27, height:'198 cm', hand:'Right', backhand:'Two-handed', season:{w:13,l:6,  titles:1, prize:'$1,780,000'}, career:{gs:0,  hi:2, titles:24}, surfaces:{hard:74,clay:66,grass:63}, recent:[{opp:'Jannik Sinner',    tourn:'AO 2026 SF',         score:'4-6, 3-6, 2-6',     r:'L'},{opp:'Jannik Sinner',    tourn:'ATP Finals 2025',    score:'7-6, 6-4',           r:'W'},{opp:'Jannik Sinner',    tourn:'RG 2025 F',          score:'3-6, 4-6, 2-6',     r:'L'},{opp:'Novak Djokovic',   tourn:'ATP Finals 2025 SF',  score:'7-6, 6-4',           r:'W'},{opp:'Carlos Alcaraz',   tourn:'Wimbledon 2025 SF',  score:'6-3, 4-6, 3-6, 4-6',r:'L'}]},
  'Lorenzo Musetti':         { cc:'IT', ranking:5,  age:22, height:'185 cm', hand:'Right', backhand:'One-handed', season:{w:14,l:5,  titles:1, prize:'$1,120,000'}, career:{gs:0,  hi:5, titles:5},  surfaces:{hard:68,clay:76,grass:65}, recent:[{opp:'Carlos Alcaraz',   tourn:'Miami 2026 QF',      score:'4-6, 3-6',           r:'L'},{opp:'Alex de Minaur',   tourn:'Dubai 2026 F',       score:'6-4, 7-6',           r:'W'},{opp:'Jannik Sinner',    tourn:'Nitto Finals 2025',  score:'4-6, 6-7',           r:'L'},{opp:'Taylor Fritz',     tourn:'Paris 2025',         score:'7-6, 6-4',           r:'W'},{opp:'Daniil Medvedev',  tourn:'Vienna 2025',        score:'6-3, 6-4',           r:'W'}]},
  'Alex de Minaur':          { cc:'AU', ranking:6,  age:25, height:'183 cm', hand:'Right', backhand:'Two-handed', season:{w:13,l:5,  titles:1, prize:'$980,000'},  career:{gs:0,  hi:6, titles:12}, surfaces:{hard:75,clay:58,grass:70}, recent:[{opp:'Lorenzo Musetti',  tourn:'Dubai 2026 F',       score:'4-6, 6-7',           r:'L'},{opp:'Carlos Alcaraz',   tourn:'Wimbledon 2025 QF',  score:'6-7, 2-6, 4-6',     r:'L'},{opp:'Jannik Sinner',    tourn:'Wimbledon 2025 SF',  score:'3-6, 4-6, 5-7',     r:'L'},{opp:'Taylor Fritz',     tourn:'AO 2026 QF',        score:'6-4, 6-3, 7-6',     r:'W'},{opp:'Ben Shelton',      tourn:'Washington 2025 F',  score:'6-4, 7-6',           r:'W'}]},
  'Taylor Fritz':            { cc:'US', ranking:7,  age:27, height:'196 cm', hand:'Right', backhand:'Two-handed', season:{w:12,l:5,  titles:1, prize:'$1,060,000'}, career:{gs:0,  hi:4, titles:9},  surfaces:{hard:76,clay:55,grass:68}, recent:[{opp:'Alex de Minaur',   tourn:'AO 2026 QF',        score:'4-6, 3-6, 6-7',     r:'L'},{opp:'Jannik Sinner',    tourn:'Indian Wells 2026 SF',score:'4-6, 3-6',          r:'L'},{opp:'Carlos Alcaraz',   tourn:'US Open 2024 F',     score:'3-6, 4-6, 2-6',     r:'L'},{opp:'Lorenzo Musetti',  tourn:'Paris 2025',         score:'6-7, 4-6',           r:'L'},{opp:'Ben Shelton',      tourn:'AO 2026 R16',       score:'7-6, 6-4, 6-3',     r:'W'}]},
  'Felix Auger-Aliassime':   { cc:'CA', ranking:8,  age:24, height:'188 cm', hand:'Right', backhand:'Two-handed', season:{w:13,l:4,  titles:1, prize:'$1,050,000'}, career:{gs:0,  hi:6, titles:8},  surfaces:{hard:74,clay:61,grass:71}, recent:[{opp:'Jannik Sinner',    tourn:'AO 2026 QF',        score:'6-7, 5-7, 4-6',     r:'L'},{opp:'Carlos Alcaraz',   tourn:'Indian Wells 2026 QF',score:'4-6, 3-6',          r:'L'},{opp:'Taylor Fritz',     tourn:'Davis Cup 2025',     score:'6-4, 6-3',           r:'W'},{opp:'Ben Shelton',      tourn:'Nitto Finals 2025',  score:'6-3, 7-5',           r:'W'},{opp:'Holger Rune',      tourn:'Basel 2025 F',       score:'7-6, 6-4',           r:'W'}]},
  'Ben Shelton':             { cc:'US', ranking:9,  age:22, height:'193 cm', hand:'Left',  backhand:'Two-handed', season:{w:11,l:5,  titles:1, prize:'$850,000'},  career:{gs:0,  hi:9, titles:4},  surfaces:{hard:72,clay:52,grass:67}, recent:[{opp:'Taylor Fritz',     tourn:'AO 2026 R16',       score:'6-7, 4-6, 3-6',     r:'L'},{opp:'Alex de Minaur',   tourn:'Washington 2025 F',  score:'4-6, 6-7',           r:'L'},{opp:'Carlos Alcaraz',   tourn:'Miami 2026 QF',      score:'3-6, 4-6',           r:'L'},{opp:'Felix Auger-Aliassime',tourn:'Nitto Finals 2025',score:'3-6, 5-7',           r:'L'},{opp:'Lorenzo Musetti',  tourn:'Vienna 2025 QF',     score:'6-4, 7-6',           r:'W'}]},
  'Daniil Medvedev':         { cc:'RU', ranking:10, age:28, height:'198 cm', hand:'Right', backhand:'Two-handed', season:{w:10,l:6,  titles:0, prize:'$740,000'},  career:{gs:1,  hi:1, titles:21}, surfaces:{hard:78,clay:51,grass:63}, recent:[{opp:'Jannik Sinner',    tourn:'Indian Wells 2026 F',score:'6-7, 6-7',           r:'L'},{opp:'Carlos Alcaraz',   tourn:'AO 2026 R4',        score:'6-7, 3-6, 4-6',     r:'L'},{opp:'Jannik Sinner',    tourn:'AO 2025 F',          score:'6-3, 6-3, 4-6, 4-6, 3-6',r:'L'},{opp:'Felix Auger-Aliassime',tourn:'Nitto Finals 2025',score:'6-3, 7-5',           r:'W'},{opp:'Lorenzo Musetti',  tourn:'Vienna 2025',        score:'3-6, 4-6',           r:'L'}]},
  // WTA
  'Aryna Sabalenka':         { cc:'BY', ranking:1,  age:26, height:'182 cm', hand:'Right', backhand:'Two-handed', season:{w:18,l:3,  titles:2, prize:'$3,420,000'}, career:{gs:4,  hi:1, titles:16}, surfaces:{hard:85,clay:66,grass:72}, recent:[{opp:'Madison Keys',     tourn:'AO 2026 F',          score:'4-6, 6-3, 5-7',     r:'L'},{opp:'Elena Rybakina',   tourn:'Indian Wells 2026 F',score:'5-7, 4-6',           r:'L'},{opp:'Iga Swiatek',      tourn:'WTA Finals 2025',    score:'6-3, 6-4',           r:'W'},{opp:'Iga Swiatek',      tourn:'US Open 2025 F',     score:'4-6, 3-6',           r:'L'},{opp:'Elena Rybakina',   tourn:'AO 2026 SF',         score:'6-3, 7-5',           r:'W'}]},
  'Elena Rybakina':          { cc:'KZ', ranking:2,  age:25, height:'184 cm', hand:'Right', backhand:'Two-handed', season:{w:16,l:4,  titles:2, prize:'$2,680,000'}, career:{gs:1,  hi:2, titles:14}, surfaces:{hard:76,clay:63,grass:78}, recent:[{opp:'Aryna Sabalenka',  tourn:'Indian Wells 2026 F',score:'7-5, 6-4',           r:'W'},{opp:'Coco Gauff',       tourn:'Indian Wells 2026 SF',score:'6-3, 7-5',          r:'W'},{opp:'Aryna Sabalenka',  tourn:'AO 2026 SF',         score:'3-6, 5-7',           r:'L'},{opp:'Aryna Sabalenka',  tourn:'AO 2025 QF',         score:'6-7, 4-6',           r:'L'},{opp:'Iga Swiatek',      tourn:'Indian Wells 2025 F',score:'6-4, 7-6',           r:'W'}]},
  'Iga Swiatek':             { cc:'PL', ranking:3,  age:24, height:'175 cm', hand:'Right', backhand:'Two-handed', season:{w:15,l:5,  titles:2, prize:'$2,590,000'}, career:{gs:5,  hi:1, titles:24}, surfaces:{hard:76,clay:89,grass:66}, recent:[{opp:'Aryna Sabalenka',  tourn:'WTA Finals 2025',    score:'3-6, 4-6',           r:'L'},{opp:'Coco Gauff',       tourn:'Indian Wells 2026 SF',score:'3-6, 2-6',          r:'L'},{opp:'Aryna Sabalenka',  tourn:'RG 2025 SF',         score:'5-7, 4-6',           r:'L'},{opp:'Coco Gauff',       tourn:'AO 2026 QF',        score:'6-2, 6-3',           r:'W'},{opp:'Elena Rybakina',   tourn:'Indian Wells 2025 F',score:'4-6, 6-7',           r:'L'}]},
  'Coco Gauff':              { cc:'US', ranking:4,  age:20, height:'180 cm', hand:'Right', backhand:'Two-handed', season:{w:14,l:5,  titles:2, prize:'$2,250,000'}, career:{gs:1,  hi:2, titles:11}, surfaces:{hard:78,clay:69,grass:71}, recent:[{opp:'Elena Rybakina',   tourn:'Indian Wells 2026 SF',score:'3-6, 5-7',          r:'L'},{opp:'Iga Swiatek',      tourn:'AO 2026 QF',        score:'2-6, 3-6',           r:'L'},{opp:'Iga Swiatek',      tourn:'Indian Wells 2026 SF',score:'6-3, 6-2',          r:'W'},{opp:'Aryna Sabalenka',  tourn:'US Open 2025 SF',    score:'3-6, 4-6',           r:'L'},{opp:'Iga Swiatek',      tourn:'US Open 2025 F',     score:'4-6, 3-6',           r:'L'}]},
  'Jessica Pegula':          { cc:'US', ranking:5,  age:31, height:'170 cm', hand:'Right', backhand:'Two-handed', season:{w:11,l:5,  titles:1, prize:'$1,020,000'}, career:{gs:0,  hi:3, titles:6},  surfaces:{hard:73,clay:61,grass:64}, recent:[{opp:'Aryna Sabalenka',  tourn:'AO 2026 QF',        score:'3-6, 2-6',           r:'L'},{opp:'Elena Rybakina',   tourn:'Indian Wells 2026 QF',score:'4-6, 6-7',          r:'L'},{opp:'Madison Keys',     tourn:'WTA Finals 2025',    score:'6-7, 4-6',           r:'L'},{opp:'Mirra Andreeva',   tourn:'Doha 2026',          score:'6-4, 7-5',           r:'W'},{opp:'Iga Swiatek',      tourn:'Cincinnati 2025',    score:'4-6, 3-6',           r:'L'}]},
  'Madison Keys':            { cc:'US', ranking:6,  age:29, height:'178 cm', hand:'Right', backhand:'Two-handed', season:{w:15,l:4,  titles:2, prize:'$2,180,000'}, career:{gs:1,  hi:6, titles:9},  surfaces:{hard:78,clay:61,grass:66}, recent:[{opp:'Aryna Sabalenka',  tourn:'AO 2026 F',          score:'6-4, 3-6, 7-5',     r:'W'},{opp:'Iga Swiatek',      tourn:'AO 2026 SF',         score:'6-3, 6-4',           r:'W'},{opp:'Aryna Sabalenka',  tourn:'AO 2025 F',          score:'3-6, 6-7',           r:'L'},{opp:'Aryna Sabalenka',  tourn:'Cincinnati 2024',    score:'3-6, 4-6',           r:'L'},{opp:'Jessica Pegula',   tourn:'WTA Finals 2025',    score:'7-6, 6-4',           r:'W'}]},
  'Mirra Andreeva':          { cc:'RU', ranking:7,  age:17, height:'171 cm', hand:'Right', backhand:'Two-handed', season:{w:14,l:5,  titles:1, prize:'$1,180,000'}, career:{gs:0,  hi:7, titles:3},  surfaces:{hard:74,clay:68,grass:63}, recent:[{opp:'Elena Rybakina',   tourn:'AO 2026 QF',        score:'3-6, 4-6',           r:'L'},{opp:'Coco Gauff',       tourn:'WTA Finals 2025',    score:'6-4, 6-3',           r:'W'},{opp:'Jessica Pegula',   tourn:'Doha 2026',          score:'4-6, 5-7',           r:'L'},{opp:'Iga Swiatek',      tourn:'RG 2025 QF',         score:'3-6, 5-7',           r:'L'},{opp:'Emma Navarro',     tourn:'Cincinnati 2025 SF', score:'6-4, 7-6',           r:'W'}]},
  'Jasmine Paolini':         { cc:'IT', ranking:8,  age:28, height:'163 cm', hand:'Right', backhand:'Two-handed', season:{w:12,l:5,  titles:1, prize:'$940,000'},  career:{gs:0,  hi:4, titles:7},  surfaces:{hard:71,clay:77,grass:68}, recent:[{opp:'Coco Gauff',       tourn:'Indian Wells 2026 QF',score:'3-6, 2-6',          r:'L'},{opp:'Aryna Sabalenka',  tourn:'WTA Finals 2025 RR', score:'4-6, 3-6',           r:'L'},{opp:'Madison Keys',     tourn:'AO 2026 QF',        score:'4-6, 6-7',           r:'L'},{opp:'Elena Rybakina',   tourn:'Wimbledon 2025 SF',  score:'3-6, 2-6',           r:'L'},{opp:'Iga Swiatek',      tourn:'RG 2025 F',          score:'6-3, 6-2',           r:'L'}]},
  'Emma Navarro':            { cc:'US', ranking:9,  age:23, height:'172 cm', hand:'Right', backhand:'Two-handed', season:{w:11,l:5,  titles:1, prize:'$870,000'},  career:{gs:0,  hi:9, titles:4},  surfaces:{hard:72,clay:63,grass:67}, recent:[{opp:'Aryna Sabalenka',  tourn:'Indian Wells 2026 QF',score:'2-6, 2-6',          r:'L'},{opp:'Iga Swiatek',      tourn:'AO 2026 R16',       score:'4-6, 3-6',           r:'L'},{opp:'Mirra Andreeva',   tourn:'Cincinnati 2025 SF', score:'4-6, 6-7',           r:'L'},{opp:'Elena Rybakina',   tourn:'Wimbledon 2025 QF',  score:'4-6, 6-7',           r:'L'},{opp:'Madison Keys',     tourn:'US Open 2025 QF',    score:'5-7, 6-4, 4-6',     r:'L'}]},
  'Paula Badosa':            { cc:'ES', ranking:10, age:26, height:'179 cm', hand:'Right', backhand:'Two-handed', season:{w:11,l:5,  titles:1, prize:'$810,000'},  career:{gs:0,  hi:2, titles:7},  surfaces:{hard:70,clay:74,grass:66}, recent:[{opp:'Elena Rybakina',   tourn:'Indian Wells 2026 R16',score:'4-6, 4-6',         r:'L'},{opp:'Aryna Sabalenka',  tourn:'AO 2026 R16',       score:'3-6, 5-7',           r:'L'},{opp:'Coco Gauff',       tourn:'WTA Finals 2025 RR', score:'6-7, 5-7',           r:'L'},{opp:'Iga Swiatek',      tourn:'RG 2025 QF',         score:'2-6, 4-6',           r:'L'},{opp:'Jasmine Paolini',  tourn:'Rome 2025 SF',       score:'6-3, 7-5',           r:'W'}]},
};

// ===== HEAD-TO-HEAD DATA =====
// Key = alphabetically sorted player names joined by '|'
// record: [wins for name-A (alpha-first), wins for name-B (alpha-second)]
const H2H_DATA = {
  // ATP
  'Carlos Alcaraz|Jannik Sinner': {
    record: [6, 9],
    meetings: [
      { tourn: 'Australian Open 2026 R4',    score: '7-6, 6-3, 6-4',       winner: 'Carlos Alcaraz' },
      { tourn: 'Indian Wells 2026 F',        score: '6-7, 6-7',             winner: 'Jannik Sinner'  },
      { tourn: 'Wimbledon 2025 F',           score: '3-6, 4-6, 2-6',       winner: 'Jannik Sinner'  },
    ],
  },
  'Carlos Alcaraz|Novak Djokovic': {
    record: [6, 4],
    meetings: [
      { tourn: 'Olympics 2024 F',            score: '2-6, 4-6',             winner: 'Novak Djokovic'  },
      { tourn: 'Wimbledon 2024 F',           score: '6-2, 6-2, 7-6',       winner: 'Carlos Alcaraz' },
      { tourn: 'Roland Garros 2024 SF',      score: '6-3, 2-6, 7-5, 4-6, 6-4', winner: 'Carlos Alcaraz' },
    ],
  },
  'Alexander Zverev|Jannik Sinner': {
    record: [4, 7],
    meetings: [
      { tourn: 'Australian Open 2026 SF',    score: '4-6, 3-6, 2-6',       winner: 'Jannik Sinner'  },
      { tourn: 'ATP Finals 2025',            score: '7-6, 6-4',             winner: 'Alexander Zverev' },
      { tourn: 'Roland Garros 2025 F',       score: '3-6, 4-6, 2-6',       winner: 'Jannik Sinner'  },
    ],
  },
  'Daniil Medvedev|Jannik Sinner': {
    record: [7, 10],
    meetings: [
      { tourn: 'Indian Wells 2026 F',        score: '6-7, 6-7',             winner: 'Jannik Sinner'  },
      { tourn: 'Australian Open 2025 F',     score: '6-3, 6-3, 4-6, 4-6, 3-6', winner: 'Jannik Sinner' },
      { tourn: 'ATP Finals 2023',            score: '4-6, 4-6',             winner: 'Daniil Medvedev' },
    ],
  },
  // WTA
  'Aryna Sabalenka|Iga Swiatek': {
    record: [9, 13],
    meetings: [
      { tourn: 'WTA Finals 2025',            score: '6-3, 6-4',             winner: 'Aryna Sabalenka' },
      { tourn: 'US Open 2025 F',             score: '4-6, 3-6',             winner: 'Iga Swiatek'    },
      { tourn: 'Roland Garros 2025 SF',      score: '7-5, 6-4',             winner: 'Aryna Sabalenka' },
    ],
  },
  'Aryna Sabalenka|Elena Rybakina': {
    record: [10, 6],
    meetings: [
      { tourn: 'Indian Wells 2026 F',        score: '5-7, 4-6',             winner: 'Elena Rybakina' },
      { tourn: 'Australian Open 2026 F',     score: '6-3, 7-5',             winner: 'Aryna Sabalenka' },
      { tourn: 'Australian Open 2025 QF',    score: '6-4, 7-6',             winner: 'Aryna Sabalenka' },
    ],
  },
  'Coco Gauff|Iga Swiatek': {
    record: [7, 14],
    meetings: [
      { tourn: 'Indian Wells 2026 SF',       score: '6-3, 6-2',             winner: 'Coco Gauff'     },
      { tourn: 'Australian Open 2026 QF',    score: '2-6, 3-6',             winner: 'Iga Swiatek'    },
      { tourn: 'US Open 2025 F',             score: '4-6, 3-6',             winner: 'Iga Swiatek'    },
    ],
  },
  'Aryna Sabalenka|Madison Keys': {
    record: [5, 2],
    meetings: [
      { tourn: 'Australian Open 2026 F',     score: '4-6, 6-3, 5-7',       winner: 'Madison Keys'   },
      { tourn: 'Australian Open 2025 F',     score: '6-3, 7-6',             winner: 'Aryna Sabalenka' },
      { tourn: 'Cincinnati 2024',            score: '6-3, 6-4',             winner: 'Aryna Sabalenka' },
    ],
  },
};

// ===== STATE =====
const state = {
  currentTour:       null,
  cache:             { atp: null, wta: null, live: null },
  query:             '',
  tourFilter:        'all',   // All / atp / wta on tournament list
  activeTournament:  null,    // slug key when a draw is open
  drawFilter:        'all',   // All / completed / live / upcoming in draw view
  ageTick:           null,
  prevView:             null,    // Navigation context for back button in player profile
  h2hP1:               null,    // H2H selected player 1
  h2hP2:               null,    // H2H selected player 2
  playerCache:          {},      // name → parsed API profile object
  tournamentSeasonIds:  {},      // uniqueId → seasonId
  tournamentResults:    {},      // slug → { rounds: [...] }
};

let _playerDebounceTimer = null;

// ===== DOM REFS =====
const $ = id => document.getElementById(id);
const loadingEl   = $('loadingState');
const errorEl     = $('errorState');
const errorIcon   = $('errorIcon');
const errorMsgEl  = $('errorMsg');
const tableEl     = $('rankingsTable');
const bodyEl      = $('rankingsBody');
const searchWrap  = $('searchWrap');
const searchInput = $('searchInput');
const searchClear = $('searchClear');
const toolbar     = $('toolbar');
const statusEl    = $('statusBar');
const lastUpdEl   = $('lastUpdated');
const refreshBtn  = $('refreshBtn');
const tableWrap   = $('tableWrap');
const emptySearch = $('emptySearch');
const emptyQuery  = $('emptyQuery');
const livePanel        = $('livePanel');
const tournamentsPanel = $('tournamentsPanel');
const h2hPanel         = $('h2hPanel');
const playerPanel      = $('playerPanel');
const demoBanner       = $('demoBanner');

// ===== LOCAL STORAGE CACHE =====
function lsGet(tour) {
  try {
    const raw = localStorage.getItem(CACHE_KEY(tour));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry?.ts || !entry?.data) return null;
    if (Date.now() - entry.ts > TTL[tour]) return null;  // expired
    return entry;
  } catch {
    return null;
  }
}

function lsSet(tour, data) {
  try {
    localStorage.setItem(CACHE_KEY(tour), JSON.stringify({ data, ts: Date.now() }));
  } catch { /* storage full — silently ignore */ }
}

function lsClear(tour) {
  try { localStorage.removeItem(CACHE_KEY(tour)); } catch {}
}

// Returns a fresh cache entry (in-session first, then localStorage), or null.
function getCached(tour) {
  if (state.cache[tour]) return state.cache[tour];
  const entry = lsGet(tour);
  if (entry) { state.cache[tour] = entry; }
  return entry;
}

function setCached(tour, data) {
  const entry = { data, ts: Date.now() };
  state.cache[tour] = entry;
  lsSet(tour, data);
}

function bustCache(tour) {
  state.cache[tour] = null;
  lsClear(tour);
}

// ===== TIME FORMATTING =====
function formatAge(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10)  return 'Just now';
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function startAgeTick(getTsCallback) {
  clearInterval(state.ageTick);
  state.ageTick = setInterval(() => {
    const ts = getTsCallback();
    if (ts) lastUpdEl.textContent = `Updated ${formatAge(ts)}`;
  }, 30_000);
}

function stopAgeTick() {
  clearInterval(state.ageTick);
  state.ageTick = null;
}

// ===== API =====
async function apiFetch(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': API_HOST },
  });
  if (res.status === 429) {
    const err = new Error('Rate limit reached');
    err.status = 429;
    throw err;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ===== TOURNAMENT RESULTS =====
async function getTournamentSeasonId(uniqueId) {
  if (state.tournamentSeasonIds[uniqueId]) return state.tournamentSeasonIds[uniqueId];
  const data = await apiFetch(`https://${API_HOST}/api/tennis/tournament/${uniqueId}/seasons`);
  const seasons = data?.seasons ?? [];
  const season = seasons.find(s => s.year === '2026' || String(s.name ?? '').includes('2026'))
                 ?? seasons[0];
  if (!season) throw new Error('No 2026 season found');
  state.tournamentSeasonIds[uniqueId] = season.id;
  return season.id;
}

function parseApiEvent(ev) {
  const hs = ev.homeScore ?? {};
  const as = ev.awayScore ?? {};

  const sets = [];
  for (let i = 1; i <= 5; i++) {
    const p1 = hs[`period${i}`];
    const p2 = as[`period${i}`];
    if (p1 == null && p2 == null) break;
    sets.push({ p1: p1 ?? 0, p2: p2 ?? 0 });
  }

  const type = ev.status?.type ?? 'notstarted';
  let status = 'upcoming', inProgress = false;
  if (type === 'finished' || type === 'canceled') status = 'completed';
  else if (type === 'inprogress') { status = 'live'; inProgress = true; }

  let winner = null;
  if (status === 'completed' && sets.length > 0) {
    const p1Sets = sets.filter(s => s.p1 > s.p2).length;
    const p2Sets = sets.filter(s => s.p2 > s.p1).length;
    winner = p1Sets > p2Sets ? 1 : 2;
  }

  const parseSeed = s => { if (!s) return null; const n = parseInt(s, 10); return isNaN(n) ? s : n; };

  return {
    p1: { name: ev.homeTeam?.name ?? 'TBD', cc: ev.homeTeam?.country?.alpha2 ?? '', seed: parseSeed(ev.homeTeamSeed) },
    p2: { name: ev.awayTeam?.name ?? 'TBD', cc: ev.awayTeam?.country?.alpha2 ?? '', seed: parseSeed(ev.awayTeamSeed) },
    status, winner, sets, inProgress,
  };
}

async function fetchTournamentResults(slug) {
  if (state.tournamentResults[slug]) return state.tournamentResults[slug];

  const { uniqueId } = TOURNAMENT_IDS[slug];
  const seasonId = await getTournamentSeasonId(uniqueId);
  const data = await apiFetch(
    `https://${API_HOST}/api/tennis/tournament/${uniqueId}/season/${seasonId}/events/last/0`
  );

  const events = data?.events ?? [];
  const roundMap = new Map();
  for (const ev of events) {
    const roundNum  = ev.roundInfo?.round ?? 0;
    const roundName = ev.roundInfo?.name ?? `Round ${roundNum}`;
    if (!roundMap.has(roundNum)) roundMap.set(roundNum, { name: roundName, round: roundNum, matches: [] });
    roundMap.get(roundNum).matches.push(parseApiEvent(ev));
  }

  // Sort descending (finals first)
  const rounds = [...roundMap.values()].sort((a, b) => b.round - a.round);
  const result = { rounds };
  state.tournamentResults[slug] = result;
  return result;
}

async function loadTournamentResults(key) {
  const btn  = document.getElementById('loadResultsBtn');
  const errEl = document.getElementById('loadResultsError');
  if (btn) { btn.disabled = true; btn.textContent = 'Loading…'; }
  if (errEl) errEl.textContent = '';
  try {
    await fetchTournamentResults(key);
    demoBanner.style.display = 'none';
    renderTournamentDetail(key, state.drawFilter);
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = 'Load Live Results'; }
    if (errEl) errEl.textContent = e.status === 429 ? 'API quota exceeded' : 'Failed to load results';
  }
}

// ===== HELPERS =====
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function countryFlag(code) {
  if (!code || code.length !== 2) return '';
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

function fmtPoints(n) {
  if (!n && n !== 0) return '—';
  return Number(n).toLocaleString('en-US');
}

function highlight(text, query) {
  if (!query) return escHtml(text);
  return escHtml(text).replace(
    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
    '<mark>$1</mark>'
  );
}

// ===== DATA PARSING =====
function parseRankings(data) {
  let items = [];
  if (Array.isArray(data))              items = data;
  else if (Array.isArray(data?.rankings)) items = data.rankings;
  else if (Array.isArray(data?.data))   items = data.data;
  else if (Array.isArray(data?.results)) items = data.results;
  else {
    const arr = Object.values(data || {}).find(v => Array.isArray(v));
    if (arr) items = arr;
  }

  return items.map((item, idx) => {
    const rank = item.ranking ?? item.rank ?? item.position ?? (idx + 1);
    const name =
      item.team?.name ?? item.rowName ?? item.player?.name ?? item.player?.fullName ??
      (item.player?.firstName && item.player?.lastName
        ? `${item.player.firstName} ${item.player.lastName}` : null) ??
      item.name ?? item.fullName ?? item.playerName ?? 'Unknown Player';
    const country =
      item.team?.country?.name ?? item.player?.country?.name ?? item.player?.nationality ??
      item.country?.name ?? item.nationality ?? item.country ?? '—';
    const countryCode =
      item.team?.country?.alpha2 ?? item.player?.country?.alpha2 ?? item.player?.country?.ioc ??
      item.player?.countryCode ?? item.country?.alpha2 ?? item.countryCode ?? '';
    const points = item.points ?? item.rankingPoints ?? item.atp_points ?? item.wta_points ?? 0;

    return {
      rank: Number(rank), name: String(name),
      country: String(country), countryCode: String(countryCode), points: Number(points),
    };
  }).filter(p => p.name !== 'Unknown Player' || p.points > 0);
}

// ===== SHOW / HIDE HELPERS =====
function showRankingsArea() {
  livePanel.style.display        = 'none';
  tournamentsPanel.style.display = 'none';
  h2hPanel.style.display         = 'none';
  playerPanel.style.display      = 'none';
  tableWrap.style.display        = 'block';
  searchWrap.style.display       = '';
  toolbar.style.display          = '';
}

function showLiveArea() {
  tableWrap.style.display        = 'none';
  searchWrap.style.display       = 'none';
  livePanel.style.display        = 'block';
  tournamentsPanel.style.display = 'none';
  h2hPanel.style.display         = 'none';
  playerPanel.style.display      = 'none';
  toolbar.style.display          = '';
  demoBanner.style.display       = 'none';
}

function showTournamentsArea() {
  tableWrap.style.display        = 'none';
  searchWrap.style.display       = 'none';
  livePanel.style.display        = 'none';
  tournamentsPanel.style.display = 'block';
  h2hPanel.style.display         = 'none';
  playerPanel.style.display      = 'none';
  toolbar.style.display          = '';
  demoBanner.style.display       = 'none';
}

function showPlayerPanel() {
  tableWrap.style.display        = 'none';
  searchWrap.style.display       = 'none';
  livePanel.style.display        = 'none';
  tournamentsPanel.style.display = 'none';
  h2hPanel.style.display         = 'none';
  playerPanel.style.display      = 'block';
  toolbar.style.display          = 'none';
  demoBanner.style.display       = 'none';
  state.currentTour              = null;  // let loadTour() run freely on back-navigation
}

function setAllHidden() {
  loadingEl.style.display   = 'none';
  errorEl.style.display     = 'none';
  tableEl.style.display     = 'none';
  emptySearch.style.display = 'none';
}

function showLoading(label) {
  setAllHidden();
  loadingEl.querySelector('span').textContent = label || 'Loading…';
  loadingEl.style.display = 'flex';
  statusEl.textContent    = '';
  lastUpdEl.textContent   = '';
  stopAgeTick();
}

function showError(msg, is429 = false) {
  setAllHidden();
  errorIcon.textContent  = is429 ? '🕐' : '⚠️';
  errorMsgEl.textContent = msg;
  errorEl.style.display  = 'flex';
  statusEl.textContent   = '';
}

// ===== RANKINGS RENDER =====
function renderTable(players, query, ts) {
  const filtered = query
    ? players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : players;

  setAllHidden();

  if (filtered.length === 0 && query) {
    emptySearch.style.display = 'flex';
    emptyQuery.textContent    = query;
    statusEl.textContent      = '';
    return;
  }

  tableEl.style.display    = 'table';
  statusEl.textContent     = query
    ? `Showing ${filtered.length} of ${players.length} players`
    : `${players.length} players`;

  if (ts) {
    lastUpdEl.textContent = `Updated ${formatAge(ts)}`;
    startAgeTick(() => state.cache[state.currentTour]?.ts);
  }

  bodyEl.innerHTML = filtered.map(p => {
    let rankHTML;
    if (p.rank === 1)      rankHTML = `<span class="rank-badge gold">1</span>`;
    else if (p.rank === 2) rankHTML = `<span class="rank-badge silver">2</span>`;
    else if (p.rank === 3) rankHTML = `<span class="rank-badge bronze">3</span>`;
    else                   rankHTML = `<span class="rank-num">${p.rank}</span>`;

    const flag = countryFlag(p.countryCode);
    return `
      <tr>
        <td class="cell-rank">${rankHTML}</td>
        <td class="cell-player"><span class="player-name player-link" data-player="${escHtml(p.name)}">${highlight(p.name, query)}</span></td>
        <td class="cell-country">
          <div class="country-wrap">
            ${flag ? `<span class="country-flag">${flag}</span>` : ''}
            <span class="country-name">${escHtml(p.country)}</span>
          </div>
        </td>
        <td class="cell-points">${fmtPoints(p.points)}</td>
      </tr>`;
  }).join('');
}

// ===== LIVE DATA PARSING =====
function parseLiveEvents(data) {
  let items = [];
  if      (Array.isArray(data?.events))  items = data.events;
  else if (Array.isArray(data?.data))    items = data.data;
  else if (Array.isArray(data))          items = data;
  else {
    const arr = Object.values(data || {}).find(v => Array.isArray(v));
    if (arr) items = arr;
  }

  return items.map(e => {
    const tournament =
      e.tournament?.uniqueTournament?.name ?? e.tournament?.name ??
      e.category?.name ?? e.event?.tournament?.name ?? 'Unknown Tournament';

    const round =
      e.roundInfo?.name ?? e.round?.name ??
      (e.roundInfo?.round ? `Round ${e.roundInfo.round}` : '');

    const p1Name =
      e.homeTeam?.name ?? e.player1?.name ?? e.firstPlayer?.name ??
      e.home?.name ?? 'Player 1';
    const p2Name =
      e.awayTeam?.name ?? e.player2?.name ?? e.secondPlayer?.name ??
      e.away?.name ?? 'Player 2';

    const p1Code =
      e.homeTeam?.country?.alpha2 ?? e.player1?.country?.alpha2 ?? '';
    const p2Code =
      e.awayTeam?.country?.alpha2 ?? e.player2?.country?.alpha2 ?? '';

    // Build per-set scores from period1, period2, … keys
    const hScore = e.homeScore ?? {};
    const aScore = e.awayScore ?? {};
    const sets = [];
    for (let i = 1; i <= 7; i++) {
      const h = hScore[`period${i}`], a = aScore[`period${i}`];
      if (h === undefined && a === undefined) break;
      sets.push({ p1: h ?? 0, p2: a ?? 0 });
    }
    // Fall back to current game score when no period data
    if (!sets.length) {
      const h = hScore.current ?? hScore.display;
      const a = aScore.current ?? aScore.display;
      if (h !== undefined || a !== undefined) sets.push({ p1: h ?? 0, p2: a ?? 0 });
    }

    return { tournament, round, p1Name, p2Name, p1Code, p2Code, sets };
  });
}

function renderLiveCard(ev) {
  const meta = escHtml(ev.tournament) + (ev.round ? ` · ${escHtml(ev.round)}` : '');

  const playerRow = (name, code, setIdx) => {
    const flag     = countryFlag(code);
    const setSpans = ev.sets.map((s, i) => {
      const val    = setIdx === 0 ? s.p1 : s.p2;
      const isLast = i === ev.sets.length - 1;
      return `<span class="lc-set${isLast ? ' lc-set--cur' : ''}">${val}</span>`;
    }).join('');
    return `
      <div class="lc-row">
        <span class="lc-flag" aria-hidden="true">${flag}</span>
        <span class="lc-name">${escHtml(name)}</span>
        <div class="lc-scores">${setSpans}</div>
      </div>`;
  };

  return `
    <div class="live-match-card">
      <div class="lc-header">
        <span class="lc-live-badge"><span class="lc-pip" aria-hidden="true"></span>LIVE</span>
        <span class="lc-meta">${meta}</span>
      </div>
      <div class="lc-body">
        ${playerRow(ev.p1Name, ev.p1Code, 0)}
        ${playerRow(ev.p2Name, ev.p2Code, 1)}
      </div>
    </div>`;
}

// ===== LIVE RENDER =====
function renderLive(data, ts) {
  const events = parseLiveEvents(data);

  if (ts) {
    lastUpdEl.textContent = `Updated ${formatAge(ts)}`;
    startAgeTick(() => state.cache.live?.ts);
  }

  if (events.length === 0) {
    const tsLine = ts
      ? `<p class="live-ts">Last checked ${new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>`
      : '';
    livePanel.innerHTML = `
      <div class="live-empty">
        <div class="live-empty-icon">📡</div>
        <p class="live-empty-title">No live matches right now</p>
        <p class="live-empty-sub">Check back during tournament hours</p>
        ${tsLine}
      </div>`;
    statusEl.textContent = '0 live matches';
    return;
  }

  statusEl.textContent = `${events.length} live match${events.length !== 1 ? 'es' : ''}`;

  livePanel.innerHTML = `
    <div class="live-header">
      <span class="live-dot" aria-hidden="true"></span>
      <span>${events.length} live match${events.length !== 1 ? 'es' : ''}</span>
    </div>
    <div class="live-cards">${events.map(renderLiveCard).join('')}</div>`;
}

function showLivePlaceholder() {
  livePanel.innerHTML = `
    <div class="live-placeholder">
      <div class="live-placeholder-icon">📡</div>
      <p class="live-placeholder-title">Live Matches</p>
      <p class="live-placeholder-sub">
        Click <strong>Refresh</strong> to load live match data from the API.
        Results are cached for 5 minutes.
      </p>
    </div>`;
  statusEl.textContent  = '';
  lastUpdEl.textContent = '';
}

// ===== LOAD RANKINGS =====
async function loadRankings(tour, force = false) {
  showRankingsArea();
  demoBanner.style.display = 'none';

  if (!force) {
    const cached = getCached(tour);
    if (cached) {
      renderTable(cached.data, state.query, cached.ts);
      return;
    }
  }

  showLoading(`Loading ${tour.toUpperCase()} rankings…`);

  try {
    const raw     = await apiFetch(ENDPOINTS[tour]);
    const players = parseRankings(raw);
    if (!players.length) {
      showError('No ranking data returned. The API response format may have changed.');
      return;
    }
    setCached(tour, players);
    demoBanner.style.display = 'none';
    renderTable(players, state.query, state.cache[tour].ts);
  } catch (err) {
    // API unavailable — fall back to demo data
    const demo = DEMO[tour];
    setAllHidden();
    tableEl.style.display    = 'table';
    demoBanner.style.display = '';
    statusEl.textContent     = `${demo.length} players (demo)`;
    lastUpdEl.textContent    = '';
    stopAgeTick();
    bodyEl.innerHTML = demo.map(p => {
      let rankHTML;
      if (p.rank === 1)      rankHTML = `<span class="rank-badge gold">1</span>`;
      else if (p.rank === 2) rankHTML = `<span class="rank-badge silver">2</span>`;
      else if (p.rank === 3) rankHTML = `<span class="rank-badge bronze">3</span>`;
      else                   rankHTML = `<span class="rank-num">${p.rank}</span>`;
      const flag = countryFlag(p.countryCode);
      return `
        <tr>
          <td class="cell-rank">${rankHTML}</td>
          <td class="cell-player"><span class="player-name player-link" data-player="${escHtml(p.name)}">${escHtml(p.name)}</span></td>
          <td class="cell-country">
            <div class="country-wrap">
              ${flag ? `<span class="country-flag">${flag}</span>` : ''}
              <span class="country-name">${escHtml(p.country)}</span>
            </div>
          </td>
          <td class="cell-points">${fmtPoints(p.points)}</td>
        </tr>`;
    }).join('');
  }
}

// ===== LOAD LIVE =====
async function loadLive(force = false) {
  showLiveArea();

  if (!force) {
    const cached = getCached('live');
    if (cached) {
      renderLive(cached.data, cached.ts);
      return;
    }
    // No cache yet — show placeholder instead of auto-fetching
    showLivePlaceholder();
    return;
  }

  showLoading('Loading live matches…');
  tableWrap.style.display = 'none';
  livePanel.style.display = 'block';
  livePanel.innerHTML = `
    <div class="live-loading-inner">
      <div class="spinner"></div>
      <span>Fetching live matches…</span>
    </div>`;

  try {
    const raw = await apiFetch(ENDPOINTS.live);
    setCached('live', raw);
    renderLive(raw, state.cache.live.ts);
  } catch (err) {
    if (err.status === 429) {
      livePanel.innerHTML = `
        <div class="live-error-card">
          <div class="live-error-icon">🕐</div>
          <p class="live-error-title">Live data unavailable</p>
          <p class="live-error-sub">API quota reached — try again later</p>
        </div>`;
      statusEl.textContent  = '';
      lastUpdEl.textContent = '';
    } else {
      livePanel.innerHTML = `
        <div class="live-error-card">
          <div class="live-error-icon">⚠️</div>
          <p class="live-error-title">Could not load live matches</p>
          <p class="live-error-sub">${escHtml(err.message)}</p>
        </div>`;
      statusEl.textContent = '';
    }
  }
}

// ===== TOURNAMENTS =====
function tournSlug(name, tour) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + tour;
}

// ----- Match card -----
function renderMatchCard(match) {
  const { p1, p2, status, winner, sets = [], inProgress, court, scheduled } = match;

  function playerRow(player, pNum, isWinner) {
    const flag    = player.cc ? countryFlag(player.cc) : '';
    const seed    = player.seed ? `<span class="match-seed">(${player.seed})</span>` : '';
    const isTBD   = player.name === 'TBD';
    const nameCls = `match-player-name${isWinner ? ' match-player-name--winner' : ''}${isTBD ? ' match-tbd' : ''}`;

    let scoresHtml = '';
    let tickHtml   = '';

    if (status !== 'upcoming') {
      const cells = sets.map((s, i) => {
        const mine = pNum === 1 ? s.p1 : s.p2;
        const opp  = pNum === 1 ? s.p2 : s.p1;
        const isLast = i === sets.length - 1;
        const cls = (isLast && inProgress) ? 'match-set--live'
                  : mine > opp             ? 'match-set--won'
                  :                          'match-set--lost';
        return `<span class="match-set ${cls}">${mine}</span>`;
      }).join('');
      scoresHtml = `<div class="match-scores">${cells}</div>`;
      tickHtml   = `<span class="match-tick">${isWinner ? '✓' : ''}</span>`;
    }

    return `
      <div class="match-row${isWinner ? ' match-row--winner' : ''}">
        <div class="match-player-info">
          <span class="match-flag">${flag}</span>
          <span class="${nameCls}${!isTBD ? ' player-link' : ''}" ${!isTBD ? `data-player="${escHtml(player.name)}"` : ''}>${escHtml(player.name)}</span>
          ${seed}
        </div>
        ${scoresHtml}${tickHtml}
      </div>`;
  }

  let hdr = '';
  if (status === 'live') {
    hdr = `<div class="match-card-hdr">
      <span class="match-live-badge">&#9679;&nbsp;LIVE</span>
      ${court ? `<span class="match-court">${escHtml(court)}</span>` : ''}
    </div>`;
  } else if (status === 'upcoming') {
    const left = scheduled ? `<span class="match-scheduled">${escHtml(scheduled)}</span>` : '<span></span>';
    const right = court ? `<span class="match-court">${escHtml(court)}</span>` : '';
    hdr = `<div class="match-card-hdr match-card-hdr--muted">${left}${right}</div>`;
  } else if (court) {
    hdr = `<div class="match-card-hdr match-card-hdr--muted">
      <span></span><span class="match-court">${escHtml(court)}</span>
    </div>`;
  }

  return `<div class="match-card match-card--${status}">
    ${hdr}
    <div class="match-players">
      ${playerRow(p1, 1, winner === 1)}
      ${playerRow(p2, 2, winner === 2)}
    </div>
  </div>`;
}

// ----- Bracket helpers -----
// "Jannik Sinner" → "J. Sinner"
function shortName(n) {
  if (!n || n === 'TBD') return n || 'TBD';
  const parts = n.split(' ');
  return parts.length < 2 ? n : parts[0][0] + '. ' + parts.slice(1).join(' ');
}

function renderBracketCard(match) {
  const { p1, p2, status, winner, sets = [], inProgress } = match;

  function bkRow(player, pNum, isWinner, isLoser) {
    const flag  = player.cc ? countryFlag(player.cc) : '';
    const isTBD = !player.name || player.name === 'TBD';
    const name  = isTBD ? 'TBD' : shortName(player.name);
    const seed  = player.seed ? `<span class="bk-seed">(${player.seed})</span>` : '';

    let setsHtml = '';
    if (status !== 'upcoming' && sets.length > 0) {
      const cells = sets.map((s, i) => {
        const n   = pNum === 1 ? s.p1 : s.p2;
        const cls = (i === sets.length - 1 && inProgress) ? ' bk-set--live' : '';
        return `<span class="bk-set${cls}">${n}</span>`;
      }).join('');
      setsHtml = `<div class="bk-sets">${cells}</div>`;
    }

    const rowCls  = `bk-player${isWinner ? ' bk-player--winner' : isLoser ? ' bk-player--loser' : ''}`;
    const nameCls = `bk-name${isTBD ? ' bk-tbd' : ''}`;
    return `<div class="${rowCls}">
      <div class="bk-player-info">
        <span class="bk-flag">${flag}</span>
        <span class="${nameCls}${!isTBD ? ' player-link' : ''}" ${!isTBD ? `data-player="${escHtml(player.name)}"` : ''}>${escHtml(name)}</span>${seed}
      </div>${setsHtml}
    </div>`;
  }

  return `<div class="bk-players">
    ${bkRow(p1, 1, winner === 1, winner === 2)}
    <div class="bk-divider"></div>
    ${bkRow(p2, 2, winner === 2, winner === 1)}
  </div>`;
}

function renderBracket(key) {
  const draw = DRAW_DATA[key];
  if (!draw) return `<div class="draw-empty-state"><p>No bracket data available.</p></div>`;

  // Reverse so earliest round (R16) is leftmost (index 0)
  const rounds = [...draw.rounds].reverse();

  // Layout constants (all in px)
  const CARD_H  = 49;   // 2×24px player rows + 1px divider
  const BORDER  = 2;    // top+bottom card borders
  const SLOT_H  = CARD_H + BORDER;
  const CARD_W  = 180;
  const GAP     = 14;   // vertical gap between adjacent cards in earliest round
  const COL_GAP = 38;   // horizontal gap between columns (connector space)
  const LABEL_H = 28;   // round label height at top
  const UNIT    = SLOT_H + GAP;

  // Vertical center of match at (ri, mi)
  function matchCY(ri, mi) {
    const step = Math.pow(2, ri);
    return Math.round(LABEL_H + step * mi * UNIT + (step - 1) * UNIT / 2) + SLOT_H / 2;
  }
  function matchTop(ri, mi) { return Math.round(matchCY(ri, mi) - SLOT_H / 2); }
  function colX(ri)          { return ri * (CARD_W + BORDER + COL_GAP); }

  const stageH   = LABEL_H + rounds[0].matches.length * UNIT - GAP;
  const WINNER_W = 160;
  const winX     = colX(rounds.length - 1) + CARD_W + BORDER + COL_GAP;
  const stageW   = winX + WINNER_W;

  // Match cards
  const cardsHtml = rounds.flatMap((round, ri) =>
    round.matches.map((match, mi) =>
      `<div class="bk-card bk-card--${match.status}"
            style="position:absolute;top:${matchTop(ri,mi)}px;left:${colX(ri)}px;width:${CARD_W}px">
        ${renderBracketCard(match)}
      </div>`
    )
  ).join('');

  // Round labels
  const labelsHtml = rounds.map((round, ri) =>
    `<div class="bk-round-label"
          style="position:absolute;top:0;left:${colX(ri)}px;width:${CARD_W + BORDER}px">
      ${escHtml(round.name)}
    </div>`
  ).join('');

  // SVG connector lines
  let lines = '';
  for (let ri = 0; ri < rounds.length - 1; ri++) {
    const n = rounds[ri].matches.length;
    for (let mi = 0; mi + 1 < n; mi += 2) {
      const mj = mi / 2;
      const ay = matchCY(ri, mi);
      const by = matchCY(ri, mi + 1);
      const ny = matchCY(ri + 1, mj);
      const ax = colX(ri) + CARD_W + BORDER;
      const nx = colX(ri + 1);
      const sx = ax + COL_GAP / 2;

      lines += `<line x1="${ax}"  y1="${ay}" x2="${sx}"  y2="${ay}"/>`;   // top arm
      lines += `<line x1="${sx}"  y1="${ay}" x2="${sx}"  y2="${by}"/>`;   // spine
      lines += `<line x1="${ax}"  y1="${by}" x2="${sx}"  y2="${by}"/>`;   // bottom arm
      lines += `<line x1="${sx}"  y1="${ny}" x2="${nx}"  y2="${ny}"/>`;   // exit arm
    }
  }

  // Connector from Final to winner slot
  const finalCY    = matchCY(rounds.length - 1, 0);
  const finalRightX = colX(rounds.length - 1) + CARD_W + BORDER;
  lines += `<line x1="${finalRightX}" y1="${finalCY}" x2="${winX}" y2="${finalCY}"/>`;

  // Winner display
  const finalMatch = rounds[rounds.length - 1].matches[0];
  let winnerHtml;
  if (finalMatch.status === 'completed' && finalMatch.winner) {
    const w    = finalMatch.winner === 1 ? finalMatch.p1 : finalMatch.p2;
    const flag = w.cc ? countryFlag(w.cc) : '';
    const seed = w.seed ? ` (${w.seed})` : '';
    winnerHtml = `<div class="bk-winner-slot"
                       style="position:absolute;top:${finalCY - 30}px;left:${winX}px">
      <div class="bk-winner-trophy">🏆</div>
      <div class="bk-winner-name">${flag}&nbsp;${escHtml(shortName(w.name))}${escHtml(seed)}</div>
    </div>`;
  } else {
    winnerHtml = `<div class="bk-winner-slot"
                       style="position:absolute;top:${finalCY - 10}px;left:${winX}px">
      <div class="bk-winner-tbd">Champion TBD</div>
    </div>`;
  }

  return `<div class="bracket-scroll-outer">
    <div class="bracket-stage" style="width:${stageW}px;height:${stageH}px">
      <svg class="bracket-svg" width="${stageW}" height="${stageH}">
        <g stroke="var(--border-hl)" stroke-width="1.5" fill="none"
           stroke-linecap="round" stroke-linejoin="round">
          ${lines}
        </g>
      </svg>
      ${labelsHtml}
      ${cardsHtml}
      ${winnerHtml}
    </div>
  </div>`;
}

// ----- Draw detail -----
function renderTournamentDetail(key, filter) {
  state.activeTournament = key;
  state.drawFilter       = filter;

  const hasApiSupport  = !!TOURNAMENT_IDS[key];
  const resultsLoaded  = !!state.tournamentResults[key];
  const draw           = state.tournamentResults[key] || DRAW_DATA[key];

  const FILTER_LABELS = {
    all: 'All Matches', completed: 'Completed', live: 'In Progress', upcoming: 'Upcoming', draw: 'Draw',
  };

  // Tournament metadata from DEMO_TOURNAMENTS
  const tournMeta = (() => {
    const tourKey = key.endsWith('-wta') ? 'wta' : 'atp';
    return DEMO_TOURNAMENTS[tourKey]?.find(t => tournSlug(t.name, tourKey) === key) || null;
  })();
  const meta = tournMeta || {};

  // Simple empty state for tournaments with no draw and no API support
  if (!draw && !hasApiSupport) {
    tournamentsPanel.innerHTML = `
      <button class="draw-back-btn" id="drawBackBtn">← Tournaments</button>
      <div class="draw-empty-state">
        <p>Draw not yet available for this tournament.</p>
        <p class="draw-empty-sub">Check back closer to the start date.</p>
      </div>`;
    document.getElementById('drawBackBtn').addEventListener('click', () => {
      state.activeTournament = null;
      loadTournaments();
    });
    return;
  }

  // Load Results button (shown whenever API support exists)
  const loadBtnHtml = hasApiSupport ? `
    <div class="draw-load-results">
      <button class="load-results-btn${resultsLoaded ? ' load-results-btn--loaded' : ''}"
              id="loadResultsBtn"${resultsLoaded ? ' disabled' : ''}>
        ${resultsLoaded ? 'Results loaded ✓' : 'Load Live Results'}
      </button>
      <span class="load-results-error" id="loadResultsError"></span>
    </div>` : '';

  // Count matches per filter for badge counts
  function countMatches(f) {
    if (!draw) return 0;
    return draw.rounds.reduce((n, r) =>
      n + (f === 'all' ? r.matches.length : r.matches.filter(m => m.status === f).length), 0);
  }

  const filterBtns = !draw ? '' : ['all', 'completed', 'live', 'upcoming', 'draw'].map(f => {
    if (f === 'draw') {
      return `<button class="draw-filter-btn draw-filter-btn--draw${filter === 'draw' ? ' active' : ''}" data-filter="draw">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style="flex-shrink:0" aria-hidden="true">
          <rect x="0.5" y="0.5" width="3" height="3.5" rx="0.5" stroke="currentColor"/>
          <rect x="0.5" y="6.5" width="3" height="3.5" rx="0.5" stroke="currentColor"/>
          <rect x="7.5" y="3.5" width="3" height="3.5" rx="0.5" stroke="currentColor"/>
          <line x1="3.5" y1="2.3" x2="7.5" y2="5.3" stroke="currentColor" stroke-width="0.9"/>
          <line x1="3.5" y1="8.3" x2="7.5" y2="5.3" stroke="currentColor" stroke-width="0.9"/>
        </svg>
        Draw
      </button>`;
    }
    const cnt = countMatches(f);
    if (cnt === 0 && f !== 'all') return '';
    return `<button class="draw-filter-btn${filter === f ? ' active' : ''}" data-filter="${f}">
      ${FILTER_LABELS[f]}<span class="draw-filter-count">${cnt}</span>
    </button>`;
  }).join('');

  // Content area
  let contentArea;
  if (!draw) {
    contentArea = `<div class="draw-empty-state">
      <p>No results loaded yet.</p>
      <p class="draw-empty-sub">Click "Load Live Results" above to fetch match data.</p>
    </div>`;
  } else if (filter === 'draw') {
    contentArea = renderBracket(key);
  } else {
    const visibleRounds = filter === 'all'
      ? draw.rounds
      : draw.rounds
          .map(r => ({ ...r, matches: r.matches.filter(m => m.status === filter) }))
          .filter(r => r.matches.length > 0);
    const roundsHtml = visibleRounds.length
      ? visibleRounds.map(round => `
          <section class="draw-round">
            <h3 class="draw-round-title">${escHtml(round.name)}</h3>
            <div class="draw-round-matches">
              ${round.matches.map(renderMatchCard).join('')}
            </div>
          </section>`).join('')
      : `<div class="draw-empty-state"><p>No ${FILTER_LABELS[filter].toLowerCase()} matches.</p></div>`;
    contentArea = `<div class="draw-rounds">${roundsHtml}</div>`;
  }

  const isLive    = meta.status !== 'completed'
    && ((meta.status === 'ongoing') || (draw?.rounds ?? []).some(r => r.matches.some(m => m.status === 'live')));
  const surfBadge = meta.surface
    ? `<span class="badge badge-surface badge-${meta.surface}">${meta.surface[0].toUpperCase() + meta.surface.slice(1)}</span>` : '';
  const catBadge  = meta.category
    ? `<span class="badge badge-cat badge-cat--${categoryClass(meta.category)}">${escHtml(meta.category)}</span>` : '';

  tournamentsPanel.innerHTML = `
    <div class="draw-view">
      <button class="draw-back-btn" id="drawBackBtn">← Tournaments</button>
      <div class="draw-header">
        <div class="draw-title-row">
          <h2 class="draw-title">${escHtml(meta.name || key)}</h2>
          ${isLive ? '<span class="tourn-live-badge">&#9679; LIVE NOW</span>' : ''}
        </div>
        <div class="draw-header-meta">
          ${meta.location ? `<span class="draw-meta-item">📍 ${escHtml(meta.location)}</span><span class="draw-meta-sep">·</span>` : ''}
          ${meta.dates    ? `<span class="draw-meta-item">${escHtml(meta.dates)}</span><span class="draw-meta-sep">·</span>` : ''}
          <div class="draw-badges">${surfBadge}${catBadge}</div>
        </div>
        ${loadBtnHtml}
      </div>
      ${draw ? `<div class="draw-filter-bar">${filterBtns}</div>` : ''}
      ${contentArea}
    </div>`;

  document.getElementById('drawBackBtn').addEventListener('click', () => {
    state.activeTournament = null;
    loadTournaments();
  });
  tournamentsPanel.querySelectorAll('.draw-filter-btn').forEach(btn =>
    btn.addEventListener('click', () => renderTournamentDetail(key, btn.dataset.filter))
  );
  const loadBtn = document.getElementById('loadResultsBtn');
  if (loadBtn && !resultsLoaded) {
    loadBtn.addEventListener('click', () => loadTournamentResults(key));
  }
}

function categoryClass(cat) {
  if (cat === 'Grand Slam')                       return 'gs';
  if (cat === 'Masters 1000' || cat === 'WTA 1000') return 'm1000';
  if (cat === '500'          || cat === 'WTA 500')  return 'c500';
  if (cat === '250'          || cat === 'WTA 250')  return 'c250';
  return 'finals';
}

function renderTournaments(filter) {
  const tours = filter === 'all' ? ['atp', 'wta'] : [filter];

  const sectionsHtml = tours.map(tour => {
    const label = tour === 'atp' ? 'ATP Tour' : 'WTA Tour';
    const cards = DEMO_TOURNAMENTS[tour].map(t => {
      const catCls  = categoryClass(t.category);
      const key     = tournSlug(t.name, tour);
      const hasDraw = !!DRAW_DATA[key];
      const ongoingBadge = t.status === 'ongoing'
        ? `<span class="tourn-live-badge">&#9679; LIVE NOW</span>`
        : '';
      return `
        <div class="tourn-card${t.status === 'ongoing' ? ' tourn-card--ongoing' : ''}"
             data-key="${escHtml(key)}" role="button" tabindex="0">
          <div class="tourn-card-top">
            <span class="tourn-name">${escHtml(t.name)}</span>
            ${ongoingBadge}
          </div>
          <span class="tourn-location">${escHtml(t.location)}</span>
          <div class="tourn-card-foot">
            <div class="tourn-badges">
              <span class="badge badge-surface badge-${t.surface}">${t.surface[0].toUpperCase() + t.surface.slice(1)}</span>
              <span class="badge badge-cat badge-cat--${catCls}">${escHtml(t.category)}</span>
            </div>
            <div class="tourn-card-right">
              ${hasDraw ? '<span class="tourn-draw-hint">View draw →</span>' : ''}
              <span class="tourn-dates">${escHtml(t.dates)}</span>
            </div>
          </div>
        </div>`;
    }).join('');
    return `<section class="tourn-group">
      <h3 class="tourn-group-title">${label}</h3>
      <div class="tourn-grid">${cards}</div>
    </section>`;
  }).join('');

  tournamentsPanel.innerHTML = `
    <div class="tourn-filter-bar">
      <button class="tourn-filter-btn${filter === 'all' ? ' active' : ''}" data-filter="all">All</button>
      <button class="tourn-filter-btn${filter === 'atp' ? ' active' : ''}" data-filter="atp">ATP</button>
      <button class="tourn-filter-btn${filter === 'wta' ? ' active' : ''}" data-filter="wta">WTA</button>
    </div>
    ${sectionsHtml}`;

  tournamentsPanel.querySelectorAll('.tourn-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.tourFilter = btn.dataset.filter;
      renderTournaments(state.tourFilter);
    });
  });

  tournamentsPanel.querySelectorAll('.tourn-card[data-key]').forEach(card => {
    card.addEventListener('click', e => {
      const filter = e.target.closest('.tourn-draw-hint') ? 'draw' : 'all';
      renderTournamentDetail(card.dataset.key, filter);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') renderTournamentDetail(card.dataset.key, 'all');
    });
  });
}

function loadTournaments() {
  state.activeTournament = null;
  showTournamentsArea();
  stopAgeTick();
  lastUpdEl.textContent = '';
  statusEl.textContent  = '';
  renderTournaments(state.tourFilter);
}

// ===== PLAYER PROFILES =====
async function fetchPlayerProfile(name) {
  if (state.playerCache[name]) return state.playerCache[name];

  // Step 1: search for the player by name
  const searchData = await apiFetch(
    `https://${API_HOST}/api/tennis/search/${encodeURIComponent(name)}`
  );
  const results = Array.isArray(searchData?.results) ? searchData.results : [];

  // Find first result that is a Tennis individual player (type 1 = player, not doubles team)
  const match = results.find(r =>
    r?.entity?.sport?.name === 'Tennis' && r?.entity?.type === 1
  );
  if (!match) return null;

  // Step 2: fetch full player details using the numeric ID
  const playerData = await apiFetch(
    `https://${API_HOST}/api/tennis/player/${match.entity.id}`
  );
  const team = playerData?.team ?? {};
  const info = team.playerTeamInfo ?? {};

  // Derive age from birth timestamp (seconds → years)
  let age = null;
  if (info.birthDateTimestamp) {
    age = Math.floor(
      (Date.now() - info.birthDateTimestamp * 1000) / (365.25 * 24 * 60 * 60 * 1000)
    );
  }

  // Height: API returns meters (e.g. 1.88) → display as "188 cm"
  let height = null;
  if (info.height) height = `${Math.round(info.height * 100)} cm`;

  // Hand: "right-handed" → "Right", "left-handed" → "Left"
  let hand = null;
  if (info.plays) {
    const m = info.plays.match(/^(right|left)/i);
    if (m) hand = m[1][0].toUpperCase() + m[1].slice(1);
  }

  // Career prize money (currency from raw field)
  let prize = null;
  if (info.prizeTotal != null) {
    const currency = info.prizeTotalRaw?.currency ?? '';
    const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : (currency ? currency + '\u00a0' : '');
    prize = sym + Math.round(info.prizeTotal).toLocaleString('en-US');
  }

  const profile = {
    source: 'api',
    name: team.fullName ?? team.name ?? name,
    country: team.country?.name ?? null,
    countryCode: team.country?.alpha2 ?? '',
    ranking: team.ranking ?? info.currentRanking ?? null,
    age,
    height,
    hand,
    prize,
  };

  state.playerCache[name] = profile;
  return profile;
}

function openPlayerProfile(name) {
  if (state.currentTour === 'tournaments') {
    state.prevView = state.activeTournament
      ? { type: 'tournament-detail', key: state.activeTournament, filter: state.drawFilter }
      : { type: 'tournaments' };
  } else {
    state.prevView = { type: 'rankings', tour: state.currentTour || 'atp' };
  }

  // Show panel with loading state immediately
  showPlayerPanel();
  playerPanel.innerHTML = `
    <div class="profile-view">
      <button class="draw-back-btn" id="profileBackBtn">← Back</button>
      <div class="profile-loading">
        <div class="spinner"></div>
        <span>Loading profile…</span>
      </div>
    </div>`;
  document.getElementById('profileBackBtn').addEventListener('click', goBack);

  // Debounce: rapid clicks only trigger a single fetch for the last name
  clearTimeout(_playerDebounceTimer);
  _playerDebounceTimer = setTimeout(async () => {
    let profile = null;
    try {
      profile = await fetchPlayerProfile(name);
    } catch { /* network/API error — fall through to PLAYER_DATA */ }

    if (profile) {
      renderPlayerProfileFromAPI(profile);
    } else {
      renderPlayerProfile(name);
    }
  }, 500);
}

function goBack() {
  const pv = state.prevView;
  if (!pv) { loadTour('atp'); return; }
  if (pv.type === 'rankings') {
    loadTour(pv.tour);
  } else if (pv.type === 'tournament-detail') {
    state.activeTournament = pv.key;
    showTournamentsArea();
    renderTournamentDetail(pv.key, pv.filter);
  } else {
    loadTournaments();
  }
}

function renderPlayerProfile(name) {
  const d = PLAYER_DATA[name];

  if (!d) {
    playerPanel.innerHTML = `
      <div class="profile-view">
        <button class="draw-back-btn" id="profileBackBtn">← Back</button>
        <div class="draw-empty-state">
          <p>No profile data available for ${escHtml(name)}.</p>
        </div>
      </div>`;
    document.getElementById('profileBackBtn').addEventListener('click', goBack);
    return;
  }

  const flag   = countryFlag(d.cc);
  const wl     = `${d.season.w}W – ${d.season.l}L`;
  const winPct = Math.round(d.season.w / (d.season.w + d.season.l) * 100);

  const surfBars = ['hard', 'clay', 'grass'].map(s => {
    const pct  = d.surfaces[s] ?? 0;
    const label = s[0].toUpperCase() + s.slice(1);
    return `<div class="surface-row">
      <span class="surface-label">${label}</span>
      <div class="surface-bar-track">
        <div class="surface-bar-fill surface-bar-fill--${s}" style="width:${pct}%"></div>
      </div>
      <span class="surface-pct">${pct}%</span>
    </div>`;
  }).join('');

  const recentRows = d.recent.map(r => {
    const isLive = r.r === 'Live';
    const badge  = isLive
      ? `<span class="result-badge result-badge--live">● LIVE</span>`
      : `<span class="result-badge result-badge--${r.r === 'W' ? 'w' : 'l'}">${r.r}</span>`;
    return `<div class="recent-row">
      <div class="recent-main">
        <span class="recent-opp player-link" data-player="${escHtml(r.opp)}">${escHtml(r.opp)}</span>
        <span class="recent-tourn">${escHtml(r.tourn)}</span>
      </div>
      <div class="recent-right">
        <span class="recent-score">${escHtml(r.score)}</span>
        ${badge}
      </div>
    </div>`;
  }).join('');

  playerPanel.innerHTML = `
    <div class="profile-view">
      <button class="draw-back-btn" id="profileBackBtn">← Back</button>
      <div class="profile-header">
        <div class="profile-flag-big">${flag}</div>
        <div class="profile-header-info">
          <h2 class="profile-name">${escHtml(name)}</h2>
          <div class="profile-meta">
            <span class="profile-rank">#${d.ranking} in the World</span>
            <span class="profile-sep">·</span>
            <span>Age ${d.age}</span>
            <span class="profile-sep">·</span>
            <span>${escHtml(d.height)}</span>
          </div>
          <div class="profile-meta">
            <span>${escHtml(d.hand)}-handed</span>
            <span class="profile-sep">·</span>
            <span>${escHtml(d.backhand)} backhand</span>
          </div>
        </div>
      </div>
      <div class="profile-sections">
        <section class="profile-section">
          <h3 class="profile-section-title">2025 Season</h3>
          <div class="profile-stat-grid">
            <div class="profile-stat-card">
              <span class="stat-value">${escHtml(wl)}</span>
              <span class="stat-label">Win / Loss</span>
            </div>
            <div class="profile-stat-card">
              <span class="stat-value">${winPct}%</span>
              <span class="stat-label">Win Rate</span>
            </div>
            <div class="profile-stat-card">
              <span class="stat-value">${d.season.titles}</span>
              <span class="stat-label">Titles</span>
            </div>
            <div class="profile-stat-card">
              <span class="stat-value">${escHtml(d.season.prize)}</span>
              <span class="stat-label">Prize Money</span>
            </div>
          </div>
        </section>
        <section class="profile-section">
          <h3 class="profile-section-title">Career Highlights</h3>
          <div class="profile-stat-grid">
            <div class="profile-stat-card">
              <span class="stat-value">${d.career.gs}</span>
              <span class="stat-label">Grand Slams</span>
            </div>
            <div class="profile-stat-card">
              <span class="stat-value">#${d.career.hi}</span>
              <span class="stat-label">Career High</span>
            </div>
            <div class="profile-stat-card">
              <span class="stat-value">${d.career.titles}</span>
              <span class="stat-label">Career Titles</span>
            </div>
          </div>
        </section>
        <section class="profile-section">
          <h3 class="profile-section-title">Surface Win %</h3>
          <div class="surface-bars">${surfBars}</div>
        </section>
        <section class="profile-section profile-section--last">
          <h3 class="profile-section-title">Recent Results</h3>
          <div class="recent-results">${recentRows}</div>
        </section>
      </div>
    </div>`;

  document.getElementById('profileBackBtn').addEventListener('click', goBack);
}

function renderPlayerProfileFromAPI(profile) {
  const flag = countryFlag(profile.countryCode);

  const metaParts = [];
  if (profile.ranking != null) metaParts.push(`<span class="profile-rank">#${profile.ranking} in the World</span>`);
  if (profile.age != null)     metaParts.push(`<span>Age ${profile.age}</span>`);
  if (profile.height)          metaParts.push(`<span>${escHtml(profile.height)}</span>`);

  const metaHtml = metaParts.length
    ? `<div class="profile-meta">${metaParts.join('<span class="profile-sep">·</span>')}</div>`
    : '';
  const handHtml = profile.hand
    ? `<div class="profile-meta"><span>${escHtml(profile.hand)}-handed</span></div>`
    : '';

  // Build stat cards for whatever fields the API returned
  const statCards = [];
  if (profile.ranking != null) statCards.push(['Ranking',      `#${profile.ranking}`]);
  if (profile.country)         statCards.push(['Country',      escHtml(profile.country)]);
  if (profile.age != null)     statCards.push(['Age',          String(profile.age)]);
  if (profile.height)          statCards.push(['Height',       escHtml(profile.height)]);
  if (profile.hand)            statCards.push(['Plays',        `${escHtml(profile.hand)}-handed`]);
  if (profile.prize)           statCards.push(['Career Prize', escHtml(profile.prize)]);

  const statsHtml = statCards.map(([label, val]) => `
    <div class="profile-stat-card">
      <span class="stat-value">${val}</span>
      <span class="stat-label">${escHtml(label)}</span>
    </div>`).join('');

  playerPanel.innerHTML = `
    <div class="profile-view">
      <button class="draw-back-btn" id="profileBackBtn">← Back</button>
      <div class="profile-header">
        <div class="profile-flag-big">${flag}</div>
        <div class="profile-header-info">
          <h2 class="profile-name">${escHtml(profile.name)}</h2>
          ${metaHtml}${handHtml}
        </div>
      </div>
      <div class="profile-sections">
        <section class="profile-section profile-section--last">
          <h3 class="profile-section-title">
            Player Info <span class="profile-api-badge">Live · RapidAPI</span>
          </h3>
          <div class="profile-stat-grid">${statsHtml}</div>
        </section>
      </div>
    </div>`;

  document.getElementById('profileBackBtn').addEventListener('click', goBack);
}

// ===== H2H PANEL =====
function showH2HPanel() {
  tableWrap.style.display        = 'none';
  searchWrap.style.display       = 'none';
  livePanel.style.display        = 'none';
  tournamentsPanel.style.display = 'none';
  playerPanel.style.display      = 'none';
  h2hPanel.style.display         = 'block';
  toolbar.style.display          = '';
  demoBanner.style.display       = 'none';
}

function renderH2HComparison(p1Name, p2Name) {
  const d1 = PLAYER_DATA[p1Name];
  const d2 = PLAYER_DATA[p2Name];

  // Resolve H2H record from p1's perspective
  const key  = [p1Name, p2Name].sort().join('|');
  const h2h  = H2H_DATA[key];
  let p1w = 0, p2w = 0;
  if (h2h) {
    const [nameA] = [p1Name, p2Name].sort();
    [p1w, p2w] = nameA === p1Name ? h2h.record : [h2h.record[1], h2h.record[0]];
  }
  const total = p1w + p2w;
  const recText = p1w > p2w
    ? `${escHtml(shortName(p1Name))} leads ${p1w}–${p2w}`
    : p2w > p1w
    ? `${escHtml(shortName(p2Name))} leads ${p2w}–${p1w}`
    : total > 0 ? `Series tied ${p1w}–${p2w}` : 'No recorded meetings';

  // Helper: which side is "better"
  const better = (v1, v2, lowerIsBetter = false) =>
    v1 === v2 ? null : (lowerIsBetter ? (v1 < v2 ? 'p1' : 'p2') : (v1 > v2 ? 'p1' : 'p2'));

  const statsRows = [
    ['Ranking',      `#${d1.ranking}`,                    `#${d2.ranking}`,                    better(d1.ranking,       d2.ranking,       true)],
    ['Age',          `${d1.age}`,                         `${d2.age}`,                         null                                           ],
    ['Grand Slams',  `${d1.career.gs}`,                   `${d2.career.gs}`,                   better(d1.career.gs,     d2.career.gs)          ],
    ['Career High',  `#${d1.career.hi}`,                  `#${d2.career.hi}`,                  better(d1.career.hi,     d2.career.hi,     true)],
    ['Titles',       `${d1.career.titles}`,               `${d2.career.titles}`,               better(d1.career.titles, d2.career.titles)      ],
    ['2025 W–L',     `${d1.season.w}–${d1.season.l}`,    `${d2.season.w}–${d2.season.l}`,    better(d1.season.w,      d2.season.w)           ],
  ].map(([label, v1, v2, side]) => `
    <div class="h2h-stat-row">
      <span class="h2h-val${side === 'p1' ? ' h2h-val--leader' : ''}">${v1}</span>
      <span class="h2h-stat-label">${label}</span>
      <span class="h2h-val${side === 'p2' ? ' h2h-val--leader' : ''}">${v2}</span>
    </div>`).join('');

  const surfRows = ['hard', 'clay', 'grass'].map(s => {
    const a = d1.surfaces[s] ?? 0;
    const b = d2.surfaces[s] ?? 0;
    const lbl = s[0].toUpperCase() + s.slice(1);
    return `<div class="h2h-surf-row">
      <div class="h2h-surf-side h2h-surf-side--left">
        <span class="h2h-surf-pct${a >= b ? ' h2h-val--leader' : ''}">${a}%</span>
        <div class="h2h-surf-track">
          <div class="h2h-surf-fill h2h-surf-fill--${s}" style="width:${a}%"></div>
        </div>
      </div>
      <span class="h2h-surf-label">${lbl}</span>
      <div class="h2h-surf-side h2h-surf-side--right">
        <div class="h2h-surf-track">
          <div class="h2h-surf-fill h2h-surf-fill--${s}" style="width:${b}%"></div>
        </div>
        <span class="h2h-surf-pct${b >= a ? ' h2h-val--leader' : ''}">${b}%</span>
      </div>
    </div>`;
  }).join('');

  const meetingsHtml = h2h?.meetings?.length
    ? h2h.meetings.map(m => {
        const side = m.winner === p1Name ? 'p1' : 'p2';
        return `<div class="h2h-meeting">
          <div class="h2h-meeting-left">
            <span class="h2h-meeting-tourn">${escHtml(m.tourn)}</span>
            <span class="h2h-meeting-score">${escHtml(m.score)}</span>
          </div>
          <span class="h2h-meeting-winner h2h-meeting-winner--${side} player-link"
                data-player="${escHtml(m.winner)}">${escHtml(shortName(m.winner))} won</span>
        </div>`;
      }).join('')
    : '<p class="h2h-no-data">No recorded meetings.</p>';

  return `
    <div class="h2h-comparison">
      <div class="h2h-header">
        <div class="h2h-player-hdr">
          <div class="h2h-avatar">${countryFlag(d1.cc)}</div>
          <div class="h2h-player-name player-link" data-player="${escHtml(p1Name)}">${escHtml(p1Name)}</div>
          <div class="h2h-player-sub">#${d1.ranking} · Age ${d1.age}</div>
        </div>
        <div class="h2h-vs-center">VS</div>
        <div class="h2h-player-hdr h2h-player-hdr--right">
          <div class="h2h-avatar">${countryFlag(d2.cc)}</div>
          <div class="h2h-player-name player-link" data-player="${escHtml(p2Name)}">${escHtml(p2Name)}</div>
          <div class="h2h-player-sub">#${d2.ranking} · Age ${d2.age}</div>
        </div>
      </div>

      <div class="h2h-section">
        <div class="h2h-stats">${statsRows}</div>
      </div>

      <div class="h2h-section">
        <div class="h2h-section-title">Surface Win %</div>
        <div class="h2h-surf-rows">${surfRows}</div>
      </div>

      <div class="h2h-section h2h-section--last">
        <div class="h2h-record-box">
          <div class="h2h-record-nums">
            <span class="h2h-rec-n${p1w > p2w ? ' h2h-val--leader' : ''}">${p1w}</span>
            <span class="h2h-rec-sep">–</span>
            <span class="h2h-rec-n${p2w > p1w ? ' h2h-val--leader' : ''}">${p2w}</span>
          </div>
          <div class="h2h-record-sub">${recText}</div>
        </div>
        <div class="h2h-section-title" style="margin-top:1.25rem">Recent Meetings</div>
        <div class="h2h-meetings">${meetingsHtml}</div>
      </div>
    </div>`;
}

function loadH2H() {
  showH2HPanel();
  stopAgeTick();
  statusEl.textContent  = 'Demo data';
  lastUpdEl.textContent = '';

  const atpNames = DEMO.atp.map(p => p.name).filter(n => PLAYER_DATA[n]);
  const wtaNames = DEMO.wta.map(p => p.name).filter(n => PLAYER_DATA[n]);

  function makeOptions(selected) {
    const blank   = '<option value="">— Select player —</option>';
    const atpOpts = atpNames.map(n =>
      `<option value="${escHtml(n)}"${n === selected ? ' selected' : ''}>${escHtml(n)}</option>`
    ).join('');
    const wtaOpts = wtaNames.map(n =>
      `<option value="${escHtml(n)}"${n === selected ? ' selected' : ''}>${escHtml(n)}</option>`
    ).join('');
    return blank
      + `<optgroup label="ATP">${atpOpts}</optgroup>`
      + `<optgroup label="WTA">${wtaOpts}</optgroup>`;
  }

  function render() {
    const p1 = state.h2hP1;
    const p2 = state.h2hP2;
    const compHtml = (p1 && p2 && p1 !== p2)
      ? renderH2HComparison(p1, p2)
      : `<div class="h2h-empty"><p>Select two players above to compare them head-to-head.</p></div>`;

    h2hPanel.innerHTML = `
      <div class="h2h-view">
        <div class="h2h-select-bar">
          <select class="h2h-select" id="h2hSel1">${makeOptions(p1)}</select>
          <div class="h2h-vs-pill">VS</div>
          <select class="h2h-select" id="h2hSel2">${makeOptions(p2)}</select>
        </div>
        ${compHtml}
      </div>`;

    document.getElementById('h2hSel1').addEventListener('change', e => {
      state.h2hP1 = e.target.value || null;
      render();
    });
    document.getElementById('h2hSel2').addEventListener('change', e => {
      state.h2hP2 = e.target.value || null;
      render();
    });
  }

  render();
}

// ===== ACTIVATE TAB =====
function activateTab(tour) {
  state.currentTour = tour;
  let activeBtn = null;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.dataset.tour === tour;
    btn.classList.toggle('active', isActive);
    if (isActive) activeBtn = btn;
  });
  if (activeBtn) activeBtn.scrollIntoView({ inline: 'nearest', block: 'nearest' });
}

// ===== LOAD TOUR (entry point for tab clicks) =====
function loadTour(tour, force = false) {
  // Allow re-entry to tournaments when viewing a draw detail
  const inDrawDetail = tour === 'tournaments' && state.activeTournament !== null;
  if (!force && tour === state.currentTour && !inDrawDetail) return;
  activateTab(tour);

  if (tour === 'live') {
    loadLive(force);
  } else if (tour === 'tournaments') {
    loadTournaments();
  } else if (tour === 'h2h') {
    loadH2H();
  } else {
    // Clear search when switching between ranking tabs
    if (state.currentTour !== tour || force) {
      searchInput.value = '';
      state.query = '';
      searchClear.classList.remove('visible');
    }
    loadRankings(tour, force);
  }
}

// ===== SEARCH =====
function applySearch() {
  const q = searchInput.value.trim();
  state.query = q;
  searchClear.classList.toggle('visible', q.length > 0);
  const cached = getCached(state.currentTour);
  if (cached) renderTable(cached.data, q, cached.ts);
}

// ===== INIT =====
function init() {
  // Tab clicks (tabs-bar)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tour !== state.currentTour) {
        searchInput.value = '';
        state.query = '';
        searchClear.classList.remove('visible');
      }
      loadTour(btn.dataset.tour);
    });
  });

  // Search
  searchInput.addEventListener('input', applySearch);
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { searchInput.value = ''; applySearch(); searchInput.blur(); }
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = ''; applySearch(); searchInput.focus();
  });

  // Retry button (rankings error state)
  $('retryBtn').addEventListener('click', () => {
    if (state.currentTour && state.currentTour !== 'live') {
      bustCache(state.currentTour);
      loadRankings(state.currentTour, true);
    }
  });

  // Refresh button (toolbar)
  refreshBtn.addEventListener('click', () => {
    const tour = state.currentTour;
    if (!tour) return;
    if (tour === 'live') {
      bustCache('live');
      loadLive(true);
    } else if (tour === 'tournaments') {
      renderTournaments(state.tourFilter);
    } else if (tour === 'h2h' || tour === null) {
      // no-op: H2H and player profile have no refreshable remote data
    } else {
      // ATP / WTA rankings
      bustCache(tour);
      loadRankings(tour, true);
    }
  });

  // Player profile — delegated handler for all [data-player] clicks
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-player]');
    if (link) openPlayerProfile(link.dataset.player);
  });

  // On load: always show ATP tab (uses cache if fresh, hits API otherwise,
  // falls back to demo data if API is unavailable)
  loadTour('atp');
}

document.addEventListener('DOMContentLoaded', init);
