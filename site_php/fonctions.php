<?php
// Fonctions utilitaires partagées par toutes les pages de NOTES DB – ISET Djerba

// --- 1. Sécurité & Affichage ---

// Protège une valeur contre les failles XSS avant affichage HTML
function e($valeur): string
{
    return htmlspecialchars((string) ($valeur ?? ''), ENT_QUOTES, 'UTF-8');
}

// Vérifie que le jeton CSRF reçu correspond à celui de la session
function verifierCsrf(?string $token): bool
{
    return isset($_SESSION['csrf'])
        && is_string($token)
        && hash_equals($_SESSION['csrf'], $token);
}

// Ferme proprement la connexion PDO puis redirige vers une page
function rediriger(string $url): void
{
    global $dbh, $db;
    $dbh = null;
    $db  = null;
    header('Location: ' . $url);
    exit();
}

// --- 2. Contrôle des rôles (Professeur / Étudiant) ---

function estEtudiant(): bool
{
    return ($_SESSION['user_role'] ?? 'prof') === 'etudiant';
}

// Bloque l'accès aux pages Professeur si l'utilisateur est un étudiant
function exigerProf(): void
{
    if (estEtudiant()) {
        rediriger('notesEtudiant.php');
    }
}

// Bloque l'accès aux pages Étudiant si l'utilisateur n'est pas un étudiant connecté
function exigerEtudiant(): void
{
    if (!estEtudiant() || empty($_SESSION['numetu'])) {
        rediriger('dashboard.php');
    }
}

// --- 3. Formatage & Validations simples ---

function formaterDate(?string $dateSql): string
{
    if (!$dateSql) {
        return '—';
    }
    $ts = strtotime($dateSql);
    return $ts ? date('d/m/Y', $ts) : '—';
}

function formaterNote(?float $note): string
{
    return $note === null ? '—' : number_format($note, 2);
}

function dateValide(string $date): bool
{
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d !== false && $d->format('Y-m-d') === $date;
}

function nettoyerCin(string $cin): string
{
    return preg_replace('/\s+/', '', trim($cin)) ?? '';
}

function estEmailValide(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function estTelValide(string $tel): bool
{
    return (bool) preg_match('/^[0-9+\s\-().]{8,20}$/', $tel);
}

// Calcule la mention officielle à partir de la moyenne générale sur 20
function calculerMention(?float $moyenne): string
{
    if ($moyenne === null) {
        return 'En attente de notes';
    }
    if ($moyenne >= 16) {
        return 'Admis · Très Bien';
    }
    if ($moyenne >= 14) {
        return 'Admis · Bien';
    }
    if ($moyenne >= 12) {
        return 'Admis · Assez Bien';
    }
    if ($moyenne >= 10) {
        return 'Admis · Passable';
    }
    return 'Ajourné · Rattrapage';
}

// --- 4. Listes de référence ISET Djerba ---

function getTypesEval(): array
{
    return ['DS', 'Examen', 'TP', 'Projet'];
}

function getDepartements(): array
{
    return [
        "Technologies de l'Informatique",
        'Génie Électrique',
        'Génie Mécanique',
        'Sciences Économiques et Gestion',
    ];
}

function getSpecialites(): array
{
    return [
        "Tronc Commun — Technologies de l'Informatique",
        "DSI — Développement des Systèmes d'Information",
        'RSI — Réseaux et Systèmes Informatiques',
        'MDW — Multimédia et Développement Web',
        'SEM — Systèmes Embarqués et Mobiles',
        'AII — Automatisme et Informatique Industrielle',
        'CF — Comptabilité et Finance',
    ];
}

function getAnnees(): array
{
    return ['2024-2025', '2025-2026', '2026-2027'];
}

// --- 5. Requêtes SQL réutilisables (PDO) ---

function trouverEtudiantParId(PDO $dbh, int $numetu): ?array
{
    $stmt = $dbh->prepare('SELECT * FROM etudiant WHERE numetu = :numetu LIMIT 1');
    $stmt->execute([':numetu' => $numetu]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function trouverEtudiantParCin(PDO $dbh, string $cin): ?array
{
    $cinPropre = nettoyerCin($cin);
    if ($cinPropre === '') {
        return null;
    }
    $stmt = $dbh->prepare(
        'SELECT numetu, cin, nom, prenom, classe, departement, specialite
         FROM etudiant
         WHERE cin = :cin
         LIMIT 1'
    );
    $stmt->execute([':cin' => $cinPropre]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

// --- 6. Gestion sécurisée de la photo de profil étudiant ---

function supprimerPhotoAvatar(?string $cheminRelatif): void
{
    if (!$cheminRelatif || !str_starts_with($cheminRelatif, 'uploads/avatars/')) {
        return;
    }
    $dossier = realpath(__DIR__ . '/uploads/avatars');
    if ($dossier === false) {
        return;
    }
    $fichier = $dossier . DIRECTORY_SEPARATOR . basename($cheminRelatif);
    $reel = realpath($fichier);
    if ($reel !== false && is_file($reel) && str_starts_with($reel, $dossier . DIRECTORY_SEPARATOR)) {
        @unlink($reel);
    }
}

function enregistrerPhotoAvatar(array $fichier, int $numetu, ?string $anciennePhoto, string &$erreur): ?string
{
    $codeErreur = (int) ($fichier['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($codeErreur === UPLOAD_ERR_NO_FILE) {
        return $anciennePhoto;
    }

    $taille = (int) ($fichier['size'] ?? 0);
    $tmp    = (string) ($fichier['tmp_name'] ?? '');

    if ($codeErreur !== UPLOAD_ERR_OK) {
        $erreur = "Erreur lors du téléversement de l'image. Veuillez réessayer.";
        return $anciennePhoto;
    }
    if ($taille <= 0 || $taille > 2 * 1024 * 1024) {
        $erreur = 'La photo de profil ne doit pas dépasser 2 Mo.';
        return $anciennePhoto;
    }
    if (!is_uploaded_file($tmp)) {
        $erreur = 'Fichier téléversé invalide.';
        return $anciennePhoto;
    }

    // Vérification réelle du type MIME côté serveur (JPG / PNG uniquement)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string) $finfo->file($tmp);
    $formatsAutorises = ['image/jpeg' => 'jpg', 'image/png' => 'png'];

    if (!isset($formatsAutorises[$mime]) || @getimagesize($tmp) === false) {
        $erreur = 'Format non autorisé. Seules les images JPG, JPEG et PNG sont acceptées.';
        return $anciennePhoto;
    }

    $dossier = __DIR__ . '/uploads/avatars';
    if (!is_dir($dossier) && !@mkdir($dossier, 0755, true)) {
        $erreur = 'Impossible de créer le dossier de stockage des photos.';
        return $anciennePhoto;
    }

    $nomFichier = 'etu_' . $numetu . '_' . bin2hex(random_bytes(8)) . '.' . $formatsAutorises[$mime];
    $destination = $dossier . DIRECTORY_SEPARATOR . $nomFichier;

    if (!move_uploaded_file($tmp, $destination)) {
        $erreur = "Impossible d'enregistrer la photo sur le serveur.";
        return $anciennePhoto;
    }

    supprimerPhotoAvatar($anciennePhoto);
    return 'uploads/avatars/' . $nomFichier;
}
