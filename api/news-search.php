<?php
require_once 'db.php';

$search = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($search)) {
    echo json_encode([]);
    exit();
}

$like = '%' . $conn->real_escape_string($search) . '%';

$stmt = $conn->prepare("
    SELECT id, title, content, dateHour
    FROM news
    WHERE idState = 1 AND (title LIKE ? OR content LIKE ?)
    ORDER BY dateHour DESC
    LIMIT 20
");
$stmt->bind_param('ss', $like, $like);
$stmt->execute();
$result = $stmt->get_result();

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

echo json_encode($news);
