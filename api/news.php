<?php
require_once 'db.php';

$page   = isset($_GET['page'])  ? (int)$_GET['page']  : 1;
$limit  = isset($_GET['limit']) ? (int)$_GET['limit'] : 9;
$offset = ($page - 1) * $limit;

$stmt = $conn->prepare("
    SELECT n.id, n.title, n.content, n.dateHour, i.url
    FROM news n
    LEFT JOIN images i ON i.idNews = n.id
    WHERE n.idState = 1
    GROUP BY n.id
    ORDER BY n.dateHour DESC
    LIMIT ? OFFSET ?
");
$stmt->bind_param('ii', $limit, $offset);
$stmt->execute();
$result = $stmt->get_result();

$countResult = $conn->query("SELECT COUNT(*) as total FROM news WHERE idState = 1");
$total = $countResult->fetch_assoc()['total'];

$news = [];
while ($row = $result->fetch_assoc()) {
    $news[] = $row;
}

echo json_encode(['data' => $news, 'total' => (int)$total, 'page' => $page, 'limit' => $limit]);
