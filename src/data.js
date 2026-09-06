/* ============================================================
   OPERATION MBBS — NEET UG 2027 Prep OS
   Static reference data: syllabus, lecture plan, rank table, toppers.
   ============================================================ */

export const EXAM_DATES = [
  { id: "neet", label: "NEET UG 2027", date: "2027-05-03" },
  { id: "half", label: "Halfway Checkpoint", date: "2027-01-02" },
  { id: "hundred", label: "100 Days To Go", date: "2027-01-23" }
];

export function daysLeft(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((target - today) / 86400000);
  return diff;
}

export const SYL = {
  Physics:[{id:"p01",n:"Units & Dim",w:"L",wt:4},{id:"p02",n:"Vectors",w:"H",wt:9},{id:"p03",n:"1D Motion",w:"M",wt:6},{id:"p04",n:"2D Motion Projectile",w:"M",wt:6},{id:"p05",n:"Relative Motion",w:"M",wt:6},{id:"p06",n:"Laws of Motion",w:"M",wt:6},{id:"p07",n:"Friction",w:"L",wt:4},{id:"p08",n:"Circular Motion",w:"M",wt:6},{id:"p09",n:"Work Energy Power",w:"M",wt:7},{id:"p10",n:"Centre of Mass",w:"M",wt:7},{id:"p11",n:"Rotational Motion",w:"H",wt:9},{id:"p12",n:"Gravitation",w:"M",wt:6},{id:"p13",n:"Elasticity",w:"L",wt:4},{id:"p14",n:"Surface Tension",w:"L",wt:4},{id:"p15",n:"Fluid Mechanics",w:"M",wt:6},{id:"p16",n:"Viscosity",w:"L",wt:4},{id:"p17",n:"Calorimetry",w:"L",wt:4},{id:"p18",n:"Thermal Expansion",w:"L",wt:4},{id:"p19",n:"KTG",w:"L",wt:4},{id:"p20",n:"Thermodynamics",w:"M",wt:6},{id:"p21",n:"Heat Transfer",w:"M",wt:6},{id:"p22",n:"SHM",w:"M",wt:7},{id:"p23",n:"Wave on a String",w:"M",wt:7},{id:"p24",n:"Sound Wave",w:"M",wt:7},{id:"p25",n:"Electrostatics",w:"H",wt:9},{id:"p26",n:"Capacitor",w:"M",wt:7},{id:"p27",n:"Conductors",w:"L",wt:4},{id:"p28",n:"Current Electricity",w:"M",wt:7},{id:"p29",n:"Magnetic Effect of Current",w:"M",wt:6},{id:"p30",n:"EMF",w:"M",wt:6},{id:"p31",n:"Magnetic Properties",w:"L",wt:4},{id:"p32",n:"EMI",w:"M",wt:7},{id:"p33",n:"AC",w:"L",wt:4},{id:"p34",n:"X-ray",w:"L",wt:4},{id:"p35",n:"Photoelectric Effect",w:"M",wt:6},{id:"p36",n:"Atoms",w:"M",wt:6},{id:"p37",n:"Nuclear Physics",w:"M",wt:7},{id:"p38",n:"EMW",w:"L",wt:4},{id:"p39",n:"Semiconductor",w:"M",wt:6},{id:"p40",n:"Ray Optics",w:"H",wt:9},{id:"p41",n:"Optical Instruments",w:"M",wt:6},{id:"p42",n:"Wave Optics",w:"M",wt:6}],
  Chemistry:[{id:"c01",n:"Mole Concept",w:"M",wt:7},{id:"c02",n:"Structure of Atom",w:"H",wt:9},{id:"c03",n:"Thermodynamics",w:"H",wt:9},{id:"c04",n:"Thermochemistry",w:"M",wt:6},{id:"c05",n:"Redox Reactions",w:"M",wt:7},{id:"c06",n:"Chemical Equilibrium",w:"M",wt:6},{id:"c07",n:"Ionic Equilibrium",w:"H",wt:9},{id:"c08",n:"Solutions",w:"M",wt:7},{id:"c09",n:"Electrochemistry",w:"H",wt:9},{id:"c10",n:"Chemical Kinetics",w:"H",wt:9},{id:"c11",n:"Periodicity",w:"M",wt:7},{id:"c12",n:"Chemical Bonding",w:"H",wt:9},{id:"c13",n:"P-Block B&C Family",w:"M",wt:6},{id:"c14",n:"P-Block N&O Family",w:"M",wt:7},{id:"c15",n:"P-Block Grp 17&18",w:"L",wt:4},{id:"c16",n:"D-F Block",w:"M",wt:7},{id:"c17",n:"Coordination Compounds",w:"H",wt:9},{id:"c18",n:"IUPAC Naming",w:"H",wt:9},{id:"c19",n:"GOC 1",w:"H",wt:9},{id:"c20",n:"GOC 2",w:"H",wt:9},{id:"c21",n:"Stereoisomerism",w:"H",wt:9},{id:"c22",n:"Hydrocarbons",w:"M",wt:7},{id:"c23",n:"Structural Isomerism",w:"M",wt:6},{id:"c24",n:"Rxn Mechanism 1",w:"H",wt:9},{id:"c25",n:"Rxn Mechanism 2",w:"H",wt:9},{id:"c26",n:"Rxn Mechanism 3",w:"M",wt:7},{id:"c27",n:"Rxn Mechanism 4",w:"M",wt:6},{id:"c28",n:"Structural Identification",w:"H",wt:9},{id:"c29",n:"Reduction, Oxidation & Hydrolysis",w:"M",wt:7},{id:"c30",n:"Amines",w:"L",wt:4},{id:"c31",n:"Aromatic Compounds",w:"M",wt:7},{id:"c32",n:"Biomolecules (Chem)",w:"M",wt:7},{id:"c33",n:"Carboxylic Acids",w:"L",wt:4},{id:"c34",n:"Carbonyl Compounds",w:"M",wt:7}],
  Biology:[{id:"b01",n:"The Living World",w:"L",wt:3},{id:"b02",n:"Biological Classification",w:"M",wt:6},{id:"b03",n:"Plant Kingdom",w:"M",wt:5},{id:"b04",n:"Animal Kingdom",w:"M",wt:7},{id:"b05",n:"Morphology of Flowering Plants",w:"M",wt:6},{id:"b06",n:"Anatomy of Flowering Plants",w:"M",wt:5},{id:"b07",n:"Structural Organisation in Animals",w:"L",wt:4},{id:"b08",n:"Cell: The Unit of Life",w:"M",wt:7},{id:"b09",n:"Cell Cycle & Cell Division",w:"M",wt:6},{id:"b10",n:"Biomolecules",w:"M",wt:6},{id:"b11",n:"Photosynthesis",w:"M",wt:7},{id:"b12",n:"Respiration in Plants",w:"L",wt:4},{id:"b13",n:"Plant Growth & Development (PGR)",w:"M",wt:5},{id:"b14",n:"Breathing & Exchange of Gases",w:"M",wt:6},{id:"b15",n:"Body Fluids & Circulation",w:"M",wt:6},{id:"b16",n:"Excretory Products",w:"M",wt:5},{id:"b17",n:"Locomotion & Movement",w:"M",wt:5},{id:"b18",n:"Neural Control & Coordination",w:"M",wt:6},{id:"b19",n:"Chemical Coordination (Endocrine)",w:"M",wt:6},{id:"b20",n:"Sexual Reproduction in Flowering Plants",w:"M",wt:6},{id:"b21",n:"Human Reproduction",w:"H",wt:8},{id:"b22",n:"Reproductive Health",w:"L",wt:4},{id:"b23",n:"Principles of Inheritance & Genetics",w:"H",wt:9},{id:"b24",n:"Molecular Basis of Inheritance",w:"H",wt:9},{id:"b25",n:"Evolution",w:"M",wt:6},{id:"b26",n:"Human Health & Disease",w:"M",wt:7},{id:"b27",n:"Microbes in Human Welfare",w:"L",wt:4},{id:"b28",n:"Biotechnology: Principles & Processes",w:"M",wt:6},{id:"b29",n:"Biotechnology & Its Applications",w:"M",wt:5},{id:"b30",n:"Organisms & Populations",w:"M",wt:7},{id:"b31",n:"Ecosystem",w:"M",wt:6},{id:"b32",n:"Biodiversity & Conservation",w:"M",wt:5}]
};

