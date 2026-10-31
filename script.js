'use strict';

/* ========== DADOS (preços em centavos para evitar erros de ponto flutuante) ========== */
const CHAVE = 'penguim-express:v1';
const TAXA_ENTREGA = 600;
const FRETE_GRATIS = 6000;
const QTD_MAX = 99;

const PAES = [
  { id: 'brioche', nome: 'Brioche', preco: 400 },
  { id: 'australiano', nome: 'Australiano', preco: 500 },
  { id: 'integral', nome: 'Integral', preco: 450 },
];
const CARNES = [
  { id: 'bovino', nome: 'Bovino 150g', preco: 1400 },
  { id: 'frango', nome: 'Frango grelhado', preco: 1200 },
  { id: 'vegetal', nome: 'Vegetal', preco: 1300 },
];
const EXTRAS = [
  { id: 'queijo', nome: 'Queijo', preco: 300 },
  { id: 'bacon', nome: 'Bacon', preco: 400 },
  { id: 'ovo', nome: 'Ovo', preco: 250 },
  { id: 'cebola', nome: 'Cebola crispy', preco: 250 },
  { id: 'salada', nome: 'Alface e tomate', preco: 150 },
  { id: 'molho', nome: 'Molho especial', preco: 150 },
  { id: 'geleia', nome: 'Geleia apimentada', preco: 350 },
];
const CATEGORIAS = ['Lanches', 'Acompanhamentos', 'Bebidas', 'Sobremesas'];
const MENU = [
  { id: 'xburger', cat: 'Lanches', emoji: '🍔', nome: 'X-Burger', desc: 'Hambúrguer, queijo e molho da casa.', preco: 2200 },
  { id: 'xsalada', cat: 'Lanches', emoji: '🥬', nome: 'X-Salada', desc: 'Hambúrguer, queijo, alface e tomate.', preco: 2400 },
  { id: 'crispy', cat: 'Lanches', emoji: '🐔', nome: 'Chicken Crispy', desc: 'Frango empanado e maionese temperada.', preco: 2300 },
  { id: 'apimentado', cat: 'Lanches', emoji: '🌶️', nome: 'Especial apimentado', desc: 'Hambúrguer, jalapeño, queijo e molho picante.', preco: 2600 },
  { id: 'surpresa', cat: 'Lanches', emoji: '🐧', nome: 'Pinguim surpresa', desc: 'Brioche, bovino e todos os adicionais, inclusive a geleia apimentada.', preco: PAES[0].preco + CARNES[0].preco + EXTRAS.reduce((s, x) => s + x.preco, 0), completo: true },
  { id: 'batata', cat: 'Acompanhamentos', emoji: '🍟', nome: 'Batata frita', desc: 'Porção média, bem crocante.', preco: 1200 },
  { id: 'onion', cat: 'Acompanhamentos', emoji: '🧅', nome: 'Onion rings', desc: '10 anéis empanados.', preco: 1400 },
  { id: 'batatapic', cat: 'Acompanhamentos', emoji: '🔥', nome: 'Batata apimentada', desc: 'Porção média com tempero de pimenta.', preco: 1400 },
  { id: 'nuggets', cat: 'Acompanhamentos', emoji: '🍗', nome: 'Nuggets', desc: '10 unidades com molho barbecue.', preco: 1600 },
  { id: 'refri', cat: 'Bebidas', emoji: '🥤', nome: 'Refrigerante lata', desc: '350 ml, bem gelado.', preco: 600 },
  { id: 'suco', cat: 'Bebidas', emoji: '🍊', nome: 'Suco natural', desc: 'Laranja, 400 ml.', preco: 900 },
  { id: 'agua', cat: 'Bebidas', emoji: '💧', nome: 'Água mineral', desc: '500 ml, sem gás.', preco: 400 },
  { id: 'polar', cat: 'Bebidas', emoji: '🧊', nome: 'Gelo polar', desc: 'Limonada suíça bem gelada, 400 ml.', preco: 1000 },
  { id: 'shake', cat: 'Bebidas', emoji: '🥛', nome: 'Milk-shake', desc: 'Chocolate ou morango, 400 ml.', preco: 1500 },
  { id: 'brownie', cat: 'Sobremesas', emoji: '🍫', nome: 'Brownie', desc: 'Com calda de chocolate.', preco: 1100 },
  { id: 'sorvete', cat: 'Sobremesas', emoji: '🍦', nome: 'Sorvete', desc: 'Casquinha de creme.', preco: 800 },
  { id: 'torta', cat: 'Sobremesas', emoji: '🍋', nome: 'Torta de limão', desc: 'Fatia com merengue.', preco: 1000 },
];

