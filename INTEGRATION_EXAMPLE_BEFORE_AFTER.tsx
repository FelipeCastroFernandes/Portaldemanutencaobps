/**
 * EXEMPLO PRÁTICO: Como integrar StopCausesChart no DashboardView.tsx
 * Este arquivo mostra o código ANTES e DEPOIS da integração
 */

// ============================================================================
// ANTES: DashboardView.tsx Original
// ============================================================================

/*
import React, { useState, useMemo } from 'react';
import { Filter, AlertTriangle, TrendingUp, Hash, Clock, Check, ChevronDown, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MaintenanceRecord, EquipmentType } from '../types';
import { MESES_ORDEM, ESCADAS_LIST, ELEVADORES_LIST } from '../data/initialData';
import { calcDisp } from '../lib/utils';
import StatsCharts from './StatsCharts';
import PageHeader from './PageHeader';

interface DashboardViewProps {
  type: EquipmentType;
  data: MaintenanceRecord[];
  onBack: () => void;
  onOpenOccurrence: () => void;
}

// ... resto do código ...
*/

// ============================================================================
// DEPOIS: DashboardView.tsx Com StopCausesChart Integrado
// ============================================================================

/*
import React, { useState, useMemo } from 'react';
import { Filter, AlertTriangle, TrendingUp, Hash, Clock, Check, ChevronDown, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MaintenanceRecord, EquipmentType, Occurrence } from '../types';  // ← ADICIONADO: Occurrence
import { MESES_ORDEM, ESCADAS_LIST, ELEVADORES_LIST } from '../data/initialData';
import { calcDisp } from '../lib/utils';
import StatsCharts from './StatsCharts';
import PageHeader from './PageHeader';
import StopCausesChart from './StopCausesChart';  // ← NOVO: Import

interface DashboardViewProps {
  type: EquipmentType;
  data: MaintenanceRecord[];
  onBack: () => void;
  onOpenOccurrence: () => void;
  occurrences: Occurrence[];  // ← NOVO: Nova prop
}

export default function DashboardView({ 
  type, 
  data, 
  onBack, 
  onOpenOccurrence,
  occurrences  // ← NOVO: Receber prop
}: DashboardViewProps) {
  // ... código existente ...

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* ... PageHeader, Filters, KPIs ... */}
      
      {/* Charts Section */}
      <StatsCharts 
        type={type}
        data={filteredData}
        allData={data}
        selectedEquips={selectedEquips}
        selectedMonths={selectedMonths}
      />

      {/* ← NOVO: Grid com StopCausesChart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <StopCausesChart 
          occurrences={occurrences}
          equipmentType={type}
        />
        
        {/* Espaço para outro gráfico (opcional) */}
      </div>
    </div>
  );
}
*/

// ============================================================================
// ALTERAÇÕES NECESSÁRIAS NO App.tsx
// ============================================================================

/*
// Quando chamar DashboardView, passar occurrences:

<DashboardView 
  type={selectedType}
  data={maintenanceData}
  onBack={() => setActivePage('dashboardCover')}
  onOpenOccurrence={() => setShowOccurrenceModal(true)}
  occurrences={occurrences}  // ← NOVO: Passar occurrences
/>
*/

// ============================================================================
// RESULTADO VISUAL NO BROWSER
// ============================================================================

/*

┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  Dashboard Elevadores                          ↶  [Filtros]           │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┬──────────────────┬──────────────────┐            │
│  │ Total Chamados   │ Disponibilidade  │ Equipamento      │            │
│  │     125          │     92.5%        │ EL-05 (78%)      │            │
│  └──────────────────┴──────────────────┴──────────────────┘            │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Disponibilidade por Equipamento (%)                              │  │
│  │ [Chart from Recharts - Full Width]                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────┬──────────────────────────┐              │
│  │ Disponibilidade Mensal   │ Proporção de Chamados   │              │
│  │ [Line Chart]             │ [Pie Chart]              │              │
│  └──────────────────────────┴──────────────────────────┘              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────┬──────────────────────────┐              │
│  │ MTBF (horas)             │ MTTR (horas)             │              │
│  │ [Bar Chart]              │ [Bar Chart]              │              │
│  └──────────────────────────┴──────────────────────────┘              │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Principais Causas de Parada - Elevadores          ← NOVO!      │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │ PORTA DE PAVIMENTO  ███████████████████████ 45                 │  │
│  │ OPERADORES PORTA    ████████████ 32                            │  │
│  │ SENSORES            ████████ 24                                │  │
│  │ DRIVE QUEIMADO      ██████ 18                                  │  │
│  │ CORREDIÇAS          ███ 12                                      │  │
│  │                                                                  │  │
│  │ Top 5 causas mais frequentes • Total de 131 ocorrências        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

*/

// ============================================================================
// CHECKLIST DE INTEGRAÇÃO
// ============================================================================

/*
□ 1. Copiar StopCausesChart.tsx para src/components/
□ 2. Atualizar import no DashboardView.tsx
□ 3. Adicionar Occurrence ao import de types
□ 4. Adicionar occurrences à interface DashboardViewProps
□ 5. Adicionar occurrences aos parâmetros da função
□ 6. Adicionar grid com <StopCausesChart /> ao JSX
□ 7. No App.tsx, passar occurrences como prop ao DashboardView
□ 8. Testar compilação: npm run build
□ 9. Testar no navegador
□ 10. Verificar responsividade em mobile
□ 11. Ajustar cores/dimensões se necessário (opcional)
□ 12. Commitar e fazer merge

*/

// ============================================================================
// ESTRUTURA FINAL DO GRID DE GRÁFICOS
// ============================================================================

/*
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Gráficos existentes do StatsCharts */}
  <div className="chart-container lg:col-span-2">
    {/* Disponibilidade */}
  </div>
  <div className="chart-container">
    {/* Trend Mensal */}
  </div>
  <div className="chart-container">
    {/* Chamados */}
  </div>
  <div className="chart-container">
    {/* MTBF */}
  </div>
  <div className="chart-container">
    {/* MTTR */}
  </div>
</div>

{/* Novo grid com StopCausesChart */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
  <StopCausesChart 
    occurrences={occurrences}
    equipmentType={type}
  />
  
  {/* Pode adicionar mais gráficos aqui no futuro */}
</div>
*/

// ============================================================================
// TESTE MANUAL - DADOS DE EXEMPLO
// ============================================================================

/*
Se quiser testar localmente, você pode mockar dados assim:

const mockOccurrences: Occurrence[] = [
  {
    id: '1',
    type: 'elevadores',
    equip: 'EL-01',
    callNumber: 'CALL-001',
    attendant: 'João',
    createdBy: 'user@company.com',
    start: '2024-06-15T08:00:00Z',
    end: '2024-06-15T10:00:00Z',
    causa_parada: 'PORTA DE PAVIMENTO'
  },
  {
    id: '2',
    type: 'elevadores',
    equip: 'EL-02',
    callNumber: 'CALL-002',
    attendant: 'Maria',
    createdBy: 'user@company.com',
    start: '2024-06-15T09:00:00Z',
    end: '2024-06-15T11:00:00Z',
    causa_parada: 'SENSORES'
  },
  // Adicione mais ocorrências...
];

// Depois use:
<StopCausesChart 
  occurrences={mockOccurrences}
  equipmentType="elevadores"
/>
*/

export default "Este é um arquivo de referência - não importar";
