/**
 * LOJA_AVATARES.JS
 * Sistema de loja de avatares para o Desafio de Matemática
 * Permite que o usuário compre e equipe avatares com moedas ganhas no jogo
 */

// Variáveis globais
let avatares_loja = [];
let moedasUsuario = 0;

/**
 * Inicializa o sistema de loja de avatares
 */
function inicializarLojaAvatares() {
    // Carregar moedas do usuário do localStorage
    moedasUsuario = parseInt(localStorage.getItem('moedas') || '0');
    
    // Carregar lista de avatares da loja
    carregarAvatares()
        .then(() => {
            // Verificar avatares já comprados
            verificarAvataresPossuidos();
        });
    
    // Adicionar evento para abrir a loja de avatares
    const botaoLoja = document.getElementById('botao-loja-avatares');
    if (botaoLoja) {
        botaoLoja.addEventListener('click', abrirLojaAvatares);
    }
}

/**
 * Carrega a lista de avatares da loja
 * @returns {Promise} Promessa que resolve quando os avatares são carregados
 */
function carregarAvatares() {
    return fetch('loja_avatares.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.avatares) {
            avatares_loja = data.avatares;
            return avatares_loja;
        } else {
            console.error('Erro ao carregar avatares da loja:', data.message || 'Resposta inválida');
            return [];
        }
    })
    .catch(erro => {
        console.error('Erro ao carregar avatares da loja:', erro);
        return [];
    });
}

/**
 * Verifica quais avatares o usuário já possui
 */
function verificarAvataresPossuidos() {
    // Obter lista de avatares comprados do localStorage
    const avataresPossuidos = JSON.parse(localStorage.getItem('avatares_possuidos') || '["padrao"]');
    const avatarEquipado = localStorage.getItem('avatar_equipado') || 'padrao';
    
    // Atualizar status dos avatares
    avatares_loja.forEach(avatar => {
        avatar.possuido = avataresPossuidos.includes(avatar.id);
        avatar.equipado = (avatar.id === avatarEquipado);
    });
}

/**
 * Abre a loja de avatares
 */
