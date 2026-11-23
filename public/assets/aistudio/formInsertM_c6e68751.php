<?php

declare(strict_types=1);

include('connect.inc.php');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['csrf']) || !is_string($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit'])) {
    $codemat = strtoupper(trim((string)($_POST['codemat'] ?? '')));
    $libelle = trim((string)($_POST['libelle'] ?? ''));
    $coefRaw = str_replace(',', '.', trim((string)($_POST['coef'] ?? '')));
    $coef = is_numeric($coefRaw) ? (float)$coefRaw : -1.0;
    $csrfToken = (string)($_POST['csrf'] ?? '');

    if (!hash_equals($_SESSION['csrf'], $csrfToken)) {
        $error = "Session expirée, rechargez la page.";
    } elseif (!preg_match('/^[A-Z0-9]{1,3}$/', $codemat)) {
        $error = "Le code matière doit contenir 1 à 3 caractères alphanumériques.";
    } elseif (mb_strlen($libelle) < 2 || mb_strlen($libelle) > 20) {
        $error = "Le libellé doit contenir entre 2 et 20 caractères.";
    } elseif ($coef < 0.01 || $coef > 10.0) {
        $error = "Le coefficient doit être compris entre 0.01 et 10.";
    } else {
        try {
            $stmt = $db->prepare(
                "INSERT INTO matiere (codemat, libelle, coef) VALUES (:c, :l, :k)"
            );
            $stmt->execute([
                ':c' => $codemat,
                ':l' => $libelle,
                ':k' => $coef,
            ]);

            header("Location: afficheM.php?msg=added");
            exit();
        } catch (PDOException $ex) {
            $error = "Impossible d'ajouter cette matière (ce code existe peut-être déjà).";
        }
    }
}

$pageTitle = 'Ajouter une matière';
$active = 'add-matiere';
include('header.php');
?>
    <div class="form-card">
        <h2>Ajouter une matière</h2>
        <p class="muted form-intro">Renseignez les informations du module.</p>

        <?php if ($error !== ''): ?>
            <div class="alert alert-error" role="alert"><?= e($error) ?></div>
        <?php endif; ?>

        <form action="" method="post" id="matiereForm" novalidate>
            <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">

            <div class="form-group">
                <label for="codemat">Code matière (3 caractères max)</label>
                <input type="text" id="codemat" name="codemat" maxlength="3" required
                       value="<?= e($_POST['codemat'] ?? '') ?>" placeholder="Ex : INF" style="text-transform:uppercase;">
                <small class="field-error"></small>
            </div>

            <div class="form-group">
                <label for="libelle">Libellé (20 caractères max)</label>
                <input type="text" id="libelle" name="libelle" maxlength="20" required
                       value="<?= e($_POST['libelle'] ?? '') ?>" placeholder="Ex : Informatique">
                <small class="field-error"></small>
            </div>

            <div class="form-group">
                <label for="coef">Coefficient</label>
                <input type="number" step="0.01" min="0.01" max="10" id="coef" name="coef" required
                       value="<?= e($_POST['coef'] ?? '') ?>" placeholder="Ex : 0.4">
                <small class="field-error"></small>
            </div>

            <div class="form-actions">
                <button type="submit" name="submit" class="btn btn-primary grow">Enregistrer la matière</button>
                <a href="afficheM.php" class="btn btn-secondary">Annuler</a>
            </div>
        </form>
    </div>
<?php include('footer.php'); ?>