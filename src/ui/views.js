import {
  EVAL_TYPES,
  ISET_ANNEES,
  ISET_DEPARTEMENTS,
  ISET_SPECIALITES,
  computeStudentTranscript,
  escapeHtml,
  formatDateFr,
  formatNote,
} from '../data/initialData.js';
import { PHP_PROJECT_FILES } from '../data/phpProjectFiles.js';
import { renderIsetBrand } from './brand.js';

export const XAMPP_ZIP_FILENAME = 'iset_djerba_xampp_htdocs.zip';

const CODE_CATEGORIES = [
  { id: 'all', label: `Tout le projet XAMPP (${PHP_PROJECT_FILES.length})` },
  {
    id: 'nouvelles-pages',
    label: `Menu, Prof & Étudiant (${PHP_PROJECT_FILES.filter((f) => f.category === 'nouvelles-pages').length})`,
  },
  {
    id: 'css-modifie',
    label: `CSS3 (${PHP_PROJECT_FILES.filter((f) => f.category === 'css-modifie').length})`,
  },
  {
    id: 'html-sql',
    label: `HTML5, SQL & Guide (${PHP_PROJECT_FILES.filter((f) => f.category === 'html-sql').length})`,
  },
  {
    id: 'php-intact',
    label: `PHP & JS de base (${PHP_PROJECT_FILES.filter((f) => f.category === 'php-intact').length})`,
  },
];

