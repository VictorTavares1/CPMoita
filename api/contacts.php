<?php
require_once 'db.php';

// Contactos mudam raramente — cache de 10 minutos no browser
header('Cache-Control: public, max-age=600');

$result = $conn->query("SELECT id, tipo, valor, icone FROM contacts WHERE idState = 1 ORDER BY id ASC");

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

echo json_encode($contacts);
