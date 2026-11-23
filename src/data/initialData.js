export const INITIAL_MATIERES = [
  { codemat: 'STA', libelle: 'Statistique', coef: 0.4 },
  { codemat: 'INF', libelle: 'Informatique', coef: 0.4 },
  { codemat: 'ECO', libelle: 'Econométrie', coef: 0.2 },
  { codemat: 'ALG', libelle: 'Algorithmique', coef: 0.5 },
  { codemat: 'MAT', libelle: 'Mathématiques', coef: 0.5 },
  { codemat: 'CPT', libelle: 'Comptabilité', coef: 0.5 },
  { codemat: 'WEB', libelle: 'Développement Web', coef: 0.5 },
  { codemat: 'RES', libelle: 'Réseaux Avancés', coef: 0.5 },
  { codemat: 'SEC', libelle: 'Sécurité SI', coef: 0.5 },
];

export const EVAL_TYPES = ['DS', 'Examen', 'TP', 'Projet'];

export const INITIAL_EPREUVES = [
  { numepreuve: 11031, datepreuve: '2026-02-15', Lieu: 'Salle 191L', type_eval: 'DS', codemat: 'STA' },
  { numepreuve: 11032, datepreuve: '2026-04-01', Lieu: 'Amphi G', type_eval: 'Examen', codemat: 'STA' },
  { numepreuve: 21031, datepreuve: '2026-01-30', Lieu: 'Salle 191L', type_eval: 'DS', codemat: 'INF' },
  { numepreuve: 21032, datepreuve: '2026-06-01', Lieu: 'Salle 192L', type_eval: 'Examen', codemat: 'INF' },
  { numepreuve: 31030, datepreuve: '2026-06-02', Lieu: 'Salle 05R', type_eval: 'TP', codemat: 'ECO' },
  { numepreuve: 50001, datepreuve: '2026-02-10', Lieu: 'Salle 101', type_eval: 'DS', codemat: 'ALG' },
  { numepreuve: 50002, datepreuve: '2026-04-12', Lieu: 'Salle 102', type_eval: 'Examen', codemat: 'ALG' },
  { numepreuve: 50003, datepreuve: '2026-03-18', Lieu: 'Amphi A', type_eval: 'DS', codemat: 'MAT' },
  { numepreuve: 31031, datepreuve: '2026-05-14', Lieu: 'Salle 08R', type_eval: 'Examen', codemat: 'CPT' },
  { numepreuve: 21033, datepreuve: '2026-05-20', Lieu: 'Labo Web 2', type_eval: 'TP', codemat: 'WEB' },
  { numepreuve: 41001, datepreuve: '2026-03-25', Lieu: 'Labo Réseau', type_eval: 'DS', codemat: 'RES' },
  { numepreuve: 41002, datepreuve: '2026-05-28', Lieu: 'Amphi B', type_eval: 'Examen', codemat: 'SEC' },
];

export const ISET_DEPARTEMENTS = [
  "Technologies de l'Informatique",
  'Génie Électrique',
  'Génie Mécanique',
  'Sciences Économiques et Gestion',
];

export const ISET_SPECIALITES = [
  "Tronc Commun — Technologies de l'Informatique",
  "DSI — Développement des Systèmes d'Information",
  'RSI — Réseaux et Systèmes Informatiques',
  'MDW — Multimédia et Développement Web',
  'SEM — Systèmes Embarqués et Mobiles',
  'AII — Automatisme et Informatique Industrielle',
  'CF — Comptabilité et Finance',
];

export const ISET_ANNEES = ['2024-2025', '2025-2026', '2026-2027'];

