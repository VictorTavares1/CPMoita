<?php
require_once 'db.php';

header('Cache-Control: public, max-age=300');

$result = $conn->query("SELECT id, nome, entradas FROM horarios WHERE idState = 1 ORDER BY ordem ASC, id ASC");

$rows = [];
while ($row = $result->fetch_assoc()) {
    $row['id']      = (int)$row['id'];
    $row['entradas'] = $row['entradas'] ? (json_decode($row['entradas'], true) ?? []) : [];
    $rows[] = $row;
}

echo json_encode($rows);
