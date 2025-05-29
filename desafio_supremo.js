/**
 * Desafio Supremo - Sistema de desafios com matérias mistas e modo punição
 * Este módulo gerencia o sistema de Desafio Supremo, que inclui:
 * - Modo punição: aumenta o número de questões quando definido pelos pais
 * - Sistema de matérias mistas: gera questões de diferentes matérias aleatoriamente
 * - Desafio Supremo: combinação de matérias mistas com dificuldade aumentada
 */

// Variáveis globais - verificar se já existem no escopo global antes de declarar
// Usar window para garantir acesso global
if (typeof window.modoSupremo === 'undefined') window.modoSupremo = false;
if (typeof window.modoPunicao === 'undefined') window.modoPunicao = false;
if (typeof window.materiasMistas === 'undefined') window.materiasMistas = false;
if (typeof window.limiteErrosDesafio === 'undefined') window.limiteErrosDesafio = 4; // Limite padrão de erros
if (typeof window.questoesDesafioSupremo === 'undefined') window.questoesDesafioSupremo = 15; // Número padrão de questões para o Desafio Supremo

// Referências locais para as variáveis globais
const modoSupremo = window.modoSupremo;
const modoPunicao = window.modoPunicao;
const materiasMistas = window.materiasMistas;
const limiteErrosDesafio = window.limiteErrosDesafio;
const questoesDesafioSupremo = window.questoesDesafioSupremo;

// Expor as funções e variáveis para o escopo global
window.desafioSupremo = {
    inicializar: inicializarDesafioSupremo,
    ativarModoSupremo: ativarModoSupremo,
    ativarModoPunicao: ativarModoPunicao,
    ativarMateriasMistas: ativarMateriasMistas,
    gerarQuestaoAtual: gerarQuestaoMateriasMistas,
    verificarStatus: verificarStatusDesafio,
    obterMaterias: obterTodasMaterias
};

/**
 * Inicializa o sistema de Desafio Supremo
 * Verifica se o modo punição está ativado e configura as matérias mistas
 */
function inicializarDesafioSupremo() {
    console.log('Inicializando sistema de Desafio Supremo...');
    
    // Verificar se o modo punição está ativado
    verificarModoPunicao();
    
    // Verificar se o modo supremo está ativado (combina punição e matérias mistas)
    verificarModoSupremo();
    
    // Configurar matérias mistas se necessário
    if (modoSupremo || materiasMistas) {
        configurarMateriasMistas();
    }
    
    // Configurar os botões de controle do Desafio Supremo
    configurarControlesDesafio();
    
    // Atualizar a interface com base nas configurações
    atualizarInterfaceDesafio();
    
    // Adicionar classe ao body para estilização CSS
    if (modoSupremo) {
        document.body.classList.add('modo-supremo');
        document.body.classList.add('desafio-supremo-ativo');
    } else if (modoPunicao) {
        document.body.classList.add('modo-punicao');
    } else if (materiasMistas) {
        document.body.classList.add('materias-mistas');
    }
    
    return {
        modoSupremo,
        modoPunicao,
        materiasMistas
    };
}

/**
 * Configura os botões de controle do Desafio Supremo na interface
 */
