'use client'

import { useState } from 'react'
import { getDistributionData } from './actions'
import { CompanyTooltip } from './company-tooltip'
import { CopyMessageButton } from './copy-message-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, ArrowLeft, Info, Calendar, Building2, Hash } from 'lucide-react'
import Link from 'next/link'

interface DistributionResult {
  cnj: string
  distribution_id: string
  distribution_sent: string
  distribution_date: string
  user_company_id: number
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'N/A') return null
  // Format: DD/MM/YYYY
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
}

function parseDateTime(dateTimeStr: string): Date | null {
  if (!dateTimeStr || dateTimeStr === 'N/A') return null
  // Format: DD/MM/YYYY, HH:mm:ss
  const [datePart] = dateTimeStr.split(',')
  return parseDate(datePart)
}

function isSentBeforeDistributed(sent: string, distributed: string): boolean {
  const sentDate = parseDateTime(sent)
  const distDate = parseDate(distributed)

  if (!sentDate || !distDate) return false
  
  // Reset hours to compare only dates
  sentDate.setHours(0, 0, 0, 0)
  distDate.setHours(0, 0, 0, 0)

  return sentDate < distDate
}

export default function DistributionPage() {
  const [cnjInput, setCnjInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DistributionResult[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const handleSearch = async () => {
    if (!cnjInput.trim()) return

    setLoading(true)
    setResults([])
    setErrors([])

    // Split input by newlines, commas, or semicolons
    const cnjs = cnjInput.split(/[\n,;]+/).map(s => s.trim()).filter(s => s.length > 0)
    
    // Remove duplicates
    const uniqueCnjs = Array.from(new Set(cnjs))

    const newResults: DistributionResult[] = []
    const newErrors: string[] = []

    try {
      // Process sequentially to avoid overwhelming the API if many
      for (const cnj of uniqueCnjs) {
        const result = await getDistributionData(cnj)
        if (result.success && result.data) {
          newResults.push(...result.data)
        } else {
          if (result.error) {
             newErrors.push(`${cnj}: ${result.error}`)
          }
        }
      }
      
      setResults(newResults)
      setErrors(newErrors)

    } catch (err) {
      setErrors(prev => [...prev, 'Erro ao processar a solicitação'])
    } finally {
      setLoading(false)
    }
  }

  // Group results by CNJ
  const groupedResults = results.reduce((acc, curr) => {
    if (!acc[curr.cnj]) {
      acc[curr.cnj] = []
    }
    acc[curr.cnj].push(curr)
    return acc
  }, {} as Record<string, DistributionResult[]>)

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
      <div className="w-full max-w-3xl">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-600 mb-8 tracking-wide uppercase"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Link>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Consulta de Distribuição</h1>
              <p className="text-slate-500 text-lg">
                Identificação imediata de distribuição por número de processo.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <label 
                htmlFor="cnj" 
                className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1"
              >
                Inserir Números CNJ
              </label>
              <div className="flex flex-col gap-4">
                <textarea
                  id="cnj"
                  className="w-full min-h-[120px] p-4 text-base bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#0A4D3C]/20 focus:border-[#0A4D3C] rounded-xl outline-none transition-all resize-y font-mono text-slate-600 placeholder:text-slate-300"
                  placeholder="Cole os números dos processos aqui (separados por espaço, vírgula ou uma nova linha)..."
                  value={cnjInput}
                  onChange={(e) => setCnjInput(e.target.value)}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading || !cnjInput.trim()}
                  className="h-14 w-full md:w-auto self-end px-8 bg-[#0A4D3C] hover:bg-[#083828] text-white rounded-xl text-base font-semibold shadow-lg shadow-emerald-900/10 transition-all hover:shadow-emerald-900/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Analisar
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Alert className="bg-slate-50 border-none rounded-xl p-6 flex items-start gap-4">
              <Info className="w-6 h-6 text-slate-400 mt-0.5 flex-shrink-0" />
              <AlertDescription className="text-slate-500 text-base leading-relaxed italic">
                A nossa ferramenta utiliza o padrão estabelecido pela Resolução CNJ nº 65/2008 para identificar e formatar automaticamente o número do processo antes da consulta.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {errors.length > 0 && (
          <div className="space-y-2 mt-8 animate-in fade-in slide-in-from-top-2">
            {errors.map((err, index) => (
              <div key={index} className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                {err}
              </div>
            ))}
          </div>
        )}

        {Object.entries(groupedResults).length > 0 && (
          <div className="mt-8 space-y-6">
            {Object.entries(groupedResults).map(([cnj, items]) => (
              <Card key={cnj} className="border-none shadow-lg bg-white rounded-2xl animate-in fade-in slide-in-from-top-4 overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 p-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <span className="text-slate-400 font-medium text-base uppercase tracking-wider">Processo</span>
                    <span className="font-mono">{cnj}</span>
                    <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-[#E6F7F5] text-[#0A4D3C]">
                      {items.length} Distribuição(ões)
                    </span>
                  </h3>
                </div>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {items.map((item, index) => {
                      const isDiscrepancy = isSentBeforeDistributed(item.distribution_sent, item.distribution_date)
                      
                      return (
                      <div key={index} className="p-6 hover:bg-slate-50/50 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <Hash className="h-4 w-4" />
                              ID da Distribuição
                            </div>
                            <p className="text-lg font-semibold text-slate-900">{item.distribution_id}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <Calendar className="h-4 w-4" />
                              Data de Envio
                            </div>
                            <p className={`text-lg font-semibold ${isDiscrepancy ? 'text-red-600' : 'text-slate-900'}`}>
                              {item.distribution_sent}
                            </p>
                            <p className="text-xs text-slate-400">Distribuído: {item.distribution_date}</p>
                            {isDiscrepancy && (
                              <p className="text-xs text-red-500 font-medium mt-1">
                                A distribuição não foi enviada porque o processo foi distribuído depois da data que a distribuição foi solicitada
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <Building2 className="h-4 w-4" />
                              ID da Empresa
                            </div>
                            <p className="text-lg font-semibold text-slate-900">
                              <CompanyTooltip companyId={item.user_company_id} />
                            </p>
                          </div>
                          <div className="flex justify-end">
                            <CopyMessageButton 
                              cnj={cnj}
                              distributionId={item.distribution_id}
                              distributionDate={item.distribution_date}
                              distributionSent={item.distribution_sent}
                              userCompanyId={item.user_company_id}
                              isDiscrepancy={isDiscrepancy}
                            />
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
