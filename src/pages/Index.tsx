import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { UnidadeChart } from "@/components/dashboard/UnidadeChart";
import { ProcessTable } from "@/components/dashboard/ProcessTable";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCcw,
  Building2,
  Upload
} from "lucide-react";
import { 
  ProcessData, 
  getStatusCounts, 
  getUnidadeCounts,
  getStatusDisplayName 
} from "@/lib/processData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [data, setData] = useState<ProcessData[]>([]);
  const [filteredData, setFilteredData] = useState<ProcessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnidade, setSelectedUnidade] = useState("all");
  const [selectedSetor, setSelectedSetor] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();

  const processFile = async (arrayBuffer: ArrayBuffer) => {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const processedData: ProcessData[] = [];
    
    for (let i = 8; i < rawData.length; i++) {
      const row: any = rawData[i];
      if (!row[1]) continue;

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

    setData(processedData);
    setFilteredData(processedData);
    
    toast({
      title: "Dados carregados",
      description: `${processedData.length} processos carregados com sucesso.`,
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/data/pgd-data.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      await processFile(arrayBuffer);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do arquivo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls).",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      await processFile(arrayBuffer);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erro ao processar arquivo",
        description: "Não foi possível processar o arquivo enviado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = data;

    if (selectedUnidade !== "all") {
      filtered = filtered.filter((p) => p.unidade === selectedUnidade);
    }

    if (selectedSetor !== "all") {
      filtered = filtered.filter((p) => p.setor === selectedSetor);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((p) => p.situacaoAtual === selectedStatus);
    }

    setFilteredData(filtered);
  }, [data, selectedUnidade, selectedSetor, selectedStatus]);

  const unidades = Array.from(new Set(data.map((p) => p.unidade).filter(u => u && u.trim()))).sort();
  const setores = Array.from(new Set(data.map((p) => p.setor).filter(s => s && s.trim()))).sort();
  const statuses = Array.from(new Set(data.map((p) => p.situacaoAtual).filter(s => s && s.trim()))).sort();

  const totalProcessos = filteredData.length;
  const deferidos = filteredData.filter((p) => p.situacaoAtual === "Deferido").length;
  const indeferidos = filteredData.filter((p) => p.situacaoAtual === "Indeferido").length;
  const pendentes = filteredData.filter((p) => 
    p.situacaoAtual.includes("Pendente") || 
    p.situacaoAtual.includes("pendente")
  ).length;

  const statusCounts = getStatusCounts(filteredData);
  const unidadeCounts = getUnidadeCounts(filteredData);
  const uniqueUnidades = new Set(filteredData.map(p => p.unidade)).size;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <RefreshCcw className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Carregando dados do PGD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard PGD
              </h1>
              <p className="text-muted-foreground mt-1">
                Programa de Gestão e Desempenho - Acompanhamento de Processos
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Recarregar
              </Button>
              <Button variant="default" size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Planilha
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <FilterPanel
          unidades={unidades}
          setores={setores}
          statuses={statuses}
          selectedUnidade={selectedUnidade}
          selectedSetor={selectedSetor}
          selectedStatus={selectedStatus}
          onUnidadeChange={setSelectedUnidade}
          onSetorChange={setSelectedSetor}
          onStatusChange={setSelectedStatus}
          onClearFilters={() => {
            setSelectedUnidade("all");
            setSelectedSetor("all");
            setSelectedStatus("all");
          }}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Processos"
            value={totalProcessos}
            icon={FileText}
            description="Processos no sistema"
          />
          <MetricCard
            title="Deferidos"
            value={deferidos}
            icon={CheckCircle2}
            description={`${totalProcessos > 0 ? ((deferidos / totalProcessos) * 100).toFixed(1) : 0}% do total`}
          />
          <MetricCard
            title="Indeferidos"
            value={indeferidos}
            icon={XCircle}
            description={`${totalProcessos > 0 ? ((indeferidos / totalProcessos) * 100).toFixed(1) : 0}% do total`}
          />
          <MetricCard
            title="Pendentes"
            value={pendentes}
            icon={Clock}
            description="Aguardando análise"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <StatusChart data={statusCounts} />
          <UnidadeChart data={unidadeCounts.slice(0, 10)} />
        </div>

        <ProcessTable data={filteredData} />
      </main>

      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Dashboard PGD - Atualizado automaticamente
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
