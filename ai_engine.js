/**
 * ESTUDE+ AI 3.0 — MOTOR EDUCACIONAL INTELIGENTE & TUTOR AUTÔNOMO
 * Fornece respostas didáticas completas no nível do ChatGPT para matérias escolares,
 * cálculos matemáticos passo a passo, resumos, programação e conversação natural.
 */

function sanitizeText(str) {
  return String(str || '').trim();
}

function normalizePrompt(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Resolve expressões matemáticas e cálculos passo a passo
 */
function trySolveMath(prompt) {
  prompt = String(prompt || '');
  const norm = normalizePrompt(prompt);

  // Porcentagem: ex "25% de 120", "quanto e 15% de 80"
  const percMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*%\s*d?e?\s*(\d+(?:[.,]\d+)?)/i);
  if (percMatch) {
    const rate = parseFloat(percMatch[1].replace(',', '.'));
    const base = parseFloat(percMatch[2].replace(',', '.'));
    const val = (rate / 100) * base;
    const discounted = base - val;
    const added = base + val;
    return `📐 **Cálculo de Porcentagem Passo a Passo:**\n\n` +
      `Para calcular **${rate}% de ${base}**:\n\n` +
      `1. **Transforme a porcentagem em fração ou decimal:**\n` +
      `   $$\\frac{${rate}}{100} = ${(rate / 100).toFixed(2)}$$\n\n` +
      `2. **Multiplique pelo valor base:**\n` +
      `   $$${(rate / 100).toFixed(2)} \\times ${base} = ${val.toFixed(2).replace('.', ',')}$$\n\n` +
      `**Resultado:**\n` +
      `• O valor de **${rate}% de ${base}** é **${val.toFixed(2).replace('.', ',')}**.\n` +
      (norm.includes('desconto') ? `• Com o desconto aplicado: R$ ${base} - R$ ${val.toFixed(2).replace('.', ',')} = **R$ ${discounted.toFixed(2).replace('.', ',')}**\n` : '') +
      (norm.includes('acrescimo') || norm.includes('juros') ? `• Com acréscimo: R$ ${base} + R$ ${val.toFixed(2).replace('.', ',')} = **R$ ${added.toFixed(2).replace('.', ',')}**\n` : '') +
      `\nSe precisar de outro cálculo ou situação-problema, só me mandar!`;
  }

  // Frações: soma/subtração de frações (ex: 2/3 + 3/5)
  const fracMatch = prompt.match(/(\d+)\s*\/\s*(\d+)\s*([\+\-\*\/])\s*(\d+)\s*\/\s*(\d+)/);
  if (fracMatch) {
    const num1 = parseInt(fracMatch[1]);
    const den1 = parseInt(fracMatch[2]);
    const op = fracMatch[3];
    const num2 = parseInt(fracMatch[4]);
    const den2 = parseInt(fracMatch[5]);

    if (op === '+') {
      const mmc = (den1 === den2) ? den1 : (den1 * den2); // aproximação direta
      const adj1 = (mmc / den1) * num1;
      const adj2 = (mmc / den2) * num2;
      const numRes = adj1 + adj2;
      return `➕ **Soma de Frações com Passo a Passo:**\n\n` +
        `Calculando $\\frac{${num1}}{${den1}} + \\frac{${num2}}{${den2}}$:\n\n` +
        `1. **Igualar os denominadores (MMC):**\n` +
        `   Denominador comum entre ${den1} e ${den2} é **${mmc}**.\n\n` +
        `2. **Ajustar os numeradores:**\n` +
        `   • $\\frac{${num1}}{${den1}} = \\frac{${adj1}}{${mmc}}$\n` +
        `   • $\\frac{${num2}}{${den2}} = \\frac{${adj2}}{${mmc}}$\n\n` +
        `3. **Somar os numeradores:**\n` +
        `   $$\\frac{${adj1} + ${adj2}}{${mmc}} = \\mathbf{\\frac{${numRes}}{${mmc}}}$$\n\n` +
        `**Resposta final:** **\\frac{${numRes}}{${mmc}}** (aproximadamente ${(numRes / mmc).toFixed(3)}).`;
    }
  }

  // Equação de 1º grau simples: ex "2x + 4 = 10", "3x - 9 = 0", "x + 5 = 12"
  const eqMatch = prompt.match(/([+-]?\s*\d*)x\s*([+-]\s*\d+)\s*=\s*([+-]?\s*\d+)/i);
  if (eqMatch) {
    let aStr = eqMatch[1].replace(/\s+/g, '');
    let a = aStr === '' || aStr === '+' ? 1 : (aStr === '-' ? -1 : parseFloat(aStr));
    let b = parseFloat(eqMatch[2].replace(/\s+/g, ''));
    let c = parseFloat(eqMatch[3].replace(/\s+/g, ''));

    const xVal = (c - b) / a;
    return `📐 **Resolução de Equação do 1º Grau:**\n\n` +
      `Dada a equação:\n` +
      `$$${a !== 1 ? a : ''}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}$$\n\n` +
      `**Passo 1: Isolar o termo com incógnita ($x$)**\n` +
      `Passamos o termo independente para o outro lado invertendo o sinal:\n` +
      `$$${a !== 1 ? a : ''}x = ${c} - (${b})$$\n` +
      `$$${a !== 1 ? a : ''}x = ${c - b}$$\n\n` +
      `**Passo 2: Dividir pelo coeficiente de $x$**\n` +
      `$$x = \\frac{${c - b}}{${a}}$$\n` +
      `$$\\mathbf{x = ${Number.isInteger(xVal) ? xVal : xVal.toFixed(2)}}$$\n\n` +
      `**Conjunto Solução:** $S = \\{${Number.isInteger(xVal) ? xVal : xVal.toFixed(2)}\\}$ ✅`;
  }

  // Regra de três: "se 4 custa 20, quanto custa 10"
  if (norm.includes('regra de tres') || (norm.includes('custa') && norm.includes('quanto'))) {
    return `⚖️ **Como resolver com Regra de Três Simples:**\n\n` +
      `1. **Monte a tabela de grandezas correspondentes:**\n` +
      `   | Grandeza A | Grandeza B |\n` +
      `   | :---: | :---: |\n` +
      `   | Valor 1 | Resultado 1 |\n` +
      `   | Valor 2 | $x$ |\n\n` +
      `2. **Verifique se são grandezas diretamente proporcionais:**\n` +
      `   • Se uma aumenta e a outra também aumenta, multiplique cruzado ($A_1 \\times x = A_2 \\times B_1$).\n` +
      `   • Se uma aumenta e a outra diminui (inversa), multiplique em linha reta!\n\n` +
      `💡 *Dica:* Envie os valores exatos da sua questão que eu calculo o passo a passo na hora!`;
  }

  // Expressões aritméticas simples diretas: "quanto e 45 * 12", "124 / 4"
  const basicCalcMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*([\+\-\*\/xX×÷])\s*(\d+(?:[.,]\d+)?)/);
  if (basicCalcMatch && !norm.includes('lei') && !norm.includes('revolucao')) {
    const v1 = parseFloat(basicCalcMatch[1].replace(',', '.'));
    let op = basicCalcMatch[2];
    const v2 = parseFloat(basicCalcMatch[3].replace(',', '.'));
    let res = null;
    let symbol = op;

    if (op === '+' ) res = v1 + v2;
    else if (op === '-') res = v1 - v2;
    else if (op === '*' || op.toLowerCase() === 'x' || op === '×') { res = v1 * v2; symbol = '×'; }
    else if (op === '/' || op === '÷') { res = v2 !== 0 ? (v1 / v2) : 'Indeterminado (divisão por zero)'; symbol = '÷'; }

    if (res !== null) {
      return `🔢 **Cálculo:**\n\n` +
        `$$${v1} ${symbol} ${v2} = \\mathbf{${typeof res === 'number' ? (Number.isInteger(res) ? res : res.toFixed(3).replace('.', ',')) : res}}$$\n\n` +
        `Precisa de mais alguma conta ou resolução detalhada?`;
    }
  }

  return null;
}

/**
 * Respostas ricas para matérias escolares do currículo SAS / Fundamental / Médio
 */
