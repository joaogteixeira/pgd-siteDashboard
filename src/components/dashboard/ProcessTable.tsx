import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProcessData, statusColors, getStatusDisplayName } from "@/lib/processData";
import { Search } from "lucide-react";

interface ProcessTableProps {
  data: ProcessData[];
}

export const ProcessTable = ({ data }: ProcessTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredData = data.filter(
    (process) =>
      process.numeroProcesso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.unidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.setor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.situacaoAtual.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadgeVariant = (status: string) => {
    if (status.includes("Deferido")) return "default";
    if (status.includes("Indeferido")) return "destructive";
    if (status.includes("Pendente")) return "secondary";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento dos Processos</CardTitle>
        <CardDescription>
          Lista completa com {filteredData.length} processos
        </CardDescription>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por processo, unidade, setor ou status..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Nº Processo</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Status Atual</TableHead>
                <TableHead>Parecer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((process, index) => (
                <TableRow key={`${process.numeroProcesso}-${index}`}>
                  <TableCell className="font-mono text-xs">
                    {process.numeroProcesso}
                  </TableCell>
                  <TableCell className="font-medium">{process.unidade}</TableCell>
                  <TableCell className="text-sm">{process.setor}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(process.situacaoAtual)}
                      className="whitespace-nowrap"
                    >
                      {getStatusDisplayName(process.situacaoAtual)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {process.parecer && (
                      <Badge
                        variant={
                          process.parecer === "Deferido" ? "default" : "destructive"
                        }
                      >
                        {process.parecer}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
