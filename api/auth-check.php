<?php
require_once 'db.php';

function validateToken(mysqli $conn): ?array {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!str_starts_with($auth, 'Bearer ')) return null;

    $token = substr($auth, 7);
    $stmt = $conn->prepare(
        "SELECT at.user_id, u.email FROM admin_tokens at
         JOIN users u ON u.id = at.user_id
         WHERE at.token = ? AND at.expires_at > NOW() AND u.idState = 1"
    );
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows === 0) return null;
    return $res->fetch_assoc();
}