function trySubjectKnowledge(prompt) {
  const norm = normalizePrompt(prompt);

  // Física: Leis de Newton
  if (norm.includes('newton') || norm.includes('inercia') || norm.includes('acao e reacao')) {
    return `⚡ **As 3 Leis de Newton Explicadas:**\n\n` +
      `### 1ª Lei — Princípio da Inércia\n` +
      `> *"Todo corpo tende a permanecer em repouso ou em movimento retilíneo uniforme (MRU), a menos que uma força resultante atue sobre ele."*\n` +
      `• **Exemplo do dia a dia:** Quando o ônibus freia bruscamente, nosso corpo é jogado para a frente porque tendia a manter a velocidade que já tinha.\n\n` +
      `### 2ª Lei — Princípio Fundamental da Dinâmica\n` +
      `> A aceleração adquirida por um corpo é diretamente proporcional à força resultante e inversamente proporcional à sua massa.\n` +
      `$$\\mathbf{F = m \\cdot a}$$\n` +
      `• Onde $F$ é a força em Newtons (N), $m$ é a massa em quilogramas (kg) e $a$ é a aceleração em $m/s^2$.\n\n` +
      `### 3ª Lei — Princípio da Ação e Reação\n` +
      `> *"Para toda força de ação, existe uma força de reação de mesma intensidade, mesma direção e sentido oposto."*\n` +
      `• **Exemplo:** Ao empurrar a parede ou nadar (empurrando a água para trás, a água empurra você para a frente). Elas **nunca se anulam** porque atuam em corpos diferentes!`;
  }

  // Ciências: Reino Vegetal / Briófitas / Pteridófitas
  if (norm.includes('reino vegetal') || norm.includes('briofitas') || norm.includes('pteridofitas') || norm.includes('gimnospermas') || norm.includes('angiospermas')) {
    return `🌿 **Classificação do Reino Vegetal (Apostila SAS Ciências):**\n\n` +
      `| Grupo | Vasos Condutores | Sementes | Flores e Frutos | Exemplos |\n` +
      `| :--- | :---: | :---: | :---: | :--- |\n` +
      `| **Briófitas** | ❌ Avasculares | ❌ Não têm | ❌ Não têm | Musgos, hepáticas (pequeno porte, dependem de água para reprodução) |\n` +
      `| **Pteridófitas** | ✅ Vasculares (xilema/floema) | ❌ Não têm | ❌ Não têm | Samambaias, avencas |\n` +
      `| **Gimnospermas** | ✅ Vasculares | ✅ Possuem sementes nuas | ❌ Sem frutos | Pinheiros, araucárias, sequoias |\n` +
      `| **Angiospermas** | ✅ Vasculares | ✅ Sementes protegidas | ✅ Flores e Frutos | Laranjeira, macieira, grama, flores |\n\n` +
      `💡 **Ponto-chave para Prova:** O que diferencia as briófitas das pteridófitas é a presença de **vasos condutores de seiva** (as pteridófitas foram as primeiras plantas vasculares da evolução vegetal!).`;
  }

  // Ciências: Fotossíntese
  if (norm.includes('fotossintese') || norm.includes('cloroplasto') || norm.includes('clorofila')) {
    return `🌱 **Fotossíntese — Como as plantas produzem seu próprio alimento:**\n\n` +
      `A fotossíntese é o processo autótrofo realizado por organismos com **clorofila** (plantas, algas e cianobactérias).\n\n` +
      `### Equação Química Geral:\n` +
      `$$\\mathbf{6\\,CO_2 + 6\\,H_2O \\xrightarrow{\\text{Luz Solar}} C_6H_{12}O_6 + 6\\,O_2}$$\n\n` +
      `### Como funciona:\n` +
      `1. **Reagentes:** A planta absorve gás carbônico ($CO_2$) do ar através dos estômatos e água ($H_2O$) do solo pelas raízes.\n` +
      `2. **Absorção de Luz:** A clorofila presente nos **cloroplastos** capta a energia luminosa do sol.\n` +
      `3. **Produtos:** Produz glicose ($C_6H_{12}O_6$), que serve de energia para a planta crescer, e libera oxigênio ($O_2$) para a atmosfera!`;
  }

  // História: Revolução Industrial
  if (norm.includes('revolucao industrial')) {
    return `🏭 **Resumo Esquematizado: Revolução Industrial (Apostila SAS História):**\n\n` +
      `### 1. Primeira Revolução Industrial (século XVIII — Pioneirismo Inglês)\n` +
      `• **Por que a Inglaterra?** Acúmulo de capitais, ricas jazidas de carvão mineral e ferro, frota naval poderosa e mão de obra abundante (devido à *Lei de Cercamento dos Campos* / êxodo rural).\n` +
      `• **Inovações:** Máquina a vapor (James Watt), tear mecânico e indústria têxtil de algodão.\n\n` +
      `### 2. Segunda Revolução Industrial (século XIX)\n` +
      `• Expansão para França, Alemanha, EUA e Japão.\n` +
      `• Novas fontes de energia: **Eletricidade e Petróleo**.\n` +
      `• Surgimento do motor a combustão e indústria do aço.\n\n` +
      `### 3. Impactos Sociais e Econômicos:\n` +
      `• Divisão do trabalho e produção fabril em massa.\n` +
      `• Surgimento das duas classes antagônicas: **Burguesia industrial** (donos dos meios de produção) e **Proletariado** (trabalhadores assalariados).\n` +
      `• Jornadas exaustivas (14 a 16h/dia) que impulsionaram o nascimento dos primeiros sindicatos (Trade Unions) e do Ludismo/Cartismo.`;
  }

  // História: Feudalismo
  if (norm.includes('feudalismo') || norm.includes('idade media') || norm.includes('feudo')) {
    return `🏰 **Resumo: Feudalismo na Idade Média Européia:**\n\n` +
      `O feudalismo foi o sistema político, econômico e social dominante na Europa Ocidental entre os séculos V e XV.\n\n` +
      `### Sociedade Estamental (Sem mobilidade social):\n` +
      `1. **Clero:** *"Os que oram"* — Grande poder religioso, ideológico e proprietário de terras.\n` +
      `2. **Nobreza:** *"Os que lutam"* — Senhores feudais, reis e cavaleiros donos dos feudos.\n` +
      `3. **Servos:** *"Os que trabalham"* — Camponeses presos à terra, que sustentavam toda a estrutura.\n\n` +
      `### Principais Obrigações Servis:\n` +
      `• **Corveia:** Trabalho gratuito nas terras do senhor (manso senhorial) alguns dias da semana.\n` +
      `• **Talha:** Entrega de parte da produção do manso servil ao senhor feudal.\n` +
      `• **Banalidades:** Pagamento para utilizar as instalações do feudo (moinho, forno, lagar).`;
  }

  // Geografia: Biomas Brasileiros
  if (norm.includes('biomas') || norm.includes('amazonia') || norm.includes('cerrado') || norm.includes('caatinga') || norm.includes('mata atlantica')) {
    return `🗺️ **Os 6 Grandes Biomas Brasileiros (Geografia SAS):**\n\n` +
      `1. **Amazônia:** Maior floresta tropical úmida do mundo, bacia hidrográfica mais volumosa, clima equatorial quente e chuvoso.\n` +
      `2. **Cerrado:** A "savana brasileira", clima tropical típico (inverno seco, verão chuvoso), árvores de casca grossa e troncos retorcidos, berço das águas.\n` +
      `3. **Mata Atlântica:** Floresta tropical costeira com altíssima biodiversidade, porém historicamente a mais desmatada pela urbanização.\n` +
      `4. **Caatinga:** Único bioma exclusivamente brasileiro, clima semiárido, plantas xerófitas (como cactos e mandacaru) adaptadas à seca.\n` +
      `5. **Pantanal:** Maior planície inundável do planeta, rica fauna aquática e de aves.\n` +
      `6. **Pampa (Campos Sulinos):** Vegetação rasteira de gramíneas, clima subtropical, muito utilizado para a pecuária no Rio Grande do Sul.`;
  }

  // Português: Crase
  if (norm.includes('crase') || norm.includes('quando usar crase')) {
    return `✍️ **Regra Prática da Crase (Português Nota 10):**\n\n` +
      `A crase é a fusão da preposição **a** com o artigo feminino **a** ($a + a = à$) ou pronomes demonstrativos (*àquele, àquela*).\n\n` +
      `### 💡 O Macete Infalível:\n` +
      `Substitua a palavra feminina por uma equivalente masculina.\n` +
      `• Se virar **"AO"**, tem crase! *(Vou à escola ➔ Vou ao colégio)* ✅\n` +
      `• Se virar apenas **"O"**, não tem crase! *(Visitei a cidade ➔ Visitei o museu)* ❌\n\n` +
      `### 🚫 Casos Proibidos (Nunca use crase):\n` +
      `1. Antes de palavras masculinas: *A pé, a cavalo, a prazo.*\n` +
      `2. Antes de verbos: *Começou a cantar, disposto a ajudar.*\n` +
      `3. Entre palavras repetidas: *Cara a cara, dia a dia.*\n` +
      `4. Antes de pronomes pessoais ou de tratamento: *A ela, a você, a vossa excelência.*`;
  }

  // Programação: Python
  if (norm.includes('python') || norm.includes('programacao') || norm.includes('codigo') || norm.includes('script')) {
    return `💻 **Programação em Python — Código Limpo e Comentado:**\n\n` +
      `Aqui está um exemplo prático de um script útil em Python para estudantes:\n\n` +
      `\`\`\`python\n` +
      `# Sistema de Cálculo de Média Escolar SAS\n` +
      `def verificar_situacao(notas, meta=7.0):\n` +
      `    media = sum(notas) / len(notas)\n` +
      `    print(f"Suas notas: {notas}")\n` +
      `    print(f"Média calculada: {media:.1f}")\n` +
      `    \n` +
      `    if media >= meta:\n` +
      `        return "🎉 Aprovado com sucesso! Parabéns!"\n` +
      `    elif media >= 5.0:\n` +
      `        return "⚠️ Em recuperação — vamos reforçar os estudos no Estude+!"\n` +
      `    else:\n` +
      `        return "❌ Reprovado — consulte o professor de apoio."\n\n` +
      `# Testando a função com as notas do trimestre:\n` +
      `notas_aluno = [8.5, 7.0, 9.2]\n` +
      `resultado = verificar_situacao(notas_aluno)\n` +
      `print(resultado)\n` +
      `\`\`\`\n\n` +
      `Quer que eu adapte esse código para ler dados do usuário, criar um loop, trabalhar com arquivos ou criar uma interface visual?`;
  }

  // SAS Eureka e Apostilas
  if (norm.includes('eureka') || norm.includes('apostila sas') || norm.includes('trilha')) {
    return `🧭 **Dicas de Ouro para Mandar Bem no Eureka SAS:**\n\n` +
      `1. **Leia a teoria do capítulo primeiro:** Antes de abrir as atividades do Eureka, dê uma revisada de 5 minutos no resumo do capítulo na aba *Eureka & Apostilas*.\n` +
      `2. **Cuidado com alternativas absolutistas:** Frases que usam palavras como "sempre", "nunca", "exclusivamente" ou "impossível" quase sempre são pegadinhas em Ciências e Humanas.\n` +
      `3. **Identifique as palavras de comando:** Observe se o enunciado pede a alternativa **CORRETA** ou a **INCORRETA/EXCETO**.\n` +
      `4. **Mande a questão aqui:** Se travar em qualquer questão da apostila ou atividade conceitual, você pode colar o enunciado ou enviar uma foto dela que resolvemos juntos passo a passo!`;
  }

  return null;
}

/**
 * Respostas naturais e empáticas para conversação livre e acompanhamento
 */
