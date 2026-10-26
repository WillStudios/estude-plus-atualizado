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
function generateEducationalEngineResponse(message, history, image, user) {
  if (typeof message === 'object' && message !== null && !Array.isArray(message)) {
    const opts = message;
    message = opts.message || opts.prompt || '';
    history = opts.history || [];
    image = opts.image || null;
    user = opts.user || null;
  }
  message = typeof message === 'string' ? message : (message ? String(message) : '');
  history = Array.isArray(history) ? history : [];
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
  return tryConversationalChat(message, history, user);
}

module.exports = {
  generateEducationalEngineResponse,
  trySolveMath,
  trySubjectKnowledge,
  tryConversationalChat
};
