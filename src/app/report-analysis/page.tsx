"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Search, ArrowUpRight, AlertTriangle, CheckCircle } from "lucide-react";
import { startScraping, checkStatus } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportStats {
    report_id: string;
    report_url: string;
    total_atrasados: number;
    tribunais: Record<string, number>;
    total_tribunais: number;
    progress: string;
}

interface TaskStatus {
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
    message: string;
    stats?: ReportStats[];
    errors?: string[];
}

export default function ReportAnalysisPage() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);

    const handleStart = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setTaskStatus(null);
        setTaskId(null);

        try {
            const result = await startScraping(input);
            if (result.error) {
                setTaskStatus({ status: 'ERROR', message: result.error });
                setLoading(false);
            } else if (result.taskId) {
                setTaskId(result.taskId);
                // Loading remains true while polling
            }
        } catch (e) {
            setTaskStatus({ status: 'ERROR', message: "Erro ao iniciar análise." });
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (taskId) {
            interval = setInterval(async () => {
                try {
                    const status = await checkStatus(taskId);
                    if (status.error) {
                        setTaskStatus({ status: 'ERROR', message: status.error });
                        setTaskId(null);
                        setLoading(false);
                        return;
                    }

                    setTaskStatus(status);

                    if (status.status === 'COMPLETED' || status.status === 'ERROR') {
                        setTaskId(null);
                        setLoading(false);
                    }
                } catch (e) {
                    console.error("Polling error", e);
                }
            }, 2000);
        }

        return () => clearInterval(interval);
    }, [taskId]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 bg-slate-50/30">
            <div className="w-full max-w-5xl space-y-8">

                <div className="text-center space-y-3 mb-12">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Análise de Relatórios</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Cole os IDs dos relatórios do Digesto para extrair automaticamente as métricas de atraso e distribuição por tribunal.
                    </p>
                </div>

                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white ring-1 ring-slate-100">
                    <CardContent className="p-8 md:p-12 space-y-8">
                        <div className="space-y-4">
                            <label htmlFor="report-ids" className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">
                                IDs dos Relatórios
                            </label>
                            <div className="relative">
                                <textarea
                                    id="report-ids"
                                    className="w-full min-h-[120px] p-6 text-lg bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#0A4D3C]/20 focus:border-[#0A4D3C] rounded-2xl outline-none transition-all resize-y font-mono text-slate-700 placeholder:text-slate-300"
                                    placeholder="Ex: 348341, 123456..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={loading}
                                />
                                <div className="absolute bottom-4 right-4">
                                    <Button
                                        onClick={handleStart}
                                        disabled={loading || !input.trim()}
                                        className="h-12 px-6 bg-[#0A4D3C] hover:bg-[#083828] text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/10 transition-all hover:shadow-emerald-900/20 hover:scale-105 active:scale-95"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processando
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-4 w-4" />
                                                Analisar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && !taskStatus?.stats && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Loader2 className="h-5 w-5 animate-spin text-[#0A4D3C]" />
                                    <span className="font-medium">{taskStatus?.message || "Iniciando..."}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Skeleton className="h-[400px] w-full rounded-[2rem]" />
                                    <Skeleton className="h-[400px] w-full rounded-[2rem]" />
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {taskStatus?.status === 'ERROR' && (
                            <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Erro na Análise</AlertTitle>
                                <AlertDescription>{taskStatus.message}</AlertDescription>
                            </Alert>
                        )}

                        {/* Results Grid */}
                        {taskStatus?.stats && taskStatus.stats.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-8 duration-500">
                                {taskStatus.stats.map((stat) => {
                                    const progressValue = parseInt(stat.progress.replace('%', '')) || 0;

                                    return (
                                        <Card key={stat.report_id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-[2rem] overflow-hidden ring-1 ring-slate-100 group">
                                            <CardContent className="p-8 flex flex-col h-full">

                                                {/* Header */}
                                                <div className="mb-8">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID do Relatório</p>
                                                    <h2 className="text-4xl font-black text-[#0A4D3C] tracking-tight font-mono">{stat.report_id}</h2>
                                                </div>

                                                {/* Progress */}
                                                <div className="mb-8 space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progresso</span>
                                                        <span className="text-sm font-bold text-[#00C896]">{stat.progress}</span>
                                                    </div>
                                                    <Progress value={progressValue} className="h-2 bg-emerald-50" />
                                                </div>

                                                {/* Stats Blocks */}
                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="bg-slate-50 rounded-2xl p-4 text-center group-hover:bg-[#FFF5F5] transition-colors">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Atrasados</p>
                                                        <p className="text-3xl font-black text-red-500">{stat.total_atrasados}</p>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-2xl p-4 text-center group-hover:bg-[#F0FDF9] transition-colors">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tribunais</p>
                                                        <p className="text-3xl font-black text-[#0A4D3C]">{stat.total_tribunais}</p>
                                                    </div>
                                                </div>

                                                {/* Org Mapping */}
                                                <div className="flex-1 mb-8">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Mapeamento de Órgãos</p>
                                                    <div className="space-y-3">
                                                        {Object.entries(stat.tribunais).map(([tribunal, count]) => (
                                                            <div key={tribunal} className="flex items-center justify-between text-sm group/item">
                                                                <span className="font-bold text-slate-500 group-hover/item:text-[#0A4D3C] transition-colors">{tribunal}</span>
                                                                <div className="flex-1 mx-3 border-b border-slate-100 border-dashed relative top-1"></div>
                                                                <span className="font-mono font-bold text-slate-900">{count}</span>
                                                            </div>
                                                        ))}
                                                        {Object.keys(stat.tribunais).length === 0 && (
                                                            <p className="text-center text-slate-300 text-sm italic">Nenhum tribunal identificado</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Footer Button */}
                                                <a
                                                    href={stat.report_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full"
                                                >
                                                    <Button
                                                        variant="outline"
                                                        className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm group-hover:border-[#0A4D3C]/20 group-hover:text-[#0A4D3C] transition-all"
                                                    >
                                                        Acesse o relatório
                                                        <ArrowUpRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </a>

                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
