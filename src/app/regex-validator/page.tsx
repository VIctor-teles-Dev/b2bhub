'use client'

import { useState } from 'react'
import { getRegexPatterns } from './actions'
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
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleValidate = async () => {
    if (!partInput.trim() || !companyIdInput.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await getRegexPatterns(companyIdInput)

      if (!response.success || !response.regexps) {
        setError(response.error || 'Não foi possível obter os regexes da empresa.')
        return
      }

      const regexps = response.regexps
      let matchedRegex = null

      for (const pattern of regexps) {
        try {
          // Create regex from string. 
          // Note: Regex from API might come as string like "^foo$". 
          // We need to be careful about flags if they are included in the string or not.
          // Usually API returns just the pattern.
          const regex = new RegExp(pattern)
          if (regex.test(partInput)) {
            matchedRegex = pattern
            break
          }
        } catch (e) {
          console.warn(`Invalid regex pattern received: ${pattern}`, e)
        }
      }

      if (matchedRegex) {
        setResult({
          success: true,
          message: `A parte "${partInput}" digitada corresponde a ${matchedRegex}`
        })
      } else {
        setResult({
          success: false,
          message: `A parte "${partInput}" não corresponde a nenhum regex cadastrado.`
        })
      }

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
                Valide partes do processo contra os padrões da empresa.
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
                  Digite o Id da empresa
                </Label>
                <Input
                  id="companyId"
                  value={companyIdInput}
                  onChange={(e) => setCompanyIdInput(e.target.value)}
                  placeholder="Ex: 123"
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
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {result && (
              <div className={`p-6 rounded-xl border animate-in fade-in slide-in-from-top-2 flex items-start gap-4 ${
                result.success 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
                  : 'bg-red-50 border-red-100 text-red-900'
              }`}>
                {result.success ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-bold text-lg mb-1 ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                    {result.success ? 'Regex Válida' : 'Nenhuma correspondência encontrada'}
                  </h3>
                  <p className="text-base leading-relaxed">
                    {result.message}
                  </p>
                </div>
              </div>
            )}

            <Alert className="mt-8 bg-slate-50 border-none rounded-xl p-6 flex items-start gap-4">
              <Info className="w-6 h-6 text-slate-400 mt-0.5 flex-shrink-0" />
              <AlertDescription className="text-slate-500 text-base leading-relaxed italic">
                A validação é feita comparando a parte digitada com as expressões regulares (Regex) cadastradas para a empresa informada.
              </AlertDescription>
            </Alert>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
