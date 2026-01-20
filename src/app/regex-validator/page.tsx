'use client'

import { useState } from 'react'
import { validatePartAgainstCompanies } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, ArrowLeft, CheckCircle2, XCircle, Info } from 'lucide-react'
import Link from 'next/link'

export default function RegexValidatorPage() {
  const [partInput, setPartInput] = useState('')
  const [companyIdInput, setCompanyIdInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ companyId: string; success: boolean; matchedRegex?: string; error?: string }[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleValidate = async () => {
    if (!partInput.trim() || !companyIdInput.trim()) return

    setLoading(true)
    setResults(null)
    setError(null)

    try {
      // Split by comma or space and filter out empty strings
      const companyIds = companyIdInput.split(/[\s,]+/).filter(id => id.trim() !== '')
      
      if (companyIds.length === 0) {
        setError('Por favor, insira pelo menos um ID de empresa.')
        setLoading(false)
        return
      }

      const validationResults = await validatePartAgainstCompanies(partInput, companyIds)
      setResults(validationResults)

    } catch (err) {
      setError('Ocorreu um erro ao validar.')
    } finally {
      setLoading(false)
    }
  }

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
              <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Validador de Regex</h1>
              <p className="text-slate-500 text-lg">
                Valide partes do processo contra os padrões de múltiplas empresas.
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="part" className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">
                  Digite a parte do processo
                </Label>
                <Input
                  id="part"
                  value={partInput}
                  onChange={(e) => setPartInput(e.target.value)}
                  placeholder="Ex: Autor, Réu..."
                  className="h-14 px-4 text-base bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#0A4D3C]/20 focus:border-[#0A4D3C] rounded-xl outline-none transition-all font-mono text-slate-600 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyId" className="text-xs font-bold text-slate-400 uppercase tracking-wider block ml-1">
                  Digite os Ids das empresas (separados por vírgula ou espaço)
                </Label>
                <Input
                  id="companyId"
                  value={companyIdInput}
                  onChange={(e) => setCompanyIdInput(e.target.value)}
                  placeholder="Ex: 123, 456 789"
                  className="h-14 px-4 text-base bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-[#0A4D3C]/20 focus:border-[#0A4D3C] rounded-xl outline-none transition-all font-mono text-slate-600 placeholder:text-slate-300"
                />
              </div>

              <Button 
                onClick={handleValidate} 
                disabled={loading || !partInput.trim() || !companyIdInput.trim()}
                className="h-14 w-full bg-[#0A4D3C] hover:bg-[#083828] text-white rounded-xl text-base font-semibold shadow-lg shadow-emerald-900/10 transition-all hover:shadow-emerald-900/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Validar
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2 mb-6">
                {error}
              </div>
            )}

            {results && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                {results.map((result, index) => (
                  <div 
                    key={`${result.companyId}-${index}`}
                    className={`p-6 rounded-xl border flex items-start gap-4 ${
                      result.success 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                        : 'bg-red-50 border-red-100 text-red-900'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h3 className={`font-bold text-lg mb-1 ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                        Company ID: {result.companyId}. <br></br> {result.success ? 'Regex Válida' : 'Regex Inválida'}
                      </h3>
                      <p className="text-base leading-relaxed">
                        {result.success 
                          ? `A parte "${partInput}" corresponde a ${result.matchedRegex}`
                          : (result.error || `A parte "${partInput}" não corresponde a nenhum regex cadastrado.`)
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Alert className="mt-8 bg-slate-50 border-none rounded-xl p-6 flex items-start gap-4">
              <Info className="w-6 h-6 text-slate-400 mt-0.5 flex-shrink-0" />
              <AlertDescription className="text-slate-500 text-base leading-relaxed italic">
                A validação é feita comparando a parte digitada com as expressões regulares (Regex) cadastradas para cada empresa informada.
              </AlertDescription>
            </Alert>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
