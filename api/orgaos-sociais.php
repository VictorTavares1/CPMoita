<?php
require_once 'db.php';

header('Cache-Control: public, max-age=300');

$result = $conn->query("
    SELECT id, cargo, secao, nome
    FROM orgaos_sociais
    WHERE idState = 1
    ORDER BY secao ASC, id ASC
");

$rows = [];
while ($row = $result->fetch_assoc()) {
    $row['id'] = (int)$row['id'];
    $rows[] = $row;
}

echo json_encode($rows);