export function renderStudioBar(state) {
  return `
    <div class="studio-bar">
      <div class="studio-bar-inner">
        <div class="tab-group">
          <button type="button" data-action="set-tab" data-tab="preview" class="tab-btn ${state.workspaceTab === 'preview' ? 'active' : ''}">
            Aperçu du site
          </button>
          <button type="button" data-action="set-tab" data-tab="code" class="tab-btn ${state.workspaceTab === 'code' ? 'active' : ''}">
            Code PHP · HTML5 · CSS3 · JS · SQL
          </button>
        </div>

        <div class="studio-right">
          ${
            state.workspaceTab === 'preview'
              ? `
            <div class="tab-group viewport-toggle">
              <button type="button" data-action="set-viewport" data-viewport="desktop" class="tab-btn tab-btn--blue ${state.viewportMode === 'desktop' ? 'active' : ''}">
                Desktop
              </button>
              <button type="button" data-action="set-viewport" data-viewport="mobile" class="tab-btn tab-btn--blue ${state.viewportMode === 'mobile' ? 'active' : ''}">
                Mobile 390px
              </button>
            </div>
          `
              : ''
          }
          <button type="button" data-action="download-zip" class="btn btn-sm ${state.justDownloaded ? 'btn-success' : 'btn-primary'}">
            ${state.justDownloaded ? 'Archive téléchargée' : 'Télécharger ZIP XAMPP'}
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderDownloadBanner(state) {
  if (!state.showDownloadBanner) return '';
  return `
    <div class="download-banner" role="region" aria-label="Téléchargement direct de l'archive PHP pour XAMPP">
      <div class="download-banner-inner">
        <div class="download-banner-info">
          <span class="download-banner-icon" aria-hidden="true">ZIP</span>
          <div>
            <strong>Archive prête pour XAMPP (htdocs)</strong> —
            <strong class="tabular-nums">${PHP_PROJECT_FILES.length} fichiers</strong> HTML5, CSS3, JavaScript Vanilla, PHP &amp; MySQL
            (100 % sans TypeScript ni React, MySQL <span class="mono">root</span> sans mot de passe).
          </div>
        </div>
        <div class="download-banner-actions">
          ${
            state.workspaceTab === 'preview'
              ? `<button type="button" data-action="set-tab" data-tab="code" class="btn btn-sm btn-secondary">Voir les ${PHP_PROJECT_FILES.length} fichiers</button>`
              : ''
          }
          <button type="button" data-action="download-zip" class="btn btn-sm ${state.justDownloaded ? 'btn-success' : 'btn-primary'}">
            ${
              state.justDownloaded
                ? `Archive téléchargée (${PHP_PROJECT_FILES.length} fichiers)`
                : `Télécharger ${XAMPP_ZIP_FILENAME}`
            }
          </button>
          <button type="button" data-action="dismiss-banner" class="icon-close-btn" aria-label="Fermer la bannière">&times;</button>
        </div>
      </div>
    </div>
  `;
}

export function renderLandingView(state) {
  return `
    <div class="landing-shell">
      <header class="landing-header">
        <div class="landing-header-inner">
          <button type="button" data-action="navigate" data-page="landing" style="border:0;background:none;cursor:pointer;">
            ${renderIsetBrand()}
          </button>
          <nav class="landing-nav" aria-label="Navigation accueil">
            <button type="button" data-action="navigate" data-page="landing" class="landing-nav-link active">Accueil</button>
            <a href="#presentation" class="landing-nav-link">Présentation</a>
            <button type="button" data-action="navigate" data-page="${state.session ? (state.session.role === 'etudiant' ? 'student-notes' : 'dashboard') : 'login'}" class="btn btn-sm btn-primary">
              ${state.session ? 'Mon espace' : 'Connexion'}
            </button>
          </nav>
        </div>
      </header>

      <section class="landing-hero">
        <div>
          <h1>NOTES <span>DB</span></h1>
          <div class="landing-sub">ISET DJERBA</div>
          <p class="landing-lead">
            Consultez facilement vos notes par matière, suivez votre moyenne générale pondérée
            et gérez les épreuves depuis une plateforme institutionnelle rapide et responsive.
          </p>
          <div class="landing-cta-row">
            <button type="button" data-action="navigate" data-page="${state.session ? (state.session.role === 'etudiant' ? 'student-notes' : 'dashboard') : 'login'}" class="btn btn-primary">
              Accéder à mon espace
            </button>
            <a href="#presentation" class="btn btn-secondary">Découvrir les espaces</a>
          </div>
        </div>

        <svg class="landing-cap" viewBox="0 0 560 420" aria-hidden="true">
          <rect x="40" y="290" width="470" height="80" rx="12" fill="#0b4fb8"/>
          <rect x="70" y="300" width="440" height="60" fill="#f1f5f9"/>
          <rect x="30" y="280" width="90" height="90" rx="22" fill="#0b5ed7"/>
          <rect x="90" y="200" width="400" height="80" rx="12" fill="#0b5ed7"/>
          <rect x="120" y="210" width="370" height="60" fill="#f1f5f9"/>
          <rect x="80" y="195" width="80" height="90" rx="22" fill="#1266e8"/>
          <path d="M140 130v70c0 25 130 30 150 30s130-5 130-30v-70z" fill="#111827"/>
          <path d="M10 100 280 10l270 90-270 90z" fill="#0b0f19"/>
          <path d="M440 100c30 10 30 60 30 130" stroke="#1266e8" stroke-width="8" fill="none"/>
          <rect x="460" y="225" width="20" height="70" rx="8" fill="#1266e8"/>
        </svg>
      </section>

      <section class="bento-wrap" id="presentation">
        <div class="bento-grid">
          <article class="bento-dark">
            <div>
              <span class="bento-kicker">01 · Espace Enseignant</span>
              <h2>Pilotez vos matières, épreuves et saisies de notes</h2>
              <p>
                Tableau de bord dédié aux professeurs de l'ISET Djerba : saisie rapide des notes sur 20,
                mise à jour instantanée, gestion des coefficients et consultation directe du relevé de chaque étudiant.
              </p>
            </div>
            <div>
              <button type="button" data-action="quick-login" data-login="prof" class="btn btn-primary">
                Tester l'espace Professeur
              </button>
            </div>
          </article>

          <div class="bento-stack">
            <article class="bento-card">
              <span class="bento-kicker bento-kicker--blue">02 · Espace Étudiant</span>
              <h3>Relevé complet par matière</h3>
              <p>
                Visualisez vos notes regroupées par module, votre moyenne par matière,
                votre moyenne générale pondérée et imprimez votre relevé officiel.
              </p>
              <div style="margin-top:0.9rem;">
                <button type="button" data-action="quick-login" data-login="youssef" class="btn btn-sm btn-secondary">
                  Tester l'espace Étudiant
                </button>
              </div>
            </article>

            <article class="bento-card">
              <span class="bento-kicker bento-kicker--blue">03 · 100 % HTML5, CSS3, Vanilla JS &amp; PHP</span>
              <h3>Architecture propre et prête pour XAMPP</h3>
              <p>
                Aucune dépendance TypeScript ou React : code clair, requêtes SQL préparées PDO
                et compatibilité ordinateur, tablette et smartphone.
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer class="site-footer">
        &copy; ${new Date().getFullYear()} ISET Djerba — Système de Gestion des Notes &amp; Épreuves
      </footer>
    </div>
  `;
}

export function renderLoginView(state) {
  return `
    <div class="login-shell">
      <header class="landing-header">
        <div class="landing-header-inner">
          <button type="button" data-action="navigate" data-page="landing" style="border:0;background:none;cursor:pointer;">
            ${renderIsetBrand()}
          </button>
          <button type="button" data-action="navigate" data-page="landing" class="landing-nav-link">
            Retour à l'accueil
          </button>
        </div>
      </header>

      <main class="login-card">
        <h1>Espace <span>Connexion</span></h1>
        <p class="login-lead">Connectez-vous en tant que Professeur ou Étudiant pour accéder à votre espace.</p>

        ${state.loginError ? `<div class="alert alert-err" role="alert">${escapeHtml(state.loginError)}</div>` : ''}

        <form id="previewLoginForm" novalidate>
          <div class="field">
            <label for="loginInput">Identifiant</label>
            <input type="text" id="loginInput" name="login" required value="${escapeHtml(state.loginDraft)}" placeholder="Ex : prof ou youssef">
          </div>

          <div class="field">
            <label for="passwordInput">Mot de passe</label>
            <div class="password-wrap">
              <input type="${state.showPassword ? 'text' : 'password'}" id="passwordInput" name="password" required value="${escapeHtml(state.passwordDraft)}" placeholder="Votre mot de passe">
              <button type="button" data-action="toggle-password" class="password-toggle">
                ${state.showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-full">Se connecter</button>
        </form>

        <div class="quick-role-box">
          <div class="quick-role-title">Accès rapide démo</div>
          <div class="quick-role-grid">
            <button type="button" data-action="quick-login" data-login="prof" class="btn btn-sm btn-secondary">Professeur (prof)</button>
            <button type="button" data-action="quick-login" data-login="youssef" class="btn btn-sm btn-secondary">Youssef (youssef)</button>
            <button type="button" data-action="quick-login" data-login="ines" class="btn btn-sm btn-secondary">Ines (ines)</button>
            <button type="button" data-action="quick-login" data-login="salma" class="btn btn-sm btn-secondary">Salma (1re co.)</button>
          </div>
        </div>
      </main>

      <footer class="site-footer">
        &copy; ${new Date().getFullYear()} ISET Djerba — Système de Gestion des Notes &amp; Épreuves
      </footer>
    </div>
  `;
}

function renderPortalLayout(state, title, sidebarHtml, mainHtml, topActionHtml = '') {
  const isMobile = state.viewportMode === 'mobile';
  const initials = (state.session?.login || 'IS').slice(0, 2).toUpperCase();
  const isStudent = state.session?.role === 'etudiant';
  const loggedStudent = isStudent
    ? state.etudiants.find((e) => e.numetu === state.session?.numetu) || null
    : null;
  const avatarPhoto = loggedStudent?.photo || '';

  return `
    <div class="portal-shell ${isMobile ? 'portal-shell--mobile' : ''} ${state.drawerOpen ? 'drawer-open' : ''}">
      ${state.drawerOpen ? '<div class="sidebar-scrim" data-action="close-drawer"></div>' : ''}
      <aside class="portal-sidebar" aria-label="Menu principal">
        <div class="portal-sidebar-header">
          <button type="button" data-action="navigate" data-page="${isStudent ? 'student-notes' : 'dashboard'}" style="border:0;background:none;cursor:pointer;">
            ${renderIsetBrand(true)}
          </button>
          ${state.drawerOpen ? '<button type="button" data-action="close-drawer" class="icon-close-btn" style="color:#e2e8f0;">&times;</button>' : ''}
        </div>
        <nav class="portal-sidebar-nav">${sidebarHtml}</nav>
        <div class="portal-sidebar-footer">
          <div class="user-row">
            <div class="user-avatar">
              ${avatarPhoto ? `<img src="${escapeHtml(avatarPhoto)}" alt="Avatar">` : escapeHtml(initials)}
            </div>
            <div>
              <div class="user-name">${escapeHtml(state.session?.displayName || state.session?.login || '')}</div>
              <div class="user-role">${isStudent ? 'Espace Étudiant · ISET' : 'Espace Professeur · ISET'}</div>
            </div>
          </div>
          <button type="button" data-action="logout" class="logout-btn">Déconnexion</button>
        </div>
      </aside>

      <div class="portal-main">
        <header class="portal-topbar">
          <div class="portal-topbar-left">
            <button type="button" data-action="open-drawer" class="hamburger-btn" aria-label="Ouvrir le menu">&#9776;</button>
            <div class="breadcrumb">
              <span>ISET Djerba</span>
              <span>/</span>
              <strong>${escapeHtml(title)}</strong>
            </div>
          </div>
          ${topActionHtml}
        </header>

        <main class="portal-content">${mainHtml}</main>
        <footer class="portal-footer">&copy; ${new Date().getFullYear()} ISET Djerba — NOTES DB</footer>
      </div>
    </div>
  `;
}

export function renderProfessorPortal(state) {
  const sidebarHtml = `
    <div>
      <div class="nav-section-label">Principal</div>
      <ul class="nav-list">
        <li><button type="button" data-action="navigate" data-page="dashboard" class="nav-item-btn ${state.sitePage === 'dashboard' ? 'active' : ''}">Tableau de bord</button></li>
        <li><button type="button" data-action="navigate" data-page="prof-notes" class="nav-item-btn ${state.sitePage === 'prof-notes' ? 'active' : ''}">Notes (Professeur)</button></li>
        <li><button type="button" data-action="navigate" data-page="student-notes" class="nav-item-btn">Aperçu Relevé Étudiant</button></li>
      </ul>
    </div>
    <div>
      <div class="nav-section-label">Gestion académique</div>
      <ul class="nav-list">
        <li><button type="button" data-action="navigate" data-page="etudiants" class="nav-item-btn ${state.sitePage === 'etudiants' ? 'active' : ''}">Étudiants <span class="tabular-nums">${state.etudiants.length}</span></button></li>
        <li><button type="button" data-action="navigate" data-page="matieres" class="nav-item-btn ${state.sitePage === 'matieres' ? 'active' : ''}">Matières <span class="tabular-nums">${state.matieres.length}</span></button></li>
        <li><button type="button" data-action="navigate" data-page="epreuves" class="nav-item-btn ${state.sitePage === 'epreuves' ? 'active' : ''}">Épreuves <span class="tabular-nums">${state.epreuves.length}</span></button></li>
      </ul>
    </div>
    <div>
      <div class="nav-section-label">Actions rapides</div>
      <ul class="nav-list">
        <li><button type="button" data-action="navigate" data-page="add-note-cin" class="nav-item-btn ${state.sitePage === 'add-note-cin' ? 'active' : ''}">+ Ajouter une note (CIN)</button></li>
        <li><button type="button" data-action="navigate" data-page="add-etudiant" class="nav-item-btn ${state.sitePage === 'add-etudiant' ? 'active' : ''}">+ Ajouter un étudiant</button></li>
        <li><button type="button" data-action="navigate" data-page="add-matiere" class="nav-item-btn ${state.sitePage === 'add-matiere' ? 'active' : ''}">+ Ajouter une matière</button></li>
        <li><button type="button" data-action="navigate" data-page="add-epreuve" class="nav-item-btn ${state.sitePage === 'add-epreuve' ? 'active' : ''}">+ Planifier une épreuve</button></li>
      </ul>
    </div>
  `;

  const matMap = new Map(state.matieres.map((m) => [m.codemat, m]));
  const etuMap = new Map(state.etudiants.map((e) => [e.numetu, e]));
  const epMap = new Map(state.epreuves.map((ep) => [ep.numepreuve, ep]));

  const flashHtml = state.flash
    ? `<div class="alert ${state.flash.type === 'err' ? 'alert-err' : 'alert-ok'}">${escapeHtml(state.flash.text)}</div>`
    : '';

  let title = 'Tableau de bord';
  let mainHtml = '';

  if (state.sitePage === 'dashboard') {
    const classAvg =
      state.notations.length > 0
        ? state.notations.reduce((s, n) => s + n.note, 0) / state.notations.length
        : null;
    const recentExams = [...state.epreuves]
      .sort((a, b) => b.datepreuve.localeCompare(a.datepreuve))
      .slice(0, 6);

    mainHtml = `
      <div class="page-head">
        <div>
          <h1>Tableau de bord Professeur</h1>
          <p>Vue globale des étudiants, des matières, des épreuves et des résultats de l'ISET Djerba.</p>
        </div>
        <div class="actions-row">
          <button type="button" data-action="navigate" data-page="add-etudiant" class="btn btn-secondary">+ Ajouter un étudiant</button>
          <button type="button" data-action="navigate" data-page="add-note-cin" class="btn btn-primary">+ Note par CIN</button>
        </div>
      </div>
      ${flashHtml}
      <div class="kpi-grid">
        <div class="kpi-card">
          <h3>Étudiants</h3>
          <div class="kpi-value tabular-nums">${state.etudiants.length}</div>
          <p class="muted" style="font-size:0.84rem;">Étudiants inscrits</p>
          <button type="button" data-action="navigate" data-page="etudiants" class="btn btn-sm btn-secondary">Gérer les étudiants</button>
        </div>
        <div class="kpi-card">
          <h3>Matières</h3>
          <div class="kpi-value tabular-nums">${state.matieres.length}</div>
          <p class="muted" style="font-size:0.84rem;">Modules enseignés</p>
          <button type="button" data-action="navigate" data-page="matieres" class="btn btn-sm btn-secondary">Voir les matières</button>
        </div>
        <div class="kpi-card">
          <h3>Épreuves</h3>
          <div class="kpi-value tabular-nums">${state.epreuves.length}</div>
          <p class="muted" style="font-size:0.84rem;">Examens et contrôles planifiés</p>
          <button type="button" data-action="navigate" data-page="epreuves" class="btn btn-sm btn-secondary">Voir les épreuves</button>
        </div>
        <div class="kpi-card">
          <h3>Notes saisies</h3>
          <div class="kpi-value tabular-nums">${state.notations.length}</div>
          <p class="muted" style="font-size:0.84rem;">Moy. globale ${classAvg !== null ? `${formatNote(classAvg)}/20` : '—'}</p>
          <button type="button" data-action="navigate" data-page="prof-notes" class="btn btn-sm btn-primary">Gérer les notes</button>
        </div>
      </div>

      <h2 class="section-heading">Dernières épreuves planifiées</h2>
      <div class="table-card">
        <table class="data-table">
          <thead><tr><th>N° épreuve</th><th>Date</th><th>Lieu / salle</th><th>Matière</th></tr></thead>
          <tbody>
            ${
              recentExams.length
                ? recentExams
                    .map((ep) => {
                      const mat = matMap.get(ep.codemat);
                      return `
                        <tr>
                          <td data-label="N° épreuve"><span class="type-tag">${escapeHtml(ep.type_eval || 'Examen')}</span><strong>#${ep.numepreuve}</strong></td>
                          <td data-label="Date">${formatDateFr(ep.datepreuve)}</td>
                          <td data-label="Lieu / salle">${escapeHtml(ep.Lieu)}</td>
                          <td data-label="Matière"><span class="code-badge">${escapeHtml(ep.codemat)}</span>${escapeHtml(mat?.libelle || '—')}</td>
                        </tr>
                      `;
                    })
                    .join('')
                : '<tr><td colspan="4" class="empty-cell">Aucune épreuve planifiée.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `;
  } else if (state.sitePage === 'prof-notes') {
    title = 'Saisie des notes (Professeur)';
    const q = state.searchQuery.trim().toLowerCase();

    const filteredNotes = state.notations.filter((n) => {
      const et = etuMap.get(n.numetu);
      const ep = epMap.get(n.numepreuve);
      const mat = ep ? matMap.get(ep.codemat) : null;
      if (!q) return true;
      const hay = `${et?.prenom || ''} ${et?.nom || ''} ${ep?.codemat || ''} ${mat?.libelle || ''} ${n.numepreuve}`.toLowerCase();
      return hay.includes(q);
    });

    mainHtml = `
      <div class="page-head">
        <div>
          <h1>Saisie des notes (Professeur)</h1>
          <p>Ajoutez, modifiez ou supprimez les notes sur 20 pour les étudiants et épreuves de l'ISET Djerba.</p>
        </div>
        <div class="actions-row">
          <button type="button" data-action="navigate" data-page="add-note-cin" class="btn btn-primary">+ Ajouter par CIN</button>
          <button type="button" data-action="navigate" data-page="student-notes" class="btn btn-secondary">Voir la vue Étudiant</button>
        </div>
      </div>
      ${flashHtml}
      <div class="form-panel">
        <h2>${state.gradeEdit.editing ? 'Modifier une note existante' : 'Ajouter ou modifier une note'}</h2>
        <p class="form-subtitle">Sélectionnez un étudiant, une épreuve et saisissez la note obtenue sur 20.</p>
        <form id="profGradeForm">
          <div class="form-grid-3">
            <div class="field">
              <label for="gradeStudent">Étudiant</label>
              <select id="gradeStudent" name="numetu" data-action="grade-student-change" required>
                <option value="">— Choisir un étudiant —</option>
                ${state.etudiants
                  .map(
                    (et) =>
                      `<option value="${et.numetu}" ${Number(state.gradeEdit.numetu) === et.numetu ? 'selected' : ''}>#${et.numetu} — ${escapeHtml(et.prenom)} ${escapeHtml(et.nom)}</option>`
                  )
                  .join('')}
              </select>
            </div>
            <div class="field">
              <label for="gradeExam">Épreuve &amp; Matière</label>
              <select id="gradeExam" name="numepreuve" required>
                <option value="">— Choisir une épreuve —</option>
                ${state.epreuves
                  .map((ep) => {
                    const mat = matMap.get(ep.codemat);
                    return `<option value="${ep.numepreuve}" ${Number(state.gradeEdit.numepreuve) === ep.numepreuve ? 'selected' : ''}>#${ep.numepreuve} · ${escapeHtml(ep.codemat)} (${escapeHtml(mat?.libelle || '')})</option>`;
                  })
                  .join('')}
              </select>
            </div>
            <div class="field">
              <label for="gradeValue">Note sur 20</label>
              <input type="number" id="gradeValue" name="note" min="0" max="20" step="0.25" required value="${escapeHtml(state.gradeEdit.note)}" placeholder="Ex : 15.5">
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Enregistrer la note</button>
            ${state.gradeEdit.editing ? '<button type="button" data-action="cancel-edit-grade" class="btn btn-secondary">Annuler</button>' : ''}
          </div>
        </form>
      </div>

      <div class="toolbar">
        <input type="search" data-action="search-input" class="search-input" value="${escapeHtml(state.searchQuery)}" placeholder="Rechercher un étudiant ou une matière…">
        <span class="muted">Total : <strong class="tabular-nums">${filteredNotes.length}</strong> note(s)</span>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead><tr><th>Étudiant</th><th>Matière</th><th>Épreuve</th><th>Note / 20</th><th class="right">Actions</th></tr></thead>
          <tbody>
            ${
              filteredNotes.length
                ? filteredNotes
                    .map((n) => {
                      const et = etuMap.get(n.numetu);
                      const ep = epMap.get(n.numepreuve);
                      const mat = ep ? matMap.get(ep.codemat) : null;
                      return `
                        <tr>
                          <td data-label="Étudiant">
                            <strong>${escapeHtml(et ? `${et.prenom} ${et.nom}` : `#${n.numetu}`)}</strong>
                            <div class="cell-sub">${et?.cin ? `CIN ${escapeHtml(et.cin)} · ` : ''}#${n.numetu}</div>
                          </td>
                          <td data-label="Matière"><span class="code-badge">${escapeHtml(ep?.codemat || '—')}</span>${escapeHtml(mat?.libelle || '')}</td>
                          <td data-label="Épreuve"><span class="type-tag">${escapeHtml(ep?.type_eval || 'Examen')}</span>#${n.numepreuve} (${formatDateFr(ep?.datepreuve)})</td>
                          <td data-label="Note / 20"><strong class="${n.note < 10 ? 'text-danger' : 'text-ok'}">${formatNote(n.note)} / 20</strong></td>
                          <td data-label="Actions" class="right">
                            <div class="actions-row">
                              <button type="button" data-action="preview-student" data-numetu="${n.numetu}" class="btn btn-xs btn-secondary">Relevé</button>
                              <button type="button" data-action="edit-grade" data-numetu="${n.numetu}" data-numepreuve="${n.numepreuve}" class="btn btn-xs btn-secondary">Modifier</button>
                              <button type="button" data-action="delete-grade" data-numetu="${n.numetu}" data-numepreuve="${n.numepreuve}" class="btn btn-xs btn-danger">Supprimer</button>
                            </div>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')
                : '<tr><td colspan="5" class="empty-cell">Aucune note trouvée.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `;
  } else if (state.sitePage === 'matieres') {
    title = 'Gestion des matières';
    const q = state.searchQuery.trim().toLowerCase();
    const filtered = state.matieres.filter(
      (m) => !q || `${m.codemat} ${m.libelle}`.toLowerCase().includes(q)
    );

    mainHtml = `
      <div class="page-head">
        <div>
          <h1>Gestion des matières</h1>
          <p>Consultez, recherchez ou supprimez les matières enregistrées dans la base de données.</p>
        </div>
        <button type="button" data-action="navigate" data-page="add-matiere" class="btn btn-primary">+ Ajouter une matière</button>
      </div>
      ${flashHtml}
      <div class="toolbar">
        <input type="search" data-action="search-input" class="search-input" value="${escapeHtml(state.searchQuery)}" placeholder="Rechercher par code ou libellé…">
        <span class="muted">Total : <strong class="tabular-nums">${filtered.length}</strong> matière(s)</span>
      </div>
      <div class="table-card">
        <table class="data-table">
          <thead><tr><th>Code</th><th>Libellé</th><th>Coefficient</th><th>Épreuves liées</th><th class="right">Actions</th></tr></thead>
          <tbody>
            ${
              filtered.length
                ? filtered
                    .map((m) => {
                      const count = state.epreuves.filter((ep) => ep.codemat === m.codemat).length;
                      return `
                        <tr>
                          <td data-label="Code"><span class="code-badge">${escapeHtml(m.codemat)}</span></td>
                          <td data-label="Libellé"><strong>${escapeHtml(m.libelle)}</strong></td>
                          <td data-label="Coefficient">${m.coef}</td>
                          <td data-label="Épreuves liées">${count}</td>
                          <td data-label="Actions" class="right">
                            <button type="button" data-action="ask-delete-matiere" data-code="${escapeHtml(m.codemat)}" class="btn btn-xs btn-danger">Supprimer</button>
                          </td>
                        </tr>
                      `;
                    })
                    .join('')
                : '<tr><td colspan="5" class="empty-cell">Aucune matière trouvée.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `;
  } else if (state.sitePage === 'epreuves') {
    title = 'Calendrier des épreuves';
    const q = state.searchQuery.trim().toLowerCase();
    const filtered = state.epreuves.filter((ep) => {
      const mat = matMap.get(ep.codemat);
      if (!q) return true;
      return `${ep.numepreuve} ${ep.Lieu} ${ep.codemat} ${mat?.libelle || ''}`.toLowerCase().includes(q);
    });

    mainHtml = `
      <div class="page-head">
        <div>
          <h1>Calendrier des épreuves</h1>
          <p>Liste des examens et contrôles programmés par matière.</p>
        </div>
        <button type="button" data-action="navigate" data-page="add-epreuve" class="btn btn-primary">+ Planifier une épreuve</button>
      </div>
      ${flashHtml}
      <div class="toolbar">
        <input type="search" data-action="search-input" class="search-input" value="${escapeHtml(state.searchQuery)}" placeholder="Rechercher par numéro, salle ou matière…">
        <span class="muted">Total : <strong class="tabular-nums">${filtered.length}</strong> épreuve(s)</span>
      </div>
      <div class="table-card">
        <table class="data-table">
          <thead><tr><th>N° épreuve</th><th>Date</th><th>Lieu / salle</th><th>Matière</th></tr></thead>
          <tbody>
            ${
              filtered.length
                ? filtered
                    .map((ep) => {
                      const mat = matMap.get(ep.codemat);
                      return `
                        <tr>
                          <td data-label="N° épreuve"><span class="type-tag">${escapeHtml(ep.type_eval || 'Examen')}</span><strong>#${ep.numepreuve}</strong></td>
                          <td data-label="Date">${formatDateFr(ep.datepreuve)}</td>
                          <td data-label="Lieu / salle">${escapeHtml(ep.Lieu)}</td>
                          <td data-label="Matière"><span class="code-badge">${escapeHtml(ep.codemat)}</span>${escapeHtml(mat?.libelle || '—')}</td>
                        </tr>
                      `;
                    })
                    .join('')
                : '<tr><td colspan="4" class="empty-cell">Aucune épreuve trouvée.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `;
  } else if (state.sitePage === 'add-matiere') {
    title = 'Ajouter une matière';
    mainHtml = `
      ${flashHtml}
      <div class="form-panel form-panel--narrow">
        <h2>Ajouter une matière</h2>
        <p class="form-subtitle">Enregistrez une nouvelle matière avec son code et son coefficient.</p>
        <form id="addMatiereForm">
          <div class="field">
            <label for="newCodemat">Code matière (3 caractères max)</label>
            <input type="text" id="newCodemat" name="codemat" maxlength="3" required placeholder="Ex : PHY ou ALG" style="text-transform:uppercase;">
          </div>
          <div class="field">
            <label for="newLibelle">Libellé (20 caractères max)</label>
            <input type="text" id="newLibelle" name="libelle" maxlength="20" required placeholder="Ex : Physique">
          </div>
          <div class="field">
            <label for="newCoef">Coefficient</label>
            <input type="number" id="newCoef" name="coef" step="0.01" min="0.01" max="10" required placeholder="Ex : 0.4">
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Enregistrer la matière</button>
            <button type="button" data-action="navigate" data-page="matieres" class="btn btn-secondary">Annuler</button>
          </div>
        </form>
      </div>
    `;
  } else if (state.sitePage === 'etudiants') {
    title = 'Gestion des étudiants';
    const q = state.searchQuery.trim().toLowerCase();
    const filtered = state.etudiants.filter((et) => {
      if (!q) return true;
      const hay = `${et.numetu} ${et.cin || ''} ${et.nom} ${et.prenom} ${et.email || ''} ${et.departement || ''} ${et.specialite || ''} ${et.classe || ''} ${et.annee_univ || ''}`.toLowerCase();
      return hay.includes(q);
    });

    mainHtml = `
      <div class="page-head">
        <div>
          <h1>Gestion des étudiants</h1>
          <p>Consultez, modifiez et enregistrez les étudiants de l'ISET Djerba.</p>
        </div>
        <button type="button" data-action="navigate" data-page="add-etudiant" class="btn btn-primary">+ Ajouter un étudiant</button>
      </div>
      ${flashHtml}
      <div class="toolbar">
        <input type="search" data-action="search-input" class="search-input" value="${escapeHtml(state.searchQuery)}" placeholder="Rechercher par N° inscription, CIN, nom ou classe…">
        <span class="muted">Total : <strong class="tabular-nums">${filtered.length}</strong> étudiant(s)</span>
      </div>
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° inscription</th>
              <th>Étudiant</th>
              <th>Contact</th>
              <th>Département &amp; Spécialité</th>
              <th>Classe / Année</th>
              <th class="right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${
              filtered.length
                ? filtered
                    .map(
                      (et) => `
                  <tr>
                    <td data-label="N° / CIN">
                      <span class="code-badge">#${et.numetu}</span>
                      ${et.cin ? `<div class="cell-sub">CIN ${escapeHtml(et.cin)}</div>` : ''}
                    </td>
                    <td data-label="Étudiant">
                      <strong>${escapeHtml(et.prenom)} ${escapeHtml(et.nom)}</strong>
                      <div class="cell-sub">${escapeHtml(et.sexe || '—')} · Né(e) le ${formatDateFr(et.datenaiss)}</div>
                    </td>
                    <td data-label="Contact">
                      <div>${escapeHtml(et.email || '—')}</div>
                      <div class="cell-sub">${escapeHtml(et.telephone || '—')}</div>
                    </td>
                    <td data-label="Filière">
                      <div><strong>${escapeHtml(et.departement || '—')}</strong></div>
                      <div class="cell-sub">${escapeHtml(et.specialite || '—')}</div>
                    </td>
                    <td data-label="Classe / Année">
                      <div><strong>${escapeHtml(et.classe || '—')}</strong></div>
                      <div class="cell-sub">${escapeHtml(et.annee_univ || '—')}</div>
                    </td>
                    <td data-label="Actions" class="right">
                      <div class="actions-row">
                        <button type="button" data-action="view-student-detail" data-numetu="${et.numetu}" class="btn btn-xs btn-secondary">Consulter</button>
                        <button type="button" data-action="edit-student" data-numetu="${et.numetu}" class="btn btn-xs btn-secondary">Modifier</button>
                        ${et.cin ? `<button type="button" data-action="quick-note-cin" data-cin="${escapeHtml(et.cin)}" class="btn btn-xs btn-primary">+ Note</button>` : ''}
                        <button type="button" data-action="preview-student" data-numetu="${et.numetu}" class="btn btn-xs btn-secondary">Relevé</button>
                      </div>
                    </td>
                  </tr>
                `
                    )
                    .join('')
                : '<tr><td colspan="6" class="empty-cell">Aucun étudiant trouvé.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `;
  } else if (state.sitePage === 'add-etudiant') {
    const isEditing = Boolean(state.editingStudentId);
    title = isEditing ? 'Modifier un étudiant' : 'Ajouter un étudiant';
    const d = state.studentDraft;
    mainHtml = `
      <div class="page-head">
        <div>
          <h1>${isEditing ? `Modifier un étudiant (#${state.editingStudentId})` : 'Ajouter un étudiant'}</h1>
          <p>${isEditing ? "Modifiez le dossier, la filière et la classe de l'étudiant." : "Enregistrez un nouvel étudiant dans le répertoire académique de l'ISET Djerba."}</p>
        </div>
        <button type="button" data-action="navigate" data-page="etudiants" class="btn btn-secondary">Liste des étudiants</button>
      </div>
      ${flashHtml}
      <div class="form-panel">
        <form id="addEtudiantForm" novalidate>
          <div class="form-section-head">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span>01. Identité &amp; Coordonnées</span>
          </div>

          <div class="form-grid-2">
            <div class="field">
              <label for="etuNum">Numéro d'inscription (ID étudiant) *</label>
              <input type="number" id="etuNum" name="numetu" min="1" required class="${isEditing ? 'input-readonly' : ''}" ${isEditing ? 'readonly' : ''} value="${escapeHtml(d.numetu)}" placeholder="Ex : 1006">
            </div>
            <div class="field">
              <label for="etuCin">Numéro CIN</label>
              <input type="text" id="etuCin" name="cin" maxlength="20" value="${escapeHtml(d.cin || '')}" placeholder="Ex : 09841006">
            </div>
            <div class="field">
              <label for="etuSexe">Sexe *</label>
              <select id="etuSexe" name="sexe" required>
                <option value="">— Sélectionner —</option>
                <option value="Masculin" ${d.sexe === 'Masculin' ? 'selected' : ''}>Masculin</option>
                <option value="Féminin" ${d.sexe === 'Féminin' ? 'selected' : ''}>Féminin</option>
              </select>
            </div>
            <div class="field">
              <label for="etuNom">Nom *</label>
              <input type="text" id="etuNom" name="nom" maxlength="100" required value="${escapeHtml(d.nom)}" placeholder="Ex : Ben Salah">
            </div>
            <div class="field">
              <label for="etuPrenom">Prénom *</label>
              <input type="text" id="etuPrenom" name="prenom" maxlength="100" required value="${escapeHtml(d.prenom)}" placeholder="Ex : Amine">
            </div>
            <div class="field">
              <label for="etuEmail">Adresse e-mail *</label>
              <input type="email" id="etuEmail" name="email" maxlength="150" required value="${escapeHtml(d.email)}" placeholder="Ex : amine.bensalah@isetjb.rnu.tn">
            </div>
            <div class="field">
              <label for="etuTel">Numéro de téléphone *</label>
              <input type="tel" id="etuTel" name="telephone" maxlength="30" required value="${escapeHtml(d.telephone)}" placeholder="Ex : +216 22 345 678">
            </div>
            <div class="field">
              <label for="etuDateNaiss">Date de naissance *</label>
              <input type="date" id="etuDateNaiss" name="datenaiss" required value="${escapeHtml(d.datenaiss)}">
            </div>
          </div>

          <div class="form-section-head form-section-head--spaced">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <span>02. Parcours universitaire — ISET Djerba</span>
          </div>

          <div class="form-grid-2">
            <div class="field">
              <label for="etuClasse">Classe / Groupe *</label>
              <input type="text" id="etuClasse" name="classe" maxlength="50" required value="${escapeHtml(d.classe)}" placeholder="Ex : DSI-1 ou TI-1">
            </div>
            <div class="field">
              <label for="etuDep">Département *</label>
              <select id="etuDep" name="departement" required>
                <option value="">— Choisir un département —</option>
                ${ISET_DEPARTEMENTS.map(
                  (dep) => `<option value="${escapeHtml(dep)}" ${d.departement === dep ? 'selected' : ''}>${escapeHtml(dep)}</option>`
                ).join('')}
              </select>
            </div>
            <div class="field">
              <label for="etuSpec">Spécialité *</label>
              <select id="etuSpec" name="specialite" required>
                <option value="">— Choisir une spécialité —</option>
                ${ISET_SPECIALITES.map(
                  (sp) => `<option value="${escapeHtml(sp)}" ${d.specialite === sp ? 'selected' : ''}>${escapeHtml(sp)}</option>`
                ).join('')}
              </select>
            </div>
            <div class="field">
              <label for="etuAnnee">Année universitaire *</label>
              <select id="etuAnnee" name="annee_univ" required>
                <option value="">— Choisir une année —</option>
                ${ISET_ANNEES.map(
                  (an) => `<option value="${escapeHtml(an)}" ${d.annee_univ === an ? 'selected' : ''}>${escapeHtml(an)}</option>`
                ).join('')}
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">${isEditing ? 'Enregistrer les modifications' : "Ajouter l'étudiant"}</button>
            <button type="button" data-action="navigate" data-page="etudiants" class="btn btn-secondary">Annuler</button>
          </div>
        </form>
      </div>
    `;
  } else if (state.sitePage === 'add-epreuve') {
    title = 'Planifier une épreuve';
    mainHtml = `
      ${flashHtml}
      <div class="form-panel form-panel--narrow">
        <h2>Planifier une épreuve</h2>
        <p class="form-subtitle">Choisissez une matière et précisez la date et la salle.</p>
        <form id="addEpreuveForm">
          <div class="field">
            <label for="newNumEp">Numéro d'épreuve</label>
            <input type="number" id="newNumEp" name="numepreuve" min="1" required placeholder="Ex : 50004">
          </div>
          <div class="field">
            <label for="newDateEp">Date</label>
            <input type="date" id="newDateEp" name="datepreuve" required>
          </div>
          <div class="field">
            <label for="newLieuEp">Lieu / salle</label>
            <input type="text" id="newLieuEp" name="lieu" maxlength="100" required placeholder="Ex : Salle 101">
          </div>
          <div class="field">
            <label for="newTypeEp">Type d'évaluation</label>
            <select id="newTypeEp" name="type_eval" required>
              ${EVAL_TYPES.map((t) => `<option value="${t}" ${t === 'Examen' ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="newMatEp">Matière</label>
            <select id="newMatEp" name="codemat" required>
              <option value="">— Choisir une matière —</option>
              ${state.matieres
                .map((m) => `<option value="${escapeHtml(m.codemat)}">${escapeHtml(m.codemat)} — ${escapeHtml(m.libelle)}</option>`)
                .join('')}
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Ajouter l'épreuve</button>
            <button type="button" data-action="navigate" data-page="epreuves" class="btn btn-secondary">Annuler</button>
          </div>
        </form>
      </div>
    `;
  } else if (state.sitePage === 'add-note-cin') {
    title = 'Ajouter une note par CIN';
    const d = state.noteCinDraft;
    const cinClean = d.cin.replace(/\s+/g, '');
    const matchedStudent = cinClean
      ? state.etudiants.find((et) => (et.cin || '') === cinClean) || null
      : null;

    const cinSuggestions =
      !matchedStudent && cinClean && state.cinSuggestionsOpen
        ? state.etudiants
            .filter((et) => {
              const q = cinClean.toLowerCase();
              return (
                (et.cin || '').toLowerCase().includes(q) ||
                et.nom.toLowerCase().includes(q) ||
                et.prenom.toLowerCase().includes(q)
              );
            })
            .slice(0, 6)
        : [];

    const subjQ = d.subjectSearch.trim().toLowerCase();
    const filteredSubjects = state.matieres.filter(
      (m) => !subjQ || m.libelle.toLowerCase().includes(subjQ) || m.codemat.toLowerCase().includes(subjQ)
    );
    const selectedSubject = filteredSubjects.find((m) => m.codemat === d.codemat) || null;

    const recentNotes = state.notations.slice(0, 8);

    mainHtml = `
      <div class="page-head">
        <div>
          <h1>Ajouter une note par CIN &amp; Matière</h1>
          <p>Saisissez le CIN de l'étudiant et recherchez la matière pour attribuer une note sur 20.</p>
        </div>
        <button type="button" data-action="navigate" data-page="prof-notes" class="btn btn-secondary">Toutes les notes</button>
      </div>
      ${flashHtml}

      <div class="form-panel">
        <form id="addNoteCinForm" novalidate>
          <div class="form-section-head">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h10"/>
            </svg>
            <span>01. Identification de l'étudiant par CIN</span>
          </div>

          <div class="form-grid-2">
            <div class="field cin-lookup-wrap">
              <label for="cinLookupInput">CIN étudiant *</label>
              <input type="text" id="cinLookupInput" name="cin" data-action="note-cin-input" maxlength="20" autocomplete="off" required
                     value="${escapeHtml(d.cin)}" placeholder="Ex : 09841001 ou 09841005">
              ${
                cinSuggestions.length
                  ? `
                <div class="cin-suggestions" role="listbox" aria-label="Suggestions CIN">
                  ${cinSuggestions
                    .map(
                      (s) => `
                    <button type="button" data-action="pick-cin-student" data-cin="${escapeHtml(s.cin || '')}" class="cin-suggestion-item">
                      <span><strong>${escapeHtml(s.prenom)} ${escapeHtml(s.nom)}</strong><span class="cin-suggestion-meta"> · ${escapeHtml(s.classe || 'ISET')}</span></span>
                      <span class="cin-suggestion-code">${escapeHtml(s.cin || `#${s.numetu}`)}</span>
                    </button>
                  `
                    )
                    .join('')}
                </div>
              `
                  : ''
              }
            </div>

            <div class="field">
              <label for="cinStudentName">Nom et prénom (automatique)</label>
              <input type="text" id="cinStudentName" class="input-readonly" readonly
                     value="${matchedStudent ? escapeHtml(`${matchedStudent.prenom} ${matchedStudent.nom}`) : ''}"
                     placeholder="Chargé automatiquement après saisie du CIN">
              <div class="lookup-status ${matchedStudent ? 'lookup-status--ok' : cinClean && !cinSuggestions.length ? 'lookup-status--err' : ''}">
                ${
                  matchedStudent
                    ? `Étudiant trouvé · #${matchedStudent.numetu} · ${escapeHtml(matchedStudent.classe || 'ISET Djerba')}`
                    : cinClean && cinSuggestions.length
                      ? 'Sélectionnez un étudiant dans les suggestions ci-dessous.'
                      : cinClean
                        ? 'Aucun étudiant trouvé pour ce numéro CIN.'
                        : 'Exemples CIN : 09841001, 09841002, 09841003, 09841004, 09841005'
                }
              </div>
            </div>
          </div>

          <div class="form-section-head form-section-head--spaced">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>02. Matière &amp; Détails de l'évaluation</span>
          </div>

          <div class="form-grid-2">
            <div class="field">
              <label for="subjectSearchInput">Rechercher une matière</label>
              <input type="search" id="subjectSearchInput" data-action="note-subject-search" autocomplete="off"
                     value="${escapeHtml(d.subjectSearch)}" placeholder="Filtrer par nom ou code (ex : Statistique, STA)…">
            </div>

            <div class="field">
              <label for="cinMatiereSelect">Matière *</label>
              <select id="cinMatiereSelect" name="codemat" data-action="note-subject-select" required>
                <option value="">— Sélectionner une matière —</option>
                ${filteredSubjects
                  .map(
                    (m) =>
                      `<option value="${escapeHtml(m.codemat)}" ${d.codemat === m.codemat ? 'selected' : ''}>${escapeHtml(m.libelle)} (${escapeHtml(m.codemat)} · Coef. ${m.coef})</option>`
                  )
                  .join('')}
              </select>
            </div>

            <div class="field">
              <label for="cinTypeEval">Type d'évaluation *</label>
              <select id="cinTypeEval" name="type_eval" data-action="note-type-select" required>
                ${EVAL_TYPES.map(
                  (t) => `<option value="${t}" ${d.type_eval === t ? 'selected' : ''}>${t}</option>`
                ).join('')}
              </select>
            </div>

            <div class="field">
              <label for="cinCoefAuto">Coefficient (automatique)</label>
              <input type="text" id="cinCoefAuto" class="input-readonly" readonly
                     value="${selectedSubject ? escapeHtml(selectedSubject.coef) : ''}"
                     placeholder="Récupéré depuis la matière">
            </div>

            <div class="field">
              <label for="cinNoteVal">Note sur 20 *</label>
              <input type="number" id="cinNoteVal" name="note" data-action="note-val-input" min="0" max="20" step="0.25" required
                     value="${escapeHtml(d.note)}" placeholder="Ex : 16.50">
            </div>

            <div class="field">
              <label for="cinDateEval">Date de l'évaluation *</label>
              <input type="date" id="cinDateEval" name="date_eval" data-action="note-date-input" required
                     value="${escapeHtml(d.date_eval)}">
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Enregistrer la note</button>
            <button type="button" data-action="navigate" data-page="dashboard" class="btn btn-secondary">Annuler</button>
          </div>
        </form>
      </div>

      <h2 class="section-heading">Dernières notes enregistrées</h2>
      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>CIN &amp; Étudiant</th>
              <th>Matière</th>
              <th>Type</th>
              <th>Date</th>
              <th class="right">Note / 20</th>
            </tr>
          </thead>
          <tbody>
            ${
              recentNotes.length
                ? recentNotes
                    .map((n) => {
                      const et = etuMap.get(n.numetu);
                      const ep = epMap.get(n.numepreuve);
                      const mat = ep ? matMap.get(ep.codemat) : null;
                      return `
                        <tr>
                          <td data-label="Étudiant">
                            <strong>${escapeHtml(et ? `${et.prenom} ${et.nom}` : `#${n.numetu}`)}</strong>
                            <div class="cell-sub">CIN ${escapeHtml(et?.cin || '—')} · #${n.numetu}</div>
                          </td>
                          <td data-label="Matière"><span class="code-badge">${escapeHtml(ep?.codemat || '—')}</span>${escapeHtml(mat?.libelle || '')}</td>
                          <td data-label="Type"><span class="type-tag">${escapeHtml(ep?.type_eval || 'Examen')}</span></td>
                          <td data-label="Date">${formatDateFr(ep?.datepreuve)}</td>
                          <td data-label="Note / 20" class="right"><strong class="${n.note < 10 ? 'text-danger' : 'text-ok'}">${formatNote(n.note)} / 20</strong></td>
                        </tr>
                      `;
                    })
                    .join('')
                : '<tr><td colspan="5" class="empty-cell">Aucune note enregistrée.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `;
  }

  const detailModalHtml = state.viewingStudentId
    ? (() => {
        const et = state.etudiants.find((item) => item.numetu === state.viewingStudentId);
        if (!et) return '';
        return `
          <div class="modal-backdrop" data-action="close-student-detail">
            <div class="modal-card modal-card--left" role="dialog" aria-modal="true">
              <h3>${escapeHtml(et.prenom)} ${escapeHtml(et.nom)}</h3>
              <p style="margin-bottom:1rem;">N° d'inscription #${et.numetu} · ISET Djerba</p>
              <dl class="detail-grid">
                <div><dt>Numéro CIN</dt><dd>${escapeHtml(et.cin || '—')}</dd></div>
                <div><dt>Adresse e-mail</dt><dd>${escapeHtml(et.email || '—')}</dd></div>
                <div><dt>Téléphone</dt><dd>${escapeHtml(et.telephone || '—')}</dd></div>
                <div><dt>Date de naissance</dt><dd>${formatDateFr(et.datenaiss)}</dd></div>
                <div><dt>Sexe</dt><dd>${escapeHtml(et.sexe || '—')}</dd></div>
                <div><dt>Département</dt><dd>${escapeHtml(et.departement || '—')}</dd></div>
                <div><dt>Spécialité</dt><dd>${escapeHtml(et.specialite || '—')}</dd></div>
                <div><dt>Classe / Groupe</dt><dd>${escapeHtml(et.classe || '—')}</dd></div>
                <div><dt>Année universitaire</dt><dd>${escapeHtml(et.annee_univ || '—')}</dd></div>
              </dl>
              <div class="modal-btns">
                <button type="button" data-action="close-student-detail" class="btn btn-secondary">Fermer</button>
                <button type="button" data-action="preview-student" data-numetu="${et.numetu}" class="btn btn-primary">Voir le relevé</button>
              </div>
            </div>
          </div>
        `;
      })()
    : '';

  const modalHtml = state.pendingDeleteMatiere
    ? (() => {
        const target = state.matieres.find((m) => m.codemat === state.pendingDeleteMatiere);
        const linked = state.epreuves.filter((ep) => ep.codemat === state.pendingDeleteMatiere).length;
        return `
          <div class="modal-backdrop" data-action="cancel-delete-matiere">
            <div class="modal-card" role="dialog" aria-modal="true">
              <h3>Confirmer la suppression</h3>
              <p>
                Supprimer la matière « ${escapeHtml(target?.libelle || state.pendingDeleteMatiere)} » (${escapeHtml(state.pendingDeleteMatiere)}) ?
                ${linked > 0 ? `Attention : ${linked} épreuve(s) liée(s) seront aussi supprimées.` : ''}
              </p>
              <div class="modal-btns">
                <button type="button" data-action="cancel-delete-matiere" class="btn btn-secondary">Annuler</button>
                <button type="button" data-action="confirm-delete-matiere" class="btn btn-danger-solid">Supprimer</button>
              </div>
            </div>
          </div>
        `;
      })()
    : '';

  const topAction = `<button type="button" data-action="navigate" data-page="prof-notes" class="btn btn-sm btn-primary">Saisir des notes</button>`;
  return renderPortalLayout(state, title, sidebarHtml, mainHtml + detailModalHtml + modalHtml, topAction);
}

export function renderStudentPortal(state) {
  const isProfPreview = state.session?.role === 'prof';
  const targetId = isProfPreview ? state.previewStudentId : state.session?.numetu || state.etudiants[0].numetu;
  const student = state.etudiants.find((e) => e.numetu === targetId) || state.etudiants[0];
  const transcript = computeStudentTranscript(student.numetu, state.matieres, state.epreuves, state.notations);
  const isProfilePage = !isProfPreview && state.sitePage === 'student-profile';
  const isIncomplete = !student.profil_complete || !student.email || !student.telephone || !student.datenaiss;

  const sidebarHtml = `
    <div>
      <div class="nav-section-label">Mon espace</div>
      <ul class="nav-list">
        <li><button type="button" data-action="open-student-notes" class="nav-item-btn ${!isProfilePage && state.studentSubjectFilter === 'ALL' ? 'active' : ''}">Relevé complet</button></li>
        ${
          !isProfPreview
            ? `<li><button type="button" data-action="open-student-profile" class="nav-item-btn ${isProfilePage ? 'active' : ''}">Mon profil ${isIncomplete ? '<span class="code-badge" style="margin:0;font-size:0.65rem;">À compléter</span>' : ''}</button></li>`
            : '<li><button type="button" data-action="navigate" data-page="prof-notes" class="nav-item-btn">&larr; Retour Professeur</button></li>'
        }
      </ul>
    </div>
    <div>
      <div class="nav-section-label">Par matière</div>
      <ul class="nav-list">
        ${transcript.subjects
          .map(
            (row) => `
          <li>
            <button type="button" data-action="set-student-filter" data-matiere="${escapeHtml(row.matiere.codemat)}" class="nav-item-btn ${!isProfilePage && state.studentSubjectFilter === row.matiere.codemat ? 'active' : ''}">
              <span>${escapeHtml(row.matiere.libelle)}</span>
              <span class="tabular-nums" style="font-size:0.76rem;opacity:0.85;">${row.average !== null ? formatNote(row.average) : '—'}</span>
            </button>
          </li>
        `
          )
          .join('')}
      </ul>
    </div>
  `;

  if (isProfilePage) {
    const initials = `${(student.prenom || 'E')[0] || 'E'}${(student.nom || 'T')[0] || 'T'}`.toUpperCase();
    const editMode = state.profileEditMode || isIncomplete;
    const d = state.profileDraft || student;
    const previewPhoto = editMode ? d.photo : student.photo;
    const flashHtml = state.flash
      ? `<div class="alert ${state.flash.type === 'err' ? 'alert-err' : 'alert-ok'}">${escapeHtml(state.flash.text)}</div>`
      : '';

    const cinLocked = Boolean(student.cin);
    const depLocked = Boolean(student.departement);
    const specLocked = Boolean(student.specialite);
    const clsLocked = Boolean(student.classe);
    const anLocked = Boolean(student.annee_univ);

    const profileMainHtml = `
      <div class="page-head">
        <div>
          <h1>Mon profil étudiant</h1>
          <p>Consultez et personnalisez vos informations personnelles sur NOTES DB – ISET Djerba.</p>
        </div>
        <div class="actions-row">
          <button type="button" data-action="open-student-notes" class="btn btn-secondary">Mon relevé de notes</button>
          ${
            !editMode
              ? '<button type="button" data-action="toggle-profile-edit" data-mode="edit" class="btn btn-primary">Modifier mon profil</button>'
              : '<button type="button" data-action="toggle-profile-edit" data-mode="view" class="btn btn-secondary">Voir mon profil</button>'
          }
        </div>
      </div>

      ${
        isIncomplete
          ? `
        <div class="profile-invite" role="status">
          <div>
            <strong>Bienvenue ! Complétez votre profil étudiant</strong>
            <p>Ajoutez votre photo de profil et vérifiez vos coordonnées personnelles pour finaliser votre espace ISET Djerba.</p>
          </div>
        </div>
      `
          : ''
      }

      ${flashHtml}

      <section class="profile-hero-card">
        <div class="profile-hero-main">
          <div class="profile-avatar-frame">
            ${
              student.photo
                ? `<img src="${escapeHtml(student.photo)}" alt="Photo de ${escapeHtml(student.prenom)}" class="profile-avatar-img">`
                : `<span class="profile-avatar-initials">${escapeHtml(initials)}</span>`
            }
          </div>
          <div class="profile-hero-info">
            <div class="profile-hero-top">
              <h2>${escapeHtml(student.prenom)} ${escapeHtml(student.nom)}</h2>
              <span class="profile-status-tag ${isIncomplete ? 'profile-status-tag--warn' : 'profile-status-tag--ok'}">
                ${isIncomplete ? 'Profil à compléter' : 'Profil vérifié'}
              </span>
            </div>
            <div class="profile-hero-meta">
              <span>N° d'inscription <strong>#${student.numetu}</strong></span>
              <span>&middot;</span>
              <span>CIN <strong>${escapeHtml(student.cin || 'Non renseigné')}</strong></span>
              ${student.classe ? `<span>&middot;</span><span><strong>${escapeHtml(student.classe)}</strong></span>` : ''}
            </div>
            ${
              student.departement || student.specialite
                ? `<p class="profile-hero-sub">${escapeHtml(student.departement || '')}${student.departement && student.specialite ? ' — ' : ''}${escapeHtml(student.specialite || '')}</p>`
                : ''
            }
          </div>
        </div>
        ${
          !editMode
            ? '<button type="button" data-action="toggle-profile-edit" data-mode="edit" class="btn btn-primary">Modifier mon profil</button>'
            : ''
        }
      </section>

      ${
        !editMode
          ? `
        <div class="profile-cards-grid">
          <article class="profile-info-card">
            <div class="form-section-head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Informations personnelles</span>
            </div>
            <dl class="profile-dl">
              <div><dt>Nom</dt><dd>${escapeHtml(student.nom || '—')}</dd></div>
              <div><dt>Prénom</dt><dd>${escapeHtml(student.prenom || '—')}</dd></div>
              <div><dt>CIN</dt><dd>${escapeHtml(student.cin || '—')}</dd></div>
              <div><dt>Numéro d'inscription</dt><dd>#${student.numetu}</dd></div>
              <div><dt>Adresse e-mail</dt><dd>${escapeHtml(student.email || '—')}</dd></div>
              <div><dt>Téléphone</dt><dd>${escapeHtml(student.telephone || '—')}</dd></div>
              <div><dt>Date de naissance</dt><dd>${formatDateFr(student.datenaiss)}</dd></div>
              <div><dt>Ville</dt><dd>${escapeHtml(student.ville || '—')}</dd></div>
            </dl>
          </article>

          <article class="profile-info-card">
            <div class="form-section-head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <span>Informations universitaires</span>
            </div>
            <dl class="profile-dl">
              <div><dt>Établissement</dt><dd>ISET Djerba</dd></div>
              <div><dt>Département</dt><dd>${escapeHtml(student.departement || '—')}</dd></div>
              <div><dt>Spécialité</dt><dd>${escapeHtml(student.specialite || '—')}</dd></div>
              <div><dt>Classe / Groupe</dt><dd>${escapeHtml(student.classe || '—')}</dd></div>
              <div><dt>Année universitaire</dt><dd>${escapeHtml(student.annee_univ || '—')}</dd></div>
            </dl>
            <p class="profile-lock-note">
              Le CIN, le numéro d'inscription, les notes et les données administratives sont protégés par l'administration.
            </p>
          </article>
        </div>
      `
          : `
        <div class="form-panel">
          <form id="studentProfilePreviewForm" novalidate>
            <div class="form-section-head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
              </svg>
              <span>01. Photo de profil</span>
            </div>

            <div class="photo-upload-box">
              <div class="profile-avatar-frame profile-avatar-frame--lg">
                ${
                  previewPhoto
                    ? `<img src="${escapeHtml(previewPhoto)}" alt="Aperçu photo" class="profile-avatar-img">`
                    : `<span class="profile-avatar-initials">${escapeHtml(initials)}</span>`
                }
              </div>
              <div class="photo-upload-controls">
                <div class="photo-upload-actions">
                  <label for="previewPhotoInput" class="btn btn-sm btn-secondary">Choisir une photo</label>
                  <input type="file" id="previewPhotoInput" data-action="profile-photo-file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" class="sr-only">
                  ${
                    previewPhoto
                      ? '<button type="button" data-action="remove-profile-photo" class="btn btn-sm btn-danger">Supprimer la photo</button>'
                      : ''
                  }
                </div>
                <p class="photo-upload-hint">Formats acceptés : JPG, JPEG ou PNG · Taille maximale : 2 Mo.</p>
                ${state.profilePhotoError ? `<div class="photo-error">${escapeHtml(state.profilePhotoError)}</div>` : ''}
              </div>
            </div>

            <div class="form-section-head form-section-head--spaced">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span>02. Informations personnelles</span>
            </div>

            <div class="form-grid-2">
              <div class="field">
                <label for="spNumetu">Numéro d'inscription (verrouillé)</label>
                <input type="text" id="spNumetu" class="input-readonly" readonly value="#${student.numetu}">
              </div>
              <div class="field">
                <label for="spCin">CIN ${cinLocked ? '(verrouillé)' : ''}</label>
                <input type="text" id="spCin" name="cin" maxlength="20" class="${cinLocked ? 'input-readonly' : ''}" ${cinLocked ? 'readonly' : ''} value="${escapeHtml(d.cin || '')}" placeholder="Ex : 09841005">
              </div>
              <div class="field">
                <label for="spNom">Nom *</label>
                <input type="text" id="spNom" name="nom" maxlength="100" required value="${escapeHtml(d.nom || '')}">
              </div>
              <div class="field">
                <label for="spPrenom">Prénom *</label>
                <input type="text" id="spPrenom" name="prenom" maxlength="100" required value="${escapeHtml(d.prenom || '')}">
              </div>
              <div class="field">
                <label for="spEmail">Adresse e-mail *</label>
                <input type="email" id="spEmail" name="email" maxlength="150" required value="${escapeHtml(d.email || '')}">
              </div>
              <div class="field">
                <label for="spTel">Numéro de téléphone *</label>
                <input type="tel" id="spTel" name="telephone" maxlength="30" required value="${escapeHtml(d.telephone || '')}">
              </div>
              <div class="field">
                <label for="spDate">Date de naissance *</label>
                <input type="date" id="spDate" name="datenaiss" required value="${escapeHtml(d.datenaiss || '')}">
              </div>
              <div class="field">
                <label for="spVille">Ville</label>
                <input type="text" id="spVille" name="ville" maxlength="100" value="${escapeHtml(d.ville || '')}">
              </div>
            </div>

            <div class="form-section-head form-section-head--spaced">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              <span>03. Informations universitaires (administration)</span>
            </div>

            <div class="form-grid-2">
              <div class="field">
                <label for="spDep">Département ${depLocked ? '(verrouillé)' : ''}</label>
                ${
                  depLocked
                    ? `<input type="text" id="spDep" class="input-readonly" readonly value="${escapeHtml(student.departement)}">`
                    : `<select id="spDep" name="departement"><option value="">— Choisir —</option>${ISET_DEPARTEMENTS.map((dep) => `<option value="${escapeHtml(dep)}" ${d.departement === dep ? 'selected' : ''}>${escapeHtml(dep)}</option>`).join('')}</select>`
                }
              </div>
              <div class="field">
                <label for="spSpec">Spécialité ${specLocked ? '(verrouillé)' : ''}</label>
                ${
                  specLocked
                    ? `<input type="text" id="spSpec" class="input-readonly" readonly value="${escapeHtml(student.specialite)}">`
                    : `<select id="spSpec" name="specialite"><option value="">— Choisir —</option>${ISET_SPECIALITES.map((sp) => `<option value="${escapeHtml(sp)}" ${d.specialite === sp ? 'selected' : ''}>${escapeHtml(sp)}</option>`).join('')}</select>`
                }
              </div>
              <div class="field">
                <label for="spClasse">Classe / Groupe ${clsLocked ? '(verrouillé)' : ''}</label>
                <input type="text" id="spClasse" name="classe" maxlength="50" class="${clsLocked ? 'input-readonly' : ''}" ${clsLocked ? 'readonly' : ''} value="${escapeHtml(d.classe || '')}">
              </div>
              <div class="field">
                <label for="spAnnee">Année universitaire ${anLocked ? '(verrouillé)' : ''}</label>
                ${
                  anLocked
                    ? `<input type="text" id="spAnnee" class="input-readonly" readonly value="${escapeHtml(student.annee_univ)}">`
                    : `<select id="spAnnee" name="annee_univ"><option value="">— Choisir —</option>${ISET_ANNEES.map((an) => `<option value="${escapeHtml(an)}" ${d.annee_univ === an ? 'selected' : ''}>${escapeHtml(an)}</option>`).join('')}</select>`
                }
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Enregistrer les modifications</button>
              <button type="button" data-action="toggle-profile-edit" data-mode="view" class="btn btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      `
      }
    `;

    const topAction = `<button type="button" data-action="open-student-notes" class="btn btn-sm btn-secondary">Mon relevé</button>`;
    return renderPortalLayout(state, 'Mon profil', sidebarHtml, profileMainHtml, topAction);
  }

  const visibleSubjects =
    state.studentSubjectFilter === 'ALL'
      ? transcript.subjects
      : transcript.subjects.filter((s) => s.matiere.codemat === state.studentSubjectFilter);

  const mainHtml = `
    <div class="page-head">
      <div>
        <h1>${escapeHtml(student.prenom)} ${escapeHtml(student.nom)}</h1>
        <p>
          Relevé officiel ISET Djerba ·
          N° Étudiant #${student.numetu}${student.classe ? ` · ${escapeHtml(student.classe)}` : ''}${student.ville ? ` · ${escapeHtml(student.ville)}` : ''}
        </p>
      </div>
      <div class="actions-row no-print">
        ${
          isProfPreview
            ? `
          <select data-action="switch-student" class="search-input" style="max-width:240px;min-height:40px;" aria-label="Choisir un étudiant">
            ${state.etudiants
              .map(
                (et) =>
                  `<option value="${et.numetu}" ${et.numetu === student.numetu ? 'selected' : ''}>#${et.numetu} — ${escapeHtml(et.prenom)} ${escapeHtml(et.nom)}</option>`
              )
              .join('')}
          </select>
        `
            : ''
        }
        <button type="button" data-action="print-transcript" class="btn btn-sm btn-secondary">Imprimer le relevé</button>
        ${
          !isProfPreview
            ? '<button type="button" data-action="open-student-profile" class="btn btn-sm btn-primary">Mon profil</button>'
            : ''
        }
      </div>
    </div>

    ${
      !isProfPreview && isIncomplete
        ? `
      <div class="profile-invite no-print" role="status">
        <div>
          <strong>Votre profil étudiant n'est pas encore complété</strong>
          <p>Ajoutez votre photo de profil et vérifiez vos informations personnelles.</p>
        </div>
        <button type="button" data-action="open-student-profile" data-edit="1" class="btn btn-sm btn-primary">Compléter mon profil</button>
      </div>
    `
        : ''
    }

    <div class="kpi-grid">
      <div class="kpi-card">
        <h3>Moyenne générale</h3>
        <div class="kpi-value tabular-nums ${transcript.weightedAverage !== null && transcript.weightedAverage < 10 ? 'text-danger' : ''}">
          ${transcript.weightedAverage !== null ? `${formatNote(transcript.weightedAverage)} / 20` : '—'}
        </div>
        <p class="${transcript.weightedAverage !== null && transcript.weightedAverage >= 10 ? 'text-ok' : transcript.weightedAverage !== null ? 'text-danger' : 'muted'}" style="font-size:0.84rem;font-weight:600;">
          ${escapeHtml(transcript.mention)}
        </p>
      </div>
      <div class="kpi-card">
        <h3>Matières</h3>
        <div class="kpi-value text-navy tabular-nums">${transcript.subjects.length}</div>
        <p class="muted" style="font-size:0.84rem;">${transcript.validatedSubjects} matière(s) validée(s)</p>
      </div>
      <div class="kpi-card">
        <h3>Épreuves notées</h3>
        <div class="kpi-value text-navy tabular-nums">${transcript.gradedExamsCount} / ${transcript.totalExamsCount}</div>
        <p class="muted" style="font-size:0.84rem;">Moyenne pondérée par coefficients</p>
      </div>
    </div>

    <div class="filter-strip no-print">
      <button type="button" data-action="set-student-filter" data-matiere="ALL" class="btn btn-xs ${state.studentSubjectFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}">Toutes les matières</button>
      ${transcript.subjects
        .map(
          (row) => `
        <button type="button" data-action="set-student-filter" data-matiere="${escapeHtml(row.matiere.codemat)}" class="btn btn-xs ${state.studentSubjectFilter === row.matiere.codemat ? 'btn-primary' : 'btn-secondary'}">
          ${escapeHtml(row.matiere.codemat)} · ${escapeHtml(row.matiere.libelle)}
        </button>
      `
        )
        .join('')}
    </div>

    ${visibleSubjects
      .map(
        (bloc) => `
      <h2 class="section-heading">
        <span>
          <span class="code-badge">${escapeHtml(bloc.matiere.codemat)}</span>
          ${escapeHtml(bloc.matiere.libelle)}
          <span class="muted" style="font-size:0.82rem;font-weight:500;">(Coef. ${bloc.matiere.coef})</span>
        </span>
        <span class="tabular-nums ${bloc.average !== null && bloc.average < 10 ? 'text-danger' : 'text-blue'}" style="font-size:0.9rem;">
          Moyenne : ${bloc.average !== null ? `${formatNote(bloc.average)} / 20` : 'En attente'}
        </span>
      </h2>
      <div class="table-card">
        <table class="data-table">
          <thead><tr><th>Épreuve</th><th>Date</th><th>Lieu / salle</th><th>Note / 20</th></tr></thead>
          <tbody>
            ${
              bloc.exams.length
                ? bloc.exams
                    .map(
                      (ex) => `
                  <tr>
                    <td data-label="Épreuve"><span class="type-tag">${escapeHtml(ex.epreuve.type_eval || 'Examen')}</span><strong>#${ex.epreuve.numepreuve}</strong></td>
                    <td data-label="Date">${formatDateFr(ex.epreuve.datepreuve)}</td>
                    <td data-label="Lieu / salle">${escapeHtml(ex.epreuve.Lieu)}</td>
                    <td data-label="Note / 20">
                      ${
                        ex.note !== null
                          ? `<strong class="${ex.note < 10 ? 'text-danger' : 'text-ok'}">${formatNote(ex.note)} / 20</strong>`
                          : '<span class="muted">Non notée</span>'
                      }
                    </td>
                  </tr>
                `
                    )
                    .join('')
                : '<tr><td colspan="4" class="empty-cell">Aucune épreuve dans cette matière.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    `
      )
      .join('')}
  `;

  const topAction = isProfPreview
    ? `<button type="button" data-action="navigate" data-page="prof-notes" class="btn btn-sm btn-secondary">Retour Professeur</button>`
    : `<button type="button" data-action="open-student-profile" class="btn btn-sm btn-secondary">Mon profil</button>`;
  return renderPortalLayout(state, 'Relevé de notes', sidebarHtml, mainHtml, topAction);
}

export function renderCodeExplorerView(state) {
  const visibleFiles =
    state.codeCategory === 'all'
      ? PHP_PROJECT_FILES
      : PHP_PROJECT_FILES.filter((f) => f.category === state.codeCategory);

  const activeFile =
    visibleFiles.find((f) => f.filename === state.selectedCodeFile) ||
    visibleFiles[0] ||
    PHP_PROJECT_FILES[0];

  return `
    <div class="explorer-wrap">
      <div class="explorer-head">
        <div>
          <h1>Archive 100 % HTML5 · CSS3 · Vanilla JS · PHP · MySQL</h1>
          <p>
            <strong>Zéro TypeScript, zéro React</strong> : les
            <strong class="tabular-nums">${PHP_PROJECT_FILES.length} fichiers</strong> ci-dessous sont prêts
            à être extraits dans <span class="mono">C:\\xampp\\htdocs\\iset_notes\\</span>.
          </p>
        </div>
        <button type="button" data-action="download-zip" class="btn ${state.justDownloaded ? 'btn-success' : 'btn-primary'}">
          ${state.justDownloaded ? 'Archive téléchargée (.zip)' : `Télécharger ${XAMPP_ZIP_FILENAME}`}
        </button>
      </div>

      <div class="steps-grid">
        <div class="step-card">
          <h2>01. Extraire dans XAMPP htdocs</h2>
          <p>Décompressez le ZIP dans <span class="mono">C:\\xampp\\htdocs\\iset_notes\\</span> puis démarrez Apache et MySQL dans XAMPP Control Panel.</p>
        </div>
        <div class="step-card">
          <h2>02. Importer notes.sql (root sans mot de passe)</h2>
          <p>Ouvrez <span class="mono">http://localhost/phpmyadmin</span> et importez <span class="mono">notes.sql</span> pour créer toutes les tables et comptes.</p>
        </div>
        <div class="step-card">
          <h2>03. Logo ISET Djerba &amp; Responsive</h2>
          <p>Le logo <span class="mono">img/logo.svg</span> est inclus avec détection automatique de <span class="mono">img/logo.png</span>, et tous les tableaux s'adaptent sur mobile.</p>
        </div>
      </div>

      <div class="category-tabs">
        ${CODE_CATEGORIES.map(
          (cat) => `
          <button type="button" data-action="set-code-category" data-category="${cat.id}" class="cat-btn ${state.codeCategory === cat.id ? 'active' : ''}">
            ${escapeHtml(cat.label)}
          </button>
        `
        ).join('')}
      </div>

      <div class="explorer-grid">
        <aside class="file-list-card">
          <div class="file-list-head">Fichiers (${visibleFiles.length})</div>
          <div class="file-list-scroll">
            ${visibleFiles
              .map((file) => {
                const isSelected = file.filename === activeFile.filename;
                return `
                  <button type="button" data-action="select-code-file" data-filename="${escapeHtml(file.filename)}" class="file-row-btn ${isSelected ? 'active' : ''}">
                    <div class="file-row-top">
                      <span class="file-name">${escapeHtml(file.filename)}</span>
                      <span class="file-status ${file.modified ? 'file-status--mod' : ''}">${file.modified ? 'Amélioré' : 'Base'}</span>
                    </div>
                    <p class="file-desc">${escapeHtml(file.summary)}</p>
                  </button>
                `;
              })
              .join('')}
          </div>
        </aside>

        <section class="code-viewer">
          <div class="code-viewer-head">
            <div>
              <div class="mono" style="font-size:0.9rem;font-weight:600;color:#ffffff;">${escapeHtml(activeFile.filename)}</div>
              <div style="font-size:0.76rem;color:#94a3b8;margin-top:2px;">${escapeHtml(activeFile.summary)}</div>
            </div>
            <div class="actions-row">
              <button type="button" data-action="copy-code" class="btn btn-sm btn-secondary">
                ${state.copiedFile === activeFile.filename ? 'Copié' : 'Copier'}
              </button>
              <button type="button" data-action="download-single-file" data-filename="${escapeHtml(activeFile.filename)}" class="btn btn-sm btn-primary">
                Télécharger
              </button>
            </div>
          </div>
          <pre class="code-viewer-pre"><code>${escapeHtml(activeFile.content)}</code></pre>
        </section>
      </div>
    </div>
  `;
}
