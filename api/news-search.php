<?php
require_once 'db.php';

$search = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($search)) {
    echo json_encode([]);
    exit();
}

$like = '%' . $search . '%';

// Subquery elimina N+1: imagem principal incluída na query principal
$stmt = $conn->prepare("
    SELECT n.id, n.title, n.dateHour,
           (SELECT i.url FROM images i WHERE i.idNews = n.id ORDER BY i.id ASC LIMIT 1) AS url
    FROM news n
    WHERE n.idState = 1 AND (n.title LIKE ? OR n.content LIKE ?)
    ORDER BY n.dateHour DESC
    LIMIT 20
");
$stmt->bind_param('ss', $like, $like);
$stmt->execute();
$result = $stmt->get_result();

$news = [];
while ($row = $result->fetch_assoc()) {
    $row['id'] = (int)$row['id'];
    $news[] = $row;
}

echo json_encode($news);