function configurarControlesDesafio() {
    // Botão para ativar/desativar o Desafio Supremo
    const btnDesafioSupremo = document.getElementById('btnDesafioSupremo');
    if (btnDesafioSupremo) {
        btnDesafioSupremo.addEventListener('click', () => {
            const novoEstado = !modoSupremo;
            ativarModoSupremo(novoEstado);
            btnDesafioSupremo.textContent = novoEstado ? 'Desativar Desafio Supremo' : 'Ativar Desafio Supremo';
            btnDesafioSupremo.classList.toggle('ativo', novoEstado);
            
            // Tocar som de clique
            if (typeof tocarSom === 'function') {
                tocarSom('clickSound');
            }
        });
        
        // Atualizar o estado inicial do botão
        btnDesafioSupremo.textContent = modoSupremo ? 'Desativar Desafio Supremo' : 'Ativar Desafio Supremo';
        btnDesafioSupremo.classList.toggle('ativo', modoSupremo);
    }
    
    // Botão para ativar/desativar o Modo Punição
    const btnModoPunicao = document.getElementById('btnModoPunicao');
    if (btnModoPunicao) {
        btnModoPunicao.addEventListener('click', () => {
            const novoEstado = !modoPunicao;
            ativarModoPunicao(novoEstado);
            btnModoPunicao.textContent = novoEstado ? 'Desativar Modo Punição' : 'Ativar Modo Punição';
            btnModoPunicao.classList.toggle('ativo', novoEstado);
            
            // Tocar som de clique
            if (typeof tocarSom === 'function') {
                tocarSom('clickSound');
            }
        });
        
        // Atualizar o estado inicial do botão
        btnModoPunicao.textContent = modoPunicao ? 'Desativar Modo Punição' : 'Ativar Modo Punição';
        btnModoPunicao.classList.toggle('ativo', modoPunicao);
    }
    
    // Botão para ativar/desativar Matérias Mistas
    const btnMateriasMistas = document.getElementById('btnMateriasMistas');
    if (btnMateriasMistas) {
        btnMateriasMistas.addEventListener('click', () => {
            const novoEstado = !materiasMistas;
            ativarMateriasMistas(novoEstado);
            btnMateriasMistas.textContent = novoEstado ? 'Desativar Matérias Mistas' : 'Ativar Matérias Mistas';
            btnMateriasMistas.classList.toggle('ativo', novoEstado);
            
            // Tocar som de clique
            if (typeof tocarSom === 'function') {
                tocarSom('clickSound');
            }
        });
        
        // Atualizar o estado inicial do botão
        btnMateriasMistas.textContent = materiasMistas ? 'Desativar Matérias Mistas' : 'Ativar Matérias Mistas';
        btnMateriasMistas.classList.toggle('ativo', materiasMistas);
    }
}

/**
 * Ativa ou desativa o Modo Supremo
 * @param {boolean} ativar - Se true, ativa o modo; se false, desativa
 */
function ativarModoSupremo(ativar = true) {
    modoSupremo = ativar;
    localStorage.setItem('modoSupremo', ativar.toString());
    
    // Se ativar o modo supremo, ativar também matérias mistas
    if (ativar) {
        ativarMateriasMistas(true);
        document.body.classList.add('modo-supremo');
        document.body.classList.add('desafio-supremo-ativo');
    } else {
        document.body.classList.remove('modo-supremo');
        document.body.classList.remove('desafio-supremo-ativo');
    }
    
    // Atualizar a interface
    atualizarInterfaceDesafio();
    console.log(`Modo Supremo ${ativar ? 'ativado' : 'desativado'}`);
    
    return modoSupremo;
}

/**
 * Ativa ou desativa o Modo Punição
 * @param {boolean} ativar - Se true, ativa o modo; se false, desativa
 */
function ativarModoPunicao(ativar = true) {
    modoPunicao = ativar;
    localStorage.setItem('modoPunicao', ativar.toString());
    
    // Atualizar o número de questões se o modo punição estiver ativado
    if (ativar) {
        const questoesPadrao = parseInt(localStorage.getItem('questoesPadrao') || '10');
        const questoesPunicao = questoesPadrao + 5; // Adiciona 5 questões extras no modo punição
        localStorage.setItem('questoesHoje', questoesPunicao.toString());
        document.body.classList.add('modo-punicao');
    } else {
        // Restaurar o número padrão de questões
        const questoesPadrao = parseInt(localStorage.getItem('questoesPadrao') || '10');
        localStorage.setItem('questoesHoje', questoesPadrao.toString());
        document.body.classList.remove('modo-punicao');
    }
    
    // Atualizar a interface
    atualizarInterfaceDesafio();
    console.log(`Modo Punição ${ativar ? 'ativado' : 'desativado'}`);
    
    return modoPunicao;
}

/**
 * Ativa ou desativa o modo de Matérias Mistas
 * @param {boolean} ativar - Se true, ativa o modo; se false, desativa
 */
function ativarMateriasMistas(ativar = true) {
    materiasMistas = ativar;
    localStorage.setItem('materiasMistas', ativar.toString());
    
    if (ativar) {
        configurarMateriasMistas();
        document.body.classList.add('materias-mistas');
    } else {
        window.usandoMateriasMistas = false;
        document.body.classList.remove('materias-mistas');
    }
    
    // Atualizar a interface
    atualizarInterfaceDesafio();
    console.log(`Matérias Mistas ${ativar ? 'ativado' : 'desativado'}`);
    
    return materiasMistas;
}