function abrirLojaAvatares() {
    // Atualizar moedas do usuário
    moedasUsuario = parseInt(localStorage.getItem('moedas') || '0');
    
    // Criar o modal se não existir
    let modal = document.getElementById('modal-loja-avatares');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-loja-avatares';
        modal.className = 'modal';
        
        const modalConteudo = document.createElement('div');
        modalConteudo.className = 'modal-conteudo loja';
        
        const titulo = document.createElement('h2');
        titulo.textContent = 'Loja de Avatares';
        
        const moedas = document.createElement('div');
        moedas.className = 'moedas-display';
        moedas.innerHTML = `<img src="imagens/moeda.png" alt="Moedas" class="icone-moeda"> <span id="moedas-valor">${moedasUsuario}</span>`;
        
        const fechar = document.createElement('span');
        fechar.className = 'fechar';
        fechar.textContent = '×';
        fechar.onclick = fecharModal;
        
        const gridAvatares = document.createElement('div');
        gridAvatares.className = 'grid-loja-avatares';
        gridAvatares.id = 'grid-loja-avatares';
        
        modalConteudo.appendChild(fechar);
        modalConteudo.appendChild(titulo);
        modalConteudo.appendChild(moedas);
        modalConteudo.appendChild(gridAvatares);
        
        modal.appendChild(modalConteudo);
        document.body.appendChild(modal);
        
        // Adicionar estilos CSS
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.7);
            }
            
            .modal-conteudo.loja {
                background-color: #fff;
                margin: 5% auto;
                padding: 20px;
                border-radius: 10px;
                width: 90%;
                max-width: 800px;
                position: relative;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            
            .fechar {
                position: absolute;
                right: 15px;
                top: 10px;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
            }
            
            .grid-loja-avatares {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
                margin: 20px 0;
                max-height: 70vh;
                overflow-y: auto;
                padding: 10px;
            }
            
            .avatar-card {
                background-color: #f8f9fa;
                border-radius: 10px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                transition: transform 0.2s;
            }
            
            .avatar-card:hover {
                transform: translateY(-5px);
            }
            
            .avatar-img-container {
                width: 120px;
                height: 120px;
                margin-bottom: 10px;
                border-radius: 50%;
                overflow: hidden;
                background-color: #e9ecef;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .avatar-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .avatar-nome {
                font-size: 18px;
                font-weight: bold;
                margin: 5px 0;
                color: #343a40;
            }
            
            .avatar-descricao {
                font-size: 14px;
                color: #6c757d;
                text-align: center;
                margin-bottom: 10px;
                height: 40px;
            }
            
            .avatar-efeito {
                font-size: 12px;
                color: #6610f2;
                font-style: italic;
                margin-bottom: 15px;
                text-align: center;
                height: 30px;
            }
            
            .avatar-preco {
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 10px 0;
                font-weight: bold;
                color: #fd7e14;
            }
            
            .icone-moeda {
                width: 20px;
                height: 20px;
                margin-right: 5px;
            }
            
            .moedas-display {
                position: absolute;
                top: 15px;
                right: 50px;
                display: flex;
                align-items: center;
                font-weight: bold;
                color: #fd7e14;
                font-size: 18px;
            }
            
            .botao-comprar, .botao-equipar {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                transition: background-color 0.2s;
                width: 100%;
                max-width: 150px;
            }
            
            .botao-comprar:hover, .botao-equipar:hover {
                background-color: #45a049;
            }
            
            .botao-equipar {
                background-color: #007bff;
            }
            
            .botao-equipar:hover {
                background-color: #0069d9;
            }
            
            .botao-equipado {
                background-color: #6c757d;
                cursor: default;
            }
            
            .botao-equipado:hover {
                background-color: #6c757d;
            }
            
            .gratuito {
                color: #28a745;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Mostrar o modal
    modal.style.display = 'block';
    
    // Atualizar exibição de moedas
    const moedasValor = document.getElementById('moedas-valor');
    if (moedasValor) {
        moedasValor.textContent = moedasUsuario;
    }
    
    // Renderizar os avatares da loja
    renderizarAvatares();
}

/**
 * Renderiza os avatares na loja
 */
function renderizarAvatares() {
    const grid = document.getElementById('grid-loja-avatares');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Verificar avatares possuídos
    verificarAvataresPossuidos();
    
    avatares_loja.forEach(avatar => {
        const card = document.createElement('div');
        card.className = 'avatar-card';
        
        const imgContainer = document.createElement('div');
        imgContainer.className = 'avatar-img-container';
        
        const img = document.createElement('img');
        img.src = avatar.url;
        img.alt = avatar.nome;
        img.className = 'avatar-img';
        
        imgContainer.appendChild(img);
        
        const nome = document.createElement('div');
        nome.className = 'avatar-nome';
        nome.textContent = avatar.nome;
        
        const descricao = document.createElement('div');
        descricao.className = 'avatar-descricao';
        descricao.textContent = avatar.descricao;
        
        const efeito = document.createElement('div');
        efeito.className = 'avatar-efeito';
        efeito.textContent = `Efeito especial: ${avatar.efeito_especial}`;
        
        const preco = document.createElement('div');
        preco.className = 'avatar-preco';
        
        if (avatar.preco === 0) {
            preco.innerHTML = `<span class="gratuito">Gratuito</span>`;
        } else {
            preco.innerHTML = `<img src="imagens/moeda.png" alt="Moedas" class="icone-moeda"> ${avatar.preco}`;
        }
        
        const botao = document.createElement('button');
        
        if (avatar.possuido) {
            if (avatar.equipado) {
                botao.className = 'botao-equipado';
                botao.textContent = 'Equipada';
                botao.disabled = true;
            } else {
                botao.className = 'botao-equipar';
                botao.textContent = 'Equipar';
                botao.onclick = () => equiparAvatar(avatar.id);
            }
        } else {
            botao.className = 'botao-comprar';
            botao.textContent = 'Comprar';
            botao.onclick = () => comprarAvatar(avatar.id, avatar.preco);
            
            // Desabilitar botão se não tiver moedas suficientes
            if (moedasUsuario < avatar.preco) {
                botao.disabled = true;
                botao.title = 'Moedas insuficientes';
                botao.style.opacity = '0.7';
                botao.style.cursor = 'not-allowed';
            }
        }
        
        card.appendChild(imgContainer);
        card.appendChild(nome);
        card.appendChild(descricao);
        card.appendChild(efeito);
        card.appendChild(preco);
        card.appendChild(botao);
        
        grid.appendChild(card);
    });
}

/**
 * Compra um avatar
 * @param {string} avatarId ID do avatar a ser comprado
 * @param {number} preco Preço do avatar
 */
function comprarAvatar(avatarId, preco) {
    // Verificar se tem moedas suficientes
    if (moedasUsuario < preco) {
        alert('Você não tem moedas suficientes para comprar este avatar!');
        return;
    }
    
    // Enviar requisição para o servidor
    fetch('loja_avatares.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'comprar',
            avatar_id: avatarId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Atualizar moedas
            moedasUsuario -= preco;
            localStorage.setItem('moedas', moedasUsuario);
            
            // Atualizar lista de avatares possuídos
            const avataresPossuidos = JSON.parse(localStorage.getItem('avatares_possuidos') || '["padrao"]');
            if (!avataresPossuidos.includes(avatarId)) {
                avataresPossuidos.push(avatarId);
                localStorage.setItem('avatares_possuidos', JSON.stringify(avataresPossuidos));
            }
            
            // Atualizar exibição
            const moedasValor = document.getElementById('moedas-valor');
            if (moedasValor) {
                moedasValor.textContent = moedasUsuario;
            }
            
            // Renderizar avatares novamente
            renderizarAvatares();
            
            // Mostrar mensagem de sucesso
            alert('Avatar comprado com sucesso!');
        } else {
            alert('Erro ao comprar avatar: ' + (data.message || 'Erro desconhecido'));
        }
    })
    .catch(erro => {
        console.error('Erro ao comprar avatar:', erro);
        alert('Erro ao comprar avatar. Por favor, tente novamente.');
    });
}

