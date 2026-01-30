"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { TribunalMapping } from "./tribunal-mapping";
import type { ReportStats } from "../types";

interface ReportCardProps {
    stat: ReportStats;
}

export function ReportCard({ stat }: ReportCardProps) {
    const progressValue = parseInt(stat.progress.replace("%", "")) || 0;

    return (
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-[2rem] overflow-hidden ring-1 ring-slate-100 group">
            <CardContent className="p-8 flex flex-col h-full">
                {/* Header */}
                <div className="mb-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        ID do Relatório
                    </p>
                    <h2 className="text-4xl font-black text-[#0A4D3C] tracking-tight font-mono">
                        {stat.report_id}
                    </h2>
                </div>

                {/* Progress */}
                <div className="mb-8 space-y-2">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Progresso
                        </span>
                        <span className="text-sm font-bold text-[#00C896]">{stat.progress}</span>
                    </div>
                    <Progress value={progressValue} className="h-2 bg-emerald-50" />
                </div>

                {/* Stats Blocks */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 rounded-2xl p-4 text-center group-hover:bg-[#FFF5F5] transition-colors">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Atrasados
                        </p>
                        <p className="text-3xl font-black text-red-500">{stat.total_atrasados}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 text-center group-hover:bg-[#F0FDF9] transition-colors">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Tribunais
                        </p>
                        <p className="text-3xl font-black text-[#0A4D3C]">{stat.total_tribunais}</p>
                    </div>
                </div>

                {/* Tribunal Mapping */}
                <div className="flex-1 mb-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
                        Mapeamento de Órgãos
                    </p>
                    <TribunalMapping tribunais={stat.tribunais} />
                </div>

                {/* Footer Button */}
                <a href={stat.report_url} target="_blank" rel="noopener noreferrer" className="block w-full">
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
}