/* ========== ESTADO ========== */
const estado = {
  carrinho: [],          // { id, nome, detalhe, preco, qtd }
  pao: PAES[0].id,
  carne: CARNES[0].id,
  extras: [],
  categoria: CATEGORIAS[0],
};

/* ========== UTILITÁRIOS ========== */
const $ = (id) => document.getElementById(id);
const brl = (centavos) => (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function el(tag, props = {}, ...filhos) {
  const no = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') no.className = v;
    else if (k === 'text') no.textContent = v;
    else no.setAttribute(k, v);
  });
  filhos.forEach((f) => no.append(f));
  return no;
}

/* ========== PERSISTÊNCIA (localStorage) ========== */
function salvar() {
  try {
    const { carrinho, pao, carne, extras, categoria } = estado;
    localStorage.setItem(CHAVE, JSON.stringify({ carrinho, pao, carne, extras, categoria }));
  } catch (e) {
    console.warn('Não foi possível salvar o pedido:', e);
  }
}

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return;
    const d = JSON.parse(bruto);
    if (Array.isArray(d.carrinho)) {
      estado.carrinho = d.carrinho.filter((i) =>
        i && typeof i.id === 'string' && typeof i.nome === 'string' &&
        Number.isInteger(i.preco) && Number.isInteger(i.qtd) && i.qtd > 0
      ).map((i) => ({ id: i.id, nome: i.nome, detalhe: String(i.detalhe || ''), preco: i.preco, qtd: Math.min(i.qtd, QTD_MAX) }));
    }
    if (PAES.some((p) => p.id === d.pao)) estado.pao = d.pao;
    if (CARNES.some((c) => c.id === d.carne)) estado.carne = d.carne;
    if (Array.isArray(d.extras)) estado.extras = d.extras.filter((x) => EXTRAS.some((e) => e.id === x));
    if (CATEGORIAS.includes(d.categoria)) estado.categoria = d.categoria;
  } catch (e) {
    console.warn('Dados salvos inválidos, começando do zero:', e);
  }
}

/* ========== MONTADOR ========== */
function criarOpcao(nome, tipo, valor, rotulo, preco, marcado) {
  const input = el('input', { type: tipo, name: nome, value: valor });
  input.checked = marcado;
  const span = el('span', {}, rotulo + ' ');
  span.append(el('small', { text: '+ ' + brl(preco) }));
  return el('label', { class: 'opcao' }, input, span);
}

function montarOpcoes() {
  $('opt-pao').replaceChildren(...PAES.map((p) => criarOpcao('pao', 'radio', p.id, p.nome, p.preco, p.id === estado.pao)));
  $('opt-carne').replaceChildren(...CARNES.map((c) => criarOpcao('carne', 'radio', c.id, c.nome, c.preco, c.id === estado.carne)));
  $('opt-extras').replaceChildren(...EXTRAS.map((x) => criarOpcao('extra', 'checkbox', x.id, x.nome, x.preco, estado.extras.includes(x.id))));
}

function precoLanche() {
  const pao = PAES.find((p) => p.id === estado.pao);
  const carne = CARNES.find((c) => c.id === estado.carne);
  const extras = EXTRAS.filter((x) => estado.extras.includes(x.id));
  return pao.preco + carne.preco + extras.reduce((s, x) => s + x.preco, 0);
}

