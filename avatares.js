/**
 * AVATARES.JS
 * Sistema de avatares para o Desafio de Matemática
 * Permite que o usuário selecione e personalize seu avatar
 */

// Variáveis globais
let avatares = [];
let avatarSelecionado = null;

/**
 * Inicializa o sistema de avatares
 */
function inicializarAvatares() {
    // Carregar avatar salvo do localStorage
    const avatarSalvoId = localStorage.getItem('avatar_id');
    
    // Carregar lista de avatares do servidor
    carregarAvatares()
        .then(() => {
            if (avatarSalvoId) {
                // Selecionar avatar salvo
                const avatarSalvo = avatares.find(avatar => avatar.id === avatarSalvoId);
                if (avatarSalvo) {
                    selecionarAvatar(avatarSalvo);
                }
            }
        });
    
    // Adicionar evento para abrir o seletor de avatares
    const botaoAvatar = document.getElementById('botao-avatar');
    if (botaoAvatar) {
        botaoAvatar.addEventListener('click', abrirSeletorAvatares);
    }
}

/**
 * Carrega a lista de avatares do servidor
 * @returns {Promise} Promessa que resolve quando os avatares são carregados
 */
function carregarAvatares() {
    return fetch('avatares.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        if (data.avatares) {
            avatares = data.avatares;
            return avatares;
        } else {
            console.error('Erro ao carregar avatares:', data.message || 'Resposta inválida');
            return [];
        }
    })
    .catch(erro => {
        console.error('Erro ao carregar avatares:', erro);
        return [];
    });
}

/**
 * Abre o modal de seleção de avatares
 */
function abrirSeletorAvatares() {
    // Criar o modal se não existir
    let modal = document.getElementById('modal-avatares');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-avatares';
        modal.className = 'modal';
        
        const modalConteudo = document.createElement('div');
        modalConteudo.className = 'modal-conteudo';
        
        const titulo = document.createElement('h2');
        titulo.textContent = 'Escolha seu Avatar';
        
        const fechar = document.createElement('span');
        fechar.className = 'fechar';
        fechar.textContent = '×';
        fechar.onclick = fecharModal;
        
        const filtros = document.createElement('div');
        filtros.className = 'filtros-avatar';
        filtros.innerHTML = `
            <button data-tipo="todos" class="filtro-ativo">Todos</button>
            <button data-tipo="animais">Animais</button>
            <button data-tipo="fantasia">Fantasia</button>
            <button data-tipo="estudantes">Estudantes</button>
            <button data-tipo="profissoes">Profissões</button>
            <button data-tipo="comidas">Comidas</button>
        `;
        
        // Adicionar eventos aos filtros
        filtros.querySelectorAll('button').forEach(botao => {
            botao.addEventListener('click', (e) => {
                // Atualizar classe ativa
                filtros.querySelectorAll('button').forEach(b => b.classList.remove('filtro-ativo'));
                e.target.classList.add('filtro-ativo');
                
                // Filtrar avatares
                const tipo = e.target.dataset.tipo;
                if (tipo === 'todos') {
                    carregarAvatares().then(renderizarAvatares);
                } else {
                    fetch('avatares.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ tipo: tipo })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.avatares) {
                            renderizarAvatares(data.avatares);
                        }
                    });
                }
            });
        });
        
        const gridAvatares = document.createElement('div');
        gridAvatares.className = 'grid-avatares';
        gridAvatares.id = 'grid-avatares';
        
        const botaoSalvar = document.createElement('button');
        botaoSalvar.className = 'botao-salvar';
        botaoSalvar.textContent = 'Salvar Avatar';
        botaoSalvar.onclick = salvarAvatar;
        
        modalConteudo.appendChild(fechar);
        modalConteudo.appendChild(titulo);
        modalConteudo.appendChild(filtros);
        modalConteudo.appendChild(gridAvatares);
        modalConteudo.appendChild(botaoSalvar);
        
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
            
            .modal-conteudo {
                background-color: #fff;
                margin: 10% auto;
                padding: 20px;
                border-radius: 10px;
                width: 80%;
                max-width: 600px;
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
            
            .grid-avatares {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                gap: 15px;
                margin: 20px 0;
                max-height: 300px;
                overflow-y: auto;
                padding: 10px;
            }
            
            .avatar-item {
                text-align: center;
                cursor: pointer;
                padding: 10px;
                border-radius: 8px;
                transition: all 0.2s;
            }
            
            .avatar-item:hover {
                background-color: #f0f0f0;
            }
            
            .avatar-item.selecionado {
                background-color: #e0f7fa;
                border: 2px solid #00bcd4;
            }
            
            .avatar-img {
                width: 80px;
                height: 80px;
                object-fit: contain;
            }
            
            .avatar-nome {
                font-size: 12px;
                margin-top: 5px;
            }
            
            .botao-salvar {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                display: block;
                margin: 0 auto;
            }
            
            .filtros-avatar {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
            }
            
            .filtros-avatar button {
                background-color: #f0f0f0;
                border: none;
                padding: 8px 12px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .filtros-avatar button.filtro-ativo {
                background-color: #00bcd4;
                color: white;
            }
            
            #avatar-display {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                object-fit: contain;
                background-color: #f0f0f0;
            }
            
            #botao-avatar {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Mostrar o modal
    modal.style.display = 'block';
    
    // Renderizar os avatares
    renderizarAvatares(avatares);
}

