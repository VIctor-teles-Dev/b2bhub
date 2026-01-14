"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Interface for Court Mapping
interface CourtMap {
  [key: string]: string;
}

interface AnalysisResult {
  counts: { [court: string]: number };
  total: number;
}

const COURT_MAP: CourtMap = {
  "801": "TJAC", "802": "TJAL", "803": "TJAP", "804": "TJAM", "805": "TJBA",
  "806": "TJCE", "807": "TJDFT", "808": "TJES", "809": "TJGO", "810": "TJMA",
  "811": "TJMT", "812": "TJMS", "813": "TJMG", "814": "TJPA", "815": "TJPB",
  "816": "TJPR", "817": "TJPE", "818": "TJPI", "819": "TJRJ", "820": "TJRN",
  "821": "TJRS", "822": "TJRO", "823": "RR", "824": "TJSC", "825": "TJSE",
  "826": "TJSP", "827": "TJTO", "401": "TRF1", "402": "TRF2", "403": "TRF3",
  "404": "TRF4", "405": "TRF5", "406": "TRF6", "501": "TRT1", "502": "TRT2",
  "503": "TRT3", "515": "TRT15"
};

export default function CourtPage() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    const items = inputText.split(/[,\s\n]+/);
    const counts: { [key: string]: number } = {};
    let total = 0;

    items.forEach(item => {
      // Remove non-digits
      const clean = item.replace(/\D/g, "");

      // CNJ Pattern: NNNNNNN-DD.YYYY.J.TR.OOOO
      // We need the TR part (positions -7 to -4)
      if (clean.length >= 14) {
        const courtCode = clean.slice(-7, -4);
        const courtName = COURT_MAP[courtCode];
        
        if (courtName) {
          counts[courtName] = (counts[courtName] || 0) + 1;
          total++;
        }
      }
    });

    setResults({ counts, total });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-600 mb-8 tracking-wide uppercase"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Link>

        {/* Main Card */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                Localizador de Órgão
              </h1>
              <p className="text-slate-500 text-lg">
                Identificação imediata de competência por número de processo.
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-4 mb-8">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">
                Inserir Números CNJ
              </label>
              <div className="flex flex-col gap-4">
                <textarea
                  placeholder="Cole os números dos processos aqui (separados por espaço, vírgula ou uma nova linha)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full min-h-[120px] p-4 text-base bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#0A4D3C]/20 focus:border-[#0A4D3C] rounded-xl outline-none transition-all resize-y font-mono text-slate-600 placeholder:text-slate-300"
                />
                <Button 
                  onClick={handleAnalyze}
                  className="h-14 w-full md:w-auto self-end px-8 bg-[#0A4D3C] hover:bg-[#083828] text-white rounded-xl text-base font-semibold shadow-lg shadow-emerald-900/10 transition-all hover:shadow-emerald-900/20"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Analisar
                </Button>
              </div>
            </div>

            {/* Results Display */}
            {results && results.total > 0 && (
              <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-top-2">
                {/* Total Card */}
                <div className="bg-[#E6F7F5] rounded-xl p-6 border border-[#B3E5DD]">
                  <p className="text-xs font-bold text-[#0A4D3C] uppercase tracking-wider mb-1">
                    Total Analisado
                  </p>
                  <p className="text-3xl font-black text-[#0A4D3C]">
                    {results.total} <span className="text-lg font-medium text-[#0A4D3C]/80">processos</span>
                  </p>
                </div>

                {/* Breakdown List */}
                <div className="space-y-2">
                  {Object.entries(results.counts).map(([court, count]) => (
                    <div key={court} className="bg-slate-50 rounded-xl p-4 flex items-center justify-between border border-slate-100">
                      <span className="text-lg font-black text-slate-700">[{court}]</span>
                      <span className="text-lg font-medium text-[#1D9B8C]">{count} processo(s)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results && results.total === 0 && inputText.trim().length > 0 && (
               <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-center animate-in fade-in">
                 Nenhum número de processo válido encontrado.
               </div>
            )}

            {/* Info Box */}
            <Alert className="bg-slate-50 border-none rounded-xl p-6 flex items-start gap-4">
              <Info className="w-6 h-6 text-slate-400 mt-0.5 flex-shrink-0" />
              <AlertDescription className="text-slate-500 text-base leading-relaxed italic">
                A nossa ferramenta utiliza o padrão estabelecido pela Resolução CNJ nº 65/2008 
                para identificar automaticamente o tribunal de origem.
              </AlertDescription>
            </Alert>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
