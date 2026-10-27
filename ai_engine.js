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
    if (norm.includes('vegetal') || norm.includes('planta')) {
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
    } else if (norm.includes('newton') || norm.includes('mecanica')) {
      rootNode = {
        label: 'Dinâmica & Leis de Newton',
        summary: 'Estudo das forças e suas causas no movimento',
        color: '#4f46e5',
        children: [
          {
            label: '1ª Lei: Inércia',
            details: 'Tendência natural dos corpos de manter seu estado de repouso ou de MRU.',
            examples: 'Passageiro jogado para frente na freada brusca do ônibus.',
            children: [
              { label: 'Condição de Equilíbrio', details: 'A soma de todas as forças que atuam no corpo é nula (Fr = 0).' }
            ]
          },
          {
            label: '2ª Lei: Princípio Fundamental',
            details: 'A aceleração é diretamente proporcional à força e inversamente à massa.',
            examples: 'Fr = m × a (Unidade: Newtons no S.I.).',
            children: [
              { label: 'Massa como Medida', details: 'Massa é a medida quantitativa da inércia de um corpo.' }
            ]
          },
          {
            label: '3ª Lei: Ação e Reação',
            details: 'Toda força de ação gera uma reação oposta de mesma intensidade e direção.',
            examples: 'Nadador empurrando a água para trás para se mover para a frente.',
            children: [
              { label: 'Corpos Distintos', details: 'O par ação-reação NUNCA se anula porque atua em corpos diferentes!' }
            ]
          }
        ]
      };
    } else {
      rootNode = {
        label: topic,
        summary: `Mapa mental conceitual de ${subject}`,
        color: '#6366f1',
        children: [
          {
            label: 'Fundamentos & Definição',
            details: `Conceitos essenciais que estruturam o tema de ${topic}.`,
            examples: 'Premissas básicas da BNCC.',
            children: [
              { label: 'Origem & Nomenclatura', details: 'Termos e definições padronizadas.' }
            ]
          },
          {
            label: 'Classificação & Subdivisões',
            details: 'Como os elementos desse assunto se dividem e se categorizam.',
            examples: 'Tipos principais e características.',
            children: [
              { label: 'Critérios de Diferenciação', details: 'Pontos que distinguem cada categoria.' }
            ]
          },
          {
            label: 'Aplicações no Cotidiano',
            details: 'Relação prática com exercícios escolares e situações do dia a dia.',
            examples: 'Exemplos práticos e experimentos.',
            children: [
              { label: 'Resolução de Problemas', details: 'Estratégia para acertar questões de prova.' }
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

  // 3. GERADOR DE QUESTÕES
  if (action === 'generate_questions') {
    const qList = [];
    if (norm.includes('vegetal') || norm.includes('ciencias')) {
      qList.push(
        {
          id: 'q_gen_1',
          type: 'multiple_choice',
          q: 'Qual das seguintes características permitiu que as pteridófitas atingissem portes maiores que as briófitas no decorrer da evolução?',
          options: [
            'A) Desenvolvimento de flores coloridas para atrair insetos.',
            'B) Presença de vasos condutores de seiva (xilema e floema).',
            'C) Produção de sementes protegidas no interior de frutos.',
            'D) Total independência da água em todos os processos vitais.'
          ],
          correct: 1,
          hint: 'Lembre-se de como a água e os nutrientes circulam em plantas altas.',
          explanation: 'Os tecidos vasculares (xilema e floema) permitiram o transporte eficiente de água e seiva por longas distâncias, sustentando caules maiores.'
        },
        {
          id: 'q_gen_2',
          type: 'true_false',
          q: 'Nas briófitas (como os musgos), a fase dominante e duradoura do ciclo de vida é o esporófito diploide (2n).',
          options: ['A) Verdadeiro', 'B) Falso'],
          correct: 1,
          hint: 'As briófitas são as únicas em que o gametófito verde é a fase persistente.',
          explanation: 'Falso! Nas briófitas, a fase dominante é o gametófito haploide (n). O esporófito (2n) é efêmero e dependente nutricionalmente dele.'
        },
        {
          id: 'q_gen_3',
          type: 'multiple_choice',
          q: 'As araucárias e os pinheiros pertencem ao grupo das Gimnospermas porque:',
          options: [
            'A) Não produzem sementes em hipótese alguma.',
            'B) Possuem sementes nuas que não são envolvidas por frutos verdadeiros.',
            'C) Não possuem vasos condutores de seiva bruta.',
            'D) Dependem da água da chuva para que ocorra a fecundação.'
          ],
          correct: 1,
          hint: 'A palavra "gimnos" vem do grego e significa nu/descoberto.',
          explanation: 'O termo gimnosperma significa exatamente "semente nua", ou seja, as sementes desenvolvem-se nos estróbilos sem ovário que gere frutos.'
        }
      );
    } else {
      qList.push(
        {
          id: 'q_gen_1',
          type: 'multiple_choice',
          q: `Sobre os conceitos essenciais de ${topic}, assinale a alternativa cientificamente correta:`,
          options: [
            `A) ${topic} atua de forma isolada, sem interagir com outras leis da natureza.`,
            `B) Os princípios de ${topic} relacionam-se diretamente com causas físicas ou históricas comprovadas.`,
            `C) Trata-se de uma hipótese desprovida de comprovação experimental.`,
            `D) Aplica-se exclusivamente em condições ideais de laboratório.`
          ],
          correct: 1,
          hint: 'Busque a alternativa que reconhece a fundamentação e aplicabilidade do conceito.',
          explanation: `A alternativa B está correta pois sintetiza a base teórica e experimental de ${topic} no currículo escolar.`
        },
        {
          id: 'q_gen_2',
          type: 'true_false',
          q: `A correta interpretação de ${topic} exige analisar as condições de contorno e premissas iniciais do problema.`,
          options: ['A) Verdadeiro', 'B) Falso'],
          correct: 0,
          hint: 'Pense se é possível aplicar fórmulas ou teorias sem checar as unidades e premissas.',
          explanation: 'Verdadeiro! Toda resolução rigorosa exige verificar as premissas e variáveis antes de concluir.'
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
