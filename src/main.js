import {
  INITIAL_EPREUVES,
  INITIAL_ETUDIANTS,
  INITIAL_MATIERES,
  INITIAL_NOTATIONS,
} from './data/initialData.js';
import { PHP_PROJECT_FILES } from './data/phpProjectFiles.js';
import { createZipBlob, triggerFileDownload } from './utils/zipExport.js';
import {
  XAMPP_ZIP_FILENAME,
  renderCodeExplorerView,
  renderDownloadBanner,
  renderLandingView,
  renderLoginView,
  renderProfessorPortal,
  renderStudioBar,
  renderStudentPortal,
} from './ui/views.js';

const appEl = document.getElementById('app');

const state = {
  workspaceTab: 'preview',
  viewportMode: 'desktop',
  showDownloadBanner: true,
  justDownloaded: false,
  drawerOpen: false,

  session: null,
  sitePage: 'landing',
  previewStudentId: INITIAL_ETUDIANTS[0].numetu,
  studentSubjectFilter: 'ALL',

  loginDraft: '',
  passwordDraft: '',
  showPassword: false,
  loginError: '',

  matieres: INITIAL_MATIERES.map((m) => ({ ...m })),
  epreuves: INITIAL_EPREUVES.map((e) => ({ ...e })),
  etudiants: INITIAL_ETUDIANTS.map((et) => ({ ...et })),
  notations: INITIAL_NOTATIONS.map((n) => ({ ...n })),

  searchQuery: '',
  flash: null,
  gradeEdit: { editing: false, numetu: '', numepreuve: '', note: '' },
  pendingDeleteMatiere: null,
  viewingStudentId: null,
  editingStudentId: null,
  studentDraft: {
    numetu: '',
    cin: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    datenaiss: '',
    sexe: '',
    departement: '',
    specialite: '',
    classe: '',
    annee_univ: '2025-2026',
  },
  noteCinDraft: {
    cin: '',
    subjectSearch: '',
    codemat: '',
    type_eval: 'DS',
    note: '',
    date_eval: new Date().toISOString().slice(0, 10),
  },
  cinSuggestionsOpen: false,
  profileEditMode: false,
  profileDraft: null,
  profilePhotoError: '',

  codeCategory: 'all',
  selectedCodeFile: 'profilEtudiant.php',
  copiedFile: '',
};

let downloadTimer = null;
let copyTimer = null;

function render() {
  if (!appEl) return;

  let bodyContent = '';
  if (state.workspaceTab === 'code') {
    bodyContent = renderCodeExplorerView(state);
  } else {
    const siteHtml = renderCurrentSitePage();
    if (state.viewportMode === 'mobile') {
      bodyContent = `
        <div class="mobile-stage">
          <div class="mobile-device">
            <div class="mobile-device-scroll">${siteHtml}</div>
          </div>
        </div>
      `;
    } else {
      bodyContent = `<div class="desktop-stage">${siteHtml}</div>`;
    }
  }

  appEl.innerHTML = `
    <div class="app-root">
      ${renderStudioBar(state)}
      ${renderDownloadBanner(state)}
      ${bodyContent}
    </div>
  `;
}

function renderCurrentSitePage() {
  if (state.sitePage === 'landing') return renderLandingView(state);
  if (state.sitePage === 'login' || !state.session) return renderLoginView(state);
  if (state.session.role === 'etudiant' || state.sitePage === 'student-notes') {
    return renderStudentPortal(state);
  }
  return renderProfessorPortal(state);
}

function navigateTo(page) {
  state.drawerOpen = false;
  state.flash = null;
  state.searchQuery = '';
  if (page === 'add-etudiant') {
    state.editingStudentId = null;
    state.studentDraft = {
      numetu: '',
      cin: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      datenaiss: '',
      sexe: '',
      departement: '',
      specialite: '',
      classe: '',
      annee_univ: '2025-2026',
    };
  }

  if (page !== 'landing' && page !== 'login' && !state.session) {
    state.sitePage = 'login';
    render();
    return;
  }
  if (state.session?.role === 'etudiant' && page !== 'landing' && page !== 'login') {
    state.sitePage = page === 'student-profile' ? 'student-profile' : 'student-notes';
    render();
    return;
  }
  state.sitePage = page;
  render();
}