export const LDATA = {
  "Physics": { fac:"ABK Sir", col:"#6366f1", chapters:[{id:"ph01",n:"Units & Dim",t:5},{id:"ph02",n:"Vectors",t:35},{id:"ph03",n:"1D Motion",t:10},{id:"ph04",n:"2D Motion Projectile",t:9},{id:"ph05",n:"Relative Motion",t:8},{id:"ph06",n:"Laws of Motion",t:11},{id:"ph07",n:"Friction",t:6},{id:"ph08",n:"Circular Motion",t:10},{id:"ph09",n:"Work Energy Power",t:13},{id:"ph10",n:"Centre of Mass",t:13},{id:"ph11",n:"Rotational Motion",t:23},{id:"ph12",n:"Gravitation",t:9},{id:"ph13",n:"Elasticity",t:4},{id:"ph14",n:"Surface Tension",t:5},{id:"ph15",n:"Fluid Mechanics",t:11},{id:"ph16",n:"Viscosity",t:3},{id:"ph17",n:"Calorimetry",t:4},{id:"ph18",n:"Thermal Expansion",t:4},{id:"ph19",n:"KTG",t:6},{id:"ph20",n:"Thermodynamics",t:8},{id:"ph21",n:"Heat Transfer",t:7},{id:"ph22",n:"SHM",t:14},{id:"ph23",n:"Wave on a String",t:12},{id:"ph24",n:"Sound Wave",t:14},{id:"ph25",n:"Electrostatics",t:22},{id:"ph26",n:"Capacitor",t:12},{id:"ph27",n:"Conductors",t:4},{id:"ph28",n:"Current Electricity",t:16},{id:"ph29",n:"Magnetic Effect of Current",t:7},{id:"ph30",n:"EMF",t:10},{id:"ph31",n:"Magnetic Properties",t:4},{id:"ph32",n:"EMI",t:16},{id:"ph33",n:"AC",t:6},{id:"ph34",n:"X-ray",t:4},{id:"ph35",n:"Photoelectric Effect",t:7},{id:"ph36",n:"Atoms",t:9},{id:"ph37",n:"Nuclear Physics",t:12},{id:"ph38",n:"EMW",t:5},{id:"ph39",n:"Semiconductor",t:10},{id:"ph40",n:"Ray Optics",t:70},{id:"ph41",n:"Optical Instruments",t:7},{id:"ph42",n:"Wave Optics",t:11}] },
  "Phys.Chem": { fac:"Vora Classes", col:"#10b981", chapters:[{id:"pc01",n:"Mole Concept",t:12},{id:"pc02",n:"Structure of Atom",t:34},{id:"pc03",n:"Thermodynamics",t:28},{id:"pc04",n:"Thermochemistry",t:8},{id:"pc05",n:"Redox Reactions",t:16},{id:"pc06",n:"Chemical Equilibrium",t:11},{id:"pc07",n:"Ionic Equilibrium",t:30},{id:"pc08",n:"Solutions",t:17},{id:"pc09",n:"Electrochemistry",t:31},{id:"pc10",n:"Chemical Kinetics",t:26}] },
  "Inorg.Chem": { fac:"Vora Classes", col:"#8b5cf6", chapters:[{id:"ic01",n:"Periodicity",t:15},{id:"ic02",n:"Chemical Bonding",t:57},{id:"ic03",n:"P-Block B&C Family",t:11},{id:"ic04",n:"P-Block N&O Family",t:13},{id:"ic05",n:"P-Block Grp 17&18",t:6},{id:"ic06",n:"D-F Block",t:12},{id:"ic07",n:"Coordination Compounds",t:33}] },
  "Org.Chem": { fac:"NS Sir", col:"#f59e0b", chapters:[{id:"oc01",n:"IUPAC Naming",t:44},{id:"oc02",n:"GOC 1",t:33},{id:"oc03",n:"GOC 2",t:23},{id:"oc04",n:"Stereoisomerism",t:57},{id:"oc05",n:"Hydrocarbons",t:17},{id:"oc06",n:"Structural Isomerism",t:11},{id:"oc07",n:"Rxn Mechanism 1",t:27},{id:"oc08",n:"Rxn Mechanism 2",t:31},{id:"oc09",n:"Rxn Mechanism 3",t:16},{id:"oc10",n:"Rxn Mechanism 4",t:10},{id:"oc11",n:"Structural Identification",t:20},{id:"oc12",n:"Reduction, Oxidation & Hydrolysis",t:13},{id:"oc13",n:"Amines",t:5},{id:"oc14",n:"Aromatic Compounds",t:15},{id:"oc15",n:"Biomolecules (Chem)",t:14},{id:"oc16",n:"Carboxylic Acids",t:4},{id:"oc17",n:"Carbonyl Compounds",t:17}] },
  "Biology": { fac:"PK & PM Sir", col:"#f97316", chapters:[{id:"bi01",n:"The Living World",t:1},{id:"bi02",n:"Biological Classification",t:1},{id:"bi03",n:"Plant Kingdom",t:1},{id:"bi04",n:"Animal Kingdom",t:1},{id:"bi05",n:"Morphology of Flowering Plants",t:1},{id:"bi06",n:"Anatomy of Flowering Plants",t:1},{id:"bi07",n:"Structural Organisation in Animals",t:1},{id:"bi08",n:"Cell: The Unit of Life",t:1},{id:"bi09",n:"Cell Cycle & Cell Division",t:1},{id:"bi10",n:"Biomolecules",t:1},{id:"bi11",n:"Photosynthesis",t:1},{id:"bi12",n:"Respiration in Plants",t:1},{id:"bi13",n:"Plant Growth & Development (PGR)",t:1},{id:"bi14",n:"Breathing & Exchange of Gases",t:1},{id:"bi15",n:"Body Fluids & Circulation",t:1},{id:"bi16",n:"Excretory Products",t:1},{id:"bi17",n:"Locomotion & Movement",t:1},{id:"bi18",n:"Neural Control & Coordination",t:1},{id:"bi19",n:"Chemical Coordination (Endocrine)",t:1},{id:"bi20",n:"Sexual Reproduction in Flowering Plants",t:1},{id:"bi21",n:"Human Reproduction",t:1},{id:"bi22",n:"Reproductive Health",t:1},{id:"bi23",n:"Principles of Inheritance & Genetics",t:1},{id:"bi24",n:"Molecular Basis of Inheritance",t:1},{id:"bi25",n:"Evolution",t:1},{id:"bi26",n:"Human Health & Disease",t:1},{id:"bi27",n:"Microbes in Human Welfare",t:1},{id:"bi28",n:"Biotechnology: Principles & Processes",t:1},{id:"bi29",n:"Biotechnology & Its Applications",t:1},{id:"bi30",n:"Organisms & Populations",t:1},{id:"bi31",n:"Ecosystem",t:1},{id:"bi32",n:"Biodiversity & Conservation",t:1}] }
};

