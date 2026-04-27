<?php
require_once 'db.php';

$result = $conn->query("SELECT DISTINCT year FROM docs WHERE idState = 1 AND year IS NOT NULL ORDER BY year DESC");
$years = [];
while ($row = $result->fetch_assoc()) {
    $years[] = (int)$row['year'];
}

echo json_encode($years);
