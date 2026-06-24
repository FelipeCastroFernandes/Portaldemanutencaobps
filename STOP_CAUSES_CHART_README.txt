═══════════════════════════════════════════════════════════════════════════════
  COMPONENTE: StopCausesChart.tsx
  STATUS: ✅ DESENVOLVIDO E COMPILADO COM SUCESSO
═══════════════════════════════════════════════════════════════════════════════

📋 RESUMO EXECUTIVO
───────────────────────────────────────────────────────────────────────────────
Componente React/TypeScript reutilizável que renderiza um gráfico de barras
horizontais mostrando as TOP 5 PRINCIPAIS CAUSAS DE PARADA de equipamentos
(Elevadores ou Escadas Rolantes).

✨ CARACTERÍSTICAS PRINCIPAIS
───────────────────────────────────────────────────────────────────────────────
  ✓ Componente totalmente reutilizável (importável em qualquer dashboard)
  ✓ Filtra dados automaticamente por tipo de equipamento
  ✓ Sem dependências externas (usa apenas Tailwind CSS nativo)
  ✓ Layout responsivo que se encaixa perfeitamente no grid existente
  ✓ Dimensões padronizadas (min-h-[350px]) para alinhamento com outros cards
  ✓ Performance otimizada com useMemo
  ✓ TypeScript strict compliance
  ✓ Design consistente com o Botafogo Praia Shopping (Burgundy/Bege)

📂 ARQUIVOS CRIADOS
───────────────────────────────────────────────────────────────────────────────

1. src/components/StopCausesChart.tsx (111 linhas)
   └─ Componente principal com lógica de filtros e renderização

2. STOP_CAUSES_CHART_GUIDE.md
   └─ Documentação completa com examples e customizações

3. src/components/STOP_CAUSES_INTEGRATION_EXAMPLE.tsx
   └─ Arquivo de exemplo com 3 opções de integração

🔌 PROPS DO COMPONENTE
───────────────────────────────────────────────────────────────────────────────

interface StopCausesChartProps {
  occurrences: Occurrence[];              // Array de ocorrências do sistema
  equipmentType: 'escadas' | 'elevadores' // Tipo de equipamento a filtrar
}

🧠 LÓGICA DE FILTROS (APLICADA INTERNAMENTE)
───────────────────────────────────────────────────────────────────────────────

1. Filtra ocorrências FECHADAS (com 'end' preenchido)
2. Filtra apenas ocorrências COM 'causa_parada' preenchida
3. Filtra apenas ocorrências do tipo CORRETO (elevadores ou escadas)
4. Agrupa por 'causa_parada' contando frequência
5. Ordena decrescente (maior → menor)
6. Limita ao TOP 5 problemas
7. Calcula percentuais para renderizar as barras

🎨 LAYOUT & DESIGN
───────────────────────────────────────────────────────────────────────────────

Container Externo:
  • Height: h-full flex flex-col min-h-[350px]
  • Padding: p-6
  • Border Radius: rounded-[24px]
  • Background: bg-white
  • Shadow: shadow-xl
  • Border: border border-brand-dark-red/5

