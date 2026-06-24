# StopCausesChart - Componente de Gráfico de Causas de Parada

## Descrição
Componente React reutilizável que renderiza um gráfico de barras horizontais mostrando as **Top 5 principais causas de parada** de equipamentos (Elevadores ou Escadas Rolantes).

O componente é totalmente dinâmico e filtra os dados automaticamente com base no tipo de equipamento selecionado.

---

## Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| occurrences | Occurrence[] | Array de todas as ocorrências/chamados do sistema |
| equipmentType | 'escadas' \| 'elevadores' | Tipo de equipamento para filtrar os dados |

---

## Lógica de Filtros (Aplicados Internamente)

1. **Filtro 1:** Remove ocorrências ainda abertas - mantém apenas as que possuem `end` preenchido (ocorrências fechadas)
2. **Filtro 2:** Remove ocorrências sem `causa_parada` preenchida
3. **Filtro 3:** Filtra para manter apenas ocorrências cujo `type === equipmentType`
4. **Agrupamento:** Conta a frequência de cada `causa_parada`
5. **Ranking:** Ordena decrescente (maior para menor) e limita ao Top 5
6. **Percentuais:** Calcula o percentual de cada barra em relação ao máximo

---

## Layout & Dimensões

### Container Externo
- **Height:** h-full flex flex-col min-h-[350px]
- **Padding:** p-6
- **Border Radius:** rounded-[24px]
- **Background:** bg-white
- **Shadow:** shadow-xl
- **Border:** border border-brand-dark-red/5

### Barras Horizontais
- **Comprimento:** Calculado dinamicamente como percentual do valor máximo
- **Altura:** h-8 (fixed height)
- **Cor:** bg-[#7A1919] (brand-red equivalente)
- **Border Radius Direita:** rounded-r-full
- **Animação:** transition-all duration-500 ease-out

### Espaçamento Vertical
- Cada barra ocupa espaço igual graças a flex-1 e justify-between
- Gap entre barras: gap-4

---

## Design & Estética

### Cores
- **Barra:** bg-[#7A1919] (Burgundy - Brand Dark Red)
- **Fundo da Barra:** bg-gray-100
- **Texto:** text-brand-dark-red (escuro) / text-white (dentro da barra se >25%)
- **Border:** border-brand-dark-red/5 (muito sutil)

### Typography
- **Título:** text-sm font-bold uppercase tracking-widest
- **Rótulo da Causa:** text-xs font-bold uppercase truncate
- **Contagem:** text-sm font-black text-brand-dark-red
- **Footer Info:** text-xs text-gray-500 italic

---

## Exemplo de Uso

### Importação
```tsx
import StopCausesChart from './components/StopCausesChart';
```

### Integração no DashboardView.tsx

Adicione o componente ao grid de gráficos do dashboard:

```tsx
import StopCausesChart from './StopCausesChart';

// ...dentro do componente:

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Gráfico Existente - Disponibilidade */}
  <div className="chart-container lg:col-span-2">
    {/* ... conteúdo existente ... */}
  </div>

  {/* NOVO: Gráfico de Causas de Parada */}
  <StopCausesChart 
    occurrences={allOccurrences}
    equipmentType={type}
  />

  {/* Outros gráficos... */}
</div>
```

### Integração no App.tsx

```tsx
import StopCausesChart from './components/StopCausesChart';

<StopCausesChart 
  occurrences={occurrences}
  equipmentType="elevadores"
/>
```

---

## Comportamento

### Estado Vazio
Se não houver dados (nenhuma ocorrência fechada com causa_parada preenchida):
- Mostra mensagem centralizada: "Sem dados disponíveis"
- Submensagem: "Nenhuma ocorrência fechada com causa de parada registrada"

### Estado com Dados
- Renderiza até 5 causas ordenadas por frequência
- Cada barra mostra:
  - À esquerda: Nome da causa de parada (truncado)
  - Comprimento: Proporcional à frequência
  - Dentro da barra (se >25%): Número absoluto
  - À direita: Contagem total
- Footer: "Top 5 causas mais frequentes • Total de X ocorrências"

---

## Performance

- Usa useMemo para evitar recálculos desnecessários
- Dependências: [occurrences, equipmentType]
- Renderiza apenas 5 items máximo
- Zero bibliotecas externas de gráficos (apenas Tailwind CSS)

---

## Customização

### Alterar limite do Top N
Na linha .slice(0, 5), mude para .slice(0, 10) para Top 10.

### Alterar cores
Barra de fundo: bg-gray-100 → bg-gray-200
Barra preenchida: bg-[#7A1919] → bg-brand-red

### Alterar altura das barras
h-8 → h-10, h-6, etc.

### Alterar altura mínima do card
min-h-[350px] → min-h-[400px], etc.

---

## Compatibilidade

✓ React 18+
✓ TypeScript 5.0+
✓ Tailwind CSS 3.0+
✓ Framer Motion (não necessária)

---

## Notas

1. O componente não depende de bibliotecas externas para gráficos
2. Usa apenas Tailwind CSS nativo
3. Aceita qualquer tipo de Occurrence do sistema
4. Filtra automaticamente com base em type e equipmentType
5. Otimizado com useMemo
6. Responsivo e adaptável
