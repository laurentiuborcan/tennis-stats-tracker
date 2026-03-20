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
    { rank:  1, name: 'Jannik Sinner',                country: 'Italy',     countryCode: 'IT', points: 11830 },
    { rank:  2, name: 'Carlos Alcaraz',               country: 'Spain',     countryCode: 'ES', points:  9255 },
    { rank:  3, name: 'Alexander Zverev',             country: 'Germany',   countryCode: 'DE', points:  7880 },
    { rank:  4, name: 'Novak Djokovic',               country: 'Serbia',    countryCode: 'RS', points:  6160 },
    { rank:  5, name: 'Daniil Medvedev',              country: 'Russia',    countryCode: 'RU', points:  5765 },
    { rank:  6, name: 'Casper Ruud',                  country: 'Norway',    countryCode: 'NO', points:  4320 },
    { rank:  7, name: 'Andrey Rublev',                country: 'Russia',    countryCode: 'RU', points:  3890 },
    { rank:  8, name: 'Taylor Fritz',                 country: 'USA',       countryCode: 'US', points:  3645 },
    { rank:  9, name: 'Alex de Minaur',               country: 'Australia', countryCode: 'AU', points:  3410 },
    { rank: 10, name: 'Grigor Dimitrov',              country: 'Bulgaria',  countryCode: 'BG', points:  3280 },
    { rank: 11, name: 'Tommy Paul',                   country: 'USA',       countryCode: 'US', points:  3050 },
    { rank: 12, name: 'Stefanos Tsitsipas',           country: 'Greece',    countryCode: 'GR', points:  2985 },
    { rank: 13, name: 'Holger Rune',                  country: 'Denmark',   countryCode: 'DK', points:  2740 },
    { rank: 14, name: 'Ben Shelton',                  country: 'USA',       countryCode: 'US', points:  2615 },
    { rank: 15, name: 'Ugo Humbert',                  country: 'France',    countryCode: 'FR', points:  2480 },
    { rank: 16, name: 'Sebastian Korda',              country: 'USA',       countryCode: 'US', points:  2210 },
    { rank: 17, name: 'Frances Tiafoe',               country: 'USA',       countryCode: 'US', points:  2070 },
    { rank: 18, name: 'Francisco Cerundolo',          country: 'Argentina', countryCode: 'AR', points:  1960 },
    { rank: 19, name: 'Alejandro Davidovich Fokina',  country: 'Spain',     countryCode: 'ES', points:  1885 },
    { rank: 20, name: 'Karen Khachanov',              country: 'Russia',    countryCode: 'RU', points:  1810 },
  ],
  wta: [
    { rank:  1, name: 'Aryna Sabalenka',      country: 'Belarus',        countryCode: 'BY', points: 10485 },
    { rank:  2, name: 'Iga Swiatek',          country: 'Poland',         countryCode: 'PL', points:  9295 },
    { rank:  3, name: 'Coco Gauff',           country: 'USA',            countryCode: 'US', points:  6530 },
    { rank:  4, name: 'Elena Rybakina',       country: 'Kazakhstan',     countryCode: 'KZ', points:  5745 },
    { rank:  5, name: 'Jessica Pegula',       country: 'USA',            countryCode: 'US', points:  4960 },
    { rank:  6, name: 'Mirra Andreeva',       country: 'Russia',         countryCode: 'RU', points:  4215 },
    { rank:  7, name: 'Jasmine Paolini',      country: 'Italy',          countryCode: 'IT', points:  4050 },
    { rank:  8, name: 'Emma Navarro',         country: 'USA',            countryCode: 'US', points:  3620 },
    { rank:  9, name: 'Madison Keys',         country: 'USA',            countryCode: 'US', points:  3290 },
    { rank: 10, name: 'Daria Kasatkina',      country: 'Russia',         countryCode: 'RU', points:  3105 },
    { rank: 11, name: 'Barbora Krejcikova',   country: 'Czech Republic', countryCode: 'CZ', points:  2870 },
    { rank: 12, name: 'Paula Badosa',         country: 'Spain',          countryCode: 'ES', points:  2755 },
    { rank: 13, name: 'Qinwen Zheng',         country: 'China',          countryCode: 'CN', points:  2630 },
    { rank: 14, name: 'Karolina Muchova',     country: 'Czech Republic', countryCode: 'CZ', points:  2510 },
    { rank: 15, name: 'Anna Kalinskaya',      country: 'Russia',         countryCode: 'RU', points:  2380 },
    { rank: 16, name: 'Beatriz Haddad Maia',  country: 'Brazil',         countryCode: 'BR', points:  2225 },
    { rank: 17, name: 'Elina Svitolina',      country: 'Ukraine',        countryCode: 'UA', points:  2090 },
    { rank: 18, name: 'Caroline Garcia',      country: 'France',         countryCode: 'FR', points:  1965 },
    { rank: 19, name: 'Maria Sakkari',        country: 'Greece',         countryCode: 'GR', points:  1870 },
    { rank: 20, name: 'Liudmila Samsonova',   country: 'Russia',         countryCode: 'RU', points:  1755 },
  ],
};