function openStudentProfile(editMode = false) {
  if (state.session?.role !== 'etudiant') return;
  const student = state.etudiants.find((et) => et.numetu === state.session.numetu);
  if (!student) return;
  state.drawerOpen = false;
  state.flash = null;
  state.profilePhotoError = '';
  state.profileDraft = { ...student };
  state.profileEditMode = Boolean(editMode || !student.profil_complete);
  state.sitePage = 'student-profile';
  render();
}

function performLogin(loginRaw, passwordRaw) {
  const login = String(loginRaw || '').trim().toLowerCase();
  const password = String(passwordRaw || '');

  if (!login || !password) {
    state.loginError = 'Veuillez saisir votre identifiant et votre mot de passe.';
    render();
    return;
  }

  if ((login === 'prof' && password === 'prof123') || (login === 'admin' && password === 'admin123')) {
    state.session = {
      login,
      role: 'prof',
      displayName: login === 'admin' ? 'Administrateur' : 'Professeur ISET',
    };
    state.loginError = '';
    state.sitePage = 'dashboard';
    render();
    return;
  }

  const matchedStudent = state.etudiants.find((et) => et.login === login);
  if (matchedStudent && password === 'etu123') {
    state.session = {
      login: matchedStudent.login,
      role: 'etudiant',
      displayName: `${matchedStudent.prenom} ${matchedStudent.nom}`,
      numetu: matchedStudent.numetu,
    };
    state.loginError = '';
    state.studentSubjectFilter = 'ALL';
    if (!matchedStudent.profil_complete) {
      openStudentProfile(true);
      return;
    }
    state.sitePage = 'student-notes';
    render();
    return;
  }

  state.loginError = 'Identifiant ou mot de passe incorrect. (Ex : prof / prof123 ou youssef / etu123)';
  render();
}

function downloadFullXamppZip() {
  const blob = createZipBlob(
    PHP_PROJECT_FILES.map((file) => ({
      name: file.filename,
      content: file.content,
    }))
  );
  triggerFileDownload(XAMPP_ZIP_FILENAME, blob);
  state.justDownloaded = true;
  render();

  if (downloadTimer) window.clearTimeout(downloadTimer);
  downloadTimer = window.setTimeout(() => {
    state.justDownloaded = false;
    render();
  }, 3400);
}