/**
 * Verifica se o modo punição está ativado com base nas configurações do administrador
 */
function verificarModoPunicao() {
    // Verificar no localStorage se o modo punição está ativado
    const configPunicao = localStorage.getItem('modoPunicao');
    modoPunicao = configPunicao === 'true';
    
    // Se estiver no modo punição, aumentar o número de questões
    if (modoPunicao) {
        const questoesPadrao = parseInt(localStorage.getItem('questoesPadrao') || '10');
        const questoesPunicao = questoesPadrao + 5; // Adiciona 5 questões extras no modo punição
        localStorage.setItem('questoesHoje', questoesPunicao.toString());
        console.log(`Modo punição ativado: ${questoesPunicao} questões definidas para hoje`);
    }
    
    return modoPunicao;
}

/**
 * Verifica o status atual do Desafio Supremo
 * @returns {Object} - Objeto com o status atual do desafio
 */
function verificarStatusDesafio() {
    return {
        modoSupremo,
        modoPunicao,
        materiasMistas,
        limiteErros: limiteErrosDesafio,
        questoesTotais: modoSupremo ? questoesDesafioSupremo : parseInt(localStorage.getItem('questoesHoje') || '10')
    };
}

/**
 * Verifica se o modo supremo está ativado (combina punição e matérias mistas)
 */
function verificarModoSupremo() {
    // Verificar no localStorage se o modo supremo está ativado
    const configSupremo = localStorage.getItem('modoSupremo');
    modoSupremo = configSupremo === 'true';
    
    // Se o modo supremo estiver ativado, ativar também matérias mistas
    if (modoSupremo) {
        materiasMistas = true;
        localStorage.setItem('materiasMistas', 'true');
        console.log('Modo Supremo ativado: punição + matérias mistas');
    } else {
        // Verificar se apenas matérias mistas está ativado
        const configMateriasMistas = localStorage.getItem('materiasMistas');
        materiasMistas = configMateriasMistas === 'true';
    }
    
    return modoSupremo;
}

/**
 * Atualiza a mensagem do mascote com base no modo ativo
 */
function atualizarMensagemMascote() {
    // Obter o mascote atual
    const mascoteAtual = localStorage.getItem('mascoteAtual') || 'panda';
    
    // Buscar a mensagem apropriada com base no modo ativo
    let tipoMensagem = 'boas_vindas';
    
    if (modoSupremo) {
        tipoMensagem = 'punicao'; // Usar mensagens de punição para o modo supremo
    } else if (modoPunicao) {
        tipoMensagem = 'punicao';
    } else if (materiasMistas) {
        tipoMensagem = 'materias_mistas';
    }
    
    // Buscar os dados do mascote
    fetch('assets/mascotes.json')
        .then(response => response.json())
        .then(data => {
            const mascote = data[mascoteAtual];
            if (mascote && mascote.frases && mascote.frases[tipoMensagem]) {
                const frases = mascote.frases[tipoMensagem];
                const mensagemAleatoria = frases[Math.floor(Math.random() * frases.length)];
                
                // Atualizar a mensagem do mascote na interface
                const elementoMascote = document.getElementById('mascote-mensagem');
                if (elementoMascote) {
                    elementoMascote.textContent = mensagemAleatoria;
                }
                
                // Atualizar a imagem do mascote para refletir o modo
                const imagemMascote = modoSupremo || modoPunicao ? 'surpreso' : 'normal';
                atualizarImagemMascote(mascoteAtual, imagemMascote);
            }
        })
        .catch(error => console.error('Erro ao carregar dados do mascote:', error));
}

/**
 * Atualiza a imagem do mascote
 * @param {string} mascote - O ID do mascote atual
 * @param {string} estado - O estado emocional do mascote (normal, feliz, triste, etc.)
 */
function atualizarImagemMascote(mascote, estado) {
    fetch('assets/mascotes.json')
        .then(response => response.json())
        .then(data => {
            if (data[mascote] && data[mascote].imagens && data[mascote].imagens[estado]) {
                const url = data[mascote].imagens[estado];
                const elementoImagem = document.getElementById('mascote-imagem');
                if (elementoImagem) {
                    elementoImagem.src = url;
                }
            }
        })
        .catch(error => console.error('Erro ao atualizar imagem do mascote:', error));
}