/**
 * Renderiza os avatares no grid
 * @param {Array} listaAvatares Lista de avatares para renderizar
 */
function renderizarAvatares(listaAvatares) {
    const grid = document.getElementById('grid-avatares');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    listaAvatares.forEach(avatar => {
        const item = document.createElement('div');
        item.className = 'avatar-item';
        if (avatarSelecionado && avatar.id === avatarSelecionado.id) {
            item.classList.add('selecionado');
        }
        
        const img = document.createElement('img');
        img.src = avatar.url;
        img.alt = avatar.nome;
        img.className = 'avatar-img';
        
        const nome = document.createElement('div');
        nome.className = 'avatar-nome';
        nome.textContent = avatar.nome;
        
        item.appendChild(img);
        item.appendChild(nome);
        
        item.addEventListener('click', () => {
            // Remover seleção anterior
            const itensSelecionados = grid.querySelectorAll('.avatar-item.selecionado');
            itensSelecionados.forEach(i => i.classList.remove('selecionado'));
            
            // Selecionar novo avatar
            item.classList.add('selecionado');
            avatarSelecionado = avatar;
        });
        
        grid.appendChild(item);
    });
}

/**
 * Fecha o modal de seleção de avatares
 */
function fecharModal() {
    const modal = document.getElementById('modal-avatares');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Salva o avatar selecionado
 */
function salvarAvatar() {
    if (!avatarSelecionado) {
        alert('Por favor, selecione um avatar primeiro.');
        return;
    }
    
    // Salvar no servidor
    fetch('avatares.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'salvar',
            avatar_id: avatarSelecionado.id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Salvar localmente
            localStorage.setItem('avatar_id', avatarSelecionado.id);
            
            // Atualizar avatar exibido
            atualizarAvatarExibido();
            
            // Fechar modal
            fecharModal();
        } else {
            alert('Erro ao salvar avatar: ' + (data.message || 'Erro desconhecido'));
        }
    })
    .catch(erro => {
        console.error('Erro ao salvar avatar:', erro);
        alert('Erro ao salvar avatar. Por favor, tente novamente.');
    });
}

/**
 * Seleciona um avatar
 * @param {Object} avatar Avatar a ser selecionado
 */
function selecionarAvatar(avatar) {
    avatarSelecionado = avatar;
    atualizarAvatarExibido();
}

/**
 * Atualiza o avatar exibido na interface
 */
function atualizarAvatarExibido() {
    if (!avatarSelecionado) return;
    
    // Atualizar imagem do avatar no botão
    const avatarDisplay = document.getElementById('avatar-display');
    if (avatarDisplay) {
        avatarDisplay.src = avatarSelecionado.url;
    } else {
        // Criar botão de avatar se não existir
        const header = document.querySelector('header') || document.body;
        
        const botaoAvatar = document.createElement('button');
        botaoAvatar.id = 'botao-avatar';
        botaoAvatar.title = 'Alterar Avatar';
        botaoAvatar.addEventListener('click', abrirSeletorAvatares);
        
        const img = document.createElement('img');
        img.id = 'avatar-display';
        img.src = avatarSelecionado.url;
        img.alt = 'Seu Avatar';
        
        botaoAvatar.appendChild(img);
        
        // Inserir no início do header ou body
        header.insertBefore(botaoAvatar, header.firstChild);
    }
}

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', inicializarAvatares);

// Exportar funções para uso em outros arquivos
window.avatares = {
    inicializar: inicializarAvatares,
    abrir: abrirSeletorAvatares,
    obterAvatarAtual: () => avatarSelecionado
};