appEl?.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;

  if (action === 'set-tab') {
    state.workspaceTab = target.dataset.tab === 'code' ? 'code' : 'preview';
    render();
  } else if (action === 'set-viewport') {
    state.viewportMode = target.dataset.viewport === 'mobile' ? 'mobile' : 'desktop';
    state.drawerOpen = false;
    render();
  } else if (action === 'download-zip') {
    downloadFullXamppZip();
  } else if (action === 'dismiss-banner') {
    state.showDownloadBanner = false;
    render();
  } else if (action === 'navigate') {
    navigateTo(target.dataset.page);
  } else if (action === 'quick-login') {
    const login = target.dataset.login;
    const pwd = login === 'prof' || login === 'admin' ? `${login}123` : 'etu123';
    state.workspaceTab = 'preview';
    performLogin(login, pwd);
  } else if (action === 'toggle-password') {
    state.showPassword = !state.showPassword;
    render();
  } else if (action === 'open-drawer') {
    state.drawerOpen = true;
    render();
  } else if (action === 'close-drawer') {
    state.drawerOpen = false;
    render();
  } else if (action === 'logout') {
    state.session = null;
    state.drawerOpen = false;
    state.sitePage = 'login';
    state.loginError = '';
    render();
  } else if (action === 'edit-student') {
    const numetu = Number(target.dataset.numetu);
    const existing = state.etudiants.find((et) => et.numetu === numetu);
    if (existing) {
      state.editingStudentId = numetu;
      state.studentDraft = {
        numetu: String(existing.numetu),
        cin: existing.cin || '',
        nom: existing.nom || '',
        prenom: existing.prenom || '',
        email: existing.email || '',
        telephone: existing.telephone || '',
        datenaiss: existing.datenaiss || '',
        sexe: existing.sexe || '',
        departement: existing.departement || '',
        specialite: existing.specialite || '',
        classe: existing.classe || '',
        annee_univ: existing.annee_univ || '2025-2026',
      };
      state.flash = null;
      state.sitePage = 'add-etudiant';
      render();
    }
  } else if (action === 'preview-student') {
    state.viewingStudentId = null;
    state.previewStudentId = Number(target.dataset.numetu);
    state.studentSubjectFilter = 'ALL';
    state.sitePage = 'student-notes';
    render();
  } else if (action === 'view-student-detail') {
    state.viewingStudentId = Number(target.dataset.numetu);
    render();
  } else if (action === 'close-student-detail') {
    if (event.target === target || target.tagName === 'BUTTON') {
      state.viewingStudentId = null;
      render();
    }
  } else if (action === 'quick-note-cin') {
    state.noteCinDraft.cin = target.dataset.cin || '';
    state.noteCinDraft.codemat = '';
    state.cinSuggestionsOpen = false;
    state.flash = null;
    state.sitePage = 'add-note-cin';
    render();
  } else if (action === 'pick-cin-student') {
    state.noteCinDraft.cin = target.dataset.cin || '';
    state.noteCinDraft.codemat = '';
    state.cinSuggestionsOpen = false;
    render();
  } else if (action === 'set-student-filter') {
    state.studentSubjectFilter = target.dataset.matiere || 'ALL';
    state.sitePage = 'student-notes';
    state.drawerOpen = false;
    render();
  } else if (action === 'open-student-notes') {
    state.studentSubjectFilter = 'ALL';
    state.sitePage = 'student-notes';
    state.drawerOpen = false;
    state.flash = null;
    render();
  } else if (action === 'open-student-profile') {
    openStudentProfile(target.dataset.edit === '1');
  } else if (action === 'toggle-profile-edit') {
    if (state.session?.role !== 'etudiant') return;
    const student = state.etudiants.find((et) => et.numetu === state.session.numetu);
    if (!student) return;
    const mode = target.dataset.mode === 'edit';
    state.profileEditMode = mode;
    state.profileDraft = { ...student };
    state.profilePhotoError = '';
    state.flash = null;
    render();
  } else if (action === 'remove-profile-photo') {
    if (state.profileDraft) {
      state.profileDraft.photo = '';
      state.profilePhotoError = '';
      render();
    }
  } else if (action === 'print-transcript') {
    window.print();
  } else if (action === 'edit-grade') {
    const numetu = Number(target.dataset.numetu);
    const numepreuve = Number(target.dataset.numepreuve);
    const existing = state.notations.find((n) => n.numetu === numetu && n.numepreuve === numepreuve);
    state.gradeEdit = {
      editing: true,
      numetu: String(numetu),
      numepreuve: String(numepreuve),
      note: existing ? String(existing.note) : '',
    };
    state.flash = null;
    render();
  } else if (action === 'cancel-edit-grade') {
    state.gradeEdit = { editing: false, numetu: '', numepreuve: '', note: '' };
    render();
  } else if (action === 'delete-grade') {
    const numetu = Number(target.dataset.numetu);
    const numepreuve = Number(target.dataset.numepreuve);
    state.notations = state.notations.filter(
      (n) => !(n.numetu === numetu && n.numepreuve === numepreuve)
    );
    state.flash = { type: 'ok', text: 'La note a été supprimée.' };
    render();
  } else if (action === 'ask-delete-matiere') {
    state.pendingDeleteMatiere = target.dataset.code || null;
    render();
  } else if (action === 'cancel-delete-matiere') {
    if (event.target === target || target.tagName === 'BUTTON') {
      state.pendingDeleteMatiere = null;
      render();
    }
  } else if (action === 'confirm-delete-matiere') {
    const code = state.pendingDeleteMatiere;
    if (code) {
      const removedExams = new Set(
        state.epreuves.filter((ep) => ep.codemat === code).map((ep) => ep.numepreuve)
      );
      state.matieres = state.matieres.filter((m) => m.codemat !== code);
      state.epreuves = state.epreuves.filter((ep) => ep.codemat !== code);
      state.notations = state.notations.filter((n) => !removedExams.has(n.numepreuve));
      state.flash = { type: 'ok', text: `La matière ${code} a été supprimée.` };
    }
    state.pendingDeleteMatiere = null;
    render();
  } else if (action === 'set-code-category') {
    state.codeCategory = target.dataset.category || 'all';
    const first =
      state.codeCategory === 'all'
        ? PHP_PROJECT_FILES[0]
        : PHP_PROJECT_FILES.find((f) => f.category === state.codeCategory);
    if (first) state.selectedCodeFile = first.filename;
    render();
  } else if (action === 'select-code-file') {
    state.selectedCodeFile = target.dataset.filename || 'header.php';
    render();
  } else if (action === 'copy-code') {
    const file = PHP_PROJECT_FILES.find((f) => f.filename === state.selectedCodeFile);
    if (!file) return;
    const markCopied = () => {
      state.copiedFile = file.filename;
      render();
      if (copyTimer) window.clearTimeout(copyTimer);
      copyTimer = window.setTimeout(() => {
        state.copiedFile = '';
        render();
      }, 1800);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(file.content).then(markCopied).catch(markCopied);
    } else {
      markCopied();
    }
  } else if (action === 'download-single-file') {
    const file = PHP_PROJECT_FILES.find((f) => f.filename === target.dataset.filename);
    if (file) triggerFileDownload(file.filename, file.content);
  }
});

