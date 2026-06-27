# Home Check

App web (PWA) para acompanhar os pagamentos de um imóvel comprado na planta —
sinal, parcelas até a entrega, financiamento, balões do pró-soluto, taxas — até a
entrega das chaves. Roda só no navegador — **não tem login, não tem servidor, não
tem nuvem**: todos os dados ficam salvos no armazenamento local do aparelho, dentro
do Safari.

Essa é a versão **em branco**, sem nenhum dado de imóvel preenchido — pronta pra
qualquer pessoa configurar com o contrato dela.

## O que o app tem

- **Início**: contagem de dias até a entrega, "tanque líquido" mostrando % pago do
  valor contratado, total pago x previsto x diferença, e 3 gráficos (pago por
  categoria, evolução acumulada pago x previsto, pago x previsto por categoria).
- **Lançamentos**: extrato de todos os pagamentos, agrupados por mês, com filtro por
  categoria.
- **Categorias**: um modelo de "plano de pagamento" comum em compras na planta —
  sinal, parcelas mensais à incorporadora, seguro/juros de obra, saldo do
  financiamento, balões do pró-soluto, o pró-soluto pós-chaves (onde você define,
  no dia, se será à vista ou parcelado), taxas de ITBI/cartório e uma categoria
  livre para outras despesas. Todas vêm **sem valor de referência preenchido** —
  você edita cada uma com os números do seu próprio contrato (ou cria categorias
  novas, do seu jeito).
- **Ajustes**: nome e endereço do imóvel (pra você identificar o seu, é só texto
  livre), data de entrega, data de compra, valor total do contrato (referência),
  backup/restauração em JSON e exportação de relatório em CSV.
- **Modo claro/escuro automático**, seguindo o ajuste de Aparência do iOS.

---

## Passo 0 — Primeiro acesso (configurar para o seu imóvel)

Antes de lançar qualquer pagamento, abra **Ajustes** e preencha:

1. **Identificação do imóvel** — nome (ex: "Meu Apê") e endereço/unidade. Isso é só
   pra você reconhecer o app, não interfere em nenhum cálculo.
2. **Dados do imóvel** — data prevista de entrega das chaves, data da compra, e o
   valor total do contrato (opcional, só usado como referência).
3. Em **Categorias**, edite cada categoria do modelo com o **valor de referência**
   do seu contrato (se quiser comparar depois quanto pagou a mais por reajuste), ou
   deixe em branco e use só como organização. Adicione ou remova categorias livremente.

Se você já tem um backup `.json` exportado de uma conta anterior do app, pode pular
tudo isso: vá em **Ajustes → Importar backup** e selecione o arquivo — ele substitui
os dados em branco pelos seus.

---

## Passo 1 — Subir os arquivos no GitHub

1. Crie uma conta gratuita em [github.com](https://github.com) se ainda não tiver.
2. Clique em **New repository** (Novo repositório).
   - Nome: por exemplo `home-check`.
   - Marque como **Public** (precisa ser público para o GitHub Pages funcionar de
     graça). Ninguém vai conseguir ver seus dados financeiros por isso — eles nunca
     saem do seu celular, só o *código* do app fica público, como um site comum.
3. Dentro do repositório recém-criado, clique em **Add file → Upload files**.
4. Arraste todos os arquivos desta pasta (`index.html`, `styles.css`, `app.js`,
   `manifest.json`, `sw.js`, e a pasta `icons/` inteira) para a área de upload.
5. Clique em **Commit changes**.

## Passo 2 — Ativar o GitHub Pages

1. No repositório, vá em **Settings → Pages** (no menu lateral esquerdo).
2. Em **Build and deployment → Source**, selecione **Deploy from a branch**.
3. Em **Branch**, selecione `main` (ou `master`) e a pasta `/ (root)`. Clique em
   **Save**.
4. Espere 1–2 minutos. O GitHub vai mostrar o link no topo da mesma página, algo
   como:
   `https://seu-usuario.github.io/home-check/`

## Passo 3 — Instalar no iPhone (tela inicial, com o ícone "liquid glass")

1. Abra esse link no **Safari** do iPhone (precisa ser o Safari, não Chrome).
2. Toque no ícone de **compartilhar** (o quadrado com a flecha para cima).
3. Role para baixo e toque em **Adicionar à Tela de Início**.
4. Confirme o nome ("Home Check") e toque em **Adicionar**.

O ícone vai aparecer na tela de início como um app de verdade — abre em tela cheia,
sem a barra do Safari, com a paleta laranja "liquid glass", e segue o modo
claro/escuro do iOS automaticamente.

> Sempre que você atualizar os arquivos no GitHub, é só fazer upload de novo
> substituindo os arquivos antigos — o app instalado no celular atualiza solinho na
> próxima vez que abrir com internet.

---

## Cuidados importantes

- **Faça backup com frequência.** Vá em **Ajustes → Exportar backup (.json)** de
  vez em quando e salve esse arquivo no Arquivos do iPhone, iCloud ou e-mail para
  você mesmo. Se limpar os dados do Safari, desinstalar o app da tela de início ou
  trocar de celular, os dados salvos só nesse navegador podem ser perdidos — o
  backup é a sua garantia.
- Os **valores de referência das categorias não se atualizam automaticamente** com
  reajustes (INCC/IPCA) do contrato — servem só de comparação. O valor real de cada
  parcela você sempre vê no boleto e lança manualmente.
- Quando chegar a hora de decidir o **pró-soluto pós-chaves** (à vista ou
  parcelado), edite essa categoria em **Categorias**, escolha o modo e preencha o
  valor de referência e observações.
- No final, use **Ajustes → Exportar relatório (.csv)** para gerar a planilha
  completa de tudo o que foi pago, por categoria e por data.

---

## Sobre o ícone e a paleta

O ícone e a paleta de cores (laranja → âmbar → creme) usados no app foram criados
e extraídos de uma imagem enviada por quem encomendou o projeto.
