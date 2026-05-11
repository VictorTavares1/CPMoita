<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit();
}

$body = json_decode(file_get_contents('php://input'), true);
$email = isset($body['email']) ? trim($body['email']) : '';
$pwd   = isset($body['password']) ? $body['password'] : '';

if (!$email || !$pwd) {
    http_response_code(400);
    echo json_encode(['error' => 'Email e password são obrigatórios']);
    exit();
}

// Rate limiting: max 10 tentativas por IP em 15 minutos
// Tabela criada em db/schema.sql — não usar CREATE TABLE IF NOT EXISTS aqui
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$conn->query("DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
$rateStmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM login_attempts WHERE ip = ?");
$rateStmt->bind_param('s', $ip);
$rateStmt->execute();
$rateRow = $rateStmt->get_result()->fetch_assoc();
if ((int)$rateRow['cnt'] >= 10) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiadas tentativas. Tente novamente em 15 minutos.']);
    exit();
}

$stmt = $conn->prepare("SELECT id, email, password FROM users WHERE email = ? AND idState = 1");
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

$user = $result->fetch_assoc();

// Hash sentinela: impede timing side-channel quando o email não existe
// (password_verify num hash válido tem custo fixo; sem isto, email inexistente responde ~100ms mais rápido)
$storedHash = $user ? $user['password'] : '$2y$12$invalidhashsentinelxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxAA';

// Suporte a migração: verificar bcrypt primeiro, depois MD5 legado
$configFull = json_decode(file_get_contents(__DIR__ . '/../db/info.json'), true);
$prefixo = $configFull['prefixo'] ?? '';
$sufixo  = $configFull['sufixo'] ?? '';

$authenticated = false;

if (password_verify($pwd, $storedHash)) {
    $authenticated = $user !== null;
} elseif ($user !== null && ($storedHash === md5($prefixo . $pwd . $sufixo) || $storedHash === md5($pwd))) {
    // Password MD5 legada — migrar para bcrypt automaticamente
    $newHash = password_hash($pwd, PASSWORD_BCRYPT);
    $stmtUpd = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmtUpd->bind_param('si', $newHash, $user['id']);
    $stmtUpd->execute();
    $authenticated = true;
}

if (!$authenticated) {
    $ins = $conn->prepare("INSERT INTO login_attempts (ip) VALUES (?)");
    $ins->bind_param('s', $ip);
    $ins->execute();
    http_response_code(401);
    echo json_encode(['error' => 'Credenciais inválidas']);
    exit();
}

// Login bem-sucedido — limpar tokens expirados deste utilizador
$conn->query("DELETE FROM admin_tokens WHERE expires_at < NOW()");

$token = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+8 hours'));

$stmt2 = $conn->prepare("INSERT INTO admin_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
$stmt2->bind_param('iss', $user['id'], $token, $expiresAt);
$stmt2->execute();

echo json_encode([
    'token'   => $token,
    'email'   => $user['email'],
    'expires' => $expiresAt
]);
