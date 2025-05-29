<?php
// Set appropriate headers for JSON response
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Get the input data from the request
$input = json_decode(file_get_contents("php://input"), true);

// Função para salvar o avatar selecionado
if (isset($input['action']) && $input['action'] === 'salvar') {
    if (!isset($input['avatar_id'])) {
        echo json_encode([
            'error' => true,
            'message' => 'ID do avatar não fornecido'
        ]);
        exit;
    }
    
    // Aqui você pode salvar o avatar no banco de dados ou em um arquivo de configuração
    // Por enquanto, vamos apenas retornar sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Avatar salvo com sucesso',
        'avatar_id' => $input['avatar_id']
    ]);
    exit;
}

// Lista de avatares disponíveis
// Usando imagens de personagens fofinhos disponíveis gratuitamente na internet
$avatares = [
    // Personagens de Desenhos
    [
        'id' => 'personagem-1',
        'nome' => 'Panda Fofo',
        'url' => 'https://img.freepik.com/free-vector/cute-panda-with-bamboo_138676-3053.jpg',
        'tipo' => 'animais'
    ],
    [
        'id' => 'personagem-2',
        'nome' => 'Gatinho',
        'url' => 'https://img.freepik.com/free-vector/cute-cat-sitting-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4148.jpg',
        'tipo' => 'animais'
    ],
    [
        'id' => 'personagem-3',
        'nome' => 'Unicórnio',
        'url' => 'https://img.freepik.com/free-vector/cute-unicorn-flying-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4241.jpg',
        'tipo' => 'fantasia'
    ],
    [
        'id' => 'personagem-4',
        'nome' => 'Dinossauro',
        'url' => 'https://img.freepik.com/free-vector/cute-dinosaur-cartoon-icon-illustration_138676-2878.jpg',
        'tipo' => 'animais'
    ],
    [
        'id' => 'personagem-5',
        'nome' => 'Astronauta',
        'url' => 'https://img.freepik.com/free-vector/astronaut-holding-ice-cream-cartoon-vector-icon-illustration-science-food-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3329.jpg',
        'tipo' => 'profissoes'
    ],
    [
        'id' => 'personagem-6',
        'nome' => 'Cientista',
        'url' => 'https://img.freepik.com/free-vector/scientist-kids-cartoon-icon-illustration-people-science-icon-concept-isolated-flat-cartoon-style_138676-2107.jpg',
        'tipo' => 'profissoes'
    ],
    
    // Personagens de Estudantes
    [
        'id' => 'estudante-1',
        'nome' => 'Estudante Feliz',
        'url' => 'https://img.freepik.com/free-vector/cute-boy-going-school-cartoon-vector-icon-illustration-people-education-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3931.jpg',
        'tipo' => 'estudantes'
    ],
    [
        'id' => 'estudante-2',
        'nome' => 'Menina Estudante',
        'url' => 'https://img.freepik.com/free-vector/cute-girl-with-book-cartoon-vector-icon-illustration-people-education-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3984.jpg',
        'tipo' => 'estudantes'
    ],
    
    // Personagens de Fantasia
    [
        'id' => 'fantasia-1',
        'nome' => 'Fada',
        'url' => 'https://img.freepik.com/free-vector/cute-fairy-flying-cartoon-vector-icon-illustration-people-fantasy-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3461.jpg',
        'tipo' => 'fantasia'
    ],
    [
        'id' => 'fantasia-2',
        'nome' => 'Mago',
        'url' => 'https://img.freepik.com/free-vector/cute-wizard-holding-magic-wand-cartoon-vector-icon-illustration-people-magic-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3869.jpg',
        'tipo' => 'fantasia'
    ],
    
    // Personagens de Comida
    [
        'id' => 'comida-1',
        'nome' => 'Cupcake',
        'url' => 'https://img.freepik.com/free-vector/cute-cupcake-cartoon-vector-icon-illustration-sweet-food-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3700.jpg',
        'tipo' => 'comidas'
    ],
    [
        'id' => 'comida-2',
        'nome' => 'Pizza',
        'url' => 'https://img.freepik.com/free-vector/cute-pizza-cartoon-vector-icon-illustration-fast-food-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-3572.jpg',
        'tipo' => 'comidas'
    ]
];

// Filtrar por tipo se solicitado
if (isset($input['tipo']) && !empty($input['tipo'])) {
    $tipo = $input['tipo'];
    $avatares_filtrados = array_filter($avatares, function($avatar) use ($tipo) {
        return $avatar['tipo'] === $tipo;
    });
    $avatares = array_values($avatares_filtrados);
}

// Retornar a lista de avatares
echo json_encode([
    'avatares' => $avatares
]);
?>
