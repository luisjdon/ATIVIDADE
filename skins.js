/**
 * SKINS.JS
 * Sistema de skins/avatares para o Desafio Supremo
 * Permite comprar, equipar e gerenciar avatares personalizados
 */

// Variáveis de controle
let skinAtiva = 'padrao';
let skinsDisponiveis = [];
let skinsPossuidas = [];

// Catálogo de skins disponíveis
const catalogoSkins = [
    {
        id: 'padrao',
        nome: 'Avatar Padrão',
        imagem: 'assets/avatars/padrao.png',
        preco: 0,
        descricao: 'Avatar padrão do sistema'
    },
    {
        id: 'princesa',
        nome: 'Avatar Princesa',
        imagem: 'assets/avatars/princesa.png',
        preco: 100,
        descricao: 'Um avatar mágico com tema de princesa',
        efeito: 'Efeito especial: Brilhos ao acertar questões'
    },
    {
        id: 'gamer',
        nome: 'Avatar Gamer',
        imagem: 'assets/avatars/gamer.png',
        preco: 150,
        descricao: 'Avatar com tema gamer, perfeito para os amantes de jogos',
        efeito: 'Efeito especial: Sons de videogame ao ganhar moedas'
    },
    {
        id: 'robo',
        nome: 'Avatar Robô',
        imagem: 'assets/avatars/robo.png',
        preco: 200,
        descricao: 'Um robô futurista para suas aventuras matemáticas',
        efeito: 'Efeito especial: Voz robótica nas mensagens do mascote'
    },
    {
        id: 'astronauta',
        nome: 'Avatar Astronauta',
        imagem: 'assets/avatars/astronauta.png',
        preco: 250,
        descricao: 'Explore o universo da matemática como um astronauta',
        efeito: 'Efeito especial: Animação de gravidade zero ao subir de nível'
    }
];

// Inicializar o sistema de skins
document.addEventListener('DOMContentLoaded', () => {
    // Carregar skins salvas
    carregarSkins();
    
    // Configurar botão da loja se existir
    const btnLoja = document.getElementById('btnLoja');
    if (btnLoja) {
        btnLoja.addEventListener('click', abrirLojaSkins);
    }
    
    // Atualizar avatar atual
    atualizarAvatar();
});

/**
 * Carrega as skins salvas do localStorage
 */
function carregarSkins() {
    // Carregar skins possuídas
    const skinsSalvas = localStorage.getItem("skinsPossuidas");
    if (skinsSalvas) {
        skinsPossuidas = JSON.parse(skinsSalvas);
    } else {
        // Por padrão, o usuário possui apenas a skin padrão
        skinsPossuidas = ['padrao'];
        localStorage.setItem("skinsPossuidas", JSON.stringify(skinsPossuidas));
    }
    
    // Carregar skin ativa
    const skinAtivaSalva = localStorage.getItem("skinAtiva");
    if (skinAtivaSalva) {
        skinAtiva = skinAtivaSalva;
    } else {
        // Por padrão, a skin ativa é a padrão
        skinAtiva = 'padrao';
        localStorage.setItem("skinAtiva", skinAtiva);
    }
}

/**
 * Abre a loja de skins
 */
function abrirLojaSkins() {
    // Verificar se o modal já existe
    let modalLoja = document.getElementById('modalLoja');
    
    if (!modalLoja) {
        // Criar o modal da loja
        modalLoja = document.createElement('div');
        modalLoja.id = 'modalLoja';
        modalLoja.className = 'modal';
        
        // Conteúdo do modal
        modalLoja.innerHTML = `
            <div class="modal-content loja-content">
                <span class="close" id="fecharLoja">&times;</span>
                <div class="loja-header">
                    <i class="fas fa-store"></i>
                    <h2>Loja de Avatares</h2>
                    <div class="moedas-display">
                        <i class="fas fa-coins"></i> <span id="moedasLoja">${moedas}</span>
                    </div>
                </div>
                <div class="loja-body" id="skinsCatalogo">
                    <!-- O catálogo será preenchido dinamicamente -->
                </div>
            </div>
        `;
        
        // Adicionar o modal ao corpo do documento
        document.body.appendChild(modalLoja);
        
        // Configurar eventos
        document.getElementById('fecharLoja').addEventListener('click', fecharLojaSkins);
    } else {
        // Se o modal já existe, apenas atualizar o saldo de moedas
        document.getElementById('moedasLoja').textContent = moedas;
    }
    
    // Preencher o catálogo de skins
    preencherCatalogoSkins();
    
    // Exibir o modal
    modalLoja.style.display = 'block';
}

/**
 * Preenche o catálogo de skins na loja
 */
