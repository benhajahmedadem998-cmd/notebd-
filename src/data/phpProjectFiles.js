import profilEtudiantPhp from '../../site_php/profilEtudiant.php?raw';
import avatarsHtaccess from '../../site_php/uploads/avatars/.htaccess?raw';
import formInsertNotePhp from '../../site_php/formInsertNote.php?raw';
import apiEtudiantCinPhp from '../../site_php/apiEtudiantCin.php?raw';
import notesProfPhp from '../../site_php/notesProf.php?raw';
import notesEtudiantPhp from '../../site_php/notesEtudiant.php?raw';
import afficheEtuPhp from '../../site_php/afficheEtu.php?raw';
import formInsertEtuPhp from '../../site_php/formInsertEtu.php?raw';
import notesRolesSql from '../../site_php/notes_roles.sql?raw';
import styleCss from '../../site_php/style.css?raw';
import loginCss from '../../site_php/login.css?raw';
import landingCss from '../../site_php/landing.css?raw';
import indexHtml from '../../site_php/index.html?raw';
import headerPhp from '../../site_php/header.php?raw';
import footerPhp from '../../site_php/footer.php?raw';
import dashboardPhp from '../../site_php/dashboard.php?raw';
import afficheMPhp from '../../site_php/afficheM.php?raw';
import afficheEPhp from '../../site_php/afficheE.php?raw';
import formInsertMPhp from '../../site_php/formInsertM.php?raw';
import formInsertEPhp from '../../site_php/formInsertE.php?raw';
import loginPhp from '../../site_php/login.php?raw';
import connectIncPhp from '../../site_php/connect.inc.php?raw';
import fonctionsPhp from '../../site_php/fonctions.php?raw';
import authPhp from '../../site_php/auth.php?raw';
import logoutPhp from '../../site_php/logout.php?raw';
import notesSql from '../../site_php/notes.sql?raw';
import suppMPhp from '../../site_php/suppM.php?raw';
import insertMPhp from '../../site_php/insertM.php?raw';
import insertEPhp from '../../site_php/insertE.php?raw';
import appJs from '../../site_php/app.js?raw';
import starsJs from '../../site_php/stars.js?raw';
import logoSvg from '../../site_php/img/logo.svg?raw';
import lisezMoiTxt from '../../site_php/LISEZ-MOI.txt?raw';

