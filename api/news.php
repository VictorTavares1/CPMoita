<?php
require_once 'db.php';

// Notícias — cache de 2 minutos (equilíbrio entre frescura e performance)
header('Cache-Control: public, max-age=120');

$page   = max(1, (int)($_GET['page']  ?? 1));
$limit  = min(50, max(1, (int)($_GET['limit'] ?? 9)));
$offset = ($page - 1) * $limit;

// LEFT JOIN traz a imagem principal em 1 query em vez de N queries separadas
$stmt = $conn->prepare("
    SELECT n.id, n.title, n.content, n.dateHour,
           (SELECT i.url FROM images i WHERE i.idNews = n.id ORDER BY i.id ASC LIMIT 1) AS url
    FROM news n
    WHERE n.idState = 1
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
    $row['id'] = (int)$row['id'];
    $news[] = $row;
}

echo json_encode(['data' => $news, 'total' => (int)$total, 'page' => $page, 'limit' => $limit]);