// ===== TOURNAMENT DEMO DATA =====
const DEMO_TOURNAMENTS = {
  atp: [
    { name: 'Miami Open',                   location: 'Miami, USA',            surface: 'hard',  dates: 'Mar 18 – Apr 1',  category: 'Masters 1000', status: 'ongoing'  },
    { name: 'Monte Carlo Rolex Masters',    location: 'Monte Carlo, Monaco',   surface: 'clay',  dates: 'Apr 7 – 13',      category: 'Masters 1000', status: 'upcoming' },
    { name: 'Barcelona Open',               location: 'Barcelona, Spain',      surface: 'clay',  dates: 'Apr 14 – 20',     category: '500',          status: 'upcoming' },
    { name: 'Mutua Madrid Open',            location: 'Madrid, Spain',         surface: 'clay',  dates: 'Apr 21 – May 3',  category: 'Masters 1000', status: 'upcoming' },
    { name: "Internazionali BNL d'Italia",  location: 'Rome, Italy',           surface: 'clay',  dates: 'May 4 – 17',      category: 'Masters 1000', status: 'upcoming' },
    { name: 'Roland Garros',                location: 'Paris, France',         surface: 'clay',  dates: 'May 24 – Jun 7',  category: 'Grand Slam',   status: 'upcoming' },
    { name: 'Cinch Championships',          location: 'London, UK',            surface: 'grass', dates: 'Jun 15 – 21',     category: '500',          status: 'upcoming' },
    { name: 'Halle Open',                   location: 'Halle, Germany',        surface: 'grass', dates: 'Jun 15 – 21',     category: '500',          status: 'upcoming' },
    { name: 'Wimbledon',                    location: 'London, UK',            surface: 'grass', dates: 'Jun 29 – Jul 12', category: 'Grand Slam',   status: 'upcoming' },
    { name: 'Hamburg Open',                 location: 'Hamburg, Germany',      surface: 'clay',  dates: 'Jul 14 – 20',     category: '500',          status: 'upcoming' },
    { name: 'National Bank Open',           location: 'Montreal, Canada',      surface: 'hard',  dates: 'Jul 27 – Aug 9',  category: 'Masters 1000', status: 'upcoming' },
    { name: 'Western & Southern Open',      location: 'Cincinnati, USA',       surface: 'hard',  dates: 'Aug 10 – 16',     category: 'Masters 1000', status: 'upcoming' },
    { name: 'US Open',                      location: 'New York, USA',         surface: 'hard',  dates: 'Aug 24 – Sep 6',  category: 'Grand Slam',   status: 'upcoming' },
    { name: 'China Open',                   location: 'Beijing, China',        surface: 'hard',  dates: 'Sep 28 – Oct 4',  category: '500',          status: 'upcoming' },
    { name: 'Rolex Shanghai Masters',       location: 'Shanghai, China',       surface: 'hard',  dates: 'Oct 5 – 12',      category: 'Masters 1000', status: 'upcoming' },
    { name: 'Nitto ATP Finals',             location: 'Turin, Italy',          surface: 'hard',  dates: 'Nov 9 – 16',      category: 'Finals',       status: 'upcoming' },
  ],
  wta: [
    { name: 'Miami Open',                   location: 'Miami, USA',            surface: 'hard',  dates: 'Mar 18 – Apr 1',  category: 'WTA 1000',     status: 'ongoing'  },
    { name: 'Stuttgart Open',               location: 'Stuttgart, Germany',    surface: 'clay',  dates: 'Apr 14 – 20',     category: 'WTA 500',      status: 'upcoming' },
    { name: 'Mutua Madrid Open',            location: 'Madrid, Spain',         surface: 'clay',  dates: 'Apr 21 – May 3',  category: 'WTA 1000',     status: 'upcoming' },
    { name: "Internazionali BNL d'Italia",  location: 'Rome, Italy',           surface: 'clay',  dates: 'May 4 – 17',      category: 'WTA 1000',     status: 'upcoming' },
    { name: 'Roland Garros',                location: 'Paris, France',         surface: 'clay',  dates: 'May 24 – Jun 7',  category: 'Grand Slam',   status: 'upcoming' },
    { name: 'Birmingham Classic',           location: 'Birmingham, UK',        surface: 'grass', dates: 'Jun 9 – 15',      category: 'WTA 250',      status: 'upcoming' },
    { name: 'Bad Homburg Open',             location: 'Bad Homburg, Germany',  surface: 'grass', dates: 'Jun 16 – 22',     category: 'WTA 250',      status: 'upcoming' },
    { name: 'Wimbledon',                    location: 'London, UK',            surface: 'grass', dates: 'Jun 29 – Jul 12', category: 'Grand Slam',   status: 'upcoming' },
    { name: 'Palermo Open',                 location: 'Palermo, Italy',        surface: 'clay',  dates: 'Jul 14 – 20',     category: 'WTA 250',      status: 'upcoming' },
    { name: 'National Bank Open',           location: 'Toronto, Canada',       surface: 'hard',  dates: 'Jul 27 – Aug 9',  category: 'WTA 1000',     status: 'upcoming' },
    { name: 'Western & Southern Open',      location: 'Cincinnati, USA',       surface: 'hard',  dates: 'Aug 10 – 16',     category: 'WTA 1000',     status: 'upcoming' },
    { name: 'US Open',                      location: 'New York, USA',         surface: 'hard',  dates: 'Aug 24 – Sep 6',  category: 'Grand Slam',   status: 'upcoming' },
    { name: 'China Open',                   location: 'Beijing, China',        surface: 'hard',  dates: 'Sep 28 – Oct 4',  category: 'WTA 1000',     status: 'upcoming' },
    { name: 'Jiangxi Open',                 location: 'Nanchang, China',       surface: 'hard',  dates: 'Oct 5 – 11',      category: 'WTA 500',      status: 'upcoming' },
    { name: 'WTA Finals',                   location: 'Riyadh, Saudi Arabia',  surface: 'hard',  dates: 'Nov 2 – 8',       category: 'Finals',       status: 'upcoming' },
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
        { p1:_p('Jannik Sinner','IT',1),    p2:_p('Carlos Alcaraz','ES',2),
          status:'live', winner:null, sets:[_s(6,4),_s(3,5)], inProgress:true, court:'Stadium Court' },
      ]},
      { name: 'Semi-Finals', matches: [
        { p1:_p('Jannik Sinner','IT',1),    p2:_p('Alexander Zverev','DE',3),
          status:'completed', winner:1, sets:[_s(7,6),_s(6,4)] },
        { p1:_p('Carlos Alcaraz','ES',2),   p2:_p('Daniil Medvedev','RU',4),
          status:'completed', winner:1, sets:[_s(6,3),_s(6,4)] },
      ]},
      { name: 'Quarter-Finals', matches: [
        { p1:_p('Jannik Sinner','IT',1),    p2:_p('Taylor Fritz','US',8),
          status:'completed', winner:1, sets:[_s(6,4),_s(7,6)] },
        { p1:_p('Alexander Zverev','DE',3), p2:_p('Andrey Rublev','RU',7),
          status:'completed', winner:1, sets:[_s(7,5),_s(6,3)] },
        { p1:_p('Carlos Alcaraz','ES',2),   p2:_p('Ben Shelton','US',14),
          status:'completed', winner:1, sets:[_s(6,3),_s(7,5)] },
        { p1:_p('Daniil Medvedev','RU',4),  p2:_p('Tommy Paul','US',11),
          status:'completed', winner:1, sets:[_s(6,2),_s(7,5)] },
      ]},
      { name: 'Round of 16', matches: [
        { p1:_p('Jannik Sinner','IT',1),      p2:_p('Ugo Humbert','FR',15),
          status:'completed', winner:1, sets:[_s(6,3),_s(6,2)] },
        { p1:_p('Taylor Fritz','US',8),        p2:_p('Grigor Dimitrov','BG',10),
          status:'completed', winner:1, sets:[_s(7,6),_s(4,6),_s(7,6)] },
        { p1:_p('Alexander Zverev','DE',3),    p2:_p('Francisco Cerundolo','AR',18),
          status:'completed', winner:1, sets:[_s(6,2),_s(6,4)] },
        { p1:_p('Andrey Rublev','RU',7),       p2:_p('Alex de Minaur','AU',9),
          status:'completed', winner:1, sets:[_s(4,6),_s(6,3),_s(7,5)] },
        { p1:_p('Carlos Alcaraz','ES',2),      p2:_p('Holger Rune','DK',13),
          status:'completed', winner:1, sets:[_s(6,3),_s(6,4)] },
        { p1:_p('Ben Shelton','US',14),        p2:_p('Casper Ruud','NO',6),
          status:'completed', winner:1, sets:[_s(7,5),_s(6,4)] },
        { p1:_p('Daniil Medvedev','RU',4),     p2:_p('Stefanos Tsitsipas','GR',12),
          status:'completed', winner:1, sets:[_s(6,3),_s(6,4)] },
        { p1:_p('Tommy Paul','US',11),         p2:_p('Sebastian Korda','US',16),
          status:'completed', winner:1, sets:[_s(7,6),_s(6,3)] },
      ]},
    ],
  },

  // ---- MIAMI OPEN (WTA) ----
  'miami-open-wta': {
    rounds: [
      { name: 'Final', matches: [
        { p1:_p('Aryna Sabalenka','BY',1), p2:_p('Coco Gauff','US',3),
          status:'live', winner:null, sets:[_s(6,3),_s(4,5)], inProgress:true, court:'Stadium Court' },
      ]},
      { name: 'Semi-Finals', matches: [
        { p1:_p('Aryna Sabalenka','BY',1), p2:_p('Elena Rybakina','KZ',4),
          status:'completed', winner:1, sets:[_s(6,4),_s(7,6)] },
        { p1:_p('Coco Gauff','US',3),      p2:_p('Iga Swiatek','PL',2),
          status:'completed', winner:1, sets:[_s(3,6),_s(6,4),_s(6,3)] },
      ]},
      { name: 'Quarter-Finals', matches: [
        { p1:_p('Aryna Sabalenka','BY',1), p2:_p('Jessica Pegula','US',5),
          status:'completed', winner:1, sets:[_s(6,3),_s(6,2)] },
        { p1:_p('Elena Rybakina','KZ',4),  p2:_p('Mirra Andreeva','RU',6),
          status:'completed', winner:1, sets:[_s(7,5),_s(6,4)] },
        { p1:_p('Coco Gauff','US',3),      p2:_p('Emma Navarro','US',8),
          status:'completed', winner:1, sets:[_s(6,4),_s(6,3)] },
        { p1:_p('Iga Swiatek','PL',2),     p2:_p('Jasmine Paolini','IT',7),
          status:'completed', winner:1, sets:[_s(6,2),_s(6,4)] },
      ]},
      { name: 'Round of 16', matches: [
        { p1:_p('Aryna Sabalenka','BY',1),    p2:_p('Beatriz Haddad Maia','BR',16),
          status:'completed', winner:1, sets:[_s(6,2),_s(6,1)] },
        { p1:_p('Jessica Pegula','US',5),      p2:_p('Daria Kasatkina','RU',10),
          status:'completed', winner:1, sets:[_s(6,3),_s(7,5)] },
        { p1:_p('Elena Rybakina','KZ',4),      p2:_p('Barbora Krejcikova','CZ',11),
          status:'completed', winner:1, sets:[_s(6,4),_s(7,6)] },
        { p1:_p('Mirra Andreeva','RU',6),      p2:_p('Madison Keys','US',9),
          status:'completed', winner:1, sets:[_s(6,4),_s(3,6),_s(6,3)] },
        { p1:_p('Coco Gauff','US',3),          p2:_p('Paula Badosa','ES',12),
          status:'completed', winner:1, sets:[_s(7,5),_s(6,4)] },
        { p1:_p('Emma Navarro','US',8),        p2:_p('Qinwen Zheng','CN',13),
          status:'completed', winner:1, sets:[_s(6,3),_s(6,4)] },
        { p1:_p('Iga Swiatek','PL',2),         p2:_p('Maria Sakkari','GR',19),
          status:'completed', winner:1, sets:[_s(6,1),_s(6,3)] },
        { p1:_p('Jasmine Paolini','IT',7),     p2:_p('Karolina Muchova','CZ',14),
          status:'completed', winner:1, sets:[_s(6,4),_s(7,6)] },
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
        { p1:_p('Jannik Sinner','IT',1),    p2:_p('TBD','',null),
          status:'upcoming', sets:[], scheduled:'Apr 11' },
        { p1:_p('Alexander Zverev','DE',3), p2:_p('TBD','',null),
          status:'upcoming', sets:[], scheduled:'Apr 11' },
        { p1:_p('Carlos Alcaraz','ES',2),   p2:_p('TBD','',null),
          status:'upcoming', sets:[], scheduled:'Apr 11' },
        { p1:_p('Novak Djokovic','RS',4),   p2:_p('TBD','',null),
          status:'upcoming', sets:[], scheduled:'Apr 11' },
      ]},
      { name: 'Round of 16', matches: [
        { p1:_p('Jannik Sinner','IT',1),       p2:_p('Francisco Cerundolo','AR'),
          status:'completed', winner:1, sets:[_s(6,4),_s(6,2)] },
        { p1:_p('Alexander Zverev','DE',3),    p2:_p('Grigor Dimitrov','BG',10),
          status:'completed', winner:1, sets:[_s(7,5),_s(6,3)] },
        { p1:_p('Carlos Alcaraz','ES',2),      p2:_p('Holger Rune','DK',13),
          status:'completed', winner:1, sets:[_s(6,2),_s(6,3)] },
        { p1:_p('Novak Djokovic','RS',4),      p2:_p('Sebastian Korda','US',16),
          status:'completed', winner:1, sets:[_s(6,4),_s(6,2)] },
        { p1:_p('Andrey Rublev','RU',7),       p2:_p('Ugo Humbert','FR',15),
          status:'live', winner:null, sets:[_s(4,6),_s(3,2)], inProgress:true, court:'Court Rainier III' },
        { p1:_p('Taylor Fritz','US',8),        p2:_p('Stefanos Tsitsipas','GR',12),
          status:'live', winner:null, sets:[_s(6,7),_s(5,4)], inProgress:true, court:'Court des Princes' },
        { p1:_p('Daniil Medvedev','RU',5),     p2:_p('Tommy Paul','US',11),
          status:'upcoming', sets:[], scheduled:'Apr 10, 2:00 PM' },
        { p1:_p('Casper Ruud','NO',6),         p2:_p('Ben Shelton','US',14),
          status:'upcoming', sets:[], scheduled:'Apr 10, 4:00 PM' },
      ]},
    ],
  },
};

