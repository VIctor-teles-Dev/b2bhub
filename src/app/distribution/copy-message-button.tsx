'use client'

import { useState } from 'react'
import { getCompanyName } from './actions'
import { Button } from '@/components/ui/button'
import { Copy, Check, Loader2 } from 'lucide-react'

interface CopyMessageButtonProps {
  cnj: string
  distributionId: string
  distributionDate: string
  userCompanyId: number
}

export function CopyMessageButton({
  cnj,
  distributionId,
  distributionDate,
  userCompanyId
}: CopyMessageButtonProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Bom dia'
    if (hour >= 12 && hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const handleCopy = async () => {
    setLoading(true)
    try {
      // Fetch company name
      const result = await getCompanyName(userCompanyId)
      const companyName = result.success && result.name ? result.name : 'Empresa Desconhecida'

      const greeting = getGreeting()
      const message = `${greeting}, tudo bem? Notamos que ${distributionDate} foi distribuido o processo ${cnj} sob o ID ${distributionId} para  ${companyName} (${userCompanyId}).`

      await navigator.clipboard.writeText(message)
      
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={loading}
      className={`
        transition-all duration-200 
        ${copied ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'hover:bg-slate-50'}
      `}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          Copiar mensagem
        </>
      )}
    </Button>
  )
}