function renderPreview() {
  const tem = (id) => estado.extras.includes(id);
  const camadas = [['pao-topo']];
  ['salada', 'molho', 'geleia', 'queijo', 'bacon', 'ovo', 'cebola'].forEach((id) => { if (tem(id)) camadas.push([id]); });
  camadas.push(['carne', estado.carne], ['pao-base']);
  $('preview').replaceChildren(...camadas.map((c) => el('div', { class: 'camada ' + c.join(' ') })));
  $('preco-montador').textContent = brl(precoLanche());
}

function adicionarLanche() {
  const pao = PAES.find((p) => p.id === estado.pao);
  const carne = CARNES.find((c) => c.id === estado.carne);
  const extras = EXTRAS.filter((x) => estado.extras.includes(x.id));
  const id = 'custom:' + [estado.pao, estado.carne, ...extras.map((x) => x.id)].join('|');
  const detalhe = [pao.nome, carne.nome, ...extras.map((x) => x.nome)].join(', ');
  adicionar({ id, nome: 'Lanche montado', detalhe, preco: precoLanche() });
}

/* ========== CARDÁPIO ========== */
function renderAbas() {
  $('abas').replaceChildren(...CATEGORIAS.map((cat) => {
    const b = el('button', { type: 'button', class: 'aba', 'data-cat': cat, 'aria-pressed': String(cat === estado.categoria), text: cat });
    return b;
  }));
}

function renderGrade() {
  const itens = MENU.filter((p) => p.cat === estado.categoria);
  $('grade').replaceChildren(...itens.map((p) => {
    const btn = el('button', { type: 'button', class: 'btn', 'data-add': p.id, text: 'Adicionar' });
    btn.setAttribute('aria-label', 'Adicionar ' + p.nome + ' ao pedido');
    return el('article', { class: 'produto' },
      el('span', { class: 'emoji', 'aria-hidden': 'true', text: p.emoji }),
      el('h3', { text: p.nome }),
      el('p', { text: p.desc }),
      el('div', { class: 'linha' }, el('span', { class: 'preco', text: brl(p.preco) }), btn)
    );
  }));
}

/* ========== CARRINHO ========== */
function adicionar({ id, nome, detalhe = '', preco }) {
  const existente = estado.carrinho.find((i) => i.id === id);
  if (existente) existente.qtd = Math.min(existente.qtd + 1, QTD_MAX);
  else estado.carrinho.push({ id, nome, detalhe, preco, qtd: 1 });
  $('status').textContent = nome + ' adicionado ao pedido.';
  atualizar();
}

function alterarQtd(id, delta) {
  const item = estado.carrinho.find((i) => i.id === id);
  if (!item) return;
  item.qtd = Math.min(item.qtd + delta, QTD_MAX);
  if (item.qtd <= 0) estado.carrinho = estado.carrinho.filter((i) => i.id !== id);
  atualizar();
}

function remover(id) {
  estado.carrinho = estado.carrinho.filter((i) => i.id !== id);
  atualizar();
}

function calcularTotais() {
  const subtotal = estado.carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  const entrega = subtotal === 0 || subtotal >= FRETE_GRATIS ? 0 : TAXA_ENTREGA;
  return { subtotal, entrega, total: subtotal + entrega };
}

