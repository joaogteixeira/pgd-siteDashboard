export interface ProcessData {
  item: string;
  numeroProcesso: string;
  unidade: string;
  uorg: string;
  setor: string;
  situacaoAtual: string;
  parecer?: string;
  dataTramitacao?: string;
  dataRecepcao?: string;
  primeiraReuniao?: string;
  parecerFinalAssinado?: string;
}

export interface StatusCount {
  name: string;
  value: number;
  color: string;
}

export interface UnidadeCount {
  name: string;
  value: number;
}

export const statusColors: Record<string, string> = {
  "Deferido": "hsl(var(--success))",
  "Indeferido": "hsl(var(--destructive))",
  "1. Pendente reunião da Comissão": "hsl(var(--warning))",
  "2. Pendente validação do parecer": "hsl(var(--info))",
  "3. Pendente Portaria": "hsl(var(--chart-4))",
  "Devolvido": "hsl(var(--muted-foreground))",
  "Em devolução": "hsl(var(--muted-foreground))",
  "Em reconsideração": "hsl(var(--warning))",
  "SEM AÇÕES NECESSÁRIAS": "hsl(var(--muted))",
};

export const getStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    "1. Pendente reunião da Comissão": "Pendente Reunião",
    "2. Pendente validação do parecer": "Pendente Validação",
    "3. Pendente Portaria": "Pendente Portaria",
    "SEM AÇÕES NECESSÁRIAS": "Sem Ações",
  };
  return statusMap[status] || status;
};

export const processExcelData = (rawData: any[]): ProcessData[] => {

  const processedData: ProcessData[] = [];
  
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    

    if (!row[1] || row[1] === 'NR PROCESSO') continue;
    
    const process: ProcessData = {
      item: row[0]?.toString() || '',
      numeroProcesso: row[1]?.toString() || '',
      unidade: row[2]?.toString() || '',
      uorg: row[3]?.toString() || '',
      setor: row[4]?.toString() || '',
      situacaoAtual: row[38]?.toString() || 'Sem Status',
      parecer: row[10]?.toString(),
      dataTramitacao: row[5]?.toString(),
      dataRecepcao: row[6]?.toString(),
      primeiraReuniao: row[7]?.toString(),
      parecerFinalAssinado: row[9]?.toString(),
    };
    
    processedData.push(process);
  }
  
  return processedData;
};

export const getStatusCounts = (data: ProcessData[]): StatusCount[] => {
  const counts: Record<string, number> = {};
  
  data.forEach(process => {
    const status = process.situacaoAtual || 'Sem Status';
    counts[status] = (counts[status] || 0) + 1;
  });
  
  return Object.entries(counts).map(([name, value]) => ({
    name: getStatusDisplayName(name),
    value,
    color: statusColors[name] || "hsl(var(--muted))",
  }));
};

export const getUnidadeCounts = (data: ProcessData[]): UnidadeCount[] => {
  const counts: Record<string, number> = {};
  
  data.forEach(process => {
    const unidade = process.unidade || 'Sem Unidade';
    counts[unidade] = (counts[unidade] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15); // Top 15 units
};
