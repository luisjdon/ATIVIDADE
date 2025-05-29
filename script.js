// Global variables
let pontuacao = 0;
let erros = 0;
let perguntas = [];
let perguntasRespondidas = new Set();
let perguntasCount = 0;

// Variáveis de gamificação
let moedas = 0;
let nivel = 1;
let medalhas = 0;
let somAtivado = true;
let mascoteAtual = 'robo';
let mascoteData = null;
let ultimoBloqueio = null;
let musicaAtivada = false;
let nomeUsuario = 'estudante';
let mascoteFrases = [];

// Variáveis do Desafio Supremo
let totalPerguntas = 10; // Valor padrão, não pode ser menor que 10
let limiteErros = 4;
let materiaAtual = null;
let topicoAtual = null;
let modoPunicao = false;

// Garantir que as matérias mistas estejam sempre ativadas
localStorage.setItem('materiasMistas', 'true');

// Variáveis para o sistema de bloqueio
let bloqueioAtivo = false;
let bloqueioTimer = null;

// Categorias de medalhas
const categoriasMedalhas = {
  algebra: false,
  geometry: false,
  fractions: false,
  speed: false
};

// Armazenamento local
function salvarProgresso() {
  const progresso = {
    moedas,
    nivel,
    medalhas,
    categoriasMedalhas,
    somAtivado,
    musicaAtivada,
    mascoteAtual,
    nomeUsuario,
    avatar: document.getElementById('userAvatar').src,
    ultimoBloqueio: ultimoBloqueio ? ultimoBloqueio.toString() : null,
    modoPunicao,
    totalPerguntas
  };
  localStorage.setItem('desafioSupremo', JSON.stringify(progresso));
}

function carregarProgresso() {
  // Verificar primeiro se existe o novo formato de salvamento
  const salvo = localStorage.getItem('desafioSupremo') || localStorage.getItem('desafioMatematica');
  if (salvo) {
    const progresso = JSON.parse(salvo);
    moedas = progresso.moedas || 0;
    nivel = progresso.nivel || 1;
    medalhas = progresso.medalhas || 0;
    somAtivado = progresso.somAtivado !== undefined ? progresso.somAtivado : true;
    musicaAtivada = progresso.musicaAtivada || false;
    mascoteAtual = progresso.mascoteAtual || 'robo';
    nomeUsuario = progresso.nomeUsuario || 'estudante';
    
    // Carregar variáveis do Desafio Supremo
    if (progresso.totalPerguntas) {
      totalPerguntas = Math.max(10, progresso.totalPerguntas); // Garantir mínimo de 10 perguntas
    }
    
    if (progresso.modoPunicao !== undefined) {
      modoPunicao = progresso.modoPunicao;
    }
    
    if (progresso.ultimoBloqueio) {
      ultimoBloqueio = new Date(progresso.ultimoBloqueio);
    }
    
    if (progresso.categoriasMedalhas) {
      Object.keys(progresso.categoriasMedalhas).forEach(categoria => {
        if (progresso.categoriasMedalhas[categoria]) {
          categoriasMedalhas[categoria] = true;
          const badgeElement = document.getElementById(`badge-${categoria}`);
          if (badgeElement) {
            badgeElement.classList.add('earned');
          }
        }
      });
    }
    
    if (progresso.avatar) {
      document.getElementById('userAvatar').src = progresso.avatar;
    }
    
    atualizarInterface();
  }
  
  // Verificar se há um número de perguntas definido no localStorage (modo punição)
  const metaPerguntas = localStorage.getItem("metaPerguntasDia");
  if (metaPerguntas) {
    totalPerguntas = parseInt(metaPerguntas);
    modoPunicao = true;
    console.log(`Modo punição ativo: ${totalPerguntas} perguntas configuradas`);
    exibirMascote('desafio_supremo');
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Configurar modais
  configurarModais();
  
  // Configurar mascote
  configurarMascote();
  
  // Configurar seletor de tema
  configurarTemas();
  
  // Configurar controles de áudio
  configurarAudio();
  
  // Configurar avatares
  configurarAvatares();
  
  // Configurar botão de desafio diário
  document.getElementById('desafioDiario').addEventListener('click', () => {
    tocarSom('clickSound');
    gerarDesafioDiario();
  });
  
  // Configurar botão de regras
  const btnRegras = document.getElementById('btnRegras');
  if (btnRegras) {
    btnRegras.addEventListener('click', () => {
      tocarSom('clickSound');
      exibirRegras(false);
    });
  }
  
  // Configurar botão da loja
  const btnLoja = document.getElementById('btnLoja');
  if (btnLoja) {
    btnLoja.addEventListener('click', () => {
      tocarSom('clickSound');
      abrirLojaSkins();
    });
  }
  
  // Carregar progresso salvo
  carregarProgresso();
  
  // Atualizar interface
  atualizarInterface();
  
  // Atualizar o contador de perguntas total
  document.getElementById('totalPerguntas').textContent = totalPerguntas;
  
  // Generate questions on page load
  gerarPerguntas();
});

// Configuração dos modais
function configurarModais() {
  // Configurar todos os modais
  const modais = document.querySelectorAll('.modal');
  const botoesFecha = document.querySelectorAll('.close');
  
  // Fechar modal ao clicar no X
  botoesFecha.forEach(botao => {
    botao.onclick = () => {
      const modalId = botao.getAttribute('data-modal') || 'modal';
      document.getElementById(modalId).style.display = 'none';
    };
  });
  
  // Fechar modal ao clicar fora dele
  window.onclick = (event) => {
    modais.forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  };
}

