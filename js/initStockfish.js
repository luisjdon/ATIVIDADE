// Função para inicializar o Stockfish
function initStockfish() {
    // Verificar se o Stockfish já está inicializado
    if (stockfish) {
        return;
    }
    
    try {
        // Criar um novo Web Worker para o Stockfish
        stockfish = new Worker('js/stockfish.js');
        
        // Configurar o Stockfish
        stockfish.postMessage('uci');
        stockfish.postMessage('setoption name Threads value 4');
        stockfish.postMessage('setoption name Hash value 16');
        stockfish.postMessage('isready');
        
        console.log('Stockfish inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar Stockfish:', error);
        useStockfish = false;
    }
}

// Função para obter a melhor jogada do Stockfish
function getBestMoveFromStockfish(fen, depth) {
    return new Promise((resolve) => {
        // Inicializar o Stockfish se necessário
        if (!stockfish) {
            initStockfish();
        }
        
        // Configurar o callback para receber a resposta
        stockfish.onmessage = function(event) {
            const message = event.data;
            
            // Verificar se a mensagem contém a melhor jogada
            if (message.startsWith('bestmove')) {
                const move = message.split(' ')[1];
                resolve(move);
            }
        };
        
        // Enviar a posição atual para o Stockfish
        stockfish.postMessage('position fen ' + fen);
        
        // Solicitar a melhor jogada com a profundidade especificada
        stockfish.postMessage('go depth ' + depth);
    });
}