// ===== PLAYER PROFILE DATA =====
const PLAYER_DATA = {
  // ATP
  'Jannik Sinner':     { cc:'IT', ranking:1,  age:23, height:'188 cm', hand:'Right', backhand:'Two-handed', season:{w:18,l:3,  titles:2, prize:'$3,240,000'}, career:{gs:2,  hi:1, titles:17}, surfaces:{hard:82,clay:67,grass:71}, recent:[{opp:'Carlos Alcaraz',   tourn:'Miami Open F',  score:'4-6, 3-5*',    r:'Live'},{opp:'Alexander Zverev', tourn:'Miami Open SF', score:'7-6, 6-4',     r:'W'},{opp:'Taylor Fritz',     tourn:'Miami Open QF', score:'6-4, 7-6',     r:'W'},{opp:'Ugo Humbert',      tourn:'Miami Open R16',score:'6-3, 6-2',     r:'W'},{opp:'Daniil Medvedev',  tourn:'Australian Open',score:'6-3, 6-4, 6-3',r:'W'}]},
  'Carlos Alcaraz':    { cc:'ES', ranking:2,  age:21, height:'185 cm', hand:'Right', backhand:'One-handed', season:{w:16,l:4,  titles:1, prize:'$2,800,000'}, career:{gs:4,  hi:1, titles:16}, surfaces:{hard:76,clay:81,grass:79}, recent:[{opp:'Jannik Sinner',    tourn:'Miami Open F',  score:'6-4, 5-3*',    r:'Live'},{opp:'Daniil Medvedev',  tourn:'Miami Open SF', score:'6-3, 6-4',     r:'W'},{opp:'Ben Shelton',      tourn:'Miami Open QF', score:'6-3, 7-5',     r:'W'},{opp:'Holger Rune',      tourn:'Miami Open R16',score:'6-3, 6-4',     r:'W'},{opp:'Novak Djokovic',   tourn:'Wimbledon',     score:'6-2, 6-2, 7-6',r:'W'}]},
  'Alexander Zverev':  { cc:'DE', ranking:3,  age:27, height:'198 cm', hand:'Right', backhand:'Two-handed', season:{w:14,l:5,  titles:1, prize:'$1,860,000'}, career:{gs:0,  hi:2, titles:23}, surfaces:{hard:73,clay:65,grass:62}, recent:[{opp:'Jannik Sinner',    tourn:'Miami Open SF', score:'6-7, 4-6',     r:'L'},{opp:'Andrey Rublev',    tourn:'Miami Open QF', score:'7-5, 6-3',     r:'W'},{opp:'F. Cerundolo',     tourn:'Miami Open R16',score:'6-2, 6-4',     r:'W'},{opp:'Novak Djokovic',   tourn:'Paris Masters', score:'7-5, 6-4',     r:'W'},{opp:'Carlos Alcaraz',   tourn:'Roland Garros', score:'4-6, 7-5, 3-6, 4-6',r:'L'}]},
  'Novak Djokovic':    { cc:'RS', ranking:4,  age:37, height:'188 cm', hand:'Right', backhand:'Two-handed', season:{w:11,l:5,  titles:0, prize:'$980,000'},  career:{gs:24, hi:1, titles:99}, surfaces:{hard:84,clay:79,grass:81}, recent:[{opp:'Sebastian Korda',  tourn:'Monte Carlo R16',score:'6-4, 6-2',    r:'W'},{opp:'Carlos Alcaraz',   tourn:'Wimbledon',     score:'2-6, 2-6, 7-6, 6-3, 3-6',r:'L'},{opp:'Carlos Alcaraz',   tourn:'Olympics Final',score:'6-7, 6-4, 6-2',r:'W'},{opp:'Jannik Sinner',    tourn:'Australian Open',score:'3-6, 6-7, 3-6',r:'L'},{opp:'Alexander Zverev', tourn:'Paris Masters', score:'5-7, 4-6',     r:'L'}]},
  'Daniil Medvedev':   { cc:'RU', ranking:5,  age:28, height:'198 cm', hand:'Right', backhand:'Two-handed', season:{w:12,l:6,  titles:1, prize:'$1,420,000'}, career:{gs:1,  hi:1, titles:21}, surfaces:{hard:78,clay:51,grass:63}, recent:[{opp:'Carlos Alcaraz',   tourn:'Miami Open SF', score:'3-6, 4-6',     r:'L'},{opp:'Tommy Paul',       tourn:'Miami Open QF', score:'6-2, 7-5',     r:'W'},{opp:'Stefanos Tsitsipas',tourn:'Miami Open R16',score:'6-3, 6-4',    r:'W'},{opp:'Jannik Sinner',    tourn:'Australian Open',score:'3-6, 4-6, 6-7',r:'L'},{opp:'Holger Rune',      tourn:'Indian Wells',  score:'6-4, 7-6',     r:'W'}]},
  // WTA
  'Aryna Sabalenka':   { cc:'BY', ranking:1,  age:26, height:'182 cm', hand:'Right', backhand:'Two-handed', season:{w:19,l:2,  titles:3, prize:'$3,860,000'}, career:{gs:3,  hi:1, titles:14}, surfaces:{hard:84,clay:65,grass:71}, recent:[{opp:'Coco Gauff',       tourn:'Miami Open F',  score:'6-3, 4-5*',    r:'Live'},{opp:'Elena Rybakina',   tourn:'Miami Open SF', score:'6-4, 7-6',     r:'W'},{opp:'Jessica Pegula',   tourn:'Miami Open QF', score:'6-3, 6-2',     r:'W'},{opp:'B. Haddad Maia',   tourn:'Miami Open R16',score:'6-2, 6-1',     r:'W'},{opp:'Madison Keys',     tourn:'Australian Open',score:'6-3, 7-6',    r:'W'}]},
  'Iga Swiatek':       { cc:'PL', ranking:2,  age:23, height:'175 cm', hand:'Right', backhand:'Two-handed', season:{w:14,l:5,  titles:2, prize:'$2,420,000'}, career:{gs:5,  hi:1, titles:23}, surfaces:{hard:75,clay:88,grass:65}, recent:[{opp:'Coco Gauff',       tourn:'Miami Open SF', score:'6-3, 4-6, 3-6',r:'L'},{opp:'Jasmine Paolini',  tourn:'Miami Open QF', score:'6-2, 6-4',     r:'W'},{opp:'Maria Sakkari',    tourn:'Miami Open R16',score:'6-1, 6-3',     r:'W'},{opp:'Elena Rybakina',   tourn:'Indian Wells',  score:'7-5, 6-3',     r:'W'},{opp:'Aryna Sabalenka',  tourn:'Australian Open',score:'6-7, 5-7',    r:'L'}]},
  'Coco Gauff':        { cc:'US', ranking:3,  age:20, height:'180 cm', hand:'Right', backhand:'Two-handed', season:{w:15,l:4,  titles:2, prize:'$2,180,000'}, career:{gs:1,  hi:2, titles:9},  surfaces:{hard:77,clay:68,grass:70}, recent:[{opp:'Aryna Sabalenka',  tourn:'Miami Open F',  score:'3-6, 5-4*',    r:'Live'},{opp:'Iga Swiatek',      tourn:'Miami Open SF', score:'3-6, 6-4, 6-3',r:'W'},{opp:'Emma Navarro',     tourn:'Miami Open QF', score:'6-4, 6-3',     r:'W'},{opp:'Paula Badosa',     tourn:'Miami Open R16',score:'7-5, 6-4',     r:'W'},{opp:'Iga Swiatek',      tourn:'Indian Wells',  score:'6-3, 6-1',     r:'W'}]},
  'Elena Rybakina':    { cc:'KZ', ranking:4,  age:25, height:'184 cm', hand:'Right', backhand:'Two-handed', season:{w:13,l:5,  titles:1, prize:'$1,650,000'}, career:{gs:1,  hi:3, titles:12}, surfaces:{hard:74,clay:61,grass:76}, recent:[{opp:'Aryna Sabalenka',  tourn:'Miami Open SF', score:'4-6, 6-7',     r:'L'},{opp:'Mirra Andreeva',   tourn:'Miami Open QF', score:'7-5, 6-4',     r:'W'},{opp:'Barbora Krejcikova',tourn:'Miami Open R16',score:'6-4, 7-6',    r:'W'},{opp:'Iga Swiatek',      tourn:'Indian Wells',  score:'5-7, 3-6',     r:'L'},{opp:'Aryna Sabalenka',  tourn:'Australian Open',score:'6-7, 5-7',    r:'L'}]},
  'Jessica Pegula':    { cc:'US', ranking:5,  age:30, height:'170 cm', hand:'Right', backhand:'Two-handed', season:{w:10,l:6,  titles:0, prize:'$880,000'},  career:{gs:0,  hi:3, titles:5},  surfaces:{hard:72,clay:60,grass:63}, recent:[{opp:'Aryna Sabalenka',  tourn:'Miami Open QF', score:'3-6, 2-6',     r:'L'},{opp:'Daria Kasatkina',  tourn:'Miami Open R16',score:'6-3, 7-5',     r:'W'},{opp:'Iga Swiatek',      tourn:'Indian Wells',  score:'4-6, 3-6',     r:'L'},{opp:'Emma Navarro',     tourn:'Doha',          score:'6-4, 6-2',     r:'W'},{opp:'Aryna Sabalenka',  tourn:'US Open',       score:'6-7, 4-6, 5-7',r:'L'}]},
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
  prevView:          null,    // Navigation context for back button in player profile
};

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
  tableWrap.style.display        = 'block';
  searchWrap.style.display       = '';
  toolbar.style.display          = '';
}

