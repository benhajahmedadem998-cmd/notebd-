// Scripts JavaScript Vanilla — NOTES DB (ISET Djerba)
(function () {
  'use strict';

  var REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var REGEX_TEL   = /^[0-9+\s\-().]{8,20}$/;

  // --- Outils communs de validation de formulaire ---

  function afficherErreur(champ, message) {
    if (!champ) return;
    var groupe = champ.closest('.form-group');
    var zoneErr = groupe ? groupe.querySelector('.field-error') : null;
    if (zoneErr) {
      zoneErr.textContent = message || '';
      zoneErr.style.display = message ? 'block' : 'none';
    }
    champ.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function verifierChamp(champ, estValide, message) {
    afficherErreur(champ, estValide ? '' : message);
    return estValide;
  }

  function lireNombre(champ) {
    return champ ? parseFloat(String(champ.value).replace(',', '.')) : NaN;
  }

  // --- 1. Menu latéral mobile (tiroir responsive) ---

  function initMenuMobile() {
    var openBtn  = document.getElementById('menuToggle');
    var closeBtn = document.getElementById('sidebarClose');
    var backdrop = document.getElementById('sidebarBackdrop');

    function basculerMenu(ouvert) {
      document.body.classList.toggle('sidebar-open', Boolean(ouvert));
    }

    if (openBtn)  openBtn.addEventListener('click', function () { basculerMenu(true); });
    if (closeBtn) closeBtn.addEventListener('click', function () { basculerMenu(false); });
    if (backdrop) backdrop.addEventListener('click', function () { basculerMenu(false); });

    return function () { basculerMenu(false); };
  }

  // --- 2. Afficher / masquer le mot de passe (login.php) ---

  function initMotDePasse() {
    var togglePwd = document.getElementById('togglePwd');
    var pwdInput  = document.getElementById('password');
    if (!togglePwd || !pwdInput) return;

    togglePwd.addEventListener('click', function () {
      var afficher = pwdInput.type === 'password';
      pwdInput.type = afficher ? 'text' : 'password';
      togglePwd.setAttribute('aria-label', afficher ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
    });
  }

  // --- 3. Recherche instantanée dans les tableaux (#tableSearch -> #dataTable) ---

  function initRechercheTableau() {
    var searchInput  = document.getElementById('tableSearch');
    var dataTable    = document.getElementById('dataTable');
    var visibleCount = document.getElementById('visibleCount');
    if (!searchInput || !dataTable) return;

    searchInput.addEventListener('input', function () {
      var requete = searchInput.value.trim().toLowerCase();
      var lignes  = dataTable.querySelectorAll('tbody tr');
      var nbVisibles = 0;

      lignes.forEach(function (ligne) {
        if (ligne.querySelector('td.empty')) return;
        var correspond = ligne.textContent.toLowerCase().indexOf(requete) !== -1;
        ligne.style.display = correspond ? '' : 'none';
        if (correspond) nbVisibles += 1;
      });

      if (visibleCount) {
        visibleCount.textContent = String(nbVisibles);
      }
    });
  }

  // --- 4. Modale de confirmation de suppression (afficheM.php) ---

  function initModaleSuppression() {
    var modal      = document.getElementById('deleteModal');
    var modalText  = document.getElementById('modalText');
    var deleteCode = document.getElementById('deleteCode');
    var cancelBtn  = document.getElementById('cancelDeleteBtn');

    function fermer() {
      if (modal) modal.classList.remove('active');
    }

    if (modal && modalText && deleteCode) {
      document.querySelectorAll('.delete-trigger').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var code  = btn.getAttribute('data-code') || '';
          var nom   = btn.getAttribute('data-name') || '';
          var count = parseInt(btn.getAttribute('data-count') || '0', 10);

          deleteCode.value = code;
          modalText.textContent = count > 0
            ? 'Supprimer la matière « ' + nom + ' » (' + code + ') ? Attention : ' + count + ' épreuve(s) liée(s) seront également supprimées.'
            : 'Voulez-vous vraiment supprimer la matière « ' + nom + ' » (' + code + ') ?';
          modal.classList.add('active');
        });
      });

      if (cancelBtn) cancelBtn.addEventListener('click', fermer);
      modal.addEventListener('click', function (evt) {
        if (evt.target === modal) fermer();
      });
    }

    return fermer;
  }

  // --- 5. Modale fiche détaillée d'un étudiant (afficheEtu.php) ---

  function initModaleEtudiant() {
    var modal     = document.getElementById('studentDetailModal');
    var titleEl   = document.getElementById('detailStudentTitle');
    var subEl     = document.getElementById('detailStudentSub');
    var listEl    = document.getElementById('detailStudentList');
    var releveBtn = document.getElementById('detailReleveLink');
    var closeBtn  = document.getElementById('closeDetailBtn');

    function fermer() {
      if (modal) modal.classList.remove('active');
    }

    if (modal && titleEl && listEl) {
      document.querySelectorAll('.student-detail-trigger').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var numetu = btn.getAttribute('data-numetu') || '';
          titleEl.textContent = btn.getAttribute('data-nom') || '';
          if (subEl) subEl.textContent = "N° d'inscription #" + numetu + ' · ISET Djerba';

          var lignes = [
            ['Numéro CIN',          btn.getAttribute('data-cin') || '—'],
            ['Adresse e-mail',      btn.getAttribute('data-email') || '—'],
            ['Téléphone',           btn.getAttribute('data-telephone') || '—'],
            ['Date de naissance',   btn.getAttribute('data-datenaiss') || '—'],
            ['Sexe',                btn.getAttribute('data-sexe') || '—'],
            ['Département',         btn.getAttribute('data-departement') || '—'],
            ['Spécialité',          btn.getAttribute('data-specialite') || '—'],
            ['Classe / Groupe',     btn.getAttribute('data-classe') || '—'],
            ['Année universitaire', btn.getAttribute('data-annee') || '—'],
          ];

          listEl.textContent = '';
          lignes.forEach(function (paire) {
            var box = document.createElement('div');
            var dt  = document.createElement('dt');
            var dd  = document.createElement('dd');
            dt.textContent = paire[0];
            dd.textContent = paire[1];
            box.appendChild(dt);
            box.appendChild(dd);
            listEl.appendChild(box);
          });

          if (releveBtn) {
            releveBtn.setAttribute('href', 'notesEtudiant.php?numetu=' + encodeURIComponent(numetu));
          }
          modal.classList.add('active');
        });
      });

      if (closeBtn) closeBtn.addEventListener('click', fermer);
      modal.addEventListener('click', function (evt) {
        if (evt.target === modal) fermer();
      });
    }

    return fermer;
  }

  // --- 6. Validations des formulaires standards (login, matière, épreuve, note, étudiant) ---

  function initValidations() {
    // Formulaire de connexion (login.php)
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (evt) {
        var loginEl = document.getElementById('login');
        var passEl  = document.getElementById('password');
        var ok = true;
        ok = verifierChamp(loginEl, Boolean(loginEl.value.trim()), 'Veuillez saisir votre identifiant.') && ok;
        ok = verifierChamp(passEl, Boolean(passEl.value), 'Veuillez saisir votre mot de passe.') && ok;
        if (!ok) evt.preventDefault();
      });
    }

    // Formulaire d'ajout de matière (formInsertM.php)
    var matiereForm = document.getElementById('matiereForm');
    if (matiereForm) {
      matiereForm.addEventListener('submit', function (evt) {
        var codeEl = document.getElementById('codemat');
        var libEl  = document.getElementById('libelle');
        var coefEl = document.getElementById('coef');
        var code   = codeEl.value.trim().toUpperCase();
        var lib    = libEl.value.trim();
        var coef   = lireNombre(coefEl);
        codeEl.value = code;

        var ok = true;
        ok = verifierChamp(codeEl, /^[A-Z0-9]{1,3}$/.test(code), '1 à 3 caractères alphanumériques (ex : INF).') && ok;
        ok = verifierChamp(libEl, lib.length >= 2 && lib.length <= 20, 'Entre 2 et 20 caractères requis.') && ok;
        ok = verifierChamp(coefEl, !isNaN(coef) && coef >= 0.01 && coef <= 10, 'Le coefficient doit être compris entre 0.01 et 10.') && ok;
        if (!ok) evt.preventDefault();
      });
    }

    // Formulaire d'ajout d'épreuve (formInsertE.php)
    var epreuveForm = document.getElementById('epreuveForm');
    if (epreuveForm) {
      epreuveForm.addEventListener('submit', function (evt) {
        var numEl  = document.getElementById('numepreuve');
        var dateEl = document.getElementById('datepreuve');
        var lieuEl = document.getElementById('lieu');
        var matEl  = document.getElementById('codemat');
        var numOk  = /^\d{1,9}$/.test(numEl.value.trim()) && parseInt(numEl.value, 10) > 0;

        var ok = true;
        ok = verifierChamp(numEl, numOk, 'Saisissez un entier positif.') && ok;
        ok = verifierChamp(dateEl, Boolean(dateEl.value), 'Veuillez choisir une date.') && ok;
        ok = verifierChamp(lieuEl, lieuEl.value.trim().length >= 2, 'Indiquez la salle ou le lieu (2 caractères min).') && ok;
        ok = verifierChamp(matEl, Boolean(matEl.value), 'Sélectionnez une matière.') && ok;
        if (!ok) evt.preventDefault();
      });
    }

    // Formulaire de saisie directe de note (notesProf.php)
    var gradeForm = document.getElementById('gradeForm');
    if (gradeForm) {
      gradeForm.addEventListener('submit', function (evt) {
        var etuEl  = document.getElementById('numetu');
        var epEl   = document.getElementById('numepreuve');
        var noteEl = document.getElementById('note');
        var note   = lireNombre(noteEl);

        var ok = true;
        ok = verifierChamp(etuEl, Boolean(etuEl.value), 'Veuillez choisir un étudiant.') && ok;
        ok = verifierChamp(epEl, Boolean(epEl.value), 'Veuillez choisir une épreuve.') && ok;
        ok = verifierChamp(noteEl, !isNaN(note) && note >= 0 && note <= 20, 'La note doit être comprise entre 0 et 20.') && ok;
        if (!ok) evt.preventDefault();
      });
    }

    // Formulaire d'ajout / modification d'étudiant (formInsertEtu.php)
    var etudiantForm = document.getElementById('etudiantForm');
    if (etudiantForm) {
      etudiantForm.addEventListener('submit', function (evt) {
        var regles = [
          { id: 'numetu',      msg: "Indiquez un numéro d'inscription valide." },
          { id: 'nom',         msg: 'Veuillez saisir le nom.' },
          { id: 'prenom',      msg: 'Veuillez saisir le prénom.' },
          { id: 'email',       msg: 'Veuillez saisir une adresse e-mail valide.' },
          { id: 'telephone',   msg: 'Veuillez saisir un numéro de téléphone valide.' },
          { id: 'datenaiss',   msg: 'Veuillez choisir la date de naissance.' },
          { id: 'sexe',        msg: 'Veuillez sélectionner le sexe.' },
          { id: 'departement', msg: 'Veuillez choisir un département.' },
          { id: 'specialite',  msg: 'Veuillez choisir une spécialité.' },
          { id: 'classe',      msg: 'Veuillez renseigner la classe / groupe.' },
          { id: 'annee_univ',  msg: "Veuillez choisir l'année universitaire." },
        ];

        var ok = true;
        regles.forEach(function (regle) {
          var el = document.getElementById(regle.id);
          if (!el) return;
          var val = String(el.value || '').trim();
          var valide = val !== '';

          if (valide && regle.id === 'numetu')    valide = /^\d{1,9}$/.test(val) && parseInt(val, 10) > 0;
          if (valide && regle.id === 'email')     valide = REGEX_EMAIL.test(val);
          if (valide && regle.id === 'telephone') valide = REGEX_TEL.test(val);

          ok = verifierChamp(el, valide, regle.msg) && ok;
        });

        if (!ok) evt.preventDefault();
      });
    }
  }

  // --- 7. Ajout de note par CIN & recherche dynamique de matière (formInsertNote.php) ---

  function initNoteParCin() {
    var form = document.getElementById('noteCinForm');
    if (!form) return;

    var cinInput        = document.getElementById('cinInput');
    var studentFullName = document.getElementById('studentFullName');
    var cinStatus       = document.getElementById('cinStatus');
    var cinSuggestions  = document.getElementById('cinSuggestions');
    var matiereFilter   = document.getElementById('matiereFilter');
    var codematSelect   = document.getElementById('codematSelect');
    var coefAuto        = document.getElementById('coefAuto');
    var typeEvalSelect  = document.getElementById('typeEvalSelect');
    var noteCinVal      = document.getElementById('noteCinVal');
    var dateEval        = document.getElementById('dateEval');

    var studentVerified = Boolean(studentFullName && studentFullName.value.trim() !== '');
    var cinTimer        = null;

    // Sauvegarde de la liste initiale des matières pour le filtrage instantané
    var toutesMatieres = [];
    if (codematSelect) {
      Array.prototype.slice.call(codematSelect.options).forEach(function (opt) {
        if (opt.value !== '') {
          toutesMatieres.push({
            value: opt.value,
            text:  opt.textContent,
            coef:  opt.getAttribute('data-coef') || '',
          });
        }
      });
    }

    function majCoef() {
      if (!codematSelect || !coefAuto) return;
      var opt = codematSelect.options[codematSelect.selectedIndex];
      coefAuto.value = opt ? (opt.getAttribute('data-coef') || '') : '';
    }

    function filtrerMatieres() {
      if (!codematSelect) return;
      var q = matiereFilter ? matiereFilter.value.trim().toLowerCase() : '';
      var ancienneVal = codematSelect.value;

      codematSelect.textContent = '';
      var defaut = document.createElement('option');
      defaut.value = '';
      defaut.setAttribute('data-coef', '');
      defaut.textContent = '— Sélectionner une matière —';
      codematSelect.appendChild(defaut);

      var filtrees = toutesMatieres.filter(function (m) {
        return !q || m.text.toLowerCase().indexOf(q) !== -1 || m.value.toLowerCase().indexOf(q) !== -1;
      });

      filtrees.forEach(function (m) {
        var opt = document.createElement('option');
        opt.value = m.value;
        opt.setAttribute('data-coef', m.coef);
        opt.textContent = m.text;
        if (m.value === ancienneVal) opt.selected = true;
        codematSelect.appendChild(opt);
      });

      if (filtrees.length === 1) codematSelect.value = filtrees[0].value;
      majCoef();
    }

    function majStatut(texte, style) {
      if (!cinStatus) return;
      cinStatus.textContent = texte;
      cinStatus.className = 'lookup-status' + (style ? ' lookup-status--' + style : '');
    }

    function masquerSuggestions() {
      if (!cinSuggestions) return;
      cinSuggestions.classList.remove('open');
      cinSuggestions.textContent = '';
    }

    function selectionnerEtudiant(etu) {
      if (!etu) return;
      if (cinInput) cinInput.value = etu.cin || '';
      if (studentFullName) studentFullName.value = (etu.prenom || '') + ' ' + (etu.nom || '');
      studentVerified = true;
      afficherErreur(cinInput, '');
      majStatut('Étudiant trouvé · #' + etu.numetu + ' · ' + (etu.classe || 'ISET Djerba'), 'ok');
      masquerSuggestions();
    }

    function afficherSuggestions(liste) {
      if (!cinSuggestions) return;
      cinSuggestions.textContent = '';
      if (!Array.isArray(liste) || liste.length === 0) {
        cinSuggestions.classList.remove('open');
        return;
      }

      liste.forEach(function (etu) {
        var btn  = document.createElement('button');
        var left = document.createElement('span');
        var nom  = document.createElement('strong');
        var meta = document.createElement('span');
        var code = document.createElement('span');

        btn.type = 'button';
        btn.className = 'cin-suggestion-item';
        nom.textContent = (etu.prenom || '') + ' ' + (etu.nom || '');
        meta.className = 'cin-suggestion-meta';
        meta.textContent = etu.classe ? ' · ' + etu.classe : '';
        code.className = 'cin-suggestion-code';
        code.textContent = etu.cin || '#' + etu.numetu;

        left.appendChild(nom);
        left.appendChild(meta);
        btn.appendChild(left);
        btn.appendChild(code);
        btn.addEventListener('click', function () { selectionnerEtudiant(etu); });
        cinSuggestions.appendChild(btn);
      });

      cinSuggestions.classList.add('open');
    }

    function rechercherCin(valeur) {
      var cin = String(valeur || '').trim();
      if (!cin) {
        studentVerified = false;
        if (studentFullName) studentFullName.value = '';
        majStatut("Saisissez un numéro CIN valide pour charger automatiquement l'étudiant.", '');
        masquerSuggestions();
        return;
      }

      majStatut('Recherche dans la base MySQL…', '');
      fetch('apiEtudiantCin.php?cin=' + encodeURIComponent(cin), {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          if (data && data.found && data.student) {
            selectionnerEtudiant(data.student);
            return;
          }
          studentVerified = false;
          if (studentFullName) studentFullName.value = '';
          if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            majStatut('Sélectionnez un étudiant dans les suggestions ci-dessous.', '');
            afficherSuggestions(data.suggestions);
          } else {
            majStatut('Aucun étudiant trouvé pour ce numéro CIN.', 'err');
            masquerSuggestions();
          }
        })
        .catch(function () {
          studentVerified = false;
          majStatut('Impossible de vérifier le CIN pour le moment.', 'err');
          masquerSuggestions();
        });
    }

    if (cinInput) {
      cinInput.addEventListener('input', function () {
        studentVerified = false;
        if (cinTimer) window.clearTimeout(cinTimer);
        cinTimer = window.setTimeout(function () {
          rechercherCin(cinInput.value);
        }, 180);
      });

      document.addEventListener('click', function (evt) {
        if (!evt.target.closest('.cin-lookup-wrap')) masquerSuggestions();
      });
    }

    if (codematSelect) {
      codematSelect.addEventListener('change', majCoef);
      if (matiereFilter) matiereFilter.addEventListener('input', filtrerMatieres);
      filtrerMatieres();
    }

    form.addEventListener('submit', function (evt) {
      var noteNum = lireNombre(noteCinVal);
      var cinText = cinInput ? cinInput.value.trim() : '';
      var cinConnu = studentVerified || Boolean(studentFullName && studentFullName.value.trim());

      var ok = true;
      if (!cinText) {
        ok = verifierChamp(cinInput, false, "Veuillez saisir le numéro CIN de l'étudiant.") && ok;
      } else {
        ok = verifierChamp(cinInput, cinConnu, 'Ce numéro CIN ne correspond à aucun étudiant connu.') && ok;
      }
      ok = verifierChamp(codematSelect, Boolean(codematSelect && codematSelect.value), 'Veuillez sélectionner une matière.') && ok;
      ok = verifierChamp(typeEvalSelect, Boolean(typeEvalSelect && typeEvalSelect.value), "Veuillez choisir le type d'évaluation.") && ok;
      ok = verifierChamp(noteCinVal, !isNaN(noteNum) && noteNum >= 0 && noteNum <= 20, 'La note doit être comprise entre 0 et 20.') && ok;
      ok = verifierChamp(dateEval, Boolean(dateEval && dateEval.value), "Veuillez indiquer la date de l'évaluation.") && ok;

      if (!ok) evt.preventDefault();
    });
  }

  // --- 8. Profil étudiant : aperçu photo & validation (profilEtudiant.php) ---

  function initPhotoProfil() {
    var form = document.getElementById('studentProfileForm');
    if (!form) return;

    var photoInput      = document.getElementById('profilePhotoInput');
    var previewFrame    = document.getElementById('photoPreviewFrame');
    var removePhotoBtn  = document.getElementById('removePhotoBtn');
    var removePhotoFlag = document.getElementById('removePhotoFlag');
    var photoErr        = document.getElementById('photoFieldError');
    var TAILLE_MAX      = 2 * 1024 * 1024;
    var TYPES_AUTORISES = ['image/jpeg', 'image/png'];

    function erreurPhoto(msg) {
      if (!photoErr) return;
      photoErr.textContent = msg || '';
      photoErr.style.display = msg ? 'block' : 'none';
    }

    function afficherInitiales() {
      if (!previewFrame) return;
      previewFrame.textContent = '';
      var span = document.createElement('span');
      span.className = 'profile-avatar-initials';
      span.textContent = previewFrame.getAttribute('data-initials') || 'ET';
      previewFrame.appendChild(span);
    }

    function afficherImage(dataUrl) {
      if (!previewFrame) return;
      previewFrame.textContent = '';
      var img = document.createElement('img');
      img.className = 'profile-avatar-img';
      img.alt = 'Aperçu de votre photo de profil';
      img.src = dataUrl;
      previewFrame.appendChild(img);
    }

    if (photoInput) {
      photoInput.addEventListener('change', function () {
        erreurPhoto('');
        var fichier = photoInput.files && photoInput.files[0];
        if (!fichier) return;

        var extOk  = /\.(jpe?g|png)$/i.test(fichier.name || '');
        var mimeOk = TYPES_AUTORISES.indexOf(fichier.type) !== -1;

        if (!extOk || !mimeOk) {
          photoInput.value = '';
          erreurPhoto('Format invalide. Seules les images JPG, JPEG et PNG sont acceptées.');
          return;
        }
        if (fichier.size > TAILLE_MAX) {
          photoInput.value = '';
          erreurPhoto('La taille du fichier dépasse la limite maximale de 2 Mo.');
          return;
        }

        if (removePhotoFlag) removePhotoFlag.value = '0';
        var lecteur = new FileReader();
        lecteur.onload = function (loadEvt) {
          if (loadEvt.target && typeof loadEvt.target.result === 'string') {
            afficherImage(loadEvt.target.result);
            if (removePhotoBtn) removePhotoBtn.style.display = '';
          }
        };
        lecteur.readAsDataURL(fichier);
      });
    }

    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', function () {
        if (photoInput) photoInput.value = '';
        if (removePhotoFlag) removePhotoFlag.value = '1';
        erreurPhoto('');
        afficherInitiales();
        removePhotoBtn.style.display = 'none';
      });
    }

    form.addEventListener('submit', function (evt) {
      var nomEl    = document.getElementById('profNom');
      var prenomEl = document.getElementById('profPrenom');
      var emailEl  = document.getElementById('profEmail');
      var telEl    = document.getElementById('profTel');
      var dateEl   = document.getElementById('profDateNaiss');

      var ok = true;
      ok = verifierChamp(nomEl, Boolean(nomEl && nomEl.value.trim()), 'Veuillez saisir votre nom.') && ok;
      ok = verifierChamp(prenomEl, Boolean(prenomEl && prenomEl.value.trim()), 'Veuillez saisir votre prénom.') && ok;
      ok = verifierChamp(emailEl, Boolean(emailEl && REGEX_EMAIL.test(emailEl.value.trim())), 'Veuillez saisir une adresse e-mail valide.') && ok;
      ok = verifierChamp(telEl, Boolean(telEl && REGEX_TEL.test(telEl.value.trim())), 'Veuillez saisir un numéro de téléphone valide.') && ok;
      ok = verifierChamp(dateEl, Boolean(dateEl && dateEl.value), 'Veuillez indiquer votre date de naissance.') && ok;

      if (!ok) evt.preventDefault();
    });
  }

  // --- Initialisation globale ---

  var fermerMenu   = initMenuMobile();
  var fermerSupp   = initModaleSuppression();
  var fermerDetail = initModaleEtudiant();

  initMotDePasse();
  initRechercheTableau();
  initValidations();
  initNoteParCin();
  initPhotoProfil();

  document.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape') {
      fermerMenu();
      fermerSupp();
      fermerDetail();
    }
  });
})();
