    </main>

    <footer>
      &copy; <?= date('Y') ?> ISET Djerba — Système de Gestion des Notes &amp; Épreuves
    </footer>
  </div>
</div>

<script src="app.js"></script>
</body>
</html>
<?php
// Fermeture explicite de la connexion PDO en fin de page
$dbh = null;
$db  = null;