export const NEET_RANK_TABLE = [
  { marks:"700\u2013720", pct:"99.99+", air:"1 \u2013 500", info:"Top AIIMS / top government MBBS colleges" },
  { marks:"680\u2013699", pct:"99.95\u201399.99", air:"500 \u2013 2,000", info:"Top AIIMS & leading government medical colleges" },
  { marks:"660\u2013679", pct:"99.85\u201399.95", air:"2,000 \u2013 5,000", info:"Top government MBBS colleges" },
  { marks:"640\u2013659", pct:"99.60\u201399.85", air:"5,000 \u2013 10,000", info:"Strong chance at many top government colleges" },
  { marks:"620\u2013639", pct:"99.20\u201399.60", air:"10,000 \u2013 20,000", info:"Government MBBS colleges; state quota options" },
  { marks:"600\u2013619", pct:"98.70\u201399.20", air:"20,000 \u2013 35,000", info:"Many government MBBS colleges; state quota" },
  { marks:"580\u2013599", pct:"98.00\u201398.70", air:"35,000 \u2013 55,000", info:"Government MBBS possible depending on state/category" },
  { marks:"560\u2013579", pct:"97.00\u201398.00", air:"55,000 \u2013 80,000", info:"Government MBBS in several states/categories; private options" },
  { marks:"540\u2013559", pct:"95.50\u201397.00", air:"80,000 \u2013 1,20,000", info:"Government MBBS in some states/categories; private colleges" },
  { marks:"500\u2013539", pct:"92.00\u201395.50", air:"1,20,000 \u2013 2,00,000", info:"State/private MBBS possibilities; BDS/AYUSH options" },
  { marks:"450\u2013499", pct:"85.00\u201392.00", air:"2,00,000 \u2013 3,50,000", info:"Private MBBS/BDS/AYUSH depending on category and state" },
  { marks:"400\u2013449", pct:"75.00\u201385.00", air:"3,50,000 \u2013 5,00,000", info:"Private medical/dental and AYUSH options" },
  { marks:"300\u2013399", pct:"55.00\u201375.00", air:"5,00,000 \u2013 8,00,000", info:"BDS/AYUSH/private options depending on counselling" },
  { marks:"200\u2013299", pct:"40.00\u201355.00", air:"8,00,000+", info:"Limited MBBS options; other medical courses" },
  { marks:"0\u2013199", pct:"below qualifying", air:"very high AIR", info:"Generally below qualifying cutoff" }
];

