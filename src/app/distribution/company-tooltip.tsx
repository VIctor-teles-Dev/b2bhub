'use client'

import { useState } from 'react'
import { getCompanyName } from './actions'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2 } from 'lucide-react'

interface CompanyTooltipProps {
  companyId: number
}

export function CompanyTooltip({ companyId }: CompanyTooltipProps) {
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open)
    if (open && !name && !loading && !error) {
      setLoading(true)
      try {
        const result = await getCompanyName(companyId)
        if (result.success && result.name) {
          setName(result.name)
        } else {
          setError(result.error || 'Nome não encontrado')
        }
      } catch (err) {
        setError('Erro ao carregar')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <span className="text-lg font-semibold text-slate-900 cursor-help border-b border-dotted border-slate-400">
            {companyId}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Carregando...</span>
            </div>
          ) : error ? (
            <span className="text-red-400">{error}</span>
          ) : (
            <span className="font-medium">{name}</span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
