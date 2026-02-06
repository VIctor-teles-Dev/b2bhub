g"use client";

import { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, PieChart as PieChartIcon, List } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ReportStats } from "../types";
import { ProcessListTable } from "./process-list-table";
import { getTribunalFromCnj } from "../court-mapping";

interface SummaryDetailsProps {
    stats: ReportStats[];
    children: React.ReactNode;
}

const COLORS = ["#0A4D3C", "#00C896", "#FFbb28", "#FF8042", "#8884d8"];

export function SummaryDetails({ stats, children }: SummaryDetailsProps) {
    const [open, setOpen] = useState(false);

    // 1. Aggregation Logic
    const aggregated = useMemo(() => {
        let totalProcesses = 0;
        const tribunalCounts: Record<string, number> = {};
        const allNumbers: string[] = [];

        stats.forEach((stat) => {
            totalProcesses += stat.total_atrasados;
            
            // Consolidate numbers
            if (stat.numbers) {
                allNumbers.push(...stat.numbers);
            }

            // Consolidate tribunal counts
            Object.entries(stat.tribunais).forEach(([tribunal, count]) => {
                tribunalCounts[tribunal] = (tribunalCounts[tribunal] || 0) + count;
            });
        });

        // Sort tribunals for "Top 5"
        const sortedTribunais = Object.entries(tribunalCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([name, value]) => ({ name, value }));

        const top5Names = new Set(sortedTribunais.slice(0, 5).map(t => t.name));
        const filteredNumbers = Array.from(new Set(allNumbers.filter(num => {
            const tribunal = getTribunalFromCnj(num);
            return tribunal && top5Names.has(tribunal);
        })));

        return {
            totalProcesses,
            tribunalCounts,
            allNumbers: filteredNumbers,
            top5: sortedTribunais.slice(0, 5),
            chartData: sortedTribunais.slice(0, 5), // Pie chart data
        };
    }, [stats]);

    const handleDownloadAll = () => {
        const headers = ["Processo", "Tribunal", "Report_ID"];
        const rows: string[] = [];

        stats.forEach(stat => {
             stat.numbers?.forEach(num => {
                 const tribunal = getTribunalFromCnj(num) || "Desconhecido";
                 rows.push(`${num},${tribunal},${stat.report_id}`);
             });
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "resumo_processos_consolidado.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-7xl w-[90vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                Resumo Consolidado
                            </DialogTitle>
                            <DialogDescription>
                                Análise agregada de {stats.length} relatórios processados.
                                <span className="ml-2 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                                    Total: {aggregated.totalProcesses.toLocaleString()} processos
                                </span>
                            </DialogDescription>
                        </div>
                        <Button size="sm" onClick={handleDownloadAll}>
                            <Download className="mr-2 h-4 w-4" />
                            Baixar CSV Consolidado
                        </Button>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="chart" className="mt-6">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="chart">
                            <PieChartIcon className="mr-2 h-4 w-4" />
                            Gráfico (Top 5)
                        </TabsTrigger>
                        <TabsTrigger value="list">
                            <List className="mr-2 h-4 w-4" />
                            Lista Completa
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chart" className="mt-4 min-h-[400px] flex flex-col items-center justify-center">
                        <div className="w-full h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={aggregated.chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={150}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {aggregated.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-sm text-slate-500 mt-4 text-center italic">
                            * Exibindo apenas os 5 tribunais com maior incidência.
                        </p>
                    </TabsContent>

                    <TabsContent value="list" className="mt-4">
                        <ProcessListTable 
                            numbers={aggregated.allNumbers} 
                            stats={aggregated.tribunalCounts}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