// Carregar dados do mascote
async function carregarDadosMascote() {
  try {
    // Carregar dados dos mascotes do arquivo JSON
    const response = await fetch('assets/mascotes.json');
    if (!response.ok) {
      throw new Error('Falha ao carregar dados dos mascotes');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao carregar dados dos mascotes:', error);
    // Dados de fallback caso o arquivo não possa ser carregado
    return {
      robo: {
        nome: "Matix",
        imagens: {
          normal: "https://cdn-icons-png.flaticon.com/512/2995/2995620.png",
          feliz: "https://cdn-icons-png.flaticon.com/512/3069/3069186.png",
          triste: "https://cdn-icons-png.flaticon.com/512/3069/3069210.png",
          surpreso: "https://cdn-icons-png.flaticon.com/512/3069/3069185.png",
          comemorando: "https://cdn-icons-png.flaticon.com/512/3069/3069187.png"
        },
        frases: {
          boas_vindas: ["Iniciando sistema de aprendizado! Pronto? 🤖", "Olá humano! Vamos calcular juntos? 🔢"],
          acerto: ["Processamento correto! Excelente! ✅", "Meus sensores detectam inteligência! 🧠"],
          erro: ["Erro detectado, mas podemos corrigir! 🔧", "Meus algoritmos indicam que devemos tentar novamente! 🔄"],
          nivel_up: ["Upgrade de nível concluído! 📈", "Você evoluiu para uma versão melhor! 2.0! 🆙"],
          medalha: ["Nova medalha adicionada ao seu banco de dados! 💾", "Conquista desbloqueada! Armazenando... 🏅"],
          bloqueio: ["Alerta! Alerta! 4 erros detectados = Protocolo 'Sem Celular' ativado! 📵", "Sistema de celular temporariamente desativado após 4 erros! 📱❌"]
        }
      }
    };
  }
}

// Configuração do mascote interativo
async function configurarMascote() {
  const mascote = document.getElementById('mascot');
  const bolha = document.getElementById('mascotBubble');
  const bubbleContent = document.querySelector('.bubble-content');
  const mascotInput = document.getElementById('mascotInput');
  const mascotSend = document.getElementById('mascotSend');
  
  // Carregar dados dos mascotes
  const mascotesData = await carregarDadosMascote();
  mascoteData = mascotesData[mascoteAtual];
  mascoteFrases = mascoteData.frases.boas_vindas;
  
  // Atualizar aparência do mascote
  atualizarAparenciaMascote('normal');
  
  // Abrir modal de seleção de mascote ao clicar no mascote com shift
  mascote.addEventListener('click', (event) => {
    if (event.shiftKey) {
      document.getElementById('mascotSelectionModal').style.display = 'block';
      return;
    }
    
    tocarSom('clickSound');
    const fraseAleatoria = mascoteFrases[Math.floor(Math.random() * mascoteFrases.length)];
    bubbleContent.textContent = fraseAleatoria;
    bolha.classList.add('show');
    mascote.classList.add('mascot-talking');
    
    // Esconder a bolha após 5 segundos
    setTimeout(() => {
      bolha.classList.remove('show');
      mascote.classList.remove('mascot-talking');
    }, 5000);
  });
  
  // Configurar seleção de mascote
  const mascoteOptions = document.querySelectorAll('.mascot-option');
  mascoteOptions.forEach(option => {
    option.addEventListener('click', () => {
      tocarSom('clickSound');
      mascoteAtual = option.getAttribute('data-mascot');
      mascoteData = mascotesData[mascoteAtual];
      mascoteFrases = mascoteData.frases.boas_vindas;
      
      atualizarAparenciaMascote('normal');
      document.getElementById('mascotSelectionModal').style.display = 'none';
      
      // Mostrar mensagem de boas-vindas do novo mascote
      const boasVindas = mascoteData.frases.boas_vindas[Math.floor(Math.random() * mascoteData.frases.boas_vindas.length)];
      bubbleContent.textContent = boasVindas;
      bolha.classList.add('show');
      mascote.classList.add('mascot-talking');
      
      setTimeout(() => {
        bolha.classList.remove('show');
        mascote.classList.remove('mascot-talking');
      }, 5000);
      
      salvarProgresso();
    });
  });
  
  // Configurar chat com o mascote
  mascotSend.addEventListener('click', () => enviarMensagemMascote());
  mascotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      enviarMensagemMascote();
    }
  });
  
  // Mostrar mensagem inicial após 2 segundos
  setTimeout(() => {
    const boasVindas = mascoteData.frases.boas_vindas[Math.floor(Math.random() * mascoteData.frases.boas_vindas.length)];
    bubbleContent.textContent = boasVindas;
    bolha.classList.add('show');
    mascote.classList.add('mascot-talking');
    
    setTimeout(() => {
      bolha.classList.remove('show');
      mascote.classList.remove('mascot-talking');
    }, 5000);
  }, 2000);
  
  // Verificar se há bloqueio ativo
  verificarBloqueio();
}

// Atualizar aparência do mascote
function atualizarAparenciaMascote(estado) {
  const mascote = document.getElementById('mascot');
  if (mascoteData && mascoteData.imagens && mascoteData.imagens[estado]) {
    mascote.style.backgroundImage = `url('${mascoteData.imagens[estado]}')`;
  }
}

// Enviar mensagem para o mascote
async function enviarMensagemMascote() {
  const mascotInput = document.getElementById('mascotInput');
  const bubbleContent = document.querySelector('.bubble-content');
  const bolha = document.getElementById('mascotBubble');
  const mascote = document.getElementById('mascot');
  
  const mensagem = mascotInput.value.trim();
  if (!mensagem) return;
  
  // Limpar input
  mascotInput.value = '';
  
  // Mostrar estado de carregamento
  bubbleContent.textContent = 'Pensando...';
  bolha.classList.add('show');
  mascote.classList.add('mascot-talking');
  
  try {
    // Tentar obter resposta da API
    const response = await fetch('mascote.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mensagem: mensagem,
        nome: nomeUsuario
      })
    });
    
    const data = await response.json();
    
    if (data.resposta) {
      bubbleContent.textContent = data.resposta;
    } else {
      // Resposta de fallback
      const fallbackRespostas = [
        "Estou aqui para te ajudar! Continue praticando! 🌟",
        "Você está indo muito bem! Continue assim! 🚀",
        "Matemática é como um jogo, quanto mais você pratica, melhor fica! 🎮",
        "Não desista, você consegue! 💪",
        "Errar faz parte do aprendizado! 📚",
        "Vamos continuar juntos nessa aventura matemática! 🧩"
      ];
      bubbleContent.textContent = fallbackRespostas[Math.floor(Math.random() * fallbackRespostas.length)];
    }
  } catch (error) {
    console.error('Erro ao obter resposta do mascote:', error);
    bubbleContent.textContent = "Ops! Tive um problema para responder. Vamos continuar estudando! 📚";
  }
  
  // Manter a bolha visível por 5 segundos
  setTimeout(() => {
    bolha.classList.remove('show');
    mascote.classList.remove('mascot-talking');
  }, 5000);
}

// Sistema de bloqueio por erros
function verificarBloqueio() {
  // Verificar se há um bloqueio salvo
  const bloqueioSalvo = localStorage.getItem('ultimoBloqueio');
  if (bloqueioSalvo) {
    const dataBloqueio = new Date(bloqueioSalvo);
    const hoje = new Date();
    
    // Verificar se o bloqueio é de hoje
    if (dataBloqueio.toDateString() === hoje.toDateString()) {
      // Bloqueio ainda válido
      ativarBloqueio(dataBloqueio);
    } else {
      // Bloqueio expirado
      localStorage.removeItem('ultimoBloqueio');
    }
  }
}

function ativarBloqueio(dataBloqueio) {
  bloqueioAtivo = true;
  ultimoBloqueio = dataBloqueio;
  
  // Atualizar data no modal
  document.getElementById('bloqueioData').textContent = `Bloqueado em: ${dataBloqueio.toLocaleDateString()}`;
  
  // Mostrar modal de bloqueio
  document.getElementById('bloqueioModal').style.display = 'block';
  
  // Iniciar contador regressivo
  iniciarContadorBloqueio(dataBloqueio);
  
  // Desabilitar interações
  const container = document.getElementById('perguntas');
  container.innerHTML = `<div class="pergunta-card">
    <p>Seu acesso está bloqueado até amanhã por ter errado 4 questões.</p>
    <p>Volte amanhã para tentar novamente!</p>
  </div>`;
  
  document.getElementById('gerarBtn').disabled = true;
  document.getElementById('desafioDiario').disabled = true;
}