appEl?.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'loginInput') {
    state.loginDraft = el.value;
  } else if (el.id === 'passwordInput') {
    state.passwordDraft = el.value;
  } else if (el.dataset.action === 'search-input') {
    const caret = el.selectionStart;
    state.searchQuery = el.value;
    render();
    const nextInput = appEl.querySelector('[data-action="search-input"]');
    if (nextInput) {
      nextInput.focus();
      if (typeof caret === 'number') nextInput.setSelectionRange(caret, caret);
    }
  } else if (el.dataset.action === 'note-cin-input') {
    const caret = el.selectionStart;
    state.noteCinDraft.cin = el.value;
    state.cinSuggestionsOpen = true;
    render();
    const nextInput = appEl.querySelector('#cinLookupInput');
    if (nextInput) {
      nextInput.focus();
      if (typeof caret === 'number') nextInput.setSelectionRange(caret, caret);
    }
  } else if (el.dataset.action === 'note-subject-search') {
    const caret = el.selectionStart;
    state.noteCinDraft.subjectSearch = el.value;
    const q = el.value.trim().toLowerCase();
    const matched = state.matieres.filter(
      (m) => !q || m.libelle.toLowerCase().includes(q) || m.codemat.toLowerCase().includes(q)
    );
    if (matched.length === 1) {
      state.noteCinDraft.codemat = matched[0].codemat;
    }
    render();
    const nextInput = appEl.querySelector('#subjectSearchInput');
    if (nextInput) {
      nextInput.focus();
      if (typeof caret === 'number') nextInput.setSelectionRange(caret, caret);
    }
  } else if (el.dataset.action === 'note-val-input') {
    state.noteCinDraft.note = el.value;
  } else if (el.dataset.action === 'note-date-input') {
    state.noteCinDraft.date_eval = el.value;
  }
});

