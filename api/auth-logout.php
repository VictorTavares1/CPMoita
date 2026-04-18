<?php
require_once 'db.php';
require_once 'auth-check.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit();
}

$headers = getallheaders();
$auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
if (str_starts_with($auth, 'Bearer ')) {
    $token = substr($auth, 7);
    $stmt = $conn->prepare("DELETE FROM admin_tokens WHERE token = ?");
    $stmt->bind_param('s', $token);
    $stmt->execute();
}

echo json_encode(['success' => true]);
