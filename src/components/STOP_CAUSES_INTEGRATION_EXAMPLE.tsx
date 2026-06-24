/**
 * EXEMPLO DE INTEGRAÇÃO - StopCausesChart
 * 
 * Este arquivo mostra como integrar o StopCausesChart no DashboardView
 * e/ou StatsCharts do seu projeto.
 */

// ============================================================================
// OPÇÃO 1: Integrar no StatsCharts.tsx (RECOMENDADO)
// ============================================================================

/*
No arquivo: src/components/StatsCharts.tsx

1. Adicione o import no topo:

import StopCausesChart from './StopCausesChart';
import { Occurrence } from '../types'; // Se não tiver já

2. Altere a interface StatsChartsProps para receber occurrences:

interface StatsChartsProps {
  type: EquipmentType;
  data: MaintenanceRecord[];
  allData: MaintenanceRecord[];
  selectedEquips: string[];
  selectedMonths: string[];
  occurrences: Occurrence[];  // NOVO
}

3. Dentro do JSX, altere o grid final para:

return (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Gráficos existentes... */}
    
    {/* NOVO: Adicione o StopCausesChart após os gráficos de MTBF/MTTR */}
    <StopCausesChart 
      occurrences={occurrences}
      equipmentType={type}
    />
  </div>
);

4. Em DashboardView.tsx, passe as occurrences para StatsCharts:

<StatsCharts 
  type={type}
  data={filteredData}
  allData={data}
  selectedEquips={selectedEquips}
  selectedMonths={selectedMonths}
  occurrences={occurrences}  // NOVO
/>
*/

// ============================================================================
// OPÇÃO 2: Integrar Diretamente no DashboardView.tsx
// ============================================================================

/*
No arquivo: src/components/DashboardView.tsx

1. Adicione o import no topo:

import StopCausesChart from './StopCausesChart';

2. No JSX, após a chamada do StatsCharts ou dentro de um novo grid:

// Exemplo de grid adicional:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
  <StopCausesChart 
    occurrences={occurrences}
    equipmentType={type}
  />
  
  {/* Outro gráfico opcional */}
</div>

3. Certifique-se de que 'occurrences' está disponível nas props do DashboardView:

interface DashboardViewProps {
  type: EquipmentType;
  data: MaintenanceRecord[];
  onBack: () => void;
  onOpenOccurrence: () => void;
  occurrences: Occurrence[];  // NOVO
}
*/

// ============================================================================
// OPÇÃO 3: Integrar no App.tsx (Se quiser usar isoladamente)
// ============================================================================

/*
No arquivo: src/App.tsx

import StopCausesChart from './components/StopCausesChart';

// Dentro do JSX onde renderizar:
<StopCausesChart 
  occurrences={occurrences}
  equipmentType={activePage === 'dashboardElevadores' ? 'elevadores' : 'escadas'}
/>
*/

// ============================================================================
// CARACTERÍSTICAS DO COMPONENTE
// ============================================================================

/*
✓ O componente filtra automaticamente:
  - Apenas ocorrências FECHADAS (que têm 'end' preenchido)
  - Apenas ocorrências COM 'causa_parada' preenchida
  - Apenas ocorrências do tipo CORRETO (elevadores ou escadas)

✓ Cria um ranking dos Top 5 problemas mais frequentes

✓ Usa Tailwind CSS puro - sem dependências externas

✓ Layout responsivo que se encaixa perfeitamente no grid existente

✓ Dimensões padronizadas (h-full, min-h-[350px]) para alinhar com outros cards
*/

// ============================================================================
// ESTRUTURA DO COMPONENTE
// ============================================================================

/*
Props:
  - occurrences: Occurrence[] (array de todas as ocorrências)
  - equipmentType: 'escadas' | 'elevadores' (qual tipo filtrar)

Saída:
  - Título dinâmico: "Principais Causas de Parada - Escadas Rolantes" ou "Elevadores"
  - Gráfico de barras horizontais com até 5 causas
  - Cada barra mostra:
    * Nome da causa (esquerda)
    * Barra visual com comprimento proporcional
    * Contagem absoluta (direita)
  - Rodapé com informação total

Cores:
  - Barra: #7A1919 (Burgundy)
  - Fundo: #f3f4f6 (gray-100)
  - Texto: #79030f (brand-dark-red)
*/

// ============================================================================
// EXEMPLO COMPLETO DE USO NO App.tsx
// ============================================================================

/*
import React, { useState, useMemo } from 'react';
import StopCausesChart from './components/StopCausesChart';
import { Occurrence, EquipmentType } from './types';

export default function App() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [equipmentType, setEquipmentType] = useState<EquipmentType>('elevadores');

  return (
    <div className="p-6">
      {/* Header com seletor */}
      <div className="mb-6">
        <label>
          Equipamento:
          <select 
            value={equipmentType}
            onChange={(e) => setEquipmentType(e.target.value as EquipmentType)}
          >
            <option value="elevadores">Elevadores</option>
            <option value="escadas">Escadas Rolantes</option>
          </select>
        </label>
      </div>

      {/* Grid com o gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StopCausesChart 
          occurrences={occurrences}
          equipmentType={equipmentType}
        />
      </div>
    </div>
  );
}
*/

// ============================================================================
// DADOS ESPERADOS
// ============================================================================

/*
Exemplo de Occurrence com todos os campos necessários:

{
  id: "occ-001",
  type: "elevadores",                    // ← equipmentType
  equip: "EL-01",
  callNumber: "CALL-001",
  attendant: "João Silva",
  createdBy: "usuario@empresa.com",
  start: "2024-06-15T08:30:00Z",
  end: "2024-06-15T11:45:00Z",           // ← Precisa ter 'end' para contar
  technician: "Técnico X",
  reason: "Travamento de portas",
  causa_parada: "PORTA DE PAVIMENTO",    // ← Precisa ter este campo
  is_equipment_stopped: true,
  statusHistory: [...]
}
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
❌ O gráfico mostra "Sem dados disponíveis"?
   → Verifique se tem ocorrências FECHADAS (com 'end' preenchido)
   → Verifique se as ocorrências têm 'causa_parada' preenchida
   → Verifique se o tipo está correto ('elevadores' ou 'escadas')

❌ As barras estão muito curtas?
   → Normal! Elas são proporcionais ao máximo
   → Se há 5 causas, a barra maior será 100%

❌ TypeScript reclama de tipos?
   → Certifique-se de importar 'Occurrence' e 'EquipmentType' de './types'
   → Verifique se as props são do tipo correto

❌ O layout quebrou?
   → O container está com 'h-full'?
   → O pai está com 'flex' ou é um grid?
   → Tente adicionar 'h-[350px]' ao invés de 'h-full'
*/

// ============================================================================
// PERFORMANCE
// ============================================================================

/*
O componente usa useMemo com dependências [occurrences, equipmentType],
então apenas recalcula quando:
  - O array de occurrences muda
  - O equipmentType muda

Mesmo com 1000+ ocorrências, o cálculo é rápido porque:
  - Filtra em O(n)
  - Agrupa em O(n)
  - Ordena apenas 5 items em O(5 log 5)
*/

export default "Este é um arquivo de documentação/exemplo - não importar";
