# 🧪 Calculadora Impressora 3D

> Calculadora web para precificação de peças impressas em resina 3D — desenvolvida com HTML, CSS e JavaScript puro.

🌐 **Acesse o projeto ao vivo:** [marcus-calegar.github.io/calculadora-impressao-3d](https://marcus-calegar.github.io/calculadora-impressao-3d/)

---

## 📋 Descrição

Ferramenta web completa para calcular o **custo de produção** e o **preço de venda** de peças impressas em resina (SLA/MSLA), voltada para makers, prototipadores e empreendedores do mercado de impressão 3D.

Todos os textos, rótulos e valores estão em **Português (pt-BR)** com moeda em **Real (R$)**.

---

## ✨ Funcionalidades

- **5 categorias de entrada:** custos da impressora, material (resina), tempo e trabalho, custos extras e ajuste de margem
- **Cálculo completo:** resina com margem de erro, custo de impressão, mão de obra, extras e preço final com lucro
- **Gráfico de composição** do custo em tempo real (canvas nativo, sem bibliotecas)
- **Quick stats:** custo por grama, por hora, markup total e margem real
- **Presets com localStorage:** salvar, carregar, sobrescrever e excluir configurações nomeadas
- **Histórico de cálculos:** visualizar, reutilizar valores e remover entradas anteriores
- **Exportar PDF:** relatório completo com inputs, breakdown e preço final (via jsPDF)
- **Compartilhar via link:** todos os campos codificados em query params da URL
- **Tema claro/escuro:** toggle com persistência em localStorage
- **Design responsivo:** mobile-first, touch-friendly, funciona em qualquer tela

---

## 🖥️ Stack

| Tecnologia | Uso |
|---|---|
| HTML5 semântico | Estrutura da aplicação |
| CSS3 Vanilla | Design system completo com variáveis CSS e temas |
| JavaScript ES6+ | Toda a lógica, estado e DOM manipulation |
| [jsPDF](https://github.com/parallax/jsPDF) | Geração de PDF (CDN) |
| Google Fonts (Inter) | Tipografia |

Sem frameworks. Sem bundlers. 100% estático — **pronto para deploy no Vercel, Netlify ou GitHub Pages**.

---

## 🚀 Como usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/Marcus-Calegar/calculadora-impressao-3d.git
   ```

2. Abra o arquivo `index.html` diretamente no navegador — não requer servidor ou instalação.

3. Ou acesse direto pelo link: [marcus-calegar.github.io/calculadora-impressao-3d](https://marcus-calegar.github.io/calculadora-impressao-3d/)

---

## 📐 Lógica de Cálculo

```
custo_resina    = quantidade_g × preço_por_grama × (1 + margem_erro / 100)
custo_impressão = horas_impressão × (energia + depreciação + manutenção)
mão_de_obra     = horas_acabamento × valor_hora
extras          = limpeza + embalagem

custo_total     = custo_resina + custo_impressão + mão_de_obra + extras
preço_final     = custo_total × (1 + margem_lucro / 100)
```

---

## 🤖 Sobre o uso de Inteligência Artificial

> **Este projeto foi inteiramente desenvolvido com o auxílio de IA generativa.**

O modelo utilizado foi o **Claude Sonnet** (Anthropic), acessado através da plataforma **Antigravity** (Google DeepMind) — um assistente de programação em par que executa ações diretamente no ambiente de desenvolvimento.

O objetivo principal **não foi apenas criar a calculadora**, mas sim explorar e aprimorar a habilidade de:

- ✍️ **Escrever prompts eficazes** — descrever requisitos de forma clara, estruturada e completa
- 🔁 **Iterar com IA** — refinar funcionalidades através de conversas e feedbacks precisos
- 🧠 **Entender os limites e capacidades** de modelos de linguagem aplicados ao desenvolvimento de software
- 📦 **Revisar e validar** o código gerado, garantindo que funciona como esperado

Toda a especificação do projeto — desde a estrutura dos cards, a lógica de cálculo, as funcionalidades de preset/histórico, exportação PDF e compartilhamento via URL — foi descrita em um único prompt detalhado, e as melhorias foram aplicadas através de conversas iterativas com a IA.

Este projeto faz parte de uma jornada de aprendizado sobre **engenharia de prompts** e como colaborar de forma produtiva com ferramentas de IA no dia a dia do desenvolvimento.

---

## 📁 Estrutura

```
calculadora-impressao-3d/
├── index.html   # Estrutura HTML semântica completa
├── style.css    # Design system com dark/light mode
├── script.js    # Toda a lógica da aplicação
└── README.md
```

---

## 📄 Licença

MIT — sinta-se livre para usar, modificar e distribuir.

---

<p align="center">
  Feito com 💜 e muita curiosidade · <strong>Calculadora Impressora 3D</strong>
</p>
