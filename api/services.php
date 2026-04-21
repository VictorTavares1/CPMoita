<?php
require_once 'db.php';

$result = $conn->query("SELECT id, titulo, descricao, iconeOuImagem FROM services WHERE idState = 1 ORDER BY id ASC");

$services = [];
while ($row = $result->fetch_assoc()) {
    $services[] = $row;
}

echo json_encode($services);
