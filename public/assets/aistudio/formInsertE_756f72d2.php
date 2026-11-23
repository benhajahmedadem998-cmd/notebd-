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
$matieres = $db->query("SELECT codemat, libelle FROM matiere ORDER BY libelle ASC")->fetchAll();
$codes = array_column($matieres, 'codemat');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit'])) {
    $numepreuve = trim((string)($_POST['numepreuve'] ?? ''));
    $datepreuve = trim((string)($_POST['datepreuve'] ?? ''));
    $lieu = trim((string)($_POST['lieu'] ?? ''));
    $codemat = strtoupper(trim((string)($_POST['codemat'] ?? '')));
    $csrfToken = (string)($_POST['csrf'] ?? '');

    $d = DateTime::createFromFormat('Y-m-d', $datepreuve);
    $validDate = $d && $d->format('Y-m-d') === $datepreuve;

    if (!hash_equals($_SESSION['csrf'], $csrfToken)) {
        $error = "Session expirée, rechargez la page.";
    } elseif (!preg_match('/^\d{1,9}$/', $numepreuve) || (int)$numepreuve <= 0) {
        $error = "Le numéro d'épreuve doit être un entier positif.";
    } elseif (!$validDate) {
        $error = "Veuillez saisir une date valide.";
    } elseif (mb_strlen($lieu) < 2 || mb_strlen($lieu) > 100) {
        $error = "Le lieu doit contenir entre 2 et 100 caractères.";
    } elseif (!in_array($codemat, $codes, true)) {
        $error = "Veuillez sélectionner une matière de la liste.";
    } else {
        try {
            $stmt = $db->prepare(
                "INSERT INTO epreuve (numepreuve, datepreuve, Lieu, codemat)
                 VALUES (:n, :d, :l, :c)"
            );
            $stmt->execute([
                ':n' => (int)$numepreuve,
                ':d' => $datepreuve,
                ':l' => $lieu,
                ':c' => $codemat,
            ]);

            header("Location: afficheE.php?msg=added");
            exit();
        } catch (PDOException $ex) {
            $error = "Enregistrement impossible : ce numéro d'épreuve existe peut-être déjà.";
        }
    }
}

$pageTitle = 'Ajouter une épreuve';
$active = 'add-epreuve';
include('header.php');
?>
    <div class="form-card">
        <h2>Ajouter une épreuve</h2>
        <p class="muted form-intro">Choisissez une matière existante et renseignez les détails.</p>

        <?php if ($error !== ''): ?>
            <div class="alert alert-error" role="alert"><?= e($error) ?></div>
        <?php endif; ?>

        <form action="" method="post" id="epreuveForm" novalidate>
            <input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">

            <div class="form-group">
                <label for="numepreuve">Numéro d'épreuve</label>
                <input type="number" id="numepreuve" name="numepreuve" min="1" required
                       value="<?= e($_POST['numepreuve'] ?? '') ?>" placeholder="Ex : 11035">
                <small class="field-error"></small>
            </div>

            <div class="form-group">
                <label for="datepreuve">Date</label>
                <input type="date" id="datepreuve" name="datepreuve" required
                       value="<?= e($_POST['datepreuve'] ?? '') ?>">
                <small class="field-error"></small>
            </div>

            <div class="form-group">
                <label for="lieu">Lieu / salle</label>
                <input type="text" id="lieu" name="lieu" maxlength="100" required
                       value="<?= e($_POST['lieu'] ?? '') ?>" placeholder="Ex : Salle 191L">
                <small class="field-error"></small>
            </div>

            <div class="form-group">
                <label for="codemat">Matière</label>
                <select id="codemat" name="codemat" required>
                    <option value="">— Choisir une matière —</option>
                    <?php foreach ($matieres as $m): ?>
                        <option value="<?= e($m['codemat']) ?>" <?= (($_POST['codemat'] ?? '') === $m['codemat']) ? 'selected' : '' ?>>
                            <?= e($m['codemat']) ?> — <?= e($m['libelle']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <small class="field-error"></small>
            </div>

            <div class="form-actions">
                <button type="submit" name="submit" class="btn btn-primary grow">Ajouter l'épreuve</button>
                <a href="afficheE.php" class="btn btn-secondary">Annuler</a>
            </div>
        </form>
    </div>
<?php include('footer.php'); ?>