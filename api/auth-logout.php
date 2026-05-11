<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit();
}

// Apagar token da BD — ler do cookie ou do header Bearer (mesma lógica do auth-check)
$token = $_COOKIE['admin_token'] ?? '';
if (!$token) {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (str_starts_with($auth, 'Bearer ')) {
        $token = substr($auth, 7);
    }
}

if ($token) {
    $stmt = $conn->prepare("DELETE FROM admin_tokens WHERE token = ?");
    $stmt->bind_param('s', $token);
    $stmt->execute();
}

// Expirar o cookie no browser — mesmo path usado no login
$isSecure   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
$scriptDir  = dirname($_SERVER['SCRIPT_NAME']);
$cookiePath = rtrim($scriptDir, '/') . '/';
setcookie('admin_token', '', [
    'expires'  => time() - 3600,
    'path'     => $cookiePath,
    'domain'   => '',
    'secure'   => $isSecure,
    'httponly' => true,
    'samesite' => 'Strict',
]);

echo json_encode(['success' => true]);
