"use client";

import { useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getTribunalFromCnj } from "../court-mapping";
import { Search } from "lucide-react";

interface ProcessListTableProps {
    numbers: string[];
    stats?: Record<string, number>;
}

export function ProcessListTable({ numbers, stats }: ProcessListTableProps) {
    const [filterTribunal, setFilterTribunal] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");

    const data = useMemo(() => {
        // Dedup numbers just in case
        const uniqueNumbers = Array.from(new Set(numbers));
        return uniqueNumbers.map((num) => ({
            number: num,
            tribunal: getTribunalFromCnj(num) || "Desconhecido",
        }));
    }, [numbers]);

    const tribunais = useMemo(() => {
        const unique = Array.from(new Set(data.map((d) => d.tribunal)));
        
        if (!stats) return unique.sort();

        // Sort by frequency in stats (descending)
        return unique.sort((a, b) => {
            const countA = stats[a] || 0;
            const countB = stats[b] || 0;
            return countB - countA;
        });
    }, [data, stats]);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesTribunal =
                filterTribunal === "all" || item.tribunal === filterTribunal;
            const matchesSearch = item.number.includes(searchTerm);
            return matchesTribunal && matchesSearch;
        });
    }, [data, filterTribunal, searchTerm]);

    return (
        <Card className="shadow-none border-none">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">
                    Lista de Processos ({filteredData.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar processo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-[200px] pl-9"
                        />
                    </div>
                    <Select
                        value={filterTribunal}
                        onValueChange={setFilterTribunal}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por Tribunal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Tribunais</SelectItem>
                            {tribunais.map((t) => (
                                <SelectItem key={t} value={t}>
                                    {t}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="rounded-lg border border-slate-200 overflow-hidden max-h-[500px] overflow-y-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 sticky top-0 z-10">
                            <TableRow>
                                <TableHead>Número do Processo</TableHead>
                                <TableHead className="w-[200px]">Tribunal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <TableRow key={item.number}>
                                        <TableCell className="font-mono text-slate-600">
                                            {item.number}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {item.tribunal}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={2}
                                        className="h-24 text-center text-slate-500"
                                    >
                                        Nenhum processo encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
