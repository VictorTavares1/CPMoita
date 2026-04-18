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

$configFull = json_decode(file_get_contents(__DIR__ . '/../db/info.json'), true);
$prefixo = $configFull['prefixo'];
$sufixo  = $configFull['sufixo'];
$hash    = md5($prefixo . $pwd . $sufixo);

$stmt = $conn->prepare("SELECT id, email FROM users WHERE email = ? AND password = ? AND idState = 1");
$stmt->bind_param('ss', $email, $hash);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciais inválidas']);
    exit();
}

$user = $result->fetch_assoc();

$token = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+8 hours'));

$conn->query("CREATE TABLE IF NOT EXISTS admin_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");

$stmt2 = $conn->prepare("INSERT INTO admin_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
$stmt2->bind_param('iss', $user['id'], $token, $expiresAt);
$stmt2->execute();

echo json_encode([
    'token'   => $token,
    'email'   => $user['email'],
    'expires' => $expiresAt
]);
