<?php
require_once 'db.php';

$result = $conn->query("SELECT id, tipo, valor, icone FROM contacts WHERE idState = 1 ORDER BY id ASC");

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

echo json_encode($contacts);
