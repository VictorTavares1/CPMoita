<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

$nome     = trim($body['nome']     ?? '');
$email    = trim($body['email']    ?? '');
$assunto  = trim($body['assunto']  ?? '');
$mensagem = trim($body['mensagem'] ?? '');

if (!$nome || !$email || !$assunto || !$mensagem) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'E-mail inválido.']);
    exit;
}

// Prevenir email header injection
if (preg_match('/[\r\n]/', $email) || preg_match('/[\r\n]/', $nome)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
    exit;
}

// XSS sanitize
$nome     = htmlspecialchars($nome,     ENT_QUOTES, 'UTF-8');
$email    = htmlspecialchars($email,    ENT_QUOTES, 'UTF-8');
$assunto  = htmlspecialchars($assunto,  ENT_QUOTES, 'UTF-8');
$mensagem = htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8');

// Get destination email from contacts table
$result = $conn->query("SELECT valor FROM contacts WHERE tipo = 'email' AND idState = 1 LIMIT 1");
$row = $result ? $result->fetch_assoc() : null;
$destino = $row ? $row['valor'] : 'geral@centroparoquialdamoita.pt';

$subject = "Contacto via website: $assunto";
$body_text = "Nome: $nome\nE-mail: $email\n\nMensagem:\n$mensagem";

$headers  = "From: noreply@cpasmoita.pt\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($destino, $subject, $body_text, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Mensagem enviada com sucesso.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro ao enviar a mensagem. Tente novamente mais tarde.']);
}
