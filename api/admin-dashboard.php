<?php
require_once 'db.php';
require_once 'auth-check.php';

$user = validateToken($conn);
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}

function queryCount(mysqli $conn, string $sql): int {
    $result = $conn->query($sql);
    if (!$result) return 0;
    $row = $result->fetch_assoc();
    return (int)($row['c'] ?? 0);
}

$stats = [
    'news'     => queryCount($conn, "SELECT COUNT(*) AS c FROM news WHERE idState = 1"),
    'reports'  => queryCount($conn, "SELECT COUNT(*) AS c FROM docs WHERE idState = 1"),
    'services' => queryCount($conn, "SELECT COUNT(*) AS c FROM services WHERE idState = 1"),
    'contacts' => queryCount($conn, "SELECT COUNT(*) AS c FROM contacts WHERE idState = 1"),
];

// Últimas 5 notícias
$stmt = $conn->prepare(
    "SELECT id, title, dateHour, idState FROM news ORDER BY dateHour DESC LIMIT 5"
);
$stmt->execute();
$result = $stmt->get_result();
$recentNews = [];
while ($row = $result->fetch_assoc()) {
    $recentNews[] = [
        'id'       => (int)$row['id'],
        'title'    => $row['title'],
        'dateHour' => $row['dateHour'],
        'idState'  => (int)$row['idState'],
    ];
}

echo json_encode(['stats' => $stats, 'recentNews' => $recentNews]);