export const TOPPERS = {
  2025: [
    { rank:1, name:"Mahesh Kumar", marks:686, coaching:"Allen Kota" },
    { rank:2, name:"AIR 2 (2025)", marks:682, coaching:"Aakash Institute" },
    { rank:3, name:"AIR 3 (2025)", marks:679, coaching:"Physics Wallah" }
  ],
  2024: [
    { rank:1, name:"Ved Sunilkumar Shende", marks:720, coaching:"Allen Kota" },
    { rank:1, name:"Tathagat Awatar", marks:720, coaching:"Physics Wallah" },
    { rank:3, name:"AIR 3 (2024)", marks:715, coaching:"Sri Chaitanya" }
  ],
  2023: [
    { rank:1, name:"Prabanjan J", marks:720, coaching:"Sri Chaitanya" },
    { rank:1, name:"Bora Varun Chakravarthi", marks:720, coaching:"Infinity Learn / Sri Chaitanya" },
    { rank:3, name:"AIR 3 (2023)", marks:716, coaching:"Allen Kota" }
  ]
};

export const COACHING_LEADERBOARD = [
  { name:"Allen Kota", count:2 },
  { name:"Sri Chaitanya", count:2 },
  { name:"Physics Wallah", count:2 },
  { name:"Aakash Institute", count:1 },
  { name:"Infinity Learn", count:1 }
];

