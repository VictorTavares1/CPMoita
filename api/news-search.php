<?php
require_once 'db.php';

$search = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($search)) {
    echo json_encode([]);
    exit();
}

$like = '%' . $conn->real_escape_string($search) . '%';

$stmt = $conn->prepare("
    SELECT n.id, n.title, n.content, n.dateHour, i.url
    FROM news n
    LEFT JOIN images i ON i.idNews = n.id
    WHERE n.idState = 1 AND (n.title LIKE ? OR n.content LIKE ?)
    GROUP BY n.id
    ORDER BY n.dateHour DESC
");
$stmt->bind_param('ss', $like, $like);
$stmt->execute();
$result = $stmt->get_result();

$news = [];
while ($row = $result->fetch_assoc()) {
    $news[] = $row;
}

echo json_encode($news);
