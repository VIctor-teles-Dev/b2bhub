"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Activity } from "lucide-react";
import { ReportStats } from "../types";
import { getTribunalFromCnj } from "../court-mapping";
import { CourtStatsTable } from "./court-stats-table";
import { ProcessListTable } from "./process-list-table";

interface ReportDetailsProps {
    stat: ReportStats;
    children: React.ReactNode;
}

export function ReportDetails({ stat, children }: ReportDetailsProps) {
    const handleDownload = () => {
        // Generate CSV content
        const headers = ["Processo", "Tribunal"];
        
        const rows = stat.numbers.map((num) => {
            const tribunal = getTribunalFromCnj(num) || "Desconhecido";
            return `${num},${tribunal}`;
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `report_${stat.report_id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-7xl w-[90vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <div>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                Relatório #{stat.report_id}
                                <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                                    {stat.total_atrasados} processos
                                </span>
                            </DialogTitle>
                            <DialogDescription>
                                Detalhes completos da análise de distribuição.
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={stat.report_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Abrir Original
                                </a>
                            </Button>
                            <Button size="sm" onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" />
                                CSV
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="stats" className="mt-6">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                        <TabsTrigger value="list">Lista de Processos</TabsTrigger>
                    </TabsList>
                    <TabsContent value="stats" className="mt-4 space-y-4">
                        <CourtStatsTable
                            tribunais={stat.tribunais}
                            total={stat.total_atrasados}
                        />
                    </TabsContent>
                    <TabsContent value="list" className="mt-4">
                        <ProcessListTable numbers={stat.numbers} stats={stat.tribunais} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