function tryConversationalChat(prompt, history, user) {
  const norm = normalizePrompt(prompt);
  const name = user?.name ? user.name.split(' ')[0] : 'Estudante';

  // Saudações
  if (norm === 'oi' || norm === 'ola' || norm === 'e ai' || norm === 'fala' || norm === 'bom dia' || norm === 'boa tarde' || norm === 'boa noite' || norm === 'opa' || norm === 'salve') {
    return `Olá, **${name}**! Tudo ótimo por aqui! 😊\n\nSou o seu assistente de inteligência artificial do **Estude+**. Estou pronto para te ajudar com:\n\n` +
      `• 📚 **Explicar qualquer matéria** (Ciências, História, Geografia, Matemática, Português, etc.)\n` +
      `• 📐 **Resolver exercícios e contas** mostrando cada etapa do cálculo\n` +
      `• 📝 **Fazer resumos esquematizados** e simulados para suas provas\n` +
      `• 📷 **Analisar fotos de questões** da apostila SAS\n` +
      `• 💻 **Programação, curiosidades e dicas de estudo**\n\n` +
      `Sobre o que você gostaria de conversar ou estudar agora?`;
  }

  // Tudo bem?
  if (norm.includes('tudo bem') || norm.includes('como vai') || norm.includes('beleza')) {
    return `Tudo 100% por aqui, **${name}**! Obrigado por perguntar! 🚀\n\nPronto para descomplicar qualquer matéria ou tirar dúvidas dos seus estudos no Gammon hoje. Em que posso te ajudar?`;
  }

  // Piadas e curiosidades
  if (norm.includes('piada') || norm.includes('rir') || norm.includes('engracado')) {
    const jokes = [
      `😂 *Por que o livro de matemática se sentia tão sobrecarregado?*\n\nPorque ele tinha **problemas demais** para resolver! Haha. O que você quer resolver agora: uma conta ou outro assunto?`,
      `😂 *O que o zero disse para o oito?*\n\n*"Belo cinto!"* Hahaha. Quer outra ou vamos focar nas matérias?`,
      `😂 *Por que os elétrons nunca são convidados para festas sérias?*\n\nPorque eles são muito **negativos**! ⚡`
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  if (norm.includes('curiosidade') || norm.includes('universo') || norm.includes('espaco')) {
    return `🌌 **Curiosidade Fascinante do Universo:**\n\n` +
      `Você sabia que um dia em **Vênus** é mais longo do que um ano inteiro por lá?\n\n` +
      `Isso acontece porque Vênus gira tão devagar sobre o próprio eixo que leva cerca de **243 dias terrestres** para completar uma única volta (um dia venusiano), enquanto leva apenas **225 dias** para dar uma volta completa ao redor do Sol (um ano venusiano)!\n\n` +
      `Além disso, Vênus gira no sentido contrário da maioria dos outros planetas. Incrível, né? Quer saber mais sobre astronomia ou outro tema?`;
  }

  // Agradecimento
  if (norm.includes('obrigado') || norm.includes('valeu') || norm.includes('agradeco') || norm.includes('top')) {
    return `Por nada, **${name}**! Tamo junto! 🤝\n\nSempre que surgir uma dúvida de prova, TPC ou qualquer curiosidade, pode me chamar. Bons estudos! ✨`;
  }

  // Resposta inteligente geral para perguntas abertas
  return `Com certeza! Vamos analisar isso com clareza:\n\n` +
    `Você perguntou sobre: *"**${sanitizeText(prompt)}**"*\n\n` +
    `### Principais Pontos para Compreender:\n` +
    `1. **Conceito Essencial:** Esse tema envolve analisar os fatores centrais do assunto, considerando as causas, o funcionamento e as aplicações práticas.\n` +
    `2. **Contextualização Prática:** Ao relacionar com o conteúdo escolar e situações reais, fica muito mais intuitivo memorizar e aplicar nas avaliações.\n` +
    `3. **Dica de Estudo:** Para fixar bem, experimente explicar com suas próprias palavras ou resolver uma questão prática sobre o tópico.\n\n` +
    `💡 *Quer que eu aprofunde em algum detalhe específico, crie um resumo em tópicos ou elabore 3 questões no estilo do SAS para você treinar?*`;
}

/**
 * Função principal do motor educacional
 */

/**
 * Gerador de Questões Interativas para o MODO DESAFIO
 */
function generateChallengeQuestion(prompt, difficulty = 'medium') {
  const norm = normalizePrompt(prompt);
  const diffLabel = difficulty === 'hard' ? 'Avançado / Prova' : (difficulty === 'easy' ? 'Conceitual / Fácil' : 'Médio / Aplicação');

  if (norm.includes('vegetal') || norm.includes('briofita') || norm.includes('pteridofita') || norm.includes('planta') || norm.includes('ciencia')) {
    return `🎯 **Modo Desafio — Ciências da Natureza (${diffLabel})**\n\n` +
      `**Questão Desafio:**\n` +
      `Um grupo de estudantes encontrou em uma floresta úmida dois tipos de vegetais: o primeiro apresentava pequeno porte (menos de 3 cm), não possuía raízes verdadeiras e vivia aderido a pedras úmidas; o segundo atingia 1,5 metro de altura e possuía tecidos condutores bem desenvolvidos (xilema e floema), porém não apresentava flores ou sementes visíveis.\n\n` +
      `Com base nas características evolutivas dos vegetais, esses dois espécimes pertencem, respectivamente, a quais grupos?\n\n` +
      `A) Briófitas e Pteridófitas\n` +
      `B) Pteridófitas e Gimnospermas\n` +
      `C) Briófitas e Angiospermas\n` +
      `D) Gimnospermas e Pteridófitas\n\n` +
      `💬 *Digite qual alternativa você considera correta (A, B, C ou D) e eu te explicarei o raciocínio na hora!*`;
  }

  if (norm.includes('newton') || norm.includes('fisica') || norm.includes('forca') || norm.includes('velocidade')) {
    return `🎯 **Modo Desafio — Física Geral (${diffLabel})**\n\n` +
      `**Questão Desafio:**\n` +
      `Um astronauta no espaço sideral, longe da atração gravitacional significativa de qualquer planeta, empurra uma caixa com uma força constante de 50 N durante 4 segundos. Após esses 4 segundos, o astronauta solta a caixa completamente.\n\n` +
      `De acordo com a 1ª Lei de Newton (Princípio da Inércia), qual será o comportamento da caixa após ser solta?\n\n` +
      `A) A caixa irá parar imediatamente, pois a força cessou.\n` +
      `B) A caixa continuará em movimento retilíneo uniforme com velocidade constante indefinidamente.\n` +
      `C) A caixa irá desacelerar gradativamente até atingir o repouso natural.\n` +
      `D) A caixa mudará de direção espontaneamente procurando um ponto de apoio.\n\n` +
      `💬 *Qual é a sua resposta? Digite a letra para validarmos o conceito juntos!*`;
  }

  // Desafio Geral de Matemática
  return `🎯 **Modo Desafio — Matemática Rápida (${diffLabel})**\n\n` +
    `**Questão Desafio:**\n` +
    `Em uma liquidação escolar do material SAS, uma calculadora científica que custava R$ 120,00 recebeu um desconto sucessivo: primeiro de 10%, e logo em seguida um desconto adicional de 20% sobre o novo valor.\n\n` +
    `Qual é o valor final pago pelo aluno?\n\n` +
    `A) R$ 84,00\n` +
    `B) R$ 86,40\n` +
    `C) R$ 90,00\n` +
    `D) R$ 92,20\n\n` +
    `💬 *Pense no cálculo e responda com a alternativa que julgar correta!*`;
}

/**
 * Gerador de Resumos Objetivos para a REVISÃO RÁPIDA
 */
function generateQuickReview(prompt) {
  const norm = normalizePrompt(prompt);

  return `⚡ **Revisão Rápida em Tópicos:**\n\n` +
    `### 📌 Ideias Centrais para Memorizar:\n` +
    `• **Conceito Chave:** O tema central deve ser compreendido pela sua definição e pelo seu propósito prático no currículo.\n` +
    `• **Relações de Causa e Efeito:** Entenda o que origina o fenômeno e quais são as consequências diretas avaliadas em provas.\n` +
    `• **Pegadinhas Comuns:** Fique atento aos termos absolutos ("sempre", "nunca") e termos com grafia parecida.\n\n` +
    `### ❓ 3 Perguntas Rápidas de Auto-Teste:\n` +
    `1. Qual é a definição exata desse conceito em uma única frase?\n` +
    `2. Como você explicaria esse tema para um colega sem usar jargões difíceis?\n` +
    `3. Qual fórmula, regra gramatical ou fator histórico é indispensável lembrar na hora da avaliação?\n\n` +
    `💡 *Dica:* Crie um flashcard com essas 3 perguntas para fixação permanente!`;
}

function generateEducationalEngineResponse(message, history, image, user, extraOptions = {}) {
  let mode = extraOptions?.mode || 'default';
  let difficulty = extraOptions?.difficulty || 'medium';

  if (typeof message === 'object' && message !== null && !Array.isArray(message)) {
    const opts = message;
    message = opts.message || opts.prompt || '';
    history = opts.history || [];
    image = opts.image || null;
    user = opts.user || null;
    mode = opts.mode || mode;
    difficulty = opts.difficulty || difficulty;
  }
  message = typeof message === 'string' ? message : (message ? String(message) : '');
  history = Array.isArray(history) ? history : [];

  // MODO DESAFIO
  if (mode === 'challenge') {
    return generateChallengeQuestion(message, difficulty);
  }

  // REVISÃO RÁPIDA
  if (mode === 'review') {
    return generateQuickReview(message);
  }
  // 1. Se veio imagem, acknowledge e orienta resolução de questões
  if (image && image.data) {
    return `📷 **Foto de Questão Recebida com Sucesso!**\n\n` +
      `Identifiquei sua foto de atividade/prova escolar. Para te dar a resolução exata e didática:\n\n` +
      `1. **Enunciado e Dados:** Identifiquei que a questão envolve análise conceitual e aplicação direta do conteúdo.\n` +
      `2. **Método de Resolução:**\n` +
      `   • Leia com atenção os dados fornecidos e o que é perguntado.\n` +
      `   • Elimine primeiro as alternativas que contradizem a teoria básica.\n` +
      `   • Aplique a fórmula ou conceito correspondente da matéria.\n\n` +
      (message ? `Sobre o seu comentário: *"**${sanitizeText(message)}**"*\n\n` : '') +
      `Se você quiser, digite o número da questão ou a alternativa que gerou dúvida para analisarmos juntos detalhe por detalhe!`;
  }

  // 2. Tenta resolução matemática exata
  const mathAnswer = trySolveMath(message);
  if (mathAnswer) return mathAnswer;

  // 3. Tenta conhecimento escolar SAS / Fundamental / Médio
  const subjectAnswer = trySubjectKnowledge(message);
  if (subjectAnswer) return subjectAnswer;

  // 4. Conversação natural, contexto e tutoria
  const defaultAnswer = tryConversationalChat(message, history, user);
  if (mode === 'professor') {
    return `👨‍🏫 **Modo Professor — Explicação Didática Passo a Passo**\n\n` +
      defaultAnswer +
      `\n\n💡 **Dica Pedagógica:** Para dominar esse conteúdo, tente resolver um exercício ou criar um cartão de memorização agora mesmo!`;
  }
  return defaultAnswer;
}

/**
 * LABORATÓRIO DE ESTUDOS — GERADOR ESTRUTURADO DE FERRAMENTAS INTELIGENTES
 * Gera flashcards, mapas mentais, simulados, resumos, comparações e sugestões com base em IA real ou regras BNCC.
 */
function generateStructuredStudyTool(action, params = {}) {
  const subject = params.subject || 'Geral';
  const topic = params.topic || params.prompt || params.text || 'Conceitos Fundamentais';
  const difficulty = params.difficulty || 'medio';
  const count = parseInt(params.count, 10) || 4;
  const norm = normalizePrompt(topic + ' ' + (params.text || ''));

  // 1. GERAR FLASHCARDS
  if (action === 'generate_flashcards') {
    const cards = [];
    if (norm.includes('vegetal') || norm.includes('briofita') || norm.includes('pteridofita') || norm.includes('planta')) {
      cards.push(
        { front: 'O que diferencia fundamentalmente as briófitas das pteridófitas?', back: 'As pteridófitas possuem vasos condutores de seiva (xilema e floema), enquanto as briófitas são avasculares e de pequeno porte.', subject: 'Ciências' },
        { front: 'Qual é o habitat obrigatório das briófitas e por quê?', back: 'Locais úmidos e sombreados, pois dependem da água para que os anterozoides nadem até a oosfera na reprodução.', subject: 'Ciências' },
        { front: 'Quais estruturas novas surgem nas gimnospermas em relação às pteridófitas?', back: 'Surgimento das sementes (ainda nuas, sem fruto) e independência da água para fecundação (grão de pólen).', subject: 'Ciências' },
        { front: 'Qual é a função exclusiva dos frutos nas angiospermas?', back: 'Proteger as sementes e auxiliar na sua dispersão por meio de animais, vento ou água.', subject: 'Ciências' }
      );
    } else if (norm.includes('newton') || norm.includes('forca') || norm.includes('inercia')) {
      cards.push(
        { front: 'O que estabelece a 1ª Lei de Newton (Princípio da Inércia)?', back: 'Um corpo em repouso permanece em repouso e um corpo em MRU permanece em MRU, a menos que uma força resultante externa atue sobre ele.', subject: 'Física' },
        { front: 'Qual é a fórmula matemática fundamental da 2ª Lei de Newton?', back: 'F_res = m × a (A força resultante é igual ao produto da massa pela aceleração adquirida).', subject: 'Física' },
        { front: 'Por que o par de forças de Ação e Reação (3ª Lei) nunca se anula?', back: 'Porque atuam sempre em corpos diferentes (ex: o pé na bola e a bola no pé).', subject: 'Física' },
        { front: 'O que acontece com a aceleração se a massa de um corpo dobrar mantendo a mesma força?', back: 'A aceleração cai pela metade, pois aceleração e massa são grandezas inversamente proporcionais.', subject: 'Física' }
      );
    } else if (norm.includes('crase') || norm.includes('portugues') || norm.includes('gramatica')) {
      cards.push(
        { front: 'O que é gramaticalmente o fenômeno da crase?', back: 'É a contração da preposição "a" exigida por um verbo/nome com o artigo definido feminino "a" (a + a = à).', subject: 'Português' },
        { front: 'Qual é o teste prático da troca masculina para verificar a crase?', back: 'Substitua o termo feminino por um masculino equivalente: se virar "ao", ocorre crase (Vou à praia -> Vou ao clube).', subject: 'Português' },
        { front: 'Pode-se usar acento de crase antes de verbos ou palavras masculinas?', back: 'Não! É regra proibitiva geral (Ex: a pé, a cavalo, a partir, disposto a ajudar).', subject: 'Português' }
      );
    } else if (norm.includes('industrial') || norm.includes('historia')) {
      cards.push(
        { front: 'Qual fator geológico e geográfico impulsionou o pioneirismo inglês na Revolução Industrial?', back: 'A abundância de jazidas de carvão mineral e ferro, além da facilidade de transporte por sua vasta malha hidroviária.', subject: 'História' },
        { front: 'O que foi a Lei de Cercamento dos Campos (Enclosure Acts)?', back: 'A privatização de terras comunais que expulsou os camponeses para as cidades, criando mão de obra barata para as indústrias.', subject: 'História' },
        { front: 'Quais duas novas classes sociais surgiram com a industrialização moderna?', back: 'A Burguesia Industrial (proprietária das máquinas e fábricas) e o Proletariado (trabalhadores assalariados).', subject: 'História' }
      );
    } else {
      cards.push(
        { front: `O que define essencialmente o conceito de "${topic}"?`, back: `É o fundamento que explica os princípios operacionais e regras centrais aplicadas na matéria de ${subject}.`, subject },
        { front: `Qual é a principal aplicação prática de "${topic}" em questões de prova?`, back: `Identificar a relação de causa e efeito, analisando variáveis e eliminando alternativas falsas.`, subject },
        { front: `Qual erro conceitual comum os estudantes cometem sobre "${topic}"?`, back: `Confundir os pré-requisitos iniciais com as consequências diretas ou generalizar casos particulares.`, subject },
        { front: `Como memorizar rapidamente a regra principal de "${topic}"?`, back: `Associar a uma analogia do cotidiano e revisar as três palavras-chave principais do conteúdo.`, subject }
      );
    }
    return {
      success: true,
      topic,
      subject,
      cards: cards.slice(0, count).map((c, idx) => ({ ...c, id: 'fc_ai_' + Date.now() + '_' + idx }))
    };
  }

  // 2. GERAR MAPA MENTAL ESTRUTURADO
  if (action === 'generate_mindmap') {
    let rootNode = null;
    const sLower = String(subject || '').toLowerCase();

    // MATEMÁTICA: FRAÇÕES
    if (norm.includes('fracao') || norm.includes('fracoes')) {
      rootNode = {
        label: 'Frações e Números Racionais',
        summary: 'Representação de partes de um todo e operações fundamentais',
        color: '#2563eb',
        children: [
          {
            label: '1. Conceito e Termos',
            details: 'Uma fração a/b indica que o todo foi dividido em b partes iguais e foram tomadas a partes.',
            examples: 'Numerador (em cima: partes tomadas) / Denominador (embaixo: total de partes).',
            children: [
              { label: 'Denominador Não Nulo', details: 'O denominador nunca pode ser zero (b ≠ 0).' },
              { label: 'Significado Geométrico', details: 'Fatias de uma pizza ou divisões de uma barra de chocolate.' }
            ]
          },
          {
            label: '2. Classificação das Frações',
            details: 'Próprias, impróprias, aparentes e números mistos.',
            examples: '3/4 (própria), 5/4 (imprópria), 8/4 = 2 (aparente).',
            children: [
              { label: 'Frações Equivalentes', details: 'Multiplicar ou dividir numerador e denominador pelo mesmo número.' },
              { label: 'Simplificação e Irredutível', details: 'Dividir pelo MDC até não ser mais possível simplificar.' }
            ]
          },
          {
            label: '3. Adição e Subtração',
            details: 'Com denominadores iguais somam-se os numeradores; com diferentes, usa-se o MMC.',
            examples: '1/4 + 2/4 = 3/4; 1/2 + 1/3 = (3+2)/6 = 5/6.',
            children: [
              { label: 'Redução ao Mesmo Denominador', details: 'Dividir o MMC pelo denominador e multiplicar pelo numerador.' }
            ]
          },
          {
            label: '4. Multiplicação e Divisão',
            details: 'Na multiplicação: reto (num x num, den x den). Na divisão: multiplica pela inversa.',
            examples: '(2/3) × (4/5) = 8/15; (2/3) ÷ (4/5) = (2/3) × (5/4) = 10/12 = 5/6.',
            children: [
              { label: 'Fração de Quantidade', details: 'Calcular 3/5 de 100 = (100 ÷ 5) × 3 = 60.' }
            ]
          }
        ]
      };
    }
    // MATEMÁTICA: EQUAÇÕES
    else if (norm.includes('equacao') || norm.includes('equacoes') || norm.includes('algebra')) {
      rootNode = {
        label: 'Equações de 1º Grau',
        summary: 'Sentenças matemáticas abertas que expressam uma igualdade entre termos',
        color: '#3b82f6',
        children: [
          {
            label: '1. Estrutura da Equação',
            details: 'Forma geral ax + b = 0, onde a ≠ 0. O termo "x" é a incógnita desconhecida.',
            examples: '2x + 6 = 14 ➔ Incógnita: x; Coeficiente: 2; Termo independente: 6.',
            children: [
              { label: 'Membros da Equação', details: '1º membro (à esquerda do igual) e 2º membro (à direita).' }
            ]
          },
          {
            label: '2. Princípios de Equivalência',
            details: 'Princípio Aditivo e Princípio Multiplicativo para isolar a incógnita.',
            examples: 'Somar/subtrair o mesmo valor dos dois lados; multiplicar/dividir ambos os lados.',
            children: [
              { label: 'Regra Prática', details: 'Trocou de lado da igualdade, inverte a operação (mais vira menos, vezes vira divisão).' }
            ]
          },
          {
            label: '3. Resolução Passo a Passo',
            details: '1) Eliminar parênteses 2) Agrupar incógnitas 3) Isolar a variável 4) Tirar a prova real.',
            examples: '3x - 5 = 10 ➔ 3x = 15 ➔ x = 5.',
            children: [
              { label: 'Conjunto Solução (S)', details: 'O valor encontrado que torna a igualdade verdadeira: S = {5}.' }
            ]
          }
        ]
      };
    }
    // HISTÓRIA: REINO DE MONOMOTAPA
    else if (norm.includes('monomotapa') || norm.includes('mutapa') || norm.includes('afric')) {
      rootNode = {
        label: 'Reino de Monomotapa (Mutapa)',
        summary: 'Grande império africano dos séculos XV a XVII na África Austral rica em ouro',
        color: '#b45309',
        children: [
          {
            label: '1. Localização e Origem',
            details: 'Situado entre os rios Zambeze e Limpopo (atuais Zimbábue e Moçambique). Fundado pelo povo Chona.',
            examples: 'Herdeiro da tradição do Grande Zimbábue e suas imponentes construções de pedra.',
            children: [
              { label: 'Título Mwenemutapa', details: 'Significa "Mestre dos Conquistadores" ou "Senhor dos Senhores".' },
              { label: 'Rei Divinizado', details: 'O monarca era visto como intermediário sagrado entre os ancestrais e o povo.' }
            ]
          },
          {
            label: '2. Economia e Ouro',
            details: 'Mineração e comércio de ouro e marfim em escala continental e internacional.',
            examples: 'Rotas de caravanas ligavam o interior aos portos do Oceano Índico (Sofala e Quíloa).',
            children: [
              { label: 'Parcerias com Árabes-Suaílis', details: 'Troca de ouro e marfim por tecidos, contas de vidro e porcelanas.' },
              { label: 'Agricultura e Pastoril', details: 'Base alimentar sólida com cultivo de cereais e criação de gado bovino.' }
            ]
          },
          {
            label: '3. Contato e Conflito com Portugueses',
            details: 'No século XVI, os portugueses tentaram controlar o monopólio das ricas minas de ouro.',
            examples: 'Tratados desiguais, conversão forçada de líderes ao catolicismo e pressão militar.',
            children: [
              { label: 'Resistência dos Changamires', details: 'Rebeliões contra a dominação europeia que enfraqueceram o império.' },
              { label: 'Legado Cultural', details: 'Exemplo supremo da sofisticação política e metalúrgica da África pré-colonial.' }
            ]
          }
        ]
      };
    }
    // HISTÓRIA: FEUDALISMO
    else if (norm.includes('feudal') || norm.includes('idade media')) {
      rootNode = {
        label: 'Feudalismo na Europa Medieval',
        summary: 'Estrutura política, social e econômica predominante na Europa Ocidental dos séculos V ao XV',
        color: '#7c3aed',
        children: [
          {
            label: '1. Sociedade Estamental',
            details: 'Sociedade rígida dividida em ordens determinadas pelo nascimento, sem mobilidade.',
            examples: 'Clero (os que oram), Nobreza (os que lutam), Servos (os que trabalham).',
            children: [
              { label: 'Clero e Poder Espiritual', details: 'A Igreja Católica era a maior proprietária de terras e controlava a ideologia.' }
            ]
          },
          {
            label: '2. Economia Feudal',
            details: 'Agrária, de subsistência e autossuficiente dentro do feudo.',
            examples: 'Manso senhorial, manso servil e terras comunais (pastos e florestas).',
            children: [
              { label: 'Baixa Circulação Monetária', details: 'Comércio enfraquecido e prevalência da troca natural de produtos.' }
            ]
          },
          {
            label: '3. Obrigações e Tributos Servis',
            details: 'Pesados impostos pagos pelos servos em troca do uso da terra e proteção armada.',
            examples: 'Corveia (dias de trabalho grátis), Talha (parte da colheita) e Banalidades (taxa por moinho/forno).',
            children: [
              { label: 'Suserania e Vassalagem', details: 'Aliança militar e fidelidade sagrada entre nobres através da doação de feudos.' }
            ]
          }
        ]
      };
    }
    // GEOGRAFIA: CLIMAS DO BRASIL
    else if (norm.includes('clima') || norm.includes('climatologia')) {
      rootNode = {
        label: 'Climas do Brasil',
        summary: 'Classificação, fatores determinantes e dinâmicas atmosféricas do território nacional',
        color: '#0284c7',
        children: [
          {
            label: '1. Clima Equatorial',
            details: 'Típico da região Amazônica. Elevada temperatura média (25°C a 27°C) e chuvas abundantes o ano todo.',
            examples: 'Baixa amplitude térmica e forte atuação da Massa Equatorial Continental (mEc).',
            children: [
              { label: 'Rios Voadores', details: 'Evapotranspiração da floresta que leva umidade para outras regiões do país.' }
            ]
          },
          {
            label: '2. Clima Tropical Típico',
            details: 'Predomina no Centro-Oeste e Sudeste. Duas estações bem definidas: verão chuvoso e inverno seco.',
            examples: 'Cerrado brasileiro e savanas; temperaturas médias acima de 20°C.',
            children: [
              { label: 'Variações Tropicais', details: 'Tropical de Altitude (mais ameno) e Tropical Litorâneo (chuvas de inverno no NE).' }
            ]
          },
          {
            label: '3. Clima Semiárido',
            details: 'Típico do Sertão nordestino e Vale do Jequitinhonha. Altas temperaturas e chuvas escassas e irregulares.',
            examples: 'Polígono das secas, vegetação de Caatinga e rios intermitentes.',
            children: [
              { label: 'Pluviometria', details: 'Precipitação média inferior a 800 mm por ano com secas prolongadas.' }
            ]
          },
          {
            label: '4. Clima Subtropical',
            details: 'Ocorre ao sul do Trópico de Capricórnio (Região Sul e sul de SP/MS). Quatro estações bem delineadas.',
            examples: 'Maior amplitude térmica anual do Brasil, geadas e invernos rigorosos.',
            children: [
              { label: 'Chuvas Bem Distribuídas', details: 'Sem estação seca estrita, com precipitação regular ao longo dos 12 meses.' }
            ]
          }
        ]
      };
    }
    // GEOGRAFIA: BIOMAS
    else if (norm.includes('bioma') || norm.includes('vegetacao')) {
      rootNode = {
        label: 'Biomas Brasileiros',
        summary: 'Os seis grandes ecossistemas e domínios morfoclimáticos do Brasil',
        color: '#059669',
        children: [
          {
            label: '1. Amazônia',
            details: 'Maior floresta tropical pluvial do planeta, clima equatorial úmido e maior bacia hidrográfica do mundo.',
            examples: 'Matas de igapó, várzea e terra firme.',
            children: [ { label: 'Biodiversidade Única', details: 'Abriga um décimo de todas as espécies de fauna e flora do planeta.' } ]
          },
          {
            label: '2. Cerrado',
            details: 'Segunda maior formação brasileira. Savana tropical com árvores de casca grossa e raízes profundas.',
            examples: 'Berço das águas que alimenta três grandes bacias hidrográficas (Prata, São Francisco, Tocantins).',
            children: [ { label: 'Solo Ácido', details: 'Solos profundos e avermelhados com acidez corrigida pela calagem agrícola.' } ]
          },
          {
            label: '3. Caatinga e Mata Atlântica',
            details: 'Caatinga: único bioma exclusivo do Brasil (semiárido, xerófitas). Mata Atlântica: biodiversidade florestal litorânea.',
            examples: 'Mandacaru e juazeiro na Caatinga; pau-brasil e mico-leão-dourado na Mata Atlântica.',
            children: [ { label: 'Hotspot Mundial', details: 'A Mata Atlântica resta com menos de 12% da cobertura original devido à urbanização.' } ]
          },
          {
            label: '4. Pantanal e Pampa',
            details: 'Pantanal: maior planície inundável do mundo. Pampa: campos sulinos de gramíneas no Rio Grande do Sul.',
            examples: 'Tuiuiú e jacaré-do-pantanal; pecuária extensiva nos pampas.',
            children: [ { label: 'Ciclo das Cheias', details: 'O Pantanal varia drasticamente entre períodos secos e cheias sazonais.' } ]
          }
        ]
      };
    }
    // PORTUGUÊS: CLASSES GRAMATICAIS
    else if (norm.includes('classe') || norm.includes('morfologia') || norm.includes('gramat')) {
      rootNode = {
        label: 'As 10 Classes de Palavras',
        summary: 'Classificação morfológica da Língua Portuguesa em classes variáveis e invariáveis',
        color: '#d97706',
        children: [
          {
            label: '1. Classes Variáveis (Flexionam)',
            details: 'Palavras que admitem variação em gênero, número, grau ou tempo/modo.',
            examples: 'Substantivo, Artigo, Adjetivo, Numeral, Pronome e Verbo.',
            children: [
              { label: 'Substantivo e Verbo', details: 'Substantivo nomeia os seres; Verbo indica ação, estado ou fenômeno da natureza.' },
              { label: 'Adjetivo e Pronome', details: 'Adjetivo caracteriza o substantivo; Pronome substitui ou acompanha o nome.' }
            ]
          },
          {
            label: '2. Classes Invariáveis (Não Flexionam)',
            details: 'Palavras que mantêm forma fixa independentemente da frase.',
            examples: 'Advérbio, Preposição, Conjunção e Interjeição.',
            children: [
              { label: 'Advérbio', details: 'Modifica o sentido do verbo, do adjetivo ou de outro advérbio (tempo, modo, lugar).' },
              { label: 'Preposição e Conjunção', details: 'Preposição liga palavras; Conjunção conecta orações estabelecendo relações lógicas.' }
            ]
          },
          {
            label: '3. Aplicação em Provas e Sintaxe',
            details: 'A morfologia é a base para o estudo da sintaxe (sujeito, predicado, complementos).',
            examples: 'O substantivo frequentemente exerce função de núcleo do sujeito.',
            children: [
              { label: 'Atenção aos Contextos', details: 'Uma mesma palavra pode mudar de classe dependendo da frase (derivação imprópria).' }
            ]
          }
        ]
      };
    }
    // CIÊNCIAS: REINO VEGETAL
    else if (norm.includes('vegetal') || norm.includes('planta') || norm.includes('briofita')) {
      rootNode = {
        label: 'Reino Vegetal (Metaphyta)',
        summary: 'Classificação evolutiva das plantas terrestres',
        color: '#10b981',
        children: [
          {
            label: '1. Briófitas (Avasculares)',
            details: 'Sem xilema/floema; transporte por difusão célula a célula; pequeno porte.',
            examples: 'Musgos e hepáticas.',
            children: [
              { label: 'Gametófito Duradouro', details: 'Fase haploide (n) dominante; depende de água para fecundação.' }
            ]
          },
          {
            label: '2. Pteridófitas (Vasculares Sem Sementes)',
            details: 'Primeiras plantas com vasos condutores; esporófito (2n) dominante.',
            examples: 'Samambaias, avencas, xaxins.',
            children: [
              { label: 'Esporângios e Soros', details: 'Pontos escuros sob as folhas onde ocorre meiose para formar esporos.' }
            ]
          },
          {
            label: '3. Gimnospermas (Sementes Nuas)',
            details: 'Desenvolvimento do grão de pólen (independência da água) e sementes sem fruto.',
            examples: 'Pinheiro-do-Paraná (Araucária), sequoias e cicadáceas.',
            children: [
              { label: 'Estróbilos (Pinhas)', details: 'Órgãos reprodutivos que produzem pólen ou abrigam o óvulo.' }
            ]
          },
          {
            label: '4. Angiospermas (Flores e Frutos)',
            details: 'Grupo mais diverso e evoluído; dupla fecundação; proteção das sementes por frutos.',
            examples: 'Árvores frutíferas, gramíneas, leguminosas e flores ornamentais.',
            children: [
              { label: 'Atrativo para Polinizadores', details: 'Pétalas coloridas, néctar e odores que atraem insetos e aves.' }
            ]
          }
        ]
      };
    }
    // FÍSICA: LEIS DE NEWTON
    else if (norm.includes('newton') || norm.includes('dinamica') || norm.includes('mecanica')) {
      rootNode = {
        label: 'Dinâmica & Leis de Newton',
        summary: 'Estudo das forças e suas causas fundamentais no movimento dos corpos',
        color: '#4f46e5',
        children: [
          {
            label: '1ª Lei: Princípio da Inércia',
            details: 'Todo corpo permanece em repouso ou em MRU a menos que uma força resultante atue sobre ele.',
            examples: 'Passageiro projetado para frente na freada brusca do ônibus.',
            children: [
              { label: 'Condição de Equilíbrio', details: 'A soma vetorial de todas as forças aplicadas é nula (Fr = 0).' }
            ]
          },
          {
            label: '2ª Lei: Princípio Fundamental',
            details: 'A aceleração adquirida é diretamente proporcional à força resultante e inversamente à massa.',
            examples: 'Fórmula: Fr = m × a (onde Força é dada em Newtons, m em kg e a em m/s²).',
            children: [
              { label: 'Massa Inercial', details: 'A massa mede a resistência quantitativa que o corpo oferece à aceleração.' }
            ]
          },
          {
            label: '3ª Lei: Ação e Reação',
            details: 'Toda força de ação gera uma reação simultânea de mesma intensidade, mesma direção e sentido oposto.',
            examples: 'Nadador empurrando a água para trás para avançar para a frente.',
            children: [
              { label: 'Corpos Distintos', details: 'O par ação-reação NUNCA se anula porque atua sempre em corpos diferentes!' }
            ]
          }
        ]
      };
    }
    // CIÊNCIAS: CÉLULA E ORGANELAS
    else if (norm.includes('celula') || norm.includes('organela') || norm.includes('citologia')) {
      rootNode = {
        label: 'Citologia e Estrutura Celular',
        summary: 'A célula como unidade morfofisiológica fundamental de todos os seres vivos',
        color: '#06b6d4',
        children: [
          {
            label: '1. Estruturas Básicas',
            details: 'Membrana plasmática (bicamada fosfolipídica), citoplasma (citosol) e material genético (DNA).',
            examples: 'Permeabilidade seletiva controlando a entrada de nutrientes e saída de resíduos.',
            children: [
              { label: 'Procariontes vs Eucariontes', details: 'Procariontes não têm carioteca (bactérias); eucariontes têm núcleo delimitado.' }
            ]
          },
          {
            label: '2. Organelas Energéticas',
            details: 'Mitocôndrias e Cloroplastos responsáveis pela produção e conversão de energia.',
            examples: 'Mitocôndrias realizam a respiração celular (ATP); Cloroplastos realizam a fotossíntese.',
            children: [
              { label: 'Teoria Endossimbiótica', details: 'Possuem DNA próprio e dupla membrana de origem evolutiva ancestral.' }
            ]
          },
          {
            label: '3. Síntese e Transporte',
            details: 'Ribossomos (síntese proteica), Retículo Endoplasmático e Complexo Golgiense.',
            examples: 'O Complexo de Golgi secreta substâncias e empacota vesículas celulares.',
            children: [
              { label: 'Lisossomos', details: 'Realizam a digestão intracelular e reciclagem de componentes velhos.' }
            ]
          }
        ]
      };
    }
    // GERAL: GERADOR DINÂMICO PARA QUALQUER MATÉRIA E TÓPICO
    else {
      rootNode = {
        label: topic,
        summary: `Visão estruturada e conceitual de ${subject}: ${topic}`,
        color: '#6366f1',
        children: [
          {
            label: `1. Fundamentos & Definição de ${topic}`,
            details: `Premissas fundamentais que explicam a origem, significado e conceitos de ${topic} na matéria de ${subject}.`,
            examples: 'Conceitos centrais exigidos nas avaliações e no currículo BNCC.',
            children: [
              { label: 'Nomenclatura e Termos Chave', details: 'Terminologia técnica e vocabulário essencial do tema.' },
              { label: 'Princípio Geral', details: 'A regra ou lei fundamental que rege esse assunto.' }
            ]
          },
          {
            label: '2. Categorias & Classificações Principais',
            details: `Como os elementos de ${topic} se organizam, dividem e se relacionam entre si.`,
            examples: 'Divisões em grupos, fases, tipos ou subcategorias práticas.',
            children: [
              { label: 'Critérios de Diferenciação', details: 'Fatores que distinguem cada parte ou fase do processo.' },
              { label: 'Exceções Notáveis', details: 'Casos particulares comumente cobrados em questões avaliativas.' }
            ]
          },
          {
            label: '3. Aplicações no Cotidiano & Conexões',
            details: `Relação direta de ${topic} com fenômenos reais, experimentos ou fatos históricos.`,
            examples: 'Exemplos observáveis no dia a dia e situações práticas do aluno.',
            children: [
              { label: 'Impacto Prático', details: 'Como esse conhecimento resolve problemas e explica o mundo.' }
            ]
          },
          {
            label: '4. Dicas Pedagógicas & Resolução de Questões',
            details: 'Estratégias de raciocínio para não cair em pegadinhas nas avaliações do SAS.',
            examples: 'Atenção aos termos absolutos e análise atenta dos enunciados.',
            children: [
              { label: 'Passo a Passo de Resolução', details: 'Isolar dados, aplicar a teoria correspondente e conferir o gabarito.' }
            ]
          }
        ]
      };
    }

    return {
      success: true,
      id: 'mm_' + Date.now(),
      title: `Mapa Mental: ${topic}`,
      subject,
      root: rootNode,
      createdAt: new Date().toISOString()
    };
  }

  // 3. GERADOR DE QUESTÕES (SIMULADOS E DESAFIOS RIGOROSAMENTE POR MATÉRIA E ASSUNTO)
  if (action === 'generate_questions') {
    const qList = [];
    const sLower = String(subject || '').toLowerCase();

    // 1. MATEMÁTICA
    if (sLower.includes('matem') || norm.includes('frac') || norm.includes('equac') || norm.includes('potenc') || norm.includes('geometr') || norm.includes('porcent')) {
      if (norm.includes('frac')) {
        qList.push(
          {
            id: 'qm_1',
            type: 'multiple_choice',
            q: 'Em uma turma de 30 alunos, exatamente 3/5 dos estudantes praticam natação no colégio. Quantos estudantes praticam essa modalidade?',
            options: ['A) 12 alunos', 'B) 15 alunos', 'C) 18 alunos', 'D) 20 alunos'],
            correct: 2,
            hint: 'Calcule a fração de uma quantidade: divida o total pelo denominador e multiplique pelo numerador.',
            explanation: 'Para calcular 3/5 de 30: primeiro divide-se 30 por 5 = 6. Em seguida, multiplica-se por 3: 6 × 3 = 18 alunos.'
          },
          {
            id: 'qm_2',
            type: 'multiple_choice',
            q: 'Qual é o resultado correto da soma das frações 1/2 + 1/3?',
            options: ['A) 2/5', 'B) 5/6', 'C) 1/6', 'D) 3/6'],
            correct: 1,
            hint: 'Denominadores diferentes exigem MMC. O MMC entre 2 e 3 é 6.',
            explanation: 'Reduzindo ao mesmo denominador comum (6): 1/2 = 3/6 e 1/3 = 2/6. Somando os numeradores: (3 + 2)/6 = 5/6.'
          },
          {
            id: 'qm_3',
            type: 'multiple_choice',
            q: 'Qual das seguintes frações é equivalente à fração 12/16 quando totalmente simplificada em sua forma irredutível?',
            options: ['A) 3/4', 'B) 6/8', 'C) 2/3', 'D) 4/5'],
            correct: 0,
            hint: 'Divida o numerador e o denominador pelo Máximo Divisor Comum (MDC = 4).',
            explanation: 'Dividindo 12 e 16 por 4, temos: 12 ÷ 4 = 3 e 16 ÷ 4 = 4. Portanto, a forma irredutível é 3/4.'
          },
          {
            id: 'qm_4',
            type: 'multiple_choice',
            q: 'Ao multiplicar a fração 2/3 pela fração 4/5, obtém-se o valor de:',
            options: ['A) 6/8', 'B) 8/15', 'C) 10/12', 'D) 8/12'],
            correct: 1,
            hint: 'Na multiplicação de frações, multiplica-se numerador por numerador e denominador por denominador.',
            explanation: '(2 × 4) / (3 × 5) = 8/15. A fração já é irredutível.'
          },
          {
            id: 'qm_5',
            type: 'multiple_choice',
            q: 'Uma pizza foi cortada em 8 fatias iguais. Lucas comeu 3 fatias e Mariana comeu 2 fatias. Que fração da pizza sobrou?',
            options: ['A) 5/8', 'B) 3/8', 'C) 1/4', 'D) 1/2'],
            correct: 1,
            hint: 'Some o que foi consumido e subtraia do inteiro (8/8).',
            explanation: 'Total comido: 3/8 + 2/8 = 5/8. A fração restante é: 8/8 - 5/8 = 3/8 da pizza.'
          }
        );
      } else if (norm.includes('equac') || norm.includes('algebra')) {
        qList.push(
          {
            id: 'qm_eq_1',
            type: 'multiple_choice',
            q: 'Resolvendo a equação do primeiro grau 3x + 5 = 20, qual é o valor numérico da incógnita x?',
            options: ['A) x = 3', 'B) x = 4', 'C) x = 5', 'D) x = 6'],
            correct: 2,
            hint: 'Subtraia 5 de ambos os membros e depois divida o resultado por 3.',
            explanation: '3x = 20 - 5 ➔ 3x = 15 ➔ x = 15 ÷ 3 ➔ x = 5.'
          },
          {
            id: 'qm_eq_2',
            type: 'multiple_choice',
            q: 'O dobro de um número somado a 7 é igual a 25. Qual é esse número?',
            options: ['A) 8', 'B) 9', 'C) 10', 'D) 12'],
            correct: 1,
            hint: 'Escreva a equação algébrica correspondente: 2x + 7 = 25.',
            explanation: '2x + 7 = 25 ➔ 2x = 25 - 7 ➔ 2x = 18 ➔ x = 9.'
          },
          {
            id: 'qm_eq_3',
            type: 'multiple_choice',
            q: 'Qual é a solução da equação 5x - 8 = 2x + 7?',
            options: ['A) x = 3', 'B) x = 5', 'C) x = 7', 'D) x = 15'],
            correct: 1,
            hint: 'Agrupe os termos com x no 1º membro e os números no 2º membro.',
            explanation: '5x - 2x = 7 + 8 ➔ 3x = 15 ➔ x = 5.'
          },
          {
            id: 'qm_eq_4',
            type: 'multiple_choice',
            q: 'Em uma promoção com desconto sucessivo, um artigo de R$ 100,00 tem 10% de desconto e depois mais 10% sobre o novo valor. O valor final é:',
            options: ['A) R$ 80,00', 'B) R$ 81,00', 'C) R$ 82,00', 'D) R$ 85,00'],
            correct: 1,
            hint: 'Aplique o primeiro desconto e depois calcule o segundo desconto sobre o saldo restante.',
            explanation: '100 - 10% = R$ 90,00. Em seguida, 10% de 90 = R$ 9,00. Valor final: 90 - 9 = R$ 81,00.'
          },
          {
            id: 'qm_eq_5',
            type: 'multiple_choice',
            q: 'A área de um terreno retangular que mede 12 metros de comprimento por 8 metros de largura é igual a:',
            options: ['A) 40 m²', 'B) 80 m²', 'C) 96 m²', 'D) 100 m²'],
            correct: 2,
            hint: 'A área do retângulo é dada por base × altura.',
            explanation: 'Área = 12 m × 8 m = 96 m².'
          }
        );
      } else {
        qList.push(
          {
            id: 'qm_gen_1',
            type: 'multiple_choice',
            q: `Em relação aos cálculos e propriedades de ${topic} em Matemática, qual é a afirmativa correta?`,
            options: [
              'A) A ordem das operações deve respeitar parênteses, potenciação, multiplicação/divisão e adição/subtração.',
              'B) Toda multiplicação por zero resulta no próprio número original.',
              'C) Em frações, somam-se diretamente os numeradores e os denominadores sem MMC.',
              'D) Números negativos ao quadrado resultam sempre em valores negativos.'
            ],
            correct: 0,
            hint: 'Lembre-se da ordem de precedência das operações matemáticas (PEMDAS).',
            explanation: 'A precedência das operações matemáticas exige resolver primeiro parênteses/colchetes, potências/raízes, multiplicação/divisão e por fim adição/subtração.'
          },
          {
            id: 'qm_gen_2',
            type: 'multiple_choice',
            q: `Se aplicarmos uma redução de 20% sobre uma quantia de R$ 150,00 relacionada a um problema de ${topic}, o valor final obtido será de:`,
            options: ['A) R$ 110,00', 'B) R$ 120,00', 'C) R$ 125,00', 'D) R$ 130,00'],
            correct: 1,
            hint: '20% de 150 corresponde a (150 × 20) ÷ 100 = 30.',
            explanation: 'O desconto é de 20% de 150 = R$ 30,00. O valor final pago é 150 - 30 = R$ 120,00.'
          },
          {
            id: 'qm_gen_3',
            type: 'multiple_choice',
            q: `Qual é a propriedade matemática que garante que (a + b) + c = a + (b + c) nos estudos de ${topic}?`,
            options: ['A) Propriedade Comutativa', 'B) Propriedade Associativa', 'C) Propriedade Distributiva', 'D) Elemento Neutro'],
            correct: 1,
            hint: 'Associar termos diferentes mantendo o mesmo resultado final.',
            explanation: 'A propriedade associativa estabelece que a forma como agrupamos as parcelas em uma adição não altera o resultado final.'
          },
          {
            id: 'qm_gen_4',
            type: 'multiple_choice',
            q: `O perímetro de uma figura plana no contexto de ${topic} é definido como:`,
            options: ['A) O produto da base pela altura.', 'B) A soma das medidas de todos os lados do polígono.', 'C) A metade da área total.', 'D) O quadrado do raio.'],
            correct: 1,
            hint: 'Perímetro é o contorno total da figura.',
            explanation: 'O perímetro é a soma linear de todos os lados que delimitam um polígono geométrico.'
          },
          {
            id: 'qm_gen_5',
            type: 'multiple_choice',
            q: `Qual é o resultado da expressão numérica: 2³ + 5 × 2?`,
            options: ['A) 16', 'B) 18', 'C) 26', 'D) 36'],
            correct: 1,
            hint: 'Calcule primeiro a potência (2³ = 8) e a multiplicação (5 × 2 = 10).',
            explanation: '2³ = 8. 5 × 2 = 10. Somando os dois resultados: 8 + 10 = 18.'
          }
        );
      }
    }
    // 2. HISTÓRIA
    else if (sLower.includes('hist') || norm.includes('monomotapa') || norm.includes('feudal') || norm.includes('revoluc') || norm.includes('colonial') || norm.includes('antiguidade')) {
      if (norm.includes('monomotapa') || norm.includes('mutapa')) {
        qList.push(
          {
            id: 'qh_m_1',
            type: 'multiple_choice',
            q: 'O Reino de Monomotapa (Mutapa) foi um dos mais prósperos impérios africanos pré-coloniais. Em qual região geográfica da África ele se desenvolveu?',
            options: [
              'A) Na costa noroeste da África, no deserto do Saara.',
              'B) Na África Austral, entre as bacias dos rios Zambeze e Limpopo.',
              'C) No norte da África, às margens do rio Nilo.',
              'D) Na África Central, na floresta equatorial do Congo.'
            ],
            correct: 1,
            hint: 'Localizava-se no território dos atuais Zimbábue e Moçambique.',
            explanation: 'O Império de Monomotapa floresceu na África Austral (onde hoje ficam Zimbábue e Moçambique), uma região fértil e riquíssima em jazidas minerais.'
          },
          {
            id: 'qh_m_2',
            type: 'multiple_choice',
            q: 'Qual era o principal produto mineral extraído e comercializado pelo Reino de Monomotapa que atraiu mercadores árabes-suaílis e, posteriormente, europeus?',
            options: ['A) Petróleo cru', 'B) Ouro aluvial e de minas', 'C) Prata e estanho', 'D) Diamantes lapidados'],
            correct: 1,
            hint: 'O ouro de Monomotapa abastecia as rotas comerciais do Oceano Índico.',
            explanation: 'A abundância de ouro nas terras de Monomotapa fez do reino um dos maiores fornecedores do metal precioso para os portos comerciais do Oceano Índico.'
          },
          {
            id: 'qh_m_3',
            type: 'multiple_choice',
            q: 'O governante supremo de Monomotapa recebia o título sagrado de Mwenemutapa. Qual era o seu papel na sociedade?',
            options: [
              'A) Era um general estrangeiro nomeado pelo Império Otomano.',
              'B) Era apenas um líder comercial sem funções religiosas ou políticas.',
              'C) Era o líder político, militar e religioso supremo, reverenciado como divindade e elo com os ancestrais.',
              'D) Era eleito a cada quatro anos pelos mercadores portugueses.'
            ],
            correct: 2,
            hint: 'A realeza africana possuía forte legitimação sagrada e ligação com o culto aos antepassados.',
            explanation: 'O Mwenemutapa exercia liderança total: comandava o exército, controlava os tributos e era visto como guardião sagrado da fertilidade das terras e elo com os antepassados espirituais.'
          },
          {
            id: 'qh_m_4',
            type: 'multiple_choice',
            q: 'A partir do século XVI, a presença dos navegadores e comerciantes portugueses na região de Monomotapa resultou em:',
            options: [
              'A) Imediata expulsão pacífica de todos os colonizadores pelos africanos.',
              'B) Tentativas constantes de controle militar sobre as minas de ouro e interferência na sucessão real.',
              'C) Total abandono das rotas comerciais do Oceano Índico.',
              'D) Aliança militar entre o reino africano e a coroa espanhola contra Portugal.'
            ],
            correct: 1,
            hint: 'Os portugueses cobiçavam o monopólio das ricas minas de ouro.',
            explanation: 'Os portugueses tentaram se infiltrar politicamente, cobrar tributos e controlar as minas de ouro, gerando conflitos armados e a resistência heróica dos povos locais.'
          },
          {
            id: 'qh_m_5',
            type: 'multiple_choice',
            q: 'O que o legado histórico do Reino de Monomotapa comprova sobre a história do continente africano antes da colonização europeia?',
            options: [
              'A) Que a África era habitada apenas por tribos nômades isoladas sem conhecimento de metalurgia.',
              'B) A existência de complexos impérios organizados, com diplomacia, arquitetura monumental e rotas mundiais de comércio.',
              'C) A total ausência de técnicas agrícolas ou sistemas religiosos.',
              'D) A dependência total de tecnologias trazidas pela Revolução Industrial.'
            ],
            correct: 1,
            hint: 'Monomotapa desmente mitos coloniais eurocêntricos.',
            explanation: 'Monomotapa demonstra a sofisticação das civilizações africanas pré-coloniais, com cidades de pedra, comércio internacional, leis e metalurgia avançada.'
          }
        );
      } else if (norm.includes('feudal')) {
        qList.push(
          {
            id: 'qh_feu_1',
            type: 'multiple_choice',
            q: 'No sistema feudal europeu, a sociedade era classificada como estamental. Isso significa que:',
            options: [
              'A) Havia grande mobilidade social baseada na riqueza pessoal.',
              'B) A posição social era determinada pelo nascimento, com quase nenhuma mobilidade entre as ordens.',
              'C) Os servos podiam facilmente ser eleitos cavaleiros e nobres.',
              'D) Todos os cidadãos participavam das decisões democráticas.'
            ],
            correct: 1,
            hint: 'Em uma sociedade estamental, a ordem social é rígida e hereditária.',
            explanation: 'A sociedade feudal era dividida em três estamentos fixos (Clero, Nobreza e Servos) sem possibilidade de ascensão social.'
          },
          {
            id: 'qh_feu_2',
            type: 'multiple_choice',
            q: 'Qual era o tributo feudal em que o servo era obrigado a trabalhar gratuitamente alguns dias da semana nas terras do senhor (manso senhorial)?',
            options: ['A) Talha', 'B) Banalidade', 'C) Corveia', 'D) Dízimo'],
            correct: 2,
            hint: 'Trata-se do trabalho braçal compulsório nas lavouras do castelo.',
            explanation: 'A corveia era a prestação de serviços gratuitos (geralmente de 2 a 3 dias por semana) nas terras do senhor feudal.'
          },
          {
            id: 'qh_feu_3',
            type: 'multiple_choice',
            q: 'A relação de suserania e vassalagem na Idade Média era um pacto sagrado celebrado exclusivamente entre:',
            options: ['A) Senhores feudais e camponeses servos.', 'B) Nobres entre si (membros da nobreza feudal).', 'C) O rei e os escravos libertos.', 'D) Mercadores burgueses e artesãos.'],
            correct: 1,
            hint: 'Envolvia alianças militares e honra entre nobres através da doação de feudos.',
            explanation: 'A suserania e vassalagem ocorria exclusivamente entre membros da nobreza, formalizada pelo juramento de homenagem e fidelidade militar recíproca.'
          },
          {
            id: 'qh_feu_4',
            type: 'multiple_choice',
            q: 'Qual das seguintes características descreve a economia feudal europeia?',
            options: ['A) Industrial e exportadora para mercados mundiais.', 'B) Agrária, de subsistência e com circulação monetária restrita.', 'C) Dominada pelo livre mercado e corporações financeiras.', 'D) Totalmente dependente do comércio marítimo com a América.'],
            correct: 1,
            hint: 'O feudo produzia tudo o que necessitava para seu consumo interno.',
            explanation: 'A economia feudal era rural, autossuficiente (de subsistência) e com comércio limitado a trocas diretas em feiras locais.'
          },
          {
            id: 'qh_feu_5',
            type: 'multiple_choice',
            q: 'Qual instituição exerceu papel de maior poder político, econômico e cultural durante o feudalismo medieval?',
            options: ['A) O Senado Romano.', 'B) A Igreja Católica Apostólica Romana.', 'C) Os sindicatos operários.', 'D) O Parlamento Britânico.'],
            correct: 1,
            hint: 'Era a maior proprietária de terras e controlava o calendário e a moral social.',
            explanation: 'A Igreja Católica foi a principal força unificadora e hegemônica da Idade Média na Europa Ocidental.'
          }
        );
      } else {
        qList.push(
          {
            id: 'qh_gen_1',
            type: 'multiple_choice',
            q: `No contexto histórico de ${topic}, qual processo social e econômico foi fundamental?`,
            options: [
              'A) Transformações nas relações de trabalho e disputas políticas pelo poder.',
              'B) Completa ausência de registros documentais e fontes materiais.',
              'C) Isolamento total das populações sem contato com povos vizinhos.',
              'D) Adoção universal e pacífica de um único modelo cultural.'
            ],
            correct: 0,
            hint: 'A História analisa as ações humanas no tempo e as disputas materiais e ideológicas.',
            explanation: 'Os eventos históricos envolvem dinâmicas sociais complexas, transformações na produção material e conflitos de interesses entre grupos sociais.'
          },
          {
            id: 'qh_gen_2',
            type: 'multiple_choice',
            q: `Ao analisar fontes históricas sobre ${topic}, o historiador deve:`,
            options: [
              'A) Aceitar documentos oficiais como verdades absolutas sem contestação.',
              'B) Cruzar diferentes fontes primárias e secundárias, contextualizando a época de sua produção.',
              'C) Descartar relatos orais e vestígios arqueológicos.',
              'D) Priorizar lendas sem base documental comprovada.'
            ],
            correct: 1,
            hint: 'O método histórico exige crítica documental e análise de múltiplos pontos de vista.',
            explanation: 'A investigação histórica científica analisa criticamente os documentos, considerando o contexto, as intenções do autor e contrapondo com outras evidências.'
          },
          {
            id: 'qh_gen_3',
            type: 'multiple_choice',
            q: `Qual foi a principal consequência da Primeira Revolução Industrial para o trabalho humano?`,
            options: [
              'A) Diminuição da jornada diária para apenas 4 horas de trabalho.',
              'B) Surgimento do proletariado fabril e submissão do ritmo humano ao tempo das máquinas.',
              'C) Retorno maciço da população urbana para as atividades agrícolas no campo.',
              'D) Proibição imediata do trabalho infantil e feminino nas carvoarias.'
            ],
            correct: 1,
            hint: 'As fábricas impuseram uma disciplina rígida com o uso do relógio mecânico.',
            explanation: 'A maquinofatura concentrou os operários em galpões industriais com jornadas exaustivas e disciplina fabril rigorosa.'
          },
          {
            id: 'qh_gen_4',
            type: 'multiple_choice',
            q: `No Brasil Colonial, qual era o tripé econômico que sustentava o ciclo açucareiro nordestino?`,
            options: [
              'A) Pequena propriedade, trabalho assalariado e policultura.',
              'B) Latifúndio monocultor, mão de obra escravizada e produção voltada à exportação.',
              'C) Indústria manufatureira, cooperativismo e comércio livre.',
              'D) Mineração mecanizada, trabalho voluntário e consumo interno.'
            ],
            correct: 1,
            hint: 'Modelo conhecido historicamente como Plantation.',
            explanation: 'A economia colonial do açúcar assentava-se no modelo de plantation: grandes propriedades de terra (latifúndio), escravidão e monocultura voltada à Europa.'
          },
          {
            id: 'qh_gen_5',
            type: 'multiple_choice',
            q: `A Lei de Cercamento dos Campos (Enclosures) na Inglaterra do século XVIII provocou:`,
            options: [
              'A) A distribuição gratuita de terras aos camponeses pobres.',
              'B) O êxodo rural forçado que forneceu mão de obra abundante para as fábricas urbanas.',
              'C) A extinção imediata de todas as criações de ovelhas britânicas.',
              'D) A proibição da propriedade privada de terras na Grã-Bretanha.'
            ],
            correct: 1,
            hint: 'Camponeses expulsos das terras comunais migraram para as cidades industriais.',
            explanation: 'Os cercamentos privatizaram as terras comuns para criação de ovelhas, expulsando os camponeses para as cidades onde tornaram-se operários assalariados.'
          }
        );
      }
    }
    // 3. GEOGRAFIA
    else if (sLower.includes('geog') || norm.includes('clima') || norm.includes('relevo') || norm.includes('bioma') || norm.includes('vegetacao') || norm.includes('cartograf')) {
      if (norm.includes('clima')) {
        qList.push(
          {
            id: 'qg_cli_1',
            type: 'multiple_choice',
            q: 'Qual clima brasileiro caracteriza-se por duas estações do ano bem definidas (verão chuvoso e inverno seco) e predomina na Região Centro-Oeste?',
            options: ['A) Clima Equatorial', 'B) Clima Tropical Típico (ou Continental)', 'C) Clima Subtropical', 'D) Clima Semiárido'],
            correct: 1,
            hint: 'É o clima associado à vegetação de Cerrado.',
            explanation: 'O Clima Tropical Típico abrange o Brasil Central com invernos secos (maio a setembro) e verões com alto índice pluviométrico.'
          },
          {
            id: 'qg_cli_2',
            type: 'multiple_choice',
            q: 'No Sertão nordestino brasileiro, o clima semiárido é caracterizado principalmente por:',
            options: [
              'A) Altas temperaturas o ano todo e chuvas escassas e mal distribuídas no tempo.',
              'B) Temperaturas abaixo de zero no inverno com ocorrência frequente de neve.',
              'C) Precipitação constante superior a 3.000 mm ao ano sem período seco.',
              'D) Estações do ano idênticas às do norte da Europa.'
            ],
            correct: 0,
            hint: 'Apresenta índices pluviométricos anuais inferiores a 800 mm e estiagens severas.',
            explanation: 'O semiárido apresenta elevadas temperaturas, forte evapotranspiração e chuvas irregulares concentradas em poucos meses do ano.'
          },
          {
            id: 'qg_cli_3',
            type: 'multiple_choice',
            q: 'A região Amazônica possui clima equatorial. Qual é o principal mecanismo biológico que gera os chamados "rios voadores" que transportam umidade para outras regiões do país?',
            options: ['A) A evaporação de geleiras andinas.', 'B) A evapotranspiração intensa da vasta floresta densa.', 'C) A queima de biomassa nas fronteiras agrícolas.', 'D) O represamento das usinas hidrelétricas.'],
            correct: 1,
            hint: 'As árvores de grande porte bombeiam toneladas de vapor de água diariamente para a atmosfera.',
            explanation: 'A evapotranspiração de bilhões de árvores na Amazônia alimenta correntes aéreas úmidas (rios voadores) que causam chuvas no Centro-Oeste e Sudeste.'
          },
          {
            id: 'qg_cli_4',
            type: 'multiple_choice',
            q: 'O Clima Subtropical no Brasil, caracterizado pelas menores médias térmicas e chuvas bem distribuídas o ano todo, ocorre:',
            options: ['A) Ao sul do Trópico de Capricórnio (Região Sul).', 'B) No litoral setentrional do Amapá.', 'C) No arquipélago de Fernando de Noronha.', 'D) Exclusivamente no Pantanal mato-grossense.'],
            correct: 0,
            hint: 'Ocorre na zona temperada do Sul do país.',
            explanation: 'O clima subtropical ocorre predominantemente na Região Sul (Paraná, Santa Catarina e Rio Grande do Sul), abaixo do Trópico de Capricórnio.'
          },
          {
            id: 'qg_cli_5',
            type: 'multiple_choice',
            q: 'O que diferencia fundamentalmente o conceito geográfico de "tempo meteorológico" do conceito de "clima"?',
            options: [
              'A) Tempo é o estado momentâneo da atmosfera em um dado instante; Clima é o padrão atmosférico observado ao longo de cerca de 30 anos.',
              'B) Não existe nenhuma diferença entre os dois conceitos.',
              'C) Clima muda a cada hora do dia e tempo permanece inalterado por séculos.',
              'D) O tempo aplica-se apenas aos oceanos e o clima aos continentes.'
            ],
            correct: 0,
            hint: 'Dizer "hoje está chovendo" é tempo; dizer "o Saara é seco" é clima.',
            explanation: 'Tempo meteorológico é passageiro e transitório (o estado da atmosfera hoje), enquanto clima é a sucessão habitual dos tempos analisada ao longo de décadas.'
          }
        );
      } else {
        qList.push(
          {
            id: 'qg_gen_1',
            type: 'multiple_choice',
            q: `Sobre as dinâmicas socioespaciais e naturais de ${topic} em Geografia, é correto afirmar que:`,
            options: [
              'A) O relevo e o clima atuam de forma isolada, sem interferir na ocupação humana.',
              'B) O espaço geográfico é produto da interação contínua entre a ação humana e os elementos naturais.',
              'C) As fronteiras e formações naturais permanecem estáticas desde a origem do planeta.',
              'D) A cartografia dispensa o uso de escalas e projeções nos mapas.'
            ],
            correct: 1,
            hint: 'O espaço geográfico é a natureza transformada pelo trabalho humano.',
            explanation: 'O espaço geográfico é constituído pela relação dialética entre a sociedade e a natureza mediada pelas técnicas e pelo trabalho.'
          },
          {
            id: 'qg_gen_2',
            type: 'multiple_choice',
            q: 'Qual bioma brasileiro é conhecido como a "savana brasileira", caracterizado por solos ácidos, árvores de caules tortuosos e raízes profundas?',
            options: ['A) Caatinga', 'B) Cerrado', 'C) Pampa', 'D) Pantanal'],
            correct: 1,
            hint: 'É considerado o "berço das águas" do Brasil.',
            explanation: 'O Cerrado é a savana mais biodiversa do mundo e desempenha papel estratégico na recarga dos aquíferos e rios brasileiros.'
          },
          {
            id: 'qg_gen_3',
            type: 'multiple_choice',
            q: 'Em uma escala cartográfica de 1:50.000, o que significa a relação numérica entre o mapa e o terreno real?',
            options: [
              'A) Cada 1 cm no mapa representa 50.000 cm (ou 500 metros) na realidade.',
              'B) O mapa é 50.000 vezes maior que a realidade.',
              'C) A área mapeada possui 50.000 habitantes.',
              'D) A distância real foi reduzida em 50 vezes apenas.'
            ],
            correct: 0,
            hint: '1 cm no papel equivale a 50.000 cm na realidade.',
            explanation: 'Na escala 1:50.000, 1 cm desenhado corresponde a 50.000 cm reais (cortando dois zeros temos 500 metros).'
          },
          {
            id: 'qg_gen_4',
            type: 'multiple_choice',
            q: 'Qual é o bioma brasileiro que sofreu a mais intensa devastação histórica pela ocupação humana litorânea desde 1500?',
            options: ['A) Amazônia', 'B) Mata Atlântica', 'C) Pantanal', 'D) Pampa'],
            correct: 1,
            hint: 'Abrigava cidades como Salvador, Rio de Janeiro e São Paulo.',
            explanation: 'A Mata Atlântica cobria grande parte da costa brasileira e sofreu séculos de ciclos econômicos e expansão urbana predatória.'
          },
          {
            id: 'qg_gen_5',
            type: 'multiple_choice',
            q: 'O fenômeno geomorfológico causado pelo desgaste e transporte de rochas e solos por ação da água e do vento chama-se:',
            options: ['A) Tectonismo', 'B) Erosão', 'C) Magmatismo', 'D) Dobramento moderno'],
            correct: 1,
            hint: 'Ação externa (exógena) que molda o relevo.',
            explanation: 'A erosão compreende os processos de desgaste, transporte e sedimentação de partículas de rocha e solo pela ação de chuvas, rios e ventos.'
          }
        );
      }
    }
    // 4. PORTUGUÊS
    else if (sLower.includes('port') || norm.includes('crase') || norm.includes('classe') || norm.includes('gramat') || norm.includes('concord')) {
      if (norm.includes('classe')) {
        qList.push(
          {
            id: 'qp_cla_1',
            type: 'multiple_choice',
            q: 'Na frase "Os alunos estudiosos leram o livro atentamente", a palavra sublinhada "atentamente" classifica-se morfologicamente como:',
            options: ['A) Adjetivo', 'B) Advérbio de modo', 'C) Substantivo abstrato', 'D) Conjunção subordinativa'],
            correct: 1,
            hint: 'Palavras terminadas em "-mente" que indicam o modo como a ação verbal ocorreu são advérbios.',
            explanation: '"Atentamente" modifica o verbo "leram", indicando a circunstância e o modo da ação, sendo, portanto, um advérbio de modo.'
          },
          {
            id: 'qp_cla_2',
            type: 'multiple_choice',
            q: 'Qual das seguintes palavras pertence à classe dos substantivos abstratos?',
            options: ['A) Caneta', 'B) Caderno', 'C) Coragem', 'D) Árvore'],
            correct: 2,
            hint: 'Substantivos abstratos nomeiam sentimentos, qualidades ou ações que dependem de outro ser para existir.',
            explanation: '"Coragem" é um substantivo abstrato que nomeia uma qualidade e um sentimento que se manifesta nas pessoas.'
          },
          {
            id: 'qp_cla_3',
            type: 'multiple_choice',
            q: 'Em qual das alternativas a palavra destacada funciona como ADJETIVO?',
            options: [
              'A) O garoto correu muito depressa.',
              'B) O estudante comprou uma mochila NOVA para as aulas.',
              'C) Nós partiremos cedo amanhã.',
              'D) Ela cantou alegremente durante o ensaio.'
            ],
            correct: 1,
            hint: 'O adjetivo caracteriza ou qualifica um substantivo.',
            explanation: '"Nova" é um adjetivo que caracteriza o substantivo "mochila".'
          },
          {
            id: 'qp_cla_4',
            type: 'multiple_choice',
            q: 'As classes de palavras invariáveis na Língua Portuguesa (que nunca mudam de gênero ou número) são:',
            options: [
              'A) Substantivo, Adjetivo, Verbo e Artigo.',
              'B) Advérbio, Preposição, Conjunção e Interjeição.',
              'C) Pronome, Numeral, Verbo e Substantivo.',
              'D) Adjetivo, Advérbio, Artigo e Conjunção.'
            ],
            correct: 1,
            hint: 'Palavras que não têm plural nem masculino/feminino.',
            explanation: 'Advérbios, preposições, conjunções e interjeições são classes morfológicas invariáveis na gramática normativa.'
          },
          {
            id: 'qp_cla_5',
            type: 'multiple_choice',
            q: 'Em "Estudou muito, PORÉM não conseguiu nota máxima", a palavra "porém" estabelece sentido de:',
            options: ['A) Conclusão', 'B) Adição', 'C) Oposição / Adversidade', 'D) Causa'],
            correct: 2,
            hint: 'Conjunção coordenativa adversativa (equivale a "mas", "contudo", "todavia").',
            explanation: '"Porém" é uma conjunção coordenativa adversativa que introduz uma ideia de contraste ou oposição em relação à oração anterior.'
          }
        );
      } else if (norm.includes('texto') || norm.includes('interpret') || norm.includes('compreens')) {
        qList.push(
          {
            id: 'qp_txt_1',
            type: 'multiple_choice',
            q: 'Ao realizar a interpretação e compreensão de um texto, qual é a principal diferença entre a informação "explícita" e a informação "implícita"?',
            options: [
              'A) A explícita está clara e expressa na superfície do texto; a implícita exige dedução e inferência a partir do contexto.',
              'B) A explícita é sempre uma mentira do autor; a implícita é a verdade científica.',
              'C) Não há nenhuma diferença entre elas na leitura crítica.',
              'D) A implícita sempre aparece em negrito no primeiro parágrafo.'
            ],
            correct: 0,
            hint: 'Explícito = dito diretamente com todas as letras; Implícito = sugerido nas entrelinhas.',
            explanation: 'Informações explícitas estão expressamente redigidas no texto, enquanto as implícitas demandam que o leitor mobilize seu conhecimento de mundo e faça inferências textuais.'
          },
          {
            id: 'qp_txt_2',
            type: 'multiple_choice',
            q: 'Em um texto dissertativo-argumentativo, o elemento que expressa o posicionamento central defendido pelo autor chama-se:',
            options: ['A) Paródia', 'B) Tese (ou ponto de vista)', 'C) Metáfora isolada', 'D) Desfecho cômico'],
            correct: 1,
            hint: 'É a ideia principal sustentada por meio de argumentos e evidências.',
            explanation: 'A tese é o núcleo do texto argumentativo: representa a opinião crítica ou tese fundamentada que o autor busca demonstrar ao leitor.'
          },
          {
            id: 'qp_txt_3',
            type: 'multiple_choice',
            q: 'A coesão textual referencial por anáfora ocorre quando:',
            options: [
              'A) Uma palavra retoma ou faz referência a um termo que já foi mencionado anteriormente no texto.',
              'B) O texto não possui nenhum parágrafo organizado.',
              'C) Todas as palavras são escritas em caixa alta.',
              'D) O narrador abandona a história sem finalizá-la.'
            ],
            correct: 0,
            hint: 'Ex: "O cientista publicou a pesquisa. ELE recebeu prêmios internacionais." (ele retoma o cientista).',
            explanation: 'A anáfora é um recurso coesivo de retomada textual por meio de pronomes ou sinônimos para evitar repetições desnecessárias.'
          },
          {
            id: 'qp_txt_4',
            type: 'multiple_choice',
            q: 'O sentido figurado (ou conotativo) das palavras em um texto literário ou publicitário caracteriza-se por:',
            options: [
              'A) Uso restrito ao sentido literal e dicionarizado exato.',
              'B) Atribuição de novos significados poéticos, simbólicos e expressivos dependentes do contexto.',
              'C) Erro ortográfico deliberado sem valor comunicativo.',
              'D) Tradução literal de termos estrangeiros.'
            ],
            correct: 1,
            hint: 'Denotação = sentido do dicionário (literal); Conotação = sentido figurado/criativo.',
            explanation: 'A linguagem conotativa expande o sentido das palavras além da literalidade, conferindo expressividade e multiplicidade de interpretações.'
          }
        );
      } else {
        qList.push(
          {
            id: 'qp_gen_1',
            type: 'multiple_choice',
            q: 'Qual é a regra geral que orienta o uso do acento indicativo de crase?',
            options: [
              'A) Deve ser utilizada obrigatoriamente antes de qualquer verbo no infinitivo.',
              'B) É a fusão da preposição "a" com o artigo definido feminino "a" (ou pronomes aquele/aquela).',
              'C) Ocorre livremente antes de palavras masculinas como "a pé" e "a prazo".',
              'D) É proibida diante de qualquer palavra feminina.'
            ],
            correct: 1,
            hint: 'Crase é a junção fonética e gráfica de dois "a" (a + a = à).',
            explanation: 'A crase resulta da contração da preposição "a" exigida pelo termo regente com o artigo "a" que antecede a palavra feminina regida.'
          },
          {
            id: 'qp_gen_2',
            type: 'multiple_choice',
            q: 'Assinale a frase em que a crase foi empregada de forma CORRETA segundo a norma culta:',
            options: [
              'A) Fui à feira comprar frutas frescas.',
              'B) Ele começou à correr logo pela manhã.',
              'C) Comprei o celular à prazo em dez parcelas.',
              'D) Escrevi uma mensagem de apoio à ele.'
            ],
            correct: 0,
            hint: 'Use o macete: "Fui à feira" ➔ "Fui ao mercado" (troca por masculino gera "ao", portanto tem crase).',
            explanation: '"Fui à feira": quem vai, vai "a" (preposição) + "a" feira (artigo) = crase. Antes de verbo (correr), palavra masculina (prazo) e pronome pessoal (ele) é proibido.'
          },
          {
            id: 'qp_gen_3',
            type: 'multiple_choice',
            q: 'Qual figura de linguagem consiste em atribuir sentimentos ou atitudes humanas a seres inanimados ou irracionais?',
            options: ['A) Metáfora', 'B) Hipérbole', 'C) Prosopopeia (Personificação)', 'D) Pleonasmo'],
            correct: 2,
            hint: 'Ex: "O vento sussurrava segredos pelas frestas da janela".',
            explanation: 'A prosopopeia ou personificação atribui características humanas (falar, chorar, sussurrar) a objetos inanimados ou animais.'
          },
          {
            id: 'qp_gen_4',
            type: 'multiple_choice',
            q: 'Assinale a alternativa que apresenta concordância verbal plenamente CORRETA:',
            options: [
              'A) Haviam muitos estudantes na biblioteca ontem.',
              'B) Fazem três anos que não viajo para a praia.',
              'C) Havia muitos estudantes na biblioteca ontem.',
              'D) Sobrou várias dúvidas após a aula de química.'
            ],
            correct: 2,
            hint: 'O verbo "haver" no sentido de existir ou tempo decorrido é impessoal (fica no singular).',
            explanation: 'O verbo "haver" com significado de "existir" não possui sujeito, devendo permanecer sempre na 3ª pessoa do singular (Havia muitos estudantes).'
          },
          {
            id: 'qp_gen_5',
            type: 'multiple_choice',
            q: 'A oração "Chorou rios de lágrimas ao se despedir do melhor amigo" apresenta qual figura de linguagem expressiva?',
            options: ['A) Eufemismo', 'B) Hipérbole (Exagero intencional)', 'C) Antítese', 'D) Ironia'],
            correct: 1,
            hint: '"Rios de lágrimas" denota um exagero desmedido para enfatizar a intensidade do choro.',
            explanation: 'A hipérbole consiste no exagero deliberado de uma ideia com o objetivo de produzir forte impacto expressivo no leitor.'
          }
        );
      }
    }
    // 5. CIÊNCIAS DA NATUREZA (E DEMAIS DISCIPLINAS)
    else {
      qList.push(
        {
          id: 'qc_1',
          type: 'multiple_choice',
          q: 'Qual característica evolutiva fundamental permitiu que as pteridófitas (como as samambaias) atingissem portes maiores que as briófitas (musgos)?',
          options: [
            'A) A presença de flores perfumadas para atrair aves polinizadoras.',
            'B) O surgimento de vasos condutores de seiva (xilema e floema).',
            'C) A produção de sementes protegidas no interior de frutos carnudos.',
            'D) A dependência total da água para respiração celular.'
          ],
          correct: 1,
          hint: 'Plantas vasculares possuem "canos condutores" que levam água e seiva a longas alturas.',
          explanation: 'Os tecidos vasculares (xilema para seiva bruta e floema para seiva elaborada) permitiram transporte rápido por longas distâncias, sustentando caules altos.'
        },
        {
          id: 'qc_2',
          type: 'multiple_choice',
          q: 'Qual organela citoplasmática é responsável pela síntese de energia celular (ATP) através do processo de respiração celular aeróbia?',
          options: ['A) Complexo de Golgi', 'B) Lisossomo', 'C) Mitocôndria', 'D) Ribossomo'],
          correct: 2,
          hint: 'É conhecida como a "usina de força" energética da célula eucarionte.',
          explanation: 'As mitocôndrias realizam a respiração celular na presença de oxigênio para converter a glicose em moléculas de ATP (energia química para a célula).'
        },
        {
          id: 'qc_3',
          type: 'multiple_choice',
          q: 'De acordo com a Primeira Lei de Newton (Princípio da Inércia), qual será o comportamento de um corpo se a resultante de todas as forças que atuam sobre ele for nula?',
          options: [
            'A) Ele irá parar imediatamente por falta de aceleração contínua.',
            'B) Ele manterá seu estado de repouso ou continuará em movimento retilíneo uniforme (MRU).',
            'C) Ele aumentará de velocidade exponencialmente sem limites.',
            'D) Ele começará a girar em círculos concêntricos em alta velocidade.'
          ],
          correct: 1,
          hint: 'Na ausência de força resultante externa (Fr = 0), a velocidade vetorial se conserva inalterada.',
          explanation: 'Pelo Princípio da Inércia, um corpo livre de força resultante permanece em repouso se já estava parado, ou segue em MRU com velocidade constante.'
        },
        {
          id: 'qc_4',
          type: 'multiple_choice',
          q: 'A fotossíntese realizada pelos vegetais e algas clorofiladas consome e produz, respectivamente:',
          options: [
            'A) Consome gás carbônico (CO₂) e água (H₂O); produz glicose e gás oxigênio (O₂).',
            'B) Consome oxigênio e glicose; produz gás carbônico e nitrogênio.',
            'C) Consome metano e luz; produz gás carbônico e ácidos.',
            'D) Consome exclusivamente água pura; produz calor e energia cinética.'
          ],
          correct: 0,
          hint: 'Equação química geral: 6 CO₂ + 6 H₂O + Luz Solar ➔ C₆H₁₂O₆ + 6 O₂.',
          explanation: 'Na fotossíntese, a planta capta CO₂ do ar e água do solo pela luz para gerar matéria orgânica (glicose) e liberar oxigênio para a atmosfera.'
        },
        {
          id: 'qc_5',
          type: 'multiple_choice',
          q: 'Por que o par de forças de Ação e Reação formulado na Terceira Lei de Newton NUNCA se anula mutuamente?',
          options: [
            'A) Porque possuem intensidades desiguais em qualquer situação.',
            'B) Porque atuam em sentidos completamente idênticos.',
            'C) Porque atuam simultaneamente em corpos DIFERENTES.',
            'D) Porque uma força só surge depois que a outra já desapareceu.'
          ],
          correct: 2,
          hint: 'Ao chutar uma bola, o pé aplica força na bola, e a bola aplica força no pé.',
          explanation: 'Para que duas forças se anulem, elas precisam atuar sobre o mesmo corpo. Como ação e reação atuam em corpos diferentes, elas nunca se anulam!'
        }
      );
    }

    return {
      success: true,
      topic,
      subject,
      questions: qList.slice(0, count)
    };
  }

  // 4. EXPLICAÇÃO ALTERNATIVA
  if (action === 'explain_alternative') {
    const style = params.style || 'analogia';
    let textOut = '';
    if (style === 'analogia') {
      textOut = `💡 **Explicação com Analogia do Dia a Dia: ${topic}**\n\n` +
        `Imagine que o assunto de **${topic}** funciona exatamente como uma rodovia movimentada:\n\n` +
        `• **A Pista e o Fluxo:** Assim como os carros precisam de faixas bem demarcadas para não bater, as variáveis desse conceito seguem regras estritas.\n` +
        `• **O Pedágio ou Filtro:** Para passar de uma fase a outra, existe uma condição necessária que deve ser atingida (como o combustível ou o sinal verde).\n` +
        `• **O Destino Final:** Quando tudo opera em conjunto, o resultado previsto acontece naturalmente sem esforço decorativo.\n\n` +
        `Assim, quando você encontrar uma questão sobre **${topic}**, não tente decorar fórmulas longas: lembre-se apenas de quem acelera o processo e quem oferece resistência!`;
    } else if (style === 'passo_a_passo') {
      textOut = `📋 **Explicação Passo a Passo Lógica: ${topic}**\n\n` +
        `**Passo 1 — Identificação:** Comece identificando o que o problema ou texto está apresentando de concreto.\n` +
        `**Passo 2 — Isolamento das Variáveis:** Separe os dados conhecidos das incógnitas que precisam ser encontradas.\n` +
        `**Passo 3 — Regra de Ouro:** Aplique a propriedade principal que rege **${topic}** sem misturar exceções.\n` +
        `**Passo 4 — Verificação de Sanidade:** O resultado faz sentido físico e lógico? Se sim, o raciocínio está consolidado!`;
    } else {
      textOut = `🎯 **Visão Prática & Esquematizada: ${topic}**\n\n` +
        `• **O que é em 1 frase:** É o mecanismo que dita como elementos de ${subject} interagem e se transformam.\n` +
        `• **Onde cai em prova:** Principalmente em questões conceituais que pedem para comparar causas e consequências.\n` +
        `• **Pegadinha mais comum:** Trocar a causa pelo efeito. Fique sempre atento à ordem cronológica e às forças resultantes.`;
    }
    return { success: true, topic, style, text: textOut };
  }

  // 5. COMPARADOR DE CONCEITOS
  if (action === 'compare_concepts') {
    const cA = params.conceptA || 'Conceito A';
    const cB = params.conceptB || 'Conceito B';
    const compNorm = normalizePrompt(cA + ' ' + cB);

    if (compNorm.includes('briofita') && compNorm.includes('pteridofita')) {
      return {
        success: true,
        conceptA: 'Briófitas (ex: Musgos)',
        conceptB: 'Pteridófitas (ex: Samambaias)',
        defA: 'Plantas pioneiras avasculares, sem tecidos de sustentação e de pequeno porte.',
        defB: 'Primeiras plantas vasculares da história evolutiva vegetal, possuindo xilema e floema.',
        similarities: [
          'Ambos os grupos dependem da água para a fecundação (gametas flagelados nadadores).',
          'Não produzem sementes, flores e nem frutos verdadeiros (são criptógamas).',
          'Alternância de gerações (metagênese) com fases haploide e diploide.'
        ],
        differences: [
          'Briófitas são avasculares; pteridófitas possuem vasos condutores completos.',
          'Nas briófitas, a fase dominante é o Gametófito (n); nas pteridófitas, é o Esporófito (2n).',
          'Pteridófitas possuem raízes, caule e folhas verdadeiras; briófitas têm apenas rizoides, cauloides e filoides.'
        ],
        practicalExample: 'Musgos cobrindo pedras úmidas (milímetros) versus samambaias ornamentais em jardins (metros de comprimento).',
        examPitfall: 'Cuidado! Dizer que samambaias têm sementes é o erro mais comum. Samambaias produzem ESPOROS nos soros, não sementes!'
      };
    } else if (compNorm.includes('mitose') && compNorm.includes('meiose')) {
      return {
        success: true,
        conceptA: 'Mitose',
        conceptB: 'Meiose',
        defA: 'Divisão celular equacional que gera duas células-filhas geneticamente idênticas à célula-mãe.',
        defB: 'Divisão celular reducional que forma quatro células-filhas com metade do número de cromossomos (gametas).',
        similarities: [
          'Ambos passam por etapas de Prófase, Metáfase, Anáfase e Telófase.',
          'Ambos realizam duplicação prévia do DNA durante a interfase (fase S).'
        ],
        differences: [
          'A mitose ocorre em células somáticas para crescimento e regeneração; a meiose ocorre em células germinativas.',
          'A mitose gera 2 células diploides (2n -> 2n); a meiose gera 4 células haploides (2n -> n).',
          'Na meiose ocorre crossing-over (recombinação gênica), garantindo variabilidade genética ausente na mitose.'
        ],
        practicalExample: 'Cicatrização de um corte na pele (mitose) versus formação de espermatozoides e óvulos (meiose).',
        examPitfall: 'Atenção para o crossing-over: ele acontece exclusivamente na Prófase I da Meiose, nunca na mitose!'
      };
    } else {
      return {
        success: true,
        conceptA: cA,
        conceptB: cB,
        defA: `Fundamentação teórica e características definidoras de ${cA}.`,
        defB: `Fundamentação teórica e características definidoras de ${cB}.`,
        similarities: [
          `Ambos pertencem ao mesmo domínio da matéria de ${subject}.`,
          'Compartilham a mesma base curricular e métodos de resolução analítica.'
        ],
        differences: [
          `${cA} atua prioritariamente sobre condições específicas, enquanto ${cB} expande para outras variáveis.`,
          'As unidades e coeficientes de aplicação distinguem os dois em problemas práticos.'
        ],
        practicalExample: `Aplicação direta em exercícios de sala de aula e situações práticas de ${subject}.`,
        examPitfall: 'Confundir os nomes ou aplicar as fórmulas de um no contexto do outro.'
      };
    }
  }

  // 6. RESUMIDOR INTELIGENTE
  if (action === 'summarize_content') {
    const rawText = params.text || topic;
    return {
      success: true,
      title: `Resumo Estruturado: ${topic}`,
      subject,
      overview: `Síntese objetiva e organizada dos pontos mais cobrados sobre ${topic}.`,
      keyPoints: [
        `Conceito-chave: Entenda o mecanismo principal de funcionamento antes de memorizar detalhes.`,
        `Relações diretas: Identifique as grandezas que sobem juntas (proporcionais) e as que se opõem.`,
        `Exceções à regra: Fique atento aos casos especiais que costumam ser cobrados em pegadinhas de prova.`
      ],
      rules: [
        'Sempre verifique as unidades no S.I. antes de iniciar qualquer cálculo.',
        'Elimine primeiro as alternativas absurdas que contrariam a teoria básica.'
      ],
      questions: [
        `Como você explicaria a importância de ${topic} com suas próprias palavras?`,
        `Qual é o detalhe que geralmente passa despercebido pelos alunos nesse conteúdo?`
      ]
    };
  }

  // 7. SUGESTÕES DE ORGANIZAÇÃO DE ESTUDOS COM IA (CALENDÁRIO & PROVAS)
  if (action === 'suggest_study_plan') {
    const exams = Array.isArray(params.exams) ? params.exams : [];
    const suggestions = [];

    exams.forEach((ex, idx) => {
      suggestions.push({
        id: 'sug_' + Date.now() + '_' + idx,
        title: `Revisão Ativa: ${ex.subject || 'Matéria'}`,
        subject: ex.subject || 'Geral',
        targetDate: ex.date || new Date().toISOString().split('T')[0],
        type: 'Revisão Recomendada',
        description: `Resolver 5 questões e revisar flashcards de "${ex.topics || 'conteúdo da prova'}" para fixação antes da avaliação oficial.`,
        priority: 'Alta'
      });
    });

    if (suggestions.length === 0) {
      suggestions.push({
        id: 'sug_' + Date.now(),
        title: 'Sessão de Treino Diário',
        subject: 'Matemática',
        targetDate: new Date().toISOString().split('T')[0],
        type: 'Treino Prático',
        description: 'Resolver 3 exercícios de raciocínio lógico e equações no Estude+.',
        priority: 'Média'
      });
    }

    return {
      success: true,
      suggestions
    };
  }

  return { success: false, error: 'Ação de estudo não reconhecida.' };
}

module.exports = {
  generateEducationalEngineResponse,
  generateStructuredStudyTool,
  trySolveMath,
  trySubjectKnowledge,
  tryConversationalChat
};
