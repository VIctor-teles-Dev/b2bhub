
import { Calendar, Building2, Hash, Bell } from 'lucide-react'
import { CopyMessageButton } from '@/app/distribution/copy-message-button'
import { isSentBeforeDistributed } from '@/lib/date-utils'

interface DistributionResult {
  cnj: string
  distribution_id: string
  distribution_sent: string
  distribution_date: string
  notified_at: string
  user_company_id: number
  user_company_name: string
}

interface DistributionCardProps {
  item: DistributionResult
  cnj: string
}

export function DistributionCard({ item, cnj }: DistributionCardProps) {
  const isDiscrepancy = isSentBeforeDistributed(item.distribution_sent, item.distribution_date)

  return (
    <div className="p-6 hover:bg-slate-50/50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
        {/* Info Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 flex-1 min-w-0">
          {/* ID da Distribuição */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Hash className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">ID Distribuição</span>
            </div>
            <p className="text-base font-semibold text-slate-900">{item.distribution_id}</p>
          </div>

          {/* Criado em */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Criado em</span>
            </div>
            <p className={`text-base font-semibold ${isDiscrepancy ? 'text-red-600' : 'text-slate-900'}`}>
              {item.distribution_sent}
            </p>
            <p className="text-xs text-slate-400">Dist: {item.distribution_date}</p>
            {isDiscrepancy && (
              <p className="text-xs text-red-500 font-medium mt-1">
                Posterior à solicitação
              </p>
            )}
          </div>

          {/* Notificado em */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Bell className="h-4 w-4 flex-shrink-0" />
              <span>Notificado em</span>
            </div>
            <p className="text-base font-semibold text-slate-900">
              {item.notified_at}
            </p>
          </div>

          {/* Dados da Empresa */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>Empresa</span>
            </div>
            <p className="text-base font-semibold text-slate-900">{item.user_company_id}</p>
            <p className="text-sm text-slate-600 truncate" title={item.user_company_name}>
              {item.user_company_name}
            </p>
          </div>
        </div>

        {/* Botão Copiar - Separado do grid */}
        <div className="flex lg:items-start lg:justify-end flex-shrink-0">
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
