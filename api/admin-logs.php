<?php
require_once 'db.php';
require_once 'auth-check.php';

$user = validateToken($conn);
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}

$page  = max(1, (int)($_GET['page']  ?? 1));
$limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
$offset = ($page - 1) * $limit;

$countRes = $conn->query("SELECT COUNT(*) AS total FROM logs");
$total    = (int)$countRes->fetch_assoc()['total'];

$stmt = $conn->prepare("
    SELECT
        l.id,
        l.dateHour,
        u.email       AS userEmail,
        o.title       AS operation,
        n.title       AS newsTitle,
        d.title       AS docTitle,
        a.email       AS adminEmail
    FROM logs l
    JOIN users       u ON u.id = l.idUser
    JOIN operations  o ON o.id = l.idOperation
    LEFT JOIN news   n ON n.id = l.idNews
    LEFT JOIN docs   d ON d.id = l.idReport
    LEFT JOIN users  a ON a.id = l.idAdmin
    ORDER BY l.dateHour DESC
    LIMIT ? OFFSET ?
");
$stmt->bind_param('ii', $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = [
        'id'        => (int)$row['id'],
        'dateHour'  => $row['dateHour'],
        'userEmail' => $row['userEmail'],
        'operation' => $row['operation'],
        'name'      => $row['newsTitle'] ?? $row['docTitle'] ?? $row['adminEmail'] ?? '',
    ];
}

echo json_encode(['data' => $logs, 'total' => $total, 'page' => $page, 'limit' => $limit]);
