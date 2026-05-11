<?php
require_once 'db.php';

// Lista de anos de relatórios — cache de 10 minutos
header('Cache-Control: public, max-age=600');

$result = $conn->query("SELECT DISTINCT year FROM docs WHERE idState = 1 AND year IS NOT NULL ORDER BY year DESC");
$years = [];
while ($row = $result->fetch_assoc()) {
    $years[] = (int)$row['year'];
}

echo json_encode($years);
