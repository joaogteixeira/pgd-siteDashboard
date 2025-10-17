import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { UnidadeCount } from "@/lib/processData";

interface UnidadeChartProps {
  data: UnidadeCount[];
}

export const UnidadeChart = ({ data }: UnidadeChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Processos por Unidade</CardTitle>
        <CardDescription>Top 15 unidades com mais processos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
