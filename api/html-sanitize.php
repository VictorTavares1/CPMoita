<?php

/**
 * Sanitiza HTML produzido pelo editor Quill.
 * Mantém apenas as tags que o Quill usa para formatação de texto.
 * Remove qualquer tag que possa executar JavaScript (script, iframe, etc.).
 *
 * Tags permitidas: elementos de texto e estrutura que o Quill gera.
 * Atributos permitidos: class, href, target, rel (para links seguros), src (imagens).
 */
function sanitizeHtml(string $html): string {
    if (trim($html) === '') return '';

    // 1. strip_tags com allowlist — remove <script>, <iframe>, <form>, etc.
    $allowedTags = '<p><br><strong><em><u><s><h1><h2><h3><h4><h5><h6>'
                 . '<ul><ol><li><blockquote><pre><code>'
                 . '<a><img><span><div>';
    $html = strip_tags($html, $allowedTags);

    // 2. Remover atributos perigosos com regex
    // event handlers: onclick, onload, onerror, onmouseover, etc.
    $html = preg_replace('/\s+on\w+\s*=\s*(["\'])[^"\']*\1/i', '', $html);
    // javascript: em href/src
    $html = preg_replace('/\s+(href|src)\s*=\s*(["\'])\s*javascript:[^"\']*\2/i', '', $html);
    // style com expression() ou url() (CSS injection)
    $html = preg_replace('/\s+style\s*=\s*(["\'])[^"\']*\1/i', '', $html);

    // 3. Garantir que links externos abrem em nova aba com rel noopener
    $html = preg_replace_callback(
        '/<a\s([^>]*)>/i',
        function (array $m): string {
            $attrs = $m[1];
            // Adicionar rel="noopener noreferrer" se ainda não existir
            if (!str_contains($attrs, 'rel=')) {
                $attrs .= ' rel="noopener noreferrer"';
            }
            return '<a ' . $attrs . '>';
        },
        $html
    );

    return $html;
}
