<?php
// Set appropriate headers for JSON response
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Include the API key file
require_once 'api-key.php';
$api_key = getGeminiApiKey();

// Get the input data from the request
$input = json_decode(file_get_contents("php://input"), true);

// Verificar se temos histórico de perguntas
if (!isset($input["historico"]) || !is_array($input["historico"]) || empty($input["historico"])) {
    echo json_encode([
        'error' => true,
        'message' => 'Histórico de perguntas não fornecido ou vazio'
    ]);
    exit;
}

$historico = $input["historico"];
$nome = isset($input["nome"]) ? $input["nome"] : "estudante";

// Extrair matérias e tópicos do histórico
$materias = [];
$topicos = [];
$perguntas = [];

foreach ($historico as $item) {
    if (isset($item["materia"]) && !empty($item["materia"])) {
        $materias[] = $item["materia"];
    }
    if (isset($item["topico"]) && !empty($item["topico"])) {
        $topicos[] = $item["topico"];
    }
    if (isset($item["pergunta"]) && !empty($item["pergunta"])) {
        $perguntas[] = $item["pergunta"];
    }
}

// Contar ocorrências
$materias_count = array_count_values($materias);
$topicos_count = array_count_values($topicos);

// Criar lista de matérias e tópicos para o prompt
$materias_lista = "";
foreach ($materias_count as $materia => $count) {
    $materias_lista .= "- $materia ($count perguntas)\n";
}

$topicos_lista = "";
foreach ($topicos_count as $topico => $count) {
    $topicos_lista .= "- $topico ($count perguntas)\n";
}

// Criar lista de perguntas para o prompt (limitada a 5 para não sobrecarregar)
$perguntas_lista = "";
$max_perguntas = min(count($perguntas), 5);
for ($i = 0; $i < $max_perguntas; $i++) {
    $perguntas_lista .= "- " . $perguntas[$i] . "\n";
}

// Criar prompt para o resumo de aprendizado
$prompt = "Crie um resumo de aprendizado para um estudante do 7º/8º ano chamado $nome que acabou de completar uma sessão de estudo. 

Durante esta sessão, o estudante trabalhou com as seguintes matérias:
$materias_lista

E os seguintes tópicos:
$topicos_lista

Algumas das perguntas que o estudante respondeu foram:
$perguntas_lista

Com base nessas informações, crie um resumo de aprendizado que:
1. Parabenize o estudante pelo esforço
2. Destaque os principais conceitos que foram praticados
3. Explique brevemente a importância desses conceitos no dia a dia ou em estudos futuros
4. Sugira 2-3 atividades práticas simples que o estudante poderia fazer para reforçar o aprendizado
5. Termine com uma mensagem motivacional

O resumo deve ser amigável, motivador e educativo. Use linguagem simples e direta, adequada para um estudante do 7º/8º ano. Limite o resumo a no máximo 300 palavras.";

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$api_key");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

// Create request body
$body = json_encode([
  "contents" => [
    [
      "parts" => [
        [
          "text" => $prompt
        ]
      ]
    ]
  ],
  "generationConfig" => [
    "temperature" => 0.7,
    "topP" => 0.95,
    "topK" => 40,
    "maxOutputTokens" => 800
  ]
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

// Execute cURL request
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro na requisição cURL: ' . curl_error($ch)
    ]);
    exit;
}

curl_close($ch);

// Process the response
try {
    $data = json_decode($response, true);
    
    // Check if the response has the expected structure
    if (isset($data["candidates"][0]["content"]["parts"][0]["text"])) {
        $texto = $data["candidates"][0]["content"]["parts"][0]["text"];
        
        // Return the learning summary
        echo json_encode([
            "resumo" => $texto,
            "materias" => array_keys($materias_count),
            "topicos" => array_keys($topicos_count),
            "total_perguntas" => count($perguntas)
        ]);
    } else {
        // Fallback summary if API fails
        $fallbackResumo = "Parabéns, $nome! 🎉

Você completou uma sessão de estudo com " . count($perguntas) . " perguntas sobre " . implode(", ", array_keys($materias_count)) . ".

Durante esta sessão, você praticou conceitos importantes que vão te ajudar tanto na escola quanto no dia a dia. Cada pergunta que você respondeu contribuiu para fortalecer seu conhecimento.

Continue praticando regularmente - lembre-se que o aprendizado é uma jornada, não uma corrida! 💪

Dica: Tente explicar para alguém o que você aprendeu hoje. Ensinar é uma das melhores formas de aprender!";
        
        echo json_encode([
            "resumo" => $fallbackResumo,
            "materias" => array_keys($materias_count),
            "topicos" => array_keys($topicos_count),
            "total_perguntas" => count($perguntas)
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao processar resposta: ' . $e->getMessage()
    ]);
}
?>