/**
 * Equipa um avatar
 * @param {string} avatarId ID do avatar a ser equipado
 */
function equiparAvatar(avatarId) {
    // Enviar requisição para o servidor
    fetch('loja_avatares.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'equipar',
            avatar_id: avatarId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Atualizar avatar equipado
            localStorage.setItem('avatar_equipado', avatarId);
            
            // Renderizar avatares novamente
            renderizarAvatares();
            
            // Atualizar avatar exibido
            atualizarAvatarExibido(avatarId);
            
            // Mostrar mensagem de sucesso
            alert('Avatar equipado com sucesso!');
        } else {
            alert('Erro ao equipar avatar: ' + (data.message || 'Erro desconhecido'));
        }
    })
    .catch(erro => {
        console.error('Erro ao equipar avatar:', erro);
        alert('Erro ao equipar avatar. Por favor, tente novamente.');
    });
}

/**
 * Atualiza o avatar exibido na interface
 * @param {string} avatarId ID do avatar equipado
 */
function atualizarAvatarExibido(avatarId) {
    const avatar = avatares_loja.find(a => a.id === avatarId);
    if (!avatar) return;
    
    // Atualizar imagem do avatar no cabeçalho
    const avatarDisplay = document.getElementById('avatar-display');
    if (avatarDisplay) {
        avatarDisplay.src = avatar.url;
    }
}

/**
 * Fecha o modal da loja de avatares
 */
function fecharModal() {
    const modal = document.getElementById('modal-loja-avatares');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', inicializarLojaAvatares);

// Exportar funções para uso em outros arquivos
window.lojaAvatares = {
    inicializar: inicializarLojaAvatares,
    abrir: abrirLojaAvatares
};