appEl?.addEventListener('change', (event) => {
  const el = event.target;
  if (el.dataset.action === 'switch-student') {
    state.previewStudentId = Number(el.value);
    state.studentSubjectFilter = 'ALL';
    render();
  } else if (el.dataset.action === 'grade-student-change') {
    state.gradeEdit.numetu = el.value;
  } else if (el.dataset.action === 'note-subject-select') {
    state.noteCinDraft.codemat = el.value;
    render();
  } else if (el.dataset.action === 'note-type-select') {
    state.noteCinDraft.type_eval = el.value;
  } else if (el.dataset.action === 'note-date-input') {
    state.noteCinDraft.date_eval = el.value;
  } else if (el.dataset.action === 'profile-photo-file') {
    const file = el.files && el.files[0];
    if (!file || !state.profileDraft) return;
    const allowed = ['image/jpeg', 'image/png'];
    const extOk = /\.(jpe?g|png)$/i.test(file.name || '');
    if (!extOk || !allowed.includes(file.type)) {
      el.value = '';
      state.profilePhotoError = 'Format invalide. Seules les images JPG, JPEG et PNG sont acceptées.';
      render();
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      el.value = '';
      state.profilePhotoError = 'La taille du fichier dépasse la limite maximale de 2 Mo.';
      render();
      return;
    }
    state.profilePhotoError = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string' && state.profileDraft) {
        state.profileDraft.photo = ev.target.result;
        render();
      }
    };
    reader.readAsDataURL(file);
  }
});

