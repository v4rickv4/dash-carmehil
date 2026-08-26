# Dashboard Meta Ads — Carmehil

Painel de análise de performance das campanhas de **Meta Ads da Carmehil**.

## Funcionalidades

- KPIs em tempo real: Investimento, Leads, CPL, CTR, Impressões, Alcance, CPC, CPM, Frequência
- Gráficos de evolução temporal com seletor de métrica
- Gráfico combinado Investimento × Leads
- Distribuição do investimento por campanha (donut chart)
- Tabela de performance por campanha com ordenação
- Cards de criativos com thumbnails e drawer de detalhes
- Insights automáticos gerados a partir dos dados
- Filtros por período, campanha e ordenação
- Skeleton loaders, estados de erro e empty state
- Responsivo: desktop, tablet e mobile

---

## 1. Instalação

```bash
# Clone o repositório
git clone <url-do-repo>
cd dash-carmehil

# Instale as dependências
npm install
```

---

## 2. Configurar DATABASE_URL

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database
```

> A variável deve apontar para o banco PostgreSQL que contém a tabela `dados_meta_ads_carmehil`.

---

## 3. Executar localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 4. Testar a API

Com o servidor rodando, você pode testar o endpoint diretamente:

```bash
# Todos os registros
curl http://localhost:3000/api/ads

# Filtrar por período
curl "http://localhost:3000/api/ads?startDate=2026-01-01&endDate=2026-01-31"

# Filtrar por campanha
curl "http://localhost:3000/api/ads?campaign=NomeDaCampanha"

# Combinar filtros
curl "http://localhost:3000/api/ads?startDate=2026-01-01&endDate=2026-01-31&campaign=NomeDaCampanha"

# Limitar registros
curl "http://localhost:3000/api/ads?limit=50"
```

A resposta terá o formato:

```json
{
  "success": true,
  "count": 42,
  "rows": [
    {
      "id": 1,
      "data": "2026-01-15T00:00:00.000Z",
      "nome_campanha": "Nome da Campanha",
      "id_campanha": "123456789",
      "investimento": "1500.00",
      "impressoes": "45000",
      "alcance": "32000",
      "cliques": "780",
      "leads": "24",
      "custo_por_lead": "62.50",
      "url_imagem": "https://..."
    }
  ]
}
```

---

## 5. Build de produção

```bash
npm run build
npm run start
```

---

## 6. Deploy na Vercel

### Opção A — Via CLI

```bash
npm install -g vercel
vercel --prod
```

### Opção B — Via GitHub

1. Faça push do repositório para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Configure a variável de ambiente (próximo passo)
4. Clique em **Deploy**

---

## 7. Configurar DATABASE_URL na Vercel

Na Vercel:

1. Acesse o projeto → **Settings** → **Environment Variables**
2. Clique em **Add New**
3. Name: `DATABASE_URL`
4. Value: sua connection string PostgreSQL
5. Environment: marque **Production**, **Preview** e **Development**
6. Clique em **Save**
7. Redeploy o projeto para que a variável seja aplicada

> **Nota SSL:** Para bancos gerenciados (Neon, Supabase, Railway, RDS, etc.), o SSL é habilitado automaticamente em produção. O código já inclui `ssl: { rejectUnauthorized: false }` para esses casos.

---

## Estrutura do projeto

```
dash-carmehil/
├── app/
│   ├── layout.js          # Root layout + Inter font + SEO
│   ├── page.js            # Dashboard principal (Client Component)
│   ├── globals.css        # Estilos globais + Tailwind
│   └── api/
│       └── ads/
│           └── route.js   # GET /api/ads — Server-only
├── components/
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   ├── FilterBar.jsx
│   ├── KPICard.jsx
│   ├── KPIGrid.jsx
│   ├── PerformanceChart.jsx
│   ├── InvestmentLeadsChart.jsx
│   ├── CampaignDistribution.jsx
│   ├── CampaignTable.jsx
│   ├── CreativeCard.jsx
│   ├── CreativeGrid.jsx
│   ├── CreativeDrawer.jsx
│   ├── InsightsPanel.jsx
│   ├── ErrorState.jsx
│   └── EmptyState.jsx
├── lib/
│   ├── db.js              # Singleton pg.Pool
│   ├── formatters.js      # Formatação BR: moeda, data, %
│   └── metrics.js         # Cálculos: totais, agrupamentos, insights
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Tabela PostgreSQL esperada

```sql
CREATE TABLE dados_meta_ads_carmehil (
  id                 SERIAL PRIMARY KEY,
  data               DATE,
  id_anuncio         VARCHAR,
  nome_anuncio       VARCHAR,
  id_conjunto        VARCHAR,
  nome_conjunto      VARCHAR,
  id_campanha        VARCHAR,
  nome_campanha      VARCHAR,
  investimento       NUMERIC,
  impressoes         INTEGER,
  alcance            INTEGER,
  cliques            INTEGER,
  leads              NUMERIC,
  custo_por_lead     NUMERIC,
  mensagens          NUMERIC,
  custo_por_mensagem NUMERIC,
  url_imagem         TEXT,
  status             VARCHAR,
  atualized_em       TIMESTAMP
);
```

---

## Tecnologias

| Tecnologia     | Versão  | Uso |
|---------------|---------|-----|
| Next.js       | 14.2.5  | Framework |
| React         | 18.x    | UI |
| Tailwind CSS  | 3.x     | Estilos |
| pg            | 8.x     | PostgreSQL client |
| recharts      | 2.x     | Gráficos |
| lucide-react  | 0.408   | Ícones |

---

## Segurança

- `DATABASE_URL` nunca é enviada ao browser
- Toda consulta SQL usa queries parametrizadas (`$1`, `$2`, …)
- Erros internos são logados no servidor, nunca expostos ao browser
- `.env.local` está no `.gitignore`
# dash-carmehil
