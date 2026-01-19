
import { Calendar, Building2, Hash } from 'lucide-react'
import { CompanyTooltip } from '@/app/distribution/company-tooltip'
import { CopyMessageButton } from '@/app/distribution/copy-message-button'
import { isSentBeforeDistributed } from '@/lib/date-utils'

interface DistributionResult {
  cnj: string
  distribution_id: string
  distribution_sent: string
  distribution_date: string
  user_company_id: number
}

interface DistributionCardProps {
  item: DistributionResult
  cnj: string
}

export function DistributionCard({ item, cnj }: DistributionCardProps) {
  const isDiscrepancy = isSentBeforeDistributed(item.distribution_sent, item.distribution_date)

  return (
    <div className="p-6 hover:bg-slate-50/50 transition-colors">
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
  )
}