export const INITIAL_ETUDIANTS = [
  {
    numetu: 1001,
    cin: '09841001',
    nom: 'Ben Ali',
    prenom: 'Youssef',
    email: 'youssef.benali@isetjb.rnu.tn',
    telephone: '+216 22 410 101',
    datenaiss: '2004-03-14',
    sexe: 'Masculin',
    departement: "Technologies de l'Informatique",
    specialite: "DSI — Développement des Systèmes d'Information",
    classe: 'DSI-1',
    annee_univ: '2025-2026',
    rue: 'Avenue Habib Bourguiba',
    cp: 4180,
    ville: 'Houmt Souk',
    login: 'youssef',
    photo: '',
    profil_complete: true,
  },
  {
    numetu: 1002,
    cin: '09841002',
    nom: 'Trabelsi',
    prenom: 'Meriem',
    email: 'meriem.trabelsi@isetjb.rnu.tn',
    telephone: '+216 55 318 204',
    datenaiss: '2004-09-22',
    sexe: 'Féminin',
    departement: "Technologies de l'Informatique",
    specialite: 'MDW — Multimédia et Développement Web',
    classe: 'MDW-1',
    annee_univ: '2025-2026',
    rue: 'Route de Midoun',
    cp: 4116,
    ville: 'Midoun',
    login: 'meriem',
    photo: '',
    profil_complete: true,
  },
  {
    numetu: 1003,
    cin: '09841003',
    nom: 'Gharbi',
    prenom: 'Ahmed',
    email: 'ahmed.gharbi@isetjb.rnu.tn',
    telephone: '+216 98 612 309',
    datenaiss: '2003-11-05',
    sexe: 'Masculin',
    departement: "Technologies de l'Informatique",
    specialite: 'RSI — Réseaux et Systèmes Informatiques',
    classe: 'RSI-2',
    annee_univ: '2025-2026',
    rue: 'Rue de la Liberté',
    cp: 4180,
    ville: 'Houmt Souk',
    login: 'ahmed',
    photo: '',
    profil_complete: true,
  },
  {
    numetu: 1004,
    cin: '09841004',
    nom: 'Jaziri',
    prenom: 'Salma',
    email: 'salma.jaziri@isetjb.rnu.tn',
    telephone: '+216 29 740 412',
    datenaiss: '2005-01-19',
    sexe: 'Féminin',
    departement: 'Sciences Économiques et Gestion',
    specialite: 'CF — Comptabilité et Finance',
    classe: 'CF-1',
    annee_univ: '2025-2026',
    rue: 'Zone Touristique',
    cp: 4116,
    ville: 'Ajim',
    login: 'salma',
    photo: '',
    profil_complete: false,
  },
  {
    numetu: 1005,
    cin: '09841005',
    nom: 'Mansouri',
    prenom: 'Ines',
    email: 'ines.mansouri@isetjb.rnu.tn',
    telephone: '+216 24 815 505',
    datenaiss: '2006-06-08',
    sexe: 'Féminin',
    departement: "Technologies de l'Informatique",
    specialite: "Tronc Commun — Technologies de l'Informatique",
    classe: 'TI-1',
    annee_univ: '2025-2026',
    rue: "Route de l'Aéroport",
    cp: 4180,
    ville: 'Houmt Souk',
    login: 'ines',
    photo: '',
    profil_complete: true,
  },
];

export const INITIAL_NOTATIONS = [
  { numetu: 1001, numepreuve: 21031, note: 15.5 },
  { numetu: 1001, numepreuve: 21032, note: 17.0 },
  { numetu: 1001, numepreuve: 11031, note: 13.0 },
  { numetu: 1001, numepreuve: 11032, note: 14.5 },
  { numetu: 1001, numepreuve: 31030, note: 16.0 },

  { numetu: 1002, numepreuve: 21031, note: 18.0 },
  { numetu: 1002, numepreuve: 21032, note: 16.5 },
  { numetu: 1002, numepreuve: 11031, note: 15.0 },
  { numetu: 1002, numepreuve: 31030, note: 17.5 },

  { numetu: 1003, numepreuve: 41001, note: 12.5 },
  { numetu: 1003, numepreuve: 41002, note: 11.0 },

  { numetu: 1004, numepreuve: 31031, note: 12.5 },
  { numetu: 1004, numepreuve: 21033, note: 14.0 },

  { numetu: 1005, numepreuve: 50001, note: 15.0 },
  { numetu: 1005, numepreuve: 50002, note: 16.5 },
  { numetu: 1005, numepreuve: 50003, note: 14.0 },
];

export function computeStudentTranscript(numetu, matieres, epreuves, notations) {
  const noteMap = new Map();
  for (const item of notations) {
    if (item.numetu === numetu) {
      noteMap.set(item.numepreuve, item.note);
    }
  }

  const subjects = [...matieres]
    .sort((a, b) => a.codemat.localeCompare(b.codemat))
    .map((matiere) => {
      const exams = epreuves
        .filter((ep) => ep.codemat === matiere.codemat)
        .sort((a, b) => b.datepreuve.localeCompare(a.datepreuve))
        .map((epreuve) => ({
          epreuve,
          note: noteMap.has(epreuve.numepreuve) ? noteMap.get(epreuve.numepreuve) : null,
        }));

      const graded = exams.filter((x) => x.note !== null).map((x) => x.note);
      const average =
        graded.length > 0 ? graded.reduce((acc, val) => acc + val, 0) / graded.length : null;

      return { matiere, exams, average };
    });

  let weightedSum = 0;
  let coefSum = 0;
  let gradedExamsCount = 0;
  let totalExamsCount = 0;
  let validatedSubjects = 0;

  for (const row of subjects) {
    totalExamsCount += row.exams.length;
    for (const ex of row.exams) {
      if (ex.note !== null) gradedExamsCount += 1;
    }
    if (row.average !== null) {
      weightedSum += row.average * row.matiere.coef;
      coefSum += row.matiere.coef;
      if (row.average >= 10) validatedSubjects += 1;
    }
  }

  const weightedAverage = coefSum > 0 ? weightedSum / coefSum : null;
  let mention = 'En attente de notes';
  if (weightedAverage !== null) {
    if (weightedAverage >= 16) mention = 'Admis · Très Bien';
    else if (weightedAverage >= 14) mention = 'Admis · Bien';
    else if (weightedAverage >= 12) mention = 'Admis · Assez Bien';
    else if (weightedAverage >= 10) mention = 'Admis · Passable';
    else mention = 'Ajourné · Rattrapage';
  }

  return {
    subjects,
    weightedAverage,
    gradedExamsCount,
    totalExamsCount,
    validatedSubjects,
    mention,
  };
}

export function formatDateFr(isoDate) {
  if (!isoDate) return '—';
  const parts = String(isoDate).split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatNote(value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—';
  return Number(value).toFixed(2);
}

export function escapeHtml(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
