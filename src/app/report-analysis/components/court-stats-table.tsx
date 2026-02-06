"use client";

import { useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CourtStatsTableProps {
    tribunais: Record<string, number>;
    total: number;
}

export function CourtStatsTable({ tribunais, total }: CourtStatsTableProps) {
    const data = useMemo(() => {
        return Object.entries(tribunais)
            .map(([name, count]) => ({
                name,
                count,
                percentage: (count / total) * 100,
            }))
            .sort((a, b) => b.percentage - a.percentage);
    }, [tribunais, total]);

    return (
        <Card className="shadow-none border-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-bold text-slate-800">
                    Distribuição por Tribunal
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[150px]">Tribunal</TableHead>
                                <TableHead className="text-right w-[100px]">Qtd.</TableHead>
                                <TableHead className="w-[200px]">Frequência</TableHead>
                                <TableHead className="text-right w-[80px]">%</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.name}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right text-slate-500">
                                        {item.count}
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#0A4D3C] rounded-full"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {item.percentage.toFixed(1)}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
