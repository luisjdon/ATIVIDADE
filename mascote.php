<?php
// Set appropriate headers for JSON response
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Include the API key file
require_once 'api-key.php';
$api_key = getGeminiApiKey();

// Get the input data from the request
$input = json_decode(file_get_contents("php://input"), true);

// Check if the input contains the message
if (!isset($input["mensagem"])) {
    echo json_encode([
        'error' => true,
        'message' => 'Mensagem não fornecida'
    ]);
    exit;
}

$mensagem = $input["mensagem"];
$nome = isset($input["nome"]) ? $input["nome"] : "estudante";

// Create a prompt for the mascot's response
$prompt = "Você é um mascote virtual educativo chamado 'Matix' para um aplicativo de matemática para estudantes do 7º e 8º ano. 
Responda à mensagem do estudante de forma divertida, motivadora e amigável.

Regras importantes:
1. NÃO forneça respostas diretas para problemas matemáticos.
2. NÃO dê dicas específicas sobre como resolver problemas.
3. Mantenha suas respostas MUITO CURTAS (máximo 2 frases).
4. Use linguagem amigável e adequada para crianças.
5. Seja encorajador e positivo.
6. Inclua emojis para tornar a resposta mais divertida.
7. Evite respostas genéricas demais.

Mensagem do estudante: \"$mensagem\"
Nome do estudante: \"$nome\"

Sua resposta (lembre-se: máximo 2 frases curtas com emojis):";

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
    "temperature" => 0.8,
    "topP" => 0.95,
    "topK" => 40,
    "maxOutputTokens" => 100
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
        
        // Return the mascot's response
        echo json_encode(["resposta" => $texto]);
    } else {
        // Fallback responses if API fails
        $fallbackRespostas = [
            "Estou aqui para te ajudar! Continue praticando! 🌟",
            "Você está indo muito bem! Continue assim! 🚀",
            "Matemática é como um jogo, quanto mais você pratica, melhor fica! 🎮",
            "Não desista, você consegue! 💪",
            "Errar faz parte do aprendizado! 📚",
            "Vamos continuar juntos nessa aventura matemática! 🧩"
        ];
        
        echo json_encode(["resposta" => $fallbackRespostas[array_rand($fallbackRespostas)]]);
    }
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao processar resposta: ' . $e->getMessage()
    ]);
}
?>