appEl?.addEventListener('submit', (event) => {
  const form = event.target;
  event.preventDefault();

  if (form.id === 'previewLoginForm') {
    const fd = new FormData(form);
    state.loginDraft = String(fd.get('login') || '');
    state.passwordDraft = String(fd.get('password') || '');
    performLogin(state.loginDraft, state.passwordDraft);
  } else if (form.id === 'profGradeForm') {
    const fd = new FormData(form);
    const numetu = Number(fd.get('numetu'));
    const numepreuve = Number(fd.get('numepreuve'));
    const note = parseFloat(String(fd.get('note') || '').replace(',', '.'));

    if (!numetu || !numepreuve) {
      state.flash = { type: 'err', text: 'Veuillez choisir un étudiant et une épreuve.' };
      render();
      return;
    }
    if (!Number.isFinite(note) || note < 0 || note > 20) {
      state.flash = { type: 'err', text: 'La note doit être comprise entre 0 et 20.' };
      render();
      return;
    }

    const idx = state.notations.findIndex((n) => n.numetu === numetu && n.numepreuve === numepreuve);
    if (idx >= 0) {
      state.notations[idx] = { numetu, numepreuve, note };
    } else {
      state.notations.unshift({ numetu, numepreuve, note });
    }
    state.gradeEdit = { editing: false, numetu: '', numepreuve: '', note: '' };
    state.flash = { type: 'ok', text: `Note enregistrée avec succès (${note.toFixed(2)} / 20).` };
    render();
  } else if (form.id === 'addMatiereForm') {
    const fd = new FormData(form);
    const codemat = String(fd.get('codemat') || '').trim().toUpperCase();
    const libelle = String(fd.get('libelle') || '').trim();
    const coef = parseFloat(String(fd.get('coef') || '').replace(',', '.'));

    if (!/^[A-Z0-9]{1,3}$/.test(codemat)) {
      state.flash = { type: 'err', text: 'Le code matière doit contenir 1 à 3 caractères alphanumériques.' };
      render();
      return;
    }
    if (libelle.length < 2 || libelle.length > 20) {
      state.flash = { type: 'err', text: 'Le libellé doit contenir entre 2 et 20 caractères.' };
      render();
      return;
    }
    if (!Number.isFinite(coef) || coef < 0.01 || coef > 10) {
      state.flash = { type: 'err', text: 'Le coefficient doit être compris entre 0.01 et 10.' };
      render();
      return;
    }
    if (state.matieres.some((m) => m.codemat === codemat)) {
      state.flash = { type: 'err', text: 'Ce code matière existe déjà.' };
      render();
      return;
    }

    state.matieres.push({ codemat, libelle, coef });
    state.sitePage = 'matieres';
    state.flash = { type: 'ok', text: `Matière ${codemat} ajoutée avec succès.` };
    render();
  } else if (form.id === 'addEpreuveForm') {
    const fd = new FormData(form);
    const numepreuve = Number(fd.get('numepreuve'));
    const datepreuve = String(fd.get('datepreuve') || '');
    const Lieu = String(fd.get('lieu') || '').trim();
    const type_eval = String(fd.get('type_eval') || 'Examen').trim();
    const codemat = String(fd.get('codemat') || '').trim().toUpperCase();

    if (!Number.isInteger(numepreuve) || numepreuve <= 0) {
      state.flash = { type: 'err', text: "Le numéro d'épreuve doit être un entier positif." };
      render();
      return;
    }
    if (!datepreuve || Lieu.length < 2 || !codemat) {
      state.flash = { type: 'err', text: 'Veuillez remplir tous les champs requis.' };
      render();
      return;
    }
    if (state.epreuves.some((ep) => ep.numepreuve === numepreuve)) {
      state.flash = { type: 'err', text: "Ce numéro d'épreuve existe déjà." };
      render();
      return;
    }

    state.epreuves.unshift({ numepreuve, datepreuve, Lieu, type_eval, codemat });
    state.sitePage = 'epreuves';
    state.flash = { type: 'ok', text: `Épreuve #${numepreuve} planifiée avec succès.` };
    render();
  } else if (form.id === 'addEtudiantForm') {
    const fd = new FormData(form);
    const isEditing = Boolean(state.editingStudentId);
    const cinVal = String(fd.get('cin') || '').trim();
    const draft = {
      numetu: isEditing ? String(state.editingStudentId) : String(fd.get('numetu') || '').trim(),
      cin: cinVal,
      nom: String(fd.get('nom') || '').trim(),
      prenom: String(fd.get('prenom') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      telephone: String(fd.get('telephone') || '').trim(),
      datenaiss: String(fd.get('datenaiss') || '').trim(),
      sexe: String(fd.get('sexe') || '').trim(),
      departement: String(fd.get('departement') || '').trim(),
      specialite: String(fd.get('specialite') || '').trim(),
      classe: String(fd.get('classe') || '').trim(),
      annee_univ: String(fd.get('annee_univ') || '').trim(),
    };
    state.studentDraft = draft;

    const requiredKeys = [
      'numetu',
      'nom',
      'prenom',
      'email',
      'telephone',
      'datenaiss',
      'sexe',
      'departement',
      'specialite',
      'classe',
      'annee_univ',
    ];
    const allFilled = requiredKeys.every((k) => draft[k] !== '');
    const numetuInt = Number(draft.numetu);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email);
    const phoneOk = /^[0-9+\s\-().]{8,20}$/.test(draft.telephone);

    if (!allFilled) {
      state.flash = { type: 'err', text: 'Veuillez remplir tous les champs obligatoires du formulaire.' };
      render();
      return;
    }
    if (!/^\d{1,9}$/.test(draft.numetu) || numetuInt <= 0) {
      state.flash = { type: 'err', text: "Le numéro d'inscription doit être un entier positif." };
      render();
      return;
    }
    if (!isEditing && state.etudiants.some((et) => et.numetu === numetuInt)) {
      state.flash = { type: 'err', text: `Ce numéro d'inscription (#${numetuInt}) existe déjà dans la base.` };
      render();
      return;
    }
    if (cinVal !== '' && !/^[0-9A-Za-z]{6,20}$/.test(cinVal)) {
      state.flash = { type: 'err', text: 'Le numéro CIN doit contenir entre 6 et 20 caractères alphanumériques.' };
      render();
      return;
    }
    if (
      cinVal !== '' &&
      state.etudiants.some((et) => et.cin === cinVal && (!isEditing || et.numetu !== state.editingStudentId))
    ) {
      state.flash = { type: 'err', text: `Ce numéro CIN (${cinVal}) est déjà attribué à un étudiant.` };
      render();
      return;
    }
    if (!emailOk) {
      state.flash = { type: 'err', text: "Le format de l'adresse e-mail est invalide." };
      render();
      return;
    }
    if (!phoneOk) {
      state.flash = { type: 'err', text: 'Veuillez saisir un numéro de téléphone valide (8 chiffres minimum).' };
      render();
      return;
    }

    if (isEditing) {
      const idx = state.etudiants.findIndex((et) => et.numetu === state.editingStudentId);
      if (idx >= 0) {
        state.etudiants[idx] = {
          ...state.etudiants[idx],
          cin: cinVal || null,
          nom: draft.nom,
          prenom: draft.prenom,
          email: draft.email,
          telephone: draft.telephone,
          datenaiss: draft.datenaiss,
          sexe: draft.sexe,
          departement: draft.departement,
          specialite: draft.specialite,
          classe: draft.classe,
          annee_univ: draft.annee_univ,
        };
      }
      state.editingStudentId = null;
      state.sitePage = 'etudiants';
      state.flash = {
        type: 'ok',
        text: `Étudiant ${draft.prenom} ${draft.nom} (#${numetuInt}) modifié avec succès.`,
      };
      render();
      return;
    }

    const baseLogin = draft.prenom.toLowerCase().replace(/[^a-z0-9]/g, '') || `etu${numetuInt}`;
    const login = state.etudiants.some((et) => et.login === baseLogin) ? `etu${numetuInt}` : baseLogin;

    state.etudiants.unshift({
      numetu: numetuInt,
      cin: cinVal || null,
      nom: draft.nom,
      prenom: draft.prenom,
      email: draft.email,
      telephone: draft.telephone,
      datenaiss: draft.datenaiss,
      sexe: draft.sexe,
      departement: draft.departement,
      specialite: draft.specialite,
      classe: draft.classe,
      annee_univ: draft.annee_univ,
      rue: 'Campus ISET Djerba',
      cp: 4116,
      ville: 'Djerba',
      login,
      photo: '',
      profil_complete: false,
    });

    state.studentDraft = {
      numetu: '',
      cin: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      datenaiss: '',
      sexe: '',
      departement: '',
      specialite: '',
      classe: '',
      annee_univ: '2025-2026',
    };
    state.sitePage = 'etudiants';
    state.flash = {
      type: 'ok',
      text: `Étudiant ${draft.prenom} ${draft.nom} (#${numetuInt}) ajouté avec succès.`,
    };
    render();
  } else if (form.id === 'addNoteCinForm') {
    const fd = new FormData(form);
    const cin = String(fd.get('cin') || '').replace(/\s+/g, '');
    const codemat = String(fd.get('codemat') || '').trim().toUpperCase();
    const typeEval = String(fd.get('type_eval') || '').trim();
    const noteRaw = String(fd.get('note') || '').trim().replace(',', '.');
    const dateEval = String(fd.get('date_eval') || '').trim();
    const noteVal = parseFloat(noteRaw);

    state.noteCinDraft = {
      ...state.noteCinDraft,
      cin,
      codemat,
      type_eval: typeEval,
      note: noteRaw,
      date_eval: dateEval,
    };
    state.cinSuggestionsOpen = false;

    const student = state.etudiants.find((et) => (et.cin || '') === cin);
    const matiere = state.matieres.find((m) => m.codemat === codemat);

    if (!cin) {
      state.flash = { type: 'err', text: "Veuillez saisir le numéro CIN de l'étudiant." };
      render();
      return;
    }
    if (!student) {
      state.flash = { type: 'err', text: `Aucun étudiant trouvé avec le numéro CIN « ${cin} ».` };
      render();
      return;
    }
    if (!matiere) {
      state.flash = { type: 'err', text: 'Veuillez sélectionner une matière valide dans la liste.' };
      render();
      return;
    }
    if (!['DS', 'Examen', 'TP', 'Projet'].includes(typeEval)) {
      state.flash = { type: 'err', text: "Veuillez choisir un type d'évaluation valide." };
      render();
      return;
    }
    if (noteRaw === '' || !Number.isFinite(noteVal) || noteVal < 0 || noteVal > 20) {
      state.flash = { type: 'err', text: 'La note doit être un nombre compris entre 0 et 20.' };
      render();
      return;
    }
    if (!dateEval) {
      state.flash = { type: 'err', text: "Veuillez indiquer la date de l'évaluation." };
      render();
      return;
    }

    let epreuve = state.epreuves.find(
      (ep) => ep.codemat === codemat && (ep.type_eval || 'Examen') === typeEval && ep.datepreuve === dateEval
    );

    if (epreuve) {
      const exists = state.notations.some(
        (n) => n.numetu === student.numetu && n.numepreuve === epreuve.numepreuve
      );
      if (exists) {
        state.flash = {
          type: 'err',
          text: `Doublon détecté : ${student.prenom} ${student.nom} possède déjà une note en ${matiere.libelle} (${typeEval} du ${dateEval}).`,
        };
        render();
        return;
      }
    } else {
      const maxId = state.epreuves.reduce((m, ep) => Math.max(m, ep.numepreuve), 50000);
      epreuve = {
        numepreuve: maxId + 1,
        datepreuve: dateEval,
        Lieu: 'ISET Djerba',
        type_eval: typeEval,
        codemat,
      };
      state.epreuves.unshift(epreuve);
    }

    state.notations.unshift({
      numetu: student.numetu,
      numepreuve: epreuve.numepreuve,
      note: Math.round(noteVal * 100) / 100,
    });

    state.noteCinDraft.note = '';
    state.flash = {
      type: 'ok',
      text: `Note enregistrée : ${noteVal.toFixed(2)} / 20 pour ${student.prenom} ${student.nom} (CIN ${student.cin}) en ${matiere.libelle} (${typeEval}).`,
    };
    render();
  } else if (form.id === 'studentProfilePreviewForm') {
    if (state.session?.role !== 'etudiant' || !state.session.numetu) return;
    const idx = state.etudiants.findIndex((et) => et.numetu === state.session.numetu);
    if (idx < 0) return;
    const current = state.etudiants[idx];
    const fd = new FormData(form);

    const nom = String(fd.get('nom') || '').trim();
    const prenom = String(fd.get('prenom') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const telephone = String(fd.get('telephone') || '').trim();
    const datenaiss = String(fd.get('datenaiss') || '').trim();
    const ville = String(fd.get('ville') || '').trim();

    const cin = current.cin ? current.cin : String(fd.get('cin') || '').replace(/\s+/g, '');
    const departement = current.departement ? current.departement : String(fd.get('departement') || '').trim();
    const specialite = current.specialite ? current.specialite : String(fd.get('specialite') || '').trim();
    const classe = current.classe ? current.classe : String(fd.get('classe') || '').trim();
    const annee_univ = current.annee_univ ? current.annee_univ : String(fd.get('annee_univ') || '').trim();

    state.profileDraft = {
      ...current,
      nom,
      prenom,
      email,
      telephone,
      datenaiss,
      ville,
      cin,
      departement,
      specialite,
      classe,
      annee_univ,
      photo: state.profileDraft?.photo ?? current.photo ?? '',
    };

    if (!nom || !prenom || !email || !telephone || !datenaiss) {
      state.flash = { type: 'err', text: 'Veuillez remplir tous vos champs personnels obligatoires.' };
      render();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      state.flash = { type: 'err', text: "Le format de l'adresse e-mail est invalide." };
      render();
      return;
    }
    if (!/^[0-9+\s\-().]{8,20}$/.test(telephone)) {
      state.flash = { type: 'err', text: 'Veuillez saisir un numéro de téléphone valide (8 chiffres minimum).' };
      render();
      return;
    }

    const updated = {
      ...current,
      nom,
      prenom,
      email,
      telephone,
      datenaiss,
      ville: ville || current.ville || 'Djerba',
      cin: cin || null,
      departement: departement || current.departement || '',
      specialite: specialite || current.specialite || '',
      classe: classe || current.classe || '',
      annee_univ: annee_univ || current.annee_univ || '',
      photo: state.profileDraft.photo || '',
      profil_complete: true,
    };

    state.etudiants[idx] = updated;
    state.session.displayName = `${updated.prenom} ${updated.nom}`;
    state.profileDraft = { ...updated };
    state.profileEditMode = false;
    state.profilePhotoError = '';
    state.flash = { type: 'ok', text: 'Votre profil étudiant a été enregistré avec succès.' };
    render();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    let changed = false;
    if (state.drawerOpen) {
      state.drawerOpen = false;
      changed = true;
    }
    if (state.pendingDeleteMatiere) {
      state.pendingDeleteMatiere = null;
      changed = true;
    }
    if (state.viewingStudentId) {
      state.viewingStudentId = null;
      changed = true;
    }
    if (changed) render();
  }
});

render();