/**
 * Gera uma questão de matéria mista aleatória
 * @returns {Promise} - Promessa que resolve com a questão gerada
 */
function gerarQuestaoMateriasMistas() {
    return new Promise((resolve, reject) => {
        // Obter todas as matérias disponíveis
        const todasMaterias = obterTodasMaterias();
        
        // Selecionar uma matéria aleatória
        const materiaAleatoria = todasMaterias[Math.floor(Math.random() * todasMaterias.length)];
        
        // Selecionar um tópico aleatório dessa matéria
        const topicosDisponiveis = materiaAleatoria.topicos;
        const topicoAleatorio = topicosDisponiveis[Math.floor(Math.random() * topicosDisponiveis.length)];
        
        // Preparar os dados para a requisição
        const requestData = {
            materia: materiaAleatoria.nome,
            topico: topicoAleatorio,
            materiasMistas: true
        };
        
        // Adicionar informação de modo punição ou supremo se estiver ativo
        if (modoSupremo) {
            requestData.desafioSupremo = true;
        }
        
        if (modoPunicao) {
            requestData.modoPunicao = true;
        }
        
        // Fazer a requisição para o servidor
        fetch('gemini.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.perguntas && data.perguntas.length > 0) {
                // Adicionar informação da matéria e tópico à pergunta
                const pergunta = data.perguntas[0];
                pergunta.materia = materiaAleatoria.nome;
                pergunta.topico = topicoAleatorio;
                
                // Se for modo supremo, marcar a pergunta
                if (modoSupremo) {
                    pergunta.desafioSupremo = true;
                }
                
                resolve(pergunta);
            } else {
                reject(new Error('Nenhuma pergunta retornada pelo servidor'));
            }
        })
        .catch(erro => reject(erro));
    });
}

/**
 * Obtém todas as matérias disponíveis no sistema
 * @returns {Array} - Array com todas as matérias e seus tópicos
 */
function obterTodasMaterias() {
    // Esta função deve ser implementada para retornar todas as matérias
    // Por enquanto, retornamos um array estático com algumas matérias e tópicos
    return [
        {
            nome: "Matemática",
            topicos: ["Álgebra", "Geometria", "Aritmética", "Estatística", "Trigonometria"]
        },
        {
            nome: "Português",
            topicos: ["Gramática", "Interpretação de Texto", "Literatura", "Redação", "Ortografia"]
        },
        {
            nome: "Ciências",
            topicos: ["Biologia", "Química", "Física", "Astronomia", "Ecologia"]
        },
        {
            nome: "História",
            topicos: ["História do Brasil", "História Mundial", "História Antiga", "Idade Média", "História Contemporânea"]
        },
        {
            nome: "Geografia",
            topicos: ["Geografia do Brasil", "Geografia Mundial", "Cartografia", "Clima", "Geopolítica"]
        },
        {
            nome: "Inglês",
            topicos: ["Gramática", "Vocabulário", "Interpretação de Texto", "Conversação", "Tempos Verbais"]
        }
    ];
}

/**
 * Ativa o modo punição no sistema
 * @param {boolean} ativar - Se true, ativa o modo punição; se false, desativa
 */
function ativarModoPunicao(ativar = true) {
    localStorage.setItem('modoPunicao', ativar.toString());
    modoPunicao = ativar;
    
    // Atualizar a interface se necessário
    if (ativar) {
        verificarModoPunicao(); // Recalcula o número de questões
        atualizarInterfaceDesafio();
    }
}

/**
 * Ativa o modo de matérias mistas no sistema
 * @param {boolean} ativar - Se true, ativa matérias mistas; se false, desativa
 */
function ativarMateriasMistas(ativar = true) {
    localStorage.setItem('materiasMistas', ativar.toString());
    materiasMistas = ativar;
    
    // Configurar o sistema para matérias mistas se ativado
    if (ativar) {
        configurarMateriasMistas();
        atualizarInterfaceDesafio();
    }
}

/**
 * Ativa o Desafio Supremo (combina punição e matérias mistas)
 * @param {boolean} ativar - Se true, ativa o Desafio Supremo; se false, desativa
 */