Barras Horizontais:
  • Altura fixa: h-8
  • Cor da barra: bg-[#7A1919] (Burgundy)
  • Cor do fundo: bg-gray-100
  • Border Radius direita: rounded-r-full
  • Animação: transition-all duration-500 ease-out
  • Comprimento: Proporcional ao máximo (100% para a maior)

Typography:
  • Título: text-sm font-bold uppercase tracking-widest
  • Rótulo causa: text-xs font-bold uppercase truncate
  • Contagem: text-sm font-black text-brand-dark-red
  • Footer: text-xs text-gray-500 italic

📊 ESTRUTURA DE RENDERIZAÇÃO
───────────────────────────────────────────────────────────────────────────────

[Card Container - h-full min-h-[350px]]
├─ Header
│  └─ "Principais Causas de Parada - Escadas Rolantes" (ou Elevadores)
├─ Chart Container (flex-1)
│  ├─ Causa #1 [████████████ 45 ocorrências]
│  ├─ Causa #2 [████████ 32 ocorrências]
│  ├─ Causa #3 [██████ 24 ocorrências]
│  ├─ Causa #4 [████ 18 ocorrências]
│  └─ Causa #5 [██ 12 ocorrências]
└─ Footer
   └─ "Top 5 causas mais frequentes • Total de 131 ocorrências"

💡 EXEMPLO DE USO (MAIS SIMPLES)
───────────────────────────────────────────────────────────────────────────────

import StopCausesChart from './components/StopCausesChart';

// Em qualquer componente que tenha acesso a 'occurrences' e 'equipmentType':
<StopCausesChart 
  occurrences={allOccurrences}
  equipmentType="elevadores"
/>

📌 ONDE INTEGRAR NO PROJETO
───────────────────────────────────────────────────────────────────────────────

OPÇÃO 1 - Recomendado (No StatsCharts.tsx):
  • Adicionar importação
  • Adicionar prop 'occurrences' à interface
  • Adicionar componente ao grid de gráficos
  • Passar occurrences do DashboardView

OPÇÃO 2 - Direto no DashboardView.tsx:
  • Importar componente
  • Criar grid adicional ou adicionar ao grid existente
  • Passar occurrences que já estão disponíveis

OPÇÃO 3 - No App.tsx (Se usar isoladamente):
  • Importar componente
  • Renderizar com dados globais de occurrences

🚀 COMPILAÇÃO & VALIDAÇÃO
───────────────────────────────────────────────────────────────────────────────

✓ Build status: SUCCESS
✓ Linhas de código: 111
✓ Complexidade: Baixa/Média
✓ Sem erros de TypeScript
✓ Sem dependências externas adicionadas
✓ Tailwind CSS: 100% nativo

📦 DEPENDÊNCIAS
───────────────────────────────────────────────────────────────────────────────

Já presentes no projeto:
  ✓ React 18+
  ✓ TypeScript 5.0+
  ✓ Tailwind CSS 3.0+

Nenhuma dependência externa foi adicionada.

🔧 CUSTOMIZAÇÕES POSSÍVEIS
───────────────────────────────────────────────────────────────────────────────

Para Top 10 (ao invés de Top 5):
  .slice(0, 5) → .slice(0, 10)

Para mudar cor da barra:
  bg-[#7A1919] → bg-brand-red ou qualquer cor

Para altura das barras:
  h-8 → h-10 ou h-6

Para altura mínima do card:
  min-h-[350px] → min-h-[400px]

⚡ PERFORMANCE
───────────────────────────────────────────────────────────────────────────────

• Usa useMemo com dependências [occurrences, equipmentType]
• Recalcula apenas quando os dados mudam
• Complexidade: O(n) para filtros + O(1) para renderização de 5 items
• Rápido mesmo com 1000+ ocorrências
• Sem re-renders desnecessários

✅ CHECKLIST DE INTEGRAÇÃO
───────────────────────────────────────────────────────────────────────────────

□ Copiar StopCausesChart.tsx para src/components/
□ Importar componente onde desejado
□ Passar props: occurrences e equipmentType
□ Testar com dados de exemplo
□ Verificar layout no grid
□ Testar responsividade
□ Ajustar cores/dimensões se necessário (opcional)

🎯 RESULTADO VISUAL ESPERADO
───────────────────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────┐
│ Principais Causas de Parada - Escadas Rolantes     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ DEGRAUS               ██████████████████ 45        │
│ CORRENTE DE DEGRAUS   ████████████ 32             │
│ CORREMAO              ████████ 24                  │
│ SENSORES DE SEGURANÇA ██████ 18                   │
│ DRIVER / MOTOR        ███ 12                       │
│                                                     │
│ Top 5 causas mais frequentes • Total de 131       │
└─────────────────────────────────────────────────────┘

❓ TROUBLESHOOTING
───────────────────────────────────────────────────────────────────────────────

P: O gráfico mostra "Sem dados disponíveis"?
R: Verifique se tem ocorrências FECHADAS (com 'end' preenchido) e com
   'causa_parada' preenchida. O filtro é bem rigoroso.

P: As barras estão muito curtas?
R: Normal! Elas são proporcionais. Se há 5 causas diferentes, todas terão
   tamanhos diferentes baseado na frequência.

P: TypeScript reclama de tipos?
R: Certifique-se de importar 'Occurrence' e 'EquipmentType' de './types'

P: O layout quebrou?
R: Verifique se o componente pai tem display flex ou é um grid.
   Ou tente usar h-[350px] ao invés de h-full.

📞 SUPORTE & DOCUMENTAÇÃO
───────────────────────────────────────────────────────────────────────────────

Documentação completa: STOP_CAUSES_CHART_GUIDE.md
Exemplos de integração: src/components/STOP_CAUSES_INTEGRATION_EXAMPLE.tsx
Código-fonte: src/components/StopCausesChart.tsx

═══════════════════════════════════════════════════════════════════════════════

Desenvolvido como parte do Portal de Manutenção do Botafogo Praia Shopping.
Segue todas as guidelines de design, performance e responsividade do projeto.

Pronto para produção ✅
