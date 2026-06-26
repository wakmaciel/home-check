# Meu Apê · Finanças NOW Milão

App web (PWA) para acompanhar os pagamentos do seu apartamento (NOW Milão 2ª Fase,
unidade 202F) até a entrega das chaves em 31/05/2027. Roda só no seu navegador —
**não tem login, não tem servidor, não tem nuvem**: todos os dados ficam salvos no
armazenamento local do seu iPhone, dentro do Safari.

## O que o app tem

- **Início**: contagem de dias até a entrega, "tanque líquido" mostrando % pago do
  valor contratado, total pago x previsto x diferença, e 3 gráficos (pago por
  categoria, evolução acumulada pago x previsto, pago x previsto por categoria).
- **Lançamentos**: extrato de todos os pagamentos, agrupados por mês, com filtro por
  categoria.
- **Categorias**: o "plano de pagamento" — sinal, parcelas mensais à incorporadora,
  seguro/juros de obra, saldo do financiamento, os dois balões do pró-soluto, o
  pró-soluto pós-chaves (onde você define, no dia, se será à vista ou parcelado),
  taxas de ITBI/cartório e uma categoria livre para outras despesas. Você pode
  editar, remover ou criar novas categorias.
- **Ajustes**: data de entrega, data de compra, valor total do contrato (só
  referência), backup/restauração em JSON e exportação de relatório em CSV (para
  abrir no Excel/Numbers/Google Sheets).

As categorias já vêm com os **valores do contrato como referência** (para você ver,
no fim, o quanto pagou a mais por causa do reajuste). As **parcelas reais que você
paga não vêm preenchidas** — você lança cada pagamento manualmente, com o valor
exato que caiu no boleto/PIX daquele mês.

---

## Passo 1 — Subir os arquivos no GitHub

1. Crie uma conta gratuita em [github.com](https://github.com) se ainda não tiver.
2. Clique em **New repository** (Novo repositório).
   - Nome: por exemplo `meu-ape-now-milao`.
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
   `https://seu-usuario.github.io/meu-ape-now-milao/`

## Passo 3 — Instalar no iPhone (tela inicial, com o ícone "liquid glass")

1. Abra esse link no **Safari** do iPhone (precisa ser o Safari, não Chrome).
2. Toque no ícone de **compartilhar** (o quadrado com a flecha para cima).
3. Role para baixo e toque em **Adicionar à Tela de Início**.
4. Confirme o nome ("Meu Apê") e toque em **Adicionar**.

O ícone que você criou vai aparecer na tela de início como um app de verdade — abre
em tela cheia, sem a barra do Safari, com a paleta laranja "liquid glass".

> Sempre que você atualizar os arquivos no GitHub (por exemplo, se eu te enviar uma
> versão nova), é só fazer upload de novo substituindo os arquivos antigos — o app
> instalado no seu celular atualiza solinho na próxima vez que você abrir com
> internet.

---

## Cuidados importantes

- **Faça backup com frequência.** Vá em **Ajustes → Exportar backup (.json)** de
  vez em quando (por exemplo, todo mês depois de lançar os pagamentos) e salve esse
  arquivo no Arquivos do iPhone, iCloud ou e-mail para você mesmo. Se você limpar os
  dados do Safari, desinstalar o app da tela de início ou trocar de celular, os
  dados salvos só nesse navegador podem ser perdidos — o backup é a sua garantia.
- Os **valores de referência das categorias não se atualizam automaticamente**
  com o reajuste do INCC/IPCA do contrato — são só os valores originais, para
  comparação. O valor real de cada parcela você sempre vê no boletoda EBM/Caixa e
  lança manualmente.
- Quando chegar a hora de decidir o **pró-soluto pós-chaves** (à vista ou
  parcelado), edite a categoria "Pró-Soluto pós-chaves (saldo)" em **Categorias**,
  escolha o modo e preencha o valor de referência e observações.
- No final, use **Ajustes → Exportar relatório (.csv)** para gerar a planilha
  completa de tudo o que foi pago, por categoria e por data.

---

## Sobre o icon e a paleta

O ícone e a paleta de cores (laranja → âmbar → creme) usados no app são os mesmos
que você já tinha criado, extraídos diretamente da imagem que você enviou.