function renderCarrinho() {
  const lista = $('lista-carrinho');
  if (estado.carrinho.length === 0) {
    lista.replaceChildren(el('li', { class: 'vazio', text: 'Seu pedido está vazio. Monte um lanche ou escolha no cardápio.' }));
  } else {
    lista.replaceChildren(...estado.carrinho.map((i) => {
      const li = el('li', { class: 'item' },
        el('span', { class: 'item-nome', text: i.nome }),
        el('span', { class: 'item-preco', text: brl(i.preco * i.qtd) })
      );
      if (i.detalhe) li.append(el('p', { class: 'item-detalhe', text: i.detalhe }));
      const menos = el('button', { type: 'button', class: 'qtd-btn', 'data-acao': 'menos', 'data-id': i.id, 'aria-label': 'Diminuir quantidade de ' + i.nome, text: '−' });
      const mais = el('button', { type: 'button', class: 'qtd-btn', 'data-acao': 'mais', 'data-id': i.id, 'aria-label': 'Aumentar quantidade de ' + i.nome, text: '+' });
      const rem = el('button', { type: 'button', class: 'remover', 'data-acao': 'remover', 'data-id': i.id, text: 'Remover' });
      li.append(el('div', { class: 'item-acoes' }, menos, el('span', { class: 'qtd', text: String(i.qtd) }), mais, rem));
      return li;
    }));
  }

  const { subtotal, entrega, total } = calcularTotais();
  $('subtotal').textContent = brl(subtotal);
  $('entrega').textContent = subtotal === 0 ? brl(0) : entrega === 0 ? 'Grátis' : brl(entrega);
  $('total').textContent = brl(total);

  const falta = FRETE_GRATIS - subtotal;
  $('dica-frete').textContent = subtotal === 0 ? '' : falta > 0
    ? 'Faltam ' + brl(falta) + ' para entrega grátis.'
    : 'Você ganhou entrega grátis!';

  const qtdTotal = estado.carrinho.reduce((s, i) => s + i.qtd, 0);
  $('badge').textContent = String(qtdTotal);
  $('btn-finalizar').disabled = estado.carrinho.length === 0;
  $('btn-limpar').hidden = estado.carrinho.length === 0;
}

function finalizar() {
  if (estado.carrinho.length === 0) return;
  const { total } = calcularTotais();
  const numero = String(Date.now()).slice(-5);
  estado.carrinho = [];
  atualizar();
  $('status').textContent = 'Pedido #' + numero + ' enviado! Total de ' + brl(total) + '. Chegamos em até 40 minutos.';
}

function atualizar() {
  renderCarrinho();
  salvar();
}

/* ========== EVENTOS ========== */
function iniciarEventos() {
  $('form-montador').addEventListener('change', (e) => {
    const campo = e.target;
    if (campo.name === 'pao') estado.pao = campo.value;
    else if (campo.name === 'carne') estado.carne = campo.value;
    else if (campo.name === 'extra') {
      estado.extras = campo.checked
        ? [...new Set([...estado.extras, campo.value])]
        : estado.extras.filter((x) => x !== campo.value);
    }
    renderPreview();
    salvar();
  });

  $('form-montador').addEventListener('submit', (e) => {
    e.preventDefault();
    adicionarLanche();
  });

  $('abas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    estado.categoria = b.dataset.cat;
    renderAbas();
    renderGrade();
    salvar();
  });

  $('grade').addEventListener('click', (e) => {
    const b = e.target.closest('[data-add]');
    if (!b) return;
    const p = MENU.find((m) => m.id === b.dataset.add);
    if (!p) return;
    if (p.completo) {
      const detalhe = [PAES[0].nome, CARNES[0].nome, ...EXTRAS.map((x) => x.nome)].join(', ');
      adicionar({ id: p.id, nome: p.nome, detalhe, preco: p.preco });
    } else {
      adicionar({ id: p.id, nome: p.nome, preco: p.preco });
    }
  });

  $('lista-carrinho').addEventListener('click', (e) => {
    const b = e.target.closest('[data-acao]');
    if (!b) return;
    const { acao, id } = b.dataset;
    if (acao === 'mais') alterarQtd(id, 1);
    else if (acao === 'menos') alterarQtd(id, -1);
    else if (acao === 'remover') remover(id);
  });

  $('btn-finalizar').addEventListener('click', finalizar);
  $('btn-limpar').addEventListener('click', () => {
    estado.carrinho = [];
    $('status').textContent = 'Carrinho esvaziado.';
    atualizar();
  });
}

/* ========== INÍCIO ========== */
carregar();
montarOpcoes();
renderPreview();
renderAbas();
renderGrade();
renderCarrinho();
iniciarEventos();
