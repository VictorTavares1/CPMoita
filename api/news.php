<?php
require_once 'db.php';

$page   = max(1, (int)($_GET['page']  ?? 1));
$limit  = min(50, max(1, (int)($_GET['limit'] ?? 9)));
$offset = ($page - 1) * $limit;

$stmt = $conn->prepare("
    SELECT id, title, content, dateHour
    FROM news
    WHERE idState = 1
    ORDER BY dateHour DESC
    LIMIT ? OFFSET ?
");
$stmt->bind_param('ii', $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$countResult = $conn->query("SELECT COUNT(*) as total FROM news WHERE idState = 1");
$total = $countResult->fetch_assoc()['total'];

$news = [];
while ($row = $result->fetch_assoc()) {
    $row['id'] = (int)$row['id'];
    $imgStmt = $conn->prepare("SELECT url FROM images WHERE idNews = ? LIMIT 1");
    $imgStmt->bind_param('i', $row['id']);
    $imgStmt->execute();
    $imgRow = $imgStmt->get_result()->fetch_assoc();
    $row['url'] = $imgRow ? $imgRow['url'] : null;
    $news[] = $row;
}

echo json_encode(['data' => $news, 'total' => (int)$total, 'page' => $page, 'limit' => $limit]);