function preencherCatalogoSkins() {
    const catalogo = document.getElementById('skinsCatalogo');
    if (!catalogo) return;
    
    // Limpar o catálogo
    catalogo.innerHTML = '';
    
    // Adicionar cada skin ao catálogo
    catalogoSkins.forEach(skin => {
        const possuiSkin = skinsPossuidas.includes(skin.id);
        const skinAtual = skin.id === skinAtiva;
        
        const skinCard = document.createElement('div');
        skinCard.className = `skin-card ${possuiSkin ? 'possui' : ''} ${skinAtual ? 'ativa' : ''}`;
        
        skinCard.innerHTML = `
            <div class="skin-image">
                <img src="${skin.imagem}" alt="${skin.nome}">
                ${skinAtual ? '<div class="skin-badge-ativa">Equipada</div>' : ''}
                ${possuiSkin && !skinAtual ? '<div class="skin-badge-possui">Adquirida</div>' : ''}
            </div>
            <div class="skin-info">
                <h4>${skin.nome}</h4>
                <p>${skin.descricao}</p>
                ${skin.efeito ? `<p class="skin-efeito">${skin.efeito}</p>` : ''}
                <p class="skin-preco">
                    ${skin.preco > 0 ? `<i class="fas fa-coins"></i> ${skin.preco}` : 'Gratuito'}
                </p>
            </div>
            <div class="skin-actions">
                ${!possuiSkin ? 
                    `<button class="btn-comprar" onclick="comprarSkin('${skin.id}')">
                        <i class="fas fa-shopping-cart"></i> Comprar
                    </button>` : 
                    (skinAtual ? 
                        `<button class="btn-equipada" disabled>
                            <i class="fas fa-check-circle"></i> Equipada
                        </button>` : 
                        `<button class="btn-equipar" onclick="equiparSkin('${skin.id}')">
                            <i class="fas fa-tshirt"></i> Equipar
                        </button>`
                    )
                }
            </div>
        `;
        
        catalogo.appendChild(skinCard);
    });
}

/**
 * Fecha a loja de skins
 */
function fecharLojaSkins() {
    const modalLoja = document.getElementById('modalLoja');
    if (modalLoja) {
        modalLoja.style.display = 'none';
    }
}

/**
 * Compra uma nova skin
 * @param {string} skinId - ID da skin a ser comprada
 */
function comprarSkin(skinId) {
    // Encontrar a skin no catálogo
    const skin = catalogoSkins.find(s => s.id === skinId);
    if (!skin) return;
    
    // Verificar se o usuário tem moedas suficientes
    if (moedas >= skin.preco) {
        // Deduzir o preço
        moedas -= skin.preco;
        document.getElementById('coinCount').textContent = moedas;
        
        // Adicionar à lista de skins possuídas
        skinsPossuidas.push(skinId);
        localStorage.setItem("skinsPossuidas", JSON.stringify(skinsPossuidas));
        
        // Equipar a nova skin
        equiparSkin(skinId);
        
        // Atualizar o saldo na loja
        const moedasLoja = document.getElementById('moedasLoja');
        if (moedasLoja) {
            moedasLoja.textContent = moedas;
        }
        
        // Atualizar o catálogo
        preencherCatalogoSkins();
        
        // Salvar progresso
        salvarProgresso();
        
        // Efeito visual e sonoro de compra
        tocarSom('coinSound');
        mostrarMensagemMascote(`Uau! Você adquiriu o avatar ${skin.nome}! 🎉`);
        
        // Criar confetes para celebrar
        if (typeof criarConfetes === 'function') {
            criarConfetes();
        }
    } else {
        // Não tem moedas suficientes
        alert(`Você não tem moedas suficientes! Precisa de ${skin.preco} moedas.`);
        mostrarMensagemMascote("Você precisa de mais moedas para comprar esse avatar! Continue acertando questões! 💰");
    }
}

/**
 * Equipa uma skin já possuída
 * @param {string} skinId - ID da skin a ser equipada
 */
function equiparSkin(skinId) {
    // Verificar se o usuário possui a skin
    if (skinsPossuidas.includes(skinId)) {
        // Atualizar skin ativa
        skinAtiva = skinId;
        localStorage.setItem("skinAtiva", skinAtiva);
        
        // Atualizar avatar
        atualizarAvatar();
        
        // Atualizar o catálogo se estiver aberto
        preencherCatalogoSkins();
        
        // Efeito sonoro
        tocarSom('clickSound');
        
        // Mensagem do mascote
        const skin = catalogoSkins.find(s => s.id === skinId);
        if (skin) {
            mostrarMensagemMascote(`Você está usando o avatar ${skin.nome}! Ficou incrível! 👌`);
        }
    }
}

/**
 * Atualiza a imagem do avatar com a skin atual
 */
function atualizarAvatar() {
    const avatarImg = document.getElementById('userAvatar');
    if (avatarImg) {
        // Encontrar a skin no catálogo
        const skin = catalogoSkins.find(s => s.id === skinAtiva);
        if (skin) {
            avatarImg.src = skin.imagem;
        } else {
            // Fallback para a skin padrão
            avatarImg.src = 'assets/avatars/padrao.png';
        }
    }
}
