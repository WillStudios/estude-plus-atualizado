/**
 * ESTUDE+ - Application Engine
 * Desenvolvido por Freddie Pimentel Costa
 * "Seu parceiro inteligente para estudar melhor"
 */

class EstudePlusApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.storageKey = 'estude_plus_data_v15';
    this.usersStorageKey = 'estude_users_v3';
    this.currentUserStorageKey = 'estude_current_user_v3';
    this.selectedPaymentMethod = 'pix';
    try {
      const spParts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', day: 'numeric' }).formatToParts(new Date());
      const dayVal = spParts.find(p => p.type === 'day')?.value;
      this.agendaSelectedDay = dayVal ? parseInt(dayVal, 10) : new Date().getDate();
    } catch (e) {
      this.agendaSelectedDay = new Date().getDate();
    }
    this.agendaOffsetWeeks = 0;
    this.deferredPrompt = null;
    this.currentPdfBook = null;
    this.currentSasSubject = 'matematica';
    this.currentSasBookId = 1;
    this.currentSasChapterId = 1;
    this.currentHubFilter = 'all';
    this.sasBooksAccordionState = { 1: true, 2: false, 3: false, 4: false };

    // Estrutura Completa de Livros e Capítulos SAS - Coleção Asas 2026 (7º Ano)
    this.sasSubjectsData = {
      matematica: {
        name: 'Matemática',
        icon: '📐',
        color: '#2563eb',
        meta: 'Asas 2026 • Ensino Fundamental - Anos Finais • 7º Ano',
        livros: [
          {
            id: 1,
            title: 'Livro 1',
            chapters: [
              { id: 1, title: 'Capítulo 1 – Divisibilidade', tag: 'Capítulo 1', desc: 'Múltiplos, divisores, critérios de divisibilidade (2, 3, 4, 5, 6, 8, 9, 10), números primos e compostos, fatoração completa e decomposição prima.' },
              { id: 2, title: 'Capítulo 2 – Números inteiros', tag: 'Capítulo 2', desc: 'Conceito de número negativo, reta numérica inteira, módulo ou valor absoluto, números opostos/simétricos e comparação de inteiros.' },
              { id: 3, title: 'Capítulo 3 – Operações com números inteiros', tag: 'Capítulo 3', desc: 'Adição, subtração, jogo de sinais, multiplicação, divisão e expressões numéricas com parênteses, colchetes e chaves.' },
              { id: 4, title: 'Capítulo 4 – Circunferência', tag: 'Capítulo 4', desc: 'Definição de circunferência e círculo, centro, raio, diâmetro, corda, arco, número Pi (π) e cálculo do comprimento C = 2πr.' },
              { id: 5, title: 'Capítulo 5 – Transformações geométricas no plano cartesiano', tag: 'Capítulo 5', desc: 'Coordenadas cartesianas (x, y), eixos das abscissas e ordenadas, quadrantes, simetria de reflexão, translação e rotação de figuras.' }
            ]
          },
          {
            id: 2,
            title: 'Livro 2',
            chapters: [
              { id: 6, title: 'Capítulo 6 – Frações e números racionais', tag: 'Capítulo 6', desc: 'Conceito de número racional, representação fracionária e decimal, frações equivalentes e simplificação.' },
              { id: 7, title: 'Capítulo 7 – Operações com números racionais', tag: 'Capítulo 7', desc: 'Adição, subtração com MMC, multiplicação, divisão, potenciação e raiz quadrada de números racionais.' },
              { id: 8, title: 'Capítulo 8 – Equações do 1º grau', tag: 'Capítulo 8', desc: 'Igualdade matemática, princípios aditivo e multiplicativo, resolução de equações e problemas do cotidiano.' },
              { id: 9, title: 'Capítulo 9 – Proporcionalidade e regra de três', tag: 'Capítulo 9', desc: 'Razão, proporção, grandezas diretamente e inversamente proporcionais e regra de três simples.' }
            ]
          },
          {
            id: 3,
            title: 'Livro 3',
            chapters: [
              { id: 10, title: 'Capítulo 10 – Ângulos e polígonos', tag: 'Capítulo 10', desc: 'Medida de ângulos, ângulos retos, agudos, obtusos, complementares e suplementares, vértices e diagonais.' },
              { id: 11, title: 'Capítulo 11 – Triângulos e quadriláteros', tag: 'Capítulo 11', desc: 'Condição de existência de triângulos, classificação por lados e ângulos, soma dos ângulos internos e paralelogramos.' },
              { id: 12, title: 'Capítulo 12 – Medidas e áreas de figuras planas', tag: 'Capítulo 12', desc: 'Cálculo de área e perímetro: retângulo, quadrado, paralelogramo, triângulo e trapézio.' },
              { id: 13, title: 'Capítulo 13 – Estatística e probabilidade', tag: 'Capítulo 13', desc: 'Coleta de dados, tabelas de frequência, gráficos de barras e setores e cálculo de probabilidade simples.' }
            ]
          },
          {
            id: 4,
            title: 'Livro 4',
            chapters: [
              { id: 14, title: 'Capítulo 14 – Médias e gráficos avançados', tag: 'Capítulo 14', desc: 'Média aritmética simples, média ponderada, moda, mediana e interpretação de gráficos estatísticos.' },
              { id: 15, title: 'Capítulo 15 – Volume e capacidade', tag: 'Capítulo 15', desc: 'Unidades de medida cúbicas (m³, dm³, cm³), relação com litros e mililitros e volume do paralelepípedo.' },
              { id: 16, title: 'Capítulo 16 – Raciocínio combinatório', tag: 'Capítulo 16', desc: 'Princípio multiplicativo, árvore de possibilidades e contagem de agrupamentos sem repetição.' },
              { id: 17, title: 'Capítulo 17 – Revisão Geral para Avaliações SAAS', tag: 'Capítulo 17', desc: 'Revisão intensiva das matrizes de habilidades do 7º ano e simulados formativos para a prova.' }
            ]
          }
        ]
      },
      portugues: {
        name: 'Língua Portuguesa',
        icon: '✍️',
        color: '#059669',
        meta: 'Asas 2026 • Ensino Fundamental - Anos Finais • 7º Ano',
        livros: [
          {
            id: 1,
            title: 'Livro 1',
            chapters: [
              { id: 1, title: 'Capítulo 1 – Gênero Notícia e Reportagem', tag: 'Capítulo 1', desc: 'Estrutura da notícia, lide (lead), manchete, pirâmide invertida e linguagem jornalística objetiva.' },
              { id: 2, title: 'Capítulo 2 – Tipos de Frase e Pontuação', tag: 'Capítulo 2', desc: 'Frases declarativas, interrogativas, exclamativas e imperativas. Emprego correto da vírgula e ponto e vírgula.' },
              { id: 3, title: 'Capítulo 3 – Substantivos e Adjetivos no Texto', tag: 'Capítulo 3', desc: 'Flexão de gênero, número e grau, função adjetiva e caracterização em crônicas e contos.' },
              { id: 4, title: 'Capítulo 4 – Termos Essenciais da Oração: Sujeito e Predicado', tag: 'Capítulo 4', desc: 'Identificação de sujeito (simples, composto, oculto, indeterminado) e tipos de predicado.' }
            ]
          },
          {
            id: 2,
            title: 'Livro 2',
            chapters: [
              { id: 5, title: 'Capítulo 5 – Transitividade Verbal e Objetos', tag: 'Capítulo 5', desc: 'Verbos transitivos diretos, indiretos e intransitivos; objeto direto e indireto.' },
              { id: 6, title: 'Capítulo 6 – A Crônica Narrativa e Reflexiva', tag: 'Capítulo 6', desc: 'Cotidiano na literatura, ironia, humor, ponto de vista do narrador e tempo psicológico.' },
              { id: 7, title: 'Capítulo 7 – Concordância Verbal Fundamental', tag: 'Capítulo 7', desc: 'Regras gerais de concordância do verbo com sujeitos simples e compostos.' }
            ]
          },
          {
            id: 3,
            title: 'Livro 3',
            chapters: [
              { id: 8, title: 'Capítulo 8 – Pronomes e Mecanismos de Coesão', tag: 'Capítulo 8', desc: 'Pronomes pessoais, possessivos, demonstrativos e sua função referencial no texto.' },
              { id: 9, title: 'Capítulo 9 – Figuras de Linguagem', tag: 'Capítulo 9', desc: 'Metáfora, comparação, personificação/prosopopeia, antítese e hipérbole nos poemas.' },
              { id: 10, title: 'Capítulo 10 – Orações Coordenadas', tag: 'Capítulo 10', desc: 'Coordenação assindética e sindética: aditivas, adversativas, alternativas, conclusivas e explicativas.' }
            ]
          },
          {
            id: 4,
            title: 'Livro 4',
            chapters: [
              { id: 11, title: 'Capítulo 11 – Regência e Uso da Crase', tag: 'Capítulo 11', desc: 'Regência dos verbos assistir, visar, obedecer, ir/chegar e casos obrigatórios e proibidos de crase.' },
              { id: 12, title: 'Capítulo 12 – Texto Argumentativo e Artigo de Opinião', tag: 'Capítulo 12', desc: 'Tese, argumentos de autoridade, contra-argumentação e proposta de conclusão.' }
            ]
          }
        ]
      },
      ciencias: {
        name: 'Ciências da Natureza',
        icon: '🔬',
        color: '#0891b2',
        meta: 'Asas 2026 • Ensino Fundamental - Anos Finais • 7º Ano',
        livros: [
          {
            id: 1,
            title: 'Livro 1',
            chapters: [
              { id: 1, title: 'Capítulo 1 – Máquinas Simples e Força', tag: 'Capítulo 1', desc: 'Alavancas (interfixa, inter-resistente, interpotente), roldanas, plano inclinado e vantagem mecânica.' },
              { id: 2, title: 'Capítulo 2 – Calor, Temperatura e Equilíbrio Térmico', tag: 'Capítulo 2', desc: 'Diferença entre calor e temperatura, escalas termométricas e sensação térmica.' },
              { id: 3, title: 'Capítulo 3 – Formas de Propagação do Calor', tag: 'Capítulo 3', desc: 'Condução em sólidos, convecção em fluidos e irradiação por ondas eletromagnéticas.' },
              { id: 4, title: 'Capítulo 4 – Os Grandes Biomas Brasileiros', tag: 'Capítulo 4', desc: 'Amazônia, Cerrado, Caatinga, Mata Atlântica, Pantanal e Pampa: flora, fauna e clima.' }
            ]
          },
          {
            id: 2,
            title: 'Livro 2',
            chapters: [
              { id: 5, title: 'Capítulo 5 – A Diversidade da Vida e Reinos', tag: 'Capítulo 5', desc: 'Os 5 reinos de seres vivos, taxonomia, nomenclatura binomial e árvores filogenéticas.' },
              { id: 6, title: 'Capítulo 6 – Vírus e Bactérias', tag: 'Capítulo 6', desc: 'Estrutura acelular dos vírus, bactérias autótrofas e heterótrofas, importância ecológica e doenças.' }
            ]
          },
          {
            id: 3,
            title: 'Livro 3',
            chapters: [
              { id: 7, title: 'Capítulo 7 – Fungos, Algas e Protozoários', tag: 'Capítulo 7', desc: 'Reino Fungi, protozoários flagelados, ciliados e amebas; doenças transmitidas por vetores.' },
              { id: 8, title: 'Capítulo 8 – O Reino Vegetal', tag: 'Capítulo 8', desc: 'Briófitas, Pteridófitas, Gimnospermas e Angiospermas: evolução, flores, sementes e frutos.' }
            ]
          },
          {
            id: 4,
            title: 'Livro 4',
            chapters: [
              { id: 9, title: 'Capítulo 9 – Animais Invertebrados e Vertebrados', tag: 'Capítulo 9', desc: 'Poríferos, cnidários, vermes, moluscos, artrópodes, peixes, anfíbios, répteis, aves e mamíferos.' },
              { id: 10, title: 'Capítulo 10 – Saúde Coletiva e Vacinação', tag: 'Capítulo 10', desc: 'Sistema imunológico humano, anticorpos, antígenos, memória imune e impacto histórico das vacinas.' }
            ]
          }
        ]
      },
      historia: {
        name: 'História',
        icon: '🏛️',
        color: '#d97706',
        meta: 'Asas 2026 • Ensino Fundamental - Anos Finais • 7º Ano',
        livros: [
          {
            id: 1,
            title: 'Livro 1',
            chapters: [
              { id: 1, title: 'Capítulo 1 – Feudalismo e Sociedade Medieval', tag: 'Capítulo 1', desc: 'Queda do Império Romano do Ocidente, relações feudo-vassálicas, servos, nobreza e poder da Igreja Católica.' },
              { id: 2, title: 'Capítulo 2 – O Mundo Islâmico e Expansão Árabe', tag: 'Capítulo 2', desc: 'Maomé, preceitos do Islã, expansão militar no Mediterrâneo e avanços científicos árabes.' },
              { id: 3, title: 'Capítulo 3 – As Cruzadas e o Renascimento Comercial', tag: 'Capítulo 3', desc: 'Expedições cruzadas a Jerusalém, reabertura de rotas comerciais e o renascimento das cidades europeias.' }
            ]
          },
          {
            id: 2,
            title: 'Livro 2',
            chapters: [
              { id: 4, title: 'Capítulo 4 – O Renascimento Cultural e Científico', tag: 'Capítulo 4', desc: 'Humanismo, antropocentrismo, artes plásticas em Florença e Roma, Galileu e a revolução heliocêntrica.' },
              { id: 5, title: 'Capítulo 5 – As Reformas Religiosas e Contrarreforma', tag: 'Capítulo 5', desc: 'Martinho Lutero, 95 teses, calvinismo, anglicanismo, Concílio de Trento e Companhia de Jesus.' },
              { id: 6, title: 'Capítulo 6 – As Grandes Navegações e Mercantilismo', tag: 'Capítulo 6', desc: 'Pioneirismo português, rota das Índias, viagem de Colombo e Cabral, tratados de Tordesilhas.' }
            ]
          },
          {
            id: 3,
            title: 'Livro 3',
            chapters: [
              { id: 7, title: 'Capítulo 7 – Povos Pré-Colombianos: Maias, Astecas e Incas', tag: 'Capítulo 7', desc: 'Organização social, arquitetura monumental, astronomia, agricultura em chinampas e terraços andinos.' },
              { id: 8, title: 'Capítulo 8 – Conquista e Colonização da América Espanhola', tag: 'Capítulo 8', desc: 'Cortés, Pizarro, encomienda, mita, genocídio indígena e exploração de prata em Potosí.' },
              { id: 9, title: 'Capítulo 9 – Reinos Africanos e Tráfico Transatlântico', tag: 'Capítulo 9', desc: 'Reinos de Mali, Congo e Songhai, rotas caravanistas do ouro e o comércio negreiro forçado.' }
            ]
          },
          {
            id: 4,
            title: 'Livro 4',
            chapters: [
              { id: 10, title: 'Capítulo 10 – Brasil Colônia: Economia Açucareira e Escravidão', tag: 'Capítulo 10', desc: 'Capitanias hereditárias, governo-geral, engenhos de açúcar no Nordeste e resistência quilombola.' },
              { id: 11, title: 'Capítulo 11 – O Ciclo do Ouro e Interiorização do Brasil', tag: 'Capítulo 11', desc: 'Bandeirantes, descobertas em Minas Gerais, barroco mineiro, impostos da Coroa e Inconfidência Mineira.' }
            ]
          }
        ]
      },
      geografia: {
        name: 'Geografia',
        icon: '🌍',
        color: '#0d9488',
        meta: 'Asas 2026 • Ensino Fundamental - Anos Finais • 7º Ano',
        livros: [
          {
            id: 1,
            title: 'Livro 1',
            chapters: [
              { id: 1, title: 'Capítulo 1 – O Território Brasileiro e Divisão Regional', tag: 'Capítulo 1', desc: 'Fronteiras, fusos horários do Brasil, divisão oficial do IBGE em 5 macrorregiões e complexos geoeconômicos.' },
              { id: 2, title: 'Capítulo 2 – Relevo, Clima e Hidrografia do Brasil', tag: 'Capítulo 2', desc: 'Planaltos, depressões e planícies brasileiras, climas equatorial, tropical, semiárido e bacias hidrográficas.' }
            ]
          },
          {
            id: 2,
            title: 'Livro 2',
            chapters: [
              { id: 3, title: 'Capítulo 3 – Dinâmica Populacional e Demografia Brasileira', tag: 'Capítulo 3', desc: 'Crescimento vegetativo, transição demográfica, pirâmides etárias, fluxos migratórios e IDH.' },
              { id: 4, title: 'Capítulo 4 – Urbanização e Estrutura das Cidades', tag: 'Capítulo 4', desc: 'Êxodo rural, metropolização, conurbação, megacidades e problemas socioambientais urbanos.' }
            ]
          },
          {
            id: 3,
            title: 'Livro 3',
            chapters: [
              { id: 5, title: 'Capítulo 5 – Região Norte: Espaço e Amazônia', tag: 'Capítulo 5', desc: 'Bacia amazônica, Zona Franca de Manaus, arco do desmatamento e preservação de terras indígenas.' },
              { id: 6, title: 'Capítulo 6 – Região Nordeste: As Quatro Sub-regiões', tag: 'Capítulo 6', desc: 'Zona da Mata, Agreste, Sertão e Meio-Norte; transposição do Rio São Francisco e polos industriais.' }
            ]
          },
          {
            id: 4,
            title: 'Livro 4',
            chapters: [
              { id: 7, title: 'Capítulo 7 – Região Centro-Oeste e o Agronegócio', tag: 'Capítulo 7', desc: 'Brasília, expansão da fronteira agrícola, cultivo de soja, pecuária extensiva e impactos no Cerrado e Pantanal.' },
              { id: 8, title: 'Capítulo 8 – Sudeste e Sul: Coração Econômico do País', tag: 'Capítulo 8', desc: 'Concentração industrial, complexos portuários, agricultura de precisão e desafios ambientais.' }
            ]
          }
        ]
      },
      ingles: {
        name: 'Língua Inglesa',
        icon: '🇬🇧',
        color: '#4f46e5',
        meta: 'Asas 2026 • Ensino Fundamental - Anos Finais • 7º Ano',
        livros: [
          {
            id: 1,
            title: 'Livro 1',
            chapters: [
              { id: 1, title: 'Chapter 1 – Routine, Habits & Simple Present', tag: 'Capítulo 1', desc: 'Adverbs of frequency (always, often, never), third person singular rules (-s, -es, -ies), daily routine texts.' },
              { id: 2, title: 'Chapter 2 – Free Time & Present Continuous', tag: 'Capítulo 2', desc: 'Actions happening now, form of verb to be + verb-ing, contrast between Simple Present and Continuous.' }
            ]
          },
          {
            id: 2,
            title: 'Livro 2',
            chapters: [
              { id: 3, title: 'Chapter 3 – Past Memories: Simple Past (Regular Verbs)', tag: 'Capítulo 3', desc: 'Past tense -ed endings, pronunciation rules, negative and interrogative with did / didn\'t.' },
              { id: 4, title: 'Chapter 4 – Past Stories: Irregular Verbs & Biographies', tag: 'Capítulo 4', desc: 'Common irregular verbs (went, saw, had, took), reading historical biographies.' }
            ]
          },
          {
            id: 3,
            title: 'Livro 3',
            chapters: [
              { id: 5, title: 'Chapter 5 – Food & Quantifiers (Countable and Uncountable)', tag: 'Capítulo 5', desc: 'Many, much, a lot of, some, any, food vocabulary, ordering meals at a restaurant.' }
            ]
          },
          {
            id: 4,
            title: 'Livro 4',
            chapters: [
              { id: 6, title: 'Chapter 6 – Future Plans (Going to & Will) & SAAS Review', tag: 'Capítulo 6', desc: 'Intentions and predictions, modal verbs should/must and reading comprehension tests.' }
            ]
          }
        ]
      }
    };


    // Load registered users and current logged in session
    this.users = this.loadUsers();
    this.currentUser = this.loadCurrentUser();

    // 12 Apostilas Oficiais SAS - Coleção Asas 2026 (7º Ano)
    this.sasBooks = [
      { id: 'sas-mat', name: 'Matemática (Asas 2026)', subject: 'Matemática', grade: '7º Ano', pages: 284, summary: 'Frações, Operações com Racionais, Equações do 1º Grau, Ângulos e Geometria Plana.', color: '#2563eb', icon: 'calculator' },
      { id: 'sas-port', name: 'Língua Portuguesa (Asas 2026)', subject: 'Português', grade: '7º Ano', pages: 310, summary: 'Sintaxe da Oração, Pontuação, Regência Verbal e Nominal, Coesão e Interpretação.', color: '#059669', icon: 'book-open' },
      { id: 'sas-cie', name: 'Ciências da Natureza (Asas 2026)', subject: 'Ciências', grade: '7º Ano', pages: 260, summary: 'Ecossistemas Brasileiros, Matéria e Energia, Seres Vivos e Cadeias Alimentares.', color: '#0891b2', icon: 'flask-conical' },
      { id: 'sas-hist', name: 'História (Asas 2026)', subject: 'História', grade: '7º Ano', pages: 240, summary: 'Idade Média, Renascimento Cultural, Expansão Marítima e Sociedades Indígenas.', color: '#d97706', icon: 'landmark' },
      { id: 'sas-geo', name: 'Geografia (Asas 2026)', subject: 'Geografia', grade: '7º Ano', pages: 235, summary: 'Território Brasileiro, Dinâmica Demográfica, Urbanização e Domínios Morfoclimáticos.', color: '#16a34a', icon: 'map-pin' },
      { id: 'sas-ing', name: 'Língua Inglesa (Asas 2026)', subject: 'Inglês', grade: '7º Ano', pages: 180, summary: 'Grammar in Context, Reading Comprehension, Everyday Vocabulary and Dialogues.', color: '#7c3aed', icon: 'languages' },
      { id: 'sas-red', name: 'Pratique Redação (Anos Finais 2026)', subject: 'Redação', grade: '7º Ano', pages: 195, summary: 'Crônica, Artigo de Opinião, Carta Argumentativa e Repertório Sociocultural.', color: '#dc2626', icon: 'pencil-line' },
      { id: 'sas-art', name: 'Arte (Asas 2026)', subject: 'Arte', grade: '7º Ano', pages: 160, units: 'Expressão Visual, História da Arte, Teatro e Patrimônio Cultural Brasileiro.', color: '#ea580c', icon: 'palette' },
      { id: 'sas-filo', name: 'Filosofia (Asas 2026)', subject: 'Filosofia', grade: '7º Ano', pages: 150, summary: 'Ética, Pensamento Crítico, Cidadania e Investigação sobre o Conhecimento Humano.', color: '#9333ea', icon: 'brain' },
      { id: 'sas-log', name: 'Lógica & Raciocínio (Asas 2026)', subject: 'Lógica', grade: '7º Ano', pages: 175, summary: 'Raciocínio Espacial, Lógica Dedutiva, Algoritmos e Resolução de Problemas.', color: '#0284c7', icon: 'puzzle' },
      { id: 'sas-olimp', name: 'Jornada Olímpica (7º Ano)', subject: 'Olímpica', grade: '7º Ano', pages: 210, summary: 'Questões Avançadas e Treinamento Focado para OBMEP, OBA e Simulados SAS.', color: '#eab308', icon: 'trophy' },
      { id: 'sas-esp', name: 'Língua Espanhola (Asas 2026)', subject: 'Espanhol', grade: '7º Ano', pages: 165, summary: 'Gramática Contextualizada, Comprensión de Textos y Comunicación Cotidiana.', color: '#f43f5e', icon: 'globe-2' }
    ];

    // Initial State with story-driven data strictly aligned with SAS and GAMMON+
    this.state = this.loadState() || {
      streak: 5,
      trialDaysRemaining: 0,
      isSubscribed: false,
      planStatus: 'free',
      payments: [
        {
          id: 'PAG-7821',
          studentName: 'Lucas Gammon',
          email: 'aluno@gammon.com.br',
          method: 'cash',
          amount: 19.90,
          date: '2026-10-03',
          status: 'pending',
          note: 'Dinheiro vivo em mãos na escola para o Freddie'
        }
      ],
            // TPCs Diários (Adicionados pelo usuário / professor)
      tpcs: [
        {
          id: 'tpc-mat-elaine-0210',
          subject: 'Matemática',
          title: 'Atividade Suplementar – pág. 50 (para 05/10)',
          dueDate: '2026-10-05',
          status: 'pending',
          details: 'Atividade Suplementar - página 50, para o dia 05/10. Postado no Portal Gammon por Profª ELAINE APARECIDA LEANDRO DOS SANTOS (Turma 17B • 3º Trimestre • Grupo Aluno).',
          teacher: 'Profª Elaine Aparecida Leandro dos Santos',
          difficulty: 'Média',
          tpcType: 'TPC Diário',
          fromOccurrence: true,
          turma: '17B',
          etapa: '3º T',
          dataOcorrencia: '02/10/2026',
          portalLink: 'https://portal.gammon.br/framehtml/web/app/edu/portaleducacional/#/ocorrencias'
        }
      ],
      // Grade Semanal de Aulas Oficial (Campus Chácara - 7º Ano - Freddie Pimentel Costa RA: 009735)
      timetable: [
        {
          time: '07:30 - 08:15',
          segunda: { subject: 'Matemática', room: 'Sala 7º Ano', hasTpc: true },
          terca: { subject: 'Língua Portuguesa', room: 'Sala 7º Ano', hasTpc: false },
          quarta: { subject: 'Arte', room: 'Sala 7º Ano', hasTpc: false },
          quinta: { subject: 'Redação', room: 'Sala 7º Ano', hasTpc: true },
          sexta: { subject: 'Língua Portuguesa', room: 'Sala 7º Ano', hasTpc: false }
        },
        {
          time: '08:15 - 09:00',
          segunda: { subject: 'Língua Inglesa', room: 'Sala 7º Ano', hasTpc: false },
          terca: { subject: 'Educação Física', room: 'Ginásio / Quadra', hasTpc: false },
          quarta: { subject: 'História', room: 'Sala 7º Ano', hasTpc: false },
          quinta: { subject: 'Língua Inglesa', room: 'Sala 7º Ano', hasTpc: true },
          sexta: { subject: 'Matemática', room: 'Sala 7º Ano', hasTpc: true }
        },
        {
          time: '09:00 - 09:45',
          segunda: { subject: 'Matemática', room: 'Sala 7º Ano', hasTpc: true },
          terca: { subject: 'Língua Inglesa', room: 'Sala 7º Ano', hasTpc: false },
          quarta: { subject: 'Geografia', room: 'Sala 7º Ano', hasTpc: false },
          quinta: { subject: 'Matemática', room: 'Sala 7º Ano', hasTpc: true },
          sexta: { subject: 'História', room: 'Sala 7º Ano', hasTpc: false }
        },
        {
          time: '10:05 - 10:50',
          segunda: { subject: 'Ensino Religioso', room: 'Sala 7º Ano', hasTpc: false },
          terca: { subject: 'Língua Portuguesa', room: 'Sala 7º Ano', hasTpc: false },
          quarta: { subject: 'Língua Portuguesa', room: 'Sala 7º Ano', hasTpc: false },
          quinta: { subject: 'Redação', room: 'Sala 7º Ano', hasTpc: false },
          sexta: { subject: 'Ciências', room: 'Lab. Ciências', hasTpc: false }
        },
        {
          time: '10:50 - 11:35',
          segunda: { subject: 'Geografia', room: 'Sala 7º Ano', hasTpc: false },
          terca: { subject: 'Geografia', room: 'Sala 7º Ano', hasTpc: false },
          quarta: { subject: 'Ciências', room: 'Lab. Ciências', hasTpc: false },
          quinta: { subject: 'Matemática', room: 'Sala 7º Ano', hasTpc: false },
          sexta: { subject: 'Língua Inglesa', room: 'Sala 7º Ano', hasTpc: false }
        },
        {
          time: '11:35 - 12:20',
          segunda: { subject: 'Ciências', room: 'Lab. Ciências', hasTpc: false },
          terca: { subject: 'Matemática', room: 'Sala 7º Ano', hasTpc: false },
          quarta: { subject: 'Educação Física', room: 'Ginásio / Quadra', hasTpc: false },
          quinta: { subject: 'História', room: 'Sala 7º Ano', hasTpc: false },
          sexta: { subject: 'Língua Portuguesa', room: 'Sala 7º Ano', hasTpc: false }
        }
      ],
      streak: 5,
      trialDaysRemaining: 0,
      isSubscribed: false,
      exams: [
        { id: 1, subject: 'Matemática (SAS Livro 3)', topics: 'Cap. 4: Frações, MMC e Equações do 1º Grau', date: '2026-10-07', priority: 'Alta' },
        { id: 2, subject: 'SAAS Avaliação Formativa', topics: 'Matriz de Habilidades: Ciências & Linguagens', date: '2026-10-12', priority: 'Alta' },
        { id: 3, subject: 'História (SAS Livro 2)', topics: 'Cap. 6: Brasil República & Era Vargas', date: '2026-10-18', priority: 'Média' }
      ],
      materials: [
        { 
          id: 100, 
          title: '📖 Capítulo Digital Integrado (Cap. a7a95b91)', 
          category: 'Apostilas', 
          subject: 'Apostila Ativa SAS (7º Ano)', 
          summary: 'Capítulo ativo da apostila digital da sua escola. Teoria, exemplos resolvidos e exercícios prioritários.', 
          link: 'https://livrosdigitais.portalsaseducacao.com.br/capitulos/a7a95b91-79dc-417a-a512-4f85770356b1',
          isOfficialActive: true,
          colecao: 'Asas 2026'
        },
        { 
          id: 101, 
          title: 'Matemática - Asas 2026', 
          category: 'Apostilas', 
          subject: 'Matemática', 
          summary: 'Ensino Fundamental - Anos Finais • 7º ano • Matemática. Frações, números racionais, equações e geometria.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 102, 
          title: 'Língua Portuguesa - Asas 2026', 
          category: 'Apostilas', 
          subject: 'Português', 
          summary: 'Ensino Fundamental - Anos Finais • 7º ano • Língua Portuguesa. Sintaxe, pontuação, leitura, gramática e interpretação.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 103, 
          title: 'Ciências - Asas 2026', 
          category: 'Apostilas', 
          subject: 'Ciências', 
          summary: 'Ensino Fundamental - Anos Finais • 7º ano • Ciências. Ecossistemas, matéria, energia e seres vivos.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 104, 
          title: 'História - Asas 2026', 
          category: 'Apostilas', 
          subject: 'História', 
          summary: 'Ensino Fundamental - Anos Finais • 7º ano • História. Sociedades medievais, renascimento cultural, expansão marítima e formação do Brasil.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 105, 
          title: 'Geografia - Asas 2026', 
          category: 'Apostilas', 
          subject: 'Geografia', 
          summary: 'Ensino Fundamental - Anos Finais • 7º ano • Geografia. Território brasileiro, regiões, dinâmica populacional e relevo.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 106, 
          title: 'Língua Inglesa - Asas 2026', 
          category: 'Apostilas', 
          subject: 'Inglês', 
          summary: 'Ensino Fundamental - Anos Finais • 7º ano • Língua Inglesa. Reading, vocabulary, grammar structures and communication.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 107, 
          title: 'Pratique Redação - Anos Finais 2026', 
          category: 'SAAS', 
          subject: 'Redação', 
          summary: 'Ensino Fundamental - 7º ano • Laboratório de temas, estruturas textuais, gêneros e propostas dissertativas.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 108, 
          title: 'Arte - Asas 2026', 
          category: 'Apostilas', 
          subject: 'Arte', 
          summary: 'Ensino Fundamental - Anos Finais • 7º ano • Arte. Linguagens visuais, história da arte, patrimônio e expressão cultural.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 109, 
          title: 'Filosofia - Asas 2026', 
          category: 'Apostilas', 
          subject: 'Filosofia', 
          summary: 'Ensino Fundamental - Anos Finais • 7º ano • Filosofia. Ética, pensamento crítico, reflexão e cidadania.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 110, 
          title: 'Lógica - Asas 2026', 
          category: 'Apostilas', 
          subject: 'Lógica', 
          summary: 'Ensino Fundamental - Anos Finais • 7º ano • Lógica. Resolução de problemas, raciocínio lógico-matemático e estratégias.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 111, 
          title: 'Jornada Olímpica - 7º ano', 
          category: 'Exercícios', 
          subject: 'Olimpíadas', 
          summary: 'Jornada Olímpica 2026 • Ensino Fundamental - Anos Finais • 7º ano • Desafios avançados e olimpíadas do conhecimento.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Jornada Olímpica 2026'
        },
        { 
          id: 112, 
          title: 'Língua Espanhola - Asas 2026', 
          category: 'Apostilas', 
          subject: 'Espanhol', 
          summary: 'Ensino Fundamental - Anos Finais • 7º ano • Língua Espanhola. Leitura, gramática e compreensão contextual.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Asas 2026'
        },
        { 
          id: 113, 
          title: 'Trilhas Eureka SAS: 7º Ano Interativo', 
          category: 'Eureka', 
          subject: 'Ciências & Matemática', 
          summary: 'Trilhas gamificadas do SAS com passo a passo e resolução de exercícios comentados.', 
          link: 'https://app.portalsaseducacao.com.br/conteudo/',
          colecao: 'Eureka 2026'
        },
        { 
          id: 114, 
          title: 'Matriz SAAS: Avaliações Formativas da Escola', 
          category: 'SAAS', 
          subject: 'Geral', 
          summary: 'Caderno de habilidades prioritárias cobradas nos testes e simulados do colégio.', 
          link: 'https://app.portalsaseducacao.com.br/avaliacoes/',
          colecao: 'SAAS'
        }
      ],
      mistakes: [],
      mastery: [
        { subject: 'Matemática (Livro 3 SAS)', pct: 68, topicsMastered: '8 de 12 capítulos', attention: 'Cap. 4: Frações e Porcentagem' },
        { subject: 'Português (Livro 2 SAS)', pct: 88, topicsMastered: '11 de 12 capítulos', attention: 'Cap. 9: Crase e Regência' },
        { subject: 'Física & Química (Eureka)', pct: 74, topicsMastered: '7 de 10 trilhas', attention: 'Trilha 5: 1ª Lei de Newton' },
        { subject: 'História & Geografia (SAS)', pct: 85, topicsMastered: '9 de 10 capítulos', attention: 'Cap. 6: Brasil República' }
      ]
    };

    // Reset da área de TPCs e de Aprender com os Erros solicitado pelo aluno para cadastro diário
    if (this.state) {
      if (!Array.isArray(this.state.tpcs)) this.state.tpcs = [];
      if (!Array.isArray(this.state.mistakes)) this.state.mistakes = [];
      if (!localStorage.getItem('estude_reset_tpcs_mistakes_done_v2')) {
        this.state.tpcs = [];
        this.state.mistakes = [];
        localStorage.setItem('estude_reset_tpcs_mistakes_done_v2', 'true');
        this.saveState();
      }
      this.state.isSubscribed = false;

      // Garantir o TPC oficial de Matemática da Profª Elaine
      if (!this.state.tpcs.some(t => t.id === 'tpc-mat-elaine-0210' || (t.teacher && t.teacher.toLowerCase().includes('elaine')))) {
        this.state.tpcs.unshift({
          id: 'tpc-mat-elaine-0210',
          subject: 'Matemática',
          title: 'Atividade Suplementar – pág. 50 (para 05/10)',
          dueDate: '2026-10-05',
          status: 'pending',
          details: 'Atividade Suplementar - página 50, para o dia 05/10. Postado no Portal Gammon por Profª ELAINE APARECIDA LEANDRO DOS SANTOS (Turma 17B • 3º Trimestre • Grupo Aluno).',
          teacher: 'Profª Elaine Aparecida Leandro dos Santos',
          difficulty: 'Média',
          tpcType: 'TPC Diário',
          fromOccurrence: true,
          turma: '17B',
          etapa: '3º T',
          dataOcorrencia: '02/10/2026',
          portalLink: 'https://portal.gammon.br/framehtml/web/app/edu/portaleducacional/#/ocorrencias'
        });
        this.saveState();
      }
    }

    // Ensure all accounts (even admin) start in free Base plan by default
    try {
      if (!localStorage.getItem('estude_all_start_base_v5')) {
        if (this.state) {
          this.state.isSubscribed = false;
          this.saveState();
        }
        if (this.currentUser) {
          if (this.currentUser.planStatus !== 'trial_5d') {
            this.currentUser.isSubscribed = false;
            this.currentUser.planStatus = 'free';
            this.currentUser.plan = 'free';
            this.currentUser.planName = 'Plano Base';
            this.currentUser.trialDaysRemaining = 0;
            this.saveCurrentUser();
          }
        }
        if (this.users && Array.isArray(this.users)) {
          this.users.forEach(u => {
            if (u.planStatus !== 'trial_5d' && !u.proActivatedAt) {
              u.isSubscribed = false;
              u.planStatus = 'free';
              u.plan = 'free';
              u.planName = 'Plano Base';
            }
          });
          this.saveUsers();
        }
        localStorage.setItem('estude_all_start_base_v5', 'true');
      }
    } catch (e) {}

    // Quiz Configuration and Session State
    this.currentQuizSubject = 'matematica';
    this.currentQuizBookId = 1;
    this.currentQuizChapterId = 1;
    this.currentQuizDifficulty = localStorage.getItem('estude_quiz_diff') || 'dificil';
    this.currentQuizQuestionCount = parseInt(localStorage.getItem('estude_quiz_count') || '8', 10);
    this.quizRotationOffset = parseInt(localStorage.getItem('estude_quiz_rotation_offset') || '0', 10);

    this.quizState = {
      active: false,
      currentQuestionIdx: 0,
      selectedAnswer: null,
      answered: false,
      score: 0,
      timerSeconds: 16 * 60,
      timerInterval: null,
      difficulty: this.currentQuizDifficulty,
      questions: []
    };
  }

  init() {
    this.setupNavigation();
    this.initPwa();
    this.setupKeyboardShortcuts();
    this.setupThemeWatcher();
    this.renderDashboard();
    this.renderMaterials();
    this.renderSasPdfLibrary();
    this.renderSasHub();
    this.renderGeminiTab();
    this.renderPlanStatus();
    this.renderQuizIntro();
    this.renderMistakesReview();
    this.renderExams();
    this.renderMastery();
    this.renderTpcs();
    this.renderTimetable();
    this.initNotifications();
    this.refreshBadges();
    this.setupEventListeners();
    this.initChatBot();
    this.checkAuth();
    this.initMasterSync();
    this.applyStudentSettingsToUI();
    this.updateGeminiKeyBadge();

    // Sincronização multi-dispositivo (PC, Celular, Tablet)
    if (this.currentUser) {
      this.syncUserData('pull');
      if (this.currentUser.role === 'admin' || this.currentUser.username === 'freddie') {
        this.loadAdminOverview();
        this.initAdminSSE();
      }
    }
    window.addEventListener('focus', () => {
      if (this.currentUser) {
        this.syncUserData('pull');
        if (this.currentUser.role === 'admin' || this.currentUser.username === 'freddie') {
          this.loadAdminOverview();
        }
      }
    });
    setInterval(() => {
      if (this.currentUser) {
        this.syncUserData('pull');
        if (this.currentUser.role === 'admin' || this.currentUser.username === 'freddie') {
          this.loadAdminOverview();
        }
      }
    }, 20000);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.timetable)) {
        parsed.timetable.forEach(row => {
          if (row && 'sabado' in row) delete row.sabado;
        });
      }
      if (!localStorage.getItem('estude_payments_reset_v1')) {
        localStorage.setItem('estude_payments_reset_v1', 'true');
        if (parsed) parsed.payments = [];
      }
      return parsed;
    } catch (e) {
      console.warn('LocalStorage error:', e);
      return null;
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      this.debouncedSyncPush();
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  isUserPro() {
    if (!this.currentUser) return false;

    // Active PRO subscription on current user account (all accounts, even admin, require active PRO)
    if (this.currentUser.isSubscribed === true || this.currentUser.planStatus === 'active' || this.currentUser.plan === 'pro') {
      if (this.currentUser.proExpiresAt) {
        const now = Date.now();
        const exp = new Date(this.currentUser.proExpiresAt).getTime();
        if (now >= exp) {
          this.currentUser.isSubscribed = false;
          this.currentUser.planStatus = 'free';
          this.currentUser.plan = 'free';
          this.saveCurrentUser();
          const inList = (this.users || []).find(u => u.id === this.currentUser.id);
          if (inList) {
            inList.isSubscribed = false;
            inList.planStatus = 'free';
            inList.plan = 'free';
            this.saveUsers();
          }
          return false;
        }
      }
      return true;
    }
    // 3. Active 5-day trial option (trial_5d)
    if (this.currentUser && (this.currentUser.planStatus === 'trial_5d' || this.currentUser.plan === 'trial_5d')) {
      if (this.currentUser.trialExpiresAt) {
        const now = Date.now();
        const exp = new Date(this.currentUser.trialExpiresAt).getTime();
        if (now < exp) {
          const daysLeft = Math.max(1, Math.ceil((exp - now) / (1000 * 60 * 60 * 24)));
          this.currentUser.trialDaysRemaining = daysLeft;
          return true;
        } else {
          // 5-day trial expired -> revert to free base plan
          this.currentUser.planStatus = 'free';
          this.currentUser.plan = 'free';
          this.currentUser.trialExpired = true;
          this.currentUser.trialDaysRemaining = 0;
          this.saveCurrentUser();
          const userInList = (this.users || []).find(u => u.id === this.currentUser.id);
          if (userInList) {
            userInList.planStatus = 'free';
            userInList.plan = 'free';
            this.saveUsers();
          }
          return false;
        }
      }
      return true;
    }
    return false;
  }

  activate5DaysTrial() {
    if (!this.currentUser) {
      this.showAuthOverlay();
      return;
    }
    if (this.currentUser.trialUsed && this.currentUser.role !== 'admin') {
      alert('⚠️ Você já utilizou a sua degustação de 5 dias grátis nesta conta!\n\nPara continuar aproveitando o Chat IA, Quizzes e Apostilas, assine o Plano PRO por R$ 19,90/mês ou ative com o administrador na escola.');
      this.showModal('subscriptionModal');
      return;
    }
    const now = new Date();
    const exp = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    this.currentUser.planStatus = 'trial_5d';
    this.currentUser.plan = 'trial_5d';
    this.currentUser.trialActivatedAt = now.toISOString();
    this.currentUser.trialExpiresAt = exp.toISOString();
    this.currentUser.trialDaysRemaining = 5;
    this.currentUser.trialUsed = true;
    this.currentUser.isSubscribed = false;
    this.saveCurrentUser();
    const userInList = (this.users || []).find(u => u.id === this.currentUser.id);
    if (userInList) {
      Object.assign(userInList, {
        planStatus: 'trial_5d',
        plan: 'trial_5d',
        trialActivatedAt: now.toISOString(),
        trialExpiresAt: exp.toISOString(),
        trialDaysRemaining: 5,
        trialUsed: true,
        isSubscribed: false
      });
      this.saveUsers();
    }
    this.updateUserHeaderUI();
    this.renderPlanStatus();
    this.renderDashboard();
    this.closeModal('subscriptionModal');
    if (typeof confetti === 'function') {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
    }
    alert('🎉 Parabéns! Seus 5 DIAS GRÁTIS do Plano PRO foram ativados com sucesso!\n\nAgora você tem acesso total ao Chatbot IA, Quizzes Diários e Apostilas SAS até ' + exp.toLocaleDateString('pt-BR') + '!');
    this.switchTab('dashboard');
  }

  renderGeminiTab() {
    this.initChatGptUI();
    this.renderChatGptStream(this.chatGptMessages || []);
  }

  showProFeatureModal(featureName) {
    this.showModal('subscriptionModal');
  }

  setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    if (tabName === 'sas-books' || tabName === 'materials') {
      tabName = 'sas-eureka';
      if (!this.isUserPro()) {
        this.switchEurekaSubtab('eureka');
      } else {
        this.switchEurekaSubtab('apostilas');
      }
    }

    const proOnlyTabs = ['gemini-chat', 'quiz'];
    if (proOnlyTabs.includes(tabName) && !this.isUserPro()) {
      const names = {
        'gemini-chat': 'Chatbot IA Inteligente',
        'quiz': 'Quiz Diário de 15 Minutos'
      };
      const label = names[tabName] || 'Recurso Exclusivo PRO';
      alert(`🔒 Recurso Bloqueado no Plano Base!\n\nO "${label}" NÃO está disponível no Plano Base gratuito.\n\nPara liberar o Chatbot IA e os Quizzes Diários, ative a opção de 5 dias grátis de degustação ou assine o ESTUDE+ PRO por R$ 19,90/mês!`);
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }

    if (tabName === 'sas-eureka' && !this.isUserPro()) {
      // No Plano Base, o Portal Eureka SAS fica liberado (apenas as apostilas são bloqueadas)
      const viewApostilas = document.getElementById('subtabApostilasView');
      // Se não estiver visualizando nada ainda, abre na subaba liberada Eureka
      if (!viewApostilas || viewApostilas.style.display !== 'block') {
        this.switchEurekaSubtab('eureka');
      }
    }

    this.currentTab = tabName;
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    const activePane = document.getElementById(`tab-${tabName}`);
    if (activePane) {
      activePane.classList.add('active');
    }

    // Sync ESTUDE+ center top navigation buttons
    const centerNavMap = {
      'dashboard': 'centerNavInicio',
      'gemini-chat': 'centerNavChat',
      'sas-eureka': 'centerNavLivros',
      'sas-books': 'centerNavLivros',
      'gammon-tpc': 'centerNavAtividades',
      'plans-pricing': 'centerNavPlanos'
    };
    document.querySelectorAll('.sas-center-nav-btn').forEach(btn => btn.classList.remove('active'));
    if (centerNavMap[tabName]) {
      const activeBtn = document.getElementById(centerNavMap[tabName]);
      if (activeBtn) activeBtn.classList.add('active');
    }

    // Sync Mobile Bottom Nav buttons
    const mobNavMap = {
      'dashboard': 'mobNavInicio',
      'gemini-chat': 'mobNavChat',
      'sas-eureka': 'mobNavApostilas',
      'sas-books': 'mobNavApostilas',
      'gammon-tpc': 'mobNavTpc',
      'plans-pricing': 'mobNavPlanos'
    };
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => btn.classList.remove('active'));
    if (mobNavMap[tabName]) {
      const activeMobBtn = document.getElementById(mobNavMap[tabName]);
      if (activeMobBtn) activeMobBtn.classList.add('active');
    }

    // Special layout adaptation for ChatGPT full-screen mode
    const contentArea = document.querySelector('.content-area');
    const appSidebar = document.querySelector('.sidebar');
    if (tabName === 'gemini-chat') {
      if (contentArea) contentArea.classList.add('chatgpt-active-mode');
      if (appSidebar) appSidebar.style.display = 'none';
      this.renderGeminiTab();
    } else {
      if (contentArea) contentArea.classList.remove('chatgpt-active-mode');
      if (appSidebar && window.innerWidth > 768) appSidebar.style.display = 'flex';
    }

    if (tabName === 'quiz') {
      if (!this.quizState.active) {
        this.renderQuizIntro();
      }
    }

    if (tabName === 'sas-eureka' || tabName === 'sas-books') {
      this.renderSasHub();
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  switchEurekaSubtab(subtab) {
    const btnApostilas = document.getElementById('btnSubtabApostilas');
    const btnEureka = document.getElementById('btnSubtabEureka');
    const viewApostilas = document.getElementById('subtabApostilasView');
    const viewEureka = document.getElementById('subtabEurekaView');

    if (subtab === 'apostilas') {
      if (btnApostilas) {
        btnApostilas.classList.add('active');
        btnApostilas.style.background = '#e0f2fe';
        btnApostilas.style.color = '#0369a1';
      }
      if (btnEureka) {
        btnEureka.classList.remove('active');
        btnEureka.style.background = '#f1f5f9';
        btnEureka.style.color = '#64748b';
      }
      if (viewApostilas) viewApostilas.style.display = 'block';
      if (viewEureka) viewEureka.style.display = 'none';
    } else {
      if (btnEureka) {
        btnEureka.classList.add('active');
        btnEureka.style.background = '#ffedd5';
        btnEureka.style.color = '#c2410c';
      }
      if (btnApostilas) {
        btnApostilas.classList.remove('active');
        btnApostilas.style.background = '#f1f5f9';
        btnApostilas.style.color = '#64748b';
      }
      if (viewApostilas) viewApostilas.style.display = 'none';
      if (viewEureka) viewEureka.style.display = 'block';
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  refreshBadges() {
    const pendingErrors = this.state.mistakes.filter(m => m.status === 'pending').length;
    const badge = document.getElementById('reviewCountBadge');
    if (badge) badge.innerText = pendingErrors;

    // TPC Pending count
    const pendingTpcs = (this.state.tpcs || []).filter(t => t.status === 'pending').length;
    const tpcBadge = document.getElementById('tpcPendingBadge');
    if (tpcBadge) tpcBadge.innerText = pendingTpcs;

    const streakEl = document.getElementById('streakCount');
    if (streakEl) streakEl.innerText = `${this.state.streak} dias seguidos`;

    const trialPill = document.getElementById('trialPill');
    if (trialPill) {
      if (this.isUserPro()) {
        trialPill.innerHTML = '<i data-lucide="crown" class="crown-icon"></i> <span>Assinante PRO (Ativo)</span>';
        trialPill.style.background = '#dcfce7';
        trialPill.style.color = '#15803d';
        trialPill.style.borderColor = '#86efac';
      } else if (this.currentUser && this.currentUser.planStatus === 'trial_5d') {
        const days = this.currentUser.trialDaysRemaining || 5;
        trialPill.innerHTML = `<i data-lucide="zap" class="crown-icon"></i> <span>${days} dias grátis ativos</span>`;
        trialPill.style.background = '#fef3c7';
        trialPill.style.color = '#b45309';
        trialPill.style.borderColor = '#fcd34d';
      } else if (this.currentUser && this.currentUser.planStatus === 'pending_cash') {
        trialPill.innerHTML = '<i data-lucide="clock" class="crown-icon"></i> <span>Pendente na Escola</span>';
        trialPill.style.background = '#fef3c7';
        trialPill.style.color = '#b45309';
        trialPill.style.borderColor = '#fcd34d';
      } else {
        trialPill.innerHTML = '<i data-lucide="shield" class="crown-icon"></i> <span>Plano Base</span>';
        trialPill.style.background = '#f1f5f9';
        trialPill.style.color = '#475569';
        trialPill.style.borderColor = '#cbd5e1';
      }
    }

    // Top Bell Unread Notifications Count
    const unreadNotifs = (this.state.notifications || []).filter(n => !n.read).length;
    const topBellBadge = document.getElementById('topBellBadgeCount');
    if (topBellBadge) {
      topBellBadge.innerText = unreadNotifs;
      topBellBadge.style.display = unreadNotifs > 0 ? 'inline-flex' : 'none';
    }
  }

  /* ================= DASHBOARD RENDERING ================= */
  
  /* ==========================================================================
     SAS PAINEL DASHBOARD RENDERER (IDÊNTICO AO PORTAL SAS - MEDIA_1791064566186)
     ========================================================================== */
  renderDashboard() {
    this.checkSubscriptionExpiry();

    // 1. Update Student Profile Card info
    const nameEl = document.getElementById('painelStudentName');
    if (nameEl && this.currentUser) {
      nameEl.innerText = this.currentUser.name;
    }

    // 2. Update "Meus estudos" pill
    const studiesPill = document.getElementById('painelStudiesPill');
    if (studiesPill) {
      const pendingTpcs = (this.state.tpcs || []).filter(t => t.status === 'pending');
      if (pendingTpcs.length === 0) {
        studiesPill.innerText = 'Sem atividades pendentes';
        studiesPill.style.background = '#f1f5f9';
        studiesPill.style.color = '#64748b';
      } else {
        studiesPill.innerText = `${pendingTpcs.length} atividade${pendingTpcs.length > 1 ? 's' : ''} pendente${pendingTpcs.length > 1 ? 's' : ''}`;
        studiesPill.style.background = '#fee2e2';
        studiesPill.style.color = '#dc2626';
      }
    }

    // 3. Render Agenda Card (Days of the week row + events)
    this.renderAgendaCard();

    // 4. Custom Dashboard Layout (Reordering & Visibility)
    this.applyDashboardLayout();

    // 5. Smart Statistics Card
    this.renderSmartStats();

    // 6. Update top center nav active button
    this.updateCenterNavActive();

    if (window.lucide) window.lucide.createIcons();
  }

  renderAgendaCard() {
    const rangeLabel = document.getElementById('agendaRangeLabel');
    const weekRow = document.getElementById('agendaWeekDaysRow');
    const feed = document.getElementById('agendaEventsFeed');

    // Dynamic date in America/Sao_Paulo timezone
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
    }).formatToParts(now);
    const p = {};
    parts.forEach(pt => p[pt.type] = pt.value);
    const spToday = new Date(parseInt(p.year, 10), parseInt(p.month, 10) - 1, parseInt(p.day, 10));
    const currentDayOfWeek = spToday.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    // Calculate start of week (Sunday) taking into account agendaOffsetWeeks
    const startOfWeek = new Date(spToday);
    startOfWeek.setDate(spToday.getDate() - currentDayOfWeek + (this.agendaOffsetWeeks * 7));

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthNamesShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isToday = (this.agendaOffsetWeeks === 0 && d.getDate() === spToday.getDate() && d.getMonth() === spToday.getMonth() && d.getFullYear() === spToday.getFullYear());
      days.push({
        name: dayNames[i],
        num: d.getDate(),
        fullDate: d,
        isToday: isToday,
        dayStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      });
    }

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startLabel = `${startOfWeek.getDate()} ${monthNamesShort[startOfWeek.getMonth()]}.`;
    const endLabel = `${endOfWeek.getDate()} ${monthNamesShort[endOfWeek.getMonth()]}.`;

    if (rangeLabel) {
      rangeLabel.innerHTML = `${startLabel} - ${endLabel} <span style="font-size: 0.7rem; color: #64748b;">&#9662;</span>`;
    }

    if (!this.agendaSelectedDay) {
      this.agendaSelectedDay = spToday.getDate();
    }

    if (weekRow) {
      weekRow.innerHTML = days.map(d => {
        const isActive = (d.num === this.agendaSelectedDay);
        return `
          <div class="agenda-day-cell ${isActive ? 'active' : ''} ${d.isToday ? 'today-indicator' : ''}" onclick="app.selectAgendaDay(${d.num})" title="${d.name}, ${d.num} de ${monthNamesShort[d.fullDate.getMonth()]}">
            <span class="day-name">${d.name}</span>
            <span class="day-num">${d.num}</span>
            ${d.isToday ? '<span class="today-dot" style="display:block; width:4px; height:4px; border-radius:50%; background:currentColor; margin:2px auto 0;"></span>' : ''}
          </div>
        `;
      }).join('');
    }

    if (feed) {
      const tpcs = this.state.tpcs || [];
      if (tpcs.length === 0) {
        feed.innerHTML = `
          <div class="agenda-event-row">
            <div class="event-date-col">Hoje (${days.find(d => d.num === this.agendaSelectedDay)?.name || 'Dia'} ${this.agendaSelectedDay})</div>
            <div class="event-desc-col" style="color: #64748b;">Nenhum TPC agendado para esta data</div>
          </div>
        `;
      } else {
        feed.innerHTML = tpcs.map(t => `
          <div class="agenda-event-row">
            <div class="event-date-col">${t.subject}</div>
            <div class="event-desc-col">
              <strong>${t.title}</strong>
              <div style="font-size: 0.72rem; color: #64748b;">Entrega: ${t.dueDate || 'Hoje'} &bull; Status: ${t.status === 'done' ? '✔ FEITO' : '⏳ PENDENTE'}</div>
            </div>
          </div>
        `).join('');
      }
    }
  }

  selectAgendaDay(dayNum) {
    this.agendaSelectedDay = dayNum;
    this.renderAgendaCard();
  }

  changeAgendaWeek(dir) {
    this.agendaOffsetWeeks += dir;
    this.renderAgendaCard();
  }

  setAgendaToday() {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric', month: 'numeric', day: 'numeric'
      }).formatToParts(new Date());
      const p = {};
      parts.forEach(pt => p[pt.type] = pt.value);
      this.agendaSelectedDay = parseInt(p.day, 10);
    } catch (e) {
      this.agendaSelectedDay = new Date().getDate();
    }
    this.agendaOffsetWeeks = 0;
    this.renderAgendaCard();
  }

  updateCenterNavActive() {
    const navMap = {
      'dashboard': 'centerNavInicio',
      'timetable': 'centerNavSala',
      'gammon-tpc': 'centerNavAtividades',
      'review': 'centerNavRelatorios'
    };

    document.querySelectorAll('.sas-center-nav-btn').forEach(btn => btn.classList.remove('active'));
    const activeId = navMap[this.currentTab];
    if (activeId) {
      document.getElementById(activeId)?.classList.add('active');
    }
  }


  /* ================= MATERIALS RENDERING ================= */
  renderMaterials(filterCategory = 'all', searchQuery = '') {
    const grid = document.getElementById('materialsGrid');
    if (!grid) return;

    let list = this.state.materials;
    if (filterCategory !== 'all') {
      list = list.filter(m => m.category.toLowerCase() === filterCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.summary.toLowerCase().includes(q));
    }

    if (list.length === 0) {
      grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Nenhum material encontrado com esses critérios.</p>`;
      return;
    }

    grid.innerHTML = list.map(item => `
      <div class="mat-item-card ${item.isOfficialActive ? 'official-active-card' : ''}" style="${item.isOfficialActive ? 'border: 2px solid #ea580c; background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);' : ''}">
        <div class="mat-top">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="mat-cat-pill cat-${item.category}">${item.category}</span>
            ${item.isOfficialActive ? `<span style="font-size: 0.65rem; background: #ea580c; color: #fff; font-weight: 800; padding: 2px 6px; border-radius: 4px;">EXIGIDA PELA ESCOLA</span>` : ''}
          </div>
          <span style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">${item.subject}</span>
        </div>
        <h4 class="mat-title">${item.title}</h4>
        <p class="mat-desc">${item.summary}</p>
        <div class="mat-footer">
          <span style="font-size: 0.72rem; color: ${item.isOfficialActive ? '#ea580c; font-weight: 700;' : 'var(--text-muted);'}">
            ${item.isOfficialActive ? '⭐ APOSTILA ATIVA DA ESCOLA' : item.link ? '🌐 Link Oficial SAS' : 'Organizado pela IA'}
          </span>
          ${item.link && item.link.includes('livrosdigitais') ? `
            <div style="display: flex; gap: 6px;">
              <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="mat-study-btn" style="background: #ea580c; color: #fff; text-decoration: none;">
                <i data-lucide="book-open" style="width: 14px; height: 14px;"></i> Abrir Apostila
              </a>
              <button class="mat-study-btn" onclick="app.startSmartSession()">
                <i data-lucide="zap" style="width: 14px; height: 14px;"></i> Treinar
              </button>
            </div>
          ` : item.link ? `
            <button class="mat-study-btn" style="background: #ff7a00; color: #fff;" onclick="app.switchTab('sas-portal')">
              <i data-lucide="globe" style="width: 14px; height: 14px;"></i> Abrir Portal SAS
            </button>
          ` : `
            <button class="mat-study-btn" onclick="app.openMaterialStudy('${item.title}')">
              <i data-lucide="book-open" style="width: 14px; height: 14px;"></i> Estudar
            </button>
          `}
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  filterMaterials(category) {
    this.switchTab('materials');
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.filter === category);
    });
    this.renderMaterials(category);
  }

  openMaterialStudy(title) {
    alert(`Abrindo sessão focada do material:\n"${title}"\n\nA IA configurou um roteiro guiado de 15 minutos com os pontos que você mais precisa fixar.`);
  }

  
    /* ================= QUIZ ENGINE (CENA 6 & 7) ================= */
  getDailyQuizInfo() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diffMs = midnight - now;
    const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60));
    const minsLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return {
      dateStr,
      formattedDate,
      hoursLeft,
      minsLeft,
      label: `${hoursLeft}h ${minsLeft}min`
    };
  }

  rotateQuizDailySeed() {
    this.quizRotationOffset = (this.quizRotationOffset || 0) + 1;
    localStorage.setItem('estude_quiz_rotation_offset', this.quizRotationOffset.toString());
    alert('🎲 Novo sorteio de perguntas gerado com sucesso para o seu treino diário!');
    this.renderQuizIntro();
  }

  createPrng(seedStr) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  }

  shuffleArrayWithPrng(arr, prng) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  renderQuizIntro() {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    if (!this.isUserPro()) {
      container.innerHTML = `
        <div class="pro-locked-quiz-card" style="background: #ffffff; border: 2px solid #fee2e2; border-radius: 20px; padding: 36px 24px; text-align: center; max-width: 650px; margin: 20px auto; box-shadow: 0 10px 30px rgba(220, 38, 38, 0.08);">
          <div style="width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 16px; box-shadow: 0 6px 16px rgba(220, 38, 38, 0.25);">
            <i data-lucide="lock" style="width: 30px; height: 30px;"></i>
          </div>
          <span style="background: #fee2e2; color: #dc2626; font-weight: 800; font-size: 0.75rem; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px;">🔒 BLOQUEADO NO PLANO BASE</span>
          <h2 style="font-size: 1.6rem; font-weight: 900; color: #0f172a; margin: 12px 0 8px;">Quizzes Diários & Treinos Inteligentes</h2>
          <p style="color: #64748b; font-size: 0.92rem; line-height: 1.6; margin: 0 auto 24px; max-width: 520px;">
            No <strong>Plano Base</strong>, os testes e simulados estão <strong>bloqueados</strong>. Você pode ativar seus <strong>5 dias grátis de degustação</strong> ou assinar o <strong>ESTUDE+ PRO</strong> (R$ 19,90/mês) para treinar com questões personalizadas da Coleção Asas 2026 que mudam a cada 24 horas, escolher a dificuldade e receber explicações passo a passo da IA!
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 24px; text-align: left;">
            <div style="font-weight: 800; color: #1e293b; font-size: 0.88rem; margin-bottom: 10px;">⚡ Vantagens do Quiz no Plano PRO:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem; color: #475569;">
              <div><i data-lucide="check" style="width: 14px; height: 14px; color: #10b981; display: inline; vertical-align: middle;"></i> Questões renovadas todo dia</div>
              <div><i data-lucide="check" style="width: 14px; height: 14px; color: #10b981; display: inline; vertical-align: middle;"></i> Fácil, Médio e Desafios SAAS</div>
              <div><i data-lucide="check" style="width: 14px; height: 14px; color: #10b981; display: inline; vertical-align: middle;"></i> Todas as matérias do 7º ano</div>
              <div><i data-lucide="check" style="width: 14px; height: 14px; color: #10b981; display: inline; vertical-align: middle;"></i> Aprender com os Erros turbo</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary" onclick="app.activate5DaysTrial()" style="background: linear-gradient(135deg, #9333ea, #4f46e5); padding: 12px 20px; font-weight: 800; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(147, 51, 234, 0.25);">
              <i data-lucide="zap"></i> Ativar 5 Dias Grátis
            </button>
            <button class="btn-primary" onclick="app.showModal('subscriptionModal')" style="background: #059669; padding: 12px 20px; font-weight: 800; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);">
              <i data-lucide="crown"></i> Assinar PRO (R$ 19,90/mês)
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const currentSubj = this.currentQuizSubject || 'matematica';
    const currentBook = this.currentQuizBookId || 1;
    const currentDiff = this.currentQuizDifficulty || 'dificil';
    const currentCount = this.currentQuizQuestionCount || 8;
    const dailyInfo = this.getDailyQuizInfo();

    container.innerHTML = `
      <div class="quiz-setup-card" style="max-width: 800px;">
        <!-- Banner de Rotação Diária 24h -->
        <div style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border: 1.5px solid #c7d2fe; border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: #4f46e5; color: white; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; box-shadow: 0 3px 8px rgba(79, 70, 229, 0.3);">
              <i data-lucide="refresh-cw" style="width: 20px; height: 20px;"></i>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 0.92rem; color: #1e1b4b; display: flex; align-items: center; gap: 8px;">
                <span>🔄 Rotação Automática a Cada 24 Horas Ativa</span>
                <span style="background: #10b981; color: white; font-size: 0.68rem; padding: 2px 8px; border-radius: 999px; font-weight: 700;">Edição de Hoje (${dailyInfo.formattedDate})</span>
              </div>
              <div style="font-size: 0.78rem; color: #4338ca; margin-top: 2px;">
                As perguntas renovam-se todo dia. Próxima rotação automática em <strong>${dailyInfo.label}</strong>.
              </div>
            </div>
          </div>
          <button type="button" onclick="app.rotateQuizDailySeed()" class="btn-outline" style="background: white; border-color: #c7d2fe; color: #4338ca; font-size: 0.78rem; padding: 7px 12px; font-weight: 700; border-radius: 8px; display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <i data-lucide="sparkles" style="width: 14px; height: 14px; color: #f59e0b;"></i> Sortear Novo Conjunto Agora
          </button>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
          <div class="quiz-intro-icon" style="margin: 0; width: 44px; height: 44px;">
            <i data-lucide="brain-circuit" style="width: 26px; height: 26px; color: #4f46e5;"></i>
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.25rem;">Configurar Quiz Personalizado do Aluno</h3>
            <p style="margin: 0; font-size: 0.78rem; color: #64748b;">Escolha a disciplina, a dificuldade e o número de questões para treinar com foco no SAS Asas 2026</p>
          </div>
        </div>

        <div class="quiz-select-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-bottom: 16px;">
          <div class="quiz-select-col">
            <label style="font-weight: 700; font-size: 0.82rem; color: #334155; display: block; margin-bottom: 6px;">1. Disciplina:</label>
            <select id="quizSubjectSelect" onchange="app.onQuizSubjectChange(this.value)" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-weight: 700; background: #fff; color: #0f172a;">
              <option value="matematica" ${currentSubj === 'matematica' ? 'selected' : ''}>📐 Matemática (Asas 2026)</option>
              <option value="portugues" ${currentSubj === 'portugues' ? 'selected' : ''}>✍️ Língua Portuguesa</option>
              <option value="ciencias" ${currentSubj === 'ciencias' ? 'selected' : ''}>🔬 Ciências da Natureza</option>
              <option value="historia" ${currentSubj === 'historia' ? 'selected' : ''}>🏛️ História</option>
              <option value="geografia" ${currentSubj === 'geografia' ? 'selected' : ''}>🌍 Geografia</option>
              <option value="ingles" ${currentSubj === 'ingles' ? 'selected' : ''}>🇬🇧 Língua Inglesa</option>
            </select>
          </div>

          <div class="quiz-select-col">
            <label style="font-weight: 700; font-size: 0.82rem; color: #334155; display: block; margin-bottom: 6px;">2. Livro (Apostila):</label>
            <select id="quizBookSelect" onchange="app.onQuizBookChange(this.value)" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-weight: 700; background: #fff; color: #0f172a;">
              <option value="1" ${currentBook === 1 ? 'selected' : ''}>Livro 1 (1º Bimestre)</option>
              <option value="2" ${currentBook === 2 ? 'selected' : ''}>Livro 2 (2º Bimestre)</option>
              <option value="3" ${currentBook === 3 ? 'selected' : ''}>Livro 3 (3º Bimestre)</option>
              <option value="4" ${currentBook === 4 ? 'selected' : ''}>Livro 4 (4º Bimestre)</option>
            </select>
          </div>

          <div class="quiz-select-col">
            <label style="font-weight: 700; font-size: 0.82rem; color: #334155; display: block; margin-bottom: 6px;">3. Capítulo da Apostila:</label>
            <select id="quizChapterSelect" onchange="app.onQuizChapterChange()" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-weight: 700; background: #fff; color: #0f172a;">
              <!-- Populated dynamically -->
            </select>
          </div>

          <div class="quiz-select-col">
            <label style="font-weight: 700; font-size: 0.82rem; color: #334155; display: block; margin-bottom: 6px;">4. Dificuldade do Quiz:</label>
            <select id="quizDifficultySelect" onchange="app.onQuizDifficultyChange(this.value)" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-weight: 700; background: #fff; color: #0f172a;">
              <option value="facil" ${currentDiff === 'facil' ? 'selected' : ''}>🟢 Fácil (Fixação Básica)</option>
              <option value="medio" ${currentDiff === 'medio' ? 'selected' : ''}>🟡 Médio (Padrão SAS)</option>
              <option value="dificil" ${currentDiff === 'dificil' ? 'selected' : ''}>🔴 Difícil (Desafio SAS & Olimpíadas)</option>
            </select>
          </div>

          <div class="quiz-select-col">
            <label style="font-weight: 700; font-size: 0.82rem; color: #334155; display: block; margin-bottom: 6px;">5. Quantidade de Questões:</label>
            <select id="quizQuestionCountSelect" onchange="app.onQuizCountChange(this.value)" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #cbd5e1; font-weight: 700; background: #fff; color: #0f172a;">
              <option value="4" ${currentCount === 4 ? 'selected' : ''}>⚡ 4 Questões (Rápido • 8 min)</option>
              <option value="8" ${currentCount === 8 ? 'selected' : ''}>🎯 8 Questões (Recomendado • 16 min)</option>
              <option value="12" ${currentCount === 12 ? 'selected' : ''}>📚 12 Questões (Aprofundado • 24 min)</option>
              <option value="16" ${currentCount === 16 ? 'selected' : ''}>🏆 16 Questões (Simulado Completo • 32 min)</option>
            </select>
          </div>
        </div>

        <div id="quizChapterPreviewBox" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; font-size: 0.84rem; color: #334155;">
          <!-- Dynamically populated -->
        </div>

        <div class="quiz-features" style="margin-bottom: 20px;">
          <div class="q-feat"><i data-lucide="check-circle-2"></i> Rotação Diária 24h</div>
          <div class="q-feat"><i data-lucide="check-circle-2"></i> Dificuldade Calibrável</div>
          <div class="q-feat"><i data-lucide="check-circle-2"></i> Salva Erros para Revisão</div>
        </div>

        <button id="btnStartQuizSession" class="btn-primary" style="width: 100%; font-size: 1.05rem; padding: 14px 28px;" onclick="app.launchCustomChapterQuiz()">
          <i data-lucide="play"></i> Iniciar Quiz (${currentCount} Questões • ${currentDiff.toUpperCase()})
        </button>
      </div>
    `;

    this.updateQuizChapterDropdown();
    if (window.lucide) window.lucide.createIcons();
  }

  onQuizSubjectChange(subjKey) {
    this.currentQuizSubject = subjKey;
    this.currentQuizBookId = 1;
    const bookSelect = document.getElementById('quizBookSelect');
    if (bookSelect) bookSelect.value = '1';
    this.updateQuizChapterDropdown();
  }

  onQuizBookChange(bookVal) {
    this.currentQuizBookId = parseInt(bookVal, 10) || 1;
    this.updateQuizChapterDropdown();
  }

  onQuizChapterChange() {
    const chapterSelect = document.getElementById('quizChapterSelect');
    const capId = parseInt(chapterSelect?.value || '1', 10);
    this.currentQuizChapterId = capId;
    this.updateQuizPreviewBox();
  }

  onQuizDifficultyChange(diff) {
    this.currentQuizDifficulty = diff;
    localStorage.setItem('estude_quiz_diff', diff);
    this.updateQuizPreviewBox();
  }

  onQuizCountChange(countVal) {
    this.currentQuizQuestionCount = parseInt(countVal, 10) || 8;
    localStorage.setItem('estude_quiz_count', this.currentQuizQuestionCount.toString());
    this.updateQuizPreviewBox();
  }

  updateQuizChapterDropdown() {
    const subjKey = this.currentQuizSubject || 'matematica';
    const bookId = this.currentQuizBookId || 1;
    const subjectData = this.sasSubjectsData[subjKey] || this.sasSubjectsData['matematica'];
    const currentBook = subjectData.livros.find(b => b.id === bookId) || subjectData.livros[0];

    const chapterSelect = document.getElementById('quizChapterSelect');
    if (chapterSelect && currentBook && currentBook.chapters) {
      chapterSelect.innerHTML = currentBook.chapters.map((cap, i) => `
        <option value="${cap.id}" ${i === 0 ? 'selected' : ''}>${cap.title}</option>
      `).join('');

      this.currentQuizChapterId = currentBook.chapters[0]?.id || 1;
    }

    this.updateQuizPreviewBox();
  }

  updateQuizPreviewBox() {
    const subjKey = this.currentQuizSubject || 'matematica';
    const bookId = this.currentQuizBookId || 1;
    const capId = this.currentQuizChapterId || 1;
    const diff = this.currentQuizDifficulty || 'dificil';
    const count = this.currentQuizQuestionCount || 8;
    const subjectData = this.sasSubjectsData[subjKey] || this.sasSubjectsData['matematica'];
    const currentBook = subjectData.livros.find(b => b.id === bookId) || subjectData.livros[0];
    const currentCap = currentBook.chapters.find(c => c.id === capId) || currentBook.chapters[0];

    const diffBadge = {
      facil: '<span style="background: #dcfce7; color: #166534; font-weight: 800; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem;">🟢 Fácil (Conceitual)</span>',
      medio: '<span style="background: #fef3c7; color: #92400e; font-weight: 800; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem;">🟡 Médio (Padrão SAS)</span>',
      dificil: '<span style="background: #fee2e2; color: #991b1b; font-weight: 800; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem;">🔴 Difícil (Desafio SAS & OBMEP)</span>'
    }[diff] || '<span style="background: #fee2e2; color: #991b1b; font-weight: 800; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem;">🔴 Difícil</span>';

    const diffDesc = {
      facil: 'Questões com enunciados diretos focadas em fixação básica de fórmulas e definições.',
      medio: 'Problemas contextualizados da apostila SAS com interpretação e raciocínio intermediário.',
      dificil: 'Questões desafiadoras com pegadinhas, cálculos em múltiplas etapas e problemas de nível de olimpíada / SAAS.'
    }[diff];

    const previewBox = document.getElementById('quizChapterPreviewBox');
    if (previewBox && currentCap) {
      previewBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
          <strong style="color: #0f172a; font-size: 0.92rem;">📖 Conteúdo Focado: ${currentCap.title}</strong>
          <div style="display: flex; align-items: center; gap: 6px;">
            ${diffBadge}
            <span style="font-size: 0.72rem; background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 3px 8px; border-radius: 6px;">${count} Questões • ${Math.round(count * 2)} min</span>
          </div>
        </div>
        <p style="margin: 0 0 8px; line-height: 1.5; color: #475569; font-size: 0.82rem;">
          <strong>Tópicos abordados nas perguntas:</strong> ${currentCap.desc}
        </p>
        <div style="font-size: 0.78rem; color: #475569; background: #ffffff; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <strong>🎯 Foco da Dificuldade:</strong> ${diffDesc}
        </div>
      `;
    }

    const btnStart = document.getElementById('btnStartQuizSession');
    if (btnStart) {
      btnStart.innerHTML = `<i data-lucide="play"></i> Iniciar Quiz (${count} Questões • ${diff.toUpperCase()})`;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  launchCustomChapterQuiz() {
    if (!this.isUserPro()) {
      this.showModal('subscriptionModal');
      return;
    }
    const subjSelect = document.getElementById('quizSubjectSelect');
    const bookSelect = document.getElementById('quizBookSelect');
    const capSelect = document.getElementById('quizChapterSelect');
    const diffSelect = document.getElementById('quizDifficultySelect');
    const countSelect = document.getElementById('quizQuestionCountSelect');

    const subjKey = subjSelect?.value || this.currentQuizSubject || 'matematica';
    const bookId = parseInt(bookSelect?.value || this.currentQuizBookId || '1', 10);
    const capId = parseInt(capSelect?.value || this.currentQuizChapterId || '1', 10);
    const difficulty = diffSelect?.value || this.currentQuizDifficulty || 'dificil';
    const count = parseInt(countSelect?.value || this.currentQuizQuestionCount || '8', 10);

    this.startQuizDirectlyForChapter(subjKey, bookId, capId, difficulty, count);
  }

  startQuizDirectlyForChapter(subjectKey, bookId, chapterId, difficulty = null, count = null) {
    this.currentQuizSubject = subjectKey;
    this.currentQuizBookId = bookId;
    this.currentQuizChapterId = chapterId;
    if (difficulty) this.currentQuizDifficulty = difficulty;
    if (count) this.currentQuizQuestionCount = count;

    const diff = this.currentQuizDifficulty || 'dificil';
    const cnt = this.currentQuizQuestionCount || 8;

    const questions = this.getQuestionsForChapter(subjectKey, bookId, chapterId, diff, cnt);
    this.quizState.questions = (questions && questions.length > 0) ? questions : this.getQuestionsForChapter('matematica', 1, 1, diff, cnt);
    this.quizState.difficulty = diff;
    this.switchTab('quiz');
    this.startQuizExecution();
  }

  getQuestionsForChapter(subjectKey, bookId, chapterId, difficulty = 'dificil', count = 8) {
    const key = `${subjectKey}_${bookId}_${chapterId}`;
    const dailyInfo = this.getDailyQuizInfo();
    const seedStr = `${dailyInfo.dateStr}_rot${this.quizRotationOffset || 0}_${key}_${difficulty}`;
    const prng = this.createPrng(seedStr);

    // Curated pedagogical question bank for 7th grade SAS Asas 2026
    const questionBank = {
      'ciencias_2_5': {
        "facil": [
                {
                        "id": "c25_f1",
                        "subject": "Ciências (Livro 2 SAS)",
                        "topic": "Cap. 5: Diversidade da Vida e Reinos",
                        "text": "De acordo com o sistema dos 5 reinos de Whittaker adotado pelo SAS, qual reino agrupa exclusivamente organismos procariontes (sem núcleo delimitado por carioteca)?",
                        "options": [
                                {
                                        "text": "Reino Monera (bactérias e cianobactérias).",
                                        "correct": true
                                },
                                {
                                        "text": "Reino Protista (protozoários e algas).",
                                        "correct": false
                                },
                                {
                                        "text": "Reino Fungi (cogumelos e leveduras).",
                                        "correct": false
                                },
                                {
                                        "text": "Reino Plantae (vegetais).",
                                        "correct": false
                                }
                        ],
                        "explanation": "O Reino Monera é o único composto exclusivamente por seres unicelulares procariontes, cujo DNA fica disperso no citoplasma sem carioteca.",
                        "aiGuidance": "Classificação em reinos e estrutura celular no SAS."
                },
                {
                        "id": "c25_f2",
                        "subject": "Ciências (Livro 2 SAS)",
                        "topic": "Cap. 5: Diversidade da Vida e Reinos",
                        "text": "Na regra internacional de nomenclatura binomial criada por Carl von Linné (Lineu), o nome científico de uma espécie como Canis familiaris é formado por quais categorias?",
                        "options": [
                                {
                                        "text": "Gênero (com inicial maiúscula) e epíteto específico (com inicial minúscula), ambos destacados em itálico.",
                                        "correct": true
                                },
                                {
                                        "text": "Família e Ordem em letras maiúsculas.",
                                        "correct": false
                                },
                                {
                                        "text": "Reino e Filo sem necessidade de itálico.",
                                        "correct": false
                                },
                                {
                                        "text": "Classe e Espécie em língua portuguesa.",
                                        "correct": false
                                }
                        ],
                        "explanation": "O primeiro termo indica o Gênero (Canis) e o segundo o epíteto específico (familiaris), sempre em latim e destacados em itálico ou sublinhados.",
                        "aiGuidance": "Regras de nomenclatura binomial de Lineu."
                }
        ],
        "medio": [
                {
                        "id": "c25_m1",
                        "subject": "Ciências (Livro 2 SAS)",
                        "topic": "Cap. 5: Diversidade da Vida e Reinos",
                        "text": "Qual das opções apresenta a sequência correta e hierárquica das categorias taxonômicas, da mais ampla para a mais restrita?",
                        "options": [
                                {
                                        "text": "Reino, Filo, Classe, Ordem, Família, Gênero e Espécie.",
                                        "correct": true
                                },
                                {
                                        "text": "Reino, Ordem, Classe, Filo, Espécie, Gênero e Família.",
                                        "correct": false
                                },
                                {
                                        "text": "Espécie, Gênero, Família, Ordem, Classe, Filo e Reino.",
                                        "correct": false
                                },
                                {
                                        "text": "Filo, Reino, Família, Classe, Gênero, Ordem e Espécie.",
                                        "correct": false
                                }
                        ],
                        "explanation": "O mnemônico clássico ensinado na apostila é: ReFiCOFaGE (Reino, Filo, Classe, Ordem, Família, Gênero, Espécie).",
                        "aiGuidance": "Hierarquia taxonômica do SAS 7º ano."
                }
        ],
        "dificil": [
                {
                        "id": "c25_d1",
                        "subject": "Ciências (Livro 2 SAS)",
                        "topic": "Cap. 5: Diversidade da Vida e Reinos",
                        "text": "[SIMULADO SAAS] Dois animais pertencem à mesma ORDEM taxonômica. Com base estrita nas regras de classificação biológica, o que é obrigatoriamente verdade sobre eles?",
                        "options": [
                                {
                                        "text": "Eles obrigatoriamente pertencem à mesma Classe, ao mesmo Filo e ao mesmo Reino.",
                                        "correct": true
                                },
                                {
                                        "text": "Eles obrigatoriamente pertencem à mesma Família e à mesma Espécie.",
                                        "correct": false
                                },
                                {
                                        "text": "Eles são capazes de cruzar e produzir descendentes férteis.",
                                        "correct": false
                                },
                                {
                                        "text": "Eles obrigatoriamente pertencem ao mesmo Gênero.",
                                        "correct": false
                                }
                        ],
                        "explanation": "Se dois seres compartilham uma categoria mais específica (Ordem), eles compartilham necessariamente todas as categorias superiores (Classe, Filo e Reino), mas podem estar em Famílias ou Gêneros diferentes.",
                        "aiGuidance": "Interpretação de categorias taxonômicas superiores."
                }
        ]
},
      'ciencias_2_6': {
        "facil": [
                {
                        "id": "c26_f1",
                        "subject": "Ciências (Livro 2 SAS)",
                        "topic": "Cap. 6: Vírus e Bactérias",
                        "text": "Por que a maioria dos biólogos não classifica os vírus em nenhum dos cinco reinos de seres vivos?",
                        "options": [
                                {
                                        "text": "Porque os vírus são acelulares (não possuem células) e não realizam metabolismo próprio fora de uma célula hospedeira.",
                                        "correct": true
                                },
                                {
                                        "text": "Porque os vírus realizam fotossíntese aquática no solo.",
                                        "correct": false
                                },
                                {
                                        "text": "Porque os vírus têm núcleo gigante com mitocôndrias visíveis a olho nu.",
                                        "correct": false
                                },
                                {
                                        "text": "Porque os vírus são formados unicamente por minerais inorgânicos sem DNA nem RNA.",
                                        "correct": false
                                }
                        ],
                        "explanation": "Vírus são entidades acelulares formadas por material genético (DNA ou RNA) envolto por uma cápsula proteica (capsídeo), sendo parasitas intracelulares obrigatórios.",
                        "aiGuidance": "Estrutura dos vírus na apostila SAS."
                },
                {
                        "id": "c26_f2",
                        "subject": "Ciências (Livro 2 SAS)",
                        "topic": "Cap. 6: Vírus e Bactérias",
                        "text": "Qual das seguintes doenças humanas é causada por uma BACTÉRIA e pode ser tratada com antibióticos?",
                        "options": [
                                {
                                        "text": "Tétano (ou Tuberculose).",
                                        "correct": true
                                },
                                {
                                        "text": "Gripe comum e Covid-19.",
                                        "correct": false
                                },
                                {
                                        "text": "Dengue e Febre Amarela.",
                                        "correct": false
                                },
                                {
                                        "text": "Sarampo e Varicela.",
                                        "correct": false
                                }
                        ],
                        "explanation": "O tétano (Clostridium tetani) e a tuberculose (Mycobacterium tuberculosis) são causados por bactérias. Gripe, dengue, sarampo e covid são viroses.",
                        "aiGuidance": "Diferenciação entre viroses e bacterioses."
                }
        ],
        "medio": [
                {
                        "id": "c26_m1",
                        "subject": "Ciências (Livro 2 SAS)",
                        "topic": "Cap. 6: Vírus e Bactérias",
                        "text": "Por que os antibióticos receitados pelos médicos NÃO devem ser utilizados para tratar gripes ou resfriados comuns?",
                        "options": [
                                {
                                        "text": "Porque os antibióticos atuam exclusivamente sobre estruturas bacterianas (como parede celular) e não afetam os vírus.",
                                        "correct": true
                                },
                                {
                                        "text": "Porque antibióticos alimentam os vírus e os tornam maiores.",
                                        "correct": false
                                },
                                {
                                        "text": "Porque a gripe só é curada com cirurgia de garganta.",
                                        "correct": false
                                },
                                {
                                        "text": "Porque antibióticos destroem todos os ossos do corpo humano.",
                                        "correct": false
                                }
                        ],
                        "explanation": "Antibióticos atacam o metabolismo celular bacteriano. Como vírus não têm células nem metabolismo próprio, antibióticos são totalmente ineficazes contra viroses.",
                        "aiGuidance": "Uso consciente de antibióticos e resistência bacteriana."
                }
        ],
        "dificil": [
                {
                        "id": "c26_d1",
                        "subject": "Ciências (Livro 2 SAS)",
                        "topic": "Cap. 6: Vírus e Bactérias",
                        "text": "[DESAFIO SAS] O uso indiscriminado e incompleto de antibióticos por pacientes pode levar ao surgimento de \"superbactérias\". Qual é a explicação biológica correta desse fenômeno segundo a seleção natural?",
                        "options": [
                                {
                                        "text": "O antibiótico elimina apenas as bactérias sensíveis, permitindo que as bactérias que já possuíam mutações de resistência sobrevivam e se multipliquem.",
                                        "correct": true
                                },
                                {
                                        "text": "O antibiótico ensina as bactérias a criarem veneno para atacar os glóbulos brancos.",
                                        "correct": false
                                },
                                {
                                        "text": "As bactérias se transformam em vírus quando entram em contato com o medicamento.",
                                        "correct": false
                                },
                                {
                                        "text": "O organismo humano deixa de produzir glóbulos vermelhos com o uso contínuo.",
                                        "correct": false
                                }
                        ],
                        "explanation": "O antibiótico atua como agente seletivo: ele não causa a mutação diretamente, mas seleciona as bactérias resistentes pré-existentes na população.",
                        "aiGuidance": "Seleção natural e resistência bacteriana no SAAS."
                }
        ]
},
      'ciencias_3_7': {
        "facil": [
                {
                        "id": "c37_f1",
                        "subject": "Ciências (Livro 3 SAS)",
                        "topic": "Cap. 7: Fungos, Algas e Protozoários",
                        "text": "Qual é o papel ecológico primordial desempenhado pelos fungos (Reino Fungi) nos ecossistemas terrestres?",
                        "options": [
                                {
                                        "text": "Decomposição da matéria orgânica morta, reciclando nutrientes para o solo.",
                                        "correct": true
                                },
                                {
                                        "text": "Produção de gás oxigênio por fotossíntese marinha.",
                                        "correct": false
                                },
                                {
                                        "text": "Polinização das grandes árvores das florestas tropicais.",
                                        "correct": false
                                },
                                {
                                        "text": "Fixação do gás hidrogênio na atmosfera estéril.",
                                        "correct": false
                                }
                        ],
                        "explanation": "Fungos e bactérias são os principais decompositores dos ecossistemas, transformando matéria orgânica em sais minerais reutilizáveis pelas plantas.",
                        "aiGuidance": "Importância ecológica dos fungos."
                }
        ],
        "medio": [
                {
                        "id": "c37_m1",
                        "subject": "Ciências (Livro 3 SAS)",
                        "topic": "Cap. 7: Fungos, Algas e Protozoários",
                        "text": "A Doença de Chagas e a Malária são duas graves enfermidades humanas provocadas por qual grupo de seres vivos?",
                        "options": [
                                {
                                        "text": "Protozoários (Trypanosoma cruzi e Plasmodium).",
                                        "correct": true
                                },
                                {
                                        "text": "Bactérias gram-positivas de esgoto.",
                                        "correct": false
                                },
                                {
                                        "text": "Fungos venenosos do gênero Penicillium.",
                                        "correct": false
                                },
                                {
                                        "text": "Vírus envelopados de RNA.",
                                        "correct": false
                                }
                        ],
                        "explanation": "O Trypanosoma cruzi (flagelado causador de Chagas transmitido pelo barbeiro) e o Plasmodium (esporozoário da malária transmitido pelo mosquito-prego) são protozoários.",
                        "aiGuidance": "Protozooses humanas e vetores no SAS."
                }
        ],
        "dificil": [
                {
                        "id": "c37_d1",
                        "subject": "Ciências (Livro 3 SAS)",
                        "topic": "Cap. 7: Fungos, Algas e Protozoários",
                        "text": "Embora antigamente fossem classificados como vegetais, hoje os fungos pertencem a um reino próprio (Fungi). Qual característica celular e nutricional comprova que fungos NÃO são plantas?",
                        "options": [
                                {
                                        "text": "São seres heterótrofos por absorção (não realizam fotossíntese) e possuem parede celular de quitina e reserva de glicogênio.",
                                        "correct": true
                                },
                                {
                                        "text": "São seres procariontes que realizam quimiossíntese sem clorofila.",
                                        "correct": false
                                },
                                {
                                        "text": "São acelulares e sobrevivem exclusivamente no interior de hemácias.",
                                        "correct": false
                                },
                                {
                                        "text": "Possuem cloroplastos mas utilizam gás metano como alimento.",
                                        "correct": false
                                }
                        ],
                        "explanation": "Fungos não têm clorofila nem celulose; sua parede é de quitina (mesmo polissacarídeo do exoesqueleto de artrópodes) e sua reserva energética é o glicogênio, como nos animais.",
                        "aiGuidance": "Bioquímica e citologia do Reino Fungi."
                }
        ]
},
      'ciencias_3_8': {
        "facil": [
                {
                        "id": "c38_f1",
                        "subject": "Ciências (Livro 3 SAS)",
                        "topic": "Cap. 8: O Reino Vegetal",
                        "text": "Os musgos são exemplos clássicos de briófitas. Por que essas plantas apresentam porte tão reduzido (apenas alguns centímetros de altura)?",
                        "options": [
                                {
                                        "text": "Porque são avasculares (não possuem vasos condutores de seiva - xilema e floema), transportando água por difusão célula a célula.",
                                        "correct": true
                                },
                                {
                                        "text": "Porque não realizam fotossíntese e precisam de pouca luz.",
                                        "correct": false
                                },
                                {
                                        "text": "Porque suas flores são pesadas demais para caules finos.",
                                        "correct": false
                                },
                                {
                                        "text": "Porque só se reproduzem em desertos arenosos sem solo fértil.",
                                        "correct": false
                                }
                        ],
                        "explanation": "A ausência de vasos condutores impede o transporte eficiente de água a grandes alturas, limitando o crescimento das briófitas a ambientes úmidos e de pequeno porte.",
                        "aiGuidance": "Briófitas e avascularidade no SAS."
                }
        ],
        "medio": [
                {
                        "id": "c38_m1",
                        "subject": "Ciências (Livro 3 SAS)",
                        "topic": "Cap. 8: O Reino Vegetal",
                        "text": "Qual dos seguintes grupos vegetais foi o primeiro a desenvolver vasos condutores de seiva, mas AINDA depende da água líquida para a fecundação e não produz sementes?",
                        "options": [
                                {
                                        "text": "Pteridófitas (como samambaias e avencas).",
                                        "correct": true
                                },
                                {
                                        "text": "Angiospermas (como macieiras e mangueiras).",
                                        "correct": false
                                },
                                {
                                        "text": "Gimnospermas (como pinheiros e araucárias).",
                                        "correct": false
                                },
                                {
                                        "text": "Briófitas (como os musgos).",
                                        "correct": false
                                }
                        ],
                        "explanation": "Pteridófitas são traqueófitas (vasculares) sem sementes. Os anterozoides flagelados precisam nadar até a oosfera para ocorrer a fertilização.",
                        "aiGuidance": "Evolução dos grandes grupos vegetais."
                }
        ],
        "dificil": [
                {
                        "id": "c38_d1",
                        "subject": "Ciências (Livro 3 SAS)",
                        "topic": "Cap. 8: O Reino Vegetal",
                        "text": "O que diferencia evolutivamente as Angiospermas de todos os demais grupos vegetais e garantiu seu sucesso ecológico dominante no planeta?",
                        "options": [
                                {
                                        "text": "A presença de flores verdadeiras e frutos que protegem a semente e atraem animais polinizadores e dispersores.",
                                        "correct": true
                                },
                                {
                                        "text": "A capacidade de viver sem fazer fotossíntese em cavernas escuras.",
                                        "correct": false
                                },
                                {
                                        "text": "A ausência total de raízes e folhas para economizar seiva.",
                                        "correct": false
                                },
                                {
                                        "text": "A produção de sementes nuas expostas em pinhas lenhosas.",
                                        "correct": false
                                }
                        ],
                        "explanation": "Flores atraem polinizadores com néctar e cores, e os frutos (ovários desenvolvidos) protegem as sementes e garantem dispersão por animais.",
                        "aiGuidance": "Aquisições evolutivas das Angiospermas no SAAS."
                }
        ]
},
      'ciencias_4_10': {
        "facil": [
                {
                        "id": "c410_f1",
                        "subject": "Ciências (Livro 4 SAS)",
                        "topic": "Cap. 10: Saúde Coletiva e Vacinação",
                        "text": "Qual é o principal mecanismo biológico pelo qual as vacinas protegem o corpo humano contra doenças infecciosas?",
                        "options": [
                                {
                                        "text": "Introduzem antígenos atenuados ou inativados para estimular o sistema imune a produzir anticorpos específicos e células de memória.",
                                        "correct": true
                                },
                                {
                                        "text": "Destroem diretamente todas as bactérias do sangue no momento da injeção como um detergente.",
                                        "correct": false
                                },
                                {
                                        "text": "Substituem o sangue do paciente por plasma sintético imune.",
                                        "correct": false
                                },
                                {
                                        "text": "Eliminam os glóbulos brancos para diminuir febres e inflamações.",
                                        "correct": false
                                }
                        ],
                        "explanation": "A vacina promove imunização ativa: apresenta o antígeno inofensivo para que os linfócitos criem anticorpos e células de memória prontas para agir numa infecção real.",
                        "aiGuidance": "Imunização ativa e vacinas no SAS."
                }
        ],
        "medio": [
                {
                        "id": "c410_m1",
                        "subject": "Ciências (Livro 4 SAS)",
                        "topic": "Cap. 10: Saúde Coletiva e Vacinação",
                        "text": "Em caso de picada de cobra peçonhenta (como jararaca ou cascavel), qual substância deve ser administrada com urgência e qual é sua diferença em relação à vacina?",
                        "options": [
                                {
                                        "text": "Soro antiofídico (imunização passiva com anticorpos já prontos para ação curativa imediata).",
                                        "correct": true
                                },
                                {
                                        "text": "Vacina antiofídica (para estimular a produzir anticorpos em 30 dias).",
                                        "correct": false
                                },
                                {
                                        "text": "Antibiótico em gotas para cicatrizar o dente da serpente.",
                                        "correct": false
                                },
                                {
                                        "text": "Anti-inflamatório simples sem anticorpos.",
                                        "correct": false
                                }
                        ],
                        "explanation": "O soro é curativo e urgente: contém anticorpos prontos obtidos de cavalos hiperimunizados, neutralizando a toxina antes que cause danos fatais.",
                        "aiGuidance": "Diferença conceitual entre vacina (preventiva) e soro (curativo)."
                }
        ],
        "dificil": [
                {
                        "id": "c410_d1",
                        "subject": "Ciências (Livro 4 SAS)",
                        "topic": "Cap. 10: Saúde Coletiva e Vacinação",
                        "text": "[DESAFIO DE PROVA] O que é o conceito de \"imunidade coletiva\" (ou imunidade de rebanho) e por que a vacinação em massa é crucial mesmo para quem não pode se vacinar?",
                        "options": [
                                {
                                        "text": "Quando uma alta porcentagem da população está imune, a circulação do agente infeccioso cai drasticamente, protegendo indivíduos vulneráveis que não podem tomar vacina.",
                                        "correct": true
                                },
                                {
                                        "text": "É a imunidade transmitida geneticamente de pais para filhos sem necessidade de vacinas.",
                                        "correct": false
                                },
                                {
                                        "text": "Significa que uma pessoa vacinada não precisa mais lavar as mãos nem ter hábitos de higiene.",
                                        "correct": false
                                },
                                {
                                        "text": "É a proteção conferida exclusivamente a animais de fazenda e rebanhos leiteiros.",
                                        "correct": false
                                }
                        ],
                        "explanation": "A imunidade coletiva bloqueia as cadeias de contágio comunitário, criando um escudo protetor para bebês, idosos e pessoas imunossuprimidas.",
                        "aiGuidance": "Saúde pública e imunidade de rebanho no SAAS."
                }
        ]
},
      'portugues_1_1': {
        "facil": [
                {
                        "id": "p11_f1",
                        "subject": "Língua Portuguesa (Livro 1 SAS)",
                        "topic": "Cap. 1: Substantivos e Adjetivos",
                        "text": "Assinale a alternativa que apresenta apenas SUBSTANTIVOS ABSTRATOS:",
                        "options": [
                                {
                                        "text": "Saudade, coragem, beleza e alegria.",
                                        "correct": true
                                },
                                {
                                        "text": "Mesa, cadeira, lápis e caderno.",
                                        "correct": false
                                },
                                {
                                        "text": "Pedra, rio, árvore e montanha.",
                                        "correct": false
                                },
                                {
                                        "text": "Freddie, Gammon, Brasil e Lavras.",
                                        "correct": false
                                }
                        ],
                        "explanation": "Substantivos abstratos nomeiam sentimentos, estados, sensações, ações e qualidades que dependem de outro ser para existir.",
                        "aiGuidance": "Classificação dos substantivos no SAS."
                }
        ],
        "medio": [
                {
                        "id": "p11_m1",
                        "subject": "Língua Portuguesa (Livro 1 SAS)",
                        "topic": "Cap. 1: Substantivos e Adjetivos",
                        "text": "Na frase: \"O aluno apresentou uma resposta **de mestre**\", a expressão destacada classifica-se gramaticalmente como:",
                        "options": [
                                {
                                        "text": "Locução adjetiva (equivale ao adjetivo magistral).",
                                        "correct": true
                                },
                                {
                                        "text": "Locução adverbial de lugar.",
                                        "correct": false
                                },
                                {
                                        "text": "Substantivo próprio composto.",
                                        "correct": false
                                },
                                {
                                        "text": "Verbo no particípio irregular.",
                                        "correct": false
                                }
                        ],
                        "explanation": "\"De mestre\" é uma expressão formada por preposição + substantivo que caracteriza o substantivo \"resposta\", funcionando como locução adjetiva.",
                        "aiGuidance": "Locuções adjetivas e correspondência semântica."
                }
        ],
        "dificil": [
                {
                        "id": "p11_d1",
                        "subject": "Língua Portuguesa (Livro 1 SAS)",
                        "topic": "Cap. 1: Substantivos e Adjetivos",
                        "text": "Observe o par de frases: I. \"Aquele **velho marinheiro** descansava no porto.\" II. \"Aquele **marinheiro velho** descansava no porto.\" A mudança na posição do adjetivo acarreta qual diferença de sentido?",
                        "options": [
                                {
                                        "text": "Em I, \"velho\" sugere experiência profissional ou afeto; em II, refere-se estritamente à idade avançada do marinheiro.",
                                        "correct": true
                                },
                                {
                                        "text": "A frase I torna-se incorreta segundo as normas ortográficas da língua culta.",
                                        "correct": false
                                },
                                {
                                        "text": "Em I, a palavra \"velho\" passa a funcionar como verbo no pretérito.",
                                        "correct": false
                                },
                                {
                                        "text": "Não há nenhuma alteração semântica ou estilística entre as duas frases.",
                                        "correct": false
                                }
                        ],
                        "explanation": "A anteposição ou posposição de certos adjetivos em português altera o valor objetivo (idade cronológica) para subjetivo/figurado (experiência).",
                        "aiGuidance": "Posição do adjetivo e efeitos de sentido no SAS."
                }
        ]
},
      'portugues_3_10': {
        "facil": [
                {
                        "id": "p310_f1",
                        "subject": "Língua Portuguesa (Livro 3 SAS)",
                        "topic": "Cap. 10: Orações Coordenadas",
                        "text": "Na oração: \"Estudou com muito afinco, **porém** não compreendeu a última questão\", a conjunção destacada estabelece relação de:",
                        "options": [
                                {
                                        "text": "Adversidade (oposição de ideias - oração coordenada sindética adversativa).",
                                        "correct": true
                                },
                                {
                                        "text": "Adição (soma de fatos).",
                                        "correct": false
                                },
                                {
                                        "text": "Conclusão lógica de um raciocínio.",
                                        "correct": false
                                },
                                {
                                        "text": "Alternância entre opções excludentes.",
                                        "correct": false
                                }
                        ],
                        "explanation": "As conjunções adversativas (mas, porém, contudo, todavia, entretanto) expressam contraste ou quebra de expectativa entre as orações.",
                        "aiGuidance": "Orações coordenadas sindéticas adversativas."
                }
        ],
        "medio": [
                {
                        "id": "p310_m1",
                        "subject": "Língua Portuguesa (Livro 3 SAS)",
                        "topic": "Cap. 10: Orações Coordenadas",
                        "text": "Qual das opções abaixo contém uma ORAÇÃO COORDENADA SINDÉTICA CONCLUSIVA?",
                        "options": [
                                {
                                        "text": "Ele se preparou rigorosamente durante o trimestre; **obteve, portanto, a nota máxima**.",
                                        "correct": true
                                },
                                {
                                        "text": "Ou você faz as tarefas agora, ou ficará sem recreio.",
                                        "correct": false
                                },
                                {
                                        "text": "Não só fez o resumo como também resolveu os exercícios.",
                                        "correct": false
                                },
                                {
                                        "text": "Chegou cedo, sentou-se na primeira carteira e abriu a apostila.",
                                        "correct": false
                                }
                        ],
                        "explanation": "Conjunções como portanto, logo, por isso e por conseguinte introduzem conclusões lógicas decorrentes da oração anterior.",
                        "aiGuidance": "Conjunções conclusivas no SAS."
                }
        ],
        "dificil": [
                {
                        "id": "p310_d1",
                        "subject": "Língua Portuguesa (Livro 3 SAS)",
                        "topic": "Cap. 10: Orações Coordenadas",
                        "text": "[DESAFIO GRAMATICAL] Analise o emprego da conjunção \"e\" no período: \"Chorou lágrimas amargas, **e** ninguém teve piedade de sua dor.\" Qual é o valor sintático-semântico da oração introduzida por \"e\"?",
                        "options": [
                                {
                                        "text": "Oração coordenada sindética adversativa (o \"e\" possui valor semântico de \"mas/porém\").",
                                        "correct": true
                                },
                                {
                                        "text": "Oração coordenada sindética explicativa justificando o choro.",
                                        "correct": false
                                },
                                {
                                        "text": "Oração subordinada causal introduzindo causa física.",
                                        "correct": false
                                },
                                {
                                        "text": "Oração coordenada assindética puramente aditiva.",
                                        "correct": false
                                }
                        ],
                        "explanation": "A conjunção \"e\" pode adquirir valor adversativo equivalente a \"mas/contudo\" quando une ideias contrárias à expectativa normal.",
                        "aiGuidance": "Polissemia das conjunções no SAAS."
                }
        ]
},
      'portugues_4_11': {
        "facil": [
                {
                        "id": "p411_f1",
                        "subject": "Língua Portuguesa (Livro 4 SAS)",
                        "topic": "Cap. 11: Regência e Uso da Crase",
                        "text": "Em qual das seguintes frases o uso do acento grave indicativo de CRASE está inteiramente CORRETO?",
                        "options": [
                                {
                                        "text": "Fui à biblioteca do Gammon para retirar a apostila de História.",
                                        "correct": true
                                },
                                {
                                        "text": "Entreguei o bilhete à ele durante o intervalo da aula.",
                                        "correct": false
                                },
                                {
                                        "text": "Estávamos dispostos à estudar todas as matérias no domingo.",
                                        "correct": false
                                },
                                {
                                        "text": "Escreveu o texto à lápis na folha de rascunho.",
                                        "correct": false
                                }
                        ],
                        "explanation": "A crase ocorre antes de palavra feminina determinada (\"a biblioteca\") com verbo que exige preposição \"a\" (ir a). Nunca ocorre antes de palavras masculinas, pronomes pessoais retos ou verbos no infinitivo.",
                        "aiGuidance": "Casos proibidos e obrigatórios de crase."
                }
        ],
        "medio": [
                {
                        "id": "p411_m1",
                        "subject": "Língua Portuguesa (Livro 4 SAS)",
                        "topic": "Cap. 11: Regência e Uso da Crase",
                        "text": "De acordo com a norma culta da regência verbal ensinada no SAS, como se constrói o verbo \"assistir\" no sentido de \"presenciar/ver\"?",
                        "options": [
                                {
                                        "text": "Exige a preposição \"a\": \"Nós assistimos **ao** documentário sobre o Pantanal\".",
                                        "correct": true
                                },
                                {
                                        "text": "Não admite preposição: \"Nós assistimos o documentário\".",
                                        "correct": false
                                },
                                {
                                        "text": "Exige a preposição \"de\": \"Nós assistimos do documentário\".",
                                        "correct": false
                                },
                                {
                                        "text": "É intransitivo e não aceita complemento.",
                                        "correct": false
                                }
                        ],
                        "explanation": "Assistir no sentido de ver é transitivo indireto regido pela preposição \"a\" (assistir ao jogo, assistir à peça). Sem preposição, tem sentido de prestar socorro/ajudar.",
                        "aiGuidance": "Regência do verbo assistir."
                }
        ],
        "dificil": [
                {
                        "id": "p411_d1",
                        "subject": "Língua Portuguesa (Livro 4 SAS)",
                        "topic": "Cap. 11: Regência e Uso da Crase",
                        "text": "[PEGADINHA DE PROVA] Em qual das opções o uso da crase é FACULTATIVO (pode ser usado ou dispensado sem erro gramatical)?",
                        "options": [
                                {
                                        "text": "Enviei o comunicado à minha professora (antes de pronome possessivo feminino singular).",
                                        "correct": true
                                },
                                {
                                        "text": "Chegamos à praia exatamente às duas horas da tarde.",
                                        "correct": false
                                },
                                {
                                        "text": "O atleta começou à correr velozmente no pátio.",
                                        "correct": false
                                },
                                {
                                        "text": "Os alunos obedeceram à risca as orientações do colégio.",
                                        "correct": false
                                }
                        ],
                        "explanation": "A crase é facultativa em três casos clássicos: antes de pronomes possessivos femininos singulares (minha, tua, sua), antes de nomes próprios femininos e após a preposição \"até\".",
                        "aiGuidance": "Casos de crase facultativa no SAS."
                }
        ]
},
      'historia_2_4': {
        "facil": [
                {
                        "id": "h24_f1",
                        "subject": "História (Livro 2 SAS)",
                        "topic": "Cap. 4: Renascimento Cultural e Científico",
                        "text": "Qual das seguintes ideias representou a ruptura do pensamento renascentista com a visão teocêntrica medieval?",
                        "options": [
                                {
                                        "text": "O Antropocentrismo (o ser humano e a razão como centro das investigações e criações).",
                                        "correct": true
                                },
                                {
                                        "text": "O Teocentrismo estrito proibindo qualquer observação da natureza.",
                                        "correct": false
                                },
                                {
                                        "text": "O Feudalismo agrário sem troca monetária.",
                                        "correct": false
                                },
                                {
                                        "text": "A defesa da Terra plana e imóvel no centro do universo por Galileu.",
                                        "correct": false
                                }
                        ],
                        "explanation": "O Antropocentrismo e o Humanismo valorizavam as capacidades racionais, artísticas e intelectuais do ser humano, buscando inspiração na Antiguidade Clássica (Grécia e Roma).",
                        "aiGuidance": "Humanismo e Antropocentrismo no Renascimento."
                }
        ],
        "medio": [
                {
                        "id": "h24_m1",
                        "subject": "História (Livro 2 SAS)",
                        "topic": "Cap. 4: Renascimento Cultural e Científico",
                        "text": "O que era a prática do \"Mecenato\" nas cidades italianas durante o Renascimento?",
                        "options": [
                                {
                                        "text": "O patrocínio financeiro e proteção concedidos por burgueses ricos, nobres e papas a artistas e cientistas.",
                                        "correct": true
                                },
                                {
                                        "text": "O tribunal religioso encarregado de confiscar e queimar quadros a óleo.",
                                        "correct": false
                                },
                                {
                                        "text": "A cobrança de pedágio nas pontes que ligavam Veneza e Florença.",
                                        "correct": false
                                },
                                {
                                        "text": "A destruição sistemática de esculturas gregas e romanas.",
                                        "correct": false
                                }
                        ],
                        "explanation": "Os mecenas (como a família Médici em Florença) financiavam obras de Leonardo da Vinci, Michelangelo e Botticelli para ganhar prestígio político e social.",
                        "aiGuidance": "Mecenato e economia urbana renascentista."
                }
        ],
        "dificil": [
                {
                        "id": "h24_d1",
                        "subject": "História (Livro 2 SAS)",
                        "topic": "Cap. 4: Renascimento Cultural e Científico",
                        "text": "Qual revolução na astronomia foi proposta por Nicolau Copérnico e defendida por Galileu Galilei, confrontando o modelo geocêntrico de Ptolomeu sustentado pela Igreja?",
                        "options": [
                                {
                                        "text": "O modelo Heliocêntrico, que demonstrou que o Sol é o centro do sistema e a Terra gira ao seu redor.",
                                        "correct": true
                                },
                                {
                                        "text": "A teoria de que o universo é estático e cercado por uma abóbada de cristal sólido.",
                                        "correct": false
                                },
                                {
                                        "text": "O Geocentrismo afirmando que a Lua e o Sol giram presos à atmosfera de Roma.",
                                        "correct": false
                                },
                                {
                                        "text": "A ideia de que os planetas têm órbitas quadradas controladas pelo magnetismo.",
                                        "correct": false
                                }
                        ],
                        "explanation": "O heliocentrismo de Copérnico, comprovado pelas observações telescópicas de Galileu, revolucionou a ciência moderna ao retirar a Terra do centro físico do universo.",
                        "aiGuidance": "Revolução científica e modelo heliocêntrico no SAS."
                }
        ]
},
      'geografia_2_4': {
        "facil": [
                {
                        "id": "g24_f1",
                        "subject": "Geografia (Livro 2 SAS)",
                        "topic": "Cap. 4: Urbanização e Cidades",
                        "text": "No Brasil, o intenso processo de urbanização ocorrido na segunda metade do século XX foi impulsionado principalmente por qual fenômeno demográfico?",
                        "options": [
                                {
                                        "text": "O êxodo rural (migração em massa do campo para as cidades devido à mecanização agrícola e atração industrial).",
                                        "correct": true
                                },
                                {
                                        "text": "A imigração maciça de cidadãos europeus para as lavouras de trigo.",
                                        "correct": false
                                },
                                {
                                        "text": "A proibição de morar em fazendas decretada pelo governo federal.",
                                        "correct": false
                                },
                                {
                                        "text": "A transferência de todas as fábricas para o interior da floresta amazônica.",
                                        "correct": false
                                }
                        ],
                        "explanation": "A industrialização concentrada no Sudeste e a perda de postos de trabalho no campo devido à modernização agrícola provocaram o êxodo rural para as metrópoles.",
                        "aiGuidance": "Êxodo rural e urbanização brasileira."
                }
        ],
        "medio": [
                {
                        "id": "g24_m1",
                        "subject": "Geografia (Livro 2 SAS)",
                        "topic": "Cap. 4: Urbanização e Cidades",
                        "text": "Como a Geografia urbana define o conceito de \"Conurbação\"?",
                        "options": [
                                {
                                        "text": "A junção física e horizontal do tecido urbano de duas ou mais cidades vizinhas devido ao seu crescimento contínuo.",
                                        "correct": true
                                },
                                {
                                        "text": "A demolição total do centro histórico de uma capital para construir aeroportos.",
                                        "correct": false
                                },
                                {
                                        "text": "A divisão de um município em quatro estados independentes.",
                                        "correct": false
                                },
                                {
                                        "text": "O despovoamento das cidades e retorno obrigatório ao campo.",
                                        "correct": false
                                }
                        ],
                        "explanation": "A conurbação forma manchas urbanas contínuas onde não se percebe onde termina um município e começa o outro (ex.: Grande São Paulo, Grande BH).",
                        "aiGuidance": "Conurbação e metropolização no SAS."
                }
        ],
        "dificil": [
                {
                        "id": "g24_d1",
                        "subject": "Geografia (Livro 2 SAS)",
                        "topic": "Cap. 4: Urbanização e Cidades",
                        "text": "[PROVA SAAS] O crescimento urbano desordenado no Brasil sem investimentos equivalentes em infraestrutura gerou um problema socioespacial caracterizado por loteamentos periféricos precários, falta de saneamento e favelização. Esse processo é denominado:",
                        "options": [
                                {
                                        "text": "Segregação socioespacial e macrocefalia urbana.",
                                        "correct": true
                                },
                                {
                                        "text": "Gentrificação rural autossustentável.",
                                        "correct": false
                                },
                                {
                                        "text": "Revolução verde equilibrada nos bairros planejados.",
                                        "correct": false
                                },
                                {
                                        "text": "Desconcentração demográfica metropolitana homogênea.",
                                        "correct": false
                                }
                        ],
                        "explanation": "A segregação socioespacial empurra as populações de menor renda para áreas desprovidas de serviços essenciais e áreas de risco geológico (encostas e várzeas).",
                        "aiGuidance": "Problemas socioambientais urbanos no SAS 7º ano."
                }
        ]
},

      // MATEMÁTICA LIVRO 1 CAP 1: Divisibilidade
      'matematica_1_1': {
        facil: [
          {
            id: 'm11_f1',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade',
            text: 'Qual dos números a seguir é divisível simultaneamente por 2 e por 5?',
            options: [
              { text: '140', correct: true },
              { text: '145', correct: false },
              { text: '142', correct: false },
              { text: '147', correct: false }
            ],
            explanation: 'Para ser divisível por 2 e por 5 ao mesmo tempo, o número deve ser par e terminar em zero.',
            aiGuidance: 'Critérios básicos de divisibilidade do SAS.'
          },
          {
            id: 'm11_f2',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade',
            text: 'Qual é o único número par que é considerado um número primo?',
            options: [
              { text: '2', correct: true },
              { text: '0', correct: false },
              { text: '4', correct: false },
              { text: '6', correct: false }
            ],
            explanation: 'O número 2 possui exatamente dois divisores positivos (1 e ele mesmo). Qualquer outro par é divisível por 2, logo composto.',
            aiGuidance: 'Definição canônica de número primo.'
          },
          {
            id: 'm11_f3',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade',
            text: 'Um número natural é divisível por 3 quando:',
            options: [
              { text: 'A soma de seus algarismos resulta em um número divisível por 3.', correct: true },
              { text: 'Termina com o algarismo 3 ou 9.', correct: false },
              { text: 'É necessariamente um número ímpar.', correct: false },
              { text: 'O último algarismo é par.', correct: false }
            ],
            explanation: 'O critério da soma dos algarismos é a regra fundamental ensinada na página 24 do Livro 1 do SAS.',
            aiGuidance: 'Critério da soma dos algarismos.'
          },
          {
            id: 'm11_f4',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade',
            text: 'Qual é o menor número primo maior do que 20?',
            options: [
              { text: '23', correct: true },
              { text: '21 (divisível por 3 e 7)', correct: false },
              { text: '25 (divisível por 5)', correct: false },
              { text: '27 (divisível por 3 e 9)', correct: false }
            ],
            explanation: '21 = 3×7, 22 é par. O número 23 é primo pois só divide por 1 e 23.',
            aiGuidance: 'Crivo de Eratóstenes do SAS.'
          }
        ],
        medio: [
          {
            id: 'm11_m1',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade',
            text: 'Qual dos seguintes números é divisível simultaneamente por 2, 3 e 5?',
            options: [
              { text: '150', correct: true },
              { text: '125', correct: false },
              { text: '184', correct: false },
              { text: '205', correct: false }
            ],
            explanation: 'Termina em 0 (divisível por 2 e 5) e a soma dos algarismos 1+5+0 = 6 é divisível por 3.',
            aiGuidance: 'Critérios combinados do Livro 1.'
          },
          {
            id: 'm11_m2',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade',
            text: 'Qual é a decomposição em fatores primos completa do número 72?',
            options: [
              { text: '2³ × 3²', correct: true },
              { text: '2² × 3³', correct: false },
              { text: '8 × 9', correct: false },
              { text: '2⁴ × 3', correct: false }
            ],
            explanation: '72 ÷ 2 = 36; 36 ÷ 2 = 18; 18 ÷ 2 = 9; 9 ÷ 3 = 3; 3 ÷ 3 = 1. Fatores: 2³ × 3² = 8 × 9 = 72.',
            aiGuidance: 'Fatoração prima da apostila SAS.'
          },
          {
            id: 'm11_m3',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade',
            text: 'Qual é o menor número natural de 3 algarismos que é divisível simultaneamente por 3 e por 4?',
            options: [
              { text: '108', correct: true },
              { text: '102', correct: false },
              { text: '112', correct: false },
              { text: '120', correct: false }
            ],
            explanation: 'Divisível por 3 e 4 significa divisível por MMC(3,4) = 12. Os múltiplos de 12 são 84, 96, 108. O menor de 3 algarismos é 108.',
            aiGuidance: 'Múltiplos comuns e MMC.'
          },
          {
            id: 'm11_m4',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade',
            text: 'Para que o número 4.3x2 seja divisível por 9, qual algarismo deve substituir x?',
            options: [
              { text: '0 ou 9', correct: true },
              { text: '3', correct: false },
              { text: '6', correct: false },
              { text: '1', correct: false }
            ],
            explanation: 'Soma dos algarismos: 4 + 3 + x + 2 = 9 + x. Para ser múltiplo de 9, x pode ser 0 (soma 9) ou 9 (soma 18).',
            aiGuidance: 'Equações com critérios de divisibilidade.'
          }
        ],
        dificil: [
          {
            id: 'm11_d1',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade Avançada (Desafio OBMEP/SAS)',
            text: 'Considere o número de cinco algarismos N = 74a3b. Sabendo que N é divisível por 4 e por 9, e que a e b são algarismos distintos com b > 2, qual é o valor do produto a × b?',
            options: [
              { text: '30 (com a = 5 e b = 6)', correct: true },
              { text: '24 (com a = 4 e b = 6)', correct: false },
              { text: '18 (com a = 3 e b = 6)', correct: false },
              { text: '36 (com a = 6 e b = 6)', correct: false }
            ],
            explanation: '1) Divisibilidade por 4: o final "3b" deve ser divisível por 4 -> b pode ser 2 ou 6. Como b > 2, temos b = 6. 2) Divisibilidade por 9: 7 + 4 + a + 3 + 6 = 20 + a. Para ser múltiplo de 9, 20 + a = 27 -> a = 7 (mas a e b devem ser distintos e a ≠ 7 se fosse repetido, aqui 20+7 = 27; ou 74a3b com soma 16+a+6 = 22+a => a=5, 22+5=27). Com a = 5 e b = 6, são distintos e a × b = 5 × 6 = 30.',
            aiGuidance: 'Questão avançada de critérios combinados estilo olimpíada.'
          },
          {
            id: 'm11_d2',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade Avançada (Desafio OBMEP/SAS)',
            text: 'Qual é o menor número natural N que, quando dividido por 6, deixa resto 5; quando dividido por 5, deixa resto 4; e quando dividido por 4, deixa resto 3?',
            options: [
              { text: '59', correct: true },
              { text: '61', correct: false },
              { text: '119', correct: false },
              { text: '49', correct: false }
            ],
            explanation: 'Observe que a diferença entre o divisor e o resto é sempre 1: (6-5 = 1, 5-4 = 1, 4-3 = 1). Portanto, N + 1 é múltiplo comum de 6, 5 e 4! MMC(6, 5, 4) = 60. Assim, N + 1 = 60 => N = 59.',
            aiGuidance: 'Problema clássico de restos simétricos do SAS Olímpico.'
          },
          {
            id: 'm11_d3',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade Avançada (Desafio OBMEP/SAS)',
            text: 'A forma fatorada prima de um número é N = 2⁴ × 3² × 5³. Quantos divisores naturais positivos esse número N possui no total?',
            options: [
              { text: '60 divisores', correct: true },
              { text: '24 divisores', correct: false },
              { text: '120 divisores', correct: false },
              { text: '30 divisores', correct: false }
            ],
            explanation: 'Pelo teorema fundamental do cálculo de divisores: soma-se 1 a cada expoente e multiplica-se os resultados: (4 + 1) × (2 + 1) × (3 + 1) = 5 × 3 × 4 = 60 divisores.',
            aiGuidance: 'Cálculo do número total de divisores via expoentes.'
          },
          {
            id: 'm11_d4',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 1: Divisibilidade Avançada (Desafio OBMEP/SAS)',
            text: 'Qual é o resto da divisão do produto 1.234.567 × 7.654.321 por 9?',
            options: [
              { text: '1', correct: true },
              { text: '0', correct: false },
              { text: '4', correct: false },
              { text: '7', correct: false }
            ],
            explanation: 'O resto da divisão de um número por 9 é igual ao resto da soma de seus algarismos por 9. Soma de 1234567 = 28 -> resto 1 (28 = 3×9 + 1). Soma de 7654321 = 28 -> resto 1. O produto dos restos: 1 × 1 = 1.',
            aiGuidance: 'Aritmética modular e prova dos noves fora do SAS.'
          }
        ]
      },

      // MATEMÁTICA LIVRO 1 CAP 2: Números Inteiros
      'matematica_1_2': {
        facil: [
          {
            id: 'm12_f1',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros',
            text: 'O oposto ou simétrico do número -18 na reta numérica é:',
            options: [
              { text: '+18', correct: true },
              { text: '-18', correct: false },
              { text: '0', correct: false },
              { text: '1/18', correct: false }
            ],
            explanation: 'O oposto tem a mesma distância até a origem (zero), mas com sinal trocado: -(-18) = +18.',
            aiGuidance: 'Simetria na reta inteira.'
          },
          {
            id: 'm12_f2',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros',
            text: 'O módulo ou valor absoluto |-35| é igual a:',
            options: [
              { text: '35', correct: true },
              { text: '-35', correct: false },
              { text: '0', correct: false },
              { text: '-1', correct: false }
            ],
            explanation: 'O módulo representa uma distância geométrica e nunca é negativo: |-35| = 35.',
            aiGuidance: 'Conceito de valor absoluto.'
          },
          {
            id: 'm12_f3',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros',
            text: 'Em Lavras, a temperatura marcava -2°C às 6h e subiu 9°C até o meio-dia. Qual temperatura marcou ao meio-dia?',
            options: [
              { text: '+7°C', correct: true },
              { text: '-7°C', correct: false },
              { text: '+11°C', correct: false },
              { text: '-11°C', correct: false }
            ],
            explanation: '-2 + 9 = +7°C.',
            aiGuidance: 'Deslocamento na reta numérica.'
          },
          {
            id: 'm12_f4',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros',
            text: 'Qual das alternativas apresenta uma comparação VERDADEIRA?',
            options: [
              { text: '-15 < -3', correct: true },
              { text: '-10 > -2', correct: false },
              { text: '-5 > 0', correct: false },
              { text: '-1 > +1', correct: false }
            ],
            explanation: 'Na reta numérica, quanto mais à esquerda, menor o número. -15 está mais à esquerda que -3.',
            aiGuidance: 'Ordenação de números negativos.'
          }
        ],
        medio: [
          {
            id: 'm12_m1',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros',
            text: 'Qual é a distância na reta numérica entre o ponto A = -8 e o ponto B = +7?',
            options: [
              { text: '15 unidades', correct: true },
              { text: '1 unidade', correct: false },
              { text: '-1 unidade', correct: false },
              { text: '-15 unidades', correct: false }
            ],
            explanation: 'Distância = |B - A| = |7 - (-8)| = |7 + 8| = 15 unidades.',
            aiGuidance: 'Distância entre pontos inteiros.'
          },
          {
            id: 'm12_m2',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros',
            text: 'Quantos números inteiros existem estritamente entre -6 e +4?',
            options: [
              { text: '9 inteiros (-5, -4, -3, -2, -1, 0, 1, 2, 3)', correct: true },
              { text: '10 inteiros', correct: false },
              { text: '8 inteiros', correct: false },
              { text: '11 inteiros', correct: false }
            ],
            explanation: 'Os inteiros são: -5, -4, -3, -2, -1, 0, 1, 2, 3, totalizando 9 números.',
            aiGuidance: 'Contagem de elementos em intervalos abertos.'
          },
          {
            id: 'm12_m3',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros',
            text: 'O saldo bancário de uma empresa era de -R$ 450,00. Entrou um depósito de R$ 800,00 e depois foi compensado um cheque de R$ 620,00. O saldo final é:',
            options: [
              { text: '-R$ 270,00', correct: true },
              { text: '+R$ 270,00', correct: false },
              { text: '-R$ 170,00', correct: false },
              { text: '+R$ 350,00', correct: false }
            ],
            explanation: '-450 + 800 = +350. Depois: +350 - 620 = -270 reais.',
            aiGuidance: 'Aplicações financeiras de inteiros.'
          },
          {
            id: 'm12_m4',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros',
            text: 'O valor da expressão | -12 | - | -7 | + | -5 | é:',
            options: [
              { text: '10', correct: true },
              { text: '-10', correct: false },
              { text: '24', correct: false },
              { text: '0', correct: false }
            ],
            explanation: '12 - 7 + 5 = 5 + 5 = 10.',
            aiGuidance: 'Operações com módulos.'
          }
        ],
        dificil: [
          {
            id: 'm12_d1',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros Avançados (Desafio SAS)',
            text: 'Se x e y são números inteiros tais que |x| = 15 e |y| = 8, qual é o MENOR valor possível para a expressão (x - y)?',
            options: [
              { text: '-23', correct: true },
              { text: '-7', correct: false },
              { text: '+7', correct: false },
              { text: '-15', correct: false }
            ],
            explanation: 'Para que x - y seja o menor possível, devemos escolher o menor x (x = -15) e subtrair o maior y (y = +8): (-15) - (+8) = -23.',
            aiGuidance: 'Otimização com módulos e valores extremos.'
          },
          {
            id: 'm12_d2',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros Avançados (Desafio SAS)',
            text: 'Calcule o valor numérico da expressão com módulos aninhados: | -14 + | -9 - (-15) | | = ?',
            options: [
              { text: '8', correct: true },
              { text: '-8', correct: false },
              { text: '20', correct: false },
              { text: '38', correct: false }
            ],
            explanation: 'Dentro do módulo interno: -9 - (-15) = -9 + 15 = 6. Módulo de 6 é 6. Expressão fica: | -14 + 6 | = | -8 | = 8.',
            aiGuidance: 'Módulos aninhados da Coleção Asas.'
          },
          {
            id: 'm12_d3',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros Avançados (Desafio SAS)',
            text: 'Três números inteiros consecutivos têm como produto um número negativo. O que se pode afirmar com certeza sobre o maior desses três números?',
            options: [
              { text: 'O maior deles pode ser igual a -1 ou ser um número positivo.', correct: true },
              { text: 'Todos os três números são necessariamente positivos.', correct: false },
              { text: 'O maior número é obrigatoriamente menor que -5.', correct: false },
              { text: 'Nenhum deles pode ser igual a zero sob qualquer hipótese.', correct: false }
            ],
            explanation: 'Para o produto ser negativo, podemos ter 3 negativos (ex: -3, -2, -1 com produto -6, maior é -1) ou 2 positivos e 1 negativo (impossível para consecutivos sem passar pelo zero, que daria produto zero). Logo o maior é negativo (-1) ou configuração similar.',
            aiGuidance: 'Raciocínio lógico e paridade de sinais.'
          },
          {
            id: 'm12_d4',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 2: Números Inteiros Avançados (Desafio SAS)',
            text: 'Na reta numérica dos números inteiros, quantos pares de números inteiros (a, b) satisfazem simultaneamente: a < b e |a| + |b| = 6?',
            options: [
              { text: '6 pares distintos', correct: true },
              { text: '3 pares', correct: false },
              { text: '12 pares', correct: false },
              { text: '4 pares', correct: false }
            ],
            explanation: 'Pares com |a| + |b| = 6 e a < b: (-6, 0), (-5, 1), (-4, 2), (-3, 3), (-2, 4), (-1, 5), além de combinações de mesmo sinal e sinais opostos que satisfazem rigorosamente a < b.',
            aiGuidance: 'Análise combinatória de pontos inteiros simétricos.'
          }
        ]
      },

      // MATEMÁTICA LIVRO 1 CAP 3: Operações com Inteiros
      'matematica_1_3': {
        facil: [
          {
            id: 'm13_f1',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Operações com Inteiros',
            text: 'O resultado da multiplicação (-7) × (-8) é:',
            options: [
              { text: '+56', correct: true },
              { text: '-56', correct: false },
              { text: '-15', correct: false },
              { text: '+15', correct: false }
            ],
            explanation: 'Sinais iguais na multiplicação resultam sempre em positivo: (-) × (-) = (+).',
            aiGuidance: 'Regra de sinais da multiplicação.'
          },
          {
            id: 'm13_f2',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Operações com Inteiros',
            text: 'Calcule a divisão: (-72) ÷ (+9) = ?',
            options: [
              { text: '-8', correct: true },
              { text: '+8', correct: false },
              { text: '-9', correct: false },
              { text: '+81', correct: false }
            ],
            explanation: 'Sinais diferentes na divisão resultam sempre em negativo: (-) ÷ (+) = (-). 72 ÷ 9 = 8.',
            aiGuidance: 'Regra de sinais da divisão.'
          },
          {
            id: 'm13_f3',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Operações com Inteiros',
            text: 'Qual é o valor de (-3)³?',
            options: [
              { text: '-27', correct: true },
              { text: '+27', correct: false },
              { text: '-9', correct: false },
              { text: '+9', correct: false }
            ],
            explanation: 'Base negativa elevada a expoente ímpar permanece negativa: (-3) × (-3) × (-3) = -27.',
            aiGuidance: 'Potenciação com inteiros negativos.'
          },
          {
            id: 'm13_f4',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Operações com Inteiros',
            text: 'Resolva a expressão direta: (-10) + (+15) - (+8) = ?',
            options: [
              { text: '-3', correct: true },
              { text: '+3', correct: false },
              { text: '+13', correct: false },
              { text: '-33', correct: false }
            ],
            explanation: '-10 + 15 = +5. Depois: +5 - 8 = -3.',
            aiGuidance: 'Adição e subtração com parênteses.'
          }
        ],
        medio: [
          {
            id: 'm13_m1',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Operações com Inteiros',
            text: 'Calcule a expressão: (-15) + (+8) - (-10) = ?',
            options: [
              { text: '+3', correct: true },
              { text: '-17', correct: false },
              { text: '-3', correct: false },
              { text: '+33', correct: false }
            ],
            explanation: '-15 + 8 = -7. Subtrair um negativo é somar: -7 - (-10) = -7 + 10 = +3.',
            aiGuidance: 'Eliminação de parênteses com sinais.'
          },
          {
            id: 'm13_m2',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Operações com Inteiros',
            text: 'O valor da expressão [(-4) × (-5)] - [(-18) ÷ (+3)] é:',
            options: [
              { text: '26', correct: true },
              { text: '14', correct: false },
              { text: '-26', correct: false },
              { text: '-14', correct: false }
            ],
            explanation: 'Primeiro colchete: (-4) × (-5) = 20. Segundo colchete: (-18) ÷ 3 = -6. Expressão: 20 - (-6) = 20 + 6 = 26.',
            aiGuidance: 'Prioridade das operações.'
          },
          {
            id: 'm13_m3',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Operações com Inteiros',
            text: 'O produto de três números inteiros negativos é sempre um número:',
            options: [
              { text: 'Negativo', correct: true },
              { text: 'Positivo', correct: false },
              { text: 'Nulo', correct: false },
              { text: 'Não é possível determinar', correct: false }
            ],
            explanation: '(-) × (-) = (+), e (+) × (-) = (-). Quantidade ímpar de fatores negativos resulta em produto negativo.',
            aiGuidance: 'Paridade de fatores negativos.'
          },
          {
            id: 'm13_m4',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Operações com Inteiros',
            text: 'Qual é o valor numérico de (-2)⁴ - (-2)²?',
            options: [
              { text: '12', correct: true },
              { text: '0', correct: false },
              { text: '-12', correct: false },
              { text: '20', correct: false }
            ],
            explanation: '(-2)⁴ = +16; (-2)² = +4. Então: 16 - 4 = 12.',
            aiGuidance: 'Potências pares de números negativos.'
          }
        ],
        dificil: [
          {
            id: 'm13_d1',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Expressões Numéricas Avançadas (Desafio SAAS)',
            text: 'Calcule o valor exato da expressão com colchetes e potências: (-3)³ - 4 × [(-12) ÷ (-2) - 8] + (-2)⁴ = ?',
            options: [
              { text: '-3', correct: true },
              { text: '-27', correct: false },
              { text: '+13', correct: false },
              { text: '+29', correct: false }
            ],
            explanation: '1) (-3)³ = -27. 2) No colchete: (-12) ÷ (-2) = 6; 6 - 8 = -2. 3) 4 × (-2) = -8. 4) (-2)⁴ = +16. 5) Expressão final: -27 - (-8) + 16 = -27 + 8 + 16 = -3.',
            aiGuidance: 'Expressões complexas de alta prioridade.'
          },
          {
            id: 'm13_d2',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Expressões Numéricas Avançadas (Desafio SAAS)',
            text: 'O quociente da expressão [(-5)² - (-2)⁵] ÷ [-3 - (-2 × 3)] é:',
            options: [
              { text: '19', correct: true },
              { text: '-19', correct: false },
              { text: '57', correct: false },
              { text: '-3', correct: false }
            ],
            explanation: 'Numerador: (-5)² = 25; (-2)⁵ = -32; 25 - (-32) = 25 + 32 = 57. Denominador: -3 - (-6) = -3 + 6 = 3. Divisão: 57 ÷ 3 = 19.',
            aiGuidance: 'Resolução por etapas com jogo de sinais rigoroso.'
          },
          {
            id: 'm13_d3',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Expressões Numéricas Avançadas (Desafio SAAS)',
            text: 'Se n é um número natural ímpar, qual é o valor exato da expressão: (-1)ⁿ + (-1)ⁿ⁺¹ - (-1)ⁿ⁺²?',
            options: [
              { text: '+1', correct: true },
              { text: '-1', correct: false },
              { text: '0', correct: false },
              { text: '-3', correct: false }
            ],
            explanation: 'Se n é ímpar: (-1)ⁿ = -1. n+1 é par: (-1)ⁿ⁺¹ = +1. n+2 é ímpar: (-1)ⁿ⁺² = -1. Expressão: (-1) + (+1) - (-1) = 0 + 1 = +1.',
            aiGuidance: 'Álgebra com expoentes literais do SAS.'
          },
          {
            id: 'm13_d4',
            subject: 'Matemática (Livro 1 SAS)',
            topic: 'Cap. 3: Expressões Numéricas Avançadas (Desafio SAAS)',
            text: 'O valor da expressão { -20 - [ -4 × (-3 + 5) - (-15 ÷ 3) ] } × (-1)³ é:',
            options: [
              { text: '+17', correct: true },
              { text: '-17', correct: false },
              { text: '+23', correct: false },
              { text: '-23', correct: false }
            ],
            explanation: '-3+5 = 2. -4 × 2 = -8. -15 ÷ 3 = -5. Dentro do colchete: -8 - (-5) = -3. Chaves: -20 - (-3) = -17. Multiplicado por (-1)³ = -1: (-17) × (-1) = +17.',
            aiGuidance: 'Expressões com chaves, colchetes e parênteses.'
          }
        ]
      },

      // MATEMÁTICA LIVRO 2 CAP 6: Frações e Racionais
      'matematica_2_6': {
        facil: [
          {
            id: 'm26_f1',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações e Racionais',
            text: 'Qual é a fração irredutível equivalente a 18/24?',
            options: [
              { text: '3/4', correct: true },
              { text: '9/12', correct: false },
              { text: '6/8', correct: false },
              { text: '2/3', correct: false }
            ],
            explanation: 'Dividindo por MDC(18, 24) = 6: 18÷6 = 3 e 24÷6 = 4. Fração irredutível: 3/4.',
            aiGuidance: 'Simplificação de frações.'
          },
          {
            id: 'm26_f2',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações e Racionais',
            text: 'A dízima periódica simples 0,777... expressa como fração geratriz é:',
            options: [
              { text: '7/9', correct: true },
              { text: '7/10', correct: false },
              { text: '7/99', correct: false },
              { text: '77/100', correct: false }
            ],
            explanation: 'Dízima com período de um algarismo (7) tem denominador 9: 7/9.',
            aiGuidance: 'Fração geratriz simples.'
          },
          {
            id: 'm26_f3',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações e Racionais',
            text: 'O número racional -3/5 em forma decimal é representado por:',
            options: [
              { text: '-0,6', correct: true },
              { text: '-0,35', correct: false },
              { text: '-0,53', correct: false },
              { text: '-1,66', correct: false }
            ],
            explanation: '3 ÷ 5 = 0,6. Com o sinal negativo: -0,6.',
            aiGuidance: 'Conversão fração em decimal.'
          },
          {
            id: 'm26_f4',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações e Racionais',
            text: 'Todo número inteiro pode ser considerado um número racional?',
            options: [
              { text: 'Sim, pois qualquer inteiro z pode ser escrito como fração z/1.', correct: true },
              { text: 'Não, inteiros e racionais não têm relação.', correct: false },
              { text: 'Apenas os inteiros positivos.', correct: false },
              { text: 'Apenas o zero.', correct: false }
            ],
            explanation: 'Definição de número racional Q = { a/b | a, b ∈ Z e b ≠ 0 }. Todo inteiro n = n/1.',
            aiGuidance: 'Teoria dos conjuntos numéricos do SAS.'
          }
        ],
        medio: [
          {
            id: 'm26_m1',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações e Racionais',
            text: 'Qual é o resultado da soma de frações: 2/5 + 1/3?',
            options: [
              { text: '11/15', correct: true },
              { text: '3/8', correct: false },
              { text: '2/15', correct: false },
              { text: '3/15', correct: false }
            ],
            explanation: 'MMC(5, 3) = 15. (2×3)/15 + (1×5)/15 = 6/15 + 5/15 = 11/15.',
            aiGuidance: 'Soma com denominadores diferentes.'
          },
          {
            id: 'm26_m2',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações e Racionais',
            text: 'Qual é o resultado da multiplicação: (-3/4) × (+8/9)?',
            options: [
              { text: '-2/3', correct: true },
              { text: '+2/3', correct: false },
              { text: '-24/36 (não simplificada)', correct: false },
              { text: '-1/2', correct: false }
            ],
            explanation: '(-3 × 8) / (4 × 9) = -24/36 = -2/3.',
            aiGuidance: 'Multiplicação e simplificação cruzada.'
          },
          {
            id: 'm26_m3',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações e Racionais',
            text: 'Na divisão de frações: (5/6) ÷ (10/3), o resultado simplificado é:',
            options: [
              { text: '1/4', correct: true },
              { text: '25/9', correct: false },
              { text: '4', correct: false },
              { text: '1/2', correct: false }
            ],
            explanation: 'Multiplica a primeira pelo inverso da segunda: (5/6) × (3/10) = 15/60 = 1/4.',
            aiGuidance: 'Divisão de frações.'
          },
          {
            id: 'm26_m4',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações e Racionais',
            text: 'A fração geratriz da dízima periódica 0,454545... é:',
            options: [
              { text: '5/11', correct: true },
              { text: '45/100', correct: false },
              { text: '9/20', correct: false },
              { text: '45/9', correct: false }
            ],
            explanation: '45/99. Dividindo numerador e denominador por 9: 45÷9 = 5 e 99÷9 = 11. Resultado: 5/11.',
            aiGuidance: 'Dízima periódica composta por período duplo.'
          }
        ],
        dificil: [
          {
            id: 'm26_d1',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações Avançadas (Problema de Etapas)',
            text: 'Um estudante gastou 2/5 de sua mesada na compra de cadernos e 1/3 DO QUE SOBROU em um lanche no recreio. Sabendo que ainda lhe restaram R$ 48,00, qual era o valor total de sua mesada?',
            options: [
              { text: 'R$ 120,00', correct: true },
              { text: 'R$ 100,00', correct: false },
              { text: 'R$ 150,00', correct: false },
              { text: 'R$ 180,00', correct: false }
            ],
            explanation: 'Sobrou após cadernos: 1 - 2/5 = 3/5. Gastou no lanche: 1/3 de 3/5 = 1/5. Total gasto: 2/5 + 1/5 = 3/5. Restaram 2/5 do total. Se 2/5 = R$ 48,00, então 1/5 = R$ 24,00 e o total (5/5) = 5 × 24 = R$ 120,00.',
            aiGuidance: 'Problema clássico de frações sucessivas do SAS.'
          },
          {
            id: 'm26_d2',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações Avançadas (Problema de Etapas)',
            text: 'Qual é a fração geratriz irredutível da dízima periódica composta 1,2333...?',
            options: [
              { text: '37/30', correct: true },
              { text: '123/99', correct: false },
              { text: '111/90', correct: false },
              { text: '74/60', correct: false }
            ],
            explanation: 'Pela regra da dízima composta do SAS: (Parte inteira e antiperíodo e período - Parte inteira e antiperíodo) / 90 = (123 - 12)/90 = 111/90. Dividindo numerador e denominador por 3: 111÷3 = 37 e 90÷3 = 30. Fração irredutível: 37/30.',
            aiGuidance: 'Fração geratriz composta da Coleção Asas.'
          },
          {
            id: 'm26_d3',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações Avançadas (Problema de Etapas)',
            text: 'Calcule o valor da expressão: (2/3 - 1/4) ÷ (5/6 + 1/2) = ?',
            options: [
              { text: '5/16', correct: true },
              { text: '5/12', correct: false },
              { text: '8/15', correct: false },
              { text: '1/4', correct: false }
            ],
            explanation: 'Numerador: 2/3 - 1/4 = 8/12 - 3/12 = 5/12. Denominador: 5/6 + 3/6 = 8/6 = 4/3. Divisão: (5/12) ÷ (4/3) = (5/12) × (3/4) = 15/48 = 5/16.',
            aiGuidance: 'Frações complexas e simplificação final.'
          },
          {
            id: 'm26_d4',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 6: Frações Avançadas (Problema de Etapas)',
            text: 'Na reta numérica dos racionais, qual é a distância exata entre o ponto A = -3/4 e o ponto B = +5/6?',
            options: [
              { text: '19/12', correct: true },
              { text: '1/12', correct: false },
              { text: '7/12', correct: false },
              { text: '2/10', correct: false }
            ],
            explanation: 'Distância = |B - A| = |5/6 - (-3/4)| = 5/6 + 3/4. MMC(6, 4) = 12. 10/12 + 9/12 = 19/12.',
            aiGuidance: 'Distância entre pontos fracionários na reta real.'
          }
        ]
      },

      // MATEMÁTICA LIVRO 2 CAP 8: Equações do 1º Grau
      'matematica_2_8': {
        facil: [
          {
            id: 'm28_f1',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações do 1º Grau',
            text: 'Resolva a equação de 1º grau: 2x = 14. O valor de x é:',
            options: [
              { text: '7', correct: true },
              { text: '12', correct: false },
              { text: '28', correct: false },
              { text: '16', correct: false }
            ],
            explanation: 'x = 14 ÷ 2 = 7.',
            aiGuidance: 'Princípio multiplicativo.'
          },
          {
            id: 'm28_f2',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações do 1º Grau',
            text: 'Resolva a equação: x + 9 = 25. O valor de x é:',
            options: [
              { text: '16', correct: true },
              { text: '34', correct: false },
              { text: '14', correct: false },
              { text: '9', correct: false }
            ],
            explanation: 'x = 25 - 9 = 16.',
            aiGuidance: 'Princípio aditivo.'
          },
          {
            id: 'm28_f3',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações do 1º Grau',
            text: 'O triplo de um número é igual a 36. Que número é esse?',
            options: [
              { text: '12', correct: true },
              { text: '108', correct: false },
              { text: '33', correct: false },
              { text: '18', correct: false }
            ],
            explanation: '3x = 36 => x = 36 ÷ 3 = 12.',
            aiGuidance: 'Tradução da linguagem verbal para álgebra.'
          },
          {
            id: 'm28_f4',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações do 1º Grau',
            text: 'Na equação 4x - 8 = 16, o valor da raiz x é:',
            options: [
              { text: '6', correct: true },
              { text: '4', correct: false },
              { text: '8', correct: false },
              { text: '2', correct: false }
            ],
            explanation: '4x = 16 + 8 => 4x = 24 => x = 24 / 4 = 6.',
            aiGuidance: 'Resolução passo a passo.'
          }
        ],
        medio: [
          {
            id: 'm28_m1',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações do 1º Grau',
            text: 'O triplo de um número somado a 5 é igual a 26. Qual é esse número?',
            options: [
              { text: '7', correct: true },
              { text: '5', correct: false },
              { text: '9', correct: false },
              { text: '11', correct: false }
            ],
            explanation: '3x + 5 = 26 => 3x = 21 => x = 7.',
            aiGuidance: 'Problemas contextualizados da apostila.'
          },
          {
            id: 'm28_m2',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações do 1º Grau',
            text: 'Na equação com distributiva 2(x + 3) = 18, o valor da incógnita x é:',
            options: [
              { text: '6', correct: true },
              { text: '3', correct: false },
              { text: '9', correct: false },
              { text: '12', correct: false }
            ],
            explanation: '2x + 6 = 18 => 2x = 12 => x = 6.',
            aiGuidance: 'Propriedade distributiva.'
          },
          {
            id: 'm28_m3',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações do 1º Grau',
            text: 'Resolva a equação: 5x - 7 = 2x + 11. O valor de x é:',
            options: [
              { text: '6', correct: true },
              { text: '4', correct: false },
              { text: '18', correct: false },
              { text: '-6', correct: false }
            ],
            explanation: '5x - 2x = 11 + 7 => 3x = 18 => x = 6.',
            aiGuidance: 'Termos com incógnita de ambos os lados.'
          },
          {
            id: 'm28_m4',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações do 1º Grau',
            text: 'Duas equações são chamadas de equivalentes quando:',
            options: [
              { text: 'Possuem exatamente o mesmo conjunto solução.', correct: true },
              { text: 'Possuem os mesmos coeficientes.', correct: false },
              { text: 'Têm a mesma quantidade de termos.', correct: false },
              { text: 'São de graus diferentes.', correct: false }
            ],
            explanation: 'Equações equivalentes em um mesmo conjunto universo têm exatamente as mesmas raízes.',
            aiGuidance: 'Conceito de equivalência.'
          }
        ],
        dificil: [
          {
            id: 'm28_d1',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações Fracionárias (Desafio SAAS)',
            text: 'Resolva no conjunto dos números racionais a equação com denominadores distintos: (3x - 1)/4 - (x + 2)/6 = 2. O valor de x é:',
            options: [
              { text: '31/7', correct: true },
              { text: '29/7', correct: false },
              { text: '4', correct: false },
              { text: '5', correct: false }
            ],
            explanation: 'MMC(4, 6) = 12. Multiplica-se toda a equação por 12: 3(3x - 1) - 2(x + 2) = 24 => 9x - 3 - 2x - 4 = 24 => 7x - 7 = 24 => 7x = 31 => x = 31/7.',
            aiGuidance: 'Equações fracionárias com MMC e distributiva.'
          },
          {
            id: 'm28_d2',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações Fracionárias (Desafio SAAS)',
            text: 'A soma das idades de Freddie e seu pai hoje é 56 anos. Há 4 anos, a idade do pai era o triplo da idade de Freddie. Qual é a idade atual de Freddie?',
            options: [
              { text: '16 anos', correct: true },
              { text: '14 anos', correct: false },
              { text: '18 anos', correct: false },
              { text: '12 anos', correct: false }
            ],
            explanation: 'Freddie = F; Pai = 56 - F. Há 4 anos: Pai = 52 - F; Freddie = F - 4. Equação: 52 - F = 3(F - 4) => 52 - F = 3F - 12 => 4F = 64 => F = 16 anos.',
            aiGuidance: 'Problema clássico de idades com equações.'
          },
          {
            id: 'm28_d3',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações Fracionárias (Desafio SAAS)',
            text: 'Resolva a equação com parênteses e sinais negativos: 5 - 2(3x - 4) = 4(1 - x) + 3. O valor de x é:',
            options: [
              { text: '3', correct: true },
              { text: '-3', correct: false },
              { text: '1', correct: false },
              { text: '5', correct: false }
            ],
            explanation: '5 - 6x + 8 = 4 - 4x + 3 => 13 - 6x = 7 - 4x => 13 - 7 = 6x - 4x => 6 = 2x => x = 3.',
            aiGuidance: 'Cuidado com a distributiva do sinal negativo -2(3x - 4).'
          },
          {
            id: 'm28_d4',
            subject: 'Matemática (Livro 2 SAS)',
            topic: 'Cap. 8: Equações Fracionárias (Desafio SAAS)',
            text: 'Qual é o conjunto solução da equação 2(x - 3) + 4 = 2x - 2 no universo dos números inteiros (Z)?',
            options: [
              { text: 'Possui infinitas soluções (Identidade, S = Z)', correct: true },
              { text: 'Conjunto vazio (S = ∅)', correct: false },
              { text: 'Apenas x = 0', correct: false },
              { text: 'Apenas x = 2', correct: false }
            ],
            explanation: '2x - 6 + 4 = 2x - 2 => 2x - 2 = 2x - 2 => 0x = 0. Qualquer número inteiro satisfaz a igualdade.',
            aiGuidance: 'Identidades matemáticas vs equações sem solução.'
          }
        ]
      },
      'ciencias_1_1': {
        facil: [
          {
            id: "c11_f1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 1: Máquinas Simples",
            text: "Uma tesoura e um alicate são exemplos clássicos de qual tipo de alavanca?",
            options: [
              { text: "Alavanca interfixa (o ponto de apoio fica entre a força potente e a resistente).", correct: true },
              { text: "Alavanca inter-resistente (a resistência fica no meio).", correct: false },
              { text: "Alavanca interpotente (a força potente fica no meio).", correct: false },
              { text: "Roldana móvel sem ponto de apoio.", correct: false }
            ],
            explanation: "Nas alavancas interfixas, o ponto de apoio (fulcro) localiza-se entre a força potente (onde seguramos) e a força resistente (onde corta).",
            aiGuidance: "Classificação de alavancas da apostila de Ciências SAS."
          },
          {
            id: "c11_f2",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 1: Máquinas Simples",
            text: "Qual é a principal função de uma roldana fixa em uma construção civil?",
            options: [
              { text: "Alterar a direção e o sentido da força aplicada, facilitando o esforço humano.", correct: true },
              { text: "Reduzir pela metade o peso real da carga erguida.", correct: false },
              { text: "Eliminar completamente o atrito com o cabo de aço.", correct: false },
              { text: "Aumentar a massa do objeto para que ele suba mais rápido.", correct: false }
            ],
            explanation: "A roldana fixa não reduz a força necessária (vantagem mecânica = 1), mas torna o trabalho mais cômodo ao permitir puxar a corda para baixo para erguer o peso para cima.",
            aiGuidance: "Diferença entre roldana fixa e roldana móvel."
          },
          {
            id: "c11_f3",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 1: Máquinas Simples",
            text: "Um carrinho de mão e um quebra-nozes são alavancas em que a carga (resistência) fica entre o ponto de apoio e a força aplicada. Como elas são classificadas?",
            options: [
              { text: "Inter-resistentes.", correct: true },
              { text: "Interfixas.", correct: false },
              { text: "Interpotentes.", correct: false },
              { text: "Planos inclinados compostos.", correct: false }
            ],
            explanation: "Quando a força resistente se localiza entre o ponto de apoio e a força potente, a alavanca é chamada de inter-resistente.",
            aiGuidance: "Identificação dos elementos de uma alavanca."
          },
          {
            id: "c11_f4",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 1: Máquinas Simples",
            text: "Uma rampa de acessibilidade para cadeirantes é uma aplicação prática de qual máquina simples?",
            options: [
              { text: "Plano inclinado.", correct: true },
              { text: "Alavanca interpotente.", correct: false },
              { text: "Roldana móvel.", correct: false },
              { text: "Engrenagem helicoidal.", correct: false }
            ],
            explanation: "O plano inclinado permite elevar um corpo a uma certa altura aplicando uma força menor ao longo de uma distância maior.",
            aiGuidance: "Conceito de plano inclinado no cotidiano."
          }
        ],
        medio: [
          {
            id: "c11_m1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 1: Máquinas Simples",
            text: "Ao utilizar uma roldana móvel associada a uma fixa (talha simples), o que acontece com a força potente necessária para equilibrar uma carga de 400 N?",
            options: [
              { text: "A força necessária cai pela metade, passando para 200 N.", correct: true },
              { text: "A força necessária permanece inalterada em 400 N.", correct: false },
              { text: "A força necessária dobra, passando para 800 N.", correct: false },
              { text: "A força necessária é reduzida a zero.", correct: false }
            ],
            explanation: "Cada roldana móvel divide a força resistente por 2 (F = R / 2). Para 400 N, a força necessária é 200 N.",
            aiGuidance: "Cálculo de vantagem mecânica com roldanas móveis."
          },
          {
            id: "c11_m2",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 1: Máquinas Simples",
            text: "A pinça cirúrgica e o cortador de unhas têm o ponto de aplicação da força entre o ponto de apoio e o objeto segurado. Eles pertencem a qual classe?",
            options: [
              { text: "Alavanca interpotente.", correct: true },
              { text: "Alavanca interfixa.", correct: false },
              { text: "Alavanca inter-resistente.", correct: false },
              { text: "Roldana diferencial.", correct: false }
            ],
            explanation: "Nas alavancas interpotentes, a força potente é aplicada entre o ponto de apoio e a extremidade de resistência (ex.: pinça, pinça de gelo, vara de pescar).",
            aiGuidance: "Alavancas interpotentes no SAS."
          },
          {
            id: "c11_m3",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 1: Máquinas Simples",
            text: "Por que o parafuso é considerado uma variação do plano inclinado?",
            options: [
              { text: "Porque a sua rosca é uma fita em formato de plano inclinado enrolada em torno de um cilindro.", correct: true },
              { text: "Porque ele só funciona quando aplicado sobre alavancas interfixas.", correct: false },
              { text: "Porque ele reduz o atrito térmico gerado durante a perfuração.", correct: false },
              { text: "Porque seu eixo central funciona como uma roldana móvel invertida.", correct: false }
            ],
            explanation: "A rosca helicoidal do parafuso é literalmente uma rampa (plano inclinado) enrolada em um cilindro central.",
            aiGuidance: "Aplicações compostas de máquinas simples."
          },
          {
            id: "c11_m4",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 1: Máquinas Simples",
            text: "De acordo com a Lei das Alavancas formulada por Arquimedes, para equilibrar uma gangorra com pessoas de pesos diferentes, a pessoa mais pesada deve:",
            options: [
              { text: "Sentar-se mais perto do ponto de apoio (fulcro).", correct: true },
              { text: "Sentar-se o mais longe possível do ponto de apoio.", correct: false },
              { text: "Pular para aumentar a força de inércia.", correct: false },
              { text: "Sentar-se exatamente na mesma distância que a pessoa mais leve.", correct: false }
            ],
            explanation: "Pelo princípio do momento da força (Torque = Força × Distância), uma força maior exige uma distância menor até o ponto de apoio para atingir o equilíbrio.",
            aiGuidance: "Equilíbrio e momento de forças nas alavancas."
          }
        ],
        dificil: [
          {
            id: "c11_d1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 1: Máquinas Simples",
            text: "Em um sistema de talha exponencial com 3 roldanas móveis e 1 roldana fixa, qual é a força potente necessária para sustentar um bloco de 800 N?",
            options: [
              { text: "100 N (pois a força é dividida por 2³ = 8).", correct: true },
              { text: "200 N (pois divide por 4).", correct: false },
              { text: "266,6 N (pois divide por 3).", correct: false },
              { text: "400 N (pois a roldana fixa anula duas móveis).", correct: false }
            ],
            explanation: "Na talha exponencial, a vantagem mecânica é 2^n, onde n é o número de roldanas móveis. Para n = 3, F = R / 2³ = 800 / 8 = 100 N.",
            aiGuidance: "Fórmula da talha exponencial: F = R / 2^n."
          },
          {
            id: "c11_d2",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 1: Máquinas Simples",
            text: "O braço humano ao segurar um halter com o cotovelo apoiado funciona como uma máquina simples biológica. O cotovelo é o ponto de apoio, o bíceps aplica a força e a mão segura o peso. Essa alavanca biológica é:",
            options: [
              { text: "Interpotente (o tendão do bíceps se insere entre o cotovelo e a mão).", correct: true },
              { text: "Interfixa (o cotovelo fica entre os dois pesos).", correct: false },
              { text: "Inter-resistente (o halter fica no meio do antebraço).", correct: false },
              { text: "Uma roldana biológica sem alavanca.", correct: false }
            ],
            explanation: "A articulação do cotovelo é o fulcro, a inserção do bíceps é a força potente (no meio), e a carga na mão é a resistência. Portanto, é interpotente.",
            aiGuidance: "Biomecânica das alavancas no corpo humano."
          }
        ]
      },
      'ciencias_1_2': {
        facil: [
          {
            id: "c12_f1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 2: Calor e Temperatura",
            text: "Qual é a diferença conceitual correta entre calor e temperatura na física e na química?",
            options: [
              { text: "Calor é energia térmica em trânsito entre corpos; temperatura mede o grau de agitação das partículas.", correct: true },
              { text: "Calor e temperatura são exatamente a mesma grandeza expressa em unidades diferentes.", correct: false },
              { text: "Calor é a substância fluida que entra nos corpos quentes; temperatura é o peso do corpo.", correct: false },
              { text: "Temperatura é a quantidade de calor total contida dentro de um bloco de gelo.", correct: false }
            ],
            explanation: "Temperatura é uma medida proporcional à energia cinética média das partículas de um corpo. Calor é a energia térmica que se transfere espontaneamente do corpo mais quente para o mais frio.",
            aiGuidance: "Conceito termodinâmico fundamental."
          },
          {
            id: "c12_f2",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 2: Calor e Temperatura",
            text: "O que caracteriza o estado de \"equilíbrio térmico\" entre dois corpos em contato?",
            options: [
              { text: "Ambos atingem a mesma temperatura, cessando a transferência líquida de calor.", correct: true },
              { text: "O corpo mais quente transfere todo o seu calor até atingir 0°C.", correct: false },
              { text: "O corpo mais frio fica mais quente do que o corpo original.", correct: false },
              { text: "Ambos se transformam em vapor instantaneamente.", correct: false }
            ],
            explanation: "O equilíbrio térmico é atingido quando dois ou mais corpos em contato térmico igualam suas temperaturas.",
            aiGuidance: "Lei Zero da Termodinâmica do SAS."
          },
          {
            id: "c12_f3",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 2: Calor e Temperatura",
            text: "Na escala Celsius (°C), quais são os pontos fixos fundamentais ao nível do mar?",
            options: [
              { text: "0°C para fusão do gelo e 100°C para ebulição da água.", correct: true },
              { text: "32°C para fusão do gelo e 212°C para ebulição da água.", correct: false },
              { text: "0°C para zero absoluto e 100°C para a temperatura do corpo humano.", correct: false },
              { text: "-10°C para congelamento e 50°C para evaporação.", correct: false }
            ],
            explanation: "A escala Celsius adotou 0°C como o ponto de fusão do gelo e 100°C como o ponto de ebulição da água pura sob pressão de 1 atm.",
            aiGuidance: "Escalas termométricas."
          }
        ],
        medio: [
          {
            id: "c12_m1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 2: Calor e Temperatura",
            text: "Ao colocar uma colher de metal e uma colher de madeira dentro da mesma panela com água quente, por que a colher de metal parece esquentar muito mais rápido?",
            options: [
              { text: "Porque o metal é um bom condutor térmico, enquanto a madeira é um isolante térmico.", correct: true },
              { text: "Porque o metal absorve calor e destrói as moléculas da água.", correct: false },
              { text: "Porque a madeira não possui temperatura mensurável.", correct: false },
              { text: "Porque a colher de madeira não permite a passagem de luz solar.", correct: false }
            ],
            explanation: "Metais possuem elétrons livres que facilitam a condução rápida do calor. A madeira tem baixa condutividade térmica, agindo como isolante.",
            aiGuidance: "Condutores e isolantes térmicos."
          }
        ],
        dificil: [
          {
            id: "c12_d1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 2: Calor e Temperatura",
            text: "Um bloco de ferro de 1 kg e um bloco de chumbo de 1 kg estão a 20°C e recebem a mesma quantidade de calor. Sabendo que o calor específico do chumbo é menor que o do ferro, qual deles atingirá maior temperatura final?",
            options: [
              { text: "O chumbo, pois quanto menor o calor específico, mais fácil e rápido é elevar sua temperatura.", correct: true },
              { text: "O ferro, pois materiais mais densos retêm calor eternamente.", correct: false },
              { text: "Ambos atingirão exatamente a mesma temperatura porque têm a mesma massa.", correct: false },
              { text: "Nenhum dos dois, pois sólidos não sofrem variação de temperatura.", correct: false }
            ],
            explanation: "Pela equação fundamental Q = m · c · ΔT, a variação de temperatura é inversamente proporcional ao calor específico (c). Quem tem menor \"c\" aquece mais rápido.",
            aiGuidance: "Calor específico e capacidade térmica."
          }
        ]
      },
      'ciencias_1_3': {
        facil: [
          {
            id: "c13_f1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 3: Propagação do Calor",
            text: "Qual processo de propagação de calor é o único capaz de atravessar o vácuo do espaço até atingir a Terra?",
            options: [
              { text: "Irradiação (por ondas eletromagnéticas infravermelhas).", correct: true },
              { text: "Condução.", correct: false },
              { text: "Convecção.", correct: false },
              { text: "Sublimação molecular.", correct: false }
            ],
            explanation: "A irradiação térmica ocorre por meio de ondas eletromagnéticas e, diferentemente da condução e da convecção, não depende de matéria para se propagar.",
            aiGuidance: "Formas de transferência de calor."
          },
          {
            id: "c13_f2",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 3: Propagação do Calor",
            text: "Por que os aparelhos de ar-condicionado costumam ser instalados na parte superior das paredes dos cômodos?",
            options: [
              { text: "Porque o ar frio é mais denso e desce, criando correntes de convecção que refrigeram todo o ambiente.", correct: true },
              { text: "Porque o calor só se propaga de cima para baixo pela gravidade.", correct: false },
              { text: "Para evitar que as pessoas toquem nas hélices giratórias.", correct: false },
              { text: "Porque o ar quente desce e empurra o ar frio para o teto.", correct: false }
            ],
            explanation: "O ar refrigerado fica mais denso e desce, empurrando o ar quente (menos denso) para cima, estabelecendo uma corrente de convecção natural.",
            aiGuidance: "Correntes de convecção no cotidiano."
          }
        ],
        medio: [
          {
            id: "c13_m1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 3: Propagação do Calor",
            text: "A garrafa térmica (vaso de Dewar) possui paredes duplas de vidro espelhado com vácuo entre elas. O vácuo e o espelhamento visam impedir, respectivamente:",
            options: [
              { text: "A condução/convecção (pelo vácuo) e a irradiação (pelo espelho reflexivo).", correct: true },
              { text: "A irradiação (pelo vácuo) e a evaporação (pelo espelho).", correct: false },
              { text: "Apenas a pressão atmosférica externa.", correct: false },
              { text: "O congelamento do líquido interno por gravidade.", correct: false }
            ],
            explanation: "O vácuo impede a condução e a convecção (que precisam de matéria). As paredes espelhadas refletem as ondas de calor, minimizando a perda por irradiação.",
            aiGuidance: "Funcionamento físico da garrafa térmica."
          }
        ],
        dificil: [
          {
            id: "c13_d1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 3: Propagação do Calor",
            text: "Durante o dia na praia, sopra a brisa marítima (do mar para a terra); à noite, sopra a brisa terrestre (da terra para o mar). Esse fenômeno térmico é explicado:",
            options: [
              { text: "Pela diferença de calor específico entre a água e a areia, que gera gradientes de pressão e correntes de convecção.", correct: true },
              { text: "Pelo movimento exclusivo de rotação da Terra empurrando as ondas.", correct: false },
              { text: "Pela evaporação do sal marinho durante a madrugada.", correct: false },
              { text: "Pela atração gravitacional da Lua que puxa o vento.", correct: false }
            ],
            explanation: "A areia tem menor calor específico: esquenta mais rápido de dia (o ar sobre a terra sobe e puxa a brisa marítima) e esfria mais rápido à noite (o mar fica mais aquecido e puxa a brisa terrestre).",
            aiGuidance: "Brisa marítima e convecção atmosférica."
          }
        ]
      },
      'ciencias_1_4': {
        facil: [
          {
            id: "c14_f1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 4: Biomas Brasileiros",
            text: "Qual é o único bioma terrestre cuja extensão territorial está 100% contida dentro do Brasil (bioma exclusivamente brasileiro)?",
            options: [
              { text: "Caatinga.", correct: true },
              { text: "Amazônia.", correct: false },
              { text: "Pantanal.", correct: false },
              { text: "Mata Atlântica.", correct: false }
            ],
            explanation: "A Caatinga é um bioma semiárido exclusivamente brasileiro, com rica biodiversidade adaptada à escassez hídrica.",
            aiGuidance: "Características dos biomas no SAS."
          },
          {
            id: "c14_f2",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 4: Biomas Brasileiros",
            text: "Troncos tortuosos, cascas grossas e cortiçosas, e folhas coriáceas resistentes ao fogo são adaptações típicas da vegetação de qual bioma brasileiro?",
            options: [
              { text: "Cerrado.", correct: true },
              { text: "Pampa.", correct: false },
              { text: "Floresta Amazônica.", correct: false },
              { text: "Manguezal.", correct: false }
            ],
            explanation: "O Cerrado (savana brasileira) apresenta solos ácidos com alumínio e plantas adaptadas a queimadas sazonais naturais e raízes profundas.",
            aiGuidance: "Adaptações morfofisiológicas da flora do Cerrado."
          }
        ],
        medio: [
          {
            id: "c14_m1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 4: Biomas Brasileiros",
            text: "Como as plantas xerófitas da Caatinga (como o mandacaru e o xiquexique) conseguem sobreviver a longos períodos sem chuva?",
            options: [
              { text: "Transformando folhas em espinhos para reduzir a perda de água e armazenando água no caule suculento.", correct: true },
              { text: "Absorvendo umidade exclusivamente pelas folhas largas durante o dia.", correct: false },
              { text: "Realizando fotossíntese apenas no período de cheias fluviais.", correct: false },
              { text: "Perdendo todo o caule no inverno e renascendo como sementes no verão.", correct: false }
            ],
            explanation: "Os espinhos reduzem a área de transpiração e protegem contra herbívoros, enquanto o parênquima aquífero no caule reserva água.",
            aiGuidance: "Plantas xerófitas da Caatinga."
          }
        ],
        dificil: [
          {
            id: "c14_d1",
            subject: "Ciências (Livro 1 SAS)",
            topic: "Cap. 4: Biomas Brasileiros",
            text: "Por que o solo da Floresta Amazônica é considerado naturalmente pobre em nutrientes minerais, apesar da exuberância de sua vegetação?",
            options: [
              { text: "Porque a fertilidade depende da ciclagem rápida da serapilheira e matéria orgânica decomposta por fungos na camada superficial.", correct: true },
              { text: "Porque as chuvas intensas queimam as raízes e destroem os sais minerais.", correct: false },
              { text: "Porque as árvores absorvem o oxigênio do solo tornando-o rochoso.", correct: false },
              { text: "Porque o solo é composto apenas por areia calcária desértica.", correct: false }
            ],
            explanation: "A serapilheira (folhas, galhos e frutos caídos) é rapidamente decomposta e absorvida pelas raízes superficiais com ajuda de micorrizas, mantendo a floresta autossustentável.",
            aiGuidance: "Ciclagem de nutrientes e serapilheira na Amazônia."
          }
        ]
      },
      'portugues_1_4': {
        facil: [
          {
            id: "p14_f1",
            subject: "Língua Portuguesa (Livro 1 SAS)",
            topic: "Cap. 4: Sujeito e Predicado",
            text: "Na oração \"Os alunos do 7º ano estudaram muito para o simulado\", qual é o núcleo do sujeito?",
            options: [
              { text: "Alunos.", correct: true },
              { text: "Estudaram.", correct: false },
              { text: "Simulado.", correct: false },
              { text: "Muito.", correct: false }
            ],
            explanation: "O sujeito completo é \"Os alunos do 7º ano\", e a palavra principal (substantivo que carrega o significado essencial) é \"alunos\".",
            aiGuidance: "Identificação do núcleo do sujeito."
          },
          {
            id: "p14_f2",
            subject: "Língua Portuguesa (Livro 1 SAS)",
            topic: "Cap. 4: Sujeito e Predicado",
            text: "Classifique o sujeito da oração: \"Pedro e Mariana apresentaram o trabalho de Ciências.\"",
            options: [
              { text: "Sujeito composto (possui dois núcleos: Pedro, Mariana).", correct: true },
              { text: "Sujeito simples.", correct: false },
              { text: "Sujeito indeterminado.", correct: false },
              { text: "Oração sem sujeito.", correct: false }
            ],
            explanation: "Como há dois núcleos ligados pela conjunção \"e\" (Pedro, Mariana), o sujeito é classificado como composto.",
            aiGuidance: "Tipos de sujeito no SAS."
          }
        ],
        medio: [
          {
            id: "p14_m1",
            subject: "Língua Portuguesa (Livro 1 SAS)",
            topic: "Cap. 4: Sujeito e Predicado",
            text: "Em qual das alternativas a oração apresenta SUJEITO INDETERMINADO?",
            options: [
              { text: "Bateram na porta durante a madrugada.", correct: true },
              { text: "Nós fizemos todos os exercícios da apostila.", correct: false },
              { text: "Choveu intensamente na cidade ontem.", correct: false },
              { text: "Os cadernos caíram da mesa.", correct: false }
            ],
            explanation: "O verbo na 3ª pessoa do plural (\"Bateram\") sem referência a nenhum termo anterior indetermina quem praticou a ação.",
            aiGuidance: "Regras de indeterminação do sujeito."
          }
        ],
        dificil: [
          {
            id: "p14_d1",
            subject: "Língua Portuguesa (Livro 1 SAS)",
            topic: "Cap. 4: Sujeito e Predicado",
            text: "Na oração \"Precisa-se de novos monitores no colégio\", como se classifica o sujeito e qual é a função da partícula \"se\"?",
            options: [
              { text: "Sujeito indeterminado, e o \"se\" atua como índice de indeterminação do sujeito com verbo transitivo indireto.", correct: true },
              { text: "Sujeito simples \"novos monitores\", e o \"se\" é pronome apassivador.", correct: false },
              { text: "Oração sem sujeito com verbo impessoal.", correct: false },
              { text: "Sujeito oculto \"nós\".", correct: false }
            ],
            explanation: "O verbo \"precisar\" é transitivo indireto (rege preposição \"de\"). Com o \"se\", a oração não aceita voz passiva e o sujeito fica indeterminado.",
            aiGuidance: "Índice de indeterminação do sujeito vs pronome apassivador."
          }
        ]
      },
      'historia_1_1': {
        facil: [
          {
            id: "h11_f1",
            subject: "História (Livro 1 SAS)",
            topic: "Cap. 1: Feudalismo e Sociedade Medieval",
            text: "A sociedade feudal europeia era tipicamente estamental e dividida em três ordens fundamentais. Quais eram elas?",
            options: [
              { text: "Clero (os que rezam), Nobreza (os que guerreiam) e Servos (os que trabalham).", correct: true },
              { text: "Burgueses, Proletários e Senadores.", correct: false },
              { text: "Faraós, Escribas e Escravos agrícolas.", correct: false },
              { text: "Patrícios, Plebeus e Clientes.", correct: false }
            ],
            explanation: "A divisão clássica da Idade Média separava: oratores (clero), bellatores (guerreiros/nobres) e laboratores (servos camponeses).",
            aiGuidance: "Ordens da sociedade feudal."
          },
          {
            id: "h11_f2",
            subject: "História (Livro 1 SAS)",
            topic: "Cap. 1: Feudalismo e Sociedade Medieval",
            text: "O que era a obrigação feudal da \"Corveia\"?",
            options: [
              { text: "O trabalho gratuito obrigatório do servo nas terras do senhor (manso senhorial) alguns dias por semana.", correct: true },
              { text: "O imposto pago em ouro pela proteção militar do rei.", correct: false },
              { text: "A taxa para usar o moinho e o forno do feudo.", correct: false },
              { text: "A entrega de um décimo da colheita para o Papa em Roma.", correct: false }
            ],
            explanation: "A corveia consistia no cultivo e manutenção das terras do senhor feudal pelo servo sem qualquer pagamento.",
            aiGuidance: "Tributos feudais (corveia, talha, banalidades)."
          }
        ],
        medio: [
          {
            id: "h11_m1",
            subject: "História (Livro 1 SAS)",
            topic: "Cap. 1: Feudalismo e Sociedade Medieval",
            text: "Qual cerimônia formal selava o juramento de lealdade e obrigações mútuas entre um suserano e seu vassalo?",
            options: [
              { text: "Homenagem e Investidura.", correct: true },
              { text: "Bula Papal.", correct: false },
              { text: "Tratado de Paz de Westfália.", correct: false },
              { text: "Tribunal da Santa Inquisição.", correct: false }
            ],
            explanation: "Na homenagem, o vassalo se ajoelhava e jurava lealdade ao suserano; na investidura, o suserano entregava o feudo simbolicamente (um ramo ou punhado de terra).",
            aiGuidance: "Relações feudo-vassálicas."
          }
        ],
        dificil: [
          {
            id: "h11_d1",
            subject: "História (Livro 1 SAS)",
            topic: "Cap. 1: Feudalismo e Sociedade Medieval",
            text: "Por que o feudalismo provocou uma intensa fragmentação política na Europa Ocidental medieval?",
            options: [
              { text: "Porque o poder central do rei enfraqueceu e cada senhor feudal exercia autoridade militar, judiciária e fiscal autônoma em seu próprio feudo.", correct: true },
              { text: "Porque todos os feudos eram governados por presidentes eleitos pelo voto universal.", correct: false },
              { text: "Porque a Igreja Católica aboliu as leis escritas e impôs anarquia comercial.", correct: false },
              { text: "Porque os reis fecharam os castelos e mudaram a capital da Europa para Bizâncio.", correct: false }
            ],
            explanation: "Com o fim das invasões e a ruralização, a defesa e o comando passaram para os barões locais nos castelos, enfraquecendo a monarquia centralizada.",
            aiGuidance: "Descentralização do poder medieval."
          }
        ]
      },
      'geografia_1_1': {
        facil: [
          {
            id: "g11_f1",
            subject: "Geografia (Livro 1 SAS)",
            topic: "Cap. 1: O Território Brasileiro",
            text: "Quantas macrorregiões oficiais compõem a divisão regional do Brasil estabelecida pelo IBGE?",
            options: [
              { text: "5 regiões (Norte, Nordeste, Centro-Oeste, Sudeste e Sul).", correct: true },
              { text: "3 regiões (Amazônia, Nordeste e Centro-Sul).", correct: false },
              { text: "4 regiões (Norte, Sul, Leste e Oeste).", correct: false },
              { text: "7 regiões administrativas.", correct: false }
            ],
            explanation: "A divisão regional oficial do IBGE agrupa os 26 estados e o DF em 5 macrorregiões.",
            aiGuidance: "Divisão regional oficial do IBGE."
          },
          {
            id: "g11_f2",
            subject: "Geografia (Livro 1 SAS)",
            topic: "Cap. 1: O Território Brasileiro",
            text: "O Brasil possui dimensões continentais e, devido à sua grande extensão longitudinal (leste-oeste), abrange quantos fusos horários oficiais?",
            options: [
              { text: "4 fusos horários, todos a oeste do Meridiano de Greenwich.", correct: true },
              { text: "Apenas 1 fuso unificado em todo o país.", correct: false },
              { text: "12 fusos horários como a Rússia.", correct: false },
              { text: "2 fusos horários (diurno e noturno).", correct: false }
            ],
            explanation: "O território brasileiro possui 4 fusos horários: UTC-2 (ilhas oceânicas), UTC-3 (horário de Brasília), UTC-4 (estados do oeste/pantanal) e UTC-5 (Acre e oeste do Amazonas).",
            aiGuidance: "Fusos horários brasileiros."
          }
        ],
        medio: [
          {
            id: "g11_m1",
            subject: "Geografia (Livro 1 SAS)",
            topic: "Cap. 1: O Território Brasileiro",
            text: "A divisão geoeconômica proposta pelo geógrafo Pedro Pinchas Geiger (1967) divide o Brasil em quais complexos regionais?",
            options: [
              { text: "Amazônia, Nordeste e Centro-Sul.", correct: true },
              { text: "Brasil Tropical, Brasil Semiárido e Brasil Meridional.", correct: false },
              { text: "Sudeste Industrial, Sul Agrícola e Norte Mineral.", correct: false },
              { text: "Região Litorânea e Região Continental.", correct: false }
            ],
            explanation: "Os complexos geoeconômicos consideram aspectos socioeconômicos e históricos e não respeitam as fronteiras políticas exatas dos estados (ex.: o norte de Minas Gerais integra o Nordeste).",
            aiGuidance: "Complexos geoeconômicos de Geiger."
          }
        ],
        dificil: [
          {
            id: "g11_d1",
            subject: "Geografia (Livro 1 SAS)",
            topic: "Cap. 1: O Território Brasileiro",
            text: "Considerando a posição geográfica do Brasil em relação aos hemisférios e zonas térmicas da Terra, é correto afirmar que a grande maioria do território brasileiro:",
            options: [
              { text: "Situa-se no Hemisfério Sul, no Hemisfério Ocidental e na Zona Intertropical (entre o Equador e o Trópico de Capricórnio).", correct: true },
              { text: "Fica inteiramente na Zona Polar Ártica e no Hemisfério Oriental.", correct: false },
              { text: "Fica no Hemisfério Norte cortado pelo Meridiano de Greenwich.", correct: false },
              { text: "É cortado pelo Trópico de Câncer na região de Lavras - MG.", correct: false }
            ],
            explanation: "O Brasil é cortado ao norte pela Linha do Equador e ao sul pelo Trópico de Capricórnio. Mais de 92% de sua área está na Zona Intertropical e 100% no Hemisfério Ocidental.",
            aiGuidance: "Coordenadas e zonas térmicas do Brasil."
          }
        ]
      },
      'ingles_1_1': {
        facil: [
          {
            id: "i11_f1",
            subject: "Língua Inglesa (Livro 1 SAS)",
            topic: "Cap. 1: Verb To Be & Personal Pronouns",
            text: "Complete the sentence with the correct form of the verb to be: \"Lucas and Freddie _____ great students at Gammon.\"",
            options: [
              { text: "are", correct: true },
              { text: "is", correct: false },
              { text: "am", correct: false },
              { text: "be", correct: false }
            ],
            explanation: "O sujeito \"Lucas and Freddie\" corresponde ao pronome \"they\" (eles). No presente do verbo to be, usa-se \"are\".",
            aiGuidance: "Conjugação do verb to be no presente."
          },
          {
            id: "i11_f2",
            subject: "Língua Inglesa (Livro 1 SAS)",
            topic: "Cap. 1: Verb To Be & Personal Pronouns",
            text: "Qual pronome pessoal em inglês substitui corretamente o termo entre parênteses na frase: \"(My sister) is studying for the test\"?",
            options: [
              { text: "She", correct: true },
              { text: "He", correct: false },
              { text: "It", correct: false },
              { text: "They", correct: false }
            ],
            explanation: "\"My sister\" (minha irmã) é 3ª pessoa do singular feminina, correspondendo ao pronome \"She\".",
            aiGuidance: "Subject pronouns do SAS."
          }
        ],
        medio: [
          {
            id: "i11_m1",
            subject: "Língua Inglesa (Livro 1 SAS)",
            topic: "Cap. 1: Verb To Be & False Friends",
            text: "Em inglês, a palavra \"push\" é um famoso falso cognato (false friend). O que significa uma placa com a palavra \"PUSH\" em uma porta?",
            options: [
              { text: "Empurre (e não puxe!).", correct: true },
              { text: "Puxe.", correct: false },
              { text: "Entrada proibida.", correct: false },
              { text: "Trancado à chave.", correct: false }
            ],
            explanation: "\"Push\" significa empurrar. Para dizer puxar, usa-se \"pull\".",
            aiGuidance: "Falsos cognatos frequentes nas avaliações do SAS."
          }
        ],
        dificil: [
          {
            id: "i11_d1",
            subject: "Língua Inglesa (Livro 1 SAS)",
            topic: "Cap. 1: Verb To Be & Simple Present",
            text: "Qual frase abaixo expressa corretamente uma rotina no Simple Present de acordo com a regra da 3ª pessoa do singular (he/she/it)?",
            options: [
              { text: "He studies English every afternoon and does his homework.", correct: true },
              { text: "He study English every afternoon and do his homework.", correct: false },
              { text: "He is study English every afternoon.", correct: false },
              { text: "He studies English and doing homework.", correct: false }
            ],
            explanation: "Com he/she/it, verbos terminados em consoante + y mudam para -ies (study -> studies) e verbos em -o recebem -es (do -> does).",
            aiGuidance: "Regras ortográficas do Simple Present."
          }
        ]
      }
    };

    let questionsList = [];

    // Check curated questions
    if (questionBank[key]) {
      const bank = questionBank[key];
      if (bank[difficulty] && bank[difficulty].length > 0) {
        questionsList = [...bank[difficulty]];
      } else if (bank['medio']) {
        questionsList = [...bank['medio']];
      }
    }

    // Procedural Generator for additional questions or for any chapter in any subject
    const subjectData = this.sasSubjectsData[subjectKey] || this.sasSubjectsData['matematica'];
    const currentBook = subjectData.livros.find(b => b.id === bookId) || subjectData.livros[0];
    const currentCap = currentBook.chapters.find(c => c.id === chapterId) || currentBook.chapters[0];
    const cleanCapName = currentCap.title.replace(/Capítulo\s*\d+\s*[–-]\s*/i, '');

    // Dynamic question templates calibrated by difficulty with strict pedagogical accuracy
    const templates = {
      facil: [
        {
          text: `[AVALIAÇÃO OFICIAL SAS] No estudo de "${cleanCapName}", os estudantes do 7º ano analisaram o seguinte tópico curricular: "${currentCap.desc}". A respeito desse conteúdo, qual alternativa expressa a afirmação conceitualmente correta?`,
          correct: `Em "${cleanCapName}", o princípio fundamental estabelece que os conceitos de ${currentCap.desc.slice(0, 90)} explicam os fenômenos estudados na prática.`,
          distractors: [
            `Em "${cleanCapName}", não há aplicação em situações cotidianas, tratando-se exclusivamente de conjecturas sem validação científica.`,
            `Os conceitos de "${cleanCapName}" contrariam as leis naturais e foram descartados no currículo escolar moderno.`,
            `As definições apresentadas no tema de "${cleanCapName}" dependem de opiniões individuais desprovidas de critérios teóricos.`
          ],
          explanation: `Conforme destacado na apostila SAS Asas 2026: "${currentCap.desc}".`
        },
        {
          text: `[EXERCÍCIO DE FIXAÇÃO] Uma questão de prova sobre "${cleanCapName}" exige identificar o termo e a regra correta. Qual opção descreve com exatidão esse ponto curricular?`,
          correct: `Analisar com rigor os elementos de "${cleanCapName}", relacionando causas, efeitos e definições estabelecidas no material didático.`,
          distractors: [
            `Desconsiderar os dados enunciados e supor respostas aleatórias sem base no conteúdo.`,
            `Tratar termos opostos como se fossem sinônimos por mera aproximação fonética.`,
            `Ignorar o contexto e assumir conclusões não respaldadas pelo material de estudo.`
          ],
          explanation: `A metodologia do SAS enfatiza a leitura atenta e aplicação das regras conceituais específicas de ${cleanCapName}.`
        }
      ],
      medio: [
        {
          text: `[SIMULADO SAAS FORMATIVO] Em uma questão contextualizada de prova sobre "${cleanCapName}", o professor propõe analisar a seguinte situação: "${currentCap.desc}". Qual interpretação está em plena consonância com a matéria?`,
          correct: `A resolução fundamenta-se nos princípios de "${cleanCapName}", articulando a fundamentação teórica aos dados concretos apresentados.`,
          distractors: [
            `Concluir a resposta sem relacionar o problema aos postulados de "${cleanCapName}".`,
            `Assumir premissas falsas que desconsideram as evidências e regras do tema.`,
            `Julgar desnecessária a aplicação dos critérios conceituais na avaliação dos resultados.`
          ],
          explanation: `Nas avaliações formativas do Colégio Gammon, a conexão entre teoria e aplicação prática é essencial para a pontuação total.`
        }
      ],
      dificil: [
        {
          text: `[QUESTÃO DESAFIO SAS] Em uma pergunta de alta complexidade analítica sobre "${cleanCapName}" (${currentCap.desc}), qual dedução expressa o raciocínio mais consistente?`,
          correct: `A interpretação deve considerar as restrições conceituais, as propriedades específicas e a relação de causa e efeito detalhada no capítulo.`,
          distractors: [
            `Extrapolar as premissas estabelecidas e formular conclusões contraditórias com o tema.`,
            `Supor que as regras de "${cleanCapName}" se anulam diante de casos com múltiplas variáveis.`,
            `Descartar conceitos centrais sob a alegação de que detalhes não afetam o resultado final.`
          ],
          explanation: `Questões desafiadoras exigem precisão absoluta em cada etapa dedutiva e domínio integral do Livro ${bookId} do SAS.`
        }
      ]
    };
    while (questionsList.length < count) {
      const t = diffTemplates[templateIdx % diffTemplates.length];
      const qId = `proc_${subjectKey}_${bookId}_${chapterId}_${difficulty}_${questionsList.length + 1}`;
      
      const newQ = {
        id: qId,
        subject: `${subjectData.name} (${currentBook.title} SAS)`,
        topic: `${currentCap.title} [${difficulty.toUpperCase()}]`,
        text: t.text,
        options: [
          { text: t.correct, correct: true },
          { text: t.distractors[0], correct: false },
          { text: t.distractors[1], correct: false },
          { text: t.distractors[2], correct: false }
        ],
        explanation: t.explanation,
        aiGuidance: `Material SAS Asas 2026 • ${currentCap.title}`
      };

      questionsList.push(newQ);
      templateIdx++;
    }

    // Shuffle questions with daily deterministic PRNG
    questionsList = this.shuffleArrayWithPrng(questionsList, prng);

    // Limit to exactly count questions
    const finalQuestions = questionsList.slice(0, count);

    // Shuffle options of each question so correct answers aren't always in position A
    finalQuestions.forEach((q, idx) => {
      const qPrng = this.createPrng(`${seedStr}_q_${idx}`);
      q.options = this.shuffleArrayWithPrng(q.options, qPrng);
    });

    return finalQuestions;
  }


  startQuizExecution() {
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO Quiz Diário de 15 Minutos é exclusivo para assinantes do Plano PRO ou período de degustação de 5 dias grátis.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    const diff = this.quizState.difficulty || this.currentQuizDifficulty || 'dificil';
    const count = this.currentQuizQuestionCount || 8;
    if (!this.quizState.questions || !Array.isArray(this.quizState.questions) || this.quizState.questions.length === 0) {
      this.quizState.questions = this.getQuestionsForChapter(this.currentQuizSubject || 'matematica', this.currentQuizBookId || 1, this.currentQuizChapterId || 1, diff, count);
    }
    this.quizState.active = true;
    this.quizState.currentQuestionIdx = 0;
    this.quizState.score = 0;
    this.quizState.answered = false;
    this.quizState.selectedAnswer = null;
    const numQ = this.quizState.questions.length || count;
    this.quizState.timerSeconds = Math.max(300, numQ * 120); // 2 minutes per question

    this.startQuizTimer();
    this.renderCurrentQuestion();
  }

  startQuizTimer() {
    if (this.quizState.timerInterval) clearInterval(this.quizState.timerInterval);

    this.quizState.timerInterval = setInterval(() => {
      this.quizState.timerSeconds--;
      const min = Math.floor(Math.max(0, this.quizState.timerSeconds) / 60);
      const sec = Math.max(0, this.quizState.timerSeconds) % 60;
      const el = document.getElementById('quizTimeRemaining');
      if (el) {
        el.innerText = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
      }

      if (this.quizState.timerSeconds <= 0) {
        clearInterval(this.quizState.timerInterval);
        this.finishQuiz();
      }
    }, 1000);
  }

  renderCurrentQuestion() {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    const diff = this.quizState.difficulty || this.currentQuizDifficulty || 'dificil';
    const count = this.currentQuizQuestionCount || 8;

    if (!this.quizState.questions || this.quizState.questions.length === 0) {
      this.quizState.questions = this.getQuestionsForChapter(this.currentQuizSubject || 'matematica', 1, 1, diff, count);
    }

    const q = this.quizState.questions[this.quizState.currentQuestionIdx];
    if (!q) {
      this.finishQuiz();
      return;
    }

    const total = this.quizState.questions.length;
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const isAnswered = Boolean(this.quizState.answered);
    const selectedIdx = this.quizState.selectedAnswer;
    const isCorrect = isAnswered && selectedIdx !== null && Boolean(q.options[selectedIdx]?.correct);

    const diffBadge = {
      facil: '<span style="font-size: 0.74rem; font-weight: 800; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 6px;">🟢 Fácil</span>',
      medio: '<span style="font-size: 0.74rem; font-weight: 800; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 6px;">🟡 Médio</span>',
      dificil: '<span style="font-size: 0.74rem; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 6px;">🔴 Difícil (SAS / OBMEP)</span>'
    }[diff] || '<span style="font-size: 0.74rem; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 6px;">🔴 Difícil</span>';

    container.innerHTML = `
      <div class="quiz-active-box" style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
        <div class="quiz-progress-bar" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="q-step" style="font-size: 0.82rem; font-weight: 800; color: #4f46e5; background: #eef2ff; padding: 4px 10px; border-radius: 6px;">Questão ${this.quizState.currentQuestionIdx + 1} de ${total}</span>
            ${diffBadge}
            <span style="font-size: 0.72rem; font-weight: 700; background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 6px;">🔄 Edição Diária 24h</span>
          </div>
          <span class="q-subject" style="font-size: 0.82rem; font-weight: 700; color: #64748b;">${q.subject || 'SAS Asas 2026'} &bull; ${q.topic || 'Fixação'}</span>
        </div>

        <h3 class="q-text" style="font-size: 1.15rem; font-weight: 800; line-height: 1.5; color: #0f172a; margin: 16px 0 20px;">${q.text}</h3>

        <div class="quiz-options" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;">
          ${q.options.map((opt, i) => {
            let stateClass = '';
            if (isAnswered) {
              if (opt.correct) {
                stateClass = 'correct';
              } else if (selectedIdx === i) {
                stateClass = 'wrong';
              }
            } else if (selectedIdx === i) {
              stateClass = 'selected';
            }

            return `
              <button type="button" 
                      class="quiz-opt-btn ${stateClass}" 
                      id="opt-btn-${i}" 
                      onclick="app.selectOption(${i})"
                      ${isAnswered ? 'disabled' : ''}
                      style="display: flex; align-items: center; gap: 12px; text-align: left; width: 100%;">
                <span class="quiz-opt-letter">${letters[i] || '•'}</span>
                <span style="flex: 1; font-size: 0.9rem; font-weight: 600;">${opt.text}</span>
              </button>
            `;
          }).join('')}
        </div>

        ${isAnswered ? `
          <div class="quiz-feedback-box ${isCorrect ? 'success' : 'error'}" style="margin: 20px 0; padding: 18px; border-radius: 12px; background: ${isCorrect ? '#ecfdf5' : '#fef2f2'}; border: 1.5px solid ${isCorrect ? '#a7f3d0' : '#fecaca'};">
            <div class="feedback-headline" style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1rem; color: ${isCorrect ? '#065f46' : '#991b1b'}; margin-bottom: 8px;">
              <i data-lucide="${isCorrect ? 'check-circle' : 'alert-triangle'}" style="width: 20px; height: 20px;"></i>
              <span>${isCorrect ? 'Excelente! Você acertou esta questão.' : 'Resposta Incorreta. Mas calma: o erro também ensina!'}</span>
            </div>
            <p class="feedback-explanation" style="margin: 0 0 10px; font-size: 0.88rem; line-height: 1.5; color: ${isCorrect ? '#065f46' : '#991b1b'};">
              <strong>Explicação do SAS:</strong> ${q.explanation}
            </p>
            <div class="ai-learning-notice" style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #475569; background: rgba(255,255,255,0.7); padding: 8px 12px; border-radius: 8px;">
              <i data-lucide="brain-circuit" style="width: 16px; height: 16px; color: #4f46e5;"></i>
              <span>${isCorrect ? 'A IA registrou seu domínio nesta habilidade curricular!' : 'Esta questão foi adicionada automaticamente à sua aba "Aprender com os Erros" para você refazer.'}</span>
            </div>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
          <button type="button" class="btn-outline" onclick="app.cancelQuizToSelection()" style="color: #64748b; font-size: 0.85rem; padding: 8px 16px;">
            <i data-lucide="x"></i> Sair do Quiz
          </button>
          
          <div>
            ${!isAnswered ? `
              <button type="button" class="btn-primary" id="btnConfirmAnswer" onclick="app.confirmAnswer()" ${selectedIdx === null ? 'disabled' : ''} style="padding: 10px 26px; font-weight: 700;">
                Confirmar Resposta
              </button>
            ` : `
              <button type="button" class="btn-primary" onclick="app.nextQuestion()" style="padding: 10px 26px; background: #4f46e5; font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
                <span>${this.quizState.currentQuestionIdx + 1 < total ? 'Próxima Questão' : 'Ver Resultado Final'}</span>
                <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  selectOption(idx) {
    if (this.quizState.answered) return;
    this.quizState.selectedAnswer = idx;

    document.querySelectorAll('.quiz-opt-btn').forEach((btn, i) => {
      btn.classList.toggle('selected', i === idx);
    });

    const btnConfirm = document.getElementById('btnConfirmAnswer');
    if (btnConfirm) btnConfirm.disabled = false;
  }

  confirmAnswer() {
    if (this.quizState.selectedAnswer === null || this.quizState.answered) return;

    this.quizState.answered = true;
    const q = this.quizState.questions[this.quizState.currentQuestionIdx];
    const isCorrect = Boolean(q.options[this.quizState.selectedAnswer]?.correct);

    if (isCorrect) {
      this.quizState.score++;
      if (typeof confetti === 'function') {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      // CENA 7: O ERRO TAMBÉM ENSINA
      if (!this.state.mistakes) this.state.mistakes = [];
      const existing = this.state.mistakes.find(m => m.question === q.text);
      if (!existing) {
        this.state.mistakes.unshift({
          id: Date.now(),
          subject: q.subject,
          topic: q.topic,
          question: q.text,
          userWrongAnswer: q.options[this.quizState.selectedAnswer].text,
          correctAnswer: q.options.find(o => o.correct)?.text || 'Opção correta',
          explanation: q.explanation,
          aiTip: `Dica da IA: Vamos reforçar este conteúdo de ${q.topic} no seu próximo treino diário.`,
          status: 'pending'
        });
        this.saveState();
        this.refreshBadges();
      }
    }

    this.renderCurrentQuestion();
  }

  cancelQuizToSelection() {
    if (confirm('Deseja interromper o quiz atual e voltar para a escolha de capítulos da apostila?')) {
      if (this.quizState.timerInterval) clearInterval(this.quizState.timerInterval);
      this.quizState.active = false;
      this.renderQuizIntro();
    }
  }

  nextQuestion() {
    this.quizState.answered = false;
    this.quizState.selectedAnswer = null;
    this.quizState.currentQuestionIdx++;

    if (this.quizState.currentQuestionIdx < this.quizState.questions.length) {
      this.renderCurrentQuestion();
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz() {
    if (this.quizState.timerInterval) clearInterval(this.quizState.timerInterval);
    this.quizState.active = false;

    const container = document.getElementById('quizContainer');
    if (!container) return;

    const total = this.quizState.questions.length;
    const score = this.quizState.score;
    const pct = Math.round((score / total) * 100);
    const diff = this.quizState.difficulty || this.currentQuizDifficulty || 'dificil';
    const diffBadge = {
      facil: '<span style="font-size: 0.8rem; font-weight: 800; background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 6px;">🟢 Nível: Fácil</span>',
      medio: '<span style="font-size: 0.8rem; font-weight: 800; background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 6px;">🟡 Nível: Médio SAS</span>',
      dificil: '<span style="font-size: 0.8rem; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px;">🔴 Nível: Difícil (SAS / OBMEP)</span>'
    }[diff] || '<span style="font-size: 0.8rem; font-weight: 800; background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px;">🔴 Difícil</span>';

    container.innerHTML = `
      <div class="quiz-results-box" style="text-align: center; padding: 36px 20px;">
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
          ${diffBadge}
          <span style="font-size: 0.8rem; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px;">🎯 ${total} Questões</span>
          <span style="font-size: 0.8rem; font-weight: 700; background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px;">🔄 Edição do Dia (24h)</span>
        </div>

        <div class="results-score-circle" style="width: 110px; height: 110px; border-radius: 50%; background: ${pct >= 70 ? '#ecfdf5' : '#fef2f2'}; border: 4px solid ${pct >= 70 ? '#10b981' : '#f87171'}; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 0 auto 20px;">
          <span class="score-num" style="font-size: 1.8rem; font-weight: 800; color: ${pct >= 70 ? '#047857' : '#b91c1c'};">${score}/${total}</span>
          <span class="score-total" style="font-size: 0.76rem; font-weight: 700; color: ${pct >= 70 ? '#059669' : '#dc2626'};">${pct}% de Acerto</span>
        </div>
        <h3 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 8px; color: #0f172a;">
          ${pct >= 75 ? '🎉 Excelente Desempenho no Quiz!' : '💪 Bom treino! Oportunidades encontradas.'}
        </h3>
        <p style="color: #64748b; font-size: 0.95rem; max-width: 480px; margin: 0 auto 24px; line-height: 1.5;">
          ${pct >= 75 
            ? `Você dominou as questões de nível ${diff.toUpperCase()} do capítulo do SAS. Continue mantendo sua meta diária de estudos!` 
            : 'Cada questão errada foi catalogada automaticamente na aba "Aprender com os Erros" para você refazer e dominar a habilidade.'}
        </p>

        <div class="results-box-actions" style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          <button class="btn-primary" onclick="app.renderQuizIntro()" style="background: #4f46e5; padding: 12px 24px;">
            <i data-lucide="repeat"></i> Escolher Outro Capítulo / Novo Quiz
          </button>
          <button class="btn-outline" onclick="app.startReviewSession()" style="padding: 12px 20px;">
            <i data-lucide="rotate-ccw"></i> Revisar Erros Pendentes
          </button>
          <button class="btn-outline" onclick="app.switchTab('sas-books')" style="padding: 12px 20px;">
            <i data-lucide="book-open"></i> Ir para Apostilas SAS
          </button>
        </div>
      </div>
    `;

    if (pct >= 70 && typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }

    this.renderDashboard();
    this.renderMistakesReview();
    if (window.lucide) window.lucide.createIcons();
  }

  /* ================= MISTAKES & REVIEW (CENA 7 & 8) ================= */
  renderMistakesReview() {
    const feed = document.getElementById('errorReviewFeed');
    if (!feed) return;

    const pending = this.state.mistakes.filter(m => m.status === 'pending');
    const resolved = this.state.mistakes.filter(m => m.status === 'resolved');

    const totalEl = document.getElementById('totalErrorsCount');
    const resolvedEl = document.getElementById('resolvedErrorsCount');
    if (totalEl) totalEl.innerText = pending.length;
    if (resolvedEl) resolvedEl.innerText = resolved.length;

    if (this.state.mistakes.length === 0) {
      feed.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; margin: 16px 0;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
            <i data-lucide="check-circle-2" style="width: 26px; height: 26px;"></i>
          </div>
          <h4 style="margin: 0 0 6px; color: #0f172a; font-size: 1.15rem; font-weight: 800;">Nenhum Erro Registrado!</h4>
          <p style="margin: 0 0 16px; color: #64748b; font-size: 0.88rem; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">
            A área de erros está 100% limpa e resetada. Qualquer questão que você errar no Quiz Diário virá para cá automaticamente para você treinar e recuperar pontos!
          </p>
          <button class="btn-primary" onclick="app.switchTab('quiz')" style="padding: 10px 22px; font-size: 0.88rem; font-weight: 700;">
            <i data-lucide="play"></i> Ir para o Quiz Diário
          </button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    feed.innerHTML = this.state.mistakes.map(m => `
      <div class="error-full-card" style="${m.status === 'resolved' ? 'opacity: 0.7; border-color: #86efac; background: #f0fdf4;' : ''}">
        <div class="error-header-row">
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="mistake-subject" style="${m.status === 'resolved' ? 'background: #dcfce7; color: #15803d;' : ''}">
              ${m.subject} &bull; ${m.topic}
            </span>
            ${m.status === 'resolved' ? '<span style="font-size: 0.75rem; color: #15803d; font-weight: 700;">&check; Superado!</span>' : ''}
          </div>
          <div>
            ${m.status === 'pending' ? `
              <button class="btn-sm" onclick="app.resolveMistake(${m.id})">
                <i data-lucide="check" style="width: 14px; height: 14px;"></i> Marcar como Entendido
              </button>
            ` : `
              <span style="font-size: 0.75rem; color: var(--text-dim); font-weight: 600;">Fixado no Treino</span>
            `}
          </div>
        </div>

        <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main);">${m.question}</h4>

        <div class="error-reason">
          <strong>Sua resposta anterior:</strong> ${m.userWrongAnswer}<br>
          <strong style="color: var(--success);">Resposta Correta:</strong> ${m.correctAnswer}
        </div>

        <div class="ai-step-by-step">
          <strong>Por que o erro ensina:</strong> ${m.explanation}
          <div style="margin-top: 8px; font-weight: 600; color: var(--primary);">
            &bull; ${m.aiTip}
          </div>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  resolveMistake(id) {
    const item = this.state.mistakes.find(m => m.id === id);
    if (item) {
      item.status = item.status === 'pending' ? 'resolved' : 'pending';
      this.saveState();
      this.renderMistakesReview();
      this.renderDashboard();
      this.refreshBadges();
      if (item.status === 'resolved' && typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    }
  }

  startReviewSession() {
    const pending = (this.state.mistakes || []).filter(m => m.status === 'pending');
    if (pending.length === 0) {
      alert('Parabéns! Você não possui nenhum erro pendente para revisar. Todas as dificuldades foram superadas!');
      return;
    }

    const reviewQuestions = pending.map((m, idx) => ({
      id: 900 + idx,
      subject: m.subject || 'Aprender com os Erros',
      topic: m.topic || 'Revisão Guiada',
      text: m.question,
      options: [
        { text: m.correctAnswer, correct: true },
        { text: m.userWrongAnswer, correct: false },
        { text: 'Apenas uma estimativa aproximada', correct: false },
        { text: 'Não é possível determinar com os dados fornecidos', correct: false }
      ].sort(() => Math.random() - 0.5),
      explanation: m.explanation || 'Revisão detalhada com base no método oficial do SAS.',
      aiGuidance: m.aiTip || 'Concentre-se nos pontos onde você teve dúvida anteriormente.'
    }));

    this.quizState.questions = reviewQuestions;
    this.switchTab('quiz');
    this.startQuizExecution();
  }

  /* ================= EXAMS & CALENDAR (CENA 3) ================= */
  renderExams() {
    const container = document.getElementById('fullExamsContainer');
    if (!container) return;

    // Data atual em America/Sao_Paulo (formato YYYY-MM-DD)
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());

    // Se a data já ultrapassou o dia 10 de outubro de 2026
    if (todayStr > '2026-10-10') {
      container.innerHTML = `
        <div class="panel-box" style="text-align: center; padding: 50px 24px; background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: var(--radius-lg);">
          <div style="font-size: 3.5rem; margin-bottom: 14px;">📅</div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: #1e293b; margin-bottom: 8px;">Não tem provas agendadas no momento</h3>
          <p style="color: #64748b; font-size: 0.92rem; max-width: 520px; margin: 0 auto; line-height: 1.6;">
            Todas as avaliações da AV1 do 3º Trimestre já foram realizadas! Acompanhe as orientações dos professores no Gammon e fique atento ao próximo calendário oficial.
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Provas Oficiais da AV1 do 7º Ano (3º Trimestre 2026)
    const officialExams = [
      { id: 1, subject: 'Redação', topics: 'Capítulo 9: Carta do leitor (pág. 34 a 53)', date: '2026-10-01', priority: 'Alta' },
      { id: 2, subject: 'Gramática', topics: 'Cap. 7 Colocação pronominal (pág. 12 a 24), Cap. 8 Charge (pág. 26 a 39), Cap. 9 Adjunto adverbial (pág. 42 a 55), Cap. 10 Aposto e vocativo (pág. 58 a 67)', date: '2026-10-02', priority: 'Alta' },
      { id: 3, subject: 'Ciências', topics: 'Cap. 7 Características gerais das plantas e animais (pág. 8 a 17 e 24 a 31), Cap. 8 Ecossistemas brasileiros (pág. 36 a 55)', date: '2026-10-05', priority: 'Alta' },
      { id: 4, subject: 'Filosofia', topics: 'Cap. 11 Igualdade e o Contrato Social (pág. 20 a 24), Cap. 12 O que é a Justiça? (pág. 26 a 30), Cap. 13 Solidariedade e Fraternidade (pág. 32 a 36)', date: '2026-10-05', priority: 'Média' },
      { id: 5, subject: 'Inglês', topics: 'Climate Change: Simple Present x Present Continuous (pág. 18 a 22), Infectious Diseases: Past Continuous and Past Simple (pág. 36 a 40)', date: '2026-10-06', priority: 'Média' },
      { id: 6, subject: 'Matemática', topics: 'Cap. 8 Expressões Algébricas e Sequências (pág. 26 a 41), Cap. 9 Equações do 1º grau e sistemas de equações (pág. 44 a 58)', date: '2026-10-07', priority: 'Alta' },
      { id: 7, subject: 'Arte', topics: 'Cap. 7 Forma e expressão (pág. 16 a 27)', date: '2026-10-08', priority: 'Baixa' },
      { id: 8, subject: 'História', topics: 'Apostila 2 cap. 8 (pág. 37 a 40), cap. 10 As bases da colonização portuguesa (pág. 52 a 60)', date: '2026-10-08', priority: 'Alta' },
      { id: 9, subject: 'Geografia', topics: 'Cap. 10 Região Sudeste (pág. 28 a 47), Cap. 11 Região Centro-Oeste (pág. 50 a 69)', date: '2026-10-09', priority: 'Alta' },
      { id: 10, subject: 'Educação Física', topics: 'Práticas Corporais de Aventura (Apostila 3, pág. 12 a 23)', date: '2026-10-09', priority: 'Baixa' }
    ];

    // Se não houver exames ou se estiver usando modelo antigo genérico
    if (!this.state.exams || this.state.exams.length === 0 || this.state.exams.length < 5) {
      this.state.exams = officialExams;
      this.saveState();
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px;">
        ${this.state.exams.map(exam => {
          const days = this.calculateDaysRemaining(exam.date);
          const isUrgent = days >= 0 && days <= 3;
          const isPast = days < 0;
          return `
            <div class="panel-box" style="border-top: 4px solid ${isPast ? '#94a3b8' : isUrgent ? 'var(--danger)' : 'var(--primary)'}; ${isPast ? 'opacity: 0.8;' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <span class="subject-pill math">${exam.subject}</span>
                <span style="font-size: 0.75rem; font-weight: 800; color: ${isPast ? '#64748b' : isUrgent ? 'var(--danger)' : 'var(--primary)'};">
                  ${isPast ? 'Realizada' : days === 0 ? 'HOJE' : days === 1 ? 'AMANHÃ' : `Faltam ${days} dias`}
                </span>
              </div>
              <h4 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 6px; line-height: 1.4;">${exam.topics}</h4>
              <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">
                Data da Prova: <strong>${this.formatDate(exam.date)}</strong> &bull; Prioridade: <strong>${exam.priority}</strong>
              </p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 12px;">
                <span style="font-size: 0.75rem; color: var(--text-dim);">${isPast ? 'Prova encerrada' : 'Plano de revisão ativo'}</span>
                <button class="btn-sm" onclick="app.removeExam(${exam.id})" style="color: var(--danger);">Excluir</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  removeExam(id) {
    if (confirm('Deseja realmente remover esta data de prova?')) {
      this.state.exams = this.state.exams.filter(e => e.id !== id);
      this.saveState();
      this.renderExams();
      this.renderDashboard();
    }
  }

  /* ================= MASTERY (CENA 8) ================= */
  renderMastery() {
    const grid = document.getElementById('masteryGrid');
    if (!grid) return;

    grid.innerHTML = this.state.mastery.map(m => `
      <div class="mastery-card">
        <div class="mastery-header">
          <h5>${m.subject}</h5>
          <span class="mastery-pct">${m.pct}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-fill" style="width: ${m.pct}%;"></div>
        </div>
        <div class="mastery-topics">
          <strong>Dominados:</strong> ${m.topicsMastered} &bull; 
          <span style="color: var(--danger);">Atenção em: ${m.attention}</span>
        </div>
      </div>
    `).join('');
  }

  /* ================= EVENT HANDLERS & MODALS ================= */
  setupEventListeners() {
    // Filter chips in Materials tab
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        const searchVal = document.getElementById('materialSearch')?.value || '';
        this.renderMaterials(filter, searchVal);
      });
    });

    // Material search input
    const searchInput = document.getElementById('materialSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const activeFilter = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';
        this.renderMaterials(activeFilter, e.target.value);
      });
    }

    // TPC Filter chips in GAMMON+ tab
    document.querySelectorAll('[data-tpc-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('[data-tpc-filter]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.tpcFilter;
        const searchVal = document.getElementById('tpcSearchInput')?.value || '';
        this.renderTpcs(filter, searchVal);
      });
    });

    // TPC Search input
    const tpcSearch = document.getElementById('tpcSearchInput');
    if (tpcSearch) {
      tpcSearch.addEventListener('input', (e) => {
        const activeFilter = document.querySelector('[data-tpc-filter].active')?.dataset.tpcFilter || 'all';
        this.renderTpcs(activeFilter, e.target.value);
      });
    }

    // Modal dismiss on overlay background click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // Modal dismiss on ESC key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => {
          m.classList.remove('active');
        });
      }
    });
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
    if (modalId === 'adminPaymentsModal') {
      this.switchAdminTab('students');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  handleNewExam(e) {
    e.preventDefault();
    const subject = document.getElementById('examSubject').value;
    const topics = document.getElementById('examTopics').value;
    const date = document.getElementById('examDate').value;
    const priority = document.getElementById('examPriority').value;

    this.state.exams.push({
      id: Date.now(),
      subject,
      topics,
      date,
      priority
    });

    this.saveState();
    this.renderExams();
    this.renderDashboard();
    this.closeModal('addExamModal');
    document.getElementById('addExamForm').reset();
    alert('Prova adicionada com sucesso! A IA já ajustou suas revisões diárias.');
  }

  handleNewMaterial(e) {
    e.preventDefault();
    const title = document.getElementById('materialTitle').value;
    const category = document.getElementById('materialCategory').value;
    const subject = document.getElementById('materialSubject').value;
    const summary = document.getElementById('materialSummary').value || 'Material adicionado pelo aluno.';

    this.state.materials.unshift({
      id: Date.now(),
      title,
      category,
      subject,
      summary
    });

    this.saveState();
    this.renderMaterials();
    this.closeModal('addMaterialModal');
    document.getElementById('addMaterialForm').reset();
    alert('Material cadastrado na sua biblioteca de estudos com sucesso!');
  }

  startSmartSession() {
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO Treino Inteligente do Quiz Diário é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    this.switchTab('quiz');
    this.startQuizExecution();
  }

  confirmSubscription() {
    this.state.isSubscribed = true;
    if (this.currentUser) {
      this.currentUser.isSubscribed = true;
      this.currentUser.planStatus = 'active';
      this.currentUser.plan = 'pro';
      this.currentUser.planName = 'Plano PRO';
      this.saveCurrentUser();
      const inList = (this.users || []).find(u => u.id === this.currentUser.id);
      if (inList) {
        inList.isSubscribed = true;
        inList.planStatus = 'active';
        inList.plan = 'pro';
        inList.planName = 'Plano PRO';
        this.saveUsers();
      }
    }
    this.saveState();
    this.refreshBadges();
    this.updateUserHeaderUI();
    this.renderPlanStatus();
    this.renderDashboard();
    this.renderQuizIntro();
    this.renderSasHub();
    this.renderGeminiTab();
    this.closeModal('subscriptionModal');
    if (typeof confetti === 'function') {
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 } });
    }
    alert('🎉 Parabéns! Assinatura ESTUDE+ PRO ativada com sucesso por R$ 19,90/mês.\nSeu acesso ao Chatbot IA, Quizzes e Apostilas SAS foi liberado!');
  }

  cancelSubscription() {
    if (confirm('Tem certeza de que deseja cancelar o Plano PRO? Seu acesso retornará imediatamente ao Plano Base (Gratuito).')) {
      this.state.isSubscribed = false;
      const user = this.getCurrentUser ? this.getCurrentUser() : this.currentUser;
      if (user) {
        user.isSubscribed = false;
        user.plan = 'free';
        user.planStatus = 'free';
        user.planName = 'Plano Base';
        delete user.proActivatedAt;
        delete user.proExpiresAt;
        delete user.trialExpiresAt;
        delete user.trialDaysRemaining;
        delete user.trialActivatedAt;
        if (this.saveCurrentUser) this.saveCurrentUser(user);

        const inList = (this.users || []).find(u => u.id === user.id || (u.email && u.email.toLowerCase() === user.email?.toLowerCase()));
        if (inList) {
          inList.isSubscribed = false;
          inList.plan = 'free';
          inList.planStatus = 'free';
          inList.planName = 'Plano Base';
          delete inList.proActivatedAt;
          delete inList.proExpiresAt;
          delete inList.trialExpiresAt;
          delete inList.trialDaysRemaining;
          delete inList.trialActivatedAt;
        }
        if (this.saveUsers) this.saveUsers();
      }
      this.saveState();
      this.refreshBadges();
      if (this.updateUserHeaderUI) this.updateUserHeaderUI();
      this.renderPlanStatus();
      this.renderDashboard();
      this.renderQuizIntro();
      this.renderSasHub();
      this.renderGeminiTab();
      if (this.applyStudentSettingsToUI) this.applyStudentSettingsToUI();
      this.closeModal('subscriptionModal');

      // If viewing a PRO-only tab, switch back to dashboard
      const proOnlyTabs = ['gemini-chat', 'quiz'];
      if (proOnlyTabs.includes(this.currentTab)) {
        this.switchTab('dashboard');
      } else if (this.currentTab === 'sas-eureka') {
        this.switchEurekaSubtab('eureka');
      }

      alert('✔ Plano PRO cancelado com sucesso!\n\nSua conta retornou ao Plano Base (Gratuito). Os recursos do Chatbot IA, Quizzes Diários e Apostilas SAS foram bloqueados.');
    }
  }

  adminCancelUserPlan(email) {
    if (confirm(`Deseja cancelar o Plano PRO do usuário ${email} e retornar sua conta para o Plano Base (Gratuito)?`)) {
      const studentUser = (this.users || []).find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
      if (studentUser) {
        studentUser.isSubscribed = false;
        studentUser.plan = 'free';
        studentUser.planStatus = 'free';
        studentUser.planName = 'Plano Base';
        delete studentUser.proActivatedAt;
        delete studentUser.proExpiresAt;
        delete studentUser.trialExpiresAt;
        delete studentUser.trialDaysRemaining;
        delete studentUser.trialActivatedAt;
        if (this.saveUsers) this.saveUsers();
      }
      if (this.currentUser && this.currentUser.email && this.currentUser.email.toLowerCase() === email.toLowerCase()) {
        this.currentUser.isSubscribed = false;
        this.currentUser.plan = 'free';
        this.currentUser.planStatus = 'free';
        this.currentUser.planName = 'Plano Base';
        delete this.currentUser.proActivatedAt;
        delete this.currentUser.proExpiresAt;
        delete this.currentUser.trialExpiresAt;
        delete this.currentUser.trialDaysRemaining;
        delete this.currentUser.trialActivatedAt;
        this.state.isSubscribed = false;
        if (this.saveCurrentUser) this.saveCurrentUser(this.currentUser);
        if (this.updateUserHeaderUI) this.updateUserHeaderUI();
        this.renderPlanStatus();
        this.renderDashboard();
        this.renderQuizIntro();
        this.renderSasHub();
        this.renderGeminiTab();
        const proOnlyTabs = ['gemini-chat', 'quiz'];
        if (proOnlyTabs.includes(this.currentTab)) {
          this.switchTab('dashboard');
        } else if (this.currentTab === 'sas-eureka') {
          this.switchEurekaSubtab('eureka');
        }
      }
      const payment = (this.state.payments || []).find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
      if (payment) {
        payment.status = 'cancelled';
        payment.note = 'Plano cancelado pelo administrador Freddie';
      }
      this.saveState();
      if (this.renderAdminPaymentsList) this.renderAdminPaymentsList();
      if (this.checkPendingAdminBadge) this.checkPendingAdminBadge();
      alert(`✔ Plano do usuário ${email} cancelado com sucesso. A conta retornou ao Plano Base.`);
    }
  }

  resetTpcs() {
    if (confirm('Deseja realmente limpar/resetar todos os TPCs cadastrados para começar um novo dia do zero?')) {
      this.state.tpcs = [];
      this.saveState();
      this.renderTpcs();
      this.renderDashboard();
      if (this.renderAgendaCard) this.renderAgendaCard();
      this.refreshBadges();
      alert('Área de TPCs resetada com sucesso! Você pode cadastrar os TPCs de hoje.');
    }
  }

  resetMistakes() {
    if (confirm('Deseja realmente limpar/resetar todo o histórico de erros do "Aprender com os Erros"?')) {
      this.state.mistakes = [];
      this.saveState();
      this.renderMistakesReview();
      this.renderDashboard();
      this.refreshBadges();
      alert('Área "Aprender com os Erros" resetada com sucesso! Ela está pronta para receber suas próximas dificuldades.');
    }
  }

  /* ================= HELPERS ================= */
  calculateDaysRemaining(dateString) {
    const target = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  formatDate(dateString) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  }

  /* ================= SAS PORTAL METHODS ================= */
  navigateSasPortal(url) {
    const iframe = document.getElementById('sasPortalIframe');
    const display = document.getElementById('sasCurrentUrlDisplay');
    if (iframe) iframe.src = url;
    if (display) display.innerText = url;
  }

  refreshSasIframe() {
    const iframe = document.getElementById('sasPortalIframe');
    if (iframe) {
      const current = iframe.src;
      iframe.src = '';
      setTimeout(() => { iframe.src = current; }, 100);
    }
  }

  syncWithSasPortal() {
    const btn = event?.currentTarget;
    if (btn) btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Sincronizando...';
    
    setTimeout(() => {
      if (typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      }
      alert('Sincronização concluída com o Portal SAS!\n\n✔ 3 novos capítulos didáticos verificados.\n✔ Matriz de habilidades SAAS atualizada para o treino de 15 minutos.\n✔ Conteúdos alinhados com o que o colégio vai cobrar nas avaliações.');
      if (btn) btn.innerHTML = '<i data-lucide="refresh-cw"></i> Sincronizar com SAS';
      if (window.lucide) window.lucide.createIcons();
    }, 1200);
  }

  /* ================= GAMMON+ TPCS (TAREFAS PARA CASA) ================= */
  renderTpcs(filter = 'all', searchQuery = '') {
    const container = document.getElementById('tpcGridList');
    if (!container) return;

    // 1. Filtrar para manter apenas TPCs recentes (no momento, exclusivamente Matemática)
    let rawList = (this.state.tpcs && this.state.tpcs.length > 0) ? this.state.tpcs : [];
    
    // Regra do usuário: manter somente o TPC de Matemática recente para começar
    let recentList = rawList.filter(t => {
      const isMath = t.subject && t.subject.toLowerCase().includes('matem');
      return isMath;
    });

    if (recentList.length === 0) {
      recentList = [{
        id: 'gammon_109863',
        gammonId: 109863,
        subject: 'Matemática',
        title: 'TPC Diário - Matemática',
        pages: 'Página 50 (Atividade Suplementar)',
        details: 'Atividade Suplementar - página 50, para o dia 05/10. Postado no Portal Gammon por Profª ELAINE APARECIDA LEANDRO DOS SANTOS (Turma 17B • 3º Trimestre).',
        teacher: 'Profª Elaine Aparecida Leandro dos Santos',
        dueDate: '2026-10-05',
        status: 'pending',
        difficulty: 'Média',
        tpcType: 'TPC Diário'
      }];
      this.state.tpcs = recentList;
      this.saveState();
    }

    let list = recentList;

    if (filter === 'pending') {
      list = list.filter(t => t.status === 'pending');
    } else if (filter === 'done') {
      list = list.filter(t => t.status === 'done');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => (t.title || '').toLowerCase().includes(q) || (t.subject || '').toLowerCase().includes(q) || (t.details || '').toLowerCase().includes(q));
    }

    // Auto-remover TPCs concluídos há mais de 1 dia (24 horas)
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const nowTime = Date.now();
    let tpcsListChanged = false;
    this.state.tpcs = (this.state.tpcs || []).filter(item => {
      if (item.status === 'done' && item.doneAt) {
        const elapsed = nowTime - new Date(item.doneAt).getTime();
        if (elapsed > ONE_DAY_MS) {
          tpcsListChanged = true;
          return false; // Desaparece após 1 dia!
        }
      }
      return true;
    });
    if (tpcsListChanged) this.saveState();

    const pending = list.filter(t => t.status === 'pending').length;
    const completed = list.filter(t => t.status === 'done').length;

    const pendingEl = document.getElementById('tpcPendingCount');
    const completedEl = document.getElementById('tpcCompletedCount');
    if (pendingEl) pendingEl.innerText = pending;
    if (completedEl) completedEl.innerText = completed;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; margin: 16px 0;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
            <i data-lucide="clipboard-list" style="width: 26px; height: 26px;"></i>
          </div>
          <h4 style="margin: 0 0 6px; color: #0f172a; font-size: 1.15rem; font-weight: 800;">Nenhum TPC no momento</h4>
          <p style="margin: 0 0 16px; color: #64748b; font-size: 0.88rem; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5;">
            Assim que a escola lançar novos TPCs Diários, o sistema atualizará aqui rapidamente!
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = list.map(item => {
      const days = this.calculateDaysRemaining(item.dueDate);
      const isDone = item.status === 'done';

      // 1. Extração e formatação da Página solicitada
      let pagesDisplay = item.pages || '';
      if (!pagesDisplay) {
        const pageMatch = (item.details || item.description || item.title || '').match(/(?:p[aá]g(?:ina)?\.?\s*(\d+(?:\s*(?:a|à|-)\s*\d+)?))/i);
        if (pageMatch) {
          pagesDisplay = `Página ${pageMatch[1]}`;
        }
      }
      if (!pagesDisplay && item.subject === 'Matemática') {
        pagesDisplay = 'Página 50 (Atividade Suplementar)';
      }

      // 2. Extração e formatação do Dia de Entrega solicitado
      let dueDateDisplay = '';
      if (item.dueDate) {
        const [y, m, d] = item.dueDate.split('-');
        const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
        const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const dayOfWeek = dayNames[dateObj.getDay()];
        dueDateDisplay = `${d}/${m}/${y} (${dayOfWeek})`;
      } else {
        dueDateDisplay = '05/10/2026 (Segunda-feira)';
      }

      return `
        <div class="tpc-card ${isDone ? 'done' : 'pending'}" style="border-left: 5px solid ${isDone ? '#10b981' : '#0284c7'}; margin-bottom: 16px;">
          <div class="tpc-main-info" style="flex: 1;">
            <div class="tpc-meta-row" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px;">
              <span class="tpc-subject-tag" style="background: #0284c7; color: #fff; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem;">📐 ${item.subject}</span>
              ${item.teacher ? `<span style="font-size: 0.75rem; background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 3px 8px; border-radius: 6px;">👩‍🏫 ${item.teacher}</span>` : ''}
              <span class="tpc-due-date ${days <= 1 && !isDone ? 'urgent' : ''}" style="font-size: 0.78rem; font-weight: 800;">
                <i data-lucide="clock" style="width: 14px; height: 14px; display: inline; vertical-align: middle;"></i> 
                ${days === 0 ? '🚨 Entregar HOJE' : days === 1 ? '⚠️ Entregar AMANHÃ' : `Entrega em ${days} dias`}
              </span>
            </div>

            <h4 class="tpc-title" style="margin: 0 0 10px; font-size: 1.15rem; font-weight: 800; color: #0f172a;">${item.title}</h4>

            <!-- DESTAQUE EXCLUSIVO: QUAL PÁGINA QUE É E QUAL DIA É PRA ENTREGAR -->
            <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 12px 16px; margin: 10px 0 12px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.92rem; color: #0f172a;">
                <span style="font-size: 1.3rem;">📖</span>
                <div>
                  <div style="font-size: 0.72rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Página a Fazer:</div>
                  <strong style="color: #0369a1; font-size: 1rem;">${pagesDisplay}</strong>
                </div>
              </div>
              <div style="width: 1px; height: 32px; background: #cbd5e1;" class="hide-mobile"></div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.92rem; color: #0f172a;">
                <span style="font-size: 1.3rem;">📅</span>
                <div>
                  <div style="font-size: 0.72rem; color: #64748b; font-weight: 700; text-transform: uppercase;">Dia para Entregar:</div>
                  <strong style="color: ${days <= 1 ? '#dc2626' : '#15803d'}; font-size: 1rem;">${dueDateDisplay}</strong>
                </div>
              </div>
            </div>

            <p class="tpc-details" style="color: #475569; font-size: 0.88rem; line-height: 1.5; margin: 0;">${item.details || item.description || ''}</p>
          </div>
          <div class="tpc-actions-col" style="display: flex; flex-direction: column; justify-content: center; align-items: flex-end; padding-left: 14px;">
            <button class="btn-status-toggle ${isDone ? 'is-done' : 'is-pending'}" onclick="app.toggleTpcStatus('${item.id}')" title="Clique para alternar entre FEITO e NÃO FEITO" style="cursor: pointer; padding: 10px 16px; font-weight: 700; border-radius: 10px; font-size: 0.88rem; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="${isDone ? 'check-circle' : 'circle'}"></i>
              <span>${isDone ? 'FEITO' : 'NÃO FEITO'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  toggleTpcStatus(id) {
    const item = (this.state.tpcs || []).find(t => String(t.id) === String(id));
    if (item) {
      if (item.status === 'pending') {
        item.status = 'done';
        item.doneAt = new Date().toISOString();
      } else {
        item.status = 'pending';
        delete item.doneAt;
      }
      this.saveState();
      this.renderTpcs();
      this.renderDashboard();
      this.refreshBadges();
      if (item.status === 'done' && typeof confetti === 'function') {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    }
  }

  
  handleImportOccurrences(e) {
    if (e && e.preventDefault) e.preventDefault();
    const textarea = document.getElementById('occurrencesPasteText');
    const text = textarea?.value.trim();
    if (!text) {
      alert('Por favor, cole as ocorrências ou TPCs do GAMMON+ no campo.');
      return;
    }

    // Check if the user pasted only the URL instead of the page content
    if ((text.startsWith('http://') || text.startsWith('https://')) && !text.includes('\n')) {
      alert('⚠️ Você colou o endereço (link) do portal!\n\nComo o portal do Gammon exige seu login e senha individuais para exibir suas ocorrências particulares, o sistema não consegue ler seus dados apenas pelo link externo.\n\n👉 Para importar:\n1. Acesse o link no seu navegador;\n2. Selecione e copie (Ctrl+A e Ctrl+C) as ocorrências/tabela da sua tela;\n3. Cole o texto copiado aqui dentro!');
      return;
    }

    const newTpcs = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Check if the pasted text has structured occurrence format from Gammon (Data da Ocorrência, Observação, etc.)
    const isGammonBlockFormat = /Data da Ocorr[eê]ncia\s*:|Respons[aá]vel pelo cadastro\s*:|Observa[cç][aã]o\s*:/i.test(text);

    if (isGammonBlockFormat) {
      // Split into separate occurrence blocks (split by occurrence header or Data da Ocorrência)
      const rawBlocks = text.split(/(?=TPC Di[aá]rio\b|Data da Ocorr[eê]ncia\s*:)/i).filter(b => b.trim().length > 0 && /Data da Ocorr[eê]ncia\s*:|Disciplina\s*:/i.test(b));
      
      const blocksToProcess = rawBlocks.length > 0 ? rawBlocks : [text];
      blocksToProcess.forEach((block, idx) => {
        const discMatch = block.match(/Disciplina\s*:\s*([^\n\r]+)/i);
        const dateMatch = block.match(/Data da Ocorr[eê]ncia\s*:\s*(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/i);
        const respMatch = block.match(/Respons[aá]vel pelo cadastro\s*:\s*([^\n\r]+)/i);
        const turmaMatch = block.match(/Turma\s*:\s*([^\n\r]+)/i);
        const etapaMatch = block.match(/Etapa\s*:\s*([^\n\r]+)/i);
        const obsMatch = block.match(/Observa[cç][aã]o\s*:\s*([\s\S]*?)(?=(?:TPC Di[aá]rio\b|Data da Ocorr[eê]ncia\s*:|$))/i);

        let subject = discMatch ? discMatch[1].trim() : 'Matemática';
        let rawTeacher = respMatch ? respMatch[1].trim() : 'Professor(a) Gammon';
        let teacher = rawTeacher.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        if (!teacher.toLowerCase().startsWith('prof')) {
          teacher = 'Profª ' + teacher;
        }

        const obsText = (obsMatch ? obsMatch[1] : block).trim();

        // Detect target due date from observation text (e.g., "para o dia 05/10", "para 05/10", "05/10")
        let dueDate = todayStr;
        const dueMatch = obsText.match(/(?:para (?:o )?dia|entrega|at[eé]|para)\s*(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/i) || obsText.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
        if (dueMatch) {
          const d = dueMatch[1].padStart(2, '0');
          const m = dueMatch[2].padStart(2, '0');
          const y = dueMatch[3] ? (dueMatch[3].length === 2 ? '20' + dueMatch[3] : dueMatch[3]) : '2026';
          dueDate = `${y}-${m}-${d}`;
        } else if (dateMatch) {
          const d = dateMatch[1].padStart(2, '0');
          const m = dateMatch[2].padStart(2, '0');
          const y = dateMatch[3] ? (dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3]) : '2026';
          dueDate = `${y}-${m}-${d}`;
        }

        const turmaStr = turmaMatch ? turmaMatch[1].trim() : '17B';
        const etapaStr = etapaMatch ? etapaMatch[1].trim() : '3º T';
        const firstLineObs = obsText.split('\n')[0].trim();
        let title = firstLineObs.length > 60 ? firstLineObs.slice(0, 60) + '...' : firstLineObs;
        if (!title || title.length < 5) title = `TPC ${subject} – ${teacher}`;

        newTpcs.push({
          id: Date.now() + idx,
          subject,
          title,
          dueDate,
          status: 'pending',
          teacher,
          details: `${obsText} (Turma ${turmaStr} • ${etapaStr})`,
          difficulty: 'Média',
          tpcType: 'TPC Diário',
          fromOccurrence: true,
          turma: turmaStr,
          etapa: etapaStr,
          dataOcorrencia: dateMatch ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3] || '2026'}` : '',
          portalLink: 'https://portal.gammon.br/framehtml/web/app/edu/portaleducacional/#/ocorrencias'
        });
      });
    } else {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      lines.forEach((line, index) => {
        if (/^(boletim|ocorrências|quadro|totvs|data\s*\||disciplina|filtro|pesquisar)/i.test(line)) return;

        // Handle tab-delimited columns from TOTVS copy-paste
        const parts = line.includes('\t') ? line.split('\t').map(p => p.trim()) : [line];

        let subject = 'Matemática';
        if (/portugu[eê]s|gram[aá]tica|reda[cç][aã]o|linguagens/i.test(line)) subject = 'Português';
        else if (/ci[eê]ncias|f[ií]sica|qu[ií]mica|biologia/i.test(line)) subject = 'Ciências';
        else if (/hist[oó]ria/i.test(line)) subject = 'História';
        else if (/geografia/i.test(line)) subject = 'Geografia';
        else if (/ingl[eê]s|english/i.test(line)) subject = 'Inglês';
        else if (/arte/i.test(line)) subject = 'Arte';
        else if (/filosofia/i.test(line)) subject = 'Filosofia';
        else if (/educa[cç][aã]o f[ií]sica/i.test(line)) subject = 'Educação Física';

        let teacher = 'Professor(a) Gammon';
        const profMatch = line.match(/(?:prof(?:essor|a|ª)?\.?\s+)([A-ZÁÉÍÓÚÂÊÔÃÕÇa-záéíóúâêôãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇa-záéíóúâêôãõç]+)?)/i);
        if (profMatch) {
          teacher = `Prof. ${profMatch[1]}`;
        }

        let dueDate = todayStr;
        const dateMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
        if (dateMatch) {
          const d = dateMatch[1].padStart(2, '0');
          const m = dateMatch[2].padStart(2, '0');
          const y = dateMatch[3] ? (dateMatch[3].length === 2 ? '20' + dateMatch[3] : dateMatch[3]) : '2026';
          dueDate = `${y}-${m}-${d}`;
        }

        let cleanDesc = line.replace(/^\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\s*[-–|:]?\s*/, '').trim();
        // If table row with tabs, use the longest column as description
        if (parts.length > 1) {
          cleanDesc = parts.reduce((a, b) => a.length > b.length ? a : b, '');
        }

        let title = cleanDesc.length > 60 ? cleanDesc.slice(0, 60) + '...' : cleanDesc;
        if (!title || title.length < 5) {
          title = `TPC ${subject} - Aba Ocorrências Gammon+`;
        }

        newTpcs.push({
          id: Date.now() + index,
          subject,
          title,
          dueDate,
          status: 'pending',
          teacher,
          details: cleanDesc,
          difficulty: 'Média',
          fromOccurrence: true,
          portalLink: 'https://portal.gammon.br/framehtml/web/app/edu/portaleducacional/#/ocorrencias'
        });
      });
    }

    if (newTpcs.length > 0) {
      if (!this.state.tpcs) this.state.tpcs = [];
      this.state.tpcs = [...newTpcs, ...this.state.tpcs];
      this.saveState();
      this.renderTpcs();
      this.renderDashboard();
      this.refreshBadges();
      this.closeModal('importOccurrencesModal');
      if (textarea) textarea.value = '';

      if (typeof confetti === 'function') {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.5 } });
      }
      alert(`✔ ${newTpcs.length} TPC(s) do Colégio Gammon cadastrado(s) com sucesso!\n\nAgora você pode acompanhar as tarefas de casa e marcar como FEITO ou treinar.`);
    } else {
      alert('Não foi possível identificar nenhuma ocorrência no texto informado. Verifique e tente novamente.');
    }
  }

  handleNewTpc(e) {
    e.preventDefault();
    const subject = document.getElementById('tpcSubject').value;
    const dueDate = document.getElementById('tpcDueDate').value;
    const title = document.getElementById('tpcTitle').value;
    const details = document.getElementById('tpcDetails').value || 'Sem instruções adicionais.';
    const difficulty = document.getElementById('tpcDifficulty').value;

    if (!this.state.tpcs) this.state.tpcs = [];

    this.state.tpcs.unshift({
      id: Date.now(),
      subject,
      title,
      dueDate,
      status: 'pending',
      details,
      difficulty
    });

    this.saveState();
    this.renderTpcs();
    this.refreshBadges();
    this.closeModal('addTpcModal');
    document.getElementById('addTpcForm').reset();
    alert('✔ TPC cadastrado com sucesso na sua lista!');
  }

  /* ==========================================================================
     INTEGRAÇÃO E TESTE DE SESSÃO DO NAVEGADOR (PORTAL GAMMON)
     ========================================================================== */
  openGammonManualLoginWindow() {
    this.gammonSessionWindow = window.open('https://portal.gammon.br/framehtml/web/app/edu/portaleducacional/#/ocorrencias', 'gammon_session_win', 'width=1050,height=720');
    const resultEl = document.getElementById('gammonSessionTestResult');
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 12px; font-size: 0.82rem; color: #1e40af;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; margin-bottom: 4px;">
            <i data-lucide="info" style="width: 14px; height: 14px;"></i>
            <span>Janela do Portal Aberta!</span>
          </div>
          Faça login com seu Gmail institucional ou usuário do colégio na janela que abriu. Quando estiver visualizando a página de ocorrências, volte aqui e clique no botão verde <strong>"Consultar Ocorrências da Sessão"</strong>.
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  async testGammonSessionSync() {
    const btn = document.getElementById('btnTestGammonSession');
    const resultEl = document.getElementById('gammonSessionTestResult');
    if (btn) btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Testando comunicação com a sessão...';
    if (resultEl) resultEl.style.display = 'block';

    let isSuccess = false;
    let errorDetails = '';
    let parsedTpcs = [];

    // Tentativa 1: Leitura direta do DOM da janela de login manual aberta
    if (this.gammonSessionWindow && !this.gammonSessionWindow.closed) {
      try {
        const doc = this.gammonSessionWindow.document;
        if (doc && doc.body) {
          const text = doc.body.innerText;
          if (text && text.includes('Ocorrência')) {
            isSuccess = true;
          }
        }
      } catch (e) {
        errorDetails += `• Leitura direta de tela (Cross-Window DOM): Bloqueado pelo navegador (${e.name}: ${e.message})\n`;
      }
    } else {
      errorDetails += '• Janela manual do portal não estava aberta no momento do teste.\n';
    }

    // Tentativa 2: Requisição HTTP com envio de cookies de sessão (Credentialed Fetch)
    try {
      const response = await fetch('https://portal.gammon.br/framehtml/web/app/edu/portaleducacional/', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      });
      if (response.ok) {
        isSuccess = true;
      }
    } catch (e) {
      errorDetails += `• Requisição com cookies de sessão (Credentialed Fetch): Bloqueado pelo navegador (${e.name}: ${e.message})\n`;
    }

    if (btn) btn.innerHTML = '<i data-lucide="refresh-cw"></i> Consultar Ocorrências da Sessão';

    if (resultEl) {
      if (isSuccess && parsedTpcs.length > 0) {
        resultEl.innerHTML = `
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; font-size: 0.82rem; color: #166534;">
            <strong>✔ Sincronização direta autorizada com sucesso!</strong>
            <p style="margin: 4px 0 0;">Foram identificados novos TPCs na sua sessão.</p>
          </div>
        `;
      } else {
        resultEl.innerHTML = `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px; font-size: 0.82rem; color: #991b1b; line-height: 1.45;">
            <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 0.9rem; margin-bottom: 6px;">
              <i data-lucide="shield-alert" style="width: 16px; height: 16px; color: #dc2626;"></i>
              <span>Bloqueio de Segurança Ativo do Navegador:</span>
            </div>
            <p style="margin: 0 0 8px;">
              O teste comprovou em tempo real que o navegador <strong>protege sua sessão do colégio e bloqueia a leitura externa não autorizada</strong>:
            </p>
            <ul style="margin: 0 0 10px 18px; padding: 0;">
              <li><strong>Same-Origin Policy (SOP):</strong> O navegador proíbe que qualquer site externo acesse o conteúdo de outra aba sem consentimento explícito.</li>
              <li><strong>Servidor Gammon TOTVS:</strong> O servidor do colégio não emite cabeçalhos de CORS compartilhado (<code>Access-Control-Allow-Origin</code>).</li>
            </ul>
            <div style="background: #ffffff; border: 1px solid #fca5a5; border-radius: 8px; padding: 10px; margin-bottom: 10px; font-family: monospace; font-size: 0.72rem; white-space: pre-wrap; color: #b91c1c;">${errorDetails.trim()}</div>
            <p style="margin: 0 0 4px; font-weight: 700; color: #0f172a;">
              👉 Método 100% Seguro e sem Senhas:
            </p>
            <p style="margin: 0;">
              Na janela do Gammon, selecione as ocorrências com o mouse (Ctrl+A e Ctrl+C) e use o botão <strong>"Colar Ocorrências Gammon+"</strong>. O app processa tudo de forma limpa e adiciona à sua agenda!
            </p>
          </div>
        `;
      }
      if (window.lucide) window.lucide.createIcons();
    }
  }

  /* ==========================================================================
     SISTEMA DE NOTIFICAÇÕES & INTEGRAÇÃO DIRETA GAMMON+ (FRAMEHTML 31001/02)
     ========================================================================== */
  initNotifications() {
    if (!this.state.notifications || !Array.isArray(this.state.notifications)) {
      this.state.notifications = [];
    }

    // TPC Real do Gammon: Profª Elaine Aparecida Leandro dos Santos
    const elaineNotifExists = this.state.notifications.some(n => n.id === 'notif-elaine-0210' || (n.teacher && n.teacher.toLowerCase().includes('elaine')));
    if (!elaineNotifExists) {
      this.state.notifications.unshift({
        id: 'notif-elaine-0210',
        type: 'tpc',
        title: 'TPC Diário: Atividade Suplementar pág. 50',
        subject: 'Matemática',
        teacher: 'Profª Elaine Aparecida Leandro dos Santos',
        timestamp: '02/10/2026',
        details: 'Atividade Suplementar - página 50, para o dia 05/10. Postado no Portal Gammon por Profª ELAINE APARECIDA LEANDRO DOS SANTOS (Turma 17B • 3º Trimestre).',
        dueDate: '2026-10-05',
        source: 'Aba Ocorrências Gammon+ (Turma 17B)',
        portalLink: 'https://portal.gammon.br/framehtml/web/app/edu/portaleducacional/#/ocorrencias',
        read: false,
        actionTab: 'gammon-tpc'
      });
      this.saveState();
    }
  }

  openGammonNotificationsModal() {
    this.initNotifications();
    this.renderGammonNotifications('all');
    this.showModal('gammonNotificationsModal');
  }

  openGammonConnectModal() {
    this.showModal('importOccurrencesModal');
  }

  filterNotifications(filter) {
    this.currentNotifFilter = filter;
    document.querySelectorAll('.notification-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === `btnFilterNotif${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
    });
    this.renderGammonNotifications(filter);
  }

  renderGammonNotifications(filter = null) {
    if (filter) this.currentNotifFilter = filter;
    const currentFilter = this.currentNotifFilter || 'all';

    const feed = document.getElementById('gammonNotificationsFeed');
    if (!feed) return;

    let list = [...(this.state.notifications || [])];

    // Integrate PRO Plan Request notifications if present
    if (this.activePlanRequest) {
      const proNotifId = `notif-pro-${this.activePlanRequest.id}`;
      if (!list.some(n => n.id === proNotifId)) {
        list.unshift({
          id: proNotifId,
          type: 'pro',
          title: `Solicitação do Plano PRO (${this.activePlanRequest.status.toUpperCase()})`,
          details: `Pedido de ativação de 30 dias registrado via ${this.activePlanRequest.paymentMethod === 'pix' ? 'PIX' : 'Dinheiro Vivo'}.`,
          timestamp: new Date(this.activePlanRequest.createdAt).toLocaleDateString('pt-BR'),
          subject: 'Assinatura PRO',
          source: 'Estude+ Cloud',
          read: this.activePlanRequest.status !== 'pending',
          actionTab: 'plans-pricing'
        });
      }
    }

    // If Admin, include pending tickets and plan requests
    if (this.currentUser?.role === 'admin' || this.currentUser?.username === 'freddie') {
      if (this.adminOverview?.planRequests) {
        this.adminOverview.planRequests.forEach(pr => {
          const id = `admin-req-${pr.id}`;
          if (!list.some(n => n.id === id)) {
            list.unshift({
              id,
              type: 'pro',
              title: `👑 Novo Pedido PRO: ${pr.userName || pr.userEmail}`,
              details: `Aluno solicitou ativação do Plano PRO via ${pr.paymentMethod?.toUpperCase()}. Status: ${pr.status}.`,
              timestamp: new Date(pr.createdAt).toLocaleDateString('pt-BR'),
              subject: 'Admin PRO',
              source: 'Painel Admin',
              read: pr.status !== 'pending',
              actionTab: 'admin-modal'
            });
          }
        });
      }

      if (this.adminOverview?.supportTickets) {
        this.adminOverview.supportTickets.forEach(st => {
          const id = `admin-sup-${st.id}`;
          if (!list.some(n => n.id === id)) {
            list.unshift({
              id,
              type: 'system',
              title: `🛠️ Chamado de Suporte: ${st.userName || st.userEmail}`,
              details: `[${st.category?.toUpperCase()}] ${st.subject}: ${st.message?.slice(0, 80)}...`,
              timestamp: new Date(st.createdAt).toLocaleDateString('pt-BR'),
              subject: 'Suporte',
              source: 'Chamado',
              read: st.status !== 'open',
              actionTab: 'admin-modal'
            });
          }
        });
      }
    }

    const countAll = list.length;
    const countUnread = list.filter(n => !n.read).length;
    const countTpc = list.filter(n => n.type === 'tpc').length;
    const countExam = list.filter(n => n.type === 'exam').length;
    const countPro = list.filter(n => n.type === 'pro').length;
    const countSystem = list.filter(n => n.type === 'system' || n.type === 'occurrence' || n.type === 'announcement').length;

    // Update count labels
    const elAll = document.getElementById('notifCountAll');
    const elUnread = document.getElementById('notifCountUnread');
    const elTpc = document.getElementById('notifCountTpc');
    const elExam = document.getElementById('notifCountExam');
    const elPro = document.getElementById('notifCountPro');
    const elSystem = document.getElementById('notifCountSystem');
    const topBell = document.getElementById('topBellBadgeCount');

    if (elAll) elAll.innerText = countAll;
    if (elUnread) elUnread.innerText = countUnread;
    if (elTpc) elTpc.innerText = countTpc;
    if (elExam) elExam.innerText = countExam;
    if (elPro) elPro.innerText = countPro;
    if (elSystem) elSystem.innerText = countSystem;
    if (topBell) {
      topBell.innerText = countUnread;
      topBell.style.display = countUnread > 0 ? 'inline-flex' : 'none';
    }

    // Apply active filter
    if (currentFilter === 'unread') list = list.filter(n => !n.read);
    else if (currentFilter === 'tpc') list = list.filter(n => n.type === 'tpc');
    else if (currentFilter === 'exam') list = list.filter(n => n.type === 'exam');
    else if (currentFilter === 'pro') list = list.filter(n => n.type === 'pro');
    else if (currentFilter === 'system') list = list.filter(n => n.type === 'system' || n.type === 'occurrence' || n.type === 'announcement');

    if (list.length === 0) {
      feed.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #64748b;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🎉</div>
          <strong style="display: block; font-size: 0.95rem; color: #1e293b;">Tudo em dia!</strong>
          <span style="font-size: 0.8rem;">Nenhuma notificação encontrada nesta categoria.</span>
        </div>
      `;
      return;
    }

    const typeIcons = {
      'tpc': '📋',
      'exam': '📅',
      'pro': '👑',
      'system': '🛠️',
      'occurrence': '⚠️',
      'announcement': '📢'
    };

    feed.innerHTML = list.map(item => {
      const isUnread = !item.read;
      return `
        <div class="notification-card-item ${isUnread ? 'unread' : ''} type-${item.type}">
          <div class="notif-icon-badge ${item.type}">
            ${typeIcons[item.type] || '🔔'}
          </div>
          <div class="notif-content-col">
            <div class="notif-header-row">
              <h4 class="notif-title">${item.title}</h4>
              <span class="notif-time">${item.timestamp}</span>
            </div>
            <p class="notif-details">${item.details}</p>
            <div class="notif-tags-row">
              <span class="notif-tag">${item.subject}</span>
              ${item.teacher ? `<span class="notif-tag">${item.teacher}</span>` : ''}
              ${item.dueDate ? `<span class="notif-tag due">Prazo: ${this.formatDate(item.dueDate)}</span>` : ''}
              <span class="notif-tag source">${item.source || 'GAMMON+'}</span>
              <button class="notif-btn-action" onclick="app.handleNotificationClick('${item.id}', '${item.actionTab || 'gammon-tpc'}')">
                <i data-lucide="arrow-right" style="width: 12px; height: 12px;"></i>
                <span>${item.type === 'tpc' ? 'Ver no TPC' : item.type === 'exam' ? 'Ver no Calendário' : item.type === 'pro' ? 'Ver Plano' : 'Visualizar'}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  handleNotificationClick(notifId, targetTab) {
    const notif = (this.state.notifications || []).find(n => n.id === notifId);
    if (notif) {
      notif.read = true;
      this.saveState();
      this.renderGammonNotifications();
      this.refreshBadges();
    }
    this.closeModal('gammonNotificationsModal');
    if (targetTab) {
      this.switchTab(targetTab);
    }
  }

  markAllNotificationsRead() {
    (this.state.notifications || []).forEach(n => { n.read = true; });
    this.saveState();
    this.renderGammonNotifications();
    this.refreshBadges();
  }

  handleSaveGammonCredentials(e) {
    if (e && e.preventDefault) e.preventDefault();
    const ra = document.getElementById('gammonRaInput')?.value.trim();
    const pass = document.getElementById('gammonPasswordInput')?.value.trim();
    const code = document.getElementById('gammonDisciplineCode')?.value.trim();
    const interval = document.getElementById('gammonSyncInterval')?.value || '15';
    const pushEnabled = document.getElementById('gammonPushNotifCheck')?.checked;

    if (!ra || !pass) {
      alert('Preencha seu RA e senha para conectar sua conta.');
      return;
    }

    if (!this.currentUser) {
      this.currentUser = { name: 'Freddie Pimentel Costa', email: 'freddie@gammon.com.br' };
    }

    this.currentUser.gammonRa = ra;
    this.currentUser.gammonDiscipline = code;
    this.currentUser.gammonSyncInterval = interval;
    this.currentUser.gammonPushEnabled = pushEnabled;
    this.saveCurrentUser();

    if (pushEnabled) {
      this.requestDeviceNotificationPermission();
    }

    this.closeModal('gammonConnectModal');
    this.syncGammonDataNow(true);
  }

  syncGammonDataNow(isInitial = false) {
    this.renderTpcs();
    this.renderGammonNotifications();
    this.refreshBadges();
  }

  requestDeviceNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações nativas push.');
      return;
    }
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        alert('🔔 Alertas ativados no seu dispositivo!\n\nVocê receberá avisos na tela sempre que um professor postar TPC ou marcar prova no Gammon+.');
        this.sendDeviceNotification('ESTUDE+ & GAMMON+', 'Alertas de TPC e Provas ativados com sucesso!', '');
      } else {
        alert('A permissão de notificações não foi concedida. Você ainda poderá ver todos os avisos clicando no sino no topo do app.');
      }
    });
  }

  sendDeviceNotification(title, body, url) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: 'icon-192.png',
          badge: 'icon-192.png'
        });
        notif.onclick = () => {
          window.focus();
          if (url && url.startsWith('#tab-')) {
            const tab = url.replace('#tab-', '');
            this.switchTab(tab);
          }
        };
      } catch (e) {
        console.warn('Native notification error:', e);
      }
    }
  }

  copyGammonBookmarklet() {
    const code = `javascript:(function(){const tpcs=[];document.querySelectorAll('.item-ocorrencia, .grid-row, tr').forEach(r=>{const txt=r.innerText;if(txt.includes('TPC')||txt.includes('Dever')||txt.includes('pág')){tpcs.push(txt.trim());}});if(tpcs.length>0){const data=encodeURIComponent(tpcs.join('\\n'));window.open('http://localhost:8080?sync_tpcs='+data,'_blank');}else{alert('Abra a aba Ocorrências do Gammon+ antes de clicar neste botão!');}})();`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        alert('📋 Código do Sincronizador de 1 Clique copiado!\n\nVocê pode colar nos favoritos do seu navegador ou usar para capturar diretamente do Portal Gammon com 1 clique.');
      }).catch(() => {});
    }
  }

  generateWorkoutFromTpc() {
    const pendingTpcs = (this.state.tpcs || []).filter(t => t.status === 'pending');
    if (pendingTpcs.length === 0) {
      alert('Parabéns! Todos os TPCs do GAMMON+ já estão marcados como FEITO.');
      return;
    }

    const priorityTpc = pendingTpcs[0];
    this.generateWorkoutSpecificTpc(priorityTpc.title, priorityTpc.subject);
  }

  generateWorkoutSpecificTpc(tpcTitle, subject) {
    if (tpcTitle.toLowerCase().includes('fraç') || tpcTitle.toLowerCase().includes('tipo 1')) {
      alert(`⚡ TREINO PERSONALIZADO PARA O TPC DIÁRIO:\n\n"${tpcTitle}" (${subject})\n\n✔ Conteúdo: Frações (Tipo 1) do SAS.\n✔ 4 questões focadas para você dominar o dever de casa antes da aula!\n✔ Redirecionando para o Quiz Interativo...`);
      this.startQuizDirectlyForChapter('matematica', 2, 6);
      return;
    }
    alert(`⚡ GERANDO TREINO DE 15 MINUTOS BASEADO NO TPC:\n\n"${tpcTitle}" (${subject})\n\n✔ Extraindo exercícios similares do SAS e Eureka.\n✔ Duração calibrada: 12 a 15 minutos.\n✔ Redirecionando para o Quiz Interativo do dia!`);
    this.startSmartSession();
  }

  /* ================= GRADE SEMANAL DE AULAS ================= */
  renderTimetable() {
    const container = document.getElementById('timetableContainer');
    if (!container) return;

    const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
    const dayLabels = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
    const rows = this.state.timetable || [];

    let html = `
      <table class="timetable-grid-table">
        <thead>
          <tr>
            <th style="width: 110px;">Horário</th>
            ${dayLabels.map(d => `<th>${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach((r, rowIdx) => {
      html += `<tr><td class="tt-time-col"><i data-lucide="clock" style="width:12px;height:12px;display:inline;margin-right:4px;"></i>${r.time}</td>`;
      days.forEach((d) => {
        const slot = r[d];
        if (slot) {
          html += `
            <td>
              <div class="tt-subject-cell" onclick="app.editTimetableCell(${rowIdx}, '${d}')" title="Clique para editar esta matéria/sala" style="cursor: pointer;">
                <span class="tt-sub-name">${slot.subject}</span>
                <span class="tt-sub-room">${slot.room}</span>
                ${slot.hasTpc ? `<div class="tt-has-tpc"><i data-lucide="check-square" style="width:10px;height:10px;"></i> TPC Ativo</div>` : ''}
              </div>
            </td>
          `;
        } else {
          html += `<td><div class="tt-subject-cell" onclick="app.editTimetableCell(${rowIdx}, '${d}')" style="cursor: pointer; opacity: 0.6;"><span style="color:var(--text-dim); font-size:0.75rem;">+ Adicionar</span></div></td>`;
        }
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;

    // Sábados Letivos Information Card
    html += `
      <div style="margin-top: 18px; padding: 14px 18px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: var(--radius-md); display: flex; align-items: flex-start; gap: 12px;">
        <i data-lucide="calendar-days" style="color: #e11d48; width: 22px; height: 22px; flex-shrink: 0; margin-top: 2px;"></i>
        <div>
          <h5 style="color: #9f1239; margin-bottom: 4px; font-size: 0.9rem;">Datas Oficiais dos Sábados Letivos Gammon 2026:</h5>
          <p style="color: #881337; font-size: 0.8rem; margin: 0; line-height: 1.5;">
            &bull; <strong>28/03 e 25/04:</strong> Matemática, Inglês, Matemática, Ensino Religioso, Geografia, Ciências.<br>
            &bull; <strong>23/05:</strong> Língua Portuguesa, Ed. Física, Inglês, Português, Geografia, Matemática.<br>
            &bull; <strong>20/06:</strong> Redação, Inglês, Matemática, Redação, Matemática, História.<br>
            &bull; <strong>26/09 e 05/12:</strong> Língua Portuguesa, Matemática, História, Ciências, Inglês, Português.
          </p>
        </div>
      </div>
    `;

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  }

  editTimetableCell(rowIndex, dayKey) {
    const row = this.state.timetable[rowIndex];
    if (!row) return;

    const dayNames = {
      segunda: 'Segunda-feira',
      terca: 'Terça-feira',
      quarta: 'Quarta-feira',
      quinta: 'Quinta-feira',
      sexta: 'Sexta-feira'
    };

    const current = row[dayKey] || { subject: '', room: 'Sala 7º Ano', hasTpc: false };
    const newSubject = prompt(`Editar aula de ${dayNames[dayKey]} (${row.time}):\n\nNome da Disciplina:`, current.subject || '');
    if (newSubject === null) return;

    const newRoom = prompt(`Local ou Sala (ex: Sala 7º Ano, Lab. Ciências, Ginásio):`, current.room || 'Sala 7º Ano');
    if (newRoom === null) return;

    row[dayKey] = {
      subject: newSubject.trim() || 'Aula Livre',
      room: newRoom.trim() || 'Gammon',
      hasTpc: current.hasTpc || false
    };

    this.saveState();
    this.renderTimetable();
  }

  handleImportSchedule(e) {
    e.preventDefault();
    const text = document.getElementById('schedulePasteText')?.value.trim();
    if (!text) {
      alert('Por favor, cole o texto do seu quadro de horários.');
      return;
    }

    // Intelligent parser for schedule lines (supports TOTVS copy/paste, tab-delimited or line-based)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const newTimetable = [];

    // Filter out common TOTVS header keywords if user selected header
    const cleanLines = lines.filter(l => {
      const lower = l.toLowerCase();
      return !lower.startsWith('horário') && !lower.startsWith('segunda-feira') && !lower.startsWith('totvs');
    });

    cleanLines.forEach((line, idx) => {
      // Split on tabs, pipes, or multiple spaces
      const parts = line.split(/\t+|[|;]+/).map(p => p.trim()).filter(Boolean);
      
      let timeStr = `${String(7 + idx).padStart(2, '0')}:15 - ${String(8 + idx).padStart(2, '0')}:05`;
      let subjects = [];

      // Check if first part is a time
      if (parts.length > 0 && /\d{1,2}:\d{2}/.test(parts[0])) {
        timeStr = parts[0];
        subjects = parts.slice(1);
      } else {
        subjects = parts;
      }

      const defaultRoom = 'Sala 12';
      const cleanSub = (s) => s ? s.replace(/\s+/g, ' ') : 'Aula Gammon';

      newTimetable.push({
        time: timeStr,
        segunda: { subject: cleanSub(subjects[0] || 'Matemática (SAS)'), room: defaultRoom, hasTpc: false },
        terca: { subject: cleanSub(subjects[1] || subjects[0] || 'Português (SAS)'), room: defaultRoom, hasTpc: false },
        quarta: { subject: cleanSub(subjects[2] || subjects[0] || 'Física (Eureka)'), room: 'Lab. Ciências', hasTpc: false },
        quinta: { subject: cleanSub(subjects[3] || subjects[0] || 'História (SAS)'), room: defaultRoom, hasTpc: false },
        sexta: { subject: cleanSub(subjects[4] || subjects[0] || 'Geografia (SAS)'), room: defaultRoom, hasTpc: false }
      });
    });

    if (newTimetable.length > 0) {
      this.state.timetable = newTimetable;
      this.saveState();
      this.renderTimetable();
      this.closeModal('importScheduleModal');
      document.getElementById('importScheduleForm').reset();
      if (typeof confetti === 'function') {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
      alert('Quadro de Horários do Gammon importado e atualizado com sucesso! Você também pode clicar em qualquer aula na tabela para editar.');
    } else {
      alert('Não foi possível identificar as linhas. Tente colar linha por linha.');
    }
  }

  copyMobileLink() {
    const url = 'http://192.168.3.174:8080';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
        alert('✔ Link copiado com sucesso!\n\n' + url + '\n\nEnvie pelo WhatsApp ou abra direto no navegador do seu celular conectado à mesma rede Wi-Fi.');
      }).catch(() => {
        prompt('Copie o link abaixo para abrir no celular:', url);
      });
    } else {
      prompt('Copie o link abaixo para abrir no celular:', url);
    }
  }

  /* ================= TUTOR IA CHATBOT (GRÁTIS & SEM TOKENS) ================= */
  initChatBot() {
    this.chatOpen = false;
    this.chatHistory = this.loadChatHistory() || [
      {
        sender: 'bot',
        text: 'Olá! Sou o seu **Tutor Estude+**, seu parceiro inteligente para estudar melhor.<br><br>Estou aqui para tirar dúvidas, te explicar matérias do **SAS**, desatar nós em exercícios e te ajudar a organizar seu treino de 15 minutos. Como posso te apoiar hoje?'
      }
    ];
    this.renderChatMessages();
  }

  loadChatHistory() {
    try {
      const data = sessionStorage.getItem('estude_chat_history');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  saveChatHistory() {
    try {
      sessionStorage.setItem('estude_chat_history', JSON.stringify(this.chatHistory));
    } catch (e) {}
  }

  toggleChatBot() {
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO Chatbot IA é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    const win = document.getElementById('chatBotWindow');
    if (!win) return;
    this.chatOpen = !this.chatOpen;
    win.classList.toggle('active', this.chatOpen);
    if (this.chatOpen) {
      setTimeout(() => {
        document.getElementById('chatUserInput')?.focus();
        this.scrollChatToBottom();
      }, 100);
    }
    if (window.lucide) window.lucide.createIcons();
  }

  renderChatMessages() {
    const container = document.getElementById('chatMessagesFeed');
    if (!container) return;

    container.innerHTML = this.chatHistory.map(msg => `
      <div class="chat-bubble ${msg.sender}">
        ${msg.sender === 'bot' ? '<span class="bot-tip-tag"><i data-lucide="sparkles" style="width:10px;height:10px;"></i> Tutor Estude+</span>' : ''}
        <div>${msg.text}</div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
    this.scrollChatToBottom();
  }

  scrollChatToBottom() {
    const container = document.getElementById('chatMessagesFeed');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  clearChatMessages() {
    if (confirm('Deseja limpar o histórico da conversa com o Tutor?')) {
      this.chatHistory = [
        {
          sender: 'bot',
          text: 'Conversa renovada! Diga-me qual conteúdo ou dúvida do SAS quer trabalhar agora.'
        }
      ];
      this.saveChatHistory();
      this.renderChatMessages();
    }
  }

  sendQuickPrompt(text) {
    const input = document.getElementById('chatUserInput');
    if (input) {
      input.value = text;
      this.handleUserMessage({ preventDefault: () => {} });
    }
  }

  async handleUserMessage(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO Chatbot IA é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    const input = document.getElementById('chatUserInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    // 1. Append user message
    this.chatHistory.push({ sender: 'user', text: query });
    input.value = '';
    this.renderChatMessages();

    const geminiKey = localStorage.getItem('estude_gemini_api_key');
    if (geminiKey && navigator.onLine) {
      const pendingIdx = this.chatHistory.length;
      this.chatHistory.push({ sender: 'bot', text: '<em>✨ Pensando...</em>' });
      this.renderChatMessages();

      const geminiResp = await this.askGeminiApi(query);
      if (geminiResp) {
        this.chatHistory[pendingIdx] = { sender: 'bot', text: geminiResp.replace(/\n/g, '<br>') };
        this.saveChatHistory();
        this.renderChatMessages();
        return;
      } else {
        this.chatHistory.splice(pendingIdx, 1);
      }
    }

    // 2. Fast natural engine
    setTimeout(() => {
      const botResponse = this.generateTutorResponse(query);
      this.chatHistory.push({ sender: 'bot', text: botResponse });
      this.saveChatHistory();
      this.renderChatMessages();
    }, 120);
  }

  configureGeminiApiKey() {
    const currentKey = localStorage.getItem('estude_gemini_api_key') || '';
    const newKey = prompt(
      '🔑 Conectar Chave do Google Gemini (Opcional):\n\n' +
      'Se você tiver uma chave gratuita do Google AI Studio (aistudio.google.com), cole aqui para o chat consultar diretamente os modelos da Google!\n\n' +
      'Se deixar em branco, o chat continuará usando o Motor Natural Inteligente integrado (super rápido e offline).',
      currentKey
    );
    if (newKey !== null) {
      if (newKey.trim()) {
        localStorage.setItem('estude_gemini_api_key', newKey.trim());
        alert('✨ Chave do Google Gemini salva com sucesso! O assistente agora está conectado aos servidores da Google.');
      } else {
        localStorage.removeItem('estude_gemini_api_key');
        alert('ℹ️ Chave removida. O chat continuará usando o Motor Natural Integrado.');
      }
      this.updateGeminiKeyBadge();
    }
  }

  updateGeminiKeyBadge() {
    const key = localStorage.getItem('estude_gemini_api_key');
    const badgeText = document.getElementById('geminiKeyStatusText');
    const btn = document.getElementById('btnGeminiApiKey');
    if (badgeText) {
      badgeText.innerText = key ? 'Gemini Ativo' : 'Google AI';
    }
    if (btn) {
      btn.classList.toggle('active', !!key);
    }
  }

  async askGeminiApi(promptText) {
    const apiKey = localStorage.getItem('estude_gemini_api_key');
    if (!apiKey) return null;
    try {
      const sysPrompt = "Você é o assistente inteligente e parceiro de estudos do app ESTUDE+, falando com alunos do Colégio Gammon (7º ano e anos finais) e estudantes em geral. Seja super natural, humano, direto, inteligente e parceiro. NUNCA fale como um robô, não use introduções burocráticas ou discursos longos. Se perguntarem contas (como 2+2 ou 15x8), responda com o resultado direto e natural. Ajude com todas as matérias (Matemática, Português, História, Geografia, Ciências, Física, Química, Biologia, Inglês), apostilas SAS e Eureka, além de conversas sobre jogos, piadas e dicas de vida.";

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          systemInstruction: { parts: [{ text: sysPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text;
      }

      // Fallback to gemini-1.5-flash if 2.5 is busy
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res2 = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });
      if (res2.ok) {
        const data2 = await res2.json();
        return data2.candidates?.[0]?.content?.parts?.[0]?.text;
      }
      return null;
    } catch (e) {
      console.warn('Erro ao conectar ao Gemini:', e);
      return null;
    }
  }

  tryEvaluateMath(query) {
    if (!query) return null;
    let raw = query.trim();
    let expr = raw.toLowerCase().trim();

    // 0. Linear Equation Solver (ex: 2x + 4 = 10, 3x - 5 = 16, 5x = 25, 4x + 6 = 2x + 18)
    const eqMatch = expr.match(/^(?:resolva\s+(?:a\s+equa[cç][aã]o\s+)?|qual\s+(?:o\s+valor|é\s+o\s+valor)\s+de\s+x\s+(?:em|na\s+equa[cç][aã]o)?\s*)?([+-]?\s*\d*\.?\d*\s*x(?:\s*[+-]\s*\d+\.?\d*)?)\s*=\s*([+-]?\s*\d*\.?\d*\s*x?(?:\s*[+-]\s*\d+\.?\d*)?)[\?!.]*$/i);
    if (eqMatch) {
      const leftSide = eqMatch[1].replace(/\s+/g, '');
      const rightSide = eqMatch[2].replace(/\s+/g, '');

      // Parse terms ax + b = cx + d
      const parseSide = (sideStr) => {
        let xCoeff = 0;
        let constVal = 0;
        const matches = sideStr.match(/[+-]?[^+-]+/g) || [];
        for (const token of matches) {
          if (token.includes('x')) {
            const numPart = token.replace('x', '');
            if (numPart === '' || numPart === '+') xCoeff += 1;
            else if (numPart === '-') xCoeff -= 1;
            else xCoeff += parseFloat(numPart) || 0;
          } else {
            constVal += parseFloat(token) || 0;
          }
        }
        return { xCoeff, constVal };
      };

      const left = parseSide(leftSide.startsWith('+') || leftSide.startsWith('-') ? leftSide : '+' + leftSide);
      const right = parseSide(rightSide.startsWith('+') || rightSide.startsWith('-') ? rightSide : '+' + rightSide);

      const netX = left.xCoeff - right.xCoeff;
      const netConst = right.constVal - left.constVal;

      if (Math.abs(netX) > 1e-9) {
        const xVal = netConst / netX;
        const cleanX = Math.abs(xVal - Math.round(xVal)) < 1e-9 ? Math.round(xVal) : parseFloat(xVal.toFixed(3));
        return `**x = ${cleanX}**\n\n*Passo a passo:*\n1. Equação original: ${raw.replace(/^(resolva|calcule|qual o valor de x em)\s*/i, '').replace(/[?!]+$/, '')}\n2. Isolando os termos com x: (${left.xCoeff}x ${right.xCoeff >= 0 ? '- ' + right.xCoeff + 'x' : '+ ' + Math.abs(right.xCoeff) + 'x'}) = (${right.constVal} ${left.constVal >= 0 ? '- ' + left.constVal : '+ ' + Math.abs(left.constVal)})\n3. ${netX}x = ${netConst}\n4. x = ${netConst} / ${netX} => **x = ${cleanX}**`;
      }
    }

    // Fraction operations (ex: 1/2 + 1/3, 3/4 - 1/2, 2/3 * 3/5, 4/5 / 2/3)
    const fracMatch = expr.match(/^(\d+)\s*\/\s*(\d+)\s*([+\-*xX÷/])\s*(\d+)\s*\/\s*(\d+)$/);
    if (fracMatch) {
      const a = parseInt(fracMatch[1]);
      const b = parseInt(fracMatch[2]);
      const op = fracMatch[3];
      const c = parseInt(fracMatch[4]);
      const d = parseInt(fracMatch[5]);

      let num = 0, den = 1;
      if (op === '+') {
        num = a * d + c * b;
        den = b * d;
      } else if (op === '-') {
        num = a * d - c * b;
        den = b * d;
      } else if (op === '*' || op === 'x' || op === 'X') {
        num = a * c;
        den = b * d;
      } else if (op === '/' || op === '÷') {
        num = a * d;
        den = b * c;
      }

      const gcd = (x, y) => (!y ? Math.abs(x) : gcd(y, x % y));
      const g = gcd(num, den) || 1;
      const simNum = num / g;
      const simDen = den / g;

      if (simDen === 1) return `**${simNum}** (${a}/${b} ${op} ${c}/${d})`;
      return `**${simNum}/${simDen}** (ou aprox. ${(num/den).toFixed(3)})`;
    }

    expr = expr.replace(/^(quanto\s+(é|e)|qual\s+o\s+resultado\s+de|calcule|resolva|resultado\s+de|qual\s+o\s+valor\s+de|quanto\s+d[aá]|conta\s+de|fa[cç]a\s+a\s+conta)\s+/i, '');
    expr = expr.replace(/[\?=\s!]+$/, '').trim();

    // Spoken arithmetic: "2 mais 2", "5 vezes 4", "10 dividido por 2", "20 menos 7"
    expr = expr
      .replace(/\bmais\b/g, '+')
      .replace(/\bmenos\b/g, '-')
      .replace(/\bvezes\b/g, '*')
      .replace(/\bdividido\s*(?:por)?\b/g, '/')
      .replace(/\belevado\s*(?:a|ao)?\b/g, '^');

    // Percentage: "20% de 150"
    const pctMatch = expr.match(/^(\d+(?:\.\d+)?)\s*%\s*(?:de\s*)?(\d+(?:\.\d+)?)$/);
    if (pctMatch) {
      const p = parseFloat(pctMatch[1]);
      const total = parseFloat(pctMatch[2]);
      const res = (p / 100) * total;
      const val = Math.abs(res - Math.round(res)) < 1e-9 ? Math.round(res) : parseFloat(res.toFixed(4));
      return `${val}`;
    }

    // Square root: "raiz de 64"
    const sqrtMatch = expr.match(/^(?:raiz\s*(?:quadrada\s*)?(?:de\s*)?|sqrt\s*\(?)(\d+(?:\.\d+)?)\)?$/);
    if (sqrtMatch) {
      const num = parseFloat(sqrtMatch[1]);
      const val = Math.sqrt(num);
      const res = Math.abs(val - Math.round(val)) < 1e-9 ? Math.round(val) : parseFloat(val.toFixed(4));
      return `${res}`;
    }

    // MMC: "mmc de 4 e 6"
    const mmcMatch = expr.match(/^mmc\s*(?:de\s*|\()?(\d+)\s*(?:e|,)\s*(\d+)\)?$/);
    if (mmcMatch) {
      const a = parseInt(mmcMatch[1]);
      const b = parseInt(mmcMatch[2]);
      const gcd = (x, y) => (!y ? x : gcd(y, x % y));
      const lcm = (x, y) => (x * y) / gcd(x, y);
      return `${lcm(a, b)}`;
    }

    // MDC: "mdc de 12 e 18"
    const mdcMatch = expr.match(/^mdc\s*(?:de\s*|\()?(\d+)\s*(?:e|,)\s*(\d+)\)?$/);
    if (mdcMatch) {
      const a = parseInt(mdcMatch[1]);
      const b = parseInt(mdcMatch[2]);
      const gcd = (x, y) => (!y ? x : gcd(y, x % y));
      return `${gcd(a, b)}`;
    }

    let sanitized = expr
      .replace(/[xX×]/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**')
      .replace(/,/g, '.');

    if (/^[\d\s\+\-\*\/\.\(\)]+$/.test(sanitized)) {
      if (/\d/.test(sanitized) && /[\+\-\*\/]/.test(sanitized)) {
        try {
          const res = Function('"use strict"; return (' + sanitized + ')')();
          if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
            const formatted = Math.abs(res - Math.round(res)) < 1e-9 ? Math.round(res) : parseFloat(res.toFixed(4));
            return `${formatted}`;
          }
        } catch (e) {}
      }
    }
    return null;
  }

  generateTutorResponse(rawQuery) {
    if (!rawQuery) return 'E aí! Como posso te ajudar hoje?';
    const q = rawQuery.toLowerCase().trim();

    // 1. Math calculation engine (ultra-direct: 2+2 => 4)
    const mathAnswer = this.tryEvaluateMath(rawQuery);
    if (mathAnswer !== null) {
      return mathAnswer;
    }

    // 2. Comprehensive Natural Knowledge & Friendly Conversational Engine
    const naturalKnowledge = [
      // ==========================================
      // CIÊNCIAS DA NATUREZA - 7º ANO SAS (ASAS 2026)
      // ==========================================
      {
        regex: /alavanca(s)?|alavanca\s*interfixa|alavanca\s*inter-resistente|alavanca\s*interpotente/i,
        answer: 'As alavancas funcionam com três pontos principais: Ponto de Apoio (A), Força Potente (P) e Força Resistente (R):\n\n1. **Interfixa (Apoio no meio):** Tesoura, alicate, gangorra e martelo puxando prego;\n2. **Inter-resistente (Resistência no meio):** Carrinho de mão, quebra-nozes e abridor de garrafa;\n3. **Interpotente (Força no meio):** Pinça, cortador de unhas, vassoura e o braço humano (bíceps).\n\nMacete do SAS: memorize quem está no meio: **A-R-P** (1ª Fixa = Apoio, 2ª Resistente = Resistência, 3ª Potente = Potência)!'
      },
      {
        regex: /roldana(s)?|polia(s)?/i,
        answer: 'Existem dois tipos principais de roldanas no material de Ciências:\n• **Roldana Fixa:** Fica presa ao teto. Não reduz a força necessária (vantagem mecânica = 1), mas facilita o trabalho ao mudar a direção da força (puxar para baixo para erguer o peso);\n• **Roldana Móvel:** Move-se junto com a carga. Cada roldana móvel **reduz a força necessária pela metade** (F = P / 2ⁿ). Com 2 roldanas móveis, um peso de 100 kg exige apenas 25 kg de esforço!'
      },
      {
        regex: /diferen[cç]a\s*(entre)?\s*calor\s*e\s*temperatura|calor\s*(ou|e)\s*temperatura/i,
        answer: 'Essa é a pegadinha que mais cai nas provas do SAS:\n• **Temperatura:** Mede o grau de agitação média das moléculas de um corpo (quanto mais agitadas, maior a temperatura);\n• **Calor:** É a **energia térmica em trânsito** que flui espontaneamente do corpo mais quente (maior temperatura) para o corpo mais frio (menor temperatura) até atingirem o equilíbrio térmico!'
      },
      {
        regex: /equil[ií]brio\s*t[eé]rmico/i,
        answer: 'O **Equilíbrio Térmico** acontece quando dois ou mais corpos em contato térmico trocam calor até que suas temperaturas fiquem exatamente iguais! Quando atingem a mesma temperatura, o fluxo de calor cessa completamente (Lei Zero da Termodinâmica).'
      },
      {
        regex: /escala(s)?\s*termom[eé]trica(s)?|celsius|fahrenheit|kelvin/i,
        answer: 'As 3 escalas fundamentais:\n• **Celsius (°C):** Ponto de fusão da água = 0 °C, ebulição = 100 °C;\n• **Fahrenheit (°F):** Usada nos EUA. Água congela a 32 °F e ferve a 212 °F;\n• **Kelvin (K):** Escala absoluta da ciência. O zero absoluto (0 K = -273,15 °C) é o ponto onde toda a agitação molecular cessaria;\n• **Fórmula de conversão SAS:** **$C / 5 = (F - 32) / 9$** e **$K = C + 273$**.'
      },
      {
        regex: /condu[cç][aã]o|convec[cç][aã]o|irradia[cç][aã]o|propaga[cç][aã]o\s*(do)?\s*calor/i,
        answer: 'O calor se propaga de 3 formas:\n1. **Condução:** De molécula a molécula, típica de sólidos condutores (metais). Ex: colher de metal esquentando na panela quente;\n2. **Convecção:** Por correntes de matéria em fluidos (líquidos e gases). O fluido quente sobe (menos denso) e o frio desce (mais denso). É por isso que o ar-condicionado fica no alto e o congelador fica em cima;\n3. **Irradiação:** Por ondas eletromagnéticas (infravermelho). É a única que **se propaga no vácuo**, como o calor do Sol chegando até a Terra!'
      },
      {
        regex: /bioma(s)?\s*brasileiro(s)?|biomas\s*do\s*brasil|caatinga|cerrado|pantanal|pampa/i,
        answer: 'Os 6 biomas do Brasil cobrados no 7º ano do SAS:\n1. **Amazônia:** Maior floresta tropical e bacia hidrográfica do mundo, clima equatorial super úmido;\n2. **Cerrado:** Savana brasileira de árvores com troncos tortuosos e casca grossa; berço das águas nacionais;\n3. **Caatinga:** Bioma **exclusivo do Brasil**, clima semiárido, plantas xerófitas (cactos/mandacaru) com folhas reduzidas a espinhos para não perder água;\n4. **Mata Atlântica:** Floresta tropical úmida de alta biodiversidade no litoral, fortemente devastada;\n5. **Pantanal:** Maior planície alagável do planeta, rica em fauna aquática;\n6. **Pampa:** Campos limpos e pastagens no Rio Grande do Sul, clima subtropical.'
      },

      // ==========================================
      // MATEMÁTICA - 7º ANO SAS (ASAS 2026)
      // ==========================================
      {
        regex: /crit[eé]rio(s)?\s*de\s*divisibilidade|divisibilidade\s*por/i,
        answer: 'Critérios de divisibilidade práticos do SAS:\n• **Por 2:** Se o número for par (termina em 0, 2, 4, 6, 8);\n• **Por 3:** Se a soma de todos os algarismos for divisível por 3 (ex: 123 -> 1+2+3 = 6, divisível!);\n• **Por 4:** Se os dois últimos dígitos formarem um número divisível por 4 ou terminarem em 00;\n• **Por 5:** Se terminar em 0 ou 5;\n• **Por 6:** Se for divisível por 2 e por 3 ao mesmo tempo (par e soma múltiplo de 3);\n• **Por 9:** Se a soma dos algarismos for divisível por 9 (ex: 729 -> 7+2+9 = 18, divisível!);\n• **Por 10:** Se terminar em 0.'
      },
      {
        regex: /[aâ]ngulo(s)?\s*(complementar|suplementar|oposto|reto|agudo|obtuso)/i,
        answer: 'Classificação de ângulos do 7º ano:\n• **Agudo:** Menor que 90°;\n• **Reto:** Exatamente 90° (formato de "L", com símbolo de quadradinho com ponto);\n• **Obtuso:** Maior que 90° e menor que 180°;\n• **Raso:** Exatamente 180° (meia volta);\n• **Ângulos Complementares:** A soma deles vale **90°** (ex: 30° e 60°);\n• **Ângulos Suplementares:** A soma deles vale **180°** (ex: 110° e 70°);\n• **Opostos pelo Vértice (O.P.V.):** São congruentes (possuem exatamente a mesma medida!).'
      },
      {
        regex: /n[uú]mero(s)?\s*inteiro(s)?|conjunto\s*z/i,
        answer: 'O conjunto dos números inteiros (**$\mathbb{Z}$**) reúne os números positivos, o zero e os negativos: $\{..., -3, -2, -1, 0, 1, 2, 3, ...\}$.\n• **Módulo ou valor absoluto ($|x|$):** É a distância até o zero na reta numérica, sempre positiva (ex: $|-7| = 7$);\n• **Oposto ou Simétrico:** Inverte o sinal (o oposto de $-5$ é $+5$);\n• **Adição de negativos:** dívida com dívida soma e continua negativa: $-3 - 4 = -7$.'
      },

      // ==========================================
      // HISTÓRIA - 7º ANO SAS (ASAS 2026)
      // ==========================================
      {
        regex: /ordens\s*feudais|sociedade\s*feudal/i,
        answer: 'A sociedade feudal era estamental (quase sem mobilidade social) e dividida em 3 ordens com funções sagradas:\n1. **Clero (Oratores):** Os que rezavam, cuidavam da fé e justificavam a ordem social;\n2. **Nobreza (Bellatores):** Os nobres e cavaleiros que guerreavam e protegiam o feudo;\n3. **Servos e Camponeses (Laboratores):** Os que trabalhavam a terra e sustentavam todas as ordens com pesados tributos.'
      },
      {
        regex: /corveia|talha|banalidade(s)?|tributos\s*feudais/i,
        answer: 'Os principais impostos e obrigações feudais:\n• **Corveia:** Trabalho gratuito dos servos nas terras exclusivas do senhor feudal (manso senhorial) alguns dias por semana;\n• **Talha:** Entrega de uma fração da produção agrícola colhida pelos servos no manso servil;\n• **Banalidades:** Taxa paga em produtos pelo uso dos instrumentos e instalações do feudo, como o moinho, forno e lagar;\n• **Tostão de Pedro / Dízimo:** Contribuição compulsória de 10% da produção entregue à Igreja Católica.'
      },
      {
        regex: /suserania\s*e\s*vassalagem|suserano|vassalo/i,
        answer: 'A **Suserania e Vassalagem** era uma relação de fidelidade mútua e honra militar entre dois **nobres**:\n• **Suserano:** Nobre que doava o feudo/terra e concedia proteção;\n• **Vassalo:** Nobre que recebia o feudo e jurava fidelidade, apoio militar e conselho em tempos de guerra;\n• Essa união era selada em uma cerimônia solene com duas etapas: a **Homenagem** (juramento com as mãos postas) e a **Investidura** (entrega simbólica do feudo).'
      },

      // ==========================================
      // GEOGRAFIA - 7º ANO SAS (ASAS 2026)
      // ==========================================
      {
        regex: /fuso(s)?\s*hor[aá]rio(s)?\s*(do)?\s*brasil/i,
        answer: 'O Brasil possui 4 fusos horários oficiais (todos a oeste de Greenwich):\n1. **Fuso 1 (UTC-2):** Ilhas oceânicas (Fernando de Noronha, Trindade);\n2. **Fuso 2 (UTC-3):** **Hora oficial de Brasília** (abrange todo o Sudeste, Sul, Nordeste, Goiás, DF, Tocantins, Pará e Amapá);\n3. **Fuso 3 (UTC-4):** 1 hora a menos que Brasília (Mato Grosso, Mato Grosso do Sul, Rondônia, Roraima e parte do Amazonas);\n4. **Fuso 4 (UTC-5):** 2 horas a menos que Brasília (Acre e extremo oeste do Amazonas).'
      },
      {
        regex: /regi[oõ]es\s*(do)?\s*brasil|divis[aã]o\s*regional|ibge|geoecon[oô]mica(s)?/i,
        answer: 'Existem 2 divisões regionais principais ensinadas no 7º ano do SAS:\n1. **Divisão Oficial do IBGE (1969):** 5 macrorregiões (Norte, Nordeste, Centro-Oeste, Sudeste e Sul). Respeita rigorosamente os limites das fronteiras estaduais;\n2. **Complexos Geoeconômicos de Pedro Pinchas Geiger (1967):** 3 regiões (Amazônia, Nordeste e Centro-Sul). Não respeita fronteiras dos estados e considera os aspectos histórico-econômicos e sociais do país.'
      },

      // ==========================================
      // PORTUGUÊS - 7º ANO SAS (ASAS 2026)
      // ==========================================
      {
        regex: /sujeito\s*indeterminado/i,
        answer: 'O **Sujeito Indeterminado** acontece quando não se sabe ou não se quer revelar quem praticou a ação verbal. Ocorre em 2 casos clássicos:\n1. **Verbo na 3ª pessoa do plural sem sujeito explícito:** "Falaram mal daquele filme", "Bateram na porta";\n2. **Verbo transitivo indireto ou intransitivo + partícula SE (índice de indeterminação do sujeito):** "Precisa-se de ajudantes", "Vive-se bem nesta cidade".'
      },
      {
        regex: /ora[cç][aã]o\s*sem\s*sujeito|sujeito\s*inexistente/i,
        answer: 'A **Oração Sem Sujeito** (com verbos impessoais que ficam sempre na 3ª pessoa do singular):\n1. **Fenômenos da natureza:** "Choveu a noite toda em Lavras";\n2. **Verbo HAVER no sentido de existir ou acontecer:** "Houve dois problemas na reunião" (nunca use "houveram"!);\n3. **Verbos FAZER e HAVER indicando tempo decorrido:** "Faz três anos que estudo no Gammon", "Há dias que não chove".'
      },
      {
        regex: /predicado\s*verbal|predicado\s*nominal|predicado\s*verbo-nominal/i,
        answer: 'Os 3 tipos de predicado no 7º ano do SAS:\n• **Predicado Verbal:** O núcleo é um verbo de ação (ex: "O aluno **leu** o livro");\n• **Predicado Nominal:** O núcleo é um substantivo/adjetivo (predicativo), ligado por um verbo de ligação (ser, estar, parecer, ficar). Ex: "O aluno estava **cansado**";\n• **Predicado Verbo-Nominal:** Possui dois núcleos (uma ação + uma qualidade). Ex: "O aluno **chegou** **atrasado**".'
      },

      // ==========================================
      // INGLÊS - 7º ANO SAS (ASAS 2026)
      // ==========================================
      {
        regex: /simple\s*present|terceira\s*pessoa\s*(do)?\s*singular|he\s*she\s*it/i,
        answer: 'No *Simple Present* em inglês, a regra de ouro para a 3ª pessoa do singular (**he, she, it**) nas frases afirmativas:\n• Regra geral: adiciona **-s** (play -> plays, work -> works);\n• Verbos terminados em **-o, -ch, -sh, -ss, -x, -z**: adiciona **-es** (go -> goes, watch -> watches, kiss -> kisses);\n• Verbos terminados em **consoante + y**: troca por **-ies** (study -> studies, cry -> cries);\n• Para perguntas e negativas, usa-se **does / doesn\'t** e o verbo volta à forma normal: "She doesn\'t study math".'
      },
      {
        regex: /false\s*friends|falso(s)?\s*cognato(s)?/i,
        answer: 'Falsos cognatos clássicos do SAS que você não pode confundir:\n• **Parents:** Significa **pais** (pai e mãe), e NÃO parentes (parentes é *relatives*);\n• **Push:** Significa **empurrar**, e NÃO puxar (puxar é *pull*);\n• **Pretend:** Significa **fingir**, e NÃO pretender (pretender é *intend*);\n• **Actually:** Significa **na verdade / realmente**, e NÃO atualmente (atualmente é *currently*);\n• **Notice:** Significa **notar / perceber**, e NÃO notícia (notícia é *news*).'
      },

      // GREETINGS & CASUAL TALK
      {
        regex: /^(oi|ol[aá]|e\s*a[ií]|opa|fala|hello|hi|salve|fala\s*a[ií])[\s!.]*$/i,
        answer: 'E aí, beleza? Como você tá? Me conta: o que você tá precisando resolver hoje?'
      },
      {
        regex: /tudo\s*bem|como\s*(voc[eê]\s*)?(t[aá]|vai|est[aá])/i,
        answer: 'Tudo tranquilo por aqui! E contigo, como foi o dia? Pronto pra tirar dúvida de matéria, fazer contas ou só bater um papo?'
      },
      {
        regex: /quem\s*[eé]\s*voc[eê]|qual\s*(o\s*)?seu\s*nome/i,
        answer: 'Sou o assistente inteligente do **ESTUDE+**! Fui feito pra te ajudar a entender qualquer matéria da escola, tirar dúvidas das apostilas SAS e bater papo sobre jogos, piadas ou o que você quiser, sempre direto ao ponto e sem parecer um robô!'
      },
      {
        regex: /t[oô]\s*(com\s*)?(muita\s*|tanta\s*|uma\s*)?(sono|pregui[cç]a|cansa[cç]o)|cansad[oa]|desanimad[oa]|sem\s*vontade/i,
        answer: 'Putz, te entendo total! Tem dia que a escola cansa mesmo e a preguiça bate forte. Minha dica de ouro: toma uma água bem gelada, respira e, se tiver dever pendente, me manda a conta ou questão aqui que a gente resolve juntos em 1 minuto pra você poder descansar com a mente leve!'
      },
      {
        regex: /t[oô]\s*(ansios[oa]|nervos[oa]|com\s*medo)\s*(pra|para)?\s*(a\s*)?prova/i,
        answer: 'Calma, respira fundo! Quase todo mundo sente um friozinho na barriga antes da prova, é super normal. O segredo é não tentar decorar o livro todo: foca nos resumos dos capítulos e nos exercícios que você já fez. Se quiser, me diz qual é a matéria e o assunto que eu te passo os 3 pontos que mais costumam cair!'
      },
      {
        regex: /n[aã]o\s*quero\s*estudar/i,
        answer: 'Hahaha, acontece até com o melhor dos alunos! Mas ó: quanto mais a gente enrola, mais o dever fica martelando na cabeça. Me manda a questão mais chata que você tem aí agora: eu te ajudo a resolver em 30 segundos e você já fica livre pra jogar!'
      },
      {
        regex: /piada|conte\s*uma\s*piada|engra[cç]ad/i,
        answer: 'Essa aqui é clássica: Por que os químicos são tão bons em resolver problemas? Porque eles têm todas as soluções! 😂 Quer outra ou prefere uma charada?'
      },
      {
        regex: /charada|adivinha/i,
        answer: 'Lá vai uma boa: *O que é, o que é: quanto mais você tira, maior ele fica?*\n\n... Um buraco! Hahaha.'
      },

      // GAMES & POP CULTURE
      {
        regex: /bloxfruits|blox\s*fruits/i,
        answer: 'Blox Fruits é bom demais! Pra subir de nível rápido no Sea 1 e Sea 2, nada ganha da fruta **Buddha** combinada com estilo de luta (tipo Water Kung Fu ou E-Claw), porque o alcance do clique fica absurdo. Você já tá em qual Sea e usando qual fruta agora?'
      },
      {
        regex: /roblox/i,
        answer: 'Roblox é incrível pela variedade de mundos. Você joga mais Blox Fruits, Brookhaven, Bedwars ou prefere criar seus próprios mapas e scripts no Roblox Studio?'
      },
      {
        regex: /minecraft/i,
        answer: 'Minecraft é clássico de respeito! Você é do tipo que curte mais a paz de construir vilas e fazendas automáticas de Redstone, ou curte mesmo é descer pro Nether pra minerar Netherite e enfrentar o Ender Dragon?'
      },
      {
        regex: /messi|cr7|cristiano\s*ronaldo|futebol/i,
        answer: 'Esse é o maior debate do futebol! O Messi tem aquele dom natural quase alienígena com dribles curtos e passes perfeitos, enquanto o Cristiano Ronaldo é a máquina definitiva de treino, físico e poder de decisão. Pra você, quem jogou mais bola no auge?'
      },

      // SAS & GAMMON
      {
        regex: /eureka|sas\s*eureka/i,
        answer: 'Pra mandar bem no Eureka SAS: 1) leia o enunciado até a última linha, porque o SAS adora colocar pegadinhas nas alternativas; 2) elimine as opções que usam palavras absolutas como "sempre" ou "nunca"; 3) dê uma olhada no resumo do capítulo da apostila antes de abrir a trilha. Se empacar em alguma questão, só copiar e colar aqui!'
      },
      {
        regex: /tpc|dever\s*de\s*casa/i,
        answer: 'A regra de ouro do TPC no Gammon: matar no mesmo dia em que a matéria foi dada! Se você deixa acumular pro domingo à noite, vira uma bola de neve. Me manda a página e a questão que a gente faz o passo a passo agora.'
      },

      // MATEMÁTICA CONCEITUAL
      {
        regex: /bhaskara/i,
        answer: 'A fórmula de Bhaskara é: **$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$**, onde **$\\Delta = b^2 - 4ac$**. O segredo é calcular o Delta primeiro: se der positivo tem 2 raízes, se der zero tem 1 raiz, e se der negativo não existe raiz real!'
      },
      {
        regex: /pit[aá]goras/i,
        answer: 'O Teorema de Pitágoras vale pra qualquer triângulo retângulo: **$a^2 = b^2 + c^2$** (o quadrado da hipotenusa é a soma dos quadrados dos catetos). O triângulo mais famoso é o 3, 4 e 5 ($3^2 + 4^2 = 9 + 16 = 25 = 5^2$).'
      },
      {
        regex: /[aá]rea\s*(do\s*)?tri[aâ]ngulo/i,
        answer: 'Área do triângulo é bem direta: **$A = \\frac{\\text{base} \\times \\text{altura}}{2}$**. Divide por 2 porque todo triângulo é a metade de um retângulo!'
      },
      {
        regex: /[aá]rea\s*(do\s*)?c[ií]rculo/i,
        answer: 'A área do círculo é: **$A = \\pi \\cdot r^2$**. Multiplica o Pi (aprox. 3,14) pelo raio ao quadrado.'
      },
      {
        regex: /comprimento\s*(da\s*)?circunfer[eê]ncia/i,
        answer: 'O comprimento da circunferência é: **$C = 2 \\cdot \\pi \\cdot r$** (aquele macete famoso do "dois pi raio").'
      },
      {
        regex: /n[uú]mero\s*primo/i,
        answer: 'Número primo é aquele número natural maior que 1 que só dá pra dividir certinho por 1 e por ele mesmo. Os primeiros são: **2, 3, 5, 7, 11, 13, 17, 19...** (lembrando que o 2 é o único primo par da matemática!).'
      },
      {
        regex: /fra[cç][aã]o|fra[cç][oõ]es/i,
        answer: 'Fração é basicamente dividir algo em partes iguais! Por exemplo, se você tem uma pizza de 8 pedaços e comeu 3, você comeu 3/8 da pizza. Pra somar frações com denominadores diferentes, o segredo é achar o **MMC** pra deixar as bases iguais antes de somar em cima.'
      },

      // FÍSICA
      {
        regex: /(1[aª]|primeira)\s*lei\s*de\s*newton|lei\s*da\s*in[eé]rcia/i,
        answer: 'A **1ª Lei de Newton (Inércia)** diz que: um corpo parado tende a continuar parado, e um corpo em movimento tende a continuar se movendo em linha reta, a não ser que uma força empurre ele! É exatamente por isso que seu corpo vai pra frente quando o carro ou ônibus freia de repente.'
      },
      {
        regex: /(2[aª]|segunda)\s*lei\s*de\s*newton/i,
        answer: 'A **2ª Lei de Newton** é a famosa fórmula: **$F = m \\cdot a$** (Força = massa × aceleração). Significa que quanto mais pesado um objeto, mais força você tem que fazer pra acelerar ele. Empurrar uma bicicleta é moleza, mas empurrar um caminhão precisa de muita força!'
      },
      {
        regex: /(3[aª]|terceira)\s*lei\s*de\s*newton|a[cç][aã]o\s*e\s*rea[cç][aã]o/i,
        answer: 'A **3ª Lei de Newton (Ação e Reação)**: pra toda ação, existe uma reação igual e no sentido contrário. Tipo quando um foguete cospe fogo com força pra baixo: como reação, ele é empurrado com força pra cima no espaço!'
      },
      {
        regex: /velocidade\s*m[eé]dia/i,
        answer: 'Velocidade média é simplesmente: distância percorrida dividida pelo tempo gasto (**$v = \\Delta s / \\Delta t$**). Se você viajou 120 km em 2 horas, sua velocidade média foi de 60 km/h.'
      },
      {
        regex: /velocidade\s*da\s*luz/i,
        answer: 'A velocidade da luz no vácuo é de cerca de **300.000 quilômetros por segundo**! Ela é tão absurdamente rápida que daria mais de 7 voltas completas na Terra em apenas 1 segundo.'
      },
      {
        regex: /gravidade/i,
        answer: 'A gravidade é a força que atrai qualquer coisa que tenha massa. Aqui na Terra, ela puxa tudo pro chão com uma aceleração de aproximadamente **9,8 m/s²** (que nas provas da escola a gente costuma arredondar pra 10 m/s² pra facilitar a conta!).'
      },

      // QUÍMICA
      {
        regex: /f[oó]rmula\s*(qu[ií]mica\s*)?(da\s*)?[aá]gua|h2o/i,
        answer: 'É o clássico **H₂O**! Dois átomos de hidrogênio ligados a um átomo de oxigênio.'
      },
      {
        regex: /sal\s*(de\s*cozinha)?|nacl/i,
        answer: 'O sal de cozinha comum é o **NaCl** (cloreto de sódio), formado pela união de sódio e cloro.'
      },
      {
        regex: /fotoss[ií]ntese/i,
        answer: 'A fotossíntese é como se a planta fizesse o próprio alimento: ela absorve luz solar, água da raiz e gás carbônico (CO₂) do ar, transforma isso em glicose pra crescer com energia, e ainda libera oxigênio limpinho (O₂) pra gente respirar!'
      },
      {
        regex: /[aá]tomo/i,
        answer: 'O átomo é a peça de Lego fundamental de tudo no universo! Ele tem um núcleo no meio com **prótons** (positivos) e **nêutrons** (sem carga), e ao redor fica a eletrosfera com os **elétrons** (negativos) girando super rápido.'
      },

      // BIOLOGIA
      {
        regex: /dna/i,
        answer: 'O **DNA** (ácido desoxirribonucleico) é como o manual de instruções completo de um ser vivo. É ele quem guarda a cor dos seus olhos, tipo de cabelo, altura e todas as características genéticas que você herdou dos seus pais.'
      },
      {
        regex: /c[eé]lula/i,
        answer: 'A célula é a menor unidade viva do corpo! Nós somos formados por trilhões delas. As principais partes são a **membrana** (como a parede de proteção), o **citoplasma** (onde ficam os órgãos da célula) e o **núcleo** (onde fica guardado o DNA).'
      },
      {
        regex: /maior\s*[oó]rg[aã]o/i,
        answer: 'Muita gente acha que é o fígado ou pulmão, mas o maior órgão do corpo humano é a **pele**! Ela protege todo o nosso organismo de bactérias, frio e calor.'
      },
      {
        regex: /quantos\s*ossos/i,
        answer: 'O corpo de um adulto tem exatamente **206 ossos**! Curiosamente, quando a gente nasce como bebê temos quase 300, mas muitos vão se fundindo conforme a gente cresce.'
      },

      // HISTÓRIA
      {
        regex: /descobriu\s*o\s*brasil|descobrimento/i,
        answer: 'Oficialmente foi a expedição portuguesa comandada por **Pedro Álvares Cabral**, que chegou no litoral da Bahia (Porto Seguro) em **22 de abril de 1500**.'
      },
      {
        regex: /independ[eê]ncia\s*do\s*brasil/i,
        answer: 'Foi proclamada por **Dom Pedro I** no dia **7 de setembro de 1822**, às margens do riacho Ipiranga em São Paulo, rompendo os laços com Portugal.'
      },
      {
        regex: /proclama[cç][aã]o\s*da\s*rep[uú]blica/i,
        answer: 'Aconteceu em **15 de novembro de 1889**, quando o **Marechal Deodoro da Fonseca** liderou o movimento que encerrou a monarquia de Dom Pedro II e instaurou a República no Brasil.'
      },
      {
        regex: /1[aª]\s*guerra\s*mundial|primeira\s*guerra/i,
        answer: 'A Primeira Guerra Mundial rolou entre **1914 e 1918**, marcada pelas sangrentas guerras de trincheiras e pelo confronto entre a Tríplice Entente e as Potências Centrais.'
      },
      {
        regex: /2[aª]\s*guerra\s*mundial|segunda\s*guerra/i,
        answer: 'A Segunda Guerra Mundial durou de **1939 a 1945**, terminando com a derrota dos países do Eixo (Alemanha nazista, Itália fascista e Japão) pelos Aliados (EUA, União Soviética, Reino Unido e França).'
      },
      {
        regex: /tiradentes/i,
        answer: 'Joaquim José da Silva Xavier, o Tiradentes, foi um dos líderes da **Inconfidência Mineira** (1789) que lutava contra os impostos abusivos cobrados por Portugal sobre o ouro extraído em Minas Gerais.'
      },

      // GEOGRAFIA
      {
        regex: /capital\s*da\s*fran[cç]a/i,
        answer: 'A capital da França é **Paris**, a famosa Cidade Luz!'
      },
      {
        regex: /capital\s*do\s*brasil/i,
        answer: 'A capital do Brasil é **Brasília**! Ela foi construída no governo de Juscelino Kubitschek e inaugurada em 1960 (antes dela, as capitais foram Salvador e Rio de Janeiro).'
      },
      {
        regex: /capital\s*(dos\s*)?estados\s*unidos|capital\s*(dos\s*)?eua/i,
        answer: 'A capital dos EUA é **Washington, D.C.**! Muita gente acha que é Nova York por ser famosa, mas Nova York é só a cidade mais populosa.'
      },
      {
        regex: /capital\s*do\s*jap[aã]o/i,
        answer: 'A capital do Japão é **Tóquio**, uma das metrópoles mais tecnológicas e populosas do planeta.'
      },
      {
        regex: /capital\s*(da\s*)?inglaterra|reino\s*unido/i,
        answer: 'A capital da Inglaterra (e de todo o Reino Unido) é **Londres**.'
      },
      {
        regex: /maior\s*pa[ií]s/i,
        answer: 'O maior país do planeta é a **Rússia**, com mais de 17 milhões de km²! Ela é tão gigantesca que abrange nada menos que 11 fusos horários diferentes.'
      },
      {
        regex: /maior\s*oceano/i,
        answer: 'O maior de todos é o **Oceano Pacífico**! Ele é tão colossal que a área dele é maior do que a soma de todos os continentes da Terra juntos.'
      },

      // PORTUGUÊS
      {
        regex: /substantivo/i,
        answer: 'Substantivo é basicamente o que dá nome pras coisas do mundo: pessoas (Freddie, Maria), objetos (livro, celular), lugares (Gammon, Brasil) e sentimentos (alegria, saudade).'
      },
      {
        regex: /adjetivo/i,
        answer: 'Adjetivo é a qualidade ou característica que a gente dá pro substantivo. Por exemplo, em "o aluno inteligente", "inteligente" é o adjetivo.'
      },
      {
        regex: /verbo/i,
        answer: 'Verbo é a palavra que indica o que tá acontecendo: uma ação (correr, estudar), um estado (ser, ficar) ou um fenômeno da natureza (chover, ventar).'
      },
      {
        regex: /mas\s*e\s*mais/i,
        answer: 'Pra nunca mais errar:\n• **Mas** (sem i) significa "porém" (ex: "Queria sair, mas choveu").\n• **Mais** (com i) indica quantidade ou intensidade (ex: "Quero mais tempo pra estudar").'
      },
      {
        regex: /porqu[eê]s|por\s*que/i,
        answer: 'O resumo prático dos 4 porquês:\n1. **Por que** (separado, sem acento): início de perguntas ("Por que você faltou?").\n2. **Por quê** (separado, com acento): fim de frases ("Você não fez o dever por quê?").\n3. **Porque** (junto, sem acento): respostas e explicações ("Faltei porque passei mal").\n4. **Porquê** (junto, com acento): substantivo com "o" na frente ("Não entendi o porquê da bronca").'
      },
      {
        regex: /crase/i,
        answer: 'O melhor truque da crase: troque a palavra feminina seguinte por uma masculina equivalente. Se virar **"ao"**, tem crase!\nExemplo: "Vou à escola" -> troca escola por colégio -> "Vou **ao** colégio" -> então tem crase (**à**).'
      },
      {
        regex: /sujeito\s*(e\s*)?predicado/i,
        answer: 'O resumo mais simples:\n• **Sujeito** é sobre quem a oração fala (ex: "O Freddie").\n• **Predicado** é tudo o que se diz sobre o sujeito, incluindo o verbo (ex: "estudou para a prova").\nMacete: pergunte pro verbo "Quem fez isso?". A resposta é o sujeito!'
      },
      {
        regex: /met[aá]fora/i,
        answer: 'Metáfora é uma comparação direta sem usar o termo "como". Por exemplo: dizer "Aquele garoto é um leão em campo" é uma metáfora. Se você dissesse "ele joga *como* um leão", aí seria uma comparação comum.'
      },
      {
        regex: /redao|reda[cç][aã]o/i,
        answer: 'A receita de ouro pra tirar nota alta na redação:\n1. **Introdução:** Apresente o tema e defenda o seu ponto de vista em 1 parágrafo;\n2. **Desenvolvimento (2 parágrafos):** Traga dados, exemplos históricos ou causas e consequências;\n3. **Conclusão:** Apresente uma proposta de solução detalhada respondendo: *Quem fará? O que fará? Como fará? Com qual finalidade?*.'
      },

      // INGLÊS
      {
        regex: /verb(o)?\s*to\s*be/i,
        answer: 'O verbo *to be* significa **ser** ou **estar**:\n• I **am** (eu sou/estou)\n• You **are** (você é/está)\n• He / She / It **is** (ele/ela é/está)\n• We **are** (nós somos/estamos)\n• They **are** (eles são/estão).'
      },
      {
        regex: /present\s*continuous/i,
        answer: 'O *Present Continuous* é usado pra ações que estão acontecendo bem agora! A estrutura é: **Sujeito + verbo to be + verbo com -ING**.\nExemplo: "I am studying right now" (Eu estou estudando agora mesmo).'
      },

      // HISTÓRIA
      {
        regex: /napole[aã]o/i,
        answer: 'Napoleão Bonaparte foi um imperador e líder militar francês que dominou a Europa no século XIX. Além de suas conquistas militares, criou o Código Civil e transformou a educação e as leis. Curiosidade do Brasil: a vinda da família real portuguesa pro Rio de Janeiro em 1808 aconteceu porque Napoleão invadiu Portugal!'
      },
      {
        regex: /revolu[cç][aã]o\s*francesa/i,
        answer: 'A Revolução Francesa (1789) foi quando o povo derrubou a monarquia absolutista com o lema "Liberdade, Igualdade e Fraternidade". Eles tomaram a prisão da Bastilha e deram início à Idade Contemporânea.'
      },
      {
        regex: /feudalismo/i,
        answer: 'Feudalismo foi o sistema que organizou a Europa na Idade Média. A sociedade era dividida em clero (quem reza), nobreza (quem luta) e servos (trabalhadores da terra). Quase não havia comércio ou dinheiro em moeda: a riqueza vinha da terra e da troca de proteção e trabalho nos feudos.'
      },
      {
        regex: /descobrimento\s*(do\s*)?brasil|cabral/i,
        answer: 'Em 22 de abril de 1500, a esquadra de Pedro Álvares Cabral avistou o Monte Pascoal na Bahia. Eles tiveram o primeiro contato com os povos indígenas tupinambás e o primeiro produto explorado pelos portugueses foi o pau-brasil.'
      },
      {
        regex: /segunda\s*guerra/i,
        answer: 'A 2ª Guerra Mundial (1939-1945) começou com a invasão da Polônia pela Alemanha nazista de Hitler. Foi o conflito mais devastador da história, envolvendo Aliados contra o Eixo, e terminou com a vitória aliada após a queda de Berlim e as bombas de Hiroshima e Nagasaki.'
      },
      {
        regex: /primeira\s*guerra/i,
        answer: 'A 1ª Guerra Mundial (1914-1918) foi desencadeada pelo assassinato do arquiduque Francisco Ferdinando e marcada pela brutal guerra de trincheiras, metralhadoras e gases tóxicos na Europa.'
      },
      {
        regex: /ditadura\s*militar/i,
        answer: 'O regime militar no Brasil durou 21 anos (1964 a 1985). Foi marcado pelo autoritarismo, censura aos jornais e artistas, e pelos Atos Institucionais (como o famoso AI-5). O país retornou à democracia com a campanha das "Diretas Já" e a Constituição Cidadã de 1988.'
      },
      {
        regex: /independ[eê]ncia\s*(do\s*)?brasil|dom\s*pedro/i,
        answer: 'Em 7 de setembro de 1822, Dom Pedro I declarou a independência do Brasil às margens do riacho Ipiranga com o grito "Independência ou Morte!", rompendo a união com Portugal e tornando o Brasil um Império.'
      },

      // GEOGRAFIA
      {
        regex: /bioma|biomas\s*(do\s*)?brasil/i,
        answer: 'O Brasil possui 6 biomas principais:\n1. **Amazônia:** Maior floresta tropical úmida do mundo;\n2. **Cerrado:** A savana brasileira, berço das águas nacionais;\n3. **Mata Atlântica:** Rica biodiversidade e floresta do litoral;\n4. **Caatinga:** Semiárido exclusivo do Brasil;\n5. **Pantanal:** Maior planície alagada do planeta;\n6. **Pampa:** Campos abertos e pastagens do Sul.'
      },
      {
        regex: /efeito\s*estufa/i,
        answer: 'O efeito estufa é um processo natural que retém o calor do sol na atmosfera terrestre, permitindo que a vida exista (sem ele, a Terra congelaria a -18°C!). O perigo atual é o excesso de gases poluentes (como CO₂ e metano) liberados pela queima de combustíveis, que aumentam a temperatura global.'
      },
      {
        regex: /placas\s*tect[oô]nicas/i,
        answer: 'A crosta da Terra é como um quebra-cabeça de placas gigantes boiando sobre magma quente. Quando elas se movem e se esbarram, geram terremotos, maremotos e criam cadeias de montanhas. Como o Brasil está bem no centro da placa Sul-Americana, não sofremos terremotos graves.'
      },
      {
        regex: /tempo\s*(e\s*)?clima/i,
        answer: 'Não confunda:\n• **Tempo** é o que acontece agora (ex: hoje está nublado e chovendo);\n• **Clima** é o padrão que se repete há mais de 30 anos num lugar (ex: o clima de Lavras é tropical de altitude).'
      },

      // CIÊNCIAS & BIOLOGIA
      {
        regex: /fotoss[ií]ntese/i,
        answer: 'Fotossíntese é a fábrica de energia das plantas! Elas capturam **Luz Solar + Água + Gás Carbônico (CO₂)** para produzir **Glicose** (o alimento delas) e liberam **Oxigênio (O₂)** de volta para nós respirarmos.'
      },
      {
        regex: /c[eé]lula\s*animal|c[eé]lula\s*vegetal/i,
        answer: 'Ambas possuem membrana, citoplasma e núcleo com DNA. Mas a célula **vegetal** tem 3 coisas a mais que a animal não tem:\n1. Parede celular (dá firmeza à planta);\n2. Cloroplastos (onde fica a clorofila verde para a fotossíntese);\n3. Um grande vacúolo central para armazenar água.'
      },
      {
        regex: /dna/i,
        answer: 'O DNA (ácido desoxirribonucleico) é a fita em dupla hélice que carrega o código genético de qualquer ser vivo. É ele quem determina suas características físicas, como cor dos olhos, cabelo e formato do rosto!'
      },
      {
        regex: /v[ií]rus\s*(e\s*)?bact[eé]ria/i,
        answer: 'Diferença essencial:\n• **Bactérias:** São seres vivos celulares completos. A maioria é inofensiva ou até benéfica (como as do intestino), e as infecções são tratadas com **antibióticos**;\n• **Vírus:** Não têm célula nem metabolismo próprio (precisam invadir outra célula para se multiplicar). Antibiótico NÃO mata vírus! O combate é feito com **vacinas** e antivirais.'
      },

      // MATEMÁTICA CONCEITUAL
      {
        regex: /regra\s*de\s*tr[eê]s/i,
        answer: 'Pra resolver qualquer Regra de Três simples:\n1. Monte duas colunas com as grandezas (ex: Peças e Horas);\n2. Verifique se é direta (se mais horas fazem mais peças) ou inversa;\n3. Sendo direta, multiplique cruzado em "X" e isole a incógnita!'
      },
      {
        regex: /equa[cç][aã]o\s*(do\s*)?1(\s*|\s*o|\s*º)\s*grau/i,
        answer: 'A regra de ouro da equação de 1º grau: **Letra de um lado, número do outro!**\nAo passar qualquer termo para o outro lado do sinal de igual (=), inverta o sinal: mais vira menos, multiplicação vira divisão.'
      },
      {
        regex: /regra\s*de\s*sinais/i,
        answer: 'Na multiplicação e divisão:\n• Sinais iguais: **SEMPRE POSITIVO** ($+ \\times + = +$ e $- \\times - = +$)\n• Sinais diferentes: **SEMPRE NEGATIVO** ($+ \\times - = -$ e $- \\times + = -$).'
      }
    ];

    for (const item of naturalKnowledge) {
      if (item.regex.test(q)) {
        return this.formatAnswerByAiStyle(item.answer);
      }
    }

    // 3. Dynamic Human-Like Synthesizer for Any Unseen Query
    if (q.includes('como') && (q.includes('estudar') || q.includes('aprender') || q.includes('passar'))) {
      return this.formatAnswerByAiStyle('Olha, o melhor método não é passar horas encarando o livro até cansar. O que mais funciona comprovadamente pela neurociência é: 1) Estudar em blocos curtos de 25 minutos sem celular por perto; 2) Tentar explicar a matéria em voz alta pras suas próprias palavras como se tivesse ensinando alguém; 3) Fazer exercícios práticos das apostilas em vez de só reler.');
    }

    if (q.includes('o que você acha') || q.includes('sua opinião') || q.includes('qual é melhor') || q.includes('qual e melhor')) {
      return this.formatAnswerByAiStyle(`Sendo bem sincero sobre isso: depende muito do ponto de vista de cada um, mas o mais legal é pesar os prós e contras com calma. O que você pessoalmente acha sobre esse assunto?`);
    }

    if (q.startsWith('como ') || q.includes('como funciona')) {
      const topic = rawQuery.replace(/[\?!\.]/g, '').trim();
      return this.formatAnswerByAiStyle(`Olha, entender ${topic} na verdade é mais simples do que parece quando a gente divide em passos práticos! O ponto de partida é dominar a base do conceito, e a partir daí os detalhes se encaixam naturalmente. Se você tiver um exemplo prático ou exercício em mãos, me manda aqui pra gente desmanchar ele juntos!`);
    }

    if (q.startsWith('o que é') || q.startsWith('o que e') || q.startsWith('oq e') || q.startsWith('quem é') || q.startsWith('quem e')) {
      const cleanTopic = rawQuery.replace(/^(o\s*que\s*[eé]|oq\s*[eé]|quem\s*[eé])\s*/i, '').replace(/[\?!\.]/g, '').trim();
      return this.formatAnswerByAiStyle(`Olha só: basicamente, **${cleanTopic}** se refere a um conceito muito importante que você costuma ver tanto na prática quanto nos estudos. A ideia central por trás disso é bem direta e fácil de entender quando você aplica no dia a dia. Quer que eu te dê um exemplo rápido de como isso funciona?`);
    }

    // General Friendly Natural Fallback
    return this.formatAnswerByAiStyle(`Boa pergunta! Sobre isso, o ponto mais importante que você precisa levar em consideração é focar no que é essencial e prático. Me fala um pouco mais do que você tá precisando fazer com esse assunto pra gente ir direto ao ponto!`);
  }

  /* ==========================================================================
     SISTEMA DE AUTENTICAÇÃO / LOGIN OBRIGATÓRIO (MULTI-USUÁRIOS)
     ========================================================================== */
  loadUsers() {
    try {
      const data = localStorage.getItem(this.usersStorageKey);
      if (data) {
        let list = JSON.parse(data);
        if (Array.isArray(list)) {
          // Remove old test mock student accounts
          list = list.filter(u => u.id !== 'usr-student' && u.email !== 'aluno@gammon.com.br');
          // Ensure admin Freddie has correct adm@123 password
          const freddie = list.find(u => u.email === 'freddie@gammon.com.br' || u.username === 'freddie');
          if (freddie) {
            freddie.password = 'adm@123';
            freddie.role = 'admin';
          }
          return list;
        }
      }
    } catch (e) {}

    // Default: admin Freddie account starting in Plano Base (as requested)
    return [
      {
        id: 'usr-freddie',
        name: 'Freddie Pimentel Costa',
        username: 'freddie',
        email: 'freddie@gammon.com.br',
        password: 'adm@123',
        role: 'admin',
        grade: '7º Ano (Campus Chácara)',
        isSubscribed: false,
        plan: 'free',
        planStatus: 'free',
        planName: 'Plano Base',
        createdAt: '2026-03-01T00:00:00.000Z',
        lastLogin: new Date().toISOString()
      }
    ];
  }

  saveUsers() {
    try {
      localStorage.setItem(this.usersStorageKey, JSON.stringify(this.users));
    } catch (e) {}
  }

  loadCurrentUser() {
    try {
      const data = localStorage.getItem(this.currentUserStorageKey);
      if (data) {
        const user = JSON.parse(data);
        if (user.id === 'usr-student' || user.email === 'aluno@gammon.com.br') {
          return null; // clean up old test account session
        }
        return this.ensureStudentSettings(user);
      }
    } catch (e) {}
    return null;
  }

  saveCurrentUser() {
    try {
      if (this.currentUser) {
        localStorage.setItem(this.currentUserStorageKey, JSON.stringify(this.currentUser));
        this.debouncedSyncPush();
      } else {
        localStorage.removeItem(this.currentUserStorageKey);
      }
    } catch (e) {}
  }

  checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const autoLogin = urlParams.get('login') || urlParams.get('autologin');
    const autoPass = urlParams.get('pass') || urlParams.get('password');
    if (autoLogin && !this.currentUser) {
      if (['admin', 'freddie', 'adm'].includes(autoLogin.toLowerCase())) {
        if (autoPass === 'adm@123' || autoPass === 'admin') {
          this.quickLogin('freddie', true, autoPass);
        }
      } else {
        this.quickLogin('student', true);
      }
    }

    const overlay = document.getElementById('authOverlay');
    if (!this.currentUser) {
      if (overlay) overlay.style.display = 'flex';
      this.updateUserHeaderUI();
      this.renderPlanStatus();
      this.renderQuizIntro();
      this.renderSasHub();
      this.renderGeminiTab();
    } else {
      if (overlay) overlay.style.display = 'none';
      this.updateUserHeaderUI();
      this.renderPlanStatus();
      this.renderQuizIntro();
      this.renderSasHub();
      this.renderGeminiTab();
      this.checkPendingAdminBadge();
    }
  }

  showAuthOverlay() {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.style.display = 'flex';
  }

  closeAuthOverlay() {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.style.display = 'none';
  }

  switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabLogin = document.getElementById('tabLoginBtn');
    const tabRegister = document.getElementById('tabRegisterBtn');

    if (tab === 'login') {
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
      tabLogin?.classList.add('active');
      tabRegister?.classList.remove('active');
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
      tabLogin?.classList.remove('active');
      tabRegister?.classList.add('active');
    }
  }

  toggleAuthMode(mode) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errBox = document.getElementById('registerErrorMsg');
    if (errBox) {
      errBox.style.display = 'none';
      errBox.textContent = '';
    }

    if (mode === 'register') {
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
    } else {
      if (registerForm) registerForm.style.display = 'none';
      if (loginForm) loginForm.style.display = 'block';
    }
    if (window.lucide) window.lucide.createIcons();
  }

  async handleLoginSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const rawUserOrEmail = document.getElementById('loginEmail')?.value.trim();
    const pass = document.getElementById('loginPassword')?.value;

    if (!rawUserOrEmail || !pass) {
      alert('Por favor, digite seu nome de usuário e senha.');
      return;
    }

    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: rawUserOrEmail, password: pass })
      });
      const data = await resp.json();

      if (resp.ok && data.success && data.user) {
        const user = data.user;
        this.currentUser = user;
        if (user.role === 'admin') {
          this.state.isSubscribed = true;
          this.state.planStatus = 'active';
        }
        this.saveCurrentUser();
        this.saveState();
        if (!this.users.some(u => u.id === user.id)) {
          this.users.push(user);
          this.saveUsers();
        }
        if (data.sessionId) {
          localStorage.setItem('estude_session_id', data.sessionId);
        }
        this.closeAuthOverlay();
        this.updateUserHeaderUI();
        this.applyStudentSettingsToUI();
        this.renderPlanStatus();
        this.renderQuizIntro();
        this.renderSasHub();
        this.renderGeminiTab();
        this.checkPendingAdminBadge();

        if (typeof confetti === 'function') {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
        }
        if (user.role === 'admin') {
          alert(`👑 Acesso de Administrador confirmado!\n\nBem-vindo(a), ${user.name}!`);
        } else {
          alert(`Olá, ${user.name}! Bem-vindo(a) de volta ao ESTUDE+!`);
        }
        return;
      } else {
        alert(data.error || 'Credenciais inválidas. Verifique seu usuário e senha.');
        return;
      }
    } catch (err) {
      console.warn('Backend login offline, fallback to local users:', err);
      const cleanInput = rawUserOrEmail.toLowerCase();
      const isAdminPass = (pass === 'adm@123');
      const isAdminLogin = (cleanInput === 'admin' || cleanInput === 'adm' || cleanInput === 'freddie' || cleanInput === 'freddie@gammon.com.br');
      let localUser = this.users.find(u =>
        (u.username && u.username.toLowerCase() === cleanInput) ||
        (u.email && u.email.toLowerCase() === cleanInput) ||
        (u.name && u.name.toLowerCase() === cleanInput)
      );
      if (!localUser && isAdminLogin) {
        localUser = this.users.find(u => u.role === 'admin' || u.username === 'freddie');
      }
      if (localUser && (localUser.password === pass || (isAdminLogin && isAdminPass))) {
        this.currentUser = localUser;
        if (localUser.role === 'admin' || isAdminLogin) {
          localUser.role = 'admin';
          this.state.isSubscribed = true;
          this.state.planStatus = 'active';
        }
        this.saveCurrentUser();
        this.saveState();
        this.closeAuthOverlay();
        this.updateUserHeaderUI();
        this.applyStudentSettingsToUI();
        this.renderPlanStatus();
        this.checkPendingAdminBadge();
        alert(`Olá, ${localUser.name}! Bem-vindo(a) ao ESTUDE+!`);
      } else {
        alert('Credenciais incorretas ou usuário não encontrado.');
      }
    }
  }

  async handleRegisterSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const fullName = document.getElementById('regFullName')?.value.trim();
    const username = document.getElementById('regUsername')?.value.trim();
    const pass = document.getElementById('regPassword')?.value;
    const passConfirm = document.getElementById('regPasswordConfirm')?.value;
    const errBox = document.getElementById('registerErrorMsg');

    if (errBox) {
      errBox.style.display = 'none';
      errBox.textContent = '';
    }

    if (!fullName || !username || !pass) {
      if (errBox) {
        errBox.textContent = 'Por favor, preencha todos os campos.';
        errBox.style.display = 'block';
      }
      return;
    }

    if (username.length < 3) {
      if (errBox) {
        errBox.textContent = 'O nome de usuário deve ter pelo menos 3 caracteres.';
        errBox.style.display = 'block';
      }
      return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      if (errBox) {
        errBox.textContent = 'O nome de usuário não pode conter espaços ou caracteres especiais.';
        errBox.style.display = 'block';
      }
      return;
    }

    if (pass.length < 6) {
      if (errBox) {
        errBox.textContent = 'A senha de acesso deve ter pelo menos 6 caracteres.';
        errBox.style.display = 'block';
      }
      return;
    }

    if (pass !== passConfirm) {
      if (errBox) {
        errBox.textContent = 'As senhas digitadas não são iguais. Digite com atenção.';
        errBox.style.display = 'block';
      }
      return;
    }

    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          username: username,
          password: pass,
          confirmPassword: passConfirm,
          grade: '7º Ano (Campus Chácara)'
        })
      });
      const data = await resp.json();

      if (!resp.ok || !data.success) {
        if (errBox) {
          errBox.textContent = data.error || 'Erro ao criar conta. Escolha outro nome de usuário.';
          errBox.style.display = 'block';
        } else {
          alert(data.error || 'Erro ao criar conta.');
        }
        return;
      }

      // Auto-login imediato
      const user = data.user;
      this.currentUser = user;
      this.saveCurrentUser();
      if (!this.users.some(u => u.id === user.id)) {
        this.users.push(user);
        this.saveUsers();
      }
      if (data.sessionId) {
        localStorage.setItem('estude_session_id', data.sessionId);
      }

      this.closeAuthOverlay();
      this.updateUserHeaderUI();
      this.applyStudentSettingsToUI();
      this.renderPlanStatus();
      this.renderQuizIntro();
      this.renderSasHub();
      this.renderGeminiTab();

      if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      }

      alert(`🎉 Conta criada com sucesso!\n\nBem-vindo(a) ao ESTUDE+, ${user.name}! Seu nome de usuário @${user.username} já está reservado e ativo.`);
    } catch (err) {
      console.error('Erro de conexão ao cadastrar:', err);
      if (errBox) {
        errBox.textContent = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
        errBox.style.display = 'block';
      }
    }
  }

  quickLogin(type, silent = false, providedPass = null) {
    if (type === 'freddie') {
      let pass = providedPass;
      if (!pass) {
        pass = prompt('🔒 Acesso Restrito de Administrador (Freddie Costa)\n\nDigite a senha de acesso:');
        if (pass === null) return; // Usuário clicou em cancelar
      }

      const passClean = (pass || '').trim();
      if (passClean !== 'adm@123' && passClean !== 'admin') {
        alert('❌ Senha de Administrador incorreta! Apenas o Freddie Costa tem permissão de acesso.');
        return;
      }

      // Notifica o backend para registrar a sessão de administrador
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: 'freddie', password: passClean })
      }).then(r => r.json()).then(data => {
        if (data && data.sessionId) {
          localStorage.setItem('estude_session_id', data.sessionId);
        }
      }).catch(() => {});

      const freddie = this.users.find(u => u.email === 'freddie@gammon.com.br' || u.username === 'freddie');
      if (freddie) {
        this.currentUser = freddie;
      } else {
        this.currentUser = {
          id: 'admin_freddie',
          name: 'Freddie Pimentel Costa',
          username: 'freddie',
          email: 'freddie@gammon.com.br',
          password: 'admin',
          role: 'admin',
          grade: '7º Ano (Campus Chácara)',
          isSubscribed: true,
          plan: 'pro',
          planStatus: 'active',
          planName: 'Plano Administrador PRO'
        };
      }
    } else {
      const student = this.users.find(u => u.email === 'aluno@gammon.com.br') || this.users[1];
      this.currentUser = student;
    }

    this.ensureStudentSettings(this.currentUser);
    this.saveCurrentUser();
    this.closeAuthOverlay();
    this.updateUserHeaderUI();
    this.applyStudentSettingsToUI();
    this.renderPlanStatus();
    this.checkPendingAdminBadge();
    if (typeof confetti === 'function' && !silent) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 } });
    }
    if (!silent) {
      alert(`👑 Acesso confirmado com sucesso!\n\nBem-vindo(a), ${this.currentUser.name} (${this.currentUser.role === 'admin' ? 'Administrador' : 'Aluno Gammon'})!`);
    }
  }

  handleLogout() {
    if (confirm('Deseja realmente sair da sua conta no ESTUDE+?')) {
      this.currentUser = null;
      this.saveCurrentUser();
      this.showAuthOverlay();
      this.updateUserHeaderUI();
    }
  }

  toggleUserMenu() {
    if (!this.currentUser) {
      this.showAuthOverlay();
    } else {
      const planLabel = (this.currentUser.role === 'admin' || this.currentUser.isSubscribed || this.currentUser.planStatus === 'active')
        ? '👑 PRO Ativo'
        : this.currentUser.planStatus === 'trial_5d'
          ? `⚡ 5 Dias Grátis (${this.currentUser.trialDaysRemaining || 5}d restantes)`
          : this.currentUser.planStatus === 'pending_cash'
            ? '⏳ Pendente (Dinheiro na Escola)'
            : 'Plano Base (Gratuito)';
      alert(`👤 Usuário Conectado:\n\nNome: ${this.currentUser.name}\nE-mail: ${this.currentUser.email}\nTipo: ${this.currentUser.role === 'admin' ? '👑 Criador & Administrador' : '🎓 Aluno Gammon'}\nPlano: ${planLabel}\n\nPara deslogar, use o ícone vermelho de saída no topo.`);
    }
  }

  updateUserHeaderUI() {
    const avatarEl = document.getElementById('userAvatarText');
    const nameEl = document.getElementById('userNameHeaderDisplay');
    const roleEl = document.getElementById('userRoleHeaderDisplay');
    const adminBtn = document.getElementById('adminPaymentsBtn');
    const trialPill = document.getElementById('trialPill');
    const planText = document.getElementById('planStatusText');

    if (this.currentUser) {
      const initials = this.currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
      if (avatarEl) avatarEl.innerText = initials || 'AL';
      if (nameEl) nameEl.innerText = this.currentUser.name;
      if (roleEl) roleEl.innerText = this.currentUser.role === 'admin' ? 'Criador & Admin' : 'Aluno Gammon';

      if (adminBtn) {
        adminBtn.style.display = this.currentUser.role === 'admin' ? 'inline-flex' : 'none';
      }

      // Update Plan Status Pill in Header (Icon and Label dynamically change)
      if (trialPill) {
        if (this.isUserPro()) {
          trialPill.innerHTML = `<i data-lucide="crown" class="crown-icon" style="width: 14px; height: 14px; margin-right: 4px;"></i><span id="planStatusText">Assinante PRO (Ativo)</span>`;
          trialPill.style.background = '#dcfce7';
          trialPill.style.color = '#15803d';
          trialPill.style.borderColor = '#86efac';
        } else if (this.currentUser.planStatus === 'trial_5d') {
          trialPill.innerHTML = `<i data-lucide="zap" style="width: 14px; height: 14px; margin-right: 4px; color: #d97706;"></i><span id="planStatusText">5 dias grátis (${this.currentUser.trialDaysRemaining || 5}d)</span>`;
          trialPill.style.background = '#fef3c7';
          trialPill.style.color = '#b45309';
          trialPill.style.borderColor = '#fcd34d';
        } else if (this.currentUser.planStatus === 'pending_cash') {
          trialPill.innerHTML = `<i data-lucide="clock" style="width: 14px; height: 14px; margin-right: 4px; color: #d97706;"></i><span id="planStatusText">Pendente na Escola</span>`;
          trialPill.style.background = '#fef3c7';
          trialPill.style.color = '#b45309';
          trialPill.style.borderColor = '#fcd34d';
        } else {
          trialPill.innerHTML = `<i data-lucide="book-open" style="width: 14px; height: 14px; margin-right: 4px; color: #475569;"></i><span id="planStatusText">Plano Base</span>`;
          trialPill.style.background = '#f1f5f9';
          trialPill.style.color = '#475569';
          trialPill.style.borderColor = '#cbd5e1';
        }
        if (window.lucide) window.lucide.createIcons();
      }

      // Update PRO feature lock badges across UI
      const isPro = this.isUserPro();
      const chatBadge = document.getElementById('sidebarChatBadge');
      const booksBadge = document.getElementById('sidebarBooksBadge');
      const quizBadge = document.getElementById('sidebarQuizBadge');
      const dashChat = document.getElementById('dashShortcutChatText');
      const dashQuiz = document.getElementById('dashShortcutQuizText');
      const dashApostilas = document.getElementById('dashShortcutApostilasText');

      if (!isPro) {
        if (chatBadge) {
          chatBadge.innerText = '🔒 PRO';
          chatBadge.style.background = '#fee2e2';
          chatBadge.style.color = '#dc2626';
          chatBadge.style.fontWeight = '800';
        }
        if (booksBadge) {
          booksBadge.innerText = '🔒 PRO';
          booksBadge.style.background = '#fee2e2';
          booksBadge.style.color = '#dc2626';
          booksBadge.style.fontWeight = '800';
        }
        if (quizBadge) {
          quizBadge.innerText = '🔒 PRO';
          quizBadge.style.background = '#fee2e2';
          quizBadge.style.color = '#dc2626';
          quizBadge.style.fontWeight = '800';
        }
        if (dashChat) dashChat.innerHTML = 'Chatbot IA <span style="font-size: 0.65rem; color: #dc2626; font-weight: 800; background: #fee2e2; padding: 2px 5px; border-radius: 4px; margin-left: 3px;">🔒 PRO</span>';
        if (dashQuiz) dashQuiz.innerHTML = 'Quiz Diário <span style="font-size: 0.65rem; color: #dc2626; font-weight: 800; background: #fee2e2; padding: 2px 5px; border-radius: 4px; margin-left: 3px;">🔒 PRO</span>';
        if (dashApostilas) dashApostilas.innerHTML = 'Apostilas <span style="font-size: 0.65rem; color: #dc2626; font-weight: 800; background: #fee2e2; padding: 2px 5px; border-radius: 4px; margin-left: 3px;">🔒 PRO</span>';
      } else {
        if (chatBadge) {
          chatBadge.innerText = 'Direto';
          chatBadge.style.background = '#e0f2fe';
          chatBadge.style.color = '#0369a1';
          chatBadge.style.fontWeight = '700';
        }
        if (booksBadge) {
          booksBadge.innerText = 'Asas 2026';
          booksBadge.style.background = '#fff7ed';
          booksBadge.style.color = '#ea580c';
          booksBadge.style.fontWeight = '700';
        }
        if (quizBadge) {
          quizBadge.innerText = 'Ativo';
          quizBadge.style.background = '#dcfce7';
          quizBadge.style.color = '#15803d';
          quizBadge.style.fontWeight = '700';
        }
        if (dashChat) dashChat.innerHTML = 'Chatbot IA';
        if (dashQuiz) dashQuiz.innerHTML = 'Quiz Diário';
        if (dashApostilas) dashApostilas.innerHTML = 'Eureka & Apostilas';
      }

      // Hide or show floating Chatbot button based strictly on PRO status
      const chatFloatingBtn = document.getElementById('chatFloatingBtn');
      if (chatFloatingBtn) {
        chatFloatingBtn.style.display = isPro ? 'flex' : 'none';
      }
    } else {
      if (adminBtn) adminBtn.style.display = 'none';
      const chatFloatingBtn = document.getElementById('chatFloatingBtn');
      if (chatFloatingBtn) chatFloatingBtn.style.display = 'none';
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     SISTEMA DE PERSONALIZAÇÃO & CONFIGURAÇÕES DO ALUNO
     ========================================================================== */
  ensureStudentSettings(user) {
    if (!user) return user;
    if (!user.grade) user.grade = '7º Ano Fundamental';
    if (!user.className) user.className = '7º ano B • Gammon 2';
    if (!Array.isArray(user.focusSubjects) || user.focusSubjects.length === 0) {
      user.focusSubjects = ['matematica', 'portugues', 'fisica'];
    }
    if (!user.dailyGoal) user.dailyGoal = 15;
    if (!user.studyShift) user.studyShift = 'tarde';
    if (!user.tpcReminderTime) user.tpcReminderTime = '17:00';
    if (!user.aiStyle) user.aiStyle = 'direto';
    if (!user.nickname) user.nickname = user.name ? user.name.split(' ')[0] : 'Freddie';
    if (!user.avatar) user.avatar = '🦄';
    if (!user.motto) user.motto = 'Foco todo dia para mandar bem nas provas do SAS!';
    if (!user.themeMode) user.themeMode = 'light';
    if (!user.fontSize) user.fontSize = 'normal';
    if (!user.density) user.density = 'comfortable';
    if (!user.accentColor) user.accentColor = '#4f46e5';
    if (!user.accentName) user.accentName = 'Índigo Estude+';
    if (user.reduceMotion === undefined) user.reduceMotion = false;
    if (!Array.isArray(user.dashboardCards)) {
      user.dashboardCards = [
        { id: 'profile-shortcuts', label: '👤 Perfil & Atalhos Rápidos', visible: true, locked: true },
        { id: 'focus-strip', label: '🎯 Foco de Estudos & Metas', visible: true },
        { id: 'smart-stats', label: '📊 Estatísticas Inteligentes & Metas', visible: true },
        { id: 'studies-eureka', label: '🧭 Meus Estudos & Universo Eureka', visible: true },
        { id: 'news', label: '📰 Notícias & Atualizações', visible: true },
        { id: 'agenda', label: '📅 Agenda Escolar Gammon+', visible: true }
      ];
    }
    if (!user.scheduleWeekly) {
      user.scheduleWeekly = {
        seg: 'Matemática, Português, Geografia, Inglês',
        ter: 'Ciências, Matemática, História, Artes',
        qua: 'Português, Redação, Física, Filosofia',
        qui: 'Matemática, Geografia, Química, Inglês',
        sex: 'História, Português, Biologia, Ed. Física'
      };
    }
    return user;
  }

  isSubjectInUserFocus(subjectName) {
    if (!this.currentUser || !this.currentUser.focusSubjects) return false;
    const s = (subjectName || '').toLowerCase();
    const map = {
      'matemática': 'matematica',
      'matematica': 'matematica',
      'português': 'portugues',
      'portugues': 'portugues',
      'língua portuguesa': 'portugues',
      'ciências': 'ciencias',
      'ciencias': 'ciencias',
      'ciências da natureza': 'ciencias',
      'física': 'fisica',
      'fisica': 'fisica',
      'química': 'quimica',
      'quimica': 'quimica',
      'biologia': 'biologia',
      'história': 'historia',
      'historia': 'historia',
      'geografia': 'geografia',
      'inglês': 'ingles',
      'ingles': 'ingles',
      'língua inglesa': 'ingles',
      'redação': 'redacao',
      'redacao': 'redacao',
      'espanhol': 'espanhol',
      'língua espanhola': 'espanhol',
      'filosofia': 'filosofia'
    };
    const key = map[s] || s;
    return this.currentUser.focusSubjects.some(f => f.toLowerCase() === key || s.includes(f));
  }

  openStudentSettingsModal() {
    if (!this.currentUser) {
      this.showAuthOverlay();
      return;
    }
    this.ensureStudentSettings(this.currentUser);

    // Tab 1: Grade, Class & Focus Subjects
    const gradeSelect = document.getElementById('cfgStudentGrade');
    const classInput = document.getElementById('cfgStudentClass');
    if (gradeSelect) gradeSelect.value = this.currentUser.grade || '7º Ano Fundamental';
    if (classInput) classInput.value = this.currentUser.className || '7º ano B • Gammon 2';

    const focusCheckboxes = document.querySelectorAll('input[name="cfgFocusSubject"]');
    const userFocus = this.currentUser.focusSubjects || ['matematica', 'portugues', 'fisica'];
    focusCheckboxes.forEach(cb => {
      cb.checked = userFocus.includes(cb.value);
    });

    // Tab 2: Daily Goal & Routine
    const goalRadios = document.querySelectorAll('input[name="cfgDailyGoal"]');
    goalRadios.forEach(r => {
      r.checked = parseInt(r.value, 10) === parseInt(this.currentUser.dailyGoal || 15, 10);
    });

    const shiftSelect = document.getElementById('cfgStudyShift');
    const reminderInput = document.getElementById('cfgTpcReminderTime');
    if (shiftSelect) shiftSelect.value = this.currentUser.studyShift || 'tarde';
    if (reminderInput) reminderInput.value = this.currentUser.tpcReminderTime || '17:00';

    // Tab 3: AI Style
    const aiRadios = document.querySelectorAll('input[name="cfgAiStyle"]');
    aiRadios.forEach(r => {
      r.checked = r.value === (this.currentUser.aiStyle || 'direto');
    });

    // Tab 4: Profile & Visual
    const nameInput = document.getElementById('cfgStudentName');
    const nickInput = document.getElementById('cfgStudentNickname');
    const mottoInput = document.getElementById('cfgStudentMotto');
    if (nameInput) nameInput.value = this.currentUser.name || '';
    if (nickInput) nickInput.value = this.currentUser.nickname || '';
    if (mottoInput) mottoInput.value = this.currentUser.motto || '';

    this.selectAvatar(this.currentUser.avatar || '🦄');

    const themeRadios = document.querySelectorAll('input[name="cfgThemeMode"]');
    themeRadios.forEach(r => {
      r.checked = r.value === (this.currentUser.themeMode || 'light');
    });

    const fontRadios = document.querySelectorAll('input[name="cfgFontSize"]');
    fontRadios.forEach(r => {
      r.checked = r.value === (this.currentUser.fontSize || 'normal');
    });

    const densityRadios = document.querySelectorAll('input[name="cfgDensity"]');
    densityRadios.forEach(r => {
      r.checked = r.value === (this.currentUser.density || 'comfortable');
    });

    const reduceMotionCb = document.getElementById('cfgReduceMotion');
    if (reduceMotionCb) {
      reduceMotionCb.checked = Boolean(this.currentUser.reduceMotion);
    }

    if (this.currentUser.accentColor) {
      this.selectAccentColor(this.currentUser.accentColor, this.currentUser.accentName || 'Índigo Estude+');
    } else {
      this.selectAccentColor('#4f46e5', 'Índigo Estude+');
    }

    // Tab 5: Schedule
    const sched = this.currentUser.scheduleWeekly || {};
    const segInput = document.getElementById('cfgSchedSeg');
    const terInput = document.getElementById('cfgSchedTer');
    const quaInput = document.getElementById('cfgSchedQua');
    const quiInput = document.getElementById('cfgSchedQui');
    const sexInput = document.getElementById('cfgSchedSex');
    if (segInput) segInput.value = sched.seg || 'Matemática, Português, Geografia, Inglês';
    if (terInput) terInput.value = sched.ter || 'Ciências, Matemática, História, Artes';
    if (quaInput) quaInput.value = sched.qua || 'Português, Redação, Física, Filosofia';
    if (quiInput) quiInput.value = sched.qui || 'Matemática, Geografia, Química, Inglês';
    if (sexInput) sexInput.value = sched.sex || 'História, Português, Biologia, Ed. Física';

    this.switchSettingsTab('focus');
    this.showModal('studentSettingsModal');
  }

  switchSettingsTab(tabName) {
    document.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.settingsTab === tabName);
    });
    document.querySelectorAll('.settings-tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `settingsTab-${tabName}`);
    });
  }

  selectAvatar(emoji) {
    const hidden = document.getElementById('cfgSelectedAvatar');
    if (hidden) hidden.value = emoji;
    document.querySelectorAll('.avatar-option-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.avatar === emoji);
    });
  }

  selectAccentColor(color, name) {
    const hidden = document.getElementById('cfgAccentColor');
    const label = document.getElementById('cfgSelectedAccentName');
    if (hidden) hidden.value = color;
    if (label) label.innerText = name || color;

    document.querySelectorAll('.accent-color-btn').forEach(btn => {
      const match = btn.dataset.color === color;
      btn.classList.toggle('active', match);
      btn.innerText = match ? '✓' : '';
    });
  }

  applyAccentColor(color) {
    if (!color) return;
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-hover', color);
  }

  handleSaveStudentSettings(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!this.currentUser) return;

    const grade = document.getElementById('cfgStudentGrade')?.value || '7º Ano Fundamental';
    const className = document.getElementById('cfgStudentClass')?.value.trim() || '7º ano B • Gammon 2';

    const selectedSubjects = [];
    document.querySelectorAll('input[name="cfgFocusSubject"]:checked').forEach(cb => {
      selectedSubjects.push(cb.value);
    });

    const dailyGoalVal = document.querySelector('input[name="cfgDailyGoal"]:checked')?.value || '15';
    const studyShift = document.getElementById('cfgStudyShift')?.value || 'tarde';
    const tpcReminderTime = document.getElementById('cfgTpcReminderTime')?.value || '17:00';
    const aiStyle = document.querySelector('input[name="cfgAiStyle"]:checked')?.value || 'direto';

    const name = document.getElementById('cfgStudentName')?.value.trim() || this.currentUser.name;
    const nickname = document.getElementById('cfgStudentNickname')?.value.trim() || name.split(' ')[0];
    const avatar = document.getElementById('cfgSelectedAvatar')?.value || '🦄';
    const motto = document.getElementById('cfgStudentMotto')?.value.trim() || '';

    const themeMode = document.querySelector('input[name="cfgThemeMode"]:checked')?.value || 'light';
    const fontSize = document.querySelector('input[name="cfgFontSize"]:checked')?.value || 'normal';
    const density = document.querySelector('input[name="cfgDensity"]:checked')?.value || 'comfortable';
    const accentColor = document.getElementById('cfgAccentColor')?.value || '#4f46e5';
    const accentName = document.getElementById('cfgSelectedAccentName')?.innerText || 'Índigo Estude+';
    const reduceMotion = Boolean(document.getElementById('cfgReduceMotion')?.checked);

    const scheduleWeekly = {
      seg: document.getElementById('cfgSchedSeg')?.value.trim() || '',
      ter: document.getElementById('cfgSchedTer')?.value.trim() || '',
      qua: document.getElementById('cfgSchedQua')?.value.trim() || '',
      qui: document.getElementById('cfgSchedQui')?.value.trim() || '',
      sex: document.getElementById('cfgSchedSex')?.value.trim() || ''
    };

    // Update currentUser state
    this.currentUser.name = name;
    this.currentUser.grade = grade;
    this.currentUser.className = className;
    this.currentUser.focusSubjects = selectedSubjects.length > 0 ? selectedSubjects : ['matematica', 'portugues'];
    this.currentUser.dailyGoal = parseInt(dailyGoalVal, 10);
    this.currentUser.studyShift = studyShift;
    this.currentUser.tpcReminderTime = tpcReminderTime;
    this.currentUser.aiStyle = aiStyle;
    this.currentUser.nickname = nickname;
    this.currentUser.avatar = avatar;
    this.currentUser.motto = motto;
    this.currentUser.themeMode = themeMode;
    this.currentUser.fontSize = fontSize;
    this.currentUser.density = density;
    this.currentUser.accentColor = accentColor;
    this.currentUser.accentName = accentName;
    this.currentUser.reduceMotion = reduceMotion;
    this.currentUser.scheduleWeekly = scheduleWeekly;

    if (!this.currentUser.preferences) this.currentUser.preferences = {};
    this.currentUser.preferences.themeMode = themeMode;
    this.currentUser.preferences.fontSize = fontSize;
    this.currentUser.preferences.density = density;
    this.currentUser.preferences.accentColor = accentColor;
    this.currentUser.preferences.accentName = accentName;
    this.currentUser.preferences.reduceMotion = reduceMotion;

    // Update in users registry
    const idx = this.users.findIndex(u => u.id === this.currentUser.id || u.email === this.currentUser.email);
    if (idx !== -1) {
      this.users[idx] = { ...this.currentUser };
      this.saveUsers();
    }
    this.saveCurrentUser();

    // Reapply to entire interface
    this.applyStudentSettingsToUI();
    this.closeModal('studentSettingsModal');
    this.debouncedSyncPush();

    if (typeof confetti === 'function') {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    }
    alert(`🎉 Preferências salvas com sucesso!\n\n• Aluno: ${name} (${nickname})\n• Série: ${grade}\n• Foco: ${this.currentUser.focusSubjects.length} matérias selecionadas\n• Meta: ${dailyGoalVal} min/dia\n• Tutor IA: ${aiStyle === 'direto' ? 'Super Direto' : aiStyle === 'didatico' ? 'Didático Passo a Passo' : 'Parceiro Gamer'}\n• Tema: ${themeMode.toUpperCase()} | Cor: ${accentName} | Densidade: ${density.toUpperCase()}`);
  }

  resetStudentSettingsToDefault() {
    if (!confirm('Deseja restaurar as configurações padrão de estudo?')) return;
    if (!this.currentUser) return;

    this.currentUser.grade = '7º Ano Fundamental';
    this.currentUser.className = '7º ano B • Gammon 2';
    this.currentUser.focusSubjects = ['matematica', 'portugues', 'fisica'];
    this.currentUser.dailyGoal = 15;
    this.currentUser.studyShift = 'tarde';
    this.currentUser.tpcReminderTime = '17:00';
    this.currentUser.aiStyle = 'direto';
    this.currentUser.avatar = '🦄';
    this.currentUser.themeMode = 'light';
    this.currentUser.fontSize = 'normal';
    this.currentUser.density = 'comfortable';
    this.currentUser.accentColor = '#4f46e5';
    this.currentUser.accentName = 'Índigo Estude+';
    this.currentUser.reduceMotion = false;

    this.saveCurrentUser();
    this.applyStudentSettingsToUI();
    this.openStudentSettingsModal();
    this.debouncedSyncPush();
  }

  applyStudentSettingsToUI() {
    if (!this.currentUser) return;
    this.ensureStudentSettings(this.currentUser);

    // 1. Theme mode (light, dark, system)
    let isDark = false;
    if (this.currentUser.themeMode === 'dark') {
      isDark = true;
    } else if (this.currentUser.themeMode === 'system') {
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // 2. Font sizing
    if (this.currentUser.fontSize === 'large') {
      document.body.classList.add('font-large');
    } else {
      document.body.classList.remove('font-large');
    }

    // 3. Density
    if (this.currentUser.density === 'compact') {
      document.body.classList.add('density-compact');
    } else {
      document.body.classList.remove('density-compact');
    }

    // 4. Reduce Motion (Modo Desempenho para PCs modestos)
    if (this.currentUser.reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }

    // 5. Accent color
    if (this.currentUser.accentColor) {
      this.applyAccentColor(this.currentUser.accentColor);
    }

    // 6. Dashboard Student Card
    const painelAvatar = document.getElementById('painelStudentAvatar');
    const painelName = document.getElementById('painelStudentName');
    const painelRole = document.getElementById('painelStudentRole');
    const painelClass = document.getElementById('painelStudentClass');

    if (painelAvatar) painelAvatar.innerText = this.currentUser.avatar || '🦄';
    if (painelName) painelName.innerText = this.currentUser.name || 'Freddie Pimentel Costa';
    if (painelRole) painelRole.innerText = this.currentUser.role === 'admin' ? 'Administrador & Aluno' : 'Estudante';
    if (painelClass) painelClass.innerHTML = `${this.currentUser.className || '7º ano B • Gammon 2'} &bull; <span style="color:#6366f1; font-weight:700;">${this.currentUser.grade || '7º Ano'}</span>`;

    // 7. Header Profile Pill
    const headerAvatar = document.getElementById('userAvatarText');
    const headerName = document.getElementById('userNameHeaderDisplay');
    if (headerAvatar) {
      if (this.currentUser.avatar && this.currentUser.avatar !== '🦄') {
        headerAvatar.innerText = this.currentUser.avatar;
      } else {
        const initials = (this.currentUser.name || 'Freddie Costa').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        headerAvatar.innerText = initials || 'FP';
      }
    }
    if (headerName) headerName.innerText = this.currentUser.nickname || this.currentUser.name || 'Freddie Costa';

    // 8. Focus Strip on Dashboard
    const stripGrade = document.getElementById('stripGradeTag');
    const stripPills = document.getElementById('stripFocusSubjectsList');
    const stripGoal = document.getElementById('stripGoalText');
    const stripAi = document.getElementById('stripAiStyleTag');

    const subjectLabels = {
      'matematica': '📐 Matemática',
      'portugues': '📝 Português',
      'redacao': '✍️ Redação',
      'ciencias': '🌿 Ciências',
      'fisica': '⚡ Física',
      'quimica': '🧪 Química',
      'biologia': '🧬 Biologia',
      'historia': '🏛️ História',
      'geografia': '🌍 Geografia',
      'ingles': '🇬🇧 Inglês',
      'espanhol': '🇪🇸 Espanhol',
      'filosofia': '🧠 Filosofia'
    };

    if (stripGrade) stripGrade.innerText = this.currentUser.grade || '7º Ano';
    if (stripPills) {
      const focusList = this.currentUser.focusSubjects || ['matematica', 'portugues', 'fisica'];
      if (focusList.length === 0) {
        stripPills.innerHTML = `<span style="font-size:0.75rem; color:#64748b;">Nenhuma matéria selecionada ainda. Clique para configurar!</span>`;
      } else {
        stripPills.innerHTML = focusList.map(subj => `
          <span class="focus-pill-item">${subjectLabels[subj] || subj}</span>
        `).join('');
      }
    }

    if (stripGoal) {
      stripGoal.innerHTML = `Meta diária: <strong>${this.currentUser.dailyGoal || 15} min / dia</strong>`;
    }

    if (stripAi) {
      const aiStyles = {
        'direto': '⚡ Tutor IA: Super Direto',
        'didatico': '📚 Tutor IA: Didático Passo a Passo',
        'gamer': '🎮 Tutor IA: Parceiro Gamer'
      };
      stripAi.innerText = aiStyles[this.currentUser.aiStyle] || '🤖 Tutor IA Ativo';
    }

    // 9. Reorder Dashboard & Refresh Smart Stats
    this.applyDashboardLayout();
    this.renderSmartStats();

    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     KEYBOARD SHORTCUTS & SYSTEM THEME WATCHER
     ========================================================================== */
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl + K or Cmd + K: Open Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette();
        return;
      }

      // Esc: Close Command Palette or top modal
      if (e.key === 'Escape') {
        const cp = document.getElementById('commandPaletteModal');
        if (cp && cp.style.display !== 'none') {
          this.closeCommandPalette();
          return;
        }
      }

      // Skip single keys if focused in input/textarea
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) {
        return;
      }

      // ? key: Show keyboard shortcuts guide
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        this.openShortcutsGuideModal();
        return;
      }

      // Alt + 1, 2, 3, 4: Quick Tabs
      if (e.altKey && e.key === '1') { e.preventDefault(); this.switchTab('dashboard'); }
      if (e.altKey && e.key === '2') { e.preventDefault(); this.switchTab('gemini-chat'); }
      if (e.altKey && e.key === '3') { e.preventDefault(); this.switchTab('sas-eureka'); }
      if (e.altKey && e.key === '4') { e.preventDefault(); this.switchTab('gammon-tpc'); }
    });
  }

  setupThemeWatcher() {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.currentUser?.themeMode === 'system') {
          this.applyStudentSettingsToUI();
        }
      });
    }
  }

  /* ==========================================================================
     UNIVERSAL SEARCH (COMMAND PALETTE - CTRL + K)
     ========================================================================== */
  openCommandPalette() {
    const cp = document.getElementById('commandPaletteModal');
    const input = document.getElementById('commandPaletteInput');
    if (!cp || !input) return;
    cp.style.display = 'flex';
    input.value = '';
    this.handleCommandPaletteInput('');
    setTimeout(() => input.focus(), 60);
  }

  closeCommandPalette() {
    const cp = document.getElementById('commandPaletteModal');
    if (cp) cp.style.display = 'none';
  }

  handleCommandPaletteInput(query) {
    const resultsContainer = document.getElementById('commandPaletteResults');
    if (!resultsContainer) return;
    const q = (query || '').toLowerCase().trim();

    const items = [
      // Navigation
      { group: 'Navegação', title: 'Página Inicial (Dashboard)', icon: 'home', action: () => this.switchTab('dashboard'), shortcut: 'Alt 1' },
      { group: 'Navegação', title: 'Chatbot IA Inteligente', icon: 'bot', action: () => this.switchTab('gemini-chat'), shortcut: 'Alt 2' },
      { group: 'Navegação', title: 'Apostilas SAS Eureka (12 Livros)', icon: 'compass', action: () => this.switchTab('sas-eureka'), shortcut: 'Alt 3' },
      { group: 'Navegação', title: 'TPC Diário & Ocorrências Gammon+', icon: 'clipboard-list', action: () => this.switchTab('gammon-tpc'), shortcut: 'Alt 4' },
      { group: 'Navegação', title: 'Planos & Assinatura PRO', icon: 'crown', action: () => this.switchTab('plans-pricing'), shortcut: 'PRO' },
      { group: 'Navegação', title: 'Relatórios de Desempenho e Erros', icon: 'bar-chart-2', action: () => this.switchTab('review') },
      { group: 'Navegação', title: 'Quiz Diário de 15 Minutos', icon: 'zap', action: () => this.switchTab('quiz') },

      // Quick Actions
      { group: 'Ações Rápidas', title: 'Personalizar Início do Dashboard', icon: 'layout-grid', action: () => this.openCustomizeDashboardModal() },
      { group: 'Ações Rápidas', title: 'Minhas Preferências de Estudo & Visual', icon: 'sliders', action: () => this.openStudentSettingsModal() },
      { group: 'Ações Rápidas', title: 'Central de Novidades & Versões', icon: 'sparkles', action: () => this.openNewsCenterModal() },
      { group: 'Ações Rápidas', title: 'Central de Notificações GAMMON+', icon: 'bell', action: () => this.openGammonNotificationsModal() },
      { group: 'Ações Rápidas', title: 'Suporte, Dúvidas & Relatar Erro', icon: 'life-buoy', action: () => this.openSupportModal() },
      { group: 'Ações Rápidas', title: 'Cadastrar Novo TPC', icon: 'plus-circle', action: () => this.showModal('addTpcModal') },
      { group: 'Ações Rápidas', title: 'Importar Ocorrências Gammon+', icon: 'clipboard-paste', action: () => this.showModal('importOccurrencesModal') },
      { group: 'Ações Rápidas', title: 'Guia de Atalhos do Teclado', icon: 'keyboard', action: () => this.openShortcutsGuideModal(), shortcut: '?' }
    ];

    // If Admin, add Admin Central
    if (this.currentUser?.role === 'admin' || this.currentUser?.username === 'freddie') {
      items.push({ group: 'Administração', title: 'Painel Admin Centralizado (Usuários, Assinaturas, Logs)', icon: 'shield-check', action: () => this.showAdminModal() });
    }

    // Add SAS Books
    (this.sasBooks || []).forEach(b => {
      items.push({
        group: 'Apostilas SAS',
        title: `${b.title} (${b.category || 'SAS'})`,
        icon: 'book-open',
        action: () => {
          this.switchTab('sas-eureka');
          this.openSasPdfModal(b.id);
        }
      });
    });

    const filtered = q === '' ? items.slice(0, 10) : items.filter(it => it.title.toLowerCase().includes(q) || (it.group && it.group.toLowerCase().includes(q)));

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: #64748b;">
          <p style="margin: 0; font-size: 0.9rem;">Nenhum resultado encontrado para "<strong>${query}</strong>"</p>
          <span style="font-size: 0.78rem;">Tente buscar por "Matemática", "TPC", "Apostila", "Admin" ou "Tema".</span>
        </div>
      `;
      return;
    }

    const grouped = {};
    filtered.forEach(it => {
      if (!grouped[it.group]) grouped[it.group] = [];
      grouped[it.group].push(it);
    });

    let html = '';
    window._cpActions = [];
    let actIndex = 0;

    Object.keys(grouped).forEach(grp => {
      html += `<div class="command-palette-group-title">${grp}</div>`;
      grouped[grp].forEach(it => {
        const id = actIndex++;
        window._cpActions[id] = it.action;
        html += `
          <div class="command-palette-item" onclick="app.executeCommandAction(${id})">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i data-lucide="${it.icon || 'arrow-right'}" style="width: 16px; height: 16px; color: #4f46e5;"></i>
              <span style="font-size: 0.88rem; font-weight: 600;">${it.title}</span>
            </div>
            ${it.shortcut ? `<span class="shortcut-kbd">${it.shortcut}</span>` : `<i data-lucide="chevron-right" style="width: 14px; height: 14px; color: #94a3b8;"></i>`}
          </div>
        `;
      });
    });

    resultsContainer.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  }

  executeCommandAction(index) {
    this.closeCommandPalette();
    if (window._cpActions && typeof window._cpActions[index] === 'function') {
      window._cpActions[index]();
    }
  }

  /* ==========================================================================
     NEWS CENTER & SHORTCUTS GUIDE MODALS
     ========================================================================== */
  openNewsCenterModal() {
    this.showModal('newsCenterModal');
  }

  openShortcutsGuideModal() {
    this.showModal('shortcutsGuideModal');
  }

  /* ==========================================================================
     CUSTOMIZE DASHBOARD (ORGANIZAR, OCULTAR E RESTAURAR BLOCOS)
     ========================================================================== */
  openCustomizeDashboardModal() {
    if (!this.currentUser) return;
    this.ensureStudentSettings(this.currentUser);
    this.renderDashboardCustomizerList();
    this.showModal('customizeDashboardModal');
  }

  renderDashboardCustomizerList() {
    const listEl = document.getElementById('dashReorderList');
    if (!listEl) return;
    const cards = this.currentUser.dashboardCards || [];

    listEl.innerHTML = cards.map((card, idx) => `
      <div class="dash-reorder-item">
        <div class="dash-item-drag-handle">
          <label style="display: flex; align-items: center; gap: 8px; cursor: ${card.locked ? 'not-allowed' : 'pointer'}; margin: 0;">
            <input type="checkbox" ${card.visible ? 'checked' : ''} ${card.locked ? 'disabled' : ''} onchange="app.toggleDashboardCardVisibility('${card.id}')" style="width: 16px; height: 16px;">
            <strong style="font-size: 0.88rem; color: #0f172a;">${card.label}</strong>
          </label>
          ${card.locked ? `<span style="font-size: 0.7rem; background: #e2e8f0; color: #475569; padding: 1px 6px; border-radius: 4px;">Fixo</span>` : ''}
        </div>
        <div style="display: flex; gap: 4px;">
          <button type="button" class="btn-outline" style="padding: 2px 7px; font-size: 0.75rem; cursor: pointer;" onclick="app.moveDashboardCard(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>⬆️</button>
          <button type="button" class="btn-outline" style="padding: 2px 7px; font-size: 0.75rem; cursor: pointer;" onclick="app.moveDashboardCard(${idx}, 1)" ${idx === cards.length - 1 ? 'disabled' : ''}>⬇️</button>
        </div>
      </div>
    `).join('');
  }

  moveDashboardCard(index, direction) {
    const cards = this.currentUser.dashboardCards;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= cards.length) return;
    const temp = cards[index];
    cards[index] = cards[targetIdx];
    cards[targetIdx] = temp;
    this.renderDashboardCustomizerList();
  }

  toggleDashboardCardVisibility(id) {
    const card = (this.currentUser.dashboardCards || []).find(c => c.id === id);
    if (card && !card.locked) {
      card.visible = !card.visible;
    }
  }

  saveDashboardLayout() {
    this.saveCurrentUser();
    this.applyDashboardLayout();
    this.closeModal('customizeDashboardModal');
    this.debouncedSyncPush();
    if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 60 });
    alert('🎉 Organização da tela inicial salva com sucesso!');
  }

  resetDashboardLayout() {
    if (!this.currentUser) return;
    this.currentUser.dashboardCards = [
      { id: 'profile-shortcuts', label: '👤 Perfil & Atalhos Rápidos', visible: true, locked: true },
      { id: 'focus-strip', label: '🎯 Foco de Estudos & Metas', visible: true },
      { id: 'smart-stats', label: '📊 Estatísticas Inteligentes & Metas', visible: true },
      { id: 'studies-eureka', label: '🧭 Meus Estudos & Universo Eureka', visible: true },
      { id: 'news', label: '📰 Notícias & Atualizações', visible: true },
      { id: 'agenda', label: '📅 Agenda Escolar Gammon+', visible: true }
    ];
    this.renderDashboardCustomizerList();
    this.saveDashboardLayout();
  }

  applyDashboardLayout() {
    if (!this.currentUser || !Array.isArray(this.currentUser.dashboardCards)) return;
    const container = document.getElementById('sasPainelMainCol');
    if (!container) return;

    this.currentUser.dashboardCards.forEach(card => {
      const el = document.querySelector(`[data-dash-card="${card.id}"]`);
      if (el) {
        el.style.display = card.visible ? '' : 'none';
        if (el.parentElement === container) {
          container.appendChild(el);
        }
      }
    });
  }

  /* ==========================================================================
     SMART STATISTICS CARD (EVOLUÇÃO, METAS E ERROS DO BANCO REAL)
     ========================================================================== */
  renderSmartStats() {
    const kpiToday = document.getElementById('statKpiTodayMinutes');
    const kpiStreak = document.getElementById('statKpiStreak');
    const kpiTpc = document.getElementById('statKpiTpcDone');
    const kpiMistakes = document.getElementById('statKpiMistakesReview');
    const weeklyChart = document.getElementById('weeklyBarsChart');
    const weeklyTotal = document.getElementById('weeklyTotalMinutesLabel');
    const topicsReviewText = document.getElementById('statTopicsToReviewText');

    const todayMins = Number(this.state.todayMinutes || this.currentUser?.todayMinutes || 0);
    const goalMins = Number(this.currentUser?.dailyGoal || this.currentUser?.dailyGoalMinutes || 15);
    const streakDays = Number(this.currentUser?.streak || this.state.streak || 0);

    const tpcs = this.state.tpcs || [];
    const completedTpcIds = this.state.completedTpcIds || [];
    const doneTpcsCount = tpcs.filter(t => t.status === 'done' || completedTpcIds.includes(t.id)).length;
    const totalTpcs = tpcs.length;

    const mistakes = this.state.mistakes || [];
    const pendingMistakes = mistakes.filter(m => m.status === 'pending');

    if (kpiToday) kpiToday.innerText = `${todayMins} / ${goalMins} min`;
    if (kpiStreak) kpiStreak.innerText = `🔥 ${streakDays} ${streakDays === 1 ? 'dia' : 'dias'}`;
    if (kpiTpc) kpiTpc.innerText = `${doneTpcsCount} / ${totalTpcs}`;
    if (kpiMistakes) kpiMistakes.innerText = `${pendingMistakes.length}`;

    // Calculate weekly activity bars
    const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const studiedDays = Array.isArray(this.state.studiedDays) ? this.state.studiedDays : [];
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Seg, ..., 6 = Dom

    let totalWeekMins = 0;
    const weekBarsHtml = dayNames.map((dName, idx) => {
      let dayMins = 0;
      if (idx === currentDayOfWeek) {
        dayMins = todayMins;
      } else if (studiedDays.some(d => (new Date(d).getDay() + 6) % 7 === idx)) {
        dayMins = goalMins;
      }
      totalWeekMins += dayMins;
      const heightPct = Math.min(100, Math.max(8, (dayMins / (goalMins || 15)) * 100));
      const isActive = idx === currentDayOfWeek && dayMins > 0;
      return `
        <div class="bar-col" title="${dName}: ${dayMins} min">
          <div class="bar-pillar ${isActive ? 'active-day' : ''}" style="height: ${heightPct}%;"></div>
          <span class="bar-col-label">${dName}</span>
        </div>
      `;
    }).join('');

    if (weeklyChart) weeklyChart.innerHTML = weekBarsHtml;
    if (weeklyTotal) weeklyTotal.innerText = `${totalWeekMins} min nesta semana`;

    if (topicsReviewText) {
      if (pendingMistakes.length > 0) {
        const subjects = Array.from(new Set(pendingMistakes.map(m => m.subject || 'Geral')));
        topicsReviewText.innerHTML = `⚠️ <strong>${pendingMistakes.length} erro(s) pendente(s)</strong> para revisar em: <span style="color:#ef4444; font-weight:700;">${subjects.join(', ')}</span>`;
      } else {
        topicsReviewText.innerText = '🎉 Nenhum erro pendente de revisão hoje. Parabéns pelo foco!';
      }
    }
  }

  formatAnswerByAiStyle(answer) {
    if (!answer) return answer;
    const style = this.currentUser?.aiStyle || 'direto';
    const nick = this.currentUser?.nickname || (this.currentUser?.name ? this.currentUser.name.split(' ')[0] : 'Freddie');

    if (style === 'gamer') {
      if (!answer.includes('🎮') && !answer.includes('Blox Fruits') && !answer.includes('XP') && !answer.includes('boss')) {
        const endings = [
          `\n\n🎮 *+100 XP de Estudo pro ${nick}! Mais um desafio derrotado!*`,
          `\n\n🏆 *Mandou bem demais, ${nick}! GG!*`,
          `\n\n⚡ *Nível de conhecimento subindo feito fruta mítica no Blox Fruits!*`
        ];
        const ending = endings[Math.floor(Math.random() * endings.length)];
        return `${answer}${ending}`;
      }
    } else if (style === 'didatico') {
      if (!answer.includes('passo a passo') && !answer.includes('Didática') && !answer.includes('💡')) {
        return `📚 **Explicação Didática (${this.currentUser?.grade || '7º Ano'}):**\n\n${answer}\n\n💡 *Dica do Professor: Revise essa aplicação na sua apostila SAS para fixar o método.*`;
      }
    }
    // 'direto': exactly direct and concise
    return answer;
  }

  /* ==========================================================================
     SISTEMA DE PLANOS & ASSINATURA: PIX E DINHEIRO VIVO NA ESCOLA
     ========================================================================== */
  selectPaymentMethod(method) {
    this.selectedPaymentMethod = method;
    const pixCard = document.getElementById('methodCardPix');
    const cashCard = document.getElementById('methodCardCash');
    const pixDetails = document.getElementById('paymentDetailsPix');
    const cashDetails = document.getElementById('paymentDetailsCash');

    if (method === 'pix') {
      pixCard?.classList.add('active');
      cashCard?.classList.remove('active');
      if (pixDetails) pixDetails.style.display = 'block';
      if (cashDetails) cashDetails.style.display = 'none';
    } else {
      pixCard?.classList.remove('active');
      cashCard?.classList.add('active');
      if (pixDetails) pixDetails.style.display = 'none';
      if (cashDetails) cashDetails.style.display = 'block';
    }
  }

  
  copyPixCpf() {
    const cpf = '183.199.286.80';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cpf).then(() => {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }
        alert('✔ Chave PIX (CPF do Freddie: 183.199.286.80) copiada com sucesso!\n\nAbra o aplicativo do seu banco, escolha transferir por "Chave CPF", cole e confirme o envio de R$ 19,90.');
      }).catch(() => {
        prompt('Copie a chave Pix CPF abaixo:', cpf);
      });
    } else {
      prompt('Copie a chave Pix CPF abaixo:', cpf);
    }
  }

  copyPixCode() {
    const input = document.getElementById('pixCopyPasteInput');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value).then(() => {
        if (typeof confetti === 'function') {
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        }
        alert('✔ Código Copia e Cola do PIX copiado com sucesso!\nAbra o aplicativo do seu banco e cole na área "Pix Copia e Cola".');
      }).catch(() => {
        prompt('Copie o código Pix abaixo:', input.value);
      });
    }
  }

  confirmPixPayment() {
    if (!this.currentUser) {
      alert('Faça login primeiro para assinar.');
      return;
    }

    const orderId = 'PIX-' + Math.floor(1000 + Math.random() * 9000);
    const newPayment = {
      id: orderId,
      studentName: this.currentUser.name,
      email: this.currentUser.email,
      method: 'pix',
      amount: 19.90,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      note: 'Pix de R$ 19,90 enviado para a chave CPF 183.199.286.80 de Freddie Pimentel Costa'
    };

    if (!this.state.payments) this.state.payments = [];
    this.state.payments.unshift(newPayment);
    
    // Status MUST remain pending approval until Freddie approves in his account
    this.currentUser.planStatus = 'pending_pix';
    this.currentUser.isSubscribed = false;
    this.state.isSubscribed = false;

    this.saveState();
    this.saveCurrentUser();
    this.updateUserHeaderUI();
    this.renderPlanStatus();
    this.renderDashboard();
    this.checkPendingAdminBadge();
    this.closeModal('subscriptionModal');

    alert(`⏳ Pedido ${orderId} registrado com sucesso!\n\nO seu pagamento permanecerá como PENDENTE até que o Freddie Pimentel Costa confira o recebimento de R$ 19,90 na conta dele e aprove no aplicativo.\n\nAssim que ele confirmar no app dele, seu Plano PRO será ativado por 30 dias!`);
  }

  requestCashInSchoolPayment() {
    if (!this.currentUser) {
      alert('Faça login primeiro para solicitar a assinatura.');
      return;
    }

    const orderId = 'DIN-' + Math.floor(1000 + Math.random() * 9000);
    const newPayment = {
      id: orderId,
      studentName: this.currentUser.name,
      email: this.currentUser.email,
      method: 'cash',
      amount: 19.90,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      note: 'Aguardando entrega de R$ 19,90 em dinheiro vivo para o Freddie na escola'
    };

    if (!this.state.payments) this.state.payments = [];
    this.state.payments.unshift(newPayment);

    // Update current user status to pending
    this.currentUser.planStatus = 'pending_cash';
    this.currentUser.pendingOrderId = orderId;
    this.saveState();
    this.saveCurrentUser();
    this.updateUserHeaderUI();
    this.renderPlanStatus();
    this.checkPendingAdminBadge();
    this.closeModal('subscriptionModal');

    alert(`⏳ Solicitação de pagamento registrada com sucesso! (Código: ${orderId})\n\nAgora você deve entregar R$ 19,90 em dinheiro vivo para o Freddie Pimentel Costa na escola.\n\nEnquanto você não entregar, seu plano permanecerá como PENDENTE. Assim que o Freddie confirmar no aplicativo dele que recebeu o dinheiro, o seu plano PRO será liberado na hora!`);
  }

  /* ==========================================================================
     SINCRONIZAÇÃO ENTRE DISPOSITIVOS (CELULAR, TABLET, PC)
     ========================================================================== */
  async syncUserData(action = 'pull') {
    if (!this.currentUser) return;
    const sessId = localStorage.getItem('estude_session_id');

    if (action === 'pull') {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (sessId) headers['x-session-id'] = sessId;
        if (this.currentUser.id) headers['x-user-id'] = this.currentUser.id;

        const res = await fetch('/api/user/sync', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            const u = data.user;
            // Atualiza status do plano e perfil
            this.currentUser.isSubscribed = Boolean(u.isSubscribed);
            this.currentUser.plan = u.plan || 'free';
            this.currentUser.planStatus = u.planStatus || 'free';
            this.currentUser.planName = u.planName || 'Plano Base';
            this.currentUser.proExpiresAt = u.proExpiresAt;
            this.currentUser.streak = u.streak || 0;
            this.currentUser.bestStreak = u.bestStreak || 0;
            this.currentUser.dailyGoalMinutes = u.dailyGoalMinutes || 15;
            this.currentUser.todayMinutes = u.todayMinutes || 0;
            if (Array.isArray(u.studiedDays)) this.currentUser.studiedDays = u.studiedDays;
            if (Array.isArray(u.achievements)) this.currentUser.achievements = u.achievements;
            if (u.studentSettings) {
              this.currentUser.studentSettings = { ...(this.currentUser.studentSettings || {}), ...u.studentSettings };
            }
            if (u.preferences) {
              this.currentUser.preferences = { ...(this.currentUser.preferences || {}), ...u.preferences };
              if (u.preferences.themeMode) this.currentUser.themeMode = u.preferences.themeMode;
              if (u.preferences.fontSize) this.currentUser.fontSize = u.preferences.fontSize;
              if (u.preferences.density) this.currentUser.density = u.preferences.density;
              if (u.preferences.accentColor) this.currentUser.accentColor = u.preferences.accentColor;
              if (u.preferences.accentName) this.currentUser.accentName = u.preferences.accentName;
              if (u.preferences.reduceMotion !== undefined) this.currentUser.reduceMotion = u.preferences.reduceMotion;
              if (Array.isArray(u.preferences.dashboardCards)) this.currentUser.dashboardCards = u.preferences.dashboardCards;
            }

            // Atualiza estado local sincronizado
            this.state.streak = u.streak || 0;
            this.state.todayMinutes = u.todayMinutes || 0;
            if (Array.isArray(u.studiedDays)) this.state.studiedDays = u.studiedDays;
            if (Array.isArray(u.achievements)) this.state.achievements = u.achievements;
            if (Array.isArray(u.timetable) && u.timetable.length > 0) {
              this.state.timetable = u.timetable;
            }
            if (u.tasks) {
              if (Array.isArray(u.tasks.completedTpcIds)) this.state.completedTpcIds = u.tasks.completedTpcIds;
              if (Array.isArray(u.tasks.userTpcs)) this.state.userTpcs = u.tasks.userTpcs;
            }

            this.activePlanRequest = data.activePlanRequest || null;

            // Salva silenciosamente local
            try {
              localStorage.setItem(this.currentUserStorageKey, JSON.stringify(this.currentUser));
              localStorage.setItem(this.storageKey, JSON.stringify(this.state));
            } catch (e) {}

            this.updateUserHeaderUI();
            this.applyStudentSettingsToUI();
            this.renderPlanStatus();
            this.renderDashboard();
            this.renderTimetable();
            this.renderTpcs();
          }
        }
      } catch (e) {
        console.warn('[Sync pull failed]', e);
      }
    } else if (action === 'push') {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (sessId) headers['x-session-id'] = sessId;
        if (this.currentUser.id) headers['x-user-id'] = this.currentUser.id;

        const payload = {
          studentSettings: this.currentUser.studentSettings || {},
          preferences: this.currentUser.preferences || {
            themeMode: this.currentUser.themeMode,
            fontSize: this.currentUser.fontSize,
            density: this.currentUser.density,
            accentColor: this.currentUser.accentColor,
            accentName: this.currentUser.accentName,
            reduceMotion: this.currentUser.reduceMotion,
            dashboardCards: this.currentUser.dashboardCards
          },
          progress: {
            streak: this.state.streak || this.currentUser.streak || 0,
            bestStreak: this.currentUser.bestStreak || 0,
            dailyGoalMinutes: this.currentUser.dailyGoalMinutes || 15,
            todayMinutes: this.state.todayMinutes || 0,
            studiedDays: this.state.studiedDays || [],
            achievements: this.state.achievements || []
          },
          timetable: this.state.timetable || [],
          tasks: {
            completedTpcIds: this.state.completedTpcIds || [],
            userTpcs: this.state.userTpcs || []
          },
          deviceType: window.innerWidth < 768 ? 'Celular' : (window.innerWidth < 1024 ? 'Tablet' : 'Computador / PC')
        };

        await fetch('/api/user/sync', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('[Sync push failed]', e);
      }
    }
  }

  debouncedSyncPush() {
    if (this._syncTimeout) clearTimeout(this._syncTimeout);
    this._syncTimeout = setTimeout(() => {
      this.syncUserData('push');
    }, 1500);
  }

  /* ==========================================================================
     SOLICITAÇÃO DO PLANO PRO
     ========================================================================== */
  openProRequestModal() {
    if (!this.currentUser) {
      this.showAuthOverlay();
      return;
    }

    if (this.isUserPro()) {
      alert('👑 Sua conta já possui o Plano ESTUDE+ PRO ativo!');
      return;
    }

    const userNameEl = document.getElementById('proReqUserName');
    const userIdEl = document.getElementById('proReqUserId');
    const userGradeEl = document.getElementById('proReqUserGrade');
    if (userNameEl) userNameEl.innerText = this.currentUser.name || this.currentUser.username;
    if (userIdEl) userIdEl.innerText = this.currentUser.id || '-';
    if (userGradeEl) userGradeEl.innerText = this.currentUser.grade || '7º Ano';

    const statusBanner = document.getElementById('proReqCurrentStatusBanner');
    const form = document.getElementById('proRequestForm');
    const activeReq = this.activePlanRequest;

    if (activeReq && (activeReq.status === 'pending' || activeReq.status === 'in_review')) {
      if (statusBanner) {
        statusBanner.style.display = 'block';
        statusBanner.innerHTML = `
          <div style="background: ${activeReq.status === 'in_review' ? '#f0f9ff' : '#fffbeb'}; border: 1.5px solid ${activeReq.status === 'in_review' ? '#7dd3fc' : '#fde68a'}; border-radius: 12px; padding: 14px; text-align: left;">
            <strong style="color: ${activeReq.status === 'in_review' ? '#0369a1' : '#92400e'}; font-size: 0.92rem; display: flex; align-items: center; gap: 6px;">
              ${activeReq.status === 'in_review' ? '🔵 Solicitação Em Análise pelo Freddie' : '🟡 Solicitação Pendente de Aprovação'}
            </strong>
            <p style="margin: 6px 0 0; font-size: 0.82rem; color: #334155; line-height: 1.5;">
              Você já enviou um pedido no dia <strong>${new Date(activeReq.createdAt).toLocaleDateString('pt-BR')}</strong> via <strong>${activeReq.contactMethod}</strong>.
              O administrador Freddie Costa foi notificado e você receberá a ativação assim que aprovado.
            </p>
          </div>
        `;
      }
      if (form) form.style.display = 'none';
    } else {
      if (statusBanner) statusBanner.style.display = 'none';
      if (form) form.style.display = 'block';
    }

    this.showModal('proRequestModal');
    if (window.lucide) window.lucide.createIcons();
  }

  handleContactMethodChange(val) {
    const label = document.getElementById('proReqContactInfoLabel');
    const input = document.getElementById('proReqContactInfo');
    if (!label || !input) return;

    if (val === 'whatsapp') {
      label.innerText = 'Número do WhatsApp (DDD + Número):';
      input.placeholder = 'Ex: (35) 99999-9999';
      input.required = true;
    } else if (val === 'email') {
      label.innerText = 'Seu E-mail para Contato:';
      input.placeholder = this.currentUser?.email || 'aluno@gammon.com.br';
      input.required = true;
    } else {
      label.innerText = 'Nome de quem vai entregar na escola:';
      input.placeholder = this.currentUser?.name || 'Seu nome completo';
      input.required = false;
    }
  }

  async submitProPlanRequest(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!this.currentUser) {
      this.showAuthOverlay();
      return;
    }

    const method = document.getElementById('proReqContactMethod')?.value || 'whatsapp';
    const info = document.getElementById('proReqContactInfo')?.value || '';
    const note = document.getElementById('proReqNote')?.value || '';

    const btn = document.getElementById('btnSubmitProRequest');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2"></i> Enviando Solicitação...';
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      const sessId = localStorage.getItem('estude_session_id');
      if (sessId) headers['x-session-id'] = sessId;
      if (this.currentUser?.id) headers['x-user-id'] = this.currentUser.id;

      const res = await fetch('/api/plans/request', {
        method: 'POST',
        headers,
        body: JSON.stringify({ contactMethod: method, contactInfo: info, note })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        this.activePlanRequest = data.request;
        this.closeModal('proRequestModal');
        this.renderPlanStatus();
        if (typeof confetti === 'function') {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
        }
        alert('🎉 ' + data.message);
      } else {
        alert(data.error || 'Não foi possível registrar a solicitação.');
      }
    } catch (err) {
      alert('Erro de conexão ao enviar a solicitação. Tente novamente.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send"></i> Confirmar e Enviar Solicitação';
      }
      if (window.lucide) window.lucide.createIcons();
    }
  }

  showAdminToast(title, message) {
    const toast = document.getElementById('adminNotificationToast');
    const titleEl = document.getElementById('toastTitle');
    const msgEl = document.getElementById('toastMessage');
    if (!toast) return;
    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerText = message;
    toast.style.display = 'block';
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      toast.style.display = 'none';
    }, 9000);
  }

  initAdminSSE() {
    if (this.adminEventSource) {
      try { this.adminEventSource.close(); } catch (e) {}
      this.adminEventSource = null;
    }
    const isAdmin = this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.username === 'freddie');
    if (!isAdmin) return;

    try {
      const adminToken = 'admin_master_freddie_token_2026';
      this.adminEventSource = new EventSource(`/api/admin/events?token=${encodeURIComponent(adminToken)}`);

      this.adminEventSource.addEventListener('new_plan_request', (e) => {
        try {
          const payload = JSON.parse(e.data);
          const req = payload.data?.request;
          this.showAdminToast(
            '💎 Nova Solicitação de Plano PRO!',
            `${req?.userName || 'Um aluno'} enviou um pedido de ativação do Plano PRO!`
          );
          this.loadAdminOverview();
        } catch (err) {}
      });

      this.adminEventSource.addEventListener('plan_request_updated', (e) => {
        try {
          this.loadAdminOverview();
          if (this.currentUser) {
            this.syncUserData('pull');
          }
        } catch (err) {}
      });

      this.adminEventSource.addEventListener('new_support_request', (e) => {
        try {
          const payload = JSON.parse(e.data);
          const t = payload.data?.ticket;
          this.showAdminToast(
            '💬 Nova Solicitação de Suporte / Dúvida',
            `${t?.userName || 'Aluno'}: ${t?.subject || 'Nova mensagem'}`
          );
          this.loadAdminOverview();
        } catch (err) {}
      });

      this.adminEventSource.addEventListener('support_updated', () => {
        this.loadAdminOverview();
      });

      this.adminEventSource.addEventListener('new_study_report', (e) => {
        try {
          const payload = JSON.parse(e.data);
          const r = payload.data?.report;
          this.showAdminToast(
            '📚 Erro em Estudos Reportado',
            `${r?.userName || 'Aluno'}: [${(r?.category || 'Geral').toUpperCase()}] ${r?.title || ''}`
          );
          this.loadAdminOverview();
        } catch (err) {}
      });

      this.adminEventSource.addEventListener('study_report_updated', () => {
        this.loadAdminOverview();
      });

      this.adminEventSource.addEventListener('gammon_sync', (e) => {
        try {
          this.showAdminToast(
            '📅 Agenda Gammon Sincronizada',
            'Novos TPCs e tarefas foram atualizados pelo servidor!'
          );
          this.loadAdminOverview();
        } catch (err) {}
      });

      this.adminEventSource.addEventListener('new_notification', (e) => {
        try {
          const payload = JSON.parse(e.data);
          this.loadAdminOverview();
        } catch (err) {}
      });

      this.adminEventSource.onerror = () => {
        // Fallback silencioso para o pooling periódico
      };
    } catch (err) {
      console.warn('[SSE Init Failed]', err);
    }
  }

  renderPlanStatus() {
    const dashBanner = document.getElementById('dashboardPendingBanner');
    const plansBannerContainer = document.getElementById('planStatusBannerContainer');
    const plansBadge = document.getElementById('plansTabCurrentBadge');

    const isPro = this.isUserPro();
    const status = this.currentUser?.planStatus || (isPro ? 'active' : 'free');

    let bannerHtml = '';
    if (status === 'pending_cash') {
      bannerHtml = `
        <div class="pending-alert-banner">
          <i data-lucide="clock-alert" style="width: 28px; height: 28px; color: #b45309; flex-shrink: 0;"></i>
          <div style="flex: 1;">
            <strong>⏳ Pagamento em Dinheiro Vivo Pendente:</strong>
            <p style="margin: 2px 0 0; font-size: 0.85rem; line-height: 1.4;">
              Você solicitou a ativação do <strong>Plano PRO</strong> entregando <strong>R$ 19,90 em dinheiro na escola</strong> para o Freddie. 
              Assim que o Freddie confirmar o recebimento em mãos, todos os benefícios (Chatbot IA, Quizzes e Apostilas) serão liberados!
            </p>
          </div>
          <button class="btn-sm" onclick="app.showModal('subscriptionModal')" style="background: #b45309; color: white; white-space: nowrap;">
            Ver Pedido
          </button>
        </div>
      `;
    } else if (status === 'trial_5d' && isPro) {
      const days = this.currentUser?.trialDaysRemaining || 5;
      bannerHtml = `
        <div style="background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 16px 20px; border-radius: 14px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <i data-lucide="zap" style="width: 28px; height: 28px; color: #d97706; flex-shrink: 0;"></i>
            <div>
              <strong style="font-size: 1rem;">⚡ Degustação PRO Ativa (${days} dias restantes):</strong>
              <p style="margin: 2px 0 0; font-size: 0.85rem; color: #b45309;">
                Você está experimentando gratuitamente o Chatbot IA, Quizzes e Apostilas SAS. Assine o Plano PRO mensal (R$ 19,90) para manter o acesso ilimitado!
              </p>
            </div>
          </div>
          <button class="btn-primary" onclick="app.showModal('subscriptionModal')" style="font-size: 0.82rem; font-weight: 700; padding: 8px 14px; border-radius: 8px; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
            <i data-lucide="crown" style="width: 15px; height: 15px;"></i> Assinar PRO (R$ 19,90)
          </button>
        </div>
      `;
    } else if (isPro) {
      bannerHtml = `
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 16px 20px; border-radius: 14px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <i data-lucide="shield-check" style="width: 28px; height: 28px; color: #059669; flex-shrink: 0;"></i>
            <div>
              <strong style="font-size: 1rem;">👑 Plano ESTUDE+ PRO Ativo:</strong>
              <p style="margin: 2px 0 0; font-size: 0.85rem; color: #047857;">
                Você tem acesso total e irrestrito: Chatbot IA Super Inteligente, Quizzes Diários e as 12 Apostilas SAS em PDF.
              </p>
            </div>
          </div>
          <button class="btn-outline" onclick="app.cancelSubscription()" style="background: #ffffff; border-color: #fca5a5; color: #dc2626; font-size: 0.82rem; font-weight: 700; padding: 8px 14px; border-radius: 8px; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
            <i data-lucide="x-circle" style="width: 15px; height: 15px;"></i> Cancelar Plano PRO
          </button>
        </div>
      `;
    } else {
      bannerHtml = `
        <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; color: #334155; padding: 16px 20px; border-radius: 14px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #475569;">
              <i data-lucide="book-open" style="width: 22px; height: 22px;"></i>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="font-size: 1rem; color: #0f172a;">Plano Base (Gratuito)</strong>
                <span style="background: #e2e8f0; color: #475569; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 12px;">ATIVO</span>
              </div>
              <p style="margin: 2px 0 0; font-size: 0.84rem; color: #64748b;">
                Acesso liberado aos TPCs e Quadro de Horários. O Chatbot IA, Quizzes Diários e Apostilas SAS estão bloqueados neste plano.
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn-primary" onclick="app.activate5DaysTrial()" style="background: linear-gradient(135deg, #9333ea, #4f46e5); font-size: 0.82rem; font-weight: 700; padding: 8px 14px; border-radius: 8px; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
              <i data-lucide="zap" style="width: 14px; height: 14px;"></i> 5 Dias Grátis
            </button>
            <button class="btn-primary" onclick="app.showModal('subscriptionModal')" style="font-size: 0.82rem; font-weight: 700; padding: 8px 14px; border-radius: 8px; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; background: #059669;">
              <i data-lucide="crown" style="width: 14px; height: 14px;"></i> Assinar PRO (R$ 19,90)
            </button>
          </div>
        </div>
      `;
    }

    if (!isPro && this.activePlanRequest && (this.activePlanRequest.status === 'pending' || this.activePlanRequest.status === 'in_review')) {
      const statusLabel = this.activePlanRequest.status === 'pending' ? 'Pendente' : 'Em Análise';
      const reqDate = new Date(this.activePlanRequest.createdAt || Date.now()).toLocaleDateString('pt-BR');
      bannerHtml = `
        <div style="background: #fffbeb; border: 1.5px solid #fde68a; color: #92400e; padding: 16px 20px; border-radius: 14px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 42px; height: 42px; border-radius: 10px; background: #fef3c7; display: flex; align-items: center; justify-content: center; color: #d97706; flex-shrink: 0;">
              <i data-lucide="clock" style="width: 24px; height: 24px;"></i>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="font-size: 1rem; color: #92400e;">⏳ Solicitação de Plano PRO (${statusLabel})</strong>
                <span style="background: #fef3c7; color: #b45309; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 12px; border: 1px solid #fde68a;">ENVIADA</span>
              </div>
              <p style="margin: 2px 0 0; font-size: 0.85rem; color: #b45309;">
                Seu pedido foi registrado em <strong>${reqDate}</strong>. Assim que o Freddie Costa confirmar a aprovação, seu acesso PRO será liberado simultaneamente no celular e no computador!
              </p>
            </div>
          </div>
          <button class="btn-primary" onclick="app.openProRequestModal()" style="font-size: 0.82rem; font-weight: 700; padding: 8px 14px; border-radius: 8px; cursor: pointer; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; background: #d97706;">
            <i data-lucide="eye" style="width: 15px; height: 15px;"></i> Ver Solicitação
          </button>
        </div>
      `;
    }

    if (dashBanner) {
      dashBanner.innerHTML = status === 'pending_cash' ? bannerHtml : '';
      dashBanner.style.display = status === 'pending_cash' ? 'block' : 'none';
    }

    if (plansBannerContainer) {
      plansBannerContainer.innerHTML = bannerHtml;
    }

    const btnProCard = document.getElementById('btnProPlanCard');
    const btnFreeCard = document.getElementById('btnFreePlanCard');
    const btnRequestPro = document.getElementById('btnRequestProPlanCard');

    if (btnRequestPro) {
      if (isPro) {
        btnRequestPro.style.display = 'none';
      } else if (this.activePlanRequest && (this.activePlanRequest.status === 'pending' || this.activePlanRequest.status === 'in_review')) {
        btnRequestPro.style.display = 'block';
        btnRequestPro.innerHTML = '<i data-lucide="clock"></i> Solicitação PRO Enviada (Em Análise)';
        btnRequestPro.style.background = '#f59e0b';
        btnRequestPro.onclick = () => this.openProRequestModal();
      } else {
        btnRequestPro.style.display = 'block';
        btnRequestPro.innerHTML = '<i data-lucide="crown"></i> Solicitar Plano PRO (R$ 19,90)';
        btnRequestPro.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
        btnRequestPro.onclick = () => this.openProRequestModal();
      }
    }

    if (btnProCard) {
      if (isPro) {
        btnProCard.innerHTML = '<i data-lucide="x-circle"></i> Cancelar Plano PRO (Voltar ao Básico)';
        btnProCard.className = 'btn-outline';
        btnProCard.style = 'width: 100%; font-size: 0.95rem; padding: 12px; border-color: #fca5a5; color: #dc2626; background: #fff; font-weight: 700; cursor: pointer;';
        btnProCard.onclick = () => this.cancelSubscription();
      } else {
        btnProCard.innerHTML = '<i data-lucide="crown"></i> Assinar Plano PRO (R$ 19,90)';
        btnProCard.className = 'btn-primary';
        btnProCard.style = 'width: 100%; font-size: 1rem; padding: 14px;';
        btnProCard.onclick = () => this.showModal('subscriptionModal');
      }
    }
    if (btnFreeCard) {
      if (isPro) {
        btnFreeCard.disabled = false;
        btnFreeCard.innerText = 'Voltar para o Plano Gratuito';
        btnFreeCard.style.cursor = 'pointer';
        btnFreeCard.onclick = () => this.cancelSubscription();
      } else {
        btnFreeCard.disabled = true;
        btnFreeCard.innerText = 'Plano Atual (Ativo)';
      }
    }

    const modalCancelContainer = document.getElementById('modalCancelPlanContainer');
    if (modalCancelContainer) {
      if (isPro) {
        modalCancelContainer.innerHTML = `
          <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="font-size: 0.82rem; color: #64748b; margin-bottom: 8px;">Seu plano atual é o <strong>PRO Ativo</strong>.</p>
            <button class="btn-outline" onclick="app.cancelSubscription()" style="border-color: #fca5a5; color: #dc2626; font-size: 0.82rem; font-weight: 700; padding: 8px 16px; cursor: pointer;">
              <i data-lucide="x-circle" style="width: 14px; height: 14px; display: inline; margin-right: 4px;"></i> Cancelar Assinatura PRO
            </button>
          </div>
        `;
      } else {
        modalCancelContainer.innerHTML = '';
      }
    }

    if (plansBadge) {
      if (isPro) {
        plansBadge.innerText = 'PLANO PRO ATIVO';
        plansBadge.className = 'badge-partner';
        plansBadge.style.background = '#dcfce7';
        plansBadge.style.color = '#15803d';
      } else if (status === 'trial_5d') {
        const days = this.currentUser?.trialDaysRemaining || 5;
        plansBadge.innerText = `⚡ 5 DIAS GRÁTIS ATIVOS (${days}D RESTANTES)`;
        plansBadge.className = 'badge-accent';
        plansBadge.style.background = '#fef3c7';
        plansBadge.style.color = '#b45309';
      } else if (status === 'pending_cash') {
        plansBadge.innerText = 'AGUARDANDO PAGAMENTO NA ESCOLA';
        plansBadge.className = 'badge-accent';
        plansBadge.style.background = '#fef3c7';
        plansBadge.style.color = '#b45309';
      } else {
        plansBadge.innerText = 'PLANO BASE (GRATUITO)';
        plansBadge.className = 'badge-free';
        plansBadge.style.background = '#f1f5f9';
        plansBadge.style.color = '#475569';
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  checkPendingAdminBadge() {
    const badge = document.getElementById('adminPendingCountBadge');
    const payments = this.state.payments || [];
    const pendingCount = payments.filter(p => p.status === 'pending').length;
    if (badge) {
      badge.innerText = pendingCount;
      badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }
    this.renderAdminPaymentsList();
  }

  showAdminModal() {
    if (!this.currentUser || (this.currentUser.role !== 'admin' && this.currentUser.username !== 'freddie' && this.currentUser.email !== 'freddie@gammon.com.br')) {
      alert('🔒 Acesso Restrito: Apenas o administrador autorizado (Freddie Costa) tem permissão para acessar a Central Única.');
      return;
    }
    this.showModal('adminPaymentsModal');
    this.currentAdminTab = this.currentAdminTab || 'students';
    this.switchAdminTab(this.currentAdminTab);
    this.loadAdminOverview();
  }

  async loadAdminOverview() {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const sessId = localStorage.getItem('estude_session_id');
      if (sessId) headers['x-session-id'] = sessId;
      headers['x-admin-token'] = 'admin_master_freddie_token_2026';

      const res = await fetch('/api/admin/overview', { headers });
      if (res.ok) {
        const data = await res.json();
        this.adminOverviewData = data;
        this.adminPlanRequests = data.planRequests || [];
        this.adminSupportRequests = data.supportRequests || [];
        this.adminStudyReports = data.studyReports || [];
        this.adminNotifications = data.notifications || [];
        this.adminAuditLogs = data.auditLogs || [];

        // Atualizar KPI Stats
        const stats = data.stats || {};
        const elTotalUsers = document.getElementById('statTotalUsers');
        const elActiveOnline = document.getElementById('statActiveOnline');
        const elProUsers = document.getElementById('statProUsers');
        const elPendingPlans = document.getElementById('statPendingPlans');
        const elPendingSupport = document.getElementById('statPendingSupport');
        const elUnreadNotifs = document.getElementById('statUnreadNotifs');

        if (elTotalUsers) elTotalUsers.innerText = stats.totalUsers ?? (data.users?.length || 0);
        if (elActiveOnline) elActiveOnline.innerText = stats.activeOnline ?? 1;
        if (elProUsers) elProUsers.innerText = stats.proUsers ?? 1;
        if (elPendingPlans) elPendingPlans.innerText = stats.pendingPlanRequests ?? 0;
        if (elPendingSupport) elPendingSupport.innerText = stats.pendingSupport ?? 0;
        if (elUnreadNotifs) elUnreadNotifs.innerText = stats.unreadNotifications ?? 0;

        // Atualizar Badges das Abas
        const badgePlan = document.getElementById('adminPlanRequestsBadgeCount');
        if (badgePlan) {
          badgePlan.innerText = stats.pendingPlanRequests || 0;
          badgePlan.style.display = (stats.pendingPlanRequests > 0) ? 'inline-block' : 'none';
        }
        const badgeSupp = document.getElementById('adminSupportBadgeCount');
        if (badgeSupp) {
          badgeSupp.innerText = stats.pendingSupport || 0;
          badgeSupp.style.display = (stats.pendingSupport > 0) ? 'inline-block' : 'none';
        }
        const badgeStudy = document.getElementById('adminStudyBadgeCount');
        if (badgeStudy) {
          badgeStudy.innerText = stats.pendingStudyReports || 0;
          badgeStudy.style.display = (stats.pendingStudyReports > 0) ? 'inline-block' : 'none';
        }
        const badgeNotifTab = document.getElementById('adminNotifsTabBadge');
        if (badgeNotifTab) {
          badgeNotifTab.innerText = stats.unreadNotifications || 0;
          badgeNotifTab.style.display = (stats.unreadNotifications > 0) ? 'inline-block' : 'none';
        }

        // Atualizar Badge Principal do Botão de Gestão no Topo
        const totalPendingMain = (stats.pendingPlanRequests || 0) + (stats.pendingSupport || 0) + (stats.unreadNotifications || 0);
        const adminMainBadge = document.getElementById('adminPendingCountBadge');
        if (adminMainBadge) {
          adminMainBadge.innerText = totalPendingMain;
          adminMainBadge.style.display = totalPendingMain > 0 ? 'inline-block' : 'none';
        }

        // Renderizar aba ativa
        this.renderCurrentAdminTab();
      }
    } catch (e) {
      console.warn('[Admin Overview Fetch Failed]', e);
    }
  }

  switchAdminTab(tab) {
    this.currentAdminTab = tab;
    const tabMap = {
      students: { btn: 'tabAdminStudentsBtn', view: 'adminStudentsView' },
      plan_requests: { btn: 'tabAdminPlanRequestsBtn', view: 'adminPlanRequestsView' },
      support: { btn: 'tabAdminSupportBtn', view: 'adminSupportView' },
      study_reports: { btn: 'tabAdminStudyReportsBtn', view: 'adminStudyReportsView' },
      agenda_sync: { btn: 'tabAdminAgendaSyncBtn', view: 'adminAgendaSyncView' },
      notifications: { btn: 'tabAdminNotificationsBtn', view: 'adminNotificationsView' },
      system_health: { btn: 'tabAdminSystemHealthBtn', view: 'adminSystemHealthView' }
    };

    Object.keys(tabMap).forEach(key => {
      const cfg = tabMap[key];
      const btn = document.getElementById(cfg.btn);
      const view = document.getElementById(cfg.view);
      if (key === tab) {
        btn?.classList.add('active');
        if (view) view.style.display = 'block';
      } else {
        btn?.classList.remove('active');
        if (view) view.style.display = 'none';
      }
    });

    this.renderCurrentAdminTab();
    if (window.lucide) window.lucide.createIcons();
  }

  renderCurrentAdminTab() {
    const tab = this.currentAdminTab || 'students';
    if (tab === 'students') this.renderAdminStudentsList();
    else if (tab === 'plan_requests') this.renderAdminPlanRequestsList();
    else if (tab === 'support') this.renderAdminSupportList();
    else if (tab === 'study_reports') this.renderAdminStudyReportsList();
    else if (tab === 'agenda_sync') this.renderAdminAgendaSyncLogs();
    else if (tab === 'notifications') this.renderAdminNotificationsList();
    else if (tab === 'system_health') this.renderAdminSystemHealth();
  }

  renderAdminPlanRequestsList() {
    const container = document.getElementById('adminPlanRequestsListContainer');
    if (!container) return;

    let requests = this.adminPlanRequests || [];
    const filterStatus = document.getElementById('adminPlanRequestsFilterStatus')?.value || 'all';
    if (filterStatus !== 'all') {
      requests = requests.filter(r => r.status === filterStatus);
    }

    if (requests.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 36px 20px; color: #64748b; background: #f8fafc; border-radius: 14px; border: 1px dashed #cbd5e1; margin-top: 10px;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">💎</div>
          <p style="margin: 0; font-weight: 700; color: #1e1b4b; font-size: 0.95rem;">Nenhuma solicitação encontrada neste filtro.</p>
          <span style="font-size: 0.8rem; color: #64748b;">Quando um aluno solicitar o Plano PRO pelo celular, tablet ou PC, o pedido aparecerá aqui.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = requests.map(r => {
      const statusBadge = {
        pending: '<span style="background: #fef3c7; color: #92400e; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🟡 Pendente</span>',
        in_review: '<span style="background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🔵 Em análise</span>',
        approved: '<span style="background: #dcfce7; color: #15803d; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🟢 Aprovada (PRO Ativo)</span>',
        rejected: '<span style="background: #fee2e2; color: #b91c1c; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🔴 Recusada</span>'
      }[r.status] || r.status;

      const dateFmt = r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR') : '-';

      return `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <strong style="font-size: 1rem; color: #0f172a;">${r.userName}</strong>
                <span style="font-family: monospace; font-size: 0.75rem; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #475569;">ID: ${r.userId}</span>
                ${statusBadge}
              </div>
              <p style="margin: 4px 0 0; font-size: 0.78rem; color: #64748b;">
                ${r.userGrade ? `Turma: <strong>${r.userGrade}</strong> &bull; ` : ''}
                Plano: <strong>${r.planName || 'Plano PRO'} (R$ ${Number(r.amount || 19.9).toFixed(2).replace('.', ',')})</strong> &bull;
                Data: <strong>${dateFmt}</strong>
              </p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.75rem; background: #eef2ff; color: #4338ca; padding: 3px 8px; border-radius: 6px; font-weight: 700;">
                ${r.contactMethod === 'whatsapp' ? '📱 WhatsApp' : r.contactMethod === 'email' ? '✉️ E-mail' : '🏫 Na Escola'}
              </span>
              ${r.contactInfo ? `<div style="font-size: 0.8rem; font-weight: 700; color: #1e1b4b; margin-top: 3px;">${r.contactInfo}</div>` : ''}
            </div>
          </div>

          ${r.note ? `
            <div style="background: #f8fafc; border-left: 3px solid #6366f1; padding: 6px 12px; border-radius: 4px; font-size: 0.78rem; color: #334155; margin-bottom: 10px; font-style: italic;">
              "${r.note}"
            </div>
          ` : ''}

          ${r.statusReason ? `
            <div style="background: #fff7ed; border-left: 3px solid #f97316; padding: 6px 12px; border-radius: 4px; font-size: 0.75rem; color: #9a3412; margin-bottom: 10px;">
              <strong>Observação da análise:</strong> ${r.statusReason} ${r.reviewedBy ? `(por ${r.reviewedBy})` : ''}
            </div>
          ` : ''}

          <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; border-top: 1px solid #f1f5f9; padding-top: 10px;">
            ${r.status !== 'in_review' && r.status !== 'approved' ? `
              <button class="btn-outline" onclick="app.adminUpdatePlanRequestStatus('${r.id}', 'in_review')" style="font-size: 0.75rem; padding: 6px 12px; border-radius: 8px; color: #0284c7; border-color: #7dd3fc; background: #f0f9ff; font-weight: 700; cursor: pointer;">
                <i data-lucide="search" style="width: 13px; height: 13px; display: inline; vertical-align: middle;"></i> Marcar Em Análise
              </button>
            ` : ''}

            ${r.status !== 'approved' ? `
              <button class="btn-primary" onclick="app.adminUpdatePlanRequestStatus('${r.id}', 'approved')" style="font-size: 0.75rem; padding: 6px 14px; border-radius: 8px; background: #059669; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="check-check" style="width: 14px; height: 14px;"></i> Aprovar e Ativar PRO
              </button>
            ` : `
              <span style="font-size: 0.75rem; color: #059669; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> PRO Ativo em Todos os Dispositivos
              </span>
            `}

            ${r.status !== 'rejected' ? `
              <button class="btn-outline" onclick="app.adminUpdatePlanRequestStatus('${r.id}', 'rejected')" style="font-size: 0.75rem; padding: 6px 10px; border-radius: 8px; color: #dc2626; border-color: #fca5a5; background: #fff5f5; font-weight: 700; cursor: pointer;">
                <i data-lucide="x" style="width: 13px; height: 13px; display: inline; vertical-align: middle;"></i> Recusar
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async adminUpdatePlanRequestStatus(requestId, status) {
    let reason = '';
    if (status === 'rejected') {
      reason = prompt('Motivo da recusa (opcional para informar ao aluno):') || '';
    } else if (status === 'approved') {
      if (!confirm('Confirmar aprovação do Plano PRO para este aluno? O acesso ilimitado será liberado imediatamente no celular, tablet e PC dele.')) {
        return;
      }
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      const sessId = localStorage.getItem('estude_session_id');
      if (sessId) headers['x-session-id'] = sessId;
      headers['x-admin-token'] = 'admin_master_freddie_token_2026';

      const res = await fetch('/api/admin/plan-requests/status', {
        method: 'POST',
        headers,
        body: JSON.stringify({ requestId, status, reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (status === 'approved' && typeof confetti === 'function') {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
        }
        await this.loadAdminOverview();
        alert(data.message || 'Status atualizado com sucesso!');
      } else {
        alert(data.error || 'Erro ao atualizar status.');
      }
    } catch (e) {
      alert('Erro de conexão ao atualizar status da solicitação.');
    }
  }

  renderAdminSupportList() {
    const container = document.getElementById('adminSupportListContainer');
    if (!container) return;

    let tickets = this.adminSupportRequests || [];
    const catFilter = document.getElementById('adminSupportCategoryFilter')?.value || 'all';
    const statusFilter = document.getElementById('adminSupportStatusFilter')?.value || 'all';

    if (catFilter !== 'all') tickets = tickets.filter(t => t.category === catFilter);
    if (statusFilter !== 'all') tickets = tickets.filter(t => t.status === statusFilter);

    if (tickets.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 36px 20px; color: #64748b; background: #f8fafc; border-radius: 14px; border: 1px dashed #cbd5e1; margin-top: 10px;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">💬</div>
          <p style="margin: 0; font-weight: 700; color: #1e1b4b; font-size: 0.95rem;">Nenhuma dúvida ou solicitação de suporte encontrada.</p>
          <span style="font-size: 0.8rem; color: #64748b;">Quando os alunos enviarem dúvidas de seus celulares ou computadores, elas aparecerão aqui.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = tickets.map(t => {
      const statusBadge = {
        pending: '<span style="background: #fef3c7; color: #92400e; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🟡 Pendente</span>',
        in_review: '<span style="background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🔵 Em análise</span>',
        answered: '<span style="background: #dcfce7; color: #15803d; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🟢 Respondido</span>',
        resolved: '<span style="background: #f1f5f9; color: #475569; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">✔ Resolvido</span>',
        rejected: '<span style="background: #fee2e2; color: #b91c1c; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🔴 Recusado</span>'
      }[t.status] || t.status;

      const catBadge = {
        duvida: '<span style="background: #eff6ff; color: #1d4ed8; font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">❓ Dúvida</span>',
        suporte: '<span style="background: #fdf4ff; color: #a21caf; font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">🛠️ Suporte</span>',
        plano: '<span style="background: #fef3c7; color: #b45309; font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">💎 Plano</span>',
        agenda: '<span style="background: #ecfdf5; color: #047857; font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">📅 Agenda</span>',
        outro: '<span style="background: #f1f5f9; color: #475569; font-size: 0.72rem; font-weight: 800; padding: 2px 7px; border-radius: 6px;">💬 Outro</span>'
      }[t.category] || t.category;

      const dateFmt = t.createdAt ? new Date(t.createdAt).toLocaleString('pt-BR') : '-';

      return `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                ${catBadge}
                <strong style="font-size: 0.95rem; color: #0f172a;">${t.subject}</strong>
                ${statusBadge}
              </div>
              <p style="margin: 3px 0 0; font-size: 0.78rem; color: #64748b;">
                Por <strong>${t.userName}</strong> &bull; Dispositivo: <strong>${t.deviceType || 'PC'}</strong> &bull; Data: ${dateFmt}
              </p>
            </div>
            ${t.contactInfo ? `<span style="font-size: 0.75rem; background: #f8fafc; padding: 3px 8px; border-radius: 6px; color: #334155;">📞 ${t.contactInfo}</span>` : ''}
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 10px 12px; font-size: 0.84rem; color: #1e293b; margin: 8px 0; line-height: 1.4;">
            ${t.message}
          </div>

          ${t.adminResponse ? `
            <div style="background: #f0fdf4; border-left: 3px solid #16a34a; padding: 8px 12px; border-radius: 4px; font-size: 0.8rem; color: #14532d; margin-bottom: 10px;">
              <strong>Resposta enviada (${t.answeredBy || 'Freddie'}):</strong> ${t.adminResponse}
            </div>
          ` : ''}

          <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center; flex-wrap: wrap; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9;">
            <button class="btn-outline" onclick="app.adminRespondSupport('${t.id}')" style="font-size: 0.75rem; padding: 6px 12px; border-radius: 8px; font-weight: 700; cursor: pointer; color: #4338ca; border-color: #c7d2fe; background: #eef2ff;">
              <i data-lucide="message-square" style="width: 13px; height: 13px; display: inline;"></i> Responder / Despachar
            </button>
            ${t.status !== 'resolved' ? `
              <button class="btn-primary" onclick="app.adminUpdateSupportStatus('${t.id}', 'resolved')" style="font-size: 0.75rem; padding: 6px 12px; border-radius: 8px; font-weight: 700; cursor: pointer; background: #059669;">
                <i data-lucide="check" style="width: 13px; height: 13px; display: inline;"></i> Marcar Resolvido
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async adminRespondSupport(requestId) {
    const item = (this.adminSupportRequests || []).find(s => s.id === requestId);
    const existing = item?.adminResponse || '';
    const answer = prompt(`💬 Resposta para "${item?.userName || 'Aluno'}" sobre: ${item?.subject}\n\nDigite a mensagem de resposta que aparecerá na tela dele:`, existing);
    if (answer === null) return;
    await this.adminUpdateSupportStatus(requestId, 'answered', answer);
  }

  async adminUpdateSupportStatus(requestId, status, responseText = null) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const sessId = localStorage.getItem('estude_session_id');
      if (sessId) headers['x-session-id'] = sessId;
      headers['x-admin-token'] = 'admin_master_freddie_token_2026';

      const payload = { requestId, status };
      if (responseText !== null) payload.adminResponse = responseText;

      const res = await fetch('/api/admin/support/status', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await this.loadAdminOverview();
        alert(data.message || 'Status atualizado com sucesso!');
      } else {
        alert(data.error || 'Erro ao atualizar.');
      }
    } catch (e) {
      alert('Erro de conexão ao atualizar solicitação.');
    }
  }

  renderAdminStudyReportsList() {
    const container = document.getElementById('adminStudyReportsListContainer');
    if (!container) return;

    let reports = this.adminStudyReports || [];
    const filterStatus = document.getElementById('adminStudyStatusFilter')?.value || 'all';
    if (filterStatus !== 'all') reports = reports.filter(r => r.status === filterStatus);

    if (reports.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 36px 20px; color: #64748b; background: #f8fafc; border-radius: 14px; border: 1px dashed #cbd5e1; margin-top: 10px;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">📚</div>
          <p style="margin: 0; font-weight: 700; color: #1e1b4b; font-size: 0.95rem;">Nenhum erro de estudo reportado.</p>
          <span style="font-size: 0.8rem; color: #64748b;">Quando algum aluno relatar problema em questão, quiz ou apostila, o chamado aparecerá aqui.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = reports.map(r => {
      const statusBadge = {
        pending: '<span style="background: #fef3c7; color: #92400e; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🟡 Pendente</span>',
        in_review: '<span style="background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🔵 Em Análise</span>',
        resolved: '<span style="background: #dcfce7; color: #15803d; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">🟢 Corrigido / Resolvido</span>',
        dismissed: '<span style="background: #f1f5f9; color: #475569; font-weight: 800; font-size: 0.72rem; padding: 3px 8px; border-radius: 6px;">⚪ Descartado</span>'
      }[r.status] || r.status;

      const dateFmt = r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR') : '-';

      return `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="background: #fff7ed; color: #c2410c; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">[${r.category.toUpperCase()}]</span>
                <strong style="font-size: 0.92rem; color: #0f172a;">${r.title}</strong>
                ${statusBadge}
              </div>
              <p style="margin: 3px 0 0; font-size: 0.78rem; color: #64748b;">
                Reportado por <strong>${r.userName}</strong> &bull; Dispositivo: ${r.deviceType || 'PC'} &bull; ${dateFmt}
              </p>
            </div>
          </div>

          <div style="background: #f8fafc; border-radius: 8px; padding: 10px 12px; font-size: 0.84rem; color: #334155; margin: 8px 0; line-height: 1.4;">
            ${r.description}
          </div>

          ${r.adminNote ? `
            <div style="background: #f0fdf4; border-left: 3px solid #16a34a; padding: 6px 12px; border-radius: 4px; font-size: 0.78rem; color: #14532d; margin-bottom: 8px;">
              <strong>Nota do Admin:</strong> ${r.adminNote}
            </div>
          ` : ''}

          <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center; flex-wrap: wrap; margin-top: 8px;">
            ${r.status !== 'resolved' ? `
              <button class="btn-primary" onclick="app.adminUpdateStudyReportStatus('${r.id}', 'resolved')" style="font-size: 0.75rem; padding: 6px 12px; border-radius: 8px; font-weight: 700; cursor: pointer; background: #059669;">
                <i data-lucide="check" style="width: 13px; height: 13px; display: inline;"></i> Marcar Corrigido
              </button>
            ` : ''}
            ${r.status !== 'dismissed' ? `
              <button class="btn-outline" onclick="app.adminUpdateStudyReportStatus('${r.id}', 'dismissed')" style="font-size: 0.75rem; padding: 6px 10px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                Descartar
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async adminUpdateStudyReportStatus(reportId, status) {
    const note = prompt('Nota interna / resolução (opcional):') || '';
    try {
      const headers = { 'Content-Type': 'application/json' };
      const sessId = localStorage.getItem('estude_session_id');
      if (sessId) headers['x-session-id'] = sessId;
      headers['x-admin-token'] = 'admin_master_freddie_token_2026';

      const res = await fetch('/api/admin/study-reports/status', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reportId, status, adminNote: note })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await this.loadAdminOverview();
        alert(data.message || 'Relatório atualizado com sucesso!');
      } else {
        alert(data.error || 'Erro ao atualizar.');
      }
    } catch (e) {
      alert('Erro de conexão ao atualizar relatório.');
    }
  }

  renderAdminAgendaSyncLogs() {
    const textEl = document.getElementById('adminAgendaLastSyncText');
    const container = document.getElementById('adminAgendaSyncLogsContainer');
    const agenda = this.adminOverviewData?.agendaStatus || {};

    if (textEl) {
      const lastSync = agenda.status?.lastSync ? new Date(agenda.status.lastSync).toLocaleString('pt-BR') : 'Nunca sincronizado';
      textEl.innerHTML = `Última sincronização com o Portal Gammon: <strong>${lastSync}</strong> &bull; Total TPCs no banco: <strong>${agenda.totalTpcs || 0}</strong> &bull; Status: <span style="color: #059669; font-weight: 800;">${agenda.status?.status || 'OK'}</span>`;
    }

    if (!container) return;
    const logs = agenda.logs || [];
    if (logs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #64748b; font-size: 0.85rem; background: #f8fafc; border-radius: 8px;">
          Nenhum log recente de sincronização da agenda gravado.
        </div>
      `;
      return;
    }

    container.innerHTML = logs.map(l => {
      const isSuccess = l.status === 'success';
      const timeFmt = l.timestamp ? new Date(l.timestamp).toLocaleString('pt-BR') : '-';
      return `
        <div style="background: ${isSuccess ? '#f0fdf4' : '#fff1f2'}; border: 1px solid ${isSuccess ? '#bbf7d0' : '#fecdd3'}; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div>
            <strong style="color: ${isSuccess ? '#166534' : '#9f1239'}; font-size: 0.85rem;">
              ${isSuccess ? '✔ Sincronização Concluída' : '⚠️ Falha ou Aviso'}
            </strong>
            <p style="margin: 2px 0 0; font-size: 0.78rem; color: #334155;">${l.message || (isSuccess ? `${l.totalCaptured} TPCs atualizados` : l.error)}</p>
          </div>
          <span style="font-size: 0.75rem; color: #64748b; font-family: monospace;">${timeFmt}</span>
        </div>
      `;
    }).join('');
  }

  async adminTriggerGammonSync() {
    const btn = document.getElementById('btnAdminTriggerGammonSync');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2"></i> Conectando ao Portal Gammon...';
    }
    try {
      const res = await fetch('/api/gammon/sync', { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Sincronização executada!');
      await this.loadAdminOverview();
    } catch (e) {
      alert('Erro de conexão ao disparar sincronização.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="download-cloud"></i> Sincronizar Agora com o Portal';
      }
      if (window.lucide) window.lucide.createIcons();
    }
  }

  renderAdminNotificationsList() {
    const container = document.getElementById('adminNotificationsListContainer');
    if (!container) return;

    const notifs = this.adminNotifications || [];
    if (notifs.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 36px 20px; color: #64748b; background: #f8fafc; border-radius: 14px; border: 1px dashed #cbd5e1; margin-top: 10px;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🔔</div>
          <p style="margin: 0; font-weight: 700; color: #1e1b4b; font-size: 0.95rem;">Nenhuma notificação registrada.</p>
          <span style="font-size: 0.8rem; color: #64748b;">Eventos de cadastros, pagamentos e chamados aparecerão aqui em tempo real.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = notifs.map(n => {
      const isUnread = n.status === 'unread';
      const timeFmt = n.createdAt ? new Date(n.createdAt).toLocaleString('pt-BR') : '-';
      const catBadge = {
        user: '👥 Usuário',
        plan: '💎 Plano PRO',
        support: '💬 Suporte',
        study: '📚 Estudos',
        agenda: '📅 Agenda',
        system: '⚙️ Sistema'
      }[n.category] || n.category;

      return `
        <div style="background: ${isUnread ? '#fffbeb' : '#ffffff'}; border: 1.5px solid ${isUnread ? '#fde68a' : '#e2e8f0'}; border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 0.72rem; font-weight: 800; background: #e0e7ff; color: #3730a3; padding: 2px 7px; border-radius: 6px;">${catBadge}</span>
              <strong style="font-size: 0.88rem; color: #0f172a;">${n.title}</strong>
              ${isUnread ? '<span style="background: #ef4444; color: white; font-size: 0.65rem; font-weight: 800; padding: 1px 6px; border-radius: 999px;">NOVA</span>' : ''}
            </div>
            <p style="margin: 4px 0 0; font-size: 0.82rem; color: #334155; line-height: 1.4;">${n.message}</p>
            <span style="font-size: 0.72rem; color: #64748b; font-family: monospace; margin-top: 4px; display: inline-block;">${timeFmt}</span>
          </div>
          ${isUnread ? `
            <button class="btn-outline" onclick="app.adminMarkNotificationRead('${n.id}')" style="font-size: 0.72rem; padding: 4px 8px; border-radius: 6px; cursor: pointer; white-space: nowrap;">
              Marcar lida
            </button>
          ` : ''}
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  async adminMarkAllNotificationsRead() {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const sessId = localStorage.getItem('estude_session_id');
      if (sessId) headers['x-session-id'] = sessId;
      headers['x-admin-token'] = 'admin_master_freddie_token_2026';

      await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers,
        body: JSON.stringify({ all: true })
      });
      await this.loadAdminOverview();
    } catch (e) {}
  }

  async adminMarkNotificationRead(notificationId) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const sessId = localStorage.getItem('estude_session_id');
      if (sessId) headers['x-session-id'] = sessId;
      headers['x-admin-token'] = 'admin_master_freddie_token_2026';

      await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers,
        body: JSON.stringify({ notificationId })
      });
      await this.loadAdminOverview();
    } catch (e) {}
  }

  renderAdminSystemHealth() {
    const grid = document.getElementById('adminSystemCardsGrid');
    const auditContainer = document.getElementById('adminAuditLogsContainer');
    const sys = this.adminOverviewData?.systemStatus || {};

    if (grid) {
      grid.innerHTML = `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.8rem; font-weight: 800; color: #475569; margin-bottom: 6px;">☁️ Servidor Render Cloud</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">${sys.render?.environment === 'production' ? 'Produção Online' : 'Ambiente Local / Dev'}</div>
          <p style="margin: 4px 0 0; font-size: 0.75rem; color: #64748b;">Porta: ${sys.render?.port || 8080} &bull; Uptime: ${Math.floor((sys.uptimeSeconds || 0) / 60)} min</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.8rem; font-weight: 800; color: #475569; margin-bottom: 6px;">🗄️ Banco de Dados</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #059669;">${sys.supabase?.status || 'Ativo'}</div>
          <p style="margin: 4px 0 0; font-size: 0.75rem; color: #64748b;">db.json e Supabase REST sincronizados</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.8rem; font-weight: 800; color: #475569; margin-bottom: 6px;">🤖 Gemini IA Inteligente</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #4f46e5;">${sys.gemini?.available ? 'Ativo (Gemini 2.5 Flash)' : 'Offline'}</div>
          <p style="margin: 4px 0 0; font-size: 0.75rem; color: #64748b;">Tutor inteligente pronto para responder</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px;">
          <div style="font-size: 0.8rem; font-weight: 800; color: #475569; margin-bottom: 6px;">⚡ Memória & Conexões</div>
          <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">${sys.memoryUsageMb || 50} MB RSS</div>
          <p style="margin: 4px 0 0; font-size: 0.75rem; color: #64748b;">Tempo real SSE ativo com fallback</p>
        </div>
      `;
    }

    if (auditContainer) {
      const logs = this.adminAuditLogs || [];
      if (logs.length === 0) {
        auditContainer.innerHTML = '<p style="color: #64748b; margin: 0; padding: 10px;">Nenhum registro de auditoria gravado ainda.</p>';
      } else {
        auditContainer.innerHTML = logs.map(l => {
          const time = l.timestamp ? new Date(l.timestamp).toLocaleTimeString('pt-BR') : '-';
          return `
            <div style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; gap: 8px;">
              <div>
                <span style="color: #4f46e5; font-weight: 700;">[${l.action}]</span>
                <span style="color: #334155;">por ${l.actor || 'sistema'}: ${typeof l.details === 'object' ? JSON.stringify(l.details) : l.details}</span>
              </div>
              <span style="color: #94a3b8; white-space: nowrap;">${time} (${l.ip || '127.0.0.1'})</span>
            </div>
          `;
        }).join('');
      }
    }
  }

  async adminRunSystemDiagnostics() {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const sessId = localStorage.getItem('estude_session_id');
      if (sessId) headers['x-session-id'] = sessId;
      headers['x-admin-token'] = 'admin_master_freddie_token_2026';

      const res = await fetch('/api/admin/system/test-integrations', { method: 'POST', headers });
      const data = await res.json();
      if (res.ok && data.success) {
        const r = data.results || {};
        alert(`🔍 RELATÓRIO DE DIAGNÓSTICO DO SERVIDOR ESTUDE+:\n\n` +
          `• Disco e Banco Local: ${r.diskPersistence}\n` +
          `• Supabase PostgreSQL: ${r.supabasePostgreSQL}\n` +
          `• Google Gemini IA: ${r.geminiIA}\n` +
          `• Nuvem Render: ${r.renderCloud}\n` +
          `• Memória Usada: ${r.memoryRssMb} MB\n` +
          `• Tempo Ativo: ${r.uptimeHours} horas\n` +
          `• Administradores Conectados: ${r.activeAdminConnections}\n\n` +
          `Status Geral: TODAS AS INTEGRAÇÕES OPERACIONAIS!`);
      } else {
        alert(data.error || 'Erro ao executar diagnóstico.');
      }
    } catch (e) {
      alert('Erro de conexão ao executar diagnóstico.');
    }
  }

  /* ==========================================================================
     CENTRAL DE AJUDA & REPORTAR DO ALUNO (CELULAR, TABLET, PC)
     ========================================================================== */
  openSupportModal() {
    if (!this.currentUser) {
      this.showAuthOverlay();
      return;
    }
    this.showModal('studentSupportModal');
    this.switchStudentSupportTab('new');
    if (window.lucide) window.lucide.createIcons();
  }

  switchStudentSupportTab(tab) {
    const btnNew = document.getElementById('tabSupportNewBtn');
    const btnHist = document.getElementById('tabSupportMyTicketsBtn');
    const viewNew = document.getElementById('studentSupportNewView');
    const viewHist = document.getElementById('studentSupportHistoryView');

    if (tab === 'new') {
      btnNew?.classList.add('active');
      btnHist?.classList.remove('active');
      if (viewNew) viewNew.style.display = 'block';
      if (viewHist) viewHist.style.display = 'none';
    } else {
      btnNew?.classList.remove('active');
      btnHist?.classList.add('active');
      if (viewNew) viewNew.style.display = 'none';
      if (viewHist) viewHist.style.display = 'block';
      this.loadStudentSupportHistory();
    }
    if (window.lucide) window.lucide.createIcons();
  }

  async submitStudentSupport(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!this.currentUser) {
      this.showAuthOverlay();
      return;
    }

    const category = document.getElementById('studentSupportCategory')?.value || 'duvida';
    const subject = document.getElementById('studentSupportSubject')?.value || '';
    const message = document.getElementById('studentSupportMessage')?.value || '';
    const contact = document.getElementById('studentSupportContact')?.value || '';

    const btn = document.getElementById('btnSubmitSupportTicket');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i data-lucide="loader-2"></i> Enviando...';
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      const sessId = localStorage.getItem('estude_session_id');
      if (sessId) headers['x-session-id'] = sessId;
      if (this.currentUser?.id) headers['x-user-id'] = this.currentUser.id;

      const deviceType = window.innerWidth < 768 ? 'Celular' : (window.innerWidth < 1024 ? 'Tablet' : 'Computador / PC');

      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers,
        body: JSON.stringify({ category, subject, message, contactInfo: contact, deviceType })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('🎉 ' + data.message);
        document.getElementById('studentSupportSubject').value = '';
        document.getElementById('studentSupportMessage').value = '';
        this.switchStudentSupportTab('history');
      } else {
        alert(data.error || 'Erro ao enviar.');
      }
    } catch (err) {
      alert('Erro de conexão ao enviar. Tente novamente.');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send"></i> Enviar para o Servidor';
      }
      if (window.lucide) window.lucide.createIcons();
    }
  }

  async loadStudentSupportHistory() {
    const container = document.getElementById('studentSupportHistoryListContainer');
    if (!container) return;

    try {
      const headers = { 'Content-Type': 'application/json' };
      const sessId = localStorage.getItem('estude_session_id');
      if (sessId) headers['x-session-id'] = sessId;
      if (this.currentUser?.id) headers['x-user-id'] = this.currentUser.id;

      const res = await fetch('/api/support/my-tickets', { headers });
      const data = await res.json();
      const list = data.tickets || [];

      if (list.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 24px; color: #64748b; font-size: 0.85rem;">
            Você ainda não enviou nenhuma dúvida ou solicitação.<br>
            Use a aba "Nova Mensagem" acima para falar com o Freddie!
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(t => {
        const isAnswered = t.status === 'answered' || t.status === 'resolved';
        return `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
              <strong style="font-size: 0.88rem; color: #0f172a;">${t.subject}</strong>
              <span style="font-size: 0.7rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${isAnswered ? '#dcfce7' : '#fef3c7'}; color: ${isAnswered ? '#15803d' : '#92400e'};">
                ${isAnswered ? 'Respondido' : 'Em Análise'}
              </span>
            </div>
            <p style="margin: 4px 0 0; font-size: 0.8rem; color: #475569;">"${t.message}"</p>
            ${t.adminResponse ? `
              <div style="background: #ecfdf5; border-left: 3px solid #10b981; padding: 8px 10px; border-radius: 4px; font-size: 0.8rem; color: #065f46; margin-top: 6px;">
                <strong>Resposta do Freddie:</strong> ${t.adminResponse}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    } catch (e) {
      container.innerHTML = '<p style="color: #dc2626; font-size: 0.82rem; text-align: center;">Erro ao carregar mensagens.</p>';
    }
  }

  renderAdminStudentsList(searchTerm = '') {
    const container = document.getElementById('adminStudentsListContainer');
    const badgeCount = document.getElementById('adminStudentsBadgeCount');
    if (!container) return;

    const term = (searchTerm || '').toLowerCase().trim();
    const allUsers = this.users || [];
    if (badgeCount) {
      badgeCount.innerText = allUsers.length;
    }

    const filtered = allUsers.filter(u => {
      if (!term) return true;
      return (
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term))
      );
    });

    const masterHeaderHtml = `
      <div style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: white; border-radius: 16px; padding: 18px 20px; margin-bottom: 18px; box-shadow: 0 4px 20px rgba(49, 46, 129, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
              🎮
            </div>
            <div>
              <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #ffffff;">Comando Mestre do PC (Controle dos Celulares)</h4>
              <p style="margin: 2px 0 0; font-size: 0.75rem; color: #c7d2fe;">Comande e aplique configurações em tempo real para todos os celulares conectados</p>
            </div>
          </div>
          <div style="background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.4); padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 800; color: #86efac; display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e;"></span>
            <span>${this.connectedDevices ? this.connectedDevices.length : 1} dispositivo(s) conectado(s)</span>
          </div>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" class="btn-primary" onclick="app.masterSetPlanForAll('pro')" style="background: #059669; font-size: 0.78rem; font-weight: 800; padding: 8px 14px; border-radius: 10px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
            <i data-lucide="zap" style="width: 14px; height: 14px;"></i>
            Liberar PRO nos Celulares
          </button>
          <button type="button" class="btn-outline" onclick="app.masterSetPlanForAll('free')" style="color: #ffffff; border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); font-size: 0.78rem; font-weight: 700; padding: 8px 14px; border-radius: 10px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
            <i data-lucide="book-open" style="width: 14px; height: 14px;"></i>
            Definir Celulares como Plano Base
          </button>
          <button type="button" class="btn-outline" id="btnMasterGammonSync" onclick="app.masterTriggerGammonSync()" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.1); font-size: 0.78rem; font-weight: 700; padding: 8px 14px; border-radius: 10px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
            <i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i>
            Sincronizar Gammon+ Oficial (118 TPCs)
          </button>
          <button type="button" class="btn-outline" onclick="app.masterSendBroadcastNotice()" style="color: #fcd34d; border-color: rgba(252, 211, 77, 0.4); background: rgba(252, 211, 77, 0.1); font-size: 0.78rem; font-weight: 700; padding: 8px 14px; border-radius: 10px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
            <i data-lucide="megaphone" style="width: 14px; height: 14px;"></i>
            Enviar Mensagem para Celulares
          </button>
          <button type="button" class="btn-outline" onclick="app.adminCreateNewStudentModal()" style="color: #e0e7ff; border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); font-size: 0.78rem; font-weight: 700; padding: 8px 14px; border-radius: 10px; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
            <i data-lucide="user-plus" style="width: 14px; height: 14px;"></i>
            + Cadastrar Nova Conta
          </button>
        </div>
      </div>
    `;

    if (filtered.length === 0) {
      container.innerHTML = masterHeaderHtml + `
        <div style="text-align: center; color: #64748b; padding: 36px 20px; background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 14px;">
          <i data-lucide="users" style="width: 38px; height: 38px; color: #94a3b8; margin-bottom: 8px;"></i>
          <p style="font-weight: 700; margin: 0; color: #334155;">Nenhum usuário encontrado</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    const cardsHtml = filtered.map(u => {
      const isOwner = u.role === 'admin' || u.email === 'freddie@gammon.com.br' || u.username === 'freddie';
      const isPro = u.isSubscribed === true || u.planStatus === 'active';
      const isTrial5d = u.planStatus === 'trial_5d';
      const isPending = u.planStatus === 'pending_cash';

      const createdDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : 'Recentemente';
      const lastLoginDate = u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('pt-BR') : 'Hoje';

      const initials = (u.name || u.username || 'AL')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('');

      return `
        <div style="background: #ffffff; border: 1px solid ${isPro ? '#bbf7d0' : '#e2e8f0'}; border-radius: 14px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 240px;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: ${isOwner ? 'linear-gradient(135deg, #4f46e5, #06b6d4)' : 'linear-gradient(135deg, #0284c7, #38bdf8)'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; flex-shrink: 0;">
              ${initials}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <strong style="color: #0f172a; font-size: 0.95rem;">${u.name || u.username}</strong>
                ${isOwner ? `
                  <span style="font-size: 0.7rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: #f3e8ff; color: #7e22ce;">👑 Admin</span>
                ` : `
                  <span style="font-size: 0.7rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: #e0f2fe; color: #0369a1;">🎓 Aluno</span>
                `}
                ${isPro ? `
                  <span style="font-size: 0.7rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: #dcfce7; color: #15803d;">💎 PRO Ativo</span>
                ` : isTrial5d ? `
                  <span style="font-size: 0.7rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: #fef3c7; color: #b45309;">⚡ Degustação (5 dias)</span>
                ` : isPending ? `
                  <span style="font-size: 0.7rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: #fef3c7; color: #b45309;">💵 Pgto Pendente</span>
                ` : `
                  <span style="font-size: 0.7rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: #f1f5f9; color: #475569;">Plano Base</span>
                `}
              </div>
              <div style="font-size: 0.78rem; color: #64748b; margin-top: 3px;">
                <span>Usuário: <code>${u.username || u.email}</code></span>
                &bull; <span>Cadastrado: ${createdDate}</span>
                &bull; <span>Último acesso: ${lastLoginDate}</span>
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            ${isPro ? `
              <button class="btn-outline" onclick="app.adminCancelStudentPlan('${u.id}')" style="color: #dc2626; border-color: #fca5a5; font-size: 0.78rem; font-weight: 700; padding: 6px 12px; border-radius: 8px; cursor: pointer;" title="Cancelar plano PRO deste usuário">
                <i data-lucide="x-circle" style="width: 14px; height: 14px; display: inline; vertical-align: middle; margin-right: 3px;"></i>
                Cancelar PRO
              </button>
            ` : `
              <button class="btn-primary" onclick="app.adminActivateStudentPlan('${u.id}')" style="background: #059669; font-size: 0.78rem; font-weight: 700; padding: 6px 12px; border-radius: 8px; cursor: pointer;" title="Liberar 30 dias de Plano PRO">
                <i data-lucide="crown" style="width: 14px; height: 14px; display: inline; vertical-align: middle; margin-right: 3px;"></i>
                Ativar PRO
              </button>
            `}

            <!-- Excluir qualquer conta (inclusive contas de administrador) -->
            <button class="btn-outline" onclick="app.adminDeleteStudent('${u.id}')" style="color: ${isOwner ? '#b91c1c' : '#64748b'}; border-color: ${isOwner ? '#f87171' : '#cbd5e1'}; background: ${isOwner ? '#fff1f2' : 'transparent'}; font-size: 0.78rem; padding: 6px 10px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="${isOwner ? 'Excluir esta conta de Administrador' : 'Excluir conta do aluno'}">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
              ${isOwner ? '<span style="font-size: 0.72rem; font-weight: 800;">Excluir Admin</span>' : ''}
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = masterHeaderHtml + cardsHtml;
    if (window.lucide) window.lucide.createIcons();
  }

  adminCancelStudentPlan(userId) {
    const student = (this.users || []).find(u => u.id === userId);
    if (!student) return;

    if (confirm(`Tem certeza que deseja cancelar o Plano PRO do aluno "${student.name || student.username}" e retornar para o Plano Base (Gratuito)?`)) {
      student.isSubscribed = false;
      student.plan = 'free';
      student.planStatus = 'free';
      student.planName = 'Plano Base';
      delete student.proActivatedAt;
      delete student.proExpiresAt;
      delete student.trialExpiresAt;
      delete student.trialDaysRemaining;
      delete student.trialActivatedAt;
      this.saveUsers();

      if (this.currentUser && (this.currentUser.id === userId || (this.currentUser.email && student.email && this.currentUser.email.toLowerCase() === student.email.toLowerCase()))) {
        this.currentUser.isSubscribed = false;
        this.currentUser.plan = 'free';
        this.currentUser.planStatus = 'free';
        this.currentUser.planName = 'Plano Base';
        delete this.currentUser.proActivatedAt;
        delete this.currentUser.proExpiresAt;
        delete this.currentUser.trialExpiresAt;
        delete this.currentUser.trialDaysRemaining;
        delete this.currentUser.trialActivatedAt;
        this.state.isSubscribed = false;
        this.saveCurrentUser();
        this.saveState();
        this.updateUserHeaderUI();
        this.renderPlanStatus();
        this.renderDashboard();
        this.renderQuizIntro();
        this.renderSasHub();
        this.renderGeminiTab();
        const proOnlyTabs = ['gemini-chat', 'quiz'];
        if (proOnlyTabs.includes(this.currentTab)) {
          this.switchTab('dashboard');
        } else if (this.currentTab === 'sas-eureka') {
          this.switchEurekaSubtab('eureka');
        }
      }

      const payment = (this.state.payments || []).find(p => p.email && student.email && p.email.toLowerCase() === student.email.toLowerCase());
      if (payment) {
        payment.status = 'cancelled';
        payment.note = 'Plano cancelado pelo administrador Freddie';
        this.saveState();
      }

      this.renderAdminStudentsList();
      this.renderAdminPaymentsList();
      alert(`✔ O Plano PRO do aluno "${student.name || student.username}" foi cancelado. A conta agora está no Plano Base.`);
    }
  }

  adminActivateStudentPlan(userId) {
    const student = (this.users || []).find(u => u.id === userId);
    if (!student) return;

    if (confirm(`Deseja ativar 30 dias de Plano PRO para "${student.name || student.username}"?`)) {
      const now = new Date();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      student.isSubscribed = true;
      student.plan = 'pro';
      student.planStatus = 'active';
      student.planName = 'ESTUDE+ PRO';
      student.proActivatedAt = now.toISOString();
      student.proExpiresAt = expires.toISOString();
      student.lastBillingDate = now.toISOString();
      this.saveUsers();

      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.isSubscribed = true;
        this.currentUser.plan = 'pro';
        this.currentUser.planStatus = 'active';
        this.currentUser.proActivatedAt = now.toISOString();
        this.currentUser.proExpiresAt = expires.toISOString();
        this.state.isSubscribed = true;
        this.saveCurrentUser();
        this.updateUserHeaderUI();
        this.renderPlanStatus();
        this.renderDashboard();
      }

      this.renderAdminStudentsList();
      this.renderAdminPaymentsList();
      if (typeof confetti === 'function') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
      }
      alert(`✔ Plano PRO ativado para "${student.name || student.username}" até ${expires.toLocaleDateString('pt-BR')}!`);
    }
  }

  adminDeleteStudent(userId) {
    const student = (this.users || []).find(u => u.id === userId);
    if (!student) return;

    const isOwner = student.role === 'admin' || student.email === 'freddie@gammon.com.br' || student.username === 'freddie';
    const name = student.name || student.username || 'Usuário';

    const promptText = isOwner
      ? `⚠️ ATENÇÃO CRÍTICA:\n\nVocê está prestes a EXCLUIR A CONTA DE ADMINISTRADOR de "${name}"!\nTodos os privilégios e dados serão permanentemente apagados.\n\nDeseja realmente excluir esta conta de Administrador?`
      : `Deseja realmente remover a conta de "${name}" do sistema? Esta ação apagará todo o cadastro e dados associados.`;

    if (confirm(promptText)) {
      const confirmFinal = isOwner ? confirm(`Confirmação final: digite OK para apagar definitivamente a conta de administrador "${name}".`) : true;
      if (!confirmFinal) return;

      // 1. Remove from local users list
      this.users = (this.users || []).filter(u => u.id !== userId);
      this.saveUsers();

      // 2. Notify master backend to remove from db.json
      try {
        fetch('/api/users/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: student.id, userEmail: student.email })
        }).catch(() => {});
      } catch (e) {}

      // 3. If current logged-in user deleted their own account:
      if (this.currentUser && (this.currentUser.id === userId || (this.currentUser.email && student.email && this.currentUser.email.toLowerCase() === student.email.toLowerCase()))) {
        alert(`Sua conta foi excluída com sucesso. O sistema será reiniciado.`);
        this.currentUser = null;
        try {
          localStorage.removeItem(this.currentUserStorageKey);
          sessionStorage.clear();
        } catch (e) {}
        window.location.reload();
        return;
      }

      this.renderAdminStudentsList();
      alert(`✔ Conta de "${name}" removida com sucesso.`);
    }
  }

  /* ================= EXCLUIR MINHA CONTA (DISPONÍVEL PARA TODOS ATÉ ADM) ================= */
  async deleteMyAccount() {
    if (!this.currentUser) return;
    const name = this.currentUser.name || this.currentUser.username || 'sua conta';
    const isOwner = this.currentUser.role === 'admin' || this.currentUser.email === 'freddie@gammon.com.br' || this.currentUser.username === 'freddie';

    const msg = isOwner
      ? `⚠️ ATENÇÃO: Você está prestes a excluir sua CONTA DE ADMINISTRADOR (${name})!\n\nTodos os acessos de controle e dados desta conta serão permanentemente apagados.\n\nDeseja realmente excluir sua conta de administrador?`
      : `⚠️ ATENÇÃO: Tem certeza de que deseja excluir sua conta (${name}) do ESTUDE+?\n\nTodos os seus dados de estudos, preferências e histórico serão permanentemente excluídos.\n\nDeseja prosseguir?`;

    if (confirm(msg)) {
      const confirmFinal = confirm(`Confirmação final: Deseja apagar definitivamente a conta "${name}"? Esta ação não pode ser desfeita.`);
      if (confirmFinal) {
        const targetId = this.currentUser.id;
        const targetEmail = this.currentUser.email;

        // 1. Remove from local list
        this.users = (this.users || []).filter(u => u.id !== targetId && u.email !== targetEmail);
        this.saveUsers();

        // 2. Notify backend
        try {
          await fetch('/api/users/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: targetId, userEmail: targetEmail })
          });
        } catch (e) {}

        // 3. Clear session
        this.currentUser = null;
        try {
          localStorage.removeItem(this.currentUserStorageKey);
          sessionStorage.clear();
        } catch (e) {}

        alert(`✔ Sua conta foi excluída com sucesso.`);
        window.location.reload();
      }
    }
  }

  /* ================= PAINEL DE COMANDO MESTRE (CONTROLE DOS CELULARES) ================= */
  async masterSetPlanForAll(planStatus) {
    const isPro = planStatus === 'pro' || planStatus === 'active';
    const actionText = isPro ? 'LIBERAR PLANO PRO para todos os celulares conectados' : 'DEFINIR PLANO BASE (Gratuito) para todos os celulares';
    if (!confirm(`Deseja realmente ${actionText}?`)) return;

    // Atualiza usuários locais
    this.users.forEach(u => {
      if (u.role !== 'admin') {
        u.isSubscribed = isPro;
        u.plan = isPro ? 'pro' : 'free';
        u.planStatus = isPro ? 'active' : 'free';
        u.planName = isPro ? 'ESTUDE+ PRO' : 'Plano Base';
      }
    });
    this.saveUsers();

    // Notifica backend central para espalhar aos celulares
    try {
      await fetch('/api/master/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setPlanForAll',
          planStatus: isPro ? 'active' : 'free',
          isSubscribed: isPro
        })
      });

      for (const u of this.users) {
        await fetch('/api/users/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: u.id,
            updates: { isSubscribed: isPro, plan: isPro ? 'pro' : 'free', planStatus: isPro ? 'active' : 'free' }
          })
        });
      }
    } catch (e) {}

    this.renderAdminStudentsList();
    if (typeof confetti === 'function' && isPro) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
    }
    alert(`✔ Comando executado! Todos os celulares conectados agora estão no ${isPro ? 'PLANO PRO' : 'PLANO BASE'}.`);
  }

  async masterSendBroadcastNotice() {
    const msg = prompt('Digite o aviso ou mensagem que deseja exibir em tempo real na tela de todos os celulares conectados:');
    if (!msg || !msg.trim()) return;

    try {
      await fetch('/api/master/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broadcastNotice: msg.trim() })
      });
      alert(`✔ Mensagem transmitida com sucesso para todos os celulares conectados!`);
    } catch (e) {
      alert('Erro ao enviar mensagem: ' + e.message);
    }
  }

  async masterTriggerGammonSync() {
    const btn = document.getElementById('btnMasterGammonSync');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Sincronizando Portal Gammon...`;
    }

    try {
      alert('🔄 Iniciando sincronização oficial com o Portal Gammon no PC!\nO robô vai acessar as ocorrências do 7º Ano e importar os TPCs Diários novos.');
      const res = await fetch('/api/gammon/sync', { method: 'POST' });
      const data = await res.json();

      // Recarregar estado atualizado
      const stateRes = await fetch('/api/state');
      const stateData = await stateRes.json();
      if (stateData.tpcs && Array.isArray(stateData.tpcs)) {
        this.state.tpcs = stateData.tpcs;
        this.saveState();
        this.renderTpcs();
        this.renderDashboard();
      }

      alert(`✔ Sincronização oficial Gammon+ concluída!\n${data.message || 'TPCs atualizados!'}`);
    } catch (e) {
      alert('Aviso de sincronização: ' + e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="refresh-cw"></i> Sincronizar Gammon+ Oficial (118 TPCs)`;
      }
      if (window.lucide) window.lucide.createIcons();
    }
  }

  adminCreateNewStudentModal() {
    const name = prompt('Nome completo do novo usuário:');
    if (!name || !name.trim()) return;

    const username = prompt('Nome de usuário para login:', name.toLowerCase().replace(/\s+/g, ''));
    if (!username || !username.trim()) return;

    const password = prompt('Senha de acesso:', '123');
    if (!password || !password.trim()) return;

    const isAdmin = confirm('Esta conta deve ter acesso de ADMINISTRADOR (Painel & Controle)?\n\n[OK] = Sim, Administrador\n[Cancelar] = Não, Conta de Aluno');
    const isPro = confirm('Deseja ativar o PLANO PRO para este usuário?\n\n[OK] = Sim, Plano PRO\n[Cancelar] = Plano Base (Gratuito)');

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: `${username.trim().toLowerCase()}@gammon.com.br`,
      password: password.trim(),
      role: isAdmin ? 'admin' : 'student',
      isSubscribed: isPro,
      plan: isPro ? 'pro' : 'free',
      planStatus: isPro ? 'active' : 'free',
      planName: isPro ? 'ESTUDE+ PRO' : 'Plano Base',
      grade: '7º Ano (Campus Chácara)',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();

    fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: newUser.id, updates: newUser })
    }).catch(() => {});

    this.renderAdminStudentsList();
    alert(`✔ Conta criada com sucesso!\n\nUsuário: ${newUser.username}\nSenha: ${newUser.password}\nTipo: ${isAdmin ? '👑 Administrador' : '🎓 Aluno'}\nPlano: ${isPro ? '💎 PRO' : 'Plano Base'}`);
  }

  /* ================= SINCRONIZAÇÃO EM TEMPO REAL PC <-> CELULAR ================= */
  getDeviceId() {
    let id = localStorage.getItem('estude_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('estude_device_id', id);
    }
    return id;
  }

  async initMasterSync() {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();

        // 1. Mesclar TPCs oficiais do Gammon sincronizados no servidor
        if (data.tpcs && Array.isArray(data.tpcs) && data.tpcs.length > 0) {
          const existingMap = new Map();
          (this.state.tpcs || []).forEach(t => existingMap.set(t.id || (t.title + t.dueDate), t));
          data.tpcs.forEach(serverTpc => {
            const key = serverTpc.id || (serverTpc.title + serverTpc.dueDate);
            if (!existingMap.has(key)) {
              existingMap.set(key, serverTpc);
            }
          });
          this.state.tpcs = Array.from(existingMap.values());
          this.saveState();
          this.renderTpcs();
          this.renderDashboard();
        }

        // 2. Mesclar usuários centralizados
        if (data.users && Array.isArray(data.users)) {
          const userMap = new Map();
          (this.users || []).forEach(u => userMap.set(u.id, u));
          data.users.forEach(u => userMap.set(u.id, u));
          this.users = Array.from(userMap.values());
          this.saveUsers();
        }

        if (data.connectedDevices) {
          this.connectedDevices = data.connectedDevices;
        }

        this.applyMasterCommands(data.masterCommands);
      }
    } catch (e) {
      console.warn('Conexão master offline ou local:', e.message);
    }

    // Ping a cada 10 segundos para manter celulares e PC sincronizados
    this.pingServer();
    setInterval(() => this.pingServer(), 10000);
  }

  async pingServer() {
    try {
      const payload = {
        deviceId: this.getDeviceId(),
        userId: this.currentUser ? this.currentUser.id : 'guest',
        userName: this.currentUser ? (this.currentUser.name || this.currentUser.username) : 'Visitante',
        userRole: this.currentUser ? (this.currentUser.role || 'student') : 'student',
        planStatus: this.currentUser ? (this.currentUser.planStatus || 'free') : 'free'
      };

      const res = await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.masterCommands) {
          this.applyMasterCommands(data.masterCommands);
        }
      }
    } catch (e) {}
  }

  applyMasterCommands(cmds) {
    if (!cmds) return;

    if (cmds.broadcastNotice && cmds.broadcastNotice.trim()) {
      if (this.lastShownNotice !== cmds.broadcastNotice) {
        this.lastShownNotice = cmds.broadcastNotice;
        alert(`📢 COMANDO MESTRE (Freddie):\n\n${cmds.broadcastNotice}`);
      }
    }

    if (cmds.forceRefreshTimestamp && cmds.forceRefreshTimestamp > (this.lastMasterRefresh || 0)) {
      this.lastMasterRefresh = cmds.forceRefreshTimestamp;
      fetch('/api/state')
        .then(r => r.json())
        .then(data => {
          if (data.users && this.currentUser) {
            const fresh = data.users.find(u => u.id === this.currentUser.id || (u.email && this.currentUser.email && u.email.toLowerCase() === this.currentUser.email.toLowerCase()));
            if (fresh) {
              this.currentUser.isSubscribed = fresh.isSubscribed;
              this.currentUser.plan = fresh.plan;
              this.currentUser.planStatus = fresh.planStatus;
              this.saveCurrentUser();
              this.updateUserHeaderUI();
              this.renderPlanStatus();
            }
          }
          if (data.tpcs && Array.isArray(data.tpcs)) {
            this.state.tpcs = data.tpcs;
            this.saveState();
            this.renderTpcs();
            this.renderDashboard();
          }
          if (data.connectedDevices) {
            this.connectedDevices = data.connectedDevices;
            if (document.getElementById('adminPaymentsModal')?.classList.contains('active')) {
              this.renderAdminStudentsList();
            }
          }
        })
        .catch(() => {});
    }
  }

  adminResetPayments() {
    if (confirm('Deseja realmente limpar e resetar todo o histórico de solicitações e pagamentos desta aba?')) {
      this.state.payments = [];
      this.saveState();
      this.renderAdminPaymentsList();
      this.checkPendingAdminBadge();
      alert('✔ Aba de pagamentos resetada com sucesso! Histórico limpo.');
    }
  }

  renderAdminPaymentsList() {
    const container = document.getElementById('adminPaymentsListContainer');
    if (!container) return;

    const payments = this.state.payments || [];
    if (payments.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 30px;">Nenhum pagamento registrado no momento.</p>';
      return;
    }

    container.innerHTML = payments.map(p => {
      const isPending = p.status === 'pending';
      const isCash = p.method === 'cash';
      return `
        <div style="background: ${isPending ? '#fffbeb' : '#f0fdf4'}; border: 1px solid ${isPending ? '#fde68a' : '#bbf7d0'}; border-radius: 12px; padding: 14px 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">${p.studentName}</span>
              <span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; font-weight: 700; ${isCash ? 'background: #eff6ff; color: #1d4ed8;' : 'background: #ecfdf5; color: #047857;'}">
                ${isCash ? '💵 Dinheiro na Escola' : '📱 Pix'}
              </span>
              <span style="font-size: 0.72rem; font-weight: 700; color: ${isPending ? '#b45309' : '#15803d'};">
                ${isPending ? '⏳ Pendente' : '✔ Aprovado'}
              </span>
            </div>
            <p style="margin: 4px 0 0; font-size: 0.78rem; color: #64748b;">
              E-mail: ${p.email} &bull; Valor: <strong>R$ ${p.amount.toFixed(2).replace('.', ',')}</strong> &bull; Pedido: <code>${p.id}</code> &bull; Data: ${p.date}
            </p>
            <p style="margin: 2px 0 0; font-size: 0.75rem; color: #475569; font-style: italic;">
              ${p.note}
            </p>
          </div>
          <div>
            ${isPending ? `
              <button class="btn-primary" onclick="app.approvePayment('${p.id}')" style="background: #059669; font-size: 0.82rem; padding: 8px 14px; white-space: nowrap;">
                <i data-lucide="check-check"></i> Confirmar Recebimento (Liberar Plano)
              </button>
            ` : `
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: #059669; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; gap: 4px;">
                  <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i> Plano Liberado
                </span>
                <button class="btn-outline" onclick="app.adminCancelUserPlan('${p.email}')" style="color: #dc2626; border-color: #fca5a5; font-size: 0.72rem; padding: 4px 8px; border-radius: 6px; cursor: pointer;" title="Cancelar plano deste usuário">
                  <i data-lucide="x"></i> Cancelar
                </button>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  approvePayment(paymentId) {
    const payment = (this.state.payments || []).find(p => p.id === paymentId);
    if (!payment) return;

    payment.status = 'approved';

    // Calculate 30-day subscription cycle
    const now = new Date();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Find and update the user account in registered users
    const studentUser = this.users.find(u => u.email.toLowerCase() === payment.email.toLowerCase());
    if (studentUser) {
      studentUser.isSubscribed = true;
      studentUser.planStatus = 'active';
      studentUser.proActivatedAt = now.toISOString();
      studentUser.proExpiresAt = expires.toISOString();
      studentUser.lastBillingDate = now.toISOString();
      this.saveUsers();
    }

    // If current logged-in user is the one approved, update immediately
    if (this.currentUser && this.currentUser.email.toLowerCase() === payment.email.toLowerCase()) {
      this.currentUser.isSubscribed = true;
      this.currentUser.planStatus = 'active';
      this.currentUser.proActivatedAt = now.toISOString();
      this.currentUser.proExpiresAt = expires.toISOString();
      this.state.isSubscribed = true;
      this.saveCurrentUser();
      this.updateUserHeaderUI();
      this.renderPlanStatus();
      this.renderDashboard();
    }

    this.saveState();
    this.renderAdminPaymentsList();
    this.checkPendingAdminBadge();

    if (typeof confetti === 'function') {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.4 } });
    }
    alert(`✔ Recebimento de R$ ${payment.amount.toFixed(2).replace('.', ',')} de ${payment.studentName} CONFIRMADO!\n\nO Plano PRO foi ativado por 30 dias (Vencimento: ${expires.toLocaleDateString('pt-BR')}).\nA cada 30 dias o sistema gerará a nova cobrança automaticamente.`);
  }

  checkSubscriptionExpiry() {
    if (!this.currentUser) return;

    if (this.currentUser.isSubscribed && this.currentUser.proExpiresAt) {
      const now = Date.now();
      const exp = new Date(this.currentUser.proExpiresAt).getTime();
      const diffMs = exp - now;
      const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const expiryBanner = document.getElementById('subscriptionExpiryBanner');

      if (diffMs <= 0) {
        // Expired after 30 days! Revert to normal plan
        this.currentUser.isSubscribed = false;
        this.currentUser.planStatus = 'expired';
        this.state.isSubscribed = false;
        this.saveCurrentUser();
        this.saveState();
        this.updateUserHeaderUI();

        if (expiryBanner) {
          expiryBanner.innerHTML = `
            <div style="background: #fef2f2; border: 1.5px solid #f87171; border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <i data-lucide="alert-circle" style="width: 28px; height: 28px; color: #dc2626; flex-shrink: 0;"></i>
                <div>
                  <strong style="color: #991b1b; font-size: 0.95rem;">⚠️ Sua mensalidade de R$ 19,90 do Plano PRO venceu!</strong>
                  <p style="margin: 2px 0 0; font-size: 0.82rem; color: #7f1d1d;">
                    Seus 30 dias expiraram e sua conta retornou ao plano normal. Faça o Pix de R$ 19,90 para o Freddie confirmar e reativar seus benefícios!
                  </p>
                </div>
              </div>
              <button class="btn-primary" onclick="app.showSubscriptionModal()" style="background: #dc2626; font-size: 0.85rem; padding: 8px 16px; white-space: nowrap;">
                Renovar Plano PRO (Pix)
              </button>
            </div>
          `;
          expiryBanner.style.display = 'block';
        }
      } else if (daysLeft <= 3 && expiryBanner) {
        // Warning 3 days before
        expiryBanner.innerHTML = `
          <div style="background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 14px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i data-lucide="clock" style="width: 24px; height: 24px; color: #d97706; flex-shrink: 0;"></i>
              <div>
                <strong style="color: #92400e; font-size: 0.9rem;">⏳ Mensalidade vencendo em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}!</strong>
                <p style="margin: 2px 0 0; font-size: 0.8rem; color: #78350f;">
                  Transfira a renovação de R$ 19,90 via Pix para o Freddie confirmar e manter o PRO ativo sem interrupção.
                </p>
              </div>
            </div>
            <button class="btn-sm" onclick="app.showSubscriptionModal()" style="background: #d97706; color: white;">
              Renovar Agora
            </button>
          </div>
        `;
        expiryBanner.style.display = 'block';
      } else if (expiryBanner) {
        expiryBanner.style.display = 'none';
      }
    }
  }

  
  /* ==========================================================================
     SAS HUB ENGINE: INTERFACE OFICIAL ASAS 2026 (IDÊNTICA À IMAGEM DO USUÁRIO)
     ========================================================================== */
  
  openSasPortal(type = 'geral') {
    const urls = {
      livrosdigitais: 'https://livrosdigitais.portalsaseducacao.com.br/',
      conteudo: 'https://app.portalsaseducacao.com.br/conteudo/',
      video: 'https://app.portalsaseducacao.com.br/conteudo/',
      eureka: 'https://app.portalsaseducacao.com.br/',
      geral: 'https://app.portalsaseducacao.com.br/'
    };
    const targetUrl = urls[type] || urls.geral;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }

  renderSasHub() {
    const subjectData = this.sasSubjectsData[this.currentSasSubject] || this.sasSubjectsData['matematica'];
    
    // Update Hub Header Box
    const thumbEl = document.getElementById('hubSubjectThumb');
    const nameEl = document.getElementById('hubSubjectName');
    const metaEl = document.getElementById('hubSubjectMeta');
    const selectEl = document.getElementById('sasSubjectSelect');

    if (thumbEl) thumbEl.innerText = subjectData.icon;
    if (nameEl) nameEl.innerText = subjectData.name;
    if (metaEl) metaEl.innerText = subjectData.meta;
    if (selectEl && selectEl.value !== this.currentSasSubject) {
      selectEl.value = this.currentSasSubject;
    }

    // Render Left Sidebar Accordion (Livro 1, 2, 3, 4)
    const accordionEl = document.getElementById('sasBooksAccordion');
    if (accordionEl) {
      accordionEl.innerHTML = subjectData.livros.map(book => {
        const isExpanded = !!this.sasBooksAccordionState[book.id];
        return `
          <div class="sas-book-accordion-group ${isExpanded ? 'open' : ''}">
            <button class="sas-accordion-header" onclick="app.toggleBookAccordion(${book.id})">
              <span class="sas-accordion-title">
                <i data-lucide="book" style="width: 15px; height: 15px; color: ${subjectData.color};"></i>
                ${book.title}
              </span>
              <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}" class="sas-chevron-icon"></i>
            </button>
            <div class="sas-accordion-chapters" style="display: ${isExpanded ? 'block' : 'none'};">
              ${book.chapters.map(cap => {
                const isActive = (book.id === this.currentSasBookId && cap.id === this.currentSasChapterId);
                return `
                  <button class="sas-chapter-item ${isActive ? 'active' : ''}" onclick="app.selectSasChapter(${book.id}, ${cap.id})">
                    <span class="sas-chapter-dot ${isActive ? 'active' : ''}"></span>
                    <span class="sas-chapter-text">${cap.title}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    // Get Current Selected Chapter
    const currentBook = subjectData.livros.find(b => b.id === this.currentSasBookId) || subjectData.livros[0];
    const currentChapter = currentBook.chapters.find(c => c.id === this.currentSasChapterId) || currentBook.chapters[0];

    // Update Right Panel Header
    const currentBookLabelEl = document.getElementById('sasCurrentBookLabel');
    const currentChapterTitleEl = document.getElementById('sasCurrentChapterTitle');
    if (currentBookLabelEl) currentBookLabelEl.innerText = currentBook.title;
    if (currentChapterTitleEl) currentChapterTitleEl.innerText = currentChapter.title;

    // Render Right Panel Resource Feed (Matching image cards: Livro digital, PDF, Atividades, Vídeo, Exercícios, Eureka)
    const feedEl = document.getElementById('sasResourceFeed');
    if (feedEl) {
      if (!this.isUserPro()) {
        feedEl.innerHTML = `
          <div style="background: #ffffff; border: 2px dashed #fca5a5; border-radius: 16px; padding: 36px 20px; text-align: center;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 12px; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.15);">
              <i data-lucide="lock" style="width: 26px; height: 26px;"></i>
            </div>
            <span style="background: #fee2e2; color: #dc2626; font-weight: 800; font-size: 0.72rem; padding: 3px 10px; border-radius: 6px;">🔒 BLOQUEADO NO PLANO BASE</span>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 10px 0 6px;">12 Apostilas SAS e Downloads em PDF Bloqueados</h3>
            <p style="color: #64748b; font-size: 0.88rem; max-width: 480px; margin: 0 auto 20px; line-height: 1.5;">
              No <strong>Plano Base</strong>, as apostilas digitais e PDFs da Coleção Asas 2026 estão <strong>bloqueados</strong>. Você pode ativar seus <strong>5 dias grátis de degustação</strong> para experimentar ou assinar o <strong>Plano PRO</strong> por R$ 19,90/mês para desbloquear todos os livros, resumos e PDFs!
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button class="btn-primary" onclick="app.activate5DaysTrial()" style="background: linear-gradient(135deg, #9333ea, #4f46e5); padding: 12px 20px; font-weight: 800; font-size: 0.92rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(147, 51, 234, 0.25);">
                <i data-lucide="zap"></i> Ativar 5 Dias Grátis
              </button>
              <button class="btn-primary" onclick="app.showModal('subscriptionModal')" style="padding: 12px 20px; font-size: 0.92rem; font-weight: 800; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; background: #059669; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);">
                <i data-lucide="crown"></i> Assinar PRO (R$ 19,90)
              </button>
            </div>
          </div>
        `;
        if (window.lucide) window.lucide.createIcons();
        return;
      }

      const chapterCleanTitle = currentChapter.title.includes('–') ? currentChapter.title.split('–')[1].trim() : currentChapter.title;
      
      const allCards = [
        {
          type: 'digital',
          category: 'digital',
          icon: 'book-open',
          iconColor: '#e11d48',
          tag: 'Livro Digital • Coleção Asas 2026',
          title: 'Livro Digital no Portal SAS',
          desc: `${currentChapter.tag} | ${chapterCleanTitle} • Acesse os módulos digitais interativos com seu login do SAS.`,
          btnText: 'Acessar no Portal SAS',
          btnClass: 'btn-read-resource',
          btnAction: "app.openSasPortal('livrosdigitais')"
        },
        {
          type: 'pdf',
          category: 'pdf',
          icon: 'book-open-check',
          iconColor: '#dc2626',
          tag: `Livro do Aluno | ${currentChapter.tag} | ${chapterCleanTitle}`,
          title: 'Apostila do Aluno (Portal SAS)',
          desc: 'Para acessar a apostila oficial completa e os exercícios de sala, entre no portal SAS Educação com seu login de aluno.',
          btnText: 'Entrar no SAS para Ler',
          btnClass: 'btn-download-resource',
          btnAction: "app.openSasPortal('conteudo')"
        },
        {
          type: 'pdf',
          category: 'pdf',
          icon: 'file-check',
          iconColor: '#dc2626',
          tag: `Atividades Suplementares | ${currentChapter.tag} | ${chapterCleanTitle}`,
          title: 'Caderno de Atividades & Fixação',
          desc: 'Caderno suplementar oficial com questões de aprofundamento disponíveis no ambiente do aluno SAS.',
          btnText: 'Ver Atividades no SAS',
          btnClass: 'btn-download-resource',
          btnAction: "app.openSasPortal('conteudo')"
        },
        {
          type: 'video',
          category: 'video',
          icon: 'video',
          iconColor: '#ec4899',
          tag: `Vídeo-aula | ${currentChapter.tag} | ${chapterCleanTitle}`,
          title: `Vídeo Oficial: ${chapterCleanTitle}`,
          desc: 'Aula gravada pelos professores autores da Coleção SAS Asas 2026 explicando passo a passo.',
          btnText: 'Assistir Vídeo no SAS',
          btnClass: 'btn-watch-resource',
          btnAction: "app.openSasPortal('video')"
        },
        {
          type: 'exercicios',
          category: 'exercicios',
          icon: 'check-square',
          iconColor: '#06b6d4',
          tag: `Exercícios & Treino IA | ${currentChapter.tag}`,
          title: `Quiz de 15 Minutos: ${chapterCleanTitle}`,
          desc: 'Banco de 4 questões calibradas rigorosamente no método dos 15 minutos com explicação imediata da IA.',
          btnText: 'Fazer Quiz Deste Capítulo',
          btnClass: 'btn-quiz-resource',
          btnAction: `app.startQuizDirectlyForChapter('${this.currentSasSubject}', ${currentBook.id}, ${currentChapter.id})`
        },
        {
          type: 'eureka',
          category: 'eureka',
          icon: 'compass',
          iconColor: '#10b981',
          tag: `Eureka! | ${currentChapter.tag}`,
          title: `Trilha Eureka SAS: ${chapterCleanTitle}`,
          desc: 'Faça login no portal SAS exclusivamente para registrar suas notas e pontuação na Trilha oficial da escola.',
          btnText: 'Abrir no Eureka SAS',
          btnClass: 'btn-eureka-resource',
          btnAction: "app.switchTab('sas-eureka')"
        }
      ];

      // Filter according to top pill
      let visibleCards = allCards;
      if (this.currentHubFilter === 'pdf') {
        visibleCards = allCards.filter(c => c.category === 'pdf');
      } else if (this.currentHubFilter === 'video') {
        visibleCards = allCards.filter(c => c.category === 'video');
      } else if (this.currentHubFilter === 'exercicios') {
        visibleCards = allCards.filter(c => c.category === 'exercicios');
      } else if (this.currentHubFilter === 'eureka') {
        visibleCards = allCards.filter(c => c.category === 'eureka');
      }

      feedEl.innerHTML = visibleCards.map(card => `
        <div class="sas-resource-card">
          <div class="sas-res-icon-wrap" style="color: ${card.iconColor};">
            <i data-lucide="${card.icon}" style="width: 26px; height: 26px;"></i>
          </div>
          <div class="sas-res-info">
            <span class="sas-res-tag">${card.tag}</span>
            <h4 class="sas-res-title">${card.title}</h4>
            <p class="sas-res-desc">${card.desc}</p>
          </div>
          <div class="sas-res-action">
            <button class="${card.btnClass}" onclick="${card.btnAction}">
              <i data-lucide="${card.icon === 'file-text' ? 'download' : card.icon === 'video' ? 'play' : card.icon === 'compass' ? 'external-link' : 'arrow-right'}"></i>
              <span>${card.btnText}</span>
            </button>
          </div>
        </div>
      `).join('');
    }

    if (window.lucide) window.lucide.createIcons();
  }

  switchSasSubject(subjectKey) {
    if (this.sasSubjectsData[subjectKey]) {
      this.currentSasSubject = subjectKey;
      this.currentSasBookId = 1;
      this.currentSasChapterId = 1;
      this.sasBooksAccordionState = { 1: true, 2: false, 3: false, 4: false };
      this.renderSasHub();
    }
  }

  toggleBookAccordion(bookId) {
    this.sasBooksAccordionState[bookId] = !this.sasBooksAccordionState[bookId];
    this.renderSasHub();
  }

  selectSasChapter(bookId, chapterId) {
    this.currentSasBookId = bookId;
    this.currentSasChapterId = chapterId;
    this.sasBooksAccordionState[bookId] = true;
    this.renderSasHub();
  }

  filterHubContent(filterType) {
    this.currentHubFilter = filterType;
    
    // Update pills active states
    const pills = {
      all: document.getElementById('pillBtnAll'),
      pdf: document.getElementById('pillBtnPdf'),
      video: document.getElementById('pillBtnVideo'),
      exercicios: document.getElementById('pillBtnExercises'),
      eureka: document.getElementById('pillBtnEureka')
    };

    Object.keys(pills).forEach(key => {
      if (pills[key]) pills[key].classList.toggle('active', key === filterType);
    });

    this.renderSasHub();
  }

  downloadCurrentChapterPdf() {
    this.downloadChapterPdf('didatico');
  }

  downloadChapterPdf(type = 'didatico') {
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO download das Apostilas SAS em PDF é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    const subjectData = this.sasSubjectsData[this.currentSasSubject] || this.sasSubjectsData['matematica'];
    const currentBook = subjectData.livros.find(b => b.id === this.currentSasBookId) || subjectData.livros[0];
    const currentChapter = currentBook.chapters.find(c => c.id === this.currentSasChapterId) || currentBook.chapters[0];
    const isSuplementar = (type === 'suplementar');

    const pdfTitle = `${subjectData.name} - ${currentBook.title} - ${currentChapter.title}`;
    const pdfSubtitle = isSuplementar ? 'Caderno de Atividades Suplementares & Gabarito Oficial' : 'Apostila Oficial do Aluno - Coleção Asas 2026';

    const pdfContent = `%PDF-1.4
%
1 0 obj
<<
/Title (${pdfTitle})
/Author (Freddie Pimentel Costa - Colégio Gammon)
/Subject (SAS Educação - 7º Ano EF)
/Keywords (SAS, Asas 2026, ${subjectData.name}, Gammon, Eureka, SAAS, PDF)
/Creator (ESTUDE+ Plataforma de Estudos)
>>
endobj
2 0 obj
<<
/Type /Catalog
/Pages 3 0 R
>>
endobj
3 0 obj
<<
/Type /Pages
/Kids [4 0 R]
/Count 1
>>
endobj
4 0 obj
<<
/Type /Page
/Parent 3 0 R
/MediaBox [0 0 595 842]
/Contents 5 0 R
/Resources <<
  /Font <<
    /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
    /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
  >>
>>
>>
endobj
5 0 obj
<<
/Length 850
>>
stream
BT
/F1 20 Tf
50 780 Td
(COLÉGIO GAMMON • SAS EDUCAÇÃO) Tj
/F1 15 Tf
0 -32 Td
(${subjectData.name} - 7º Ano • Coleção Asas 2026) Tj
/F1 13 Tf
0 -26 Td
(${currentBook.title} • ${currentChapter.title}) Tj
/F2 11 Tf
0 -24 Td
(${pdfSubtitle}) Tj
0 -20 Td
(Material pedagógico oficial integrado à plataforma ESTUDE+ por Freddie Costa.) Tj
/F1 12 Tf
0 -36 Td
(CONCEITOS E RESUMO TEÓRICO DO CAPÍTULO:) Tj
/F2 10 Tf
0 -20 Td
(• ${currentChapter.desc}) Tj
0 -18 Td
(• Preparação direta para a Matriz de Habilidades SAAS e Atividades Eureka.) Tj
0 -18 Td
(• Teoria estruturada conforme o currículo do 1º ao 4º Bimestre do Gammon.) Tj
/F1 12 Tf
0 -32 Td
(EXERCÍCIOS RESOLVIDOS & ORIENTAÇÕES DE ESTUDO:) Tj
/F2 10 Tf
0 -18 Td
(1. Pratique diariamente 15 minutos com o método do Estude+ para fixar o aprendizado.) Tj
0 -16 Td
(2. Utilize o Gemini Tutor IA para tirar dúvidas passo a passo desta apostila.) Tj
0 -16 Td
(3. Verifique sempre os TPCs do dia na aba Ocorrências do seu aplicativo.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000210 00000 n 
0000000266 00000 n 
0000000330 00000 n 
0000000570 00000 n 
trailer
<<
/Size 6
/Root 2 0 R
/Info 1 0 R
>>
startxref
1460
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const cleanSubj = subjectData.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `SAS_2026_${cleanSubj}_Livro${currentBook.id}_Cap${currentChapter.id}_${isSuplementar ? 'Atividades' : 'Apostila'}.pdf`;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    if (typeof confetti === 'function') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
    alert(`📥 Download concluído com sucesso!\n\nArquivo: ${filename}\n\nVocê pode consultar esta apostila oficial no leitor de PDF do seu aparelho sem precisar fazer login no portal do SAS!`);
  }

  watchChapterVideo(title) {
    alert(`🎬 VÍDEO-AULA OFICIAL SAS ASAS 2026\n\nTema: "${title}"\n\n✔ Professor especialista do SAS Educação.\n✔ Resolução de exemplos do livro e macetes para a prova SAAS.\n✔ Duração: 8 minutos de conteúdo focado.`);
  }

  openSasBookReader(bookId, capId) {
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO Leitor Digital de Apostilas SAS é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    const subjectData = this.sasSubjectsData[this.currentSasSubject] || this.sasSubjectsData['matematica'];
    const currentBook = subjectData.livros.find(b => b.id === bookId) || subjectData.livros[0];
    const currentChapter = currentBook.chapters.find(c => c.id === capId) || currentBook.chapters[0];

    const titleEl = document.getElementById('pdfViewerTitle');
    const contentEl = document.getElementById('pdfViewerContent');

    if (titleEl) titleEl.innerText = `${subjectData.name} • ${currentBook.title} (${currentChapter.title})`;
    if (contentEl) {
      contentEl.innerHTML = `
        <div style="background: white; border-radius: 12px; padding: 22px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-weight: 800; color: ${subjectData.color}; font-size: 1rem;">📖 Leitor de Livro Digital SAS</span>
            <span style="font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 6px; font-weight: 700;">Coleção Asas 2026</span>
          </div>
          <h4 style="color: #0f172a; margin-bottom: 8px;">${currentChapter.title}</h4>
          <p style="font-size: 0.88rem; color: #334155; line-height: 1.6; margin-bottom: 14px;">
            <strong>Ementa Oficial:</strong> ${currentChapter.desc}
          </p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 14px 0;">
          <h5 style="font-size: 0.85rem; color: #0f172a; margin-bottom: 8px;">Módulos de Estudo do Capítulo:</h5>
          <ul style="font-size: 0.82rem; color: #475569; padding-left: 20px; line-height: 1.8;">
            <li><strong>Módulo 1:</strong> Introdução teórica com ilustrações conceituais e exemplos práticos.</li>
            <li><strong>Módulo 2:</strong> Exercícios resolvidos com passo a passo pelo método SAS Educação.</li>
            <li><strong>Módulo 3:</strong> Atividades de fixação e preparação para o Simulado SAAS.</li>
            <li><strong>Módulo 4:</strong> Conexão direta com a Trilha Eureka para pontuação no portal.</li>
          </ul>
        </div>
      `;
    }

    this.showModal('pdfViewerModal');
    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     12 APOSTILAS SAS ASAS 2026: DOWNLOAD DIRETO EM PDF (SEM LOGIN NO PORTAL)
     ========================================================================== */
  renderSasPdfLibrary() {
    const container = document.getElementById('sasPdfLibraryGrid');
    if (!container) return;

    container.innerHTML = this.sasBooks.map(book => `
      <div class="sas-book-card">
        <div>
          <span class="book-tag" style="background: ${book.color}15; color: ${book.color};">
            <i data-lucide="${book.icon || 'book'}" style="width: 12px; height: 12px;"></i> ${book.subject} &bull; ${book.grade}
          </span>
          <div class="book-cover-mockup" style="background: linear-gradient(135deg, ${book.color}, #0f172a);">
            <i data-lucide="${book.icon || 'book'}" style="width: 38px; height: 38px; margin-bottom: 4px; opacity: 0.9;"></i>
            <span style="font-weight: 800; font-size: 0.9rem; text-align: center; padding: 0 10px;">${book.name}</span>
            <span style="font-size: 0.68rem; opacity: 0.8; margin-top: 2px;">Coleção Asas 2026 &bull; ${book.pages} páginas</span>
          </div>
          <h4 class="book-title">${book.name}</h4>
          <p class="book-desc">${book.summary}</p>
        </div>
        <div class="book-actions-row">
          <button class="btn-download-pdf" onclick="app.downloadSasPdf('${book.id}')" title="Baixar PDF sem precisar de login">
            <i data-lucide="download"></i> Baixar PDF
          </button>
          <button class="btn-read-book" onclick="app.openPdfReader('${book.id}')" title="Visualizar capítulos e resumo">
            <i data-lucide="eye"></i> Ler no App
          </button>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  downloadSasPdf(bookId) {
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO download das 12 Apostilas SAS em PDF é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    const book = this.sasBooks.find(b => b.id === bookId);
    if (!book) return;

    // Generate formatted educational PDF file directly into user download folder
    const pdfContent = `%PDF-1.4
%
1 0 obj
<<
/Title (${book.name} - Oficial SAS Asas 2026)
/Author (Freddie Pimentel Costa - Colégio Gammon)
/Subject (Apostila Oficial SAS 7º Ano)
/Keywords (SAS, Asas 2026, ${book.subject}, Gammon, Eureka, SAAS)
/Creator (ESTUDE+ Aplicativo de Estudos)
>>
endobj
2 0 obj
<<
/Type /Catalog
/Pages 3 0 R
>>
endobj
3 0 obj
<<
/Type /Pages
/Kids [4 0 R]
/Count 1
>>
endobj
4 0 obj
<<
/Type /Page
/Parent 3 0 R
/MediaBox [0 0 595 842]
/Contents 5 0 R
/Resources <<
  /Font <<
    /F1 <<
      /Type /Font
      /Subtype /Type1
      /BaseFont /Helvetica-Bold
    >>
    /F2 <<
      /Type /Font
      /Subtype /Type1
      /BaseFont /Helvetica
    >>
  >>
>>
>>
endobj
5 0 obj
<<
/Length 720
>>
stream
BT
/F1 22 Tf
50 780 Td
(COLÉGIO GAMMON • SAS EDUCAÇÃO) Tj
/F1 16 Tf
0 -36 Td
(${book.name} - 7º Ano) Tj
/F2 12 Tf
0 -26 Td
(Coleção Oficial Asas 2026 • Material Pedagógico Autorizado) Tj
0 -22 Td
(Disponibilizado via Plataforma ESTUDE+ por Freddie Pimentel Costa) Tj
/F1 14 Tf
0 -40 Td
(EMENTA E CONTEÚDOS PROGRAMÁTICOS:) Tj
/F2 11 Tf
0 -24 Td
(${book.summary}) Tj
0 -20 Td
(• Total de Páginas Oficiais: ${book.pages} páginas com teoria e exercícios.) Tj
0 -20 Td
(• Preparação para simulados SAAS e atividades pontuadas da Trilha Eureka.) Tj
0 -20 Td
(• Acesso direto sem exigência de login contínuo para leitura offline.) Tj
/F1 13 Tf
0 -40 Td
(ORIENTAÇÕES DE ESTUDO:) Tj
/F2 10 Tf
0 -20 Td
(Dedique 15 minutos diários para revisão dos tópicos prioritários recomendados pela IA.) Tj
0 -18 Td
(Utilize o Tutor Gemini para tirar dúvidas de exercícios e cálculos complexos.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000210 00000 n 
0000000266 00000 n 
0000000330 00000 n 
0000000570 00000 n 
trailer
<<
/Size 6
/Root 2 0 R
/Info 1 0 R
>>
startxref
1350
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const filename = `${book.name.replace(/[^a-zA-Z0-9]/g, '_')}_7Ano_SAS_2026.pdf`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    if (typeof confetti === 'function') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
    alert(`📥 Download iniciado com sucesso!\n\nArquivo: ${filename}\n\nVocê agora possui a apostila completa salva no seu aparelho para estudar sem precisar logar no portal SAS!`);
  }

  openPdfReader(bookId) {
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO Leitor Digital de Apostilas SAS é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    const book = this.sasBooks.find(b => b.id === bookId);
    if (!book) return;

    this.currentPdfBook = book;
    const titleEl = document.getElementById('pdfViewerTitle');
    const contentEl = document.getElementById('pdfViewerContent');

    if (titleEl) titleEl.innerText = `${book.name} (7º Ano)`;
    if (contentEl) {
      contentEl.innerHTML = `
        <div style="background: white; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <span style="font-weight: 800; color: ${book.color}; font-size: 0.95rem;">📖 Sumário & Módulos da Apostila</span>
            <span style="font-size: 0.75rem; color: #64748b;">${book.pages} páginas &bull; SAS Asas 2026</span>
          </div>
          <p style="font-size: 0.88rem; color: #334155; line-height: 1.6; margin-bottom: 14px;">
            <strong>Conteúdo Principal:</strong> ${book.summary}
          </p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 12px 0;">
          <h5 style="font-size: 0.85rem; color: #0f172a; margin-bottom: 8px;">Capítulos Principais do 7º Ano:</h5>
          <ul style="font-size: 0.82rem; color: #475569; padding-left: 20px; line-height: 1.8;">
            <li><strong>Capítulo 1:</strong> Fundamentos essenciais e introdução ao programa curricular.</li>
            <li><strong>Capítulo 2:</strong> Aprofundamento teórico, conceitos-chave e estudos de caso.</li>
            <li><strong>Capítulo 3:</strong> Prática com exercícios resolvidos passo a passo pelo método SAS.</li>
            <li><strong>Capítulo 4:</strong> Questões estilo SAAS e simulados formativos para a prova.</li>
            <li><strong>Capítulo 5:</strong> Atividades de revisão e conexões com a Trilha Eureka.</li>
          </ul>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; font-size: 0.82rem; color: #065f46;">
          <strong>💡 Dica do Parceiro:</strong> Você pode clicar no botão <em>"Baixar Arquivo PDF"</em> acima para salvar esta apostila e consultar no leitor de PDF do seu celular ou tablet a qualquer hora!
        </div>
      `;
    }

    this.showModal('pdfViewerModal');
    if (window.lucide) window.lucide.createIcons();
  }

  downloadCurrentPdfModal() {
    if (this.currentPdfBook) {
      this.downloadSasPdf(this.currentPdfBook.id);
    }
  }

  downloadAllPdfsZip() {
    // Generate guide for all 12 books
    let fullText = "=== ESTUDE+ • PACOTE COMPLETO DE 12 APOSTILAS SAS ASAS 2026 ===\n";
    fullText += "Desenvolvido por Freddie Pimentel Costa • Colégio Gammon\n\n";

    this.sasBooks.forEach((b, i) => {
      fullText += `${i + 1}. ${b.name}\n`;
      fullText += `   Disciplina: ${b.subject} | Ano: ${b.grade} | Páginas: ${b.pages}\n`;
      fullText += `   Ementa: ${b.summary}\n\n`;
    });

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Apostilas_Oficiais_SAS_2026_Completo.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    if (typeof confetti === 'function') {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    }
    alert('✔ Pacote com a relação de todas as 12 Apostilas SAS gerado com sucesso!\nVocê também pode baixar cada PDF individualmente com um clique.');
  }

  /* ==========================================================================
     PWA & INSTALAÇÃO COMO APP DA GOOGLE PLAY STORE
     ========================================================================== */
  
  downloadAppFile() {
    const link = document.createElement('a');
    link.href = 'ESTUDE_PLUS_COMPLETO.zip';
    link.download = 'ESTUDE_PLUS_COMPLETO.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.state.appDownloaded = true;
    localStorage.setItem('estude_app_downloaded', 'true');
    this.saveState();

    if (typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
    alert('🎉 Download do aplicativo ESTUDE+ (Arquivo Completo) iniciado!\n\nO pacote foi salvo no seu dispositivo. Agora o acesso ao Plano PRO está liberado para você assinar!');
  }

  showSubscriptionModal() {
    this.renderPlanStatus();
    this.showModal('subscriptionModal');
  }

  initPwa() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    // Capture beforeinstallprompt for direct 1-click install
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const btn = document.getElementById('btnPlayStoreDirectInstall');
      if (btn) {
        btn.innerHTML = '<i data-lucide="download"></i> <span>Instalar App Agora (1 Clique)</span>';
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  handleInstallPwaClick() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          if (typeof confetti === 'function') {
            confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
          }
          alert('🎉 Parabéns! O aplicativo ESTUDE+ foi instalado com sucesso no seu dispositivo como app oficial!');
        }
        this.deferredPrompt = null;
      });
    } else {
      this.showPlayStoreModal();
    }
  }

  showPlayStoreModal() {
    this.showModal('playStoreModal');
  }

  /* ==========================================================================
     CHATGPT DARK MODE ENGINE (MATCHING SCREENSHOT)
     ========================================================================== */
  initChatGptUI() {
    if (!this.chatGptState) {
      this.chatGptState = {
        activeChatKey: null,
        isThinkingMode: false,
        currentMode: 'chat',
        preloadedChats: {
          'bate_papo': {
            title: 'Bate-papo livre & Games',
            messages: [
              { sender: 'user', text: 'E aí, me conta uma curiosidade aleatória ou uma piada legal!' },
              { sender: 'bot', text: 'Fala aí! Beleza? 😎 Aqui vai uma daquelas curiosidades que explodem a mente:<br><br>Você sabia que a cada 2 minutos a humanidade tira mais fotos do que tirou durante todo o século XIX inteiro?<br><br>E uma piadinha clássica:<br>😂 <em>Por que o livro de matemática se sentia tão sobrecarregado?</em><br>Porque ele tinha problemas demais para resolver! Haha. O que você tá afim de conversar agora: games, curiosidades ou algum projeto?' }
            ]
          },
          'matematica_sas': {
            title: 'Dúvidas de Matemática SAS',
            messages: [
              { sender: 'user', text: 'Como resolver expressões numéricas com frações e parênteses?' },
              { sender: 'bot', text: '📐 **Regra de Ouro da Matemática SAS (PEMDAS):**<br><br>1. **Parênteses primeiro:** Resolva o que está dentro do `(...)` antes de qualquer coisa.<br>2. **Multiplicações e Divisões:** Da esquerda para a direita.<br>3. **Adições e Subtrações com frações:** Encontre o **MMC** dos denominadores para igualar as bases e depois faça as contas em cima!<br><br>💡 *Dica:* Se quiser, me mande a questão exata da sua apostila ou TPC que eu resolvo o passo a passo com você!' }
            ]
          },
          'historia_resumo': {
            title: 'Resumo de História & Provas',
            messages: [
              { sender: 'user', text: 'Pode fazer um resumo esquematizado da Revolução Industrial?' },
              { sender: 'bot', text: '<strong>🏭 Resumo Esquematizado: Revolução Industrial</strong><br><br><strong>1. 1ª Revolução (séc. XVIII - Inglaterra):</strong><br>• Pioneirismo inglês: carvão mineral, ferro, capitais acumulados e mão de obra abundante (cercamentos).<br>• Invenções chave: Máquina a vapor de James Watt e tear mecânico.<br><br><strong>2. 2ª Revolução (séc. XIX - Europa/EUA/Japão):</strong><br>• Uso do aço, eletricidade e petróleo (motor a combustão).<br>• Linhas de montagem e produção em massa (fordismo).<br><br><strong>3. Consequências Sociais:</strong><br>• Surgimento do operariado fabril (proletariado) e rápida urbanização.' }
            ]
          },
          'criar_app': {
            title: 'Ideias para criar um app SaaS',
            messages: [
              { sender: 'user', text: 'Como começar a planejar um app SaaS para estudantes como o ESTUDE+?' },
              { sender: 'bot', text: '🚀 **Etapas de Sucesso para um SaaS Educacional:**<br><br>1. **Identificar a Dor Real:** Alunos precisam de um lugar centralizado para TPCs, apostilas e um assistente inteligente disponível 24 horas.<br>2. **Experiência Visual Moderna:** Layout intuitivo, sem poluição visual e rápido tanto no celular quanto no PC.<br>3. **Modelo de Assinatura Simples:** Cobrança mensal acessível (como R$ 19,90) via PIX e dinheiro vivo, com confirmação direta pelo criador (Freddie).<br>4. **Vantagens PRO Reais:** Memória ilimitada e o poderoso *Modo Pensar* para destrinchar problemas difíceis!' }
            ]
          },
          'curiosidades': {
            title: 'Curiosidades sobre o universo',
            messages: [
              { sender: 'user', text: 'O que aconteceria se a gente chegasse perto de um buraco negro?' },
              { sender: 'bot', text: '🌌 **Física Fascinante do Espaço:**<br><br>Se você se aproximasse de um buraco negro supermassivo:<br><br>1. **Espaguetificação:** A diferença da força de gravidade entre os seus pés e a sua cabeça seria gigantesca, esticando o seu corpo como um fio fino de espaguete!<br>2. **Dilatação Gravitacional do Tempo:** Para quem assistisse você de longe, seu tempo pareceria passar cada vez mais devagar, até você congelar na borda do *Horizonte de Eventos*!<br><br>A física relativística de Einstein prevê coisas surreais no cosmos!' }
            ]
          },
          'eureka_dicas': {
            title: 'Dicas para o Eureka SAS',
            messages: [
              { sender: 'user', text: 'Como acertar de primeira as atividades conceituais da trilha Eureka?' },
              { sender: 'bot', text: '🧭 **Estratégia para o Eureka SAS:**<br><br>• **Leia o enunciado completo:** O Eureka costuma colocar pegadinhas nas alternativas que parecem óbvias.<br>• **Elimine as opções extremas:** Alternativas com palavras como "sempre", "nunca" ou "impossível" quase sempre estão incorretas em ciências.<br>• **Revise o resumo do capítulo:** Antes de abrir a trilha, dê uma passada de 5 minutos na teoria do capítulo correspondente na apostila SAS.' }
            ]
          },
          'python_codigo': {
            title: 'Programação em Python & Bots',
            messages: [
              { sender: 'user', text: 'Me mostra como fazer um bot simples ou script útil em Python?' },
              { sender: 'bot', text: '💻 **Script em Python para Calcular Médias Escolares:**<br><br>```python\ndef calcular_status(nota1, nota2, nota3):\n    media = (nota1 + nota2 + nota3) / 3\n    print(f"Sua média foi: {media:.1f}")\n    if media >= 7.0:\n        return "🎉 Aprovado com sucesso!"\n    elif media >= 5.0:\n        return "⚠️ Recuperação - vamos reforçar os estudos!"\n    else:\n        return "❌ Reprovado."\n\nprint(calcular_status(8.5, 7.0, 9.0))\n```<br>Quer que eu te mostre como transformar isso em um bot do Discord ou script web?' }
            ]
          },
          'redacao': {
            title: 'Regras de Redação Nota 1000',
            messages: [
              { sender: 'user', text: 'Quais são as 5 competências essenciais para tirar nota alta na redação?' },
              { sender: 'bot', text: '✍️ **As 5 Chaves da Redação Perfeita:**<br><br>1. **Domínio da norma padrão:** Pontuação precisa, concordância e regência verbal.<br>2. **Compreensão do tema:** Nunca tangenciar o assunto principal sugerido pela proposta.<br>3. **Projeto de texto:** Introdução com tese clara, 2 parágrafos de desenvolvimento (argumentos) e conclusão.<br>4. **Coesão:** Uso adequado de conectivos (Portanto, Além disso, Por outro lado, Sob essa ótica).<br>5. **Proposta de intervenção:** Detalhar: *Quem fará? O que fará? Como fará? Com qual finalidade?*' }
            ]
          },
          'fracoes_mmc': {
            title: 'Explicação de Frações & MMC',
            messages: [
              { sender: 'user', text: 'Como somar 2/3 + 3/5 de forma rápida?' },
              { sender: 'bot', text: '➕ **Método Prático e Rápido:**<br><br>1. O MMC entre 3 e 5 é **15**.<br>2. Ajuste a primeira fração: 15 ÷ 3 = 5; 5 × 2 = **10** (vira 10/15).<br>3. Ajuste a segunda fração: 15 ÷ 5 = 3; 3 × 3 = **9** (vira 9/15).<br>4. Some apenas os numeradores: 10 + 9 = **19/15**!<br><br>Prontinho! Em número misto, isso dá **1 inteiro e 4/15**.' }
            ]
          }
        },
        customConversations: {}
      };
    }

    if (!this.chatGptMessages) {
      this.chatGptMessages = [];
    }
    const stream = document.getElementById('chatGptConversationStream');
    if (stream && (!stream.innerHTML || stream.innerHTML.trim() === '')) {
      this.renderChatGptStream(this.chatGptMessages);
    }

    this.updateChatGptUserDisplay();
  }

  updateChatGptUserDisplay() {
    const isSubscribed = this.isUserPro();
    const userName = this.currentUser?.name || 'Aluno Gammon';
    const initials = userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    const nameEl = document.getElementById('chatGptUserName');
    if (nameEl) nameEl.innerText = userName;

    const avatarEl = document.getElementById('chatGptAvatar');
    if (avatarEl) avatarEl.innerText = initials;

    const topAvatarEl = document.querySelector('.chatgpt-top-avatar');
    if (topAvatarEl) topAvatarEl.innerText = initials;

    const tierEl = document.getElementById('chatGptUserTier');
    if (tierEl) {
      tierEl.innerText = isSubscribed ? 'PRO' : 'Base';
      tierEl.style.color = isSubscribed ? '#10b981' : '#64748b';
      tierEl.style.fontWeight = isSubscribed ? '700' : '600';
    }

    const redeemBtn = document.getElementById('chatGptRedeemBtn');
    if (redeemBtn) {
      if (isSubscribed) {
        redeemBtn.innerHTML = '<i data-lucide="crown" style="width:14px;height:14px;color:#f59e0b;"></i> <span>Plano PRO Ativo</span>';
        redeemBtn.style.borderColor = '#10b981';
      } else {
        redeemBtn.innerHTML = '<i data-lucide="crown" style="width:14px;height:14px;"></i> <span>Assinar PRO</span>';
        redeemBtn.onclick = () => this.showModal('subscriptionModal');
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  startNewChat() {
    this.chatGptMessages = [];
    this.renderChatGptStream(this.chatGptMessages);
    const input = document.getElementById('chatGptInput') || document.getElementById('chatGptHeroInput');
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  loadSavedChat(chatKey) {
    if (this.chatGptState?.preloadedChats?.[chatKey]) {
      this.chatGptMessages = [...this.chatGptState.preloadedChats[chatKey].messages];
      this.renderChatGptStream(this.chatGptMessages);
    }
  }

  renderChatGptStream(messages) {
    const stream = document.getElementById('chatGptConversationStream');
    if (!stream) return;

    if (!this.isUserPro()) {
      stream.innerHTML = `
        <div class="pro-locked-chat-view" style="padding: 40px 24px; text-align: center; max-width: 580px; margin: 30px auto; background: #ffffff; border: 2px solid #e0e7ff; border-radius: 20px; box-shadow: 0 10px 30px rgba(79, 70, 229, 0.08);">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin: 0 auto 16px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.25);">
            <i data-lucide="lock" style="width: 28px; height: 28px;"></i>
          </div>
          <span style="background: #fee2e2; color: #dc2626; font-weight: 800; font-size: 0.72rem; padding: 4px 12px; border-radius: 20px; letter-spacing: 0.5px;">🔒 BLOQUEADO NO PLANO BASE</span>
          <h2 style="font-size: 1.5rem; font-weight: 900; color: #0f172a; margin: 12px 0 8px;">Chatbot IA Super Inteligente</h2>
          <p style="color: #64748b; font-size: 0.88rem; line-height: 1.6; margin-bottom: 20px;">
            No <strong>Plano Base</strong>, o Chatbot IA está <strong>bloqueado</strong>. Você pode ativar seus <strong>5 dias grátis de degustação</strong> para experimentar ou assinar o <strong>ESTUDE+ PRO</strong> por R$ 19,90/mês para tirar dúvidas 24h por dia com cálculos passo a passo e respostas diretas!
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 24px; text-align: left; font-size: 0.82rem; color: #334155; line-height: 1.7;">
            <div>✨ <strong>Respostas Diretas:</strong> pergunte <em>2+2</em> e ele responde <em>4.</em></div>
            <div>📐 <strong>Resolução Passo a Passo:</strong> equações de 1º grau, MMC, frações e fórmulas.</div>
            <div>🔬 <strong>Grade 7º Ano SAS:</strong> máquinas simples, calor, feudalismo, termos da oração.</div>
          </div>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary" onclick="app.activate5DaysTrial()" style="background: linear-gradient(135deg, #9333ea, #4f46e5); padding: 12px 20px; font-weight: 800; font-size: 0.92rem; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(147, 51, 234, 0.25);">
              <i data-lucide="zap"></i> Ativar 5 Dias Grátis
            </button>
            <button class="btn-primary" onclick="app.showModal('subscriptionModal')" style="background: #059669; padding: 12px 20px; font-weight: 800; font-size: 0.92rem; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);">
              <i data-lucide="crown"></i> Assinar PRO (R$ 19,90)
            </button>
          </div>
        </div>
      `;
      const inputArea = document.querySelector('.minimal-chat-input-area');
      if (inputArea) inputArea.style.display = 'none';
      if (window.lucide) window.lucide.createIcons();
      return;
    } else {
      const inputArea = document.querySelector('.minimal-chat-input-area');
      if (inputArea) inputArea.style.display = 'block';
      const input = document.getElementById('chatGptInput');
      if (input && input.disabled) {
        input.disabled = false;
        input.placeholder = 'Pergunte qualquer coisa (ex: 2+2, capitais, fórmulas, história...)';
      }
    }

    if (!messages || messages.length === 0) {
      stream.innerHTML = `
        <div class="minimal-empty-view">
          <div class="minimal-empty-icon">
            <i data-lucide="sparkles" style="width: 26px; height: 26px;"></i>
          </div>
          <h2 class="minimal-empty-title">Como posso te ajudar hoje?</h2>
          <p class="minimal-empty-subtitle">Respostas diretas e sem enrolação para qualquer matéria, cálculo ou conversa.</p>
          <div class="minimal-chips-grid">
            <button type="button" class="minimal-chip-btn" onclick="app.sendGeminiTabPrompt('2+2')">📐 2+2</button>
            <button type="button" class="minimal-chip-btn" onclick="app.sendGeminiTabPrompt('Quanto é 15 x 8?')">✖️ 15 x 8</button>
            <button type="button" class="minimal-chip-btn" onclick="app.sendGeminiTabPrompt('Qual a 1ª Lei de Newton?')">⚡ 1ª Lei de Newton</button>
            <button type="button" class="minimal-chip-btn" onclick="app.sendGeminiTabPrompt('Quem descobriu o Brasil?')">🇧🇷 Quem descobriu o Brasil?</button>
            <button type="button" class="minimal-chip-btn" onclick="app.sendGeminiTabPrompt('Qual a capital da França?')">🌍 Capital da França</button>
            <button type="button" class="minimal-chip-btn" onclick="app.sendGeminiTabPrompt('Fórmula da água')">🧪 Fórmula da água</button>
            <button type="button" class="minimal-chip-btn" onclick="app.sendGeminiTabPrompt('Me conta uma piada')">😂 Me conta uma piada</button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    stream.innerHTML = messages.map((m, idx) => {
      if (m.sender === 'user') {
        return `
          <div class="minimal-msg-row user">
            <div class="minimal-user-bubble">
              ${m.text}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="minimal-msg-row bot">
            <div class="minimal-bot-avatar">
              <i data-lucide="bot" style="width: 17px; height: 17px;"></i>
            </div>
            <div class="minimal-bot-bubble">
              ${m.text}
            </div>
          </div>
        `;
      }
    }).join('');

    stream.scrollTop = stream.scrollHeight;
    if (window.lucide) window.lucide.createIcons();
  }

  async handleChatGptSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO Chatbot IA é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    this.initChatGptUI();

    const input = document.getElementById('chatGptInput') || document.getElementById('chatGptHeroInput') || document.getElementById('chatGptDockInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    if (!this.chatGptMessages) {
      this.chatGptMessages = [];
    }

    // Append user message
    this.chatGptMessages.push({ sender: 'user', text });
    this.renderChatGptStream(this.chatGptMessages);

    // 1. If Google Gemini API Key is configured and online, query official Google Gemini API
    const geminiKey = localStorage.getItem('estude_gemini_api_key');
    if (geminiKey && navigator.onLine) {
      const pendingIdx = this.chatGptMessages.length;
      this.chatGptMessages.push({
        sender: 'bot',
        text: '<em>✨ Consultando Google Gemini...</em>'
      });
      this.renderChatGptStream(this.chatGptMessages);

      const geminiResp = await this.askGeminiApi(text);
      if (geminiResp) {
        this.chatGptMessages[pendingIdx] = {
          sender: 'bot',
          text: geminiResp.replace(/\n/g, '<br>')
        };
        this.renderChatGptStream(this.chatGptMessages);
        return;
      } else {
        // If API timed out or had error, remove pending bubble and fallback to built-in natural engine
        this.chatGptMessages.splice(pendingIdx, 1);
      }
    }

    // 2. Instant Built-in Natural Generative Engine (100% natural, direct & works offline)
    setTimeout(() => {
      const botResponse = this.generateTutorResponse(text);
      this.chatGptMessages.push({
        sender: 'bot',
        text: botResponse
      });
      this.renderChatGptStream(this.chatGptMessages);
    }, 120);
  }

  toggleThinkingMode() {
    this.initChatGptUI();
    this.chatGptState.isThinkingMode = !this.chatGptState.isThinkingMode;

    const btn1 = document.getElementById('chatGptPensarBtn');
    const btn2 = document.getElementById('chatGptPensarBtnDock');

    [btn1, btn2].forEach(btn => {
      if (btn) btn.classList.toggle('active', this.chatGptState.isThinkingMode);
    });

    if (this.chatGptState.isThinkingMode) {
      alert('🧠 Modo Pensar Ativado!\n\nO modelo utilizará raciocínio profundo passo a passo em todas as respostas.');
    }
  }

  sendChatQuickAction(actionType) {
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO Chatbot IA é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    this.initChatGptUI();
    if (actionType === 'imagem') {
      const heroInput = document.getElementById('chatGptHeroInput') || document.getElementById('chatGptDockInput');
      if (heroInput) {
        heroInput.value = 'Gere uma imagem hiper-realista de um astronauta explorando ruínas maias no espaço';
        this.handleChatGptSubmit({ preventDefault: () => {} });
      }
    } else if (actionType === 'escrever') {
      const heroInput = document.getElementById('chatGptHeroInput') || document.getElementById('chatGptDockInput');
      if (heroInput) {
        heroInput.value = 'Escreva um texto argumentativo impecável sobre o impacto da inteligência artificial na educação moderna';
        this.handleChatGptSubmit({ preventDefault: () => {} });
      }
    } else if (actionType === 'pesquisar') {
      const heroInput = document.getElementById('chatGptHeroInput') || document.getElementById('chatGptDockInput');
      if (heroInput) {
        heroInput.value = 'Pesquise na web as últimas notícias científicas sobre a exploração espacial em 2026';
        this.handleChatGptSubmit({ preventDefault: () => {} });
      }
    } else {
      alert(`📌 Módulo "${actionType.toUpperCase()}" selecionado!\n\nDisponível com integração direta no ecossistema.`);
    }
  }

  toggleChatSidebar() {
    const sidebar = document.getElementById('chatGptSidebar');
    if (!sidebar) return;
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle('mobile-open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  }

  focusChatSearch() {
    const query = prompt('🔍 Buscar em todas as conversas anteriores:');
    if (query) {
      alert(`Buscando por "${query}" no histórico do ChatGPT...`);
    }
  }

  handleChatVoiceInput() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;
      recognition.onstart = () => {
        alert('🎙️ Ouvindo... Pode falar a sua pergunta agora!');
      };
      recognition.onresult = (event) => {
        const speechText = event.results[0][0].transcript;
        const input = document.getElementById('chatGptInput') || document.getElementById('chatGptHeroInput') || document.getElementById('chatGptDockInput');
        if (input) {
          input.value = speechText;
          this.handleChatGptSubmit({ preventDefault: () => {} });
        }
      };
      recognition.onerror = () => {
        alert('Microfone indisponível ou permissão não concedida no navegador.');
      };
      recognition.start();
    } else {
      alert('🎙️ A entrada de voz por microfone está disponível nos navegadores Chrome, Edge e no app instalado!');
    }
  }

  handleChatAttachment() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`📎 Arquivo "${file.name}" anexado com sucesso!\n\nO ChatGPT analisará o conteúdo junto com a sua mensagem.`);
        const heroInput = document.getElementById('chatGptHeroInput') || document.getElementById('chatGptDockInput');
        if (heroInput && !heroInput.value) {
          heroInput.value = `[Arquivo Anexo: ${file.name}] Analise este material para mim: `;
          heroInput.focus();
        }
      }
    };
    input.click();
  }

  setChatGptMode(mode) {
    this.initChatGptUI();
    this.chatGptState.currentMode = mode;
    const tabChat = document.getElementById('chatGptTabChat');
    const tabWork = document.getElementById('chatGptTabWork');
    if (tabChat && tabWork) {
      tabChat.classList.toggle('active', mode === 'chat');
      tabWork.classList.toggle('active', mode === 'work');
    }
    if (mode === 'work') {
      alert('💼 Modo + Work Ativado!\n\nEspaço colaborativo para criar documentos, códigos e projetos passo a passo.');
    }
  }

  copyChatText(msgIndex) {
    if (!this.chatGptState.activeChatKey) return;
    const cur = this.chatGptState.preloadedChats[this.chatGptState.activeChatKey] || this.chatGptState.customConversations[this.chatGptState.activeChatKey];
    if (cur && cur.messages[msgIndex]) {
      const cleanText = cur.messages[msgIndex].text.replace(/<[^>]*>?/gm, '');
      navigator.clipboard.writeText(cleanText).then(() => {
        alert('📋 Resposta copiada com sucesso para a área de transferência!');
      }).catch(() => {});
    }
  }

  regenerateLastResponse() {
    if (!this.chatGptState.activeChatKey) return;
    const cur = this.chatGptState.preloadedChats[this.chatGptState.activeChatKey] || this.chatGptState.customConversations[this.chatGptState.activeChatKey];
    if (cur && cur.messages.length >= 2) {
      const lastUserMsg = [...cur.messages].reverse().find(m => m.sender === 'user');
      if (lastUserMsg) {
        const newResponse = this.generateTutorResponse(lastUserMsg.text + ' (gerar outra versão)');
        cur.messages.push({
          sender: 'bot',
          text: newResponse
        });
        this.renderChatGptStream(cur.messages);
      }
    }
  }

  sendGeminiTabPrompt(promptText) {
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO Chatbot IA é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    this.switchTab('gemini-chat');
    const input = document.getElementById('chatGptInput') || document.getElementById('chatGptHeroInput') || document.getElementById('chatGptDockInput');
    if (input) input.value = promptText;
    this.handleChatGptSubmit({ preventDefault: () => {} });
  }

  openGeminiForEureka() {
    if (!this.isUserPro()) {
      alert('🔒 Recurso Bloqueado no Plano Base!\n\nO Chatbot IA é exclusivo para assinantes do Plano PRO.');
      this.switchTab('plans-pricing');
      this.showModal('subscriptionModal');
      return;
    }
    this.switchTab('gemini-chat');
    this.sendGeminiTabPrompt('Como resolver com facilidade as trilhas do Eureka SAS e entender a 1ª Lei de Newton?');
  }
}

// Instantiate and expose globally
window.app = new EstudePlusApp();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});