function showLiveArea() {
  tableWrap.style.display        = 'none';
  searchWrap.style.display       = 'none';
  livePanel.style.display        = 'block';
  tournamentsPanel.style.display = 'none';
  toolbar.style.display          = '';
  demoBanner.style.display       = 'none';
}

function showTournamentsArea() {
  tableWrap.style.display        = 'none';
  searchWrap.style.display       = 'none';
  livePanel.style.display        = 'none';
  tournamentsPanel.style.display = 'block';
  toolbar.style.display          = '';
  demoBanner.style.display       = '';
}

function showPlayerPanel() {
  tableWrap.style.display        = 'none';
  searchWrap.style.display       = 'none';
  livePanel.style.display        = 'none';
  tournamentsPanel.style.display = 'none';
  playerPanel.style.display      = 'block';
  toolbar.style.display          = 'none';
  demoBanner.style.display       = 'none';
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

// ===== LIVE RENDER =====
function renderLive(data, ts) {
  const events = data?.events ?? [];

  if (ts) {
    lastUpdEl.textContent = `Updated ${formatAge(ts)}`;
    startAgeTick(() => state.cache.live?.ts);
  }

  if (events.length === 0) {
    livePanel.innerHTML = `
      <div class="live-empty">
        <div class="live-empty-icon">📡</div>
        <p class="live-empty-title">No live matches right now</p>
        <p class="live-empty-sub">Check back later or click Refresh to try again.</p>
      </div>`;
    statusEl.textContent = '0 live matches';
    return;
  }

  statusEl.textContent = `${events.length} live match${events.length !== 1 ? 'es' : ''}`;

  // DEBUG: raw JSON of first event so field names are visible for next mapping step
  const first = events[0];
  livePanel.innerHTML = `
    <div class="live-header">
      <span class="live-dot" aria-hidden="true"></span>
      <span>${events.length} live match${events.length !== 1 ? 'es' : ''}</span>
    </div>
    <details open class="live-debug">
      <summary>Field reference — raw JSON of first event (remove once mapped)</summary>
      <pre>${escHtml(JSON.stringify(first, null, 2))}</pre>
    </details>`;
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
          <p class="live-error-title">Rate limit reached</p>
          <p class="live-error-sub">Too many requests — please wait a few minutes, then click Refresh.</p>
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

  const draw = DRAW_DATA[key];
  const FILTER_LABELS = {
    all: 'All Matches', completed: 'Completed', live: 'In Progress', upcoming: 'Upcoming', draw: 'Draw',
  };

  if (!draw) {
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

  // Count matches per filter for badge counts
  function countMatches(f) {
    return draw.rounds.reduce((n, r) =>
      n + (f === 'all' ? r.matches.length : r.matches.filter(m => m.status === f).length), 0);
  }

  const filterBtns = ['all', 'completed', 'live', 'upcoming', 'draw'].map(f => {
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

  // Filter rounds
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
    : `<div class="draw-empty-state">
        <p>No ${FILTER_LABELS[filter].toLowerCase()} matches.</p>
      </div>`;

  const contentArea = filter === 'draw'
    ? renderBracket(key)
    : `<div class="draw-rounds">${roundsHtml}</div>`;

  // Build header
  const catCls   = categoryClass(draw.rounds[0] ? 'Masters 1000' : '');
  const tournMeta = (() => {
    // Find source tournament metadata from DEMO_TOURNAMENTS
    const tourKey = key.endsWith('-wta') ? 'wta' : 'atp';
    const slug    = key;
    return DEMO_TOURNAMENTS[tourKey]?.find(t => tournSlug(t.name, tourKey) === slug) || null;
  })();
  const meta = tournMeta || {};

  const isLive = (meta.status === 'ongoing') || draw.rounds.some(r => r.matches.some(m => m.status === 'live'));
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
      </div>
      <div class="draw-filter-bar">${filterBtns}</div>
      ${contentArea}
    </div>`;

  document.getElementById('drawBackBtn').addEventListener('click', () => {
    state.activeTournament = null;
    loadTournaments();
  });
  tournamentsPanel.querySelectorAll('.draw-filter-btn').forEach(btn =>
    btn.addEventListener('click', () => renderTournamentDetail(key, btn.dataset.filter))
  );
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
  statusEl.textContent  = 'Demo data';
  renderTournaments(state.tourFilter);
}

// ===== PLAYER PROFILES =====
function openPlayerProfile(name) {
  if (state.currentTour === 'tournaments') {
    state.prevView = state.activeTournament
      ? { type: 'tournament-detail', key: state.activeTournament, filter: state.drawFilter }
      : { type: 'tournaments' };
  } else {
    state.prevView = { type: 'rankings', tour: state.currentTour || 'atp' };
  }
  showPlayerPanel();
  renderPlayerProfile(name);
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

// ===== ACTIVATE TAB =====
function activateTab(tour) {
  state.currentTour = tour;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tour === tour);
  });
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
    if (!state.currentTour) return;
    bustCache(state.currentTour);
    if (state.currentTour === 'live') {
      loadLive(true);
    } else {
      loadRankings(state.currentTour, true);
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
