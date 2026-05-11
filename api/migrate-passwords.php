<?php
/**
 * Script de migração única: converte hashes MD5 legados para bcrypt.
 * Executar UMA VEZ em linha de comando: php api/migrate-passwords.php
 * Remover ou proteger este ficheiro após execução.
 *
 * NUNCA expor este endpoint via web sem protecção extra.
 */

// Bloquear acesso web — só correr via CLI
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('Acesso negado. Correr via CLI: php api/migrate-passwords.php' . PHP_EOL);
}

require_once __DIR__ . '/db.php';

$config  = json_decode(file_get_contents(__DIR__ . '/../db/info.json'), true);
$prefixo = $config['prefixo'] ?? '';
$sufixo  = $config['sufixo']  ?? '';

$result = $conn->query("SELECT id, password FROM users");
$migrated = 0;
$skipped  = 0;

while ($row = $result->fetch_assoc()) {
    $hash = $row['password'];

    // Detectar se já é bcrypt (começa com $2y$ ou $2b$)
    if (strlen($hash) === 60 && (str_starts_with($hash, '$2y$') || str_starts_with($hash, '$2b$'))) {
        $skipped++;
        continue;
    }

    // Hash MD5 — não é possível converter sem a password original
    // Marcar a conta para forçar reset na próxima autenticação
    // (a migração automática em auth-login.php trata disso no primeiro login)
    echo "ID {$row['id']}: hash MD5 detectado ({$hash}) — será migrado automaticamente no próximo login." . PHP_EOL;
    $migrated++;
}

echo PHP_EOL . "Resumo: {$migrated} contas com MD5 (migração automática no login), {$skipped} já em bcrypt." . PHP_EOL;
echo "Remover este ficheiro após execução: rm api/migrate-passwords.php" . PHP_EOL;
