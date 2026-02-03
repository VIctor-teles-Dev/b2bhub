'use server'

import { extractAndCleanCnj, formatCnj } from '@/lib/cnj-utils'

export interface DistributionData {
  cnj: string
  distribution_id: string
  distribution_sent: string
  distribution_date: string
  notified_at: string
  user_company_id: number
  user_company_name: string
}

interface DigestoResponseItem {
  $uri: string
  created_at: {
    $date: number
  }
  notified_at?: {
    $date: number
  }
  user_company_id: number
  user_company_name?: string
  data?: {
    distribuicaoData?: string
  }[]
}

// Union type to handle potential API response variations
type DigestoApiResponse =
  | DigestoResponseItem[]
  | { items: DigestoResponseItem[] }
  | DigestoResponseItem

export async function getDistributionData(cnj: string): Promise<{ success: boolean; data?: DistributionData[]; error?: string }> {
  const token = process.env.DIGESTO_API_TOKEN

  if (!token) {
    return { success: false, error: 'API token not configured' }
  }

  const cleanCnj = extractAndCleanCnj(cnj)

  if (!cleanCnj) {
    return { success: false }
  }

  const targetNumber = formatCnj(cleanCnj)

  const url = `https://op.digesto.com.br/api/monitored_event?where={"evt_type":4,"target_number":"${targetNumber}"}`

  try {
    console.log("Fetching URL:", url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return { success: false, error: 'Erro ao consultar API' }
    }

    const json = await response.json() as DigestoApiResponse

    let items: DigestoResponseItem[] = []

    if (Array.isArray(json)) {
      items = json
    } else if (json && typeof json === 'object') {
      if ('items' in json && Array.isArray(json.items)) {
        items = json.items
      } else if ('$uri' in json) {
        // Single object that looks like an item
        items = [json as DigestoResponseItem]
      }
    }

    if (items.length === 0) {
      return { success: false, error: 'Desculpe, esse processo não nos retornou informação' }
    }

    // Collect unique company IDs to avoid duplicate API calls
    const uniqueCompanyIds = [...new Set(items.map(item => item.user_company_id))]

    // Fetch company names in parallel
    const companyNamesMap = new Map<number, string>()
    await Promise.all(
      uniqueCompanyIds.map(async (companyId) => {
        const result = await getCompanyName(companyId)
        companyNamesMap.set(companyId, result.success && result.name ? result.name : 'N/A')
      })
    )

    const data: DistributionData[] = items.map(item => {
      // Extract distribution_id
      const uriParts = item.$uri ? item.$uri.split('/') : []
      const distribution_id = uriParts.length > 0 ? uriParts[uriParts.length - 1] : 'N/A'

      // Format created_at date
      const createdTimestamp = item.created_at?.$date
      const distribution_sent = createdTimestamp ? new Date(createdTimestamp).toLocaleString('pt-BR') : 'N/A'

      // Format notified_at date
      const notifiedTimestamp = item.notified_at?.$date
      const notified_at = notifiedTimestamp ? new Date(notifiedTimestamp).toLocaleString('pt-BR') : 'N/A'

      // Extract distribution_date from nested data array
      const rawDate = (item.data && item.data.length > 0 && item.data[0].distribuicaoData)
        ? item.data[0].distribuicaoData
        : null

      const distribution_date = rawDate ? rawDate.split('-').reverse().join('/') : 'N/A'

      return {
        cnj: targetNumber,
        distribution_id,
        distribution_sent,
        distribution_date,
        notified_at,
        user_company_id: item.user_company_id,
        user_company_name: companyNamesMap.get(item.user_company_id) || 'N/A'
      }
    })

    return {
      success: true,
      data
    }

  } catch (error) {
    console.error("Error fetching distribution data:", error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function getCompanyName(user_company_id: number): Promise<{ success: boolean; name?: string; error?: string }> {
  const token = process.env.DIGESTO_API_TOKEN

  if (!token) {
    return { success: false, error: 'API token not configured' }
  }

  const url = `https://op.digesto.com.br/api/admin/user_company/${user_company_id}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return { success: false, error: 'Erro ao consultar empresa' }
    }

    const json = await response.json()

    if (json && json.name) {
      return { success: true, name: json.name }
    }

    return { success: false, error: 'Nome da empresa não encontrado' }

  } catch (error) {
    console.error("Error fetching company name:", error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}