export const TASK_CATS = ["📖 Learn", "🔄 Revise", "📝 DPP", "🧪 Mock", "🎯 PYQ", "💪 Other"];
export const ERROR_TYPES = ["Silly Mistake", "Conceptual Gap", "Time Panic", "Misread", "Formula Error", "Calculation Error"];
export const STATUS_LIST = ["not-started", "in-progress", "mastered", "needs-revision", "backlog"];
export const STATUS_META = {
  "not-started":  { label: "Not Started",   color: "#94a3b8" },
  "in-progress":  { label: "In Progress",   color: "#3b82f6" },
  "mastered":     { label: "Mastered",      color: "#10b981" },
  "needs-revision": { label: "Needs Revision", color: "#f59e0b" },
  "backlog":      { label: "Backlog",       color: "#ef4444" }
};
export const MOTIVES = [
  "Every topic you master today is one less thing standing between you and that white coat.",
  "AIIMS Delhi doesn't ask how tired you were. It asks how much you knew.",
  "180 days of focus beats 3 years of regret. Keep going.",
  "Mediocre students revise. Toppers revise the same chapter five times. Which are you today?",
  "The NEET syllabus is finite. Your effort doesn't have to be.",
  "You don't need motivation at 5 AM. You need discipline. Open the book."
];

export const SUBJECT_COLORS = { Physics: "#6366f1", Chemistry: "#10b981", Biology: "#f97316" };