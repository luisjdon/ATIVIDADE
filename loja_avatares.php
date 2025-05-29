<?php
// Set appropriate headers for JSON response
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Get the input data from the request
$input = json_decode(file_get_contents("php://input"), true);

// Função para comprar um avatar
if (isset($input['action']) && $input['action'] === 'comprar') {
    if (!isset($input['avatar_id'])) {
        echo json_encode([
            'error' => true,
            'message' => 'ID do avatar não fornecido'
        ]);
        exit;
    }
    
    // Aqui você implementaria a lógica para verificar se o usuário tem moedas suficientes
    // e para registrar a compra no banco de dados
    
    // Por enquanto, vamos apenas retornar sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Avatar comprado com sucesso',
        'avatar_id' => $input['avatar_id']
    ]);
    exit;
}

// Função para equipar um avatar
if (isset($input['action']) && $input['action'] === 'equipar') {
    if (!isset($input['avatar_id'])) {
        echo json_encode([
            'error' => true,
            'message' => 'ID do avatar não fornecido'
        ]);
        exit;
    }
    
    // Aqui você implementaria a lógica para equipar o avatar
    
    // Por enquanto, vamos apenas retornar sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Avatar equipado com sucesso',
        'avatar_id' => $input['avatar_id']
    ]);
    exit;
}

// Lista de avatares disponíveis na loja
$avatares_loja = [
    [
        'id' => 'padrao',
        'nome' => 'Avatar Padrão',
        'descricao' => 'Avatar padrão do sistema',
        'preco' => 0,
        'equipado' => true,
        'url' => 'https://img.freepik.com/free-vector/cute-cat-studying-cartoon-vector-icon-illustration-animal-education-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4029.jpg',
        'efeito_especial' => 'Nenhum efeito especial',
        'tipo' => 'gratuito'
    ],
    [
        'id' => 'princesa',
        'nome' => 'Avatar Princesa',
        'descricao' => 'Um avatar mágico com tema de princesa',
        'preco' => 100,
        'equipado' => false,
        'url' => 'https://img.freepik.com/free-vector/cute-princess-with-magic-wand-cartoon-vector-icon-illustration-people-fantasy-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3922.jpg',
        'efeito_especial' => 'Brilhos ao acertar questões',
        'tipo' => 'premium'
    ],
    [
        'id' => 'gamer',
        'nome' => 'Avatar Gamer',
        'descricao' => 'Avatar com tema gamer, perfeito para os amantes de jogos',
        'preco' => 150,
        'equipado' => false,
        'url' => 'https://img.freepik.com/free-vector/cute-boy-gaming-cartoon-vector-icon-illustration-people-technology-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3714.jpg',
        'efeito_especial' => 'Sons de videogame ao ganhar moedas',
        'tipo' => 'premium'
    ],
    [
        'id' => 'robo',
        'nome' => 'Avatar Robô',
        'descricao' => 'Um robô futurista para suas aventuras matemáticas',
        'preco' => 200,
        'equipado' => false,
        'url' => 'https://img.freepik.com/free-vector/cute-robot-flying-cartoon-vector-icon-illustration-technology-science-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3669.jpg',
        'efeito_especial' => 'Voz robótica nas mensagens do mascote',
        'tipo' => 'premium'
    ],
    [
        'id' => 'astronauta',
        'nome' => 'Avatar Astronauta',
        'descricao' => 'Explore o universo da matemática como um astronauta',
        'preco' => 250,
        'equipado' => false,
        'url' => 'https://img.freepik.com/free-vector/astronaut-holding-ice-cream-cartoon-vector-icon-illustration-science-food-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3329.jpg',
        'efeito_especial' => 'Animação de gravidade zero ao subir de nível',
        'tipo' => 'premium'
    ]
];

// Retornar a lista de avatares da loja
echo json_encode([
    'avatares' => $avatares_loja
]);
?>