function iniciarContadorBloqueio(dataBloqueio) {
  const countdownElement = document.getElementById('bloqueioCountdown');
  
  // Calcular o fim do bloqueio (próxima meia-noite)
  const fimBloqueio = new Date(dataBloqueio);
  fimBloqueio.setDate(fimBloqueio.getDate() + 1);
  fimBloqueio.setHours(0, 0, 0, 0);
  
  // Atualizar contador a cada segundo
  function atualizarContador() {
    const agora = new Date();
    const diferenca = fimBloqueio - agora;
    
    if (diferenca <= 0) {
      // Bloqueio terminou
      countdownElement.textContent = 'Bloqueio terminado!';  
      localStorage.removeItem('ultimoBloqueio');
      bloqueioAtivo = false;
      clearInterval(bloqueioTimer);
      
      // Recarregar a página após 2 segundos
      setTimeout(() => {
        location.reload();
      }, 2000);
      
      return;
    }
    
    // Calcular horas, minutos e segundos restantes
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
    
    // Formatar contador
    countdownElement.textContent = `Tempo restante: ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }
  
  // Iniciar contador
  atualizarContador();
  bloqueioTimer = setInterval(atualizarContador, 1000);
}

// Configuração dos temas
function configurarTemas() {
  const opcoesTema = document.querySelectorAll('.theme-option');
  
  opcoesTema.forEach(opcao => {
    opcao.addEventListener('click', () => {
      tocarSom('clickSound');
      const tema = opcao.getAttribute('data-theme');
      
      // Remover classe ativa de todas as opções
      opcoesTema.forEach(op => op.classList.remove('active'));
      
      // Adicionar classe ativa à opção selecionada
      opcao.classList.add('active');
      
      // Remover todas as classes de tema do body
      document.body.classList.remove('theme-default', 'theme-princess', 'theme-gamer', 'theme-forest');
      
      // Adicionar a classe do tema selecionado
      if (tema !== 'default') {
        document.body.classList.add(`theme-${tema}`);
      }
      
      // Salvar preferência de tema
      localStorage.setItem('temaPreferido', tema);
    });
  });
  
  // Carregar tema salvo
  const temaSalvo = localStorage.getItem('temaPreferido');
  if (temaSalvo) {
    const opcaoTema = document.querySelector(`.theme-option[data-theme="${temaSalvo}"]`);
    if (opcaoTema) {
      opcaoTema.click();
    }
  }
}

// Configuração dos controles de áudio
function configurarAudio() {
  const audioToggle = document.getElementById('audioToggle');
  const audioIcon = document.getElementById('audioIcon');
  
  // Configurar estado inicial
  atualizarIconeAudio();
  
  audioToggle.addEventListener('click', () => {
    somAtivado = !somAtivado;
    atualizarIconeAudio();
    salvarProgresso();
  });
}

function atualizarIconeAudio() {
  const audioIcon = document.getElementById('audioIcon');
  if (somAtivado) {
    audioIcon.className = 'fas fa-volume-up';
  } else {
    audioIcon.className = 'fas fa-volume-mute';
  }
}

// Configuração dos avatares
function configurarAvatares() {
  const avatarContainer = document.querySelector('.avatar');
  const avatarModal = document.getElementById('avatarModal');
  const opcoesAvatar = document.querySelectorAll('.avatar-option');
  
  // Abrir modal ao clicar no avatar
  avatarContainer.addEventListener('click', () => {
    tocarSom('clickSound');
    avatarModal.style.display = 'block';
  });
  
  // Selecionar avatar
  opcoesAvatar.forEach(opcao => {
    opcao.addEventListener('click', () => {
      tocarSom('clickSound');
      const avatarUrl = opcao.getAttribute('data-avatar');
      document.getElementById('userAvatar').src = avatarUrl;
      avatarModal.style.display = 'none';
      salvarProgresso();
    });
  });
}

/**
 * Funções de gamificação
 */

// Tocar sons
function tocarSom(id) {
  if (!somAtivado) return;
  
  const som = document.getElementById(id);
  if (som) {
    som.currentTime = 0;
    som.play().catch(e => console.log('Erro ao tocar som:', e));
  }
}

// Atualizar a interface com os valores atuais
function atualizarInterface() {
  document.getElementById('coinCount').textContent = moedas;
  document.getElementById('userLevel').textContent = nivel;
  document.getElementById('avatarLevel').textContent = nivel;
  document.getElementById('medalCount').textContent = medalhas;
  document.getElementById('progressBar').style.width = `${(pontuacao * 10)}%`;
}

// Adicionar moedas com animação
function adicionarMoedas(quantidade) {
  moedas += quantidade;
  document.getElementById('coinCount').textContent = moedas;
  document.getElementById('coinCount').classList.add('bounce-animation');
  tocarSom('coinSound');
  
  setTimeout(() => {
    document.getElementById('coinCount').classList.remove('bounce-animation');
  }, 800);
  
  salvarProgresso();
}

// Verificar se subiu de nível
function verificarNivel() {
  const nivelAnterior = nivel;
  nivel = Math.floor(pontuacao / 10) + 1;
  
  if (nivel > nivelAnterior) {
    document.getElementById('newLevel').textContent = nivel;
    document.getElementById('levelModal').style.display = 'block';
    document.getElementById('avatarLevel').textContent = nivel;
    document.getElementById('userLevel').textContent = nivel;
    
    // Adicionar moedas por subir de nível
    adicionarMoedas(50);
    
    // Tocar som de subir de nível
    tocarSom('levelUpSound');
    
    // Criar confetes para celebrar
    criarConfetes();
    
    // Atualizar aparência do mascote para comemorando
    atualizarAparenciaMascote('comemorando');
    setTimeout(() => atualizarAparenciaMascote('normal'), 3000);
    
    // Mostrar mensagem do mascote
    if (mascoteData && mascoteData.frases && mascoteData.frases.nivel_up) {
      const mensagemNivel = mascoteData.frases.nivel_up[Math.floor(Math.random() * mascoteData.frases.nivel_up.length)];
      mostrarMensagemMascote(mensagemNivel);
    } else {
      mostrarMensagemMascote(`Parabéns! Você alcançou o nível ${nivel}! 🎉`);
    }
    
    // Verificar se deve ganhar medalha por nível
    if (nivel >= 5 && !categoriasMedalhas.speed) {
      categoriasMedalhas.speed = true;
      document.getElementById('badge-speed').classList.add('earned');
      medalhas++;
      document.getElementById('medalCount').textContent = medalhas;
    }
    
    salvarProgresso();
  }
}

// Criar animação de confetes
function criarConfetes() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  
  const formas = ['square', 'circle', 'triangle'];
  const cores = ['--confetti-1', '--confetti-2', '--confetti-3', '--confetti-4'];
  
  for (let i = 0; i < 50; i++) {
    const confete = document.createElement('div');
    confete.className = `confetti ${formas[Math.floor(Math.random() * formas.length)]}`;
    confete.style.left = `${Math.random() * 100}%`;
    confete.style.top = `${Math.random() * 30}%`;
    confete.style.backgroundColor = `var(${cores[Math.floor(Math.random() * cores.length)]})`;
    confete.style.animationDuration = `${Math.random() * 2 + 1}s`;
    confete.style.animationDelay = `${Math.random() * 0.5}s`;
    
    container.appendChild(confete);
    
    // Animar confete
    setTimeout(() => {
      confete.style.animation = 'confetti 1s ease forwards';
    }, 100);
  }
  
  // Limpar confetes após a animação
  setTimeout(() => {
    container.innerHTML = '';
  }, 3000);
}

// Verificar e conceder medalhas
function verificarMedalhas(pergunta) {
  // Verificar tipo de pergunta para conceder medalha específica
  const textoPergunta = pergunta.pergunta.toLowerCase();
  
  if (textoPergunta.includes('equação') || textoPergunta.includes('expressão') || textoPergunta.includes('álgebra')) {
    if (!categoriasMedalhas.algebra) {
      categoriasMedalhas.algebra = true;
      document.getElementById('badge-algebra').classList.add('earned');
      medalhas++;
      document.getElementById('medalCount').textContent = medalhas;
      
      // Adicionar moedas por ganhar medalha
      adicionarMoedas(20);
      
      // Tocar som de medalha
      tocarSom('levelUpSound');
      
      // Atualizar aparência do mascote para comemorando
      atualizarAparenciaMascote('comemorando');
      setTimeout(() => atualizarAparenciaMascote('normal'), 3000);
      
      // Mostrar mensagem do mascote
      if (mascoteData && mascoteData.frases && mascoteData.frases.medalha) {
        const mensagemMedalha = mascoteData.frases.medalha[Math.floor(Math.random() * mascoteData.frases.medalha.length)];
        mostrarMensagemMascote(mensagemMedalha + ' Medalha: Mestre da Álgebra! 🌟');
      } else {
        mostrarMensagemMascote('Parabéns! Você ganhou a medalha de Mestre da Álgebra! 🌟');
      }
      
      // Criar confetes para celebrar
      criarConfetes();
    }
  }
  
  if (textoPergunta.includes('triângulo') || textoPergunta.includes('quadrado') || textoPergunta.includes('geometri') || textoPergunta.includes('área') || textoPergunta.includes('perímetro')) {
    if (!categoriasMedalhas.geometry) {
      categoriasMedalhas.geometry = true;
      document.getElementById('badge-geometry').classList.add('earned');
      medalhas++;
      document.getElementById('medalCount').textContent = medalhas;
      
      // Adicionar moedas por ganhar medalha
      adicionarMoedas(20);
      
      // Tocar som de medalha
      tocarSom('levelUpSound');
      
      // Atualizar aparência do mascote para comemorando
      atualizarAparenciaMascote('comemorando');
      setTimeout(() => atualizarAparenciaMascote('normal'), 3000);
      
      // Mostrar mensagem do mascote
      if (mascoteData && mascoteData.frases && mascoteData.frases.medalha) {
        const mensagemMedalha = mascoteData.frases.medalha[Math.floor(Math.random() * mascoteData.frases.medalha.length)];
        mostrarMensagemMascote(mensagemMedalha + ' Medalha: Gênio da Geometria! 📍');
      } else {
        mostrarMensagemMascote('Uau! Você ganhou a medalha de Gênio da Geometria! 📍');
      }
      
      // Criar confetes para celebrar
      criarConfetes();
    }
  }
  
  if (textoPergunta.includes('fraç') || textoPergunta.includes('divisão') || textoPergunta.includes('parte')) {
    if (!categoriasMedalhas.fractions) {
      categoriasMedalhas.fractions = true;
      document.getElementById('badge-fractions').classList.add('earned');
      medalhas++;
      document.getElementById('medalCount').textContent = medalhas;
      
      // Adicionar moedas por ganhar medalha
      adicionarMoedas(20);
      
      // Tocar som de medalha
      tocarSom('levelUpSound');
      
      // Atualizar aparência do mascote para comemorando
      atualizarAparenciaMascote('comemorando');
      setTimeout(() => atualizarAparenciaMascote('normal'), 3000);
      
      // Mostrar mensagem do mascote
      if (mascoteData && mascoteData.frases && mascoteData.frases.medalha) {
        const mensagemMedalha = mascoteData.frases.medalha[Math.floor(Math.random() * mascoteData.frases.medalha.length)];
        mostrarMensagemMascote(mensagemMedalha + ' Medalha: Fera das Frações! 🎉');
      } else {
        mostrarMensagemMascote('Incrível! Você ganhou a medalha de Fera das Frações! 🎉');
      }
      
      // Criar confetes para celebrar
      criarConfetes();
    }
  }
  
  salvarProgresso();
}

// Mostrar mensagem do mascote
function mostrarMensagemMascote(mensagem) {
  const bolha = document.getElementById('mascotBubble');
  bolha.textContent = mensagem;
  bolha.classList.add('show');
  
  setTimeout(() => {
    bolha.classList.remove('show');
  }, 5000);
}

// Gerar desafio diário
async function gerarDesafioDiario() {
  // Reset scores and UI
  pontuacao = 0;
  erros = 0;
  perguntasRespondidas = new Set();
  perguntasCount = 0;
  
  document.getElementById('pontuacao').innerText = pontuacao;
  document.getElementById('erros').innerText = erros;
  document.getElementById('perguntasCount').innerText = perguntasCount;
  
  const container = document.getElementById('perguntas');
  container.innerHTML = '<div class="loading-container"><p>Gerando desafio especial...</p><div class="loading"></div></div>';
  
  try {
    // Preparar dados para requisição
    const requestData = {
      quantidade: totalPerguntas,
      desafioDiario: true
    };
    
    // Fazer a requisição para o servidor
    const response = await fetch('gemini.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    // Verificar se data.perguntas existe e é um array
    if (data && data.perguntas && Array.isArray(data.perguntas)) {
      perguntas = data.perguntas;
      
      // Adicionar dificuldade extra para o desafio diário
      perguntas = perguntas.map(p => {
        return {
          ...p,
          desafioDiario: true
        };
      });
    } else {
      // Se não houver perguntas, criar perguntas padrão para o desafio diário
      perguntas = [
        { pergunta: "Qual é o valor de x na equação 2x + 5 = 15?", resposta: "5", materia: "Matemática", topico: "Equações", desafioDiario: true },
        { pergunta: "Quanto é a raiz quadrada de 144?", resposta: "12", materia: "Matemática", topico: "Aritmética", desafioDiario: true },
        { pergunta: "Qual é a área de um quadrado com lado de 7 cm?", resposta: "49", materia: "Matemática", topico: "Geometria", desafioDiario: true },
        { pergunta: "Se 3x - 7 = 14, quanto vale x?", resposta: "7", materia: "Matemática", topico: "Equações", desafioDiario: true },
        { pergunta: "Qual é o valor de 15% de 200?", resposta: "30", materia: "Matemática", topico: "Porcentagem", desafioDiario: true }
      ];
    }
    
    mostrarMensagemMascote('Desafio do dia ativado! Ganhe o dobro de moedas por acerto! 🌟');
    renderizarPerguntas(true);
  } catch (error) {
    container.innerHTML = `<div class="pergunta-card">
      <p>Erro ao gerar desafio. Por favor, tente novamente.</p>
      <p class="error-message">${error.message}</p>
    </div>`;
    console.error('Erro ao gerar desafio:', error);
  }
}

/**
 * Gera perguntas com base na matéria e tópico selecionados
 * Suporta o Desafio Supremo com matérias mistas
 */
async function gerarPerguntas() {
  const totalPerguntasConfig = parseInt(localStorage.getItem('questoesHoje') || 10);
  
  // Limpar perguntas anteriores
  perguntas = [];
  perguntasRespondidas = new Set();
  perguntasCount = 0;
  document.getElementById('perguntas').innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Gerando perguntas...</div>';
  
  // Garantir que as matérias mistas estejam sempre ativadas
  localStorage.setItem('materiasMistas', 'true');
  
  // Verificar se é o Desafio Supremo ou Matérias Mistas
  const modoSupremo = localStorage.getItem('modoSupremo') === 'true';
  const materiasMistas = true; // Sempre usar matérias mistas
  const modoPunicao = localStorage.getItem('modoPunicao') === 'true';
  
  // Atualizar variáveis globais
  window.modoPunicao = modoPunicao;
  window.totalPerguntas = totalPerguntasConfig;
  
  // Preparar os dados para a requisição
  let requestData = {};
  
  // Definir a quantidade de perguntas a serem geradas (pelo menos 10)
  const quantidadePerguntas = Math.max(10, parseInt(totalPerguntasConfig));
  
  if (modoSupremo || materiasMistas) {
    // No modo de matérias mistas, configurar para matérias mistas
    requestData = {
      materiasMistas: true,
      desafioSupremo: modoSupremo,
      quantidade: quantidadePerguntas
    };
    
    // Se estiver no modo punição, adicionar essa informação
    if (modoPunicao) {
      requestData.modoPunicao = true;
    }
  } else {
    // No modo normal, selecionar uma matéria e tópico aleatórios
    const materiaIndex = Math.floor(Math.random() * materias.length);
    const materia = materias[materiaIndex].nome;
    
    const topicos = materias[materiaIndex].topicos;
    const topicoIndex = Math.floor(Math.random() * topicos.length);
    const topico = topicos[topicoIndex];
    
    requestData = {
      materia: materia,
      topico: topico,
      quantidade: quantidadePerguntas
    };
    
    // Se estiver no modo punição, adicionar essa informação
    if (modoPunicao) {
      requestData.modoPunicao = true;
    }
  }
  
  // Exibir o mascote com mensagem apropriada
  if (modoSupremo) {
    if (typeof exibirMascote === 'function') {
      exibirMascote('desafio_supremo');
    } else {
      mostrarMensagemMascote('Prepare-se para o Desafio Supremo! Vamos testar seus conhecimentos em várias matérias! 🏆');
    }
  } else if (modoPunicao) {
    if (typeof exibirMascote === 'function') {
      exibirMascote('punicao');
    } else {
      mostrarMensagemMascote('Modo punição ativado! Vamos ver se você consegue recuperar seu celular! 📱');
    }
  } else if (materiasMistas) {
    if (typeof exibirMascote === 'function') {
      exibirMascote('materias_mistas');
    } else {
      mostrarMensagemMascote('Modo de matérias mistas ativado! Vamos testar seus conhecimentos em diversas áreas! 📚');
    }
  } else {
    if (typeof exibirMascote === 'function') {
      exibirMascote('boas_vindas');
    } else {
      mostrarMensagemMascote('Vamos começar! Boa sorte! 😊');
    }
  }
  
  const container = document.getElementById('perguntas');
  container.innerHTML = '<div class="loading-container"><p>Gerando perguntas...</p><div class="loading"></div></div>';
  
  try {
    // Se estiver no modo punição, mostrar mensagem especial
    if (modoPunicao) {
      container.innerHTML = '<div class="loading-container"><p>Gerando perguntas difíceis para o modo punição...</p><div class="loading"></div></div>';
      
      // Mostrar mensagem do mascote para o modo punição
      setTimeout(() => {
        mostrarMensagemMascote(`Hoje você precisa responder ${totalPerguntasConfig} perguntas difíceis! Vamos ver se você consegue! 😈`);
      }, 1000);
    }
    
    // Fazer a requisição para o servidor
    const response = await fetch('gemini.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    if (data.perguntas && data.perguntas.length > 0) {
      perguntas = data.perguntas;
      
      // Renderizar as perguntas na interface
      renderizarPerguntas(modoSupremo);
    } else {
      container.innerHTML = `<div class="pergunta-card error-card">
        <p>Erro ao gerar perguntas. Por favor, tente novamente.</p>
      </div>`;
      console.error('Erro: Nenhuma pergunta retornada pelo servidor');
    }
  } catch (error) {
    container.innerHTML = `<div class="pergunta-card error-card">
      <p>Erro ao gerar perguntas. Por favor, tente novamente.</p>
      <p class="error-message">${error.message}</p>
    </div>`;
    console.error('Erro ao gerar perguntas:', error);
  }
}

/**
 * Renders the questions in the UI
 * @param {boolean} isDesafio - Indica se é um desafio especial (Desafio Supremo ou Diário)
 */
function renderizarPerguntas(isDesafio = false) {
  const container = document.getElementById('perguntas');
  container.innerHTML = '';
  
  // Verificar se estamos no modo de Desafio Supremo ou matérias mistas
  const modoSupremo = localStorage.getItem('modoSupremo') === 'true';
  const materiasMistas = localStorage.getItem('materiasMistas') === 'true';
  const modoPunicao = localStorage.getItem('modoPunicao') === 'true';
  
  // Se for passado isDesafio como true, isso sobrepõe as outras configurações
  const isDesafioSupremo = isDesafio || modoSupremo;
  
  // Atualizar a barra de progresso
  document.getElementById('progressBar').style.width = '0%';
  
  // Adicionar classe ao container para estilização especial se for Desafio Supremo
  if (isDesafioSupremo) {
    container.classList.add('desafio-supremo-container');
  } else {
    container.classList.remove('desafio-supremo-container');
  }
  
  perguntas.forEach((pergunta, index) => {
    const perguntaId = `pergunta-${index}`;
    const div = document.createElement('div');
    div.className = 'pergunta-card';
    div.id = perguntaId;
    
    // Adicionar classes especiais baseadas no tipo de desafio
    if (isDesafioSupremo) {
      div.classList.add('desafio-supremo');
    } else if (pergunta.desafioDiario) {
      div.classList.add('desafio-diario');
    }
    
    if (modoPunicao) {
      div.classList.add('modo-punicao');
    }
    
    if (materiasMistas && !isDesafioSupremo) {
      div.classList.add('materias-mistas');
    }
    
    // Adicionar informação da matéria e tópico se disponível
    let materiaInfo = '';
    if (pergunta.materia && pergunta.topico) {
      materiaInfo = `<div class="pergunta-materia">
        <span class="materia-badge">${pergunta.materia}</span>
        <span class="topico-badge">${pergunta.topico}</span>
       </div>`;
    }
    
    // Ícone especial para o tipo de desafio
    let iconeDesafio = '';
    if (isDesafioSupremo) {
      iconeDesafio = '<i class="fas fa-crown" style="color: gold;"></i> ';
    } else if (pergunta.desafioDiario) {
      iconeDesafio = '<i class="fas fa-star" style="color: var(--reward-color);"></i> ';
    } else if (modoPunicao) {
      iconeDesafio = '<i class="fas fa-exclamation-triangle" style="color: var(--error-color);"></i> ';
    } else if (materiasMistas) {
      iconeDesafio = '<i class="fas fa-random" style="color: var(--accent-color);"></i> ';
    }
    
    div.innerHTML = `
      <div class="pergunta-numero">
        ${iconeDesafio}
        Questão ${index + 1}
      </div>
      ${materiaInfo}
      <div class="pergunta-texto">${pergunta.pergunta}</div>
      <div class="pergunta-alternativas">
        ${renderizarAlternativas(pergunta.alternativas, index)}
      </div>
      <div class="pergunta-resposta">
        <button class="btn-verificar" onclick="verificar(${index})">
          <i class="fas fa-check-circle"></i> Verificar
        </button>
        <button class="btn-estudar" onclick="estudar(${index})">
          <i class="fas fa-book"></i> Estudar
        </button>
      </div>
      <div id="feedback-${index}" class="feedback"></div>
    `;
    
    container.appendChild(div);
  });
  
  // Atualizar contador de perguntas
  document.getElementById('totalPerguntas').textContent = totalPerguntas;
  
  // Mostrar mensagem do mascote baseada no modo ativo
  if (isDesafioSupremo) {
    setTimeout(() => {
      mostrarMensagemMascote('Desafio Supremo ativado! Prepare-se para questões de várias matérias! 👑');
    }, 1000);
  } else if (perguntas.length > 0 && perguntas[0].desafioDiario) {
    setTimeout(() => {
      mostrarMensagemMascote('Desafio diário! Responda corretamente para ganhar recompensas extras! 🌟');
    }, 1000);
  } else if (modoPunicao) {
    setTimeout(() => {
      mostrarMensagemMascote(`Modo punição ativado! Você precisa responder ${totalPerguntas} perguntas difíceis hoje! 😈`);
    }, 1000);
  } else if (materiasMistas) {
    setTimeout(() => {
      mostrarMensagemMascote('Modo de matérias mistas! Vamos testar seus conhecimentos em várias áreas! 📚');
    }, 1000);
  } else {
    setTimeout(() => {
      mostrarMensagemMascote('Novas perguntas geradas! Boa sorte! 😄');
    }, 1000);
  }
}

/**
 * Verifies the user's answer for a specific question
 * @param {number} index - Question index
 */
function verificar(index) {
  // Verificar se o aplicativo está bloqueado
  if (bloqueioAtivo) {
    mostrarMensagemMascote("Seu acesso está bloqueado hoje. Volte amanhã! 📵");
    return;
  }
  
  // Prevent checking already answered questions
  if (perguntasRespondidas.has(index)) {
    return;
  }
  
  const pergunta = perguntas[index];
  const respostaCerta = pergunta.resposta.toString().trim();
  
  // Obter a alternativa selecionada
  const opcoesSelecionadas = document.querySelectorAll(`input[name="resposta-${index}"]:checked`);
  if (opcoesSelecionadas.length === 0) {
    // Nenhuma alternativa selecionada
    mostrarMensagemMascote("Você precisa escolher uma alternativa primeiro! 😉");
    return;
  }
  
  const input = opcoesSelecionadas[0].value.trim();
  const feedback = document.getElementById(`feedback-${index}`);
  
  // Mark this question as answered
  perguntasRespondidas.add(index);
  perguntasCount++;
  
  // Atualizar contador de perguntas respondidas
  document.getElementById('perguntasCount').innerText = perguntasCount;
  
  if (input === respostaCerta) {
    // Resposta correta
    tocarSom('correctSound');
    
    // Verificar se é desafio diário para dar recompensa extra
    let moedasGanhas = pergunta.desafioDiario ? 10 : 5;
    
    // Verificar se é Desafio Supremo para dar recompensa extra
    if (pergunta.desafioSupremo) {
      moedasGanhas = 15; // Mais moedas no Desafio Supremo
    }
    // Verificar se é modo punição para dar menos recompensa
    else if (modoPunicao && !pergunta.desafioDiario) {
      moedasGanhas = 3; // Menos moedas no modo punição
    }
    
    feedback.className = 'feedback feedback-correto';
    feedback.innerHTML = `
      <span class="emoji-reaction">🎉</span> 
      <i class="fas fa-check-circle"></i> Correto! Muito bem! 
      <span class="coin-reward">+${moedasGanhas} <i class="fas fa-coins"></i></span>
    `;
    
    pontuacao++;
    
    // Adicionar moedas
    adicionarMoedas(moedasGanhas);
    
    // Verificar medalhas baseado no tipo de pergunta
    verificarMedalhas(pergunta);
    
    // Add success animation to the card
    const card = document.getElementById(`pergunta-${index}`);
    card.style.borderLeft = '5px solid var(--success-color)';
    card.classList.add('pulse-animation');
    
    // Criar confetes para celebrar
    if (pontuacao % 3 === 0) { // A cada 3 acertos
      criarConfetes();
    }
    
    // Atualizar aparência do mascote para feliz
    atualizarAparenciaMascote('feliz');
    setTimeout(() => atualizarAparenciaMascote('normal'), 3000);
    
    // Mensagem do mascote para acertos
    if (mascoteData && mascoteData.frases && mascoteData.frases.acerto) {
      const mensagemAcerto = mascoteData.frases.acerto[Math.floor(Math.random() * mascoteData.frases.acerto.length)];
      mostrarMensagemMascote(mensagemAcerto);
    } else {
      const mensagens = [
        "Excelente trabalho! Continue assim! 😀",
        "Você está arrasando! 👏",
        "Uau, que inteligente! 🤓",
        "Você é uma gênia da matemática! 🌟"
      ];
      mostrarMensagemMascote(mensagens[Math.floor(Math.random() * mensagens.length)]);
    }
    
    // Adicionar classe de celebração ao mascote
    const mascote = document.getElementById('mascot');
    mascote.classList.add('mascot-celebrating');
    setTimeout(() => mascote.classList.remove('mascot-celebrating'), 1000);
    
    // Verificar se completou todas as perguntas no modo punição
    if (modoPunicao && perguntasCount >= totalPerguntas) {
      setTimeout(() => {
        mostrarMensagemMascote("Parabéns! Você completou todas as perguntas do modo punição! 🎉");
        criarConfetes();
      }, 1500);
    }
    
  } else {
    // Resposta incorreta
    tocarSom('wrongSound');
    
    feedback.className = 'feedback feedback-incorreto';
    feedback.innerHTML = `<span class="emoji-reaction">😕</span> <i class="fas fa-times-circle"></i> Opa! Quase! Continue tentando!`;
    erros++;
    
    // Mostrar a resposta correta
    const questaoContainer = document.getElementById(`pergunta-${index}`);
    if (window.respostaHandler && typeof window.respostaHandler.mostrarRespostaCorreta === 'function') {
      window.respostaHandler.mostrarRespostaCorreta(questaoContainer, respostaCerta);
    } else {
      // Fallback caso o manipulador de respostas não esteja disponível
      let respostaCorretaElement = questaoContainer.querySelector('.resposta-correta');
      if (!respostaCorretaElement) {
        respostaCorretaElement = document.createElement('div');
        respostaCorretaElement.className = 'resposta-correta';
        respostaCorretaElement.innerHTML = `
          <p>A resposta correta deveria ser: <span class="resposta-correta-valor">${respostaCerta}</span></p>
          <button class="btn-entendi">Entendi</button>
        `;
        questaoContainer.appendChild(respostaCorretaElement);
      }
      respostaCorretaElement.style.display = 'block';
    }
    
    // Add error animation to the card
    const card = document.getElementById(`pergunta-${index}`);
    card.style.borderLeft = '5px solid var(--error-color)';
    
    // Atualizar aparência do mascote para triste ou surpreso
    const estadoMascote = Math.random() > 0.5 ? 'triste' : 'surpreso';
    atualizarAparenciaMascote(estadoMascote);
    setTimeout(() => atualizarAparenciaMascote('normal'), 3000);
    
    // Mensagem do mascote para erros
    if (erros < limiteErros) {
      if (mascoteData && mascoteData.frases && mascoteData.frases.erro) {
        const mensagemErro = mascoteData.frases.erro[Math.floor(Math.random() * mascoteData.frases.erro.length)];
        mostrarMensagemMascote(mensagemErro);
      } else {
        const mensagens = [
          "Não desista, você consegue! 💪",
          "Quase lá! Tente novamente! 😉",
          "Errar faz parte do aprendizado! 📖"
        ];
        mostrarMensagemMascote(mensagens[Math.floor(Math.random() * mensagens.length)]);
      }
    }
    
    // Check if max errors reached
    if (erros >= limiteErros) {
      setTimeout(() => {
        mostrarAlertaErros();
      }, 500);
    }
  }
  
  // Update score display
  document.getElementById('pontuacao').innerText = pontuacao;
  document.getElementById('erros').innerText = erros;
  
  // Atualizar barra de progresso
  document.getElementById('progressBar').style.width = `${(pontuacao * 10)}%`;
  
  // Verificar se subiu de nível
  verificarNivel();
  
  // Disable input after answering
  document.getElementById(`resp-${index}`).disabled = true;
  
  // Salvar progresso
  salvarProgresso();
}

/**
 * Shows an alert when the maximum number of errors is reached
 */
function mostrarAlertaErros() {
  const modal = document.getElementById('modal');
  const conteudo = document.getElementById('explicacao-conteudo');
  
  // Tocar som de alerta
  tocarSom('wrongSound');
  
  // Mostrar mensagem do mascote
  if (mascoteData && mascoteData.frases && mascoteData.frases.bloqueio) {
    const mensagemBloqueio = mascoteData.frases.bloqueio[Math.floor(Math.random() * mascoteData.frases.bloqueio.length)];
    mostrarMensagemMascote(mensagemBloqueio);
  } else {
    mostrarMensagemMascote('Oh não! Você atingiu o limite de erros! 😢');
  }
  
  // Atualizar aparência do mascote para triste
  atualizarAparenciaMascote('triste');
  
  conteudo.innerHTML = `
    <div class="alerta-erro">
      <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error-color);"></i>
      <h3>Você atingiu o limite de erros!</h3>
      <p>Você errou 4 questões. Vai ficar sem celular!</p>
      <p>Que tal estudar um pouco mais e tentar novamente?</p>
      <div class="erro-animacao">
        <img src="https://cdn-icons-png.flaticon.com/512/65/65168.png" alt="Celular bloqueado" class="celular-bloqueado">
        <div class="bloqueio"></div>
      </div>
    </div>
  `;
  
  modal.style.display = 'block';
  
  // Adicionar classe de animação ao corpo para efeito de "game over"
  document.body.classList.add('erro-maximo');
  setTimeout(() => {
    document.body.classList.remove('erro-maximo');
  }, 1000);
  
  // Registrar bloqueio no localStorage
  ultimoBloqueio = new Date();
  localStorage.setItem('ultimoBloqueio', ultimoBloqueio.toString());
  
  // Após fechar o modal, mostrar o modal de bloqueio
  setTimeout(() => {
    modal.style.display = 'none';
    ativarBloqueio(ultimoBloqueio);
  }, 5000);
}

/**
 * Fetches and displays an explanation for a specific question
 * @param {number} index - Question index
 */
async function estudar(index) {
  const pergunta = perguntas[index];
  const modal = document.getElementById('modal');
  const conteudo = document.getElementById('explicacao-conteudo');
  
  // Tocar som de clique
  tocarSom('clickSound');
  
  // Mostrar mensagem do mascote
  mostrarMensagemMascote('Boa! Estudar é sempre uma ótima ideia! 📖');
  
  // Adicionar moedas por estudar (recompensa pelo esforço)
  adicionarMoedas(2);
  
  // Show loading state
  conteudo.innerHTML = '<div style="text-align: center;"><div class="loading" style="width: 40px; height: 40px; border-width: 5px; border-top-color: var(--primary-color);"></div><p>Carregando explicação...</p></div>';
  modal.style.display = 'block';
  
  try {
    const response = await fetch('explicacao.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pergunta: pergunta.pergunta })
    });
    
    const data = await response.json();
    
    // Format the explanation with better styling
    const explicacaoFormatada = formatarExplicacao(data.explicacao);
    conteudo.innerHTML = `
      <div class="explicacao-header">
        <i class="fas fa-lightbulb" style="color: var(--accent-color);"></i>
        <h3>Como resolver esta questão</h3>
      </div>
      <div class="pergunta-original">
        <strong>Pergunta:</strong> ${pergunta.pergunta}
      </div>
      <div class="explicacao-conteudo">
        ${explicacaoFormatada}
      </div>
      <div class="explicacao-footer">
        <p><i class="fas fa-info-circle"></i> Esta explicação ajuda a entender o conceito, mas não fornece a resposta direta.</p>
        <p><i class="fas fa-coins" style="color: var(--reward-color);"></i> <strong>+2 moedas</strong> por estudar!</p>
      </div>
    `;
    
    // Verificar se merece medalha de velocista
    if (!categoriasMedalhas.speed && perguntasRespondidas.size === 0) {
      // Se pediu explicação antes de responder qualquer questão
      categoriasMedalhas.speed = true;
      document.getElementById('badge-speed').classList.add('earned');
      medalhas++;
      document.getElementById('medalCount').textContent = medalhas;
      mostrarMensagemMascote('Uau! Você ganhou a medalha de Velocista por estudar primeiro! 💥');
      salvarProgresso();
    }
    
  } catch (error) {
    conteudo.innerHTML = `<p>Erro ao carregar a explicação. Por favor, tente novamente.</p>
                         <p class="error-message">${error.message}</p>`;
    console.error('Erro ao carregar explicação:', error);
  }
}

/**
 * Formats the explanation text with better styling
 * @param {string} texto - The explanation text
 * @returns {string} - Formatted HTML
 */
function formatarExplicacao(texto) {
  // Replace line breaks with paragraphs
  let formatado = texto.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
  formatado = '<p>' + formatado + '</p>';
  
  // Highlight important parts
  formatado = formatado.replace(/importante/gi, '<span class="destaque">importante</span>');
  formatado = formatado.replace(/observe/gi, '<span class="destaque">observe</span>');
  formatado = formatado.replace(/lembre-se/gi, '<span class="destaque">lembre-se</span>');
  formatado = formatado.replace(/dica/gi, '<span class="destaque">dica</span>');
  formatado = formatado.replace(/atenção/gi, '<span class="destaque">atenção</span>');
  
  // Add styling for mathematical expressions
  formatado = formatado.replace(/\b(\d+[+\-*/]\d+)\b/g, '<code>$1</code>');
  formatado = formatado.replace(/\b(x|y|z|a|b|c)\s*[=]\s*([^<]+)/g, '<code>$1 = $2</code>');
  
  // Adicionar ilustrações simples para conceitos comuns
  if (formatado.includes('fraç') || formatado.includes('divisão')) {
    formatado += `
      <div class="ilustracao">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="#f5f5f5" stroke="#333" stroke-width="2"/>
          <line x1="5" y1="50" x2="95" y2="50" stroke="#333" stroke-width="2"/>
          <path d="M50,5 L50,95" stroke="#333" stroke-width="2"/>
        </svg>
        <p><small>Representação visual de frações</small></p>
      </div>
    `;
  }
  
  if (formatado.includes('triângulo')) {
    formatado += `
      <div class="ilustracao">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="#f5f5f5" stroke="#333" stroke-width="2"/>
        </svg>
        <p><small>Triângulo</small></p>
      </div>
    `;
  }
  
  if (formatado.includes('quadrado') || formatado.includes('retângulo')) {
    formatado += `
      <div class="ilustracao">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" fill="#f5f5f5" stroke="#333" stroke-width="2"/>
        </svg>
        <p><small>Quadrado/Retângulo</small></p>
      </div>
    `;
  }
  
  return formatado;
}

/**
 * Gera a próxima pergunta
 * Suporta o Desafio Supremo com matérias mistas
 */
function gerarProximaPergunta() {
  // Garantir que as matérias mistas estejam sempre ativadas
  localStorage.setItem('materiasMistas', 'true');
  
  const perguntasContainer = document.getElementById('perguntas');
  perguntasContainer.innerHTML = '<div class="loading-container"><div class="loading"></div><p>Gerando nova pergunta...</p></div>';
  
  // Verificar se é o Desafio Supremo ou Matérias Mistas
  const modoSupremo = localStorage.getItem('modoSupremo') === 'true';
  const materiasMistas = true; // Sempre usar matérias mistas
  const modoPunicao = localStorage.getItem('modoPunicao') === 'true';
  
  // Preparar os dados para a requisição
  let requestData = {};
  
  if (modoSupremo || materiasMistas) {
    // No modo de matérias mistas, usar o sistema de matérias mistas
    if (window.materias && typeof window.materias.gerarQuestaoAtual === 'function') {
      // Se a função gerarQuestaoAtual estiver disponível, usar
      window.materias.gerarQuestaoAtual()
        .then(questao => {
          if (questao) {
            // Se a função retornar uma questão, usar
            perguntas.push(questao);
            renderizarPerguntas();
          } else {
            // Se não, gerar uma questão aleatória
            gerarQuestaoAleatoria();
          }
        })
        .catch(error => {
          console.error('Erro ao gerar questão de matérias mistas:', error);
          gerarQuestaoAleatoria();
        });
      return;
    } else {
      // Se a função não estiver disponível, configurar para matérias mistas
      requestData = {
        materiasMistas: true,
        desafioSupremo: modoSupremo
      };
    }
  } else {
    // No modo normal, selecionar uma matéria e tópico aleatórios
    const materiaIndex = Math.floor(Math.random() * materias.length);
    const materia = materias[materiaIndex].nome;
    
    const topicos = materias[materiaIndex].topicos;
    const topicoIndex = Math.floor(Math.random() * topicos.length);
    const topico = topicos[topicoIndex];
    
    requestData = {
      materia: materia,
      topico: topico
    };
  }
  
  // Adicionar informação de modo punição se estiver ativo
  if (modoPunicao) {
    requestData.modoPunicao = true;
  }
  
  // Fazer requisição para gerar a pergunta
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
      perguntas = data.perguntas;
      renderizarPerguntas();
    } else {
      perguntasContainer.innerHTML = `<div class="pergunta-card error-card">
        <p>Erro ao gerar perguntas. Por favor, tente novamente.</p>
      </div>`;
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    perguntasContainer.innerHTML = `<div class="pergunta-card error-card">
      <p>Erro ao gerar perguntas. Por favor, tente novamente.</p>
      <p class="error-message">${error.message}</p>
    </div>`;
  });
}

/**
 * Renderiza as alternativas de múltipla escolha para uma pergunta
 * @param {Array} alternativas - Array de alternativas
 * @param {number} perguntaIndex - Índice da pergunta
 * @returns {string} HTML das alternativas
 */
function renderizarAlternativas(alternativas, perguntaIndex) {
  if (!alternativas || !Array.isArray(alternativas) || alternativas.length === 0) {
    return '<div class="sem-alternativas">Erro ao carregar alternativas</div>';
  }
  
  // Criar as alternativas como radio buttons
  let html = '<div class="opcoes-container">';
  
  alternativas.forEach((alternativa, index) => {
    const id = `alt-${perguntaIndex}-${index}`;
    const letra = String.fromCharCode(65 + index); // A, B, C, D...
    
    html += `
      <div class="opcao">
        <input type="radio" id="${id}" name="resposta-${perguntaIndex}" value="${alternativa}">
        <label for="${id}">
          <span class="letra-alternativa">${letra}</span>
          <span class="texto-alternativa">${alternativa}</span>
        </label>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

/**
 * Gera uma questão aleatória como fallback
 */
function gerarQuestaoAleatoria() {
  // Selecionar uma matéria e tópico aleatórios
  const materiaIndex = Math.floor(Math.random() * materias.length);
  const materia = materias[materiaIndex].nome;
  
  const topicos = materias[materiaIndex].topicos;
  const topicoIndex = Math.floor(Math.random() * topicos.length);
  const topico = topicos[topicoIndex];
  
  // Fazer a requisição para o servidor
  fetch('gemini.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      materia: materia,
      topico: topico
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.perguntas && data.perguntas.length > 0) {
      // Adicionar a pergunta ao array de perguntas
      perguntas = data.perguntas;
      
      // Renderizar a pergunta
      renderizarPerguntas();
    } else {
      const container = document.getElementById('perguntas');
      container.innerHTML = `<div class="pergunta-card error-card">
        <p>Erro ao gerar pergunta. Por favor, tente novamente.</p>
      </div>`;
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    const container = document.getElementById('perguntas');
    container.innerHTML = `<div class="pergunta-card error-card">
      <p>Erro ao gerar pergunta. Por favor, tente novamente.</p>
      <p class="error-message">${error.message}</p>
    </div>`;
  });
}
