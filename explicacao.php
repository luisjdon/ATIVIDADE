<?php
// Set appropriate headers for JSON response
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Get the input data from the request
$input = json_decode(file_get_contents("php://input"), true);

// Check if the input contains the question
if (!isset($input["pergunta"])) {
    echo json_encode([
        'error' => true,
        'message' => 'Pergunta não fornecida'
    ]);
    exit;
}

$pergunta = $input["pergunta"];

// Include the API key file
require_once 'api-key.php';
$api_key = getGeminiApiKey();

// Get the subject if provided
$materia = isset($input["materia"]) ? $input["materia"] : "";

// Create a detailed prompt for better explanations based on the subject
// Obter a resposta correta se disponível
$resposta = isset($input["resposta"]) ? $input["resposta"] : "";
$topico = isset($input["topico"]) ? $input["topico"] : "";

$prompt = "Explique de forma clara, simples e muito didática como resolver a seguinte questão";

// Add subject and topic information if available
if (!empty($materia)) {
    $prompt .= " de {$materia}";
    if (!empty($topico)) {
        $prompt .= " sobre {$topico}";
    }
}

$prompt .= " para um estudante com dificuldades de aprendizado da 7ª ou 8ª série:

\"$pergunta\"";

// Adicionar a resposta correta se disponível
if (!empty($resposta)) {
    $prompt .= "\n\nA resposta correta é: \"$resposta\"";
}

$prompt .= "\n\nImportante:
1. NÃO FORNEÇA A RESPOSTA DIRETA SOB NENHUMA CIRCUNSTÂNCIA, apenas explique o método de resolução.
2. Use linguagem extremamente simples, concreta e acessível, como se estivesse explicando para uma criança com dificuldades de aprendizado.
3. Divida a explicação em passos muito pequenos e bem detalhados, numerados de forma clara.
4. Use muitos exemplos visuais e concretos que a criança possa relacionar com sua vida cotidiana.
5. Repita os conceitos importantes de formas diferentes para reforçar o aprendizado.
6. Use frases curtas e diretas, evitando linguagem abstrata ou complexa.
7. Forneça dicas práticas que ajudem o estudante a chegar à resposta por conta própria.
8. Adapte sua explicação ao tipo de pergunta (matemática, português, ciências, história, geografia ou inglês).
9. Se a pergunta for sobre um livro específico, SEMPRE forneça um breve resumo do contexto relevante do livro no início da explicação, assumindo que o estudante pode não ter lido o livro. Inclua apenas o contexto mínimo necessário para entender a questão.
10. MUITO IMPORTANTE: Inclua no final uma seção chamada 'CONCEITOS IMPORTANTES' que liste em tópicos (3-5 itens) os principais conceitos que o estudante deve dominar para resolver este tipo de questão.
11. Encerre com uma pergunta reflexiva simples que ajude o estudante a verificar sua resposta.
12. Lembre-se que o estudante pode precisar ler várias vezes para entender, então seja paciente e use repetição estratégica de conceitos-chave.";

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
    "topK" => 40
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
        
        // Return the explanation
        echo json_encode(["explicacao" => $texto]);
    } else {
        // Fallback explanation if API fails - adaptado para qualquer matéria
        $fallbackExplicacao = "Para resolver este tipo de questão, vamos seguir passos bem simples:

1. Primeiro, vamos ler a pergunta com muita calma. Leia uma vez, respire, e leia de novo.

2. Vamos destacar as palavras importantes na pergunta. Quais são as palavras que nos dizem o que precisamos fazer?

3. Agora, vamos ver quais informações a pergunta nos dá. São como peças de um quebra-cabeça que precisamos juntar.

4. Se a pergunta for sobre um livro que você não leu, não se preocupe! Geralmente, a pergunta contém as informações necessárias para respondê-la. Foque nas informações que estão no texto da pergunta.

5. Pense: 'O que eu já sei sobre este assunto?' Tente lembrar de coisas parecidas que você já aprendeu.

6. Vamos resolver passo por passo, bem devagar:
   - Primeiro, organizamos as informações
   - Depois, pensamos em como usá-las
   - Por último, chegamos à resposta

7. Quando terminar, verifique seu trabalho. A resposta faz sentido? Ela responde o que a pergunta pedia?

8. Se ficar difícil, não desista! Tente desenhar o problema, ou usar objetos reais para ajudar a entender.

Lembre-se: está tudo bem precisar de mais tempo para entender. O importante é continuar tentando!

Dica: Se a pergunta for sobre um livro que você não conhece, converse com seu professor. Ele pode te dar um resumo rápido ou ajudar de outra forma.";
        
        echo json_encode(["explicacao" => $fallbackExplicacao]);
    }
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao processar resposta: ' . $e->getMessage()
    ]);
}
?>