export const PHP_PROJECT_FILES = [
  {
    filename: 'profilEtudiant.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Page « Mon profil » étudiant : création, consultation, modification personnelle, photo circulaire JPG/PNG <= 2 Mo et protection PDO/CSRF.',
    content: profilEtudiantPhp,
  },
  {
    filename: 'uploads/avatars/.htaccess',
    category: 'nouvelles-pages',
    language: 'text',
    modified: true,
    summary: 'Règles Apache empêchant l’exécution de scripts dans le dossier des photos de profil étudiant.',
    content: avatarsHtaccess,
  },
  {
    filename: 'formInsertNote.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Ajouter une note par CIN et matière : recherche instantanée de l’étudiant, recherche de matière, coef auto, contrôle doublons PDO/CSRF.',
    content: formInsertNotePhp,
  },
  {
    filename: 'apiEtudiantCin.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'API JSON PDO sécurisée (rôle Professeur) renvoyant identité, classe et spécialité de l’étudiant par CIN.',
    content: apiEtudiantCinPhp,
  },
  {
    filename: 'formInsertEtu.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Ajout et modification (?edit=ID) d’un étudiant avec CIN, coordonnées, filière, classe et validation PDO/CSRF.',
    content: formInsertEtuPhp,
  },
  {
    filename: 'afficheEtu.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Gestion des étudiants : liste complète, modification, recherche instantanée et consultation détaillée.',
    content: afficheEtuPhp,
  },
  {
    filename: 'header.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Menu latéral professionnel Deep Navy avec logo officiel ISET Djerba, adaptation Professeur/Étudiant et tiroir mobile.',
    content: headerPhp,
  },
  {
    filename: 'footer.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Pied de page HTML5, chargement de app.js et fermeture explicite de la connexion PDO ($dbh = null; $db = null;).',
    content: footerPhp,
  },
  {
    filename: 'notesProf.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Espace Professeur : saisie, modification et suppression des notes (/20) avec validation PDO et protection CSRF.',
    content: notesProfPhp,
  },
  {
    filename: 'notesEtudiant.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Espace Étudiant : relevé complet par matière avec calcul automatique de la moyenne pondérée et filtre par matière.',
    content: notesEtudiantPhp,
  },
  {
    filename: 'dashboard.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Tableau de bord Professeur : indicateurs globaux (étudiants, matières, épreuves, notes) et dernières épreuves planifiées.',
    content: dashboardPhp,
  },
  {
    filename: 'login.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Connexion sécurisée avec logo ISET Djerba, comptes Professeur et Étudiants.',
    content: loginPhp,
  },
  {
    filename: 'afficheM.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Gestion des matières : liste complète, coefficients, recherche instantanée et modale de suppression CSRF.',
    content: afficheMPhp,
  },
  {
    filename: 'afficheE.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Calendrier des épreuves avec type d’évaluation, recherche instantanée et affichage adaptatif mobile.',
    content: afficheEPhp,
  },
  {
    filename: 'suppM.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Suppression sécurisée d’une matière par requête PDO préparée et vérification du jeton CSRF.',
    content: suppMPhp,
  },
  {
    filename: 'app.js',
    category: 'nouvelles-pages',
    language: 'javascript',
    modified: true,
    summary: 'JavaScript Vanilla complet : tiroir mobile, recherche tableaux, modale suppression, visibilité mot de passe et validation formulaires.',
    content: appJs,
  },
  {
    filename: 'img/logo.svg',
    category: 'nouvelles-pages',
    language: 'xml',
    modified: true,
    summary: 'Logo vectoriel officiel ISET Djerba prêt à l’emploi dans img/ (avec bascule automatique vers img/logo.png si présent).',
    content: logoSvg,
  },
  {
    filename: 'style.css',
    category: 'css-modifie',
    language: 'css',
    modified: true,
    summary: 'Feuille CSS3 principale organisée : sidebar fixe, barre contextuelle, cartes KPI, tableaux data-label mobile et @media print.',
    content: styleCss,
  },
  {
    filename: 'login.css',
    category: 'css-modifie',
    language: 'css',
    modified: true,
    summary: 'Feuille CSS3 dédiée à la connexion : mise en page centrée sans chevauchement mobile et champs 16px anti-zoom iOS.',
    content: loginCss,
  },
  {
    filename: 'landing.css',
    category: 'css-modifie',
    language: 'css',
    modified: true,
    summary: 'Feuille CSS3 dédiée à la page d’accueil : header sticky, section Hero équilibrée et grille Bento responsive.',
    content: landingCss,
  },
  {
    filename: 'index.html',
    category: 'html-sql',
    language: 'html',
    modified: true,
    summary: 'Page d’accueil HTML5 institutionnelle avec logo ISET Djerba, présentation des espaces Professeur et Étudiant.',
    content: indexHtml,
  },
  {
    filename: 'notes.sql',
    category: 'html-sql',
    language: 'sql',
    modified: true,
    summary: 'Script SQL complet : matières exactes du cours (STA 0.4, INF 0.4, ECO 0.2), étudiants, épreuves, notes et comptes.',
    content: notesSql,
  },
  {
    filename: 'notes_roles.sql',
    category: 'html-sql',
    language: 'sql',
    modified: true,
    summary: 'Migration SQL non-destructive alignant STA (0.4), INF (0.4), ECO (0.2) et incluant les requêtes optionnelles commentées de nettoyage de colonne.',
    content: notesRolesSql,
  },
  {
    filename: 'LISEZ-MOI.txt',
    category: 'html-sql',
    language: 'text',
    modified: true,
    summary: 'Guide d’installation XAMPP, conformité Chapitre 5 PDO (STA 0.4, INF 0.4, ECO 0.2) et comptes de test.',
    content: lisezMoiTxt,
  },
  {
    filename: 'connect.inc.php',
    category: 'php-intact',
    language: 'php',
    modified: true,
    summary: 'Connexion PDO MySQL conforme au Chapitre 5 ($host, $port, $base, $dsn, $dbh + setAttribute + alias $db) et chargement de fonctions.php.',
    content: connectIncPhp,
  },
  {
    filename: 'fonctions.php',
    category: 'nouvelles-pages',
    language: 'php',
    modified: true,
    summary: 'Fonctions utilitaires réutilisables : sécurité (e, verifierCsrf, rediriger), rôles, validations, mentions, requêtes PDO et avatars.',
    content: fonctionsPhp,
  },
  {
    filename: 'auth.php',
    category: 'php-intact',
    language: 'php',
    modified: false,
    summary: 'Vérification de session utilisateur et initialisation du jeton CSRF.',
    content: authPhp,
  },
  {
    filename: 'logout.php',
    category: 'php-intact',
    language: 'php',
    modified: false,
    summary: 'Destruction sécurisée de la session PHP et redirection vers login.php.',
    content: logoutPhp,
  },
  {
    filename: 'formInsertM.php',
    category: 'php-intact',
    language: 'php',
    modified: true,
    summary: 'Formulaire PHP d’ajout d’une matière avec code, libellé, coefficient, validation PDO et CSRF.',
    content: formInsertMPhp,
  },
  {
    filename: 'formInsertE.php',
    category: 'php-intact',
    language: 'php',
    modified: true,
    summary: 'Formulaire PHP de planification d’une épreuve avec matière et type d’évaluation.',
    content: formInsertEPhp,
  },
  {
    filename: 'insertM.php',
    category: 'php-intact',
    language: 'php',
    modified: true,
    summary: 'Exercice Chapitre 5 (p. 26-27) : requête préparée PDO + bindParam() insérant STA (0.4), INF (0.4) et ECO (0.2).',
    content: insertMPhp,
  },
  {
    filename: 'insertE.php',
    category: 'php-intact',
    language: 'php',
    modified: true,
    summary: 'Requête préparée PDO + bindParam() insérant les épreuves STA, INF et ECO avec fermeture explicite de la connexion.',
    content: insertEPhp,
  },
  {
    filename: 'stars.js',
    category: 'php-intact',
    language: 'javascript',
    modified: false,
    summary: 'Script JavaScript Vanilla original conservé pour compatibilité.',
    content: starsJs,
  },
];
