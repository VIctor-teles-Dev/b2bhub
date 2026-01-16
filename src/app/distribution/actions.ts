'use server'

interface DistributionData {
  cnj: string
  distribution_id: string
  distribution_sent: string
  distribution_date: string
  user_company_id: number
}

interface DigestoResponse {
  $uri: string
  created_at: {
    $date: number
  }
  user_company_id: number
  data?: {
    distribuicaoData?: string
  }[]
}

export async function getDistributionData(cnj: string): Promise<{ success: boolean; data?: DistributionData[]; error?: string }> {
  const token = process.env.DIGESTO_API_TOKEN

  if (!token) {
    return { success: false, error: 'API token not configured' }
  }

  // Format CNJ: Remove non-numeric, then apply mask xxxxxxx-xx.xxxx.x.xx.xxxx
  const cleanCnj = cnj.replace(/\D/g, '')
  
  // Mask: 0000000-00.0000.0.00.0000
  const formattedCnj = cleanCnj.replace(
    /^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})$/,
    "$1-$2.$3.$4.$5.$6"
  )

  const targetNumber = formattedCnj === cleanCnj && cleanCnj.length === 20 ? 
    cleanCnj.replace(/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})$/, "$1-$2.$3.$4.$5.$6") : 
    formattedCnj

  const url = `https://op.digesto.com.br/api/monitored_event?where={"evt_type":4,"target_number":"${targetNumber}"}`

  try {
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

    const json = await response.json()

    let items: DigestoResponse[] = []

    if (Array.isArray(json)) {
        items = json
    } else if (json && typeof json === 'object') {
         if ('items' in json && Array.isArray(json.items)) {
             items = json.items
         } else {
             // Single object
             items = [json as DigestoResponse]
         }
    }

    if (items.length === 0) {
         return { success: false, error: 'Desculpe, esse processo não nos retornou informação' }
    }

    const data: DistributionData[] = items.map(item => {
        // Extract distribution_id
        const uriParts = item.$uri ? item.$uri.split('/') : []
        const distribution_id = uriParts.length > 0 ? uriParts[uriParts.length - 1] : 'N/A'

        // Format date
        const timestamp = item.created_at?.$date
        const distribution_sent = timestamp ? new Date(timestamp).toLocaleString('pt-BR') : 'N/A'
        
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
            user_company_id: item.user_company_id
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
