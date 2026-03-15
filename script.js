/* ══════════════════════════════════════════════════════════════
   SCIENCELAB — COMPLETE SCRIPT  v2.0
   MIT-Level AI · Groq + OpenRouter fallback chain
   Developer: Kabya Saha
══════════════════════════════════════════════════════════════ */

/* ── API KEYS ─────────────────────────────────────────────── */
const GROQ_KEY       = "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";
const OPENROUTER_KEY = "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";

/* ══════════════════════════════════
   ELEMENT DATA (all 118)
══════════════════════════════════ */
const EL=[
  {n:1,sym:"H",name:"Hydrogen",mass:1.008,cat:"hydrogen",group:1,period:1,config:"1s¹",state:"Gas",melt:-259.16,boil:-252.88,density:"0.0000899 g/L",disc:"1766",by:"Cavendish",desc:"Lightest and most abundant element. Makes up ~75% of all normal matter."},
  {n:2,sym:"He",name:"Helium",mass:4.003,cat:"noble",group:18,period:1,config:"1s²",state:"Gas",melt:-272.2,boil:-268.9,density:"0.000179 g/L",disc:"1868",by:"Janssen",desc:"Second most abundant element. Inert noble gas used in MRI and cryogenics."},
  {n:3,sym:"Li",name:"Lithium",mass:6.94,cat:"alkali",group:1,period:2,config:"[He] 2s¹",state:"Solid",melt:180.5,boil:1330,density:"0.534 g/cm³",disc:"1817",by:"Arfwedson",desc:"Lightest metal. Key component of lithium-ion batteries."},
  {n:4,sym:"Be",name:"Beryllium",mass:9.012,cat:"alkaline",group:2,period:2,config:"[He] 2s²",state:"Solid",melt:1287,boil:2468,density:"1.85 g/cm³",disc:"1798",by:"Vauquelin",desc:"Hard alkaline earth metal used in aerospace and X-ray windows."},
  {n:5,sym:"B",name:"Boron",mass:10.81,cat:"metalloid",group:13,period:2,config:"[He] 2s² 2p¹",state:"Solid",melt:2076,boil:3927,density:"2.37 g/cm³",disc:"1808",by:"Gay-Lussac",desc:"Metalloid essential for plant growth. Used in glass and ceramics."},
  {n:6,sym:"C",name:"Carbon",mass:12.011,cat:"nonmetal",group:14,period:2,config:"[He] 2s² 2p²",state:"Solid",melt:3550,boil:4827,density:"2.267 g/cm³",disc:"Ancient",by:"Ancients",desc:"Basis of all known life. Exists as diamond, graphite, and fullerenes."},
  {n:7,sym:"N",name:"Nitrogen",mass:14.007,cat:"nonmetal",group:15,period:2,config:"[He] 2s² 2p³",state:"Gas",melt:-210.1,boil:-195.8,density:"0.00125 g/L",disc:"1772",by:"Rutherford",desc:"Makes up 78% of Earth's atmosphere. Essential for amino acids."},
  {n:8,sym:"O",name:"Oxygen",mass:15.999,cat:"nonmetal",group:16,period:2,config:"[He] 2s² 2p⁴",state:"Gas",melt:-218.8,boil:-183,density:"0.00143 g/L",disc:"1774",by:"Scheele & Priestley",desc:"Essential for respiration. Most abundant element in Earth's crust."},
  {n:9,sym:"F",name:"Fluorine",mass:18.998,cat:"nonmetal",group:17,period:2,config:"[He] 2s² 2p⁵",state:"Gas",melt:-219.7,boil:-188.1,density:"0.0017 g/L",disc:"1886",by:"Moissan",desc:"Most electronegative element. Extremely reactive pale yellow gas."},
  {n:10,sym:"Ne",name:"Neon",mass:20.18,cat:"noble",group:18,period:2,config:"[He] 2s² 2p⁶",state:"Gas",melt:-248.6,boil:-246,density:"0.0009 g/L",disc:"1898",by:"Ramsay & Travers",desc:"Noble gas famous for its red-orange glow in neon signs."},
  {n:11,sym:"Na",name:"Sodium",mass:22.99,cat:"alkali",group:1,period:3,config:"[Ne] 3s¹",state:"Solid",melt:97.8,boil:882.9,density:"0.971 g/cm³",disc:"1807",by:"Davy",desc:"Soft reactive metal. Essential for nerve transmission."},
  {n:12,sym:"Mg",name:"Magnesium",mass:24.305,cat:"alkaline",group:2,period:3,config:"[Ne] 3s²",state:"Solid",melt:650,boil:1090,density:"1.74 g/cm³",disc:"1808",by:"Davy",desc:"Lightweight structural metal. Central atom in chlorophyll."},
  {n:13,sym:"Al",name:"Aluminium",mass:26.982,cat:"post",group:13,period:3,config:"[Ne] 3s² 3p¹",state:"Solid",melt:660.3,boil:2519,density:"2.70 g/cm³",disc:"1825",by:"Ørsted",desc:"Most abundant metal in Earth's crust. Lightweight, corrosion-resistant."},
  {n:14,sym:"Si",name:"Silicon",mass:28.085,cat:"metalloid",group:14,period:3,config:"[Ne] 3s² 3p²",state:"Solid",melt:1414,boil:3265,density:"2.329 g/cm³",disc:"1824",by:"Berzelius",desc:"Backbone of modern electronics. Second most abundant element in crust."},
  {n:15,sym:"P",name:"Phosphorus",mass:30.974,cat:"nonmetal",group:15,period:3,config:"[Ne] 3s² 3p³",state:"Solid",melt:44.15,boil:280.5,density:"1.82 g/cm³",disc:"1669",by:"Brand",desc:"Essential for DNA, RNA, and ATP. Key nutrient in fertilizers."},
  {n:16,sym:"S",name:"Sulfur",mass:32.06,cat:"nonmetal",group:16,period:3,config:"[Ne] 3s² 3p⁴",state:"Solid",melt:115.2,boil:444.6,density:"2.067 g/cm³",disc:"Ancient",by:"Ancients",desc:"Yellow solid. Key to proteins and sulfuric acid production."},
  {n:17,sym:"Cl",name:"Chlorine",mass:35.45,cat:"nonmetal",group:17,period:3,config:"[Ne] 3s² 3p⁵",state:"Gas",melt:-101.5,boil:-34.04,density:"0.00321 g/L",disc:"1774",by:"Scheele",desc:"Used in water purification, PVC production, and as a disinfectant."},
  {n:18,sym:"Ar",name:"Argon",mass:39.948,cat:"noble",group:18,period:3,config:"[Ne] 3s² 3p⁶",state:"Gas",melt:-189.4,boil:-185.9,density:"0.00178 g/L",disc:"1894",by:"Rayleigh & Ramsay",desc:"Third most abundant gas in atmosphere. Used in welding."},
  {n:19,sym:"K",name:"Potassium",mass:39.098,cat:"alkali",group:1,period:4,config:"[Ar] 4s¹",state:"Solid",melt:63.4,boil:759,density:"0.862 g/cm³",disc:"1807",by:"Davy",desc:"Essential for plant growth and nerve function. Burns with violet flame."},
  {n:20,sym:"Ca",name:"Calcium",mass:40.078,cat:"alkaline",group:2,period:4,config:"[Ar] 4s²",state:"Solid",melt:842,boil:1484,density:"1.54 g/cm³",disc:"1808",by:"Davy",desc:"Essential for bones, teeth, and cell signaling."},
  {n:21,sym:"Sc",name:"Scandium",mass:44.956,cat:"transition",group:3,period:4,config:"[Ar] 3d¹ 4s²",state:"Solid",melt:1541,boil:2836,density:"2.985 g/cm³",disc:"1879",by:"Nilson",desc:"Rare light transition metal used in aircraft and sporting equipment."},
  {n:22,sym:"Ti",name:"Titanium",mass:47.867,cat:"transition",group:4,period:4,config:"[Ar] 3d² 4s²",state:"Solid",melt:1668,boil:3287,density:"4.506 g/cm³",disc:"1791",by:"Gregor",desc:"Strong, lightweight metal used in aircraft and medical implants."},
  {n:23,sym:"V",name:"Vanadium",mass:50.942,cat:"transition",group:5,period:4,config:"[Ar] 3d³ 4s²",state:"Solid",melt:1910,boil:3407,density:"6.11 g/cm³",disc:"1801",by:"del Río",desc:"Used in steel alloys and vanadium redox flow batteries."},
  {n:24,sym:"Cr",name:"Chromium",mass:51.996,cat:"transition",group:6,period:4,config:"[Ar] 3d⁵ 4s¹",state:"Solid",melt:1907,boil:2671,density:"7.15 g/cm³",disc:"1797",by:"Vauquelin",desc:"Hard, lustrous metal giving stainless steel its corrosion resistance."},
  {n:25,sym:"Mn",name:"Manganese",mass:54.938,cat:"transition",group:7,period:4,config:"[Ar] 3d⁵ 4s²",state:"Solid",melt:1246,boil:2061,density:"7.21 g/cm³",disc:"1774",by:"Gahn",desc:"Essential in steel production and batteries."},
  {n:26,sym:"Fe",name:"Iron",mass:55.845,cat:"transition",group:8,period:4,config:"[Ar] 3d⁶ 4s²",state:"Solid",melt:1538,boil:2861,density:"7.874 g/cm³",disc:"Ancient",by:"Ancients",desc:"Most used metal. Earth's core is largely iron-nickel."},
  {n:27,sym:"Co",name:"Cobalt",mass:58.933,cat:"transition",group:9,period:4,config:"[Ar] 3d⁷ 4s²",state:"Solid",melt:1495,boil:2927,density:"8.9 g/cm³",disc:"1735",by:"Brandt",desc:"Used in superalloys, permanent magnets, and lithium batteries."},
  {n:28,sym:"Ni",name:"Nickel",mass:58.693,cat:"transition",group:10,period:4,config:"[Ar] 3d⁸ 4s²",state:"Solid",melt:1455,boil:2730,density:"8.908 g/cm³",disc:"1751",by:"Cronstedt",desc:"Used in stainless steel, coins, and rechargeable batteries."},
  {n:29,sym:"Cu",name:"Copper",mass:63.546,cat:"transition",group:11,period:4,config:"[Ar] 3d¹⁰ 4s¹",state:"Solid",melt:1084.6,boil:2562,density:"8.96 g/cm³",disc:"Ancient",by:"Ancients",desc:"Excellent electrical conductor. Essential for wiring."},
  {n:30,sym:"Zn",name:"Zinc",mass:65.38,cat:"transition",group:12,period:4,config:"[Ar] 3d¹⁰ 4s²",state:"Solid",melt:419.5,boil:907,density:"7.134 g/cm³",disc:"1746",by:"Marggraf",desc:"Used for galvanizing steel and as a dietary supplement."},
  {n:31,sym:"Ga",name:"Gallium",mass:69.723,cat:"post",group:13,period:4,config:"[Ar] 3d¹⁰ 4s² 4p¹",state:"Solid",melt:29.76,boil:2204,density:"5.91 g/cm³",disc:"1875",by:"Lecoq de Boisbaudran",desc:"Melts at 30°C. Used in semiconductors and LEDs."},
  {n:32,sym:"Ge",name:"Germanium",mass:72.63,cat:"metalloid",group:14,period:4,config:"[Ar] 3d¹⁰ 4s² 4p²",state:"Solid",melt:938.3,boil:2833,density:"5.323 g/cm³",disc:"1886",by:"Winkler",desc:"Key semiconductor for transistors and infrared optics."},
  {n:33,sym:"As",name:"Arsenic",mass:74.922,cat:"metalloid",group:15,period:4,config:"[Ar] 3d¹⁰ 4s² 4p³",state:"Solid",melt:816,boil:614,density:"5.727 g/cm³",disc:"Ancient",by:"Magnus",desc:"Toxic metalloid used historically as poison, now in semiconductors."},
  {n:34,sym:"Se",name:"Selenium",mass:78.971,cat:"nonmetal",group:16,period:4,config:"[Ar] 3d¹⁰ 4s² 4p⁴",state:"Solid",melt:220.8,boil:685,density:"4.809 g/cm³",disc:"1817",by:"Berzelius",desc:"Photoconductive element used in solar panels."},
  {n:35,sym:"Br",name:"Bromine",mass:79.904,cat:"nonmetal",group:17,period:4,config:"[Ar] 3d¹⁰ 4s² 4p⁵",state:"Liquid",melt:-7.2,boil:58.8,density:"3.1 g/cm³",disc:"1826",by:"Balard",desc:"One of only two liquid elements at room temperature."},
  {n:36,sym:"Kr",name:"Krypton",mass:83.798,cat:"noble",group:18,period:4,config:"[Ar] 3d¹⁰ 4s² 4p⁶",state:"Gas",melt:-157.4,boil:-153.2,density:"0.00373 g/L",disc:"1898",by:"Ramsay & Travers",desc:"Noble gas used in high-performance lasers."},
  {n:37,sym:"Rb",name:"Rubidium",mass:85.468,cat:"alkali",group:1,period:5,config:"[Kr] 5s¹",state:"Solid",melt:39.31,boil:688,density:"1.532 g/cm³",disc:"1861",by:"Bunsen & Kirchhoff",desc:"Soft, reactive alkali metal used in atomic clocks."},
  {n:38,sym:"Sr",name:"Strontium",mass:87.62,cat:"alkaline",group:2,period:5,config:"[Kr] 5s²",state:"Solid",melt:777,boil:1382,density:"2.64 g/cm³",disc:"1790",by:"Crawford",desc:"Produces brilliant red color in fireworks."},
  {n:39,sym:"Y",name:"Yttrium",mass:88.906,cat:"transition",group:3,period:5,config:"[Kr] 4d¹ 5s²",state:"Solid",melt:1526,boil:3336,density:"4.469 g/cm³",disc:"1794",by:"Gadolin",desc:"Used in LEDs, camera lenses, and laser crystals."},
  {n:40,sym:"Zr",name:"Zirconium",mass:91.224,cat:"transition",group:4,period:5,config:"[Kr] 4d² 5s²",state:"Solid",melt:1855,boil:4409,density:"6.506 g/cm³",disc:"1789",by:"Klaproth",desc:"Corrosion-resistant metal used in nuclear reactor cladding."},
  {n:41,sym:"Nb",name:"Niobium",mass:92.906,cat:"transition",group:5,period:5,config:"[Kr] 4d⁴ 5s¹",state:"Solid",melt:2477,boil:4744,density:"8.57 g/cm³",disc:"1801",by:"Hatchett",desc:"Used in superconducting MRI magnets."},
  {n:42,sym:"Mo",name:"Molybdenum",mass:95.95,cat:"transition",group:6,period:5,config:"[Kr] 4d⁵ 5s¹",state:"Solid",melt:2623,boil:4639,density:"10.22 g/cm³",disc:"1781",by:"Scheele",desc:"High melting point. Used in high-strength steel."},
  {n:43,sym:"Tc",name:"Technetium",mass:98,cat:"transition",group:7,period:5,config:"[Kr] 4d⁵ 5s²",state:"Solid",melt:2157,boil:4265,density:"11 g/cm³",disc:"1937",by:"Perrier & Segrè",desc:"First artificially produced element. Used in medical imaging."},
  {n:44,sym:"Ru",name:"Ruthenium",mass:101.07,cat:"transition",group:8,period:5,config:"[Kr] 4d⁷ 5s¹",state:"Solid",melt:2334,boil:4150,density:"12.37 g/cm³",disc:"1844",by:"Klaus",desc:"Platinum group metal. Excellent catalyst."},
  {n:45,sym:"Rh",name:"Rhodium",mass:102.906,cat:"transition",group:9,period:5,config:"[Kr] 4d⁸ 5s¹",state:"Solid",melt:1964,boil:3695,density:"12.41 g/cm³",disc:"1803",by:"Wollaston",desc:"Extremely rare and precious. Used in catalytic converters."},
  {n:46,sym:"Pd",name:"Palladium",mass:106.42,cat:"transition",group:10,period:5,config:"[Kr] 4d¹⁰",state:"Solid",melt:1554.9,boil:2963,density:"12.023 g/cm³",disc:"1803",by:"Wollaston",desc:"Precious metal used in catalytic converters and electronics."},
  {n:47,sym:"Ag",name:"Silver",mass:107.868,cat:"transition",group:11,period:5,config:"[Kr] 4d¹⁰ 5s¹",state:"Solid",melt:961.8,boil:2162,density:"10.49 g/cm³",disc:"Ancient",by:"Ancients",desc:"Best electrical conductor. Antimicrobial. Used in jewelry and electronics."},
  {n:48,sym:"Cd",name:"Cadmium",mass:112.414,cat:"transition",group:12,period:5,config:"[Kr] 4d¹⁰ 5s²",state:"Solid",melt:321.1,boil:767,density:"8.65 g/cm³",disc:"1817",by:"Stromeyer",desc:"Used in batteries and semiconductor nanoparticles."},
  {n:49,sym:"In",name:"Indium",mass:114.818,cat:"post",group:13,period:5,config:"[Kr] 4d¹⁰ 5s² 5p¹",state:"Solid",melt:156.6,boil:2072,density:"7.31 g/cm³",disc:"1863",by:"Reich & Richter",desc:"Used in LCD screens and touchscreens as ITO."},
  {n:50,sym:"Sn",name:"Tin",mass:118.71,cat:"post",group:14,period:5,config:"[Kr] 4d¹⁰ 5s² 5p²",state:"Solid",melt:231.9,boil:2602,density:"7.287 g/cm³",disc:"Ancient",by:"Ancients",desc:"Used in bronze, solder, and food-grade coatings."},
  {n:51,sym:"Sb",name:"Antimony",mass:121.76,cat:"metalloid",group:15,period:5,config:"[Kr] 4d¹⁰ 5s² 5p³",state:"Solid",melt:630.6,boil:1587,density:"6.697 g/cm³",disc:"Ancient",by:"Ancients",desc:"Used in flame retardants and semiconductor devices."},
  {n:52,sym:"Te",name:"Tellurium",mass:127.6,cat:"metalloid",group:16,period:5,config:"[Kr] 4d¹⁰ 5s² 5p⁴",state:"Solid",melt:449.5,boil:988,density:"6.24 g/cm³",disc:"1782",by:"Müller von Reichenstein",desc:"Used in solar panels and thermoelectric devices."},
  {n:53,sym:"I",name:"Iodine",mass:126.904,cat:"nonmetal",group:17,period:5,config:"[Kr] 4d¹⁰ 5s² 5p⁵",state:"Solid",melt:113.7,boil:184.3,density:"4.933 g/cm³",disc:"1811",by:"Courtois",desc:"Essential trace element. Used in thyroid health and disinfectants."},
  {n:54,sym:"Xe",name:"Xenon",mass:131.293,cat:"noble",group:18,period:5,config:"[Kr] 4d¹⁰ 5s² 5p⁶",state:"Gas",melt:-111.8,boil:-108.1,density:"0.00589 g/L",disc:"1898",by:"Ramsay & Travers",desc:"Noble gas used in flash lamps and ion propulsion."},
  {n:55,sym:"Cs",name:"Caesium",mass:132.905,cat:"alkali",group:1,period:6,config:"[Xe] 6s¹",state:"Solid",melt:28.5,boil:671,density:"1.873 g/cm³",disc:"1860",by:"Bunsen & Kirchhoff",desc:"Used in atomic clocks and photoelectric cells."},
  {n:56,sym:"Ba",name:"Barium",mass:137.327,cat:"alkaline",group:2,period:6,config:"[Xe] 6s²",state:"Solid",melt:727,boil:1897,density:"3.62 g/cm³",disc:"1808",by:"Davy",desc:"Used in medical imaging (barium sulfate) and fireworks."},
  {n:57,sym:"La",name:"Lanthanum",mass:138.905,cat:"lanthanide",group:null,period:6,config:"[Xe] 5d¹ 6s²",state:"Solid",melt:920,boil:3464,density:"6.145 g/cm³",disc:"1839",by:"Mosander",desc:"First lanthanide. Used in camera lenses and hybrid batteries."},
  {n:58,sym:"Ce",name:"Cerium",mass:140.116,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f¹ 5d¹ 6s²",state:"Solid",melt:795,boil:3443,density:"6.77 g/cm³",disc:"1803",by:"Hisinger",desc:"Most abundant rare earth. Used in catalytic converters."},
  {n:59,sym:"Pr",name:"Praseodymium",mass:140.908,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f³ 6s²",state:"Solid",melt:931,boil:3520,density:"6.773 g/cm³",disc:"1885",by:"von Welsbach",desc:"Used in powerful magnets and aircraft engines."},
  {n:60,sym:"Nd",name:"Neodymium",mass:144.242,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f⁴ 6s²",state:"Solid",melt:1016,boil:3074,density:"7.007 g/cm³",disc:"1885",by:"von Welsbach",desc:"Used in the strongest permanent magnets (Nd₂Fe₁₄B)."},
  {n:61,sym:"Pm",name:"Promethium",mass:145,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f⁵ 6s²",state:"Solid",melt:1042,boil:3000,density:"7.26 g/cm³",disc:"1945",by:"Marinsky",desc:"Radioactive lanthanide. No stable isotopes. Used in pacemakers."},
  {n:62,sym:"Sm",name:"Samarium",mass:150.36,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f⁶ 6s²",state:"Solid",melt:1072,boil:1794,density:"7.52 g/cm³",disc:"1879",by:"Lecoq de Boisbaudran",desc:"Used in samarium-cobalt magnets and cancer treatment."},
  {n:63,sym:"Eu",name:"Europium",mass:151.964,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f⁷ 6s²",state:"Solid",melt:826,boil:1529,density:"5.243 g/cm³",disc:"1901",by:"Demarçay",desc:"Produces red and blue phosphors in TV screens."},
  {n:64,sym:"Gd",name:"Gadolinium",mass:157.25,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f⁷ 5d¹ 6s²",state:"Solid",melt:1312,boil:3273,density:"7.895 g/cm³",disc:"1880",by:"Marignac",desc:"Used as MRI contrast agent due to magnetic properties."},
  {n:65,sym:"Tb",name:"Terbium",mass:158.925,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f⁹ 6s²",state:"Solid",melt:1356,boil:3230,density:"8.229 g/cm³",disc:"1843",by:"Mosander",desc:"Used in green phosphors and solid-state devices."},
  {n:66,sym:"Dy",name:"Dysprosium",mass:162.5,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f¹⁰ 6s²",state:"Solid",melt:1412,boil:2567,density:"8.55 g/cm³",disc:"1886",by:"Lecoq de Boisbaudran",desc:"Critical for neodymium magnets in electric vehicles."},
  {n:67,sym:"Ho",name:"Holmium",mass:164.93,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f¹¹ 6s²",state:"Solid",melt:1474,boil:2700,density:"8.795 g/cm³",disc:"1878",by:"Cleve",desc:"Highest magnetic moment. Used in nuclear reactors."},
  {n:68,sym:"Er",name:"Erbium",mass:167.259,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f¹² 6s²",state:"Solid",melt:1529,boil:2868,density:"9.066 g/cm³",disc:"1843",by:"Mosander",desc:"Used in fiber optic amplifiers and laser surgery."},
  {n:69,sym:"Tm",name:"Thulium",mass:168.934,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f¹³ 6s²",state:"Solid",melt:1545,boil:1950,density:"9.321 g/cm³",disc:"1879",by:"Cleve",desc:"Rarest lanthanide. Used in portable X-ray devices."},
  {n:70,sym:"Yb",name:"Ytterbium",mass:173.045,cat:"lanthanide",group:null,period:6,config:"[Xe] 4f¹⁴ 6s²",state:"Solid",melt:819,boil:1196,density:"6.965 g/cm³",disc:"1878",by:"Marignac",desc:"Used in optical fibers and atomic clocks."},
  {n:71,sym:"Lu",name:"Lutetium",mass:174.967,cat:"lanthanide",group:3,period:6,config:"[Xe] 4f¹⁴ 5d¹ 6s²",state:"Solid",melt:1652,boil:3402,density:"9.84 g/cm³",disc:"1907",by:"Urbain",desc:"Densest lanthanide. Used in PET scan detectors."},
  {n:72,sym:"Hf",name:"Hafnium",mass:178.49,cat:"transition",group:4,period:6,config:"[Xe] 4f¹⁴ 5d² 6s²",state:"Solid",melt:2233,boil:4603,density:"13.31 g/cm³",disc:"1923",by:"Coster & Hevesy",desc:"Used in nuclear control rods and microchip gate dielectrics."},
  {n:73,sym:"Ta",name:"Tantalum",mass:180.948,cat:"transition",group:5,period:6,config:"[Xe] 4f¹⁴ 5d³ 6s²",state:"Solid",melt:3017,boil:5458,density:"16.654 g/cm³",disc:"1802",by:"Ekeberg",desc:"Extremely corrosion-resistant. Used in electronics capacitors."},
  {n:74,sym:"W",name:"Tungsten",mass:183.84,cat:"transition",group:6,period:6,config:"[Xe] 4f¹⁴ 5d⁴ 6s²",state:"Solid",melt:3422,boil:5555,density:"19.25 g/cm³",disc:"1783",by:"J & F de Elhuyar",desc:"Highest melting point of all elements. Used in light bulb filaments."},
  {n:75,sym:"Re",name:"Rhenium",mass:186.207,cat:"transition",group:7,period:6,config:"[Xe] 4f¹⁴ 5d⁵ 6s²",state:"Solid",melt:3186,boil:5596,density:"21.02 g/cm³",disc:"1925",by:"Noddack",desc:"Very high melting point. Used in jet engine alloys."},
  {n:76,sym:"Os",name:"Osmium",mass:190.23,cat:"transition",group:8,period:6,config:"[Xe] 4f¹⁴ 5d⁶ 6s²",state:"Solid",melt:3033,boil:5012,density:"22.59 g/cm³",disc:"1803",by:"Tennant",desc:"Densest naturally occurring element."},
  {n:77,sym:"Ir",name:"Iridium",mass:192.217,cat:"transition",group:9,period:6,config:"[Xe] 4f¹⁴ 5d⁷ 6s²",state:"Solid",melt:2446,boil:4428,density:"22.56 g/cm³",disc:"1803",by:"Tennant",desc:"Most corrosion-resistant metal. Used in spark plugs."},
  {n:78,sym:"Pt",name:"Platinum",mass:195.084,cat:"transition",group:10,period:6,config:"[Xe] 4f¹⁴ 5d⁹ 6s¹",state:"Solid",melt:1768.3,boil:3825,density:"21.45 g/cm³",disc:"1735",by:"Ulloa",desc:"Precious metal used in catalysts and jewelry."},
  {n:79,sym:"Au",name:"Gold",mass:196.967,cat:"transition",group:11,period:6,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s¹",state:"Solid",melt:1064.2,boil:2856,density:"19.3 g/cm³",disc:"Ancient",by:"Ancients",desc:"Highly valued precious metal. Excellent conductor, unreactive."},
  {n:80,sym:"Hg",name:"Mercury",mass:200.592,cat:"transition",group:12,period:6,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s²",state:"Liquid",melt:-38.8,boil:356.7,density:"13.534 g/cm³",disc:"Ancient",by:"Ancients",desc:"Only metal liquid at room temperature. Used in thermometers."},
  {n:81,sym:"Tl",name:"Thallium",mass:204.38,cat:"post",group:13,period:6,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹",state:"Solid",melt:304,boil:1473,density:"11.85 g/cm³",disc:"1861",by:"Crookes",desc:"Toxic heavy metal used in electronics and medicine."},
  {n:82,sym:"Pb",name:"Lead",mass:207.2,cat:"post",group:14,period:6,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²",state:"Solid",melt:327.5,boil:1749,density:"11.34 g/cm³",disc:"Ancient",by:"Ancients",desc:"Dense, soft metal. Used in batteries, radiation shielding."},
  {n:83,sym:"Bi",name:"Bismuth",mass:208.98,cat:"post",group:15,period:6,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³",state:"Solid",melt:271.5,boil:1564,density:"9.807 g/cm³",disc:"Ancient",by:"Ancients",desc:"Heaviest stable element. Used in medicines and alloys."},
  {n:84,sym:"Po",name:"Polonium",mass:209,cat:"metalloid",group:16,period:6,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴",state:"Solid",melt:254,boil:962,density:"9.32 g/cm³",disc:"1898",by:"Curie",desc:"Highly radioactive. Discovered by Marie Curie."},
  {n:85,sym:"At",name:"Astatine",mass:210,cat:"nonmetal",group:17,period:6,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵",state:"Solid",melt:302,boil:337,density:"7 g/cm³",disc:"1940",by:"Corson",desc:"Rarest naturally occurring element. Radioactive halogen."},
  {n:86,sym:"Rn",name:"Radon",mass:222,cat:"noble",group:18,period:6,config:"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶",state:"Gas",melt:-71,boil:-61.7,density:"0.00973 g/L",disc:"1900",by:"Dorn",desc:"Radioactive noble gas. Causes lung cancer in high concentrations."},
  {n:87,sym:"Fr",name:"Francium",mass:223,cat:"alkali",group:1,period:7,config:"[Rn] 7s¹",state:"Solid",melt:27,boil:677,density:"1.87 g/cm³",disc:"1939",by:"Perey",desc:"Most unstable naturally occurring element. Highly radioactive alkali metal."},
  {n:88,sym:"Ra",name:"Radium",mass:226,cat:"alkaline",group:2,period:7,config:"[Rn] 7s²",state:"Solid",melt:700,boil:1737,density:"5 g/cm³",disc:"1898",by:"Curie",desc:"Radioactive alkaline earth metal. Used historically in luminous paints."},
  {n:89,sym:"Ac",name:"Actinium",mass:227,cat:"actinide",group:null,period:7,config:"[Rn] 6d¹ 7s²",state:"Solid",melt:1050,boil:3198,density:"10 g/cm³",disc:"1899",by:"Debierne",desc:"First actinide. Highly radioactive silvery-white metal."},
  {n:90,sym:"Th",name:"Thorium",mass:232.038,cat:"actinide",group:null,period:7,config:"[Rn] 6d² 7s²",state:"Solid",melt:1750,boil:4788,density:"11.7 g/cm³",disc:"1828",by:"Berzelius",desc:"Radioactive metal. Potential thorium-cycle nuclear fuel."},
  {n:91,sym:"Pa",name:"Protactinium",mass:231.036,cat:"actinide",group:null,period:7,config:"[Rn] 5f² 6d¹ 7s²",state:"Solid",melt:1568,boil:4027,density:"15.37 g/cm³",disc:"1913",by:"Fajans & Göhring",desc:"Rare, toxic, radioactive actinide. Intermediate in uranium decay."},
  {n:92,sym:"U",name:"Uranium",mass:238.029,cat:"actinide",group:null,period:7,config:"[Rn] 5f³ 6d¹ 7s²",state:"Solid",melt:1135,boil:4131,density:"19.1 g/cm³",disc:"1789",by:"Klaproth",desc:"Used as nuclear fuel. Heaviest naturally occurring element."},
  {n:93,sym:"Np",name:"Neptunium",mass:237,cat:"actinide",group:null,period:7,config:"[Rn] 5f⁴ 6d¹ 7s²",state:"Solid",melt:644,boil:4000,density:"20.2 g/cm³",disc:"1940",by:"McMillan & Abelson",desc:"First transuranic element. Produced in nuclear reactors."},
  {n:94,sym:"Pu",name:"Plutonium",mass:244,cat:"actinide",group:null,period:7,config:"[Rn] 5f⁶ 7s²",state:"Solid",melt:639.4,boil:3228,density:"19.816 g/cm³",disc:"1940",by:"Seaborg",desc:"Used in nuclear weapons and as reactor fuel."},
  {n:95,sym:"Am",name:"Americium",mass:243,cat:"actinide",group:null,period:7,config:"[Rn] 5f⁷ 7s²",state:"Solid",melt:1176,boil:2011,density:"13.67 g/cm³",disc:"1944",by:"Seaborg",desc:"Used in smoke detectors. Produced in nuclear reactors."},
  {n:96,sym:"Cm",name:"Curium",mass:247,cat:"actinide",group:null,period:7,config:"[Rn] 5f⁷ 6d¹ 7s²",state:"Solid",melt:1345,boil:3110,density:"13.51 g/cm³",disc:"1944",by:"Seaborg & Ghiorso",desc:"Named after Marie and Pierre Curie. Used in space probes."},
  {n:97,sym:"Bk",name:"Berkelium",mass:247,cat:"actinide",group:null,period:7,config:"[Rn] 5f⁹ 7s²",state:"Solid",melt:986,boil:null,density:"14.78 g/cm³",disc:"1949",by:"Seaborg",desc:"Named after Berkeley, California. Synthetic radioactive actinide."},
  {n:98,sym:"Cf",name:"Californium",mass:251,cat:"actinide",group:null,period:7,config:"[Rn] 5f¹⁰ 7s²",state:"Solid",melt:900,boil:null,density:"15.1 g/cm³",disc:"1950",by:"Seaborg",desc:"Used in neutron moisture gauges and cancer treatment."},
  {n:99,sym:"Es",name:"Einsteinium",mass:252,cat:"actinide",group:null,period:7,config:"[Rn] 5f¹¹ 7s²",state:"Solid",melt:860,boil:null,density:"8.84 g/cm³",disc:"1952",by:"Ghiorso",desc:"Named after Albert Einstein. Discovered in thermonuclear bomb debris."},
  {n:100,sym:"Fm",name:"Fermium",mass:257,cat:"actinide",group:null,period:7,config:"[Rn] 5f¹² 7s²",state:"Solid",melt:1527,boil:null,density:null,disc:"1952",by:"Ghiorso",desc:"Named after Enrico Fermi. Only exists in microgram quantities."},
  {n:101,sym:"Md",name:"Mendelevium",mass:258,cat:"actinide",group:null,period:7,config:"[Rn] 5f¹³ 7s²",state:"Solid",melt:827,boil:null,density:null,disc:"1955",by:"Seaborg & Ghiorso",desc:"Named after Dmitri Mendeleev. Synthetic radioactive actinide."},
  {n:102,sym:"No",name:"Nobelium",mass:259,cat:"actinide",group:null,period:7,config:"[Rn] 5f¹⁴ 7s²",state:"Solid",melt:827,boil:null,density:null,disc:"1958",by:"Seaborg",desc:"Named after Alfred Nobel. Very short-lived synthetic element."},
  {n:103,sym:"Lr",name:"Lawrencium",mass:262,cat:"actinide",group:3,period:7,config:"[Rn] 5f¹⁴ 7s² 7p¹",state:"Solid",melt:1627,boil:null,density:null,disc:"1961",by:"Ghiorso",desc:"Named after Ernest Lawrence. Last actinide element."},
  {n:104,sym:"Rf",name:"Rutherfordium",mass:267,cat:"transition",group:4,period:7,config:"[Rn] 5f¹⁴ 6d² 7s²",state:"Solid",melt:2100,boil:5500,density:"23.2 g/cm³",disc:"1964",by:"JINR/LBNL",desc:"Named after Ernest Rutherford. First transactinide element."},
  {n:105,sym:"Db",name:"Dubnium",mass:268,cat:"transition",group:5,period:7,config:"[Rn] 5f¹⁴ 6d³ 7s²",state:"Solid",melt:null,boil:null,density:"29.3 g/cm³",disc:"1968",by:"JINR",desc:"Named after Dubna, Russia. Radioactive synthetic element."},
  {n:106,sym:"Sg",name:"Seaborgium",mass:271,cat:"transition",group:6,period:7,config:"[Rn] 5f¹⁴ 6d⁴ 7s²",state:"Solid",melt:null,boil:null,density:"35 g/cm³",disc:"1974",by:"Ghiorso",desc:"Named after Glenn Seaborg. Short-lived synthetic element."},
  {n:107,sym:"Bh",name:"Bohrium",mass:270,cat:"transition",group:7,period:7,config:"[Rn] 5f¹⁴ 6d⁵ 7s²",state:"Solid",melt:null,boil:null,density:"37.1 g/cm³",disc:"1981",by:"GSI",desc:"Named after Niels Bohr. Extremely radioactive synthetic element."},
  {n:108,sym:"Hs",name:"Hassium",mass:277,cat:"transition",group:8,period:7,config:"[Rn] 5f¹⁴ 6d⁶ 7s²",state:"Solid",melt:null,boil:null,density:"40.7 g/cm³",disc:"1984",by:"GSI",desc:"Named after Hesse, Germany. Synthetic transactinide."},
  {n:109,sym:"Mt",name:"Meitnerium",mass:278,cat:"transition",group:9,period:7,config:"[Rn] 5f¹⁴ 6d⁷ 7s²",state:"Solid",melt:null,boil:null,density:"37.4 g/cm³",disc:"1982",by:"GSI",desc:"Named after Lise Meitner. Synthetic radioactive element."},
  {n:110,sym:"Ds",name:"Darmstadtium",mass:281,cat:"transition",group:10,period:7,config:"[Rn] 5f¹⁴ 6d⁸ 7s²",state:"Solid",melt:null,boil:null,density:"34.8 g/cm³",disc:"1994",by:"GSI",desc:"Named after Darmstadt, Germany. Extremely short-lived."},
  {n:111,sym:"Rg",name:"Roentgenium",mass:282,cat:"transition",group:11,period:7,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s¹",state:"Solid",melt:null,boil:null,density:"28.7 g/cm³",disc:"1994",by:"GSI",desc:"Named after Wilhelm Röntgen. Highly radioactive."},
  {n:112,sym:"Cn",name:"Copernicium",mass:285,cat:"transition",group:12,period:7,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s²",state:"Gas",melt:null,boil:null,density:"23.7 g/cm³",disc:"1996",by:"GSI",desc:"Named after Copernicus. Predicted to behave as a noble gas."},
  {n:113,sym:"Nh",name:"Nihonium",mass:286,cat:"post",group:13,period:7,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹",state:"Solid",melt:null,boil:null,density:"16 g/cm³",disc:"2004",by:"RIKEN",desc:"Named after Japan (Nihon). First element discovered in Asia."},
  {n:114,sym:"Fl",name:"Flerovium",mass:289,cat:"post",group:14,period:7,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²",state:"Solid",melt:null,boil:null,density:"14 g/cm³",disc:"1998",by:"JINR",desc:"Named after Flerov Laboratory of Nuclear Reactions."},
  {n:115,sym:"Mc",name:"Moscovium",mass:290,cat:"post",group:15,period:7,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³",state:"Solid",melt:null,boil:null,density:"13.5 g/cm³",disc:"2003",by:"JINR",desc:"Named after Moscow Oblast. Synthetic superheavy element."},
  {n:116,sym:"Lv",name:"Livermorium",mass:293,cat:"post",group:16,period:7,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴",state:"Solid",melt:null,boil:null,density:"12.9 g/cm³",disc:"2000",by:"JINR/LLNL",desc:"Named after Lawrence Livermore National Laboratory."},
  {n:117,sym:"Ts",name:"Tennessine",mass:294,cat:"nonmetal",group:17,period:7,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵",state:"Solid",melt:null,boil:null,density:"7.2 g/cm³",disc:"2010",by:"JINR/ORNL",desc:"Named after Tennessee. Second heaviest confirmed element."},
  {n:118,sym:"Og",name:"Oganesson",mass:294,cat:"noble",group:18,period:7,config:"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶",state:"Gas",melt:null,boil:null,density:"5 g/cm³",disc:"2002",by:"JINR",desc:"Heaviest known element. Named after Yuri Oganessian."}
];

const MM={H:1.008,He:4.003,Li:6.94,Be:9.012,B:10.81,C:12.011,N:14.007,O:15.999,F:18.998,Ne:20.18,Na:22.99,Mg:24.305,Al:26.982,Si:28.085,P:30.974,S:32.06,Cl:35.45,Ar:39.948,K:39.098,Ca:40.078,Fe:55.845,Cu:63.546,Zn:65.38,Ag:107.868,Au:196.967,Hg:200.592,Pb:207.2,Sn:118.71,Mn:54.938,Cr:51.996,Co:58.933,Ni:58.693,Mo:95.95,Br:79.904,I:126.904,Ba:137.327,Sr:87.62};

/* ══════════════════════════════════
   MIT-LEVEL SYSTEM PROMPTS
══════════════════════════════════ */
const AI_SYSTEMS = {
  math: `You are a world-class mathematician at MIT/Harvard PhD level.
ABSOLUTE RULES:
- ZERO filler. No greetings, no "Great question!", no sign-offs. Solve immediately.
- Be CONCISE and RIGOROUS. Every sentence must carry information.
- Format ALWAYS: **Method:** [theorem/technique] → numbered steps → **Answer: [result]**
- Plain text math: / for fractions, ^ for powers, sqrt() for roots, d/dx for derivatives, ∫ for integrals, Σ for sums.
- Symbols: ∈ ∉ ⊆ ∩ ∪ ∀ ∃ ⇒ ⟺ ℝ ℤ ℚ ℂ ℕ ∞ ∂ ∇ Δ π α β γ λ θ φ σ ω ≤ ≥ ≠ ≈
- Proofs: rigorous logical structure (Given → Claim → Proof → QED).
- Integrals: state method (substitution/parts/partial fractions) then all steps.
- Series/limits: explicitly state the convergence test or theorem used.
- ODEs/PDEs: general solution first → apply boundary/initial conditions.
- Linear algebra: show row ops or eigenvalue computation in full.
SCOPE: arithmetic to research-level — calculus, real/complex analysis, ODEs/PDEs, linear algebra, abstract algebra, number theory, combinatorics, probability & statistics, topology, differential geometry, functional analysis, optimization, competition math (IMO/Putnam level).`,

  phys: `You are a world-class physicist at MIT/Caltech PhD level.
ABSOLUTE RULES:
- ZERO filler. No greetings. Solve immediately.
- Format ALWAYS: **Principle:** [law/equation] → numbered steps → **Answer: [value + units]**
- Units on EVERY result. Dimensional analysis on non-trivial answers.
- State reference frame for mechanics/relativity. Coordinate system for vector problems.
- Show ALL algebraic substitutions — no skipped steps.
CONSTANTS: c=3×10^8 m/s | h=6.626×10^-34 J·s | ℏ=1.055×10^-34 J·s | G=6.674×10^-11 N·m²/kg² | kB=1.381×10^-23 J/K | e=1.602×10^-19 C | me=9.109×10^-31 kg | ε0=8.854×10^-12 F/m | NA=6.022×10^23 mol⁻¹ | R=8.314 J/(mol·K) | g=9.81 m/s²
SCOPE: classical mechanics (Newtonian/Lagrangian/Hamiltonian), E&M (Maxwell, circuits), thermodynamics & stat mech, quantum mechanics (Schrödinger, perturbation theory, spin), relativity, optics, fluid dynamics, nuclear & particle physics, astrophysics.`,

  chem: `You are a world-class chemist at MIT/Caltech PhD level.
ABSOLUTE RULES:
- ZERO filler. No greetings. Solve immediately.
- Format ALWAYS: **Approach:** [method] → numbered steps → **Answer: [value + units]**
- Units always. Sig figs match given data.
- Equations: H2O for subscripts, → reactions, ⇌ equilibrium, Δ heat.
KEY EQUATIONS: ΔG=ΔH-TΔS | ΔG°=-RT·ln(K) | pH=-log[H+] | pH=pKa+log([A-]/[HA]) | E=E°-(RT/nF)·ln(Q) | k=A·e^(-Ea/RT) | A=εlc | PV=nRT
SCOPE: stoichiometry, equilibrium (ICE tables), acid-base (polyprotic, buffers, titrations), thermodynamics (Hess's law), kinetics (rate laws, Arrhenius, mechanisms), electrochemistry (Nernst), quantum chemistry, organic chemistry (all mechanisms, synthesis, NMR/IR/MS), coordination chemistry, nuclear chemistry.`
};

/* ══════════════════════════════════
   PROVIDER CHAIN
══════════════════════════════════ */
const PROVIDERS = [
  {
    name:"Groq · Llama-3.3-70B",
    async call(sys,q){
      const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${GROQ_KEY}`},body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"system",content:sys},{role:"user",content:q}],temperature:0.2,max_tokens:1024})});
      if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message||`Groq ${r.status}`);}
      const d=await r.json();return d.choices?.[0]?.message?.content||"";
    }
  },
  {
    name:"Groq · DeepSeek-R1-70B",
    async call(sys,q){
      const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${GROQ_KEY}`},body:JSON.stringify({model:"deepseek-r1-distill-llama-70b",messages:[{role:"system",content:sys},{role:"user",content:q}],temperature:0.1,max_tokens:1024})});
      if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message||`Groq-R1 ${r.status}`);}
      const d=await r.json();return d.choices?.[0]?.message?.content||"";
    }
  },
  {
    name:"OpenRouter · DeepSeek-R1 Full",
    async call(sys,q){
      const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${OPENROUTER_KEY}`,"HTTP-Referer":window.location.origin,"X-Title":"ScienceLab"},body:JSON.stringify({model:"deepseek/deepseek-r1:free",messages:[{role:"system",content:sys},{role:"user",content:q}],temperature:0.1,max_tokens:1024})});
      if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message||`OR-R1 ${r.status}`);}
      const d=await r.json();return d.choices?.[0]?.message?.content||"";
    }
  },
  {
    name:"OpenRouter · Llama-3.3-70B",
    async call(sys,q){
      const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${OPENROUTER_KEY}`,"HTTP-Referer":window.location.origin,"X-Title":"ScienceLab"},body:JSON.stringify({model:"meta-llama/llama-3.3-70b-instruct:free",messages:[{role:"system",content:sys},{role:"user",content:q}],temperature:0.2,max_tokens:1024})});
      if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e?.error?.message||`OR-Llama ${r.status}`);}
      const d=await r.json();return d.choices?.[0]?.message?.content||"";
    }
  }
];

/* ══════════════════════════════════
   CORE AI CALL — auto-fallback
══════════════════════════════════ */
async function callAI(subject,question){
  const sys=AI_SYSTEMS[subject];
  for(const p of PROVIDERS){
    try{
      const raw=await p.call(sys,question);
      const out=cleanAIResponse(raw);
      if(out&&out.length>10){console.info(`✅ solved via ${p.name}`);return out;}
    }catch(e){console.warn(`⚠️ ${p.name} failed:`,e.message);}
  }
  throw new Error("All AI providers failed.\n\nCheck your internet connection.\nGroq key: console.groq.com\nOpenRouter key: openrouter.ai/keys");
}

function cleanAIResponse(t){
  if(!t)return"";
  t=t.replace(/<think>[\s\S]*?<\/think>/gi,"").trim();
  t=t.replace(/<thinking>[\s\S]*?<\/thinking>/gi,"").trim();
  t=t.replace(/---[\s\S]*?[Ss]upport[\s\S]*?---/g,"");
  t=t.replace(/[Pp]owered by[^\n]*/g,"");
  t=t.replace(/\n{3,}/g,"\n\n");
  return t.trim();
}

/* ══════════════════════════════════
   MARKDOWN → HTML
══════════════════════════════════ */
function mdToHtml(t){
  const subs=[[/\\frac\{([^}]+)\}\{([^}]+)\}/g,"($1)/($2)"],[/\\sqrt\{([^}]+)\}/g,"√($1)"],[/\\int\b/g,"∫"],[/\\sum\b/g,"∑"],[/\\prod\b/g,"∏"],[/\\infty/g,"∞"],[/\\partial/g,"∂"],[/\\nabla/g,"∇"],[/\\hbar/g,"ℏ"],[/\\rightarrow|\\to\b/g,"→"],[/\\leftarrow/g,"←"],[/\\Rightarrow/g,"⇒"],[/\\Leftrightarrow/g,"⟺"],[/\\leq/g,"≤"],[/\\geq/g,"≥"],[/\\neq/g,"≠"],[/\\approx/g,"≈"],[/\\times/g,"×"],[/\\cdot/g,"·"],[/\\pm/g,"±"],[/\\alpha/g,"α"],[/\\beta/g,"β"],[/\\gamma/g,"γ"],[/\\delta/g,"δ"],[/\\Delta/g,"Δ"],[/\\lambda/g,"λ"],[/\\mu/g,"μ"],[/\\sigma/g,"σ"],[/\\omega/g,"ω"],[/\\Omega/g,"Ω"],[/\\pi/g,"π"],[/\\theta/g,"θ"],[/\\phi/g,"φ"],[/\\psi/g,"ψ"],[/\\rho/g,"ρ"],[/\\epsilon/g,"ε"],[/\\left[\(\[\{]|\\right[\)\]\}]/g,""],[/\\\(|\\\)/g,""],[/\\\[|\\\]/g,""]];
  subs.forEach(([r,s])=>{try{t=t.replace(r,s);}catch{}});
  t=t.replace(/\*\*Answer:?\s*([\s\S]+?)\*\*/g,'<div class="ai-answer-box"><span class="ai-answer-label">ANSWER</span><span class="ai-answer-val">$1</span></div>');
  t=t.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\*(.+?)\*/g,"<em>$1</em>").replace(/`(.+?)`/g,'<code class="inline-code">$1</code>');
  t=t.replace(/^#{1,3}\s+(.+)$/gm,'<div class="ai-section-head">$1</div>');
  t=t.replace(/^(\d+)\.\s+(.+)$/gm,'<div class="ai-step"><span class="ai-step-num">$1</span><span class="ai-step-body">$2</span></div>');
  t=t.replace(/^[-•]\s+(.+)$/gm,'<div class="ai-bullet">$1</div>');
  t=t.replace(/\n\n+/g,'<div class="ai-spacer"></div>');
  t=t.replace(/\n(?![<])/g,"<br>");
  return t;
}

/* ══════════════════════════════════
   ASK AI HANDLER
══════════════════════════════════ */
async function askAI(subject){
  const inp=document.getElementById(subject+'-q');
  const q=inp.value.trim();
  if(!q)return;
  inp.value='';inp.style.height='auto';
  const think=document.getElementById(subject+'-think');
  const ans=document.getElementById(subject+'-ans');
  const err=document.getElementById(subject+'-err');
  const sbtn=document.getElementById(subject+'-sbtn');
  err.classList.remove('show');ans.classList.remove('show');
  think.classList.add('show');sbtn.disabled=true;
  sbtn.innerHTML=`<svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><span>Solving…</span>`;
  try{
    const reply=await callAI(subject,q);
    think.classList.remove('show');
    document.getElementById(subject+'-acont').innerHTML=mdToHtml(reply);
    ans.classList.add('show');
    ans.scrollIntoView({behavior:'smooth',block:'nearest'});
    toast('Solution ready!',subject);
  }catch(e){
    think.classList.remove('show');
    document.getElementById(subject+'-emsg').textContent=e.message||'Connection error.';
    err.classList.add('show');
  }finally{
    sbtn.disabled=false;
    sbtn.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span>Ask</span>`;
  }
}

function copyAns(id){
  const el=document.getElementById(id);
  navigator.clipboard.writeText(el.innerText||el.textContent).then(()=>toast('Copied!','chem')).catch(()=>{});
}

/* ══════════════════════════════════
   ANSWER BOX STYLES
══════════════════════════════════ */
(function(){
  if(document.getElementById('sl-ai-styles'))return;
  const s=document.createElement('style');
  s.id='sl-ai-styles';
  s.textContent=`
    .ai-answer-box{display:flex;align-items:flex-start;gap:12px;background:linear-gradient(135deg,var(--acc,#4f8ef7)14,transparent);border:1.5px solid var(--acc,#4f8ef7);border-radius:10px;padding:12px 16px;margin:14px 0 4px}
    .ai-answer-label{font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--acc,#4f8ef7);white-space:nowrap;padding-top:3px}
    .ai-answer-val{font-size:15px;font-weight:700;color:var(--fg,#e8eaf6);line-height:1.55}
    .ai-section-head{font-weight:700;color:var(--acc,#4f8ef7);margin:14px 0 6px;font-size:13px;letter-spacing:.5px;border-bottom:1px solid var(--acc,#4f8ef7)25;padding-bottom:4px}
    .ai-step{display:flex;gap:10px;align-items:baseline;margin:7px 0;line-height:1.65}
    .ai-step-num{font-size:10px;font-weight:800;color:var(--acc,#4f8ef7);background:var(--acc,#4f8ef7)20;border-radius:50%;min-width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
    .ai-step-body{flex:1}
    .ai-bullet{padding-left:18px;margin:5px 0;position:relative;line-height:1.65}
    .ai-bullet::before{content:'▸';position:absolute;left:2px;color:var(--acc,#4f8ef7);font-size:12px;top:1px}
    .ai-spacer{height:10px}
    .inline-code{background:var(--acc,#4f8ef7)18;color:var(--acc,#4f8ef7);padding:1px 6px;border-radius:4px;font-family:'JetBrains Mono','Fira Code',monospace;font-size:.88em}
  `;
  (document.head||document.documentElement).appendChild(s);
})();

/* ══════════════════════════════════
   PERIODIC TABLE
══════════════════════════════════ */
const CATS={alkali:'Alkali Metal',alkaline:'Alkaline Earth',transition:'Transition Metal',post:'Post-Transition',metalloid:'Metalloid',nonmetal:'Nonmetal',noble:'Noble Gas',lanthanide:'Lanthanide',actinide:'Actinide',hydrogen:'Hydrogen'};
const CAT_COLORS={alkali:'#ef4444',alkaline:'#f59e0b',transition:'#3b82f6',post:'#06b6d4',metalloid:'#22c55e',nonmetal:'#8b5cf6',noble:'#00d4ff',lanthanide:'#a855f7',actinide:'#f97316',hydrogen:'#14b8a6'};
let ptBuilt=false,hlCat=null;
const PT_LAYOUT=[[1,1,1],[2,18,1],[3,1,2],[4,2,2],[5,13,2],[6,14,2],[7,15,2],[8,16,2],[9,17,2],[10,18,2],[11,1,3],[12,2,3],[13,13,3],[14,14,3],[15,15,3],[16,16,3],[17,17,3],[18,18,3],[19,1,4],[20,2,4],[21,3,4],[22,4,4],[23,5,4],[24,6,4],[25,7,4],[26,8,4],[27,9,4],[28,10,4],[29,11,4],[30,12,4],[31,13,4],[32,14,4],[33,15,4],[34,16,4],[35,17,4],[36,18,4],[37,1,5],[38,2,5],[39,3,5],[40,4,5],[41,5,5],[42,6,5],[43,7,5],[44,8,5],[45,9,5],[46,10,5],[47,11,5],[48,12,5],[49,13,5],[50,14,5],[51,15,5],[52,16,5],[53,17,5],[54,18,5],[55,1,6],[56,2,6],[57,3,6],[72,4,6],[73,5,6],[74,6,6],[75,7,6],[76,8,6],[77,9,6],[78,10,6],[79,11,6],[80,12,6],[81,13,6],[82,14,6],[83,15,6],[84,16,6],[85,17,6],[86,18,6],[87,1,7],[88,2,7],[89,3,7],[104,4,7],[105,5,7],[106,6,7],[107,7,7],[108,8,7],[109,9,7],[110,10,7],[111,11,7],[112,12,7],[113,13,7],[114,14,7],[115,15,7],[116,16,7],[117,17,7],[118,18,7],[58,4,9],[59,5,9],[60,6,9],[61,7,9],[62,8,9],[63,9,9],[64,10,9],[65,11,9],[66,12,9],[67,13,9],[68,14,9],[69,15,9],[70,16,9],[71,17,9],[90,4,10],[91,5,10],[92,6,10],[93,7,10],[94,8,10],[95,9,10],[96,10,10],[97,11,10],[98,12,10],[99,13,10],[100,14,10],[101,15,10],[102,16,10],[103,17,10]];

function buildPT(){
  if(ptBuilt)return;ptBuilt=true;
  const grid=document.getElementById('ptGrid');
  const map={};
  PT_LAYOUT.forEach(([an,col,row])=>{map[`${row}-${col}`]=EL[an-1];});
  const html=[];
  for(let r=1;r<=10;r++){
    for(let c=1;c<=18;c++){
      if(r===8){html.push('<div class="ec emp"></div>');continue;}
      const el=map[`${r}-${c}`];
      if(!el){
        if(r===9&&c===3){html.push('<div class="ec lp" style="font-size:8px;padding:2px">57–71<br>Lanthan.</div>');continue;}
        if(r===10&&c===3){html.push('<div class="ec ap" style="font-size:8px;padding:2px">89–103<br>Actinide</div>');continue;}
        html.push('<div class="ec emp"></div>');
      }else{
        html.push(`<div class="ec cat-${el.cat}" onclick="showElement(${el.n-1})" data-cat="${el.cat}" data-group="${el.group||0}"><span class="an">${el.n}</span><span class="sy">${el.sym}</span><span class="en">${el.name.substring(0,6)}</span><span class="em">${el.mass>0?el.mass.toFixed(1):''}</span></div>`);
      }
    }
  }
  grid.style.gridTemplateColumns=`repeat(18,minmax(48px,1fr))`;
  grid.style.gridTemplateRows=`repeat(10,minmax(48px,auto))`;
  grid.innerHTML=html.join('');
  const leg=document.getElementById('ptLegend');
  leg.innerHTML=Object.entries(CATS).map(([k,v])=>`<div class="lg" onclick="toggleHighlight('${k}')" data-lgcat="${k}"><div class="ld" style="background:${CAT_COLORS[k]}"></div>${v}</div>`).join('');
}

function toggleHighlight(cat){
  if(hlCat===cat){clearHighlight();return;}
  hlCat=cat;
  document.querySelectorAll('.ec:not(.emp):not(.lp):not(.ap)').forEach(cell=>{
    if(cell.dataset.cat===cat){cell.classList.remove('dimmed');cell.classList.add('hl-elem');}
    else{cell.classList.add('dimmed');cell.classList.remove('hl-elem');}
  });
  document.querySelectorAll('.lg').forEach(l=>{l.classList.toggle('hl-active',l.dataset.lgcat===cat)});
  document.getElementById('hlName').textContent=CATS[cat]||cat;
  document.getElementById('hlLabel').classList.add('show');
  toast(`Showing ${CATS[cat]||cat}`,'chem');
}

function clearHighlight(){
  hlCat=null;
  document.querySelectorAll('.ec').forEach(c=>{c.classList.remove('dimmed','hl-elem');});
  document.querySelectorAll('.lg').forEach(l=>l.classList.remove('hl-active'));
  document.getElementById('hlLabel').classList.remove('show');
}

function showElement(idx){
  const e=EL[idx];
  const col=CAT_COLORS[e.cat]||'#4f8ef7';
  const cn={alkali:'Alkali Metal',alkaline:'Alkaline Earth',transition:'Transition Metal',post:'Post-Transition',metalloid:'Metalloid',nonmetal:'Nonmetal',noble:'Noble Gas',lanthanide:'Lanthanide',actinide:'Actinide',hydrogen:'Hydrogen'};
  document.getElementById('mcard').innerHTML=`
    <div class="mhero">
      <div class="msymbox cat-${e.cat}" style="min-width:76px"><span class="man">${e.n}</span><span class="msym">${e.sym}</span><span class="mmas">${e.mass} u</span></div>
      <div><div class="mname">${e.name}</div><div class="msub">Period ${e.period} · Group ${e.group||'f-block'}</div><span class="mtag" style="background:${col}18;color:${col};border:1px solid ${col}30">${cn[e.cat]||'Unknown'}</span></div>
    </div>
    <div class="mbody">
      <div class="mgrid">
        <div class="mf"><div class="mfl">Atomic Mass</div><div class="mfv">${e.mass} u</div></div>
        <div class="mf"><div class="mfl">State @ 25°C</div><div class="mfv">${e.state}</div></div>
        <div class="mf"><div class="mfl">Melting Point</div><div class="mfv">${e.melt!=null?e.melt+' °C':'N/A'}</div></div>
        <div class="mf"><div class="mfl">Boiling Point</div><div class="mfv">${e.boil!=null?e.boil+' °C':'N/A'}</div></div>
        <div class="mf"><div class="mfl">Density</div><div class="mfv">${e.density||'N/A'}</div></div>
        <div class="mf"><div class="mfl">Discovered</div><div class="mfv">${e.disc}</div><div class="mfs">${e.by}</div></div>
      </div>
      <div class="mf" style="margin-bottom:11px"><div class="mfl">Electron Configuration</div><div class="mfv econfig">${e.config}</div></div>
      <div class="mdesc">${e.desc}</div>
      <button class="mclose" onclick="closeModal()">✕ &nbsp;Close</button>
    </div>`;
  document.getElementById('modal').classList.add('on');
}

function closeModal(e){
  if(!e||e.target===document.getElementById('modal'))
    document.getElementById('modal').classList.remove('on');
}

/* ══════════════════════════════════
   REACTION SOLVER
══════════════════════════════════ */
async function solveRxn(){
  let raw=document.getElementById('rxnIn').value.trim();
  if(!raw){showRxnErr('Please enter a chemical equation.');return;}
  raw=normalizeEq(raw);
  hideRxnErr();hideRxnRes();setRxnLoad(true);

  const rxnSys=`You are an expert chemistry AI. Balance the given chemical equation. If ? marks unknown products, determine them.
Return ONLY valid JSON — no markdown, no text outside the JSON object.
Schema: {"balanced":"2H2 + O2 -> 2H2O","reactants":[{"formula":"H2","coeff":2,"name":"Hydrogen gas"}],"products":[{"formula":"H2O","coeff":2,"name":"Water"}],"reaction_type":"Synthesis","reaction_name":"Hydrogen Combustion","steps":["Step 1..."],"notes":"ΔH = -483.6 kJ/mol"}
If invalid input: {"error":"explanation"}`;

  try{
    let json=null;
    for(const p of PROVIDERS){
      try{
        const raw_r=await p.call(rxnSys,`Balance and complete: "${raw}"`);
        const txt=cleanAIResponse(raw_r).replace(/```json\s*/gi,"").replace(/```/g,"").trim();
        try{json=JSON.parse(txt);break;}
        catch{const m=txt.match(/\{[\s\S]*\}/);if(m){try{json=JSON.parse(m[0]);break;}catch{}}}
      }catch{}
    }
    if(!json)throw new Error("Could not get a valid response.");
    if(json.error)throw new Error(json.error);
    renderRxn(json);
    toast(`${json.reaction_name||'Reaction'} solved!`,'chem');
  }catch(e){showRxnErr(e.message||'Something went wrong.');}
  finally{setRxnLoad(false);}
}

function normalizeEq(eq){
  eq=eq.replace(/→/g,'=').replace(/-->/g,'=');
  eq=eq.replace(/\b([a-z]{1,2})(\d*)/g,(m,sym,num)=>{
    const cap=sym.charAt(0).toUpperCase()+sym.slice(1);
    if(EL.find(e=>e.sym===cap))return cap+num;
    const up=sym.toUpperCase();
    if(EL.find(e=>e.sym===up))return up+num;
    return m;
  });
  return eq;
}

function renderRxn(data){
  const fmt=(cs,cls)=>cs.map(c=>`<span class="eq-coeff">${c.coeff>1?c.coeff:''}</span><span class="${cls}">${c.formula}</span>`).join(`<span class="eq-plus"> + </span>`);
  document.getElementById('eqLine').innerHTML=fmt(data.reactants,'eq-react')+`<span class="eq-arrow"> → </span>`+fmt(data.products,'eq-prod');
  const np=[data.reaction_name,data.reaction_type].filter(Boolean);
  document.getElementById('rxnName').textContent=np.join(' · ');
  const all=[...data.reactants.map(c=>({...c,role:'Reactant'})),...data.products.map(c=>({...c,role:'Product'}))];
  document.getElementById('compounds').innerHTML=all.map((c,i)=>{
    const mm=calcMM(c.formula);const ms=mm?mm.toFixed(3):'—';const pr=mm?(mm*c.coeff).toFixed(2)+' g/mol':'';
    return `<div class="ccard" style="animation:ansIn .4s ease ${i*0.07}s both"><div class="ccard-role ${c.role==='Reactant'?'cr-r':'cr-p'}">${c.role}</div><div class="ccard-formula">${c.coeff>1?c.coeff:''}${c.formula}</div><div class="ccard-name">${c.name||''}</div><div class="ccard-mass">${ms}</div><div class="ccard-unit">g/mol</div><div class="ccard-mol">${pr}</div></div>`;
  }).join('');
  const maxC=Math.max(...all.map(c=>c.coeff));
  document.getElementById('ratioSec').innerHTML=`<div class="ratio-lbl">Mole ratios</div>`+all.map((c,i)=>{
    const pct=Math.round((c.coeff/maxC)*100);const col=c.role==='Reactant'?'var(--red)':'var(--phys)';
    return `<div class="ratio-row" style="animation:fadeUp .4s ease ${i*0.08}s both"><div class="ratio-f">${c.formula}</div><div class="ratio-bar-wrap"><div class="ratio-bar" style="width:0%;background:${col}" data-w="${pct}"></div></div><div class="ratio-val">${c.coeff} mol</div></div>`;
  }).join('');
  setTimeout(()=>document.querySelectorAll('.ratio-bar[data-w]').forEach(b=>b.style.width=b.dataset.w+'%'),120);
  const steps=[...(data.steps||[])];
  if(data.notes)steps.push('📋 '+data.notes);
  all.forEach(c=>{const mm=calcMM(c.formula);if(mm)steps.push(`Molar mass of ${c.formula}: ${mm.toFixed(3)} g/mol`);});
  document.getElementById('stepsBody').innerHTML=steps.map((s,i)=>`<div class="step" style="animation-delay:${i*0.05}s"><div class="sn">${i+1}</div><div class="sc">${s}</div></div>`).join('');
  const bt=document.getElementById('stepsTog'),bd=document.getElementById('stepsBody');
  bt.classList.remove('open');bd.classList.remove('open');
  document.getElementById('rxnResult').classList.add('show');
}

function calcMM(f){try{return parseMM(f.replace(/[-=]/g,'').replace(/\s/g,''));}catch(e){return null;}}
function parseMM(f){
  const stack=[{}];let i=0;
  while(i<f.length){
    if(f[i]==='('){stack.push({});i++;}
    else if(f[i]===')'){i++;let ns='';while(i<f.length&&/\d/.test(f[i])){ns+=f[i];i++}const m2=ns?parseInt(ns):1;const top=stack.pop();for(const[e,c]of Object.entries(top))stack[stack.length-1][e]=(stack[stack.length-1][e]||0)+c*m2;}
    else if(/[A-Z]/.test(f[i])){let el=f[i];i++;while(i<f.length&&/[a-z]/.test(f[i])){el+=f[i];i++}let ns='';while(i<f.length&&/\d/.test(f[i])){ns+=f[i];i++}const c=ns?parseInt(ns):1;stack[stack.length-1][el]=(stack[stack.length-1][el]||0)+c;}
    else{i++;}
  }
  const comp=stack[0];let mass=0;
  for(const[e,n]of Object.entries(comp)){if(!MM[e])throw new Error(`Unknown: ${e}`);mass+=MM[e]*n;}
  return mass;
}

function setRxnLoad(on){
  const b=document.getElementById('solveBtn'),t=document.getElementById('rxnThinking');
  b.disabled=on;
  b.innerHTML=on?`<svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> SOLVING...`:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> SOLVE WITH AI`;
  if(t){t.style.display=on?'flex':'none';}
}

function showRxnErr(m){document.getElementById('rxn-emsg').textContent=m;document.getElementById('rxn-err').classList.add('show');}
function hideRxnErr(){document.getElementById('rxn-err').classList.remove('show');}
function hideRxnRes(){document.getElementById('rxnResult').classList.remove('show');}
function loadRxn(ex){document.getElementById('rxnIn').value=ex;hideRxnErr();hideRxnRes();toast('Example loaded — press Solve!','chem');}
function toggleSteps(){
  const b=document.getElementById('stepsTog'),s=document.getElementById('stepsBody');
  b.classList.toggle('open');s.classList.toggle('open');
  b.querySelector('span').textContent=b.classList.contains('open')?'Hide Steps':'Show Step-by-Step Solution';
}

/* ══════════════════════════════════
   NAVIGATION
══════════════════════════════════ */
let currentPage='home';
function goHome(){
  showPage('home');
  document.querySelectorAll('.nav-btn').forEach(b=>{b.className='nav-btn';});
  document.getElementById('nav-chem').classList.add('act-chem');
  window.scrollTo({top:0,behavior:'smooth'});
}
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id+'-page').classList.add('active');
  currentPage=id;
  window.scrollTo({top:0,behavior:'smooth'});
}
function gotoSubject(subj){
  showPage(subj);
  document.querySelectorAll('.nav-btn').forEach(b=>b.className='nav-btn');
  document.getElementById('nav-'+subj).classList.add('act-'+subj);
  const accs={chem:'#4f8ef7',phys:'#00e87a',math:'#ff6b9d'};
  const accsL={chem:'#2563eb',phys:'#059669',math:'#db2777'};
  const isDark=document.documentElement.getAttribute('data-theme')==='dark';
  document.documentElement.style.setProperty('--acc',isDark?accs[subj]:accsL[subj]);
  if(subj==='chem')buildPT();
}
function switchSection(s){gotoSubject(s);}
function switchChemTab(tab){
  document.querySelectorAll('.chem-sub').forEach(el=>el.style.display='none');
  document.getElementById('c-'+tab).style.display='block';
  document.querySelectorAll('.stab').forEach(b=>b.classList.remove('active'));
  document.getElementById('cs-'+tab).classList.add('active');
  if(tab==='pt')buildPT();
}

/* ══════════════════════════════════
   THEME
══════════════════════════════════ */
let isLight=false;
try{isLight=localStorage.getItem('slTheme')==='light';}catch(e){}
function applyTheme(){
  document.documentElement.setAttribute('data-theme',isLight?'light':'dark');
  const icon=document.getElementById('themeIcon');
  if(isLight){
    icon.innerHTML=`<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
  }else{
    icon.innerHTML=`<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
  }
  try{localStorage.setItem('slTheme',isLight?'light':'dark');}catch(e){}
}
function toggleTheme(){isLight=!isLight;applyTheme();}

/* ══════════════════════════════════
   CREDITS POPUP
══════════════════════════════════ */
function toggleCreds(){document.getElementById('credPopup').classList.toggle('open');}
document.addEventListener('click',e=>{
  if(!document.getElementById('credWrap').contains(e.target))
    document.getElementById('credPopup').classList.remove('open');
});

/* ══════════════════════════════════
   TOAST
══════════════════════════════════ */
let toastT;
function toast(msg,type='chem'){
  const cols={chem:'#4f8ef7',phys:'#00e87a',math:'#ff6b9d'};
  document.getElementById('tdot').style.background=cols[type]||'#4f8ef7';
  document.getElementById('tmsg').textContent=msg;
  const el=document.getElementById('toast');
  el.classList.add('show');clearTimeout(toastT);
  toastT=setTimeout(()=>el.classList.remove('show'),3200);
}

/* ══════════════════════════════════
   VOICE
══════════════════════════════════ */
let vRec=null,vTarget=null;
function startVoice(inputId){
  if(!('SpeechRecognition' in window||'webkitSpeechRecognition' in window)){toast('Voice not supported. Use Chrome/Edge.','math');return;}
  vTarget=inputId;
  const subj=inputId.split('-')[0];
  const vbar=document.getElementById(subj+'-vbar');
  const vtxt=document.getElementById(subj+'-vtxt');
  const vbtn=document.getElementById(subj+'-vbtn');
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  vRec=new SR();
  vRec.continuous=false;vRec.interimResults=true;vRec.lang='en-US';
  vbtn.classList.add('rec');vbar.classList.add('show');vtxt.textContent='Listening...';
  let final='';
  vRec.onresult=ev=>{
    let interim='';final='';
    for(let i=ev.resultIndex;i<ev.results.length;i++){
      if(ev.results[i].isFinal)final+=ev.results[i][0].transcript;
      else interim+=ev.results[i][0].transcript;
    }
    vtxt.textContent=final||interim||'Listening...';
  };
  vRec.onend=()=>{
    vbtn.classList.remove('rec');vbar.classList.remove('show');
    if(final.trim()){document.getElementById(inputId).value=final.trim();askAI(subj);}
  };
  vRec.onerror=(ev)=>{
    vbtn.classList.remove('rec');vbar.classList.remove('show');
    if(ev.error==='not-allowed')toast('Microphone access denied.','math');
    else if(ev.error!=='no-speech')toast('Voice error: '+ev.error,'math');
  };
  vRec.start();
}
function stopVoice(){
  if(vRec)vRec.stop();
  if(vTarget){const s=vTarget.split('-')[0];const vbtn=document.getElementById(s+'-vbtn');if(vbtn)vbtn.classList.remove('rec');const vbar=document.getElementById(s+'-vbar');if(vbar)vbar.classList.remove('show');}
}

/* ══════════════════════════════════
   AUTO-RESIZE TEXTAREA
══════════════════════════════════ */
document.querySelectorAll('.q-input').forEach(ta=>{
  ta.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,150)+'px';});
  ta.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();const s=this.id.split('-')[0];askAI(s);}
  });
});
document.getElementById('rxnIn').addEventListener('keydown',e=>{if(e.key==='Enter')solveRxn();});

/* ══════════════════════════════════
   KEYBOARD
══════════════════════════════════ */
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();stopVoice();}});

/* ══════════════════════════════════
   INTERSECTION OBSERVER
══════════════════════════════════ */
const observer=new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');}});
},{threshold:0.1});
document.querySelectorAll('.fade-section').forEach(el=>observer.observe(el));

/* ══════════════════════════════════
   SPLASH
══════════════════════════════════ */
setTimeout(()=>{
  document.getElementById('splash').classList.add('out');
  setTimeout(()=>{document.getElementById('splash').style.display='none';},850);
},2800);

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
applyTheme();
setTimeout(()=>toast('Welcome to ScienceLab!','chem'),3200);