function ativarDesafioSupremo(ativar = true) {
    localStorage.setItem('modoSupremo', ativar.toString());
    modoSupremo = ativar;
    
    if (ativar) {
        // Ativar tanto punição quanto matérias mistas
        ativarModoPunicao(true);
        ativarMateriasMistas(true);
        
        // Adicionar efeitos visuais extras para o modo supremo
        document.body.classList.add('modo-supremo');
    } else {
        // Remover efeitos visuais do modo supremo
        document.body.classList.remove('modo-supremo');
    }
    
    atualizarInterfaceDesafio();
}

/**
 * Atualiza a interface do usuário com base nas configurações do Desafio Supremo
 */
function atualizarInterfaceDesafio() {
    // Atualizar o contador de questões totais
    const totalPerguntas = document.getElementById('totalPerguntas');
    if (totalPerguntas) {
        const questoesTotais = modoSupremo ? questoesDesafioSupremo : parseInt(localStorage.getItem('questoesHoje') || '10');
        totalPerguntas.textContent = questoesTotais;
    }
    
    // Atualizar a mensagem do mascote com base no modo ativo
    atualizarMensagemMascote();
    
    // Adicionar indicadores visuais para os modos ativos
    const container = document.querySelector('.container');
    if (container) {
        // Remover classes existentes
        container.classList.remove('modo-punicao-ativo', 'materias-mistas-ativo', 'desafio-supremo-ativo');
        
        // Adicionar classes apropriadas
        if (modoSupremo) {
            container.classList.add('desafio-supremo-ativo');
        } else if (modoPunicao) {
            container.classList.add('modo-punicao-ativo');
        } else if (materiasMistas) {
            container.classList.add('materias-mistas-ativo');
        }
    }
    
    // Atualizar os botões de controle
    const btnDesafioSupremo = document.getElementById('btnDesafioSupremo');
    const btnModoPunicao = document.getElementById('btnModoPunicao');
    const btnMateriasMistas = document.getElementById('btnMateriasMistas');
    
    if (btnDesafioSupremo) {
        btnDesafioSupremo.classList.toggle('ativo', modoSupremo);
        btnDesafioSupremo.innerHTML = modoSupremo ? 
            '<i class="fas fa-crown"></i> Desativar Desafio Supremo' : 
            '<i class="fas fa-crown"></i> Ativar Desafio Supremo';
    }
    
    if (btnModoPunicao) {
        btnModoPunicao.classList.toggle('ativo', modoPunicao);
        btnModoPunicao.innerHTML = modoPunicao ? 
            '<i class="fas fa-exclamation-triangle"></i> Desativar Modo Punição' : 
            '<i class="fas fa-exclamation-triangle"></i> Ativar Modo Punição';
    }
    
    if (btnMateriasMistas) {
        btnMateriasMistas.classList.toggle('ativo', materiasMistas);
        btnMateriasMistas.innerHTML = materiasMistas ? 
            '<i class="fas fa-random"></i> Desativar Matérias Mistas' : 
            '<i class="fas fa-random"></i> Ativar Matérias Mistas';
    }
}

/**
 * Configura o sistema para usar matérias mistas
 */
function configurarMateriasMistas() {
    // Marcar que estamos usando matérias mistas para o gerador de questões
    window.usandoMateriasMistas = true;
    
    // Carregar todas as matérias disponíveis
    const todasMaterias = obterTodasMaterias();
    
    // Armazenar as matérias no localStorage para uso posterior
    localStorage.setItem('todasMaterias', JSON.stringify(todasMaterias));
    
    console.log('Sistema configurado para matérias mistas');
    
    // Se estiver no modo supremo, configurar para dificuldade aumentada
    if (modoSupremo) {
        console.log('Modo Supremo: dificuldade aumentada ativada');
        // Definir o número de questões para o desafio supremo
        localStorage.setItem('questoesHoje', questoesDesafioSupremo.toString());
    }
}

// Exportar funções para uso em outros arquivos
window.desafioSupremo = {
    inicializar: inicializarDesafioSupremo,
    ativarModoPunicao: ativarModoPunicao,
    ativarMateriasMistas: ativarMateriasMistas,
    ativarDesafioSupremo: ativarDesafioSupremo,
    gerarQuestaoMateriasMistas: gerarQuestaoMateriasMistas
};

// Inicializar o sistema quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', inicializarDesafioSupremo);
