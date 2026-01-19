'use server'

interface RegexApiResponse {
  regexps?: string[]
  [key: string]: unknown
}

export async function getRegexPatterns(userCompanyId: string): Promise<{ success: boolean; regexps?: string[]; error?: string }> {
  const token = process.env.DIGESTO_API_TOKEN

  if (!token) {
    return { success: false, error: 'API token not configured' }
  }

  const url = `https://op.digesto.com.br/api/admin/user_company/${userCompanyId}/all_parte_ids?regexps=true`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return { success: false, error: 'Erro ao consultar API, por favor verifique o ID da empresa' }
    }

    const json = await response.json() as string[] | RegexApiResponse
    
    let regexps: string[] = []

    if (Array.isArray(json)) {
        // Handle direct array response
        regexps = json.filter((item): item is string => typeof item === 'string')
    } else if (json && typeof json === 'object') {
        // Handle object response with regexps property
        if (Array.isArray(json.regexps)) {
            regexps = json.regexps.filter((item): item is string => typeof item === 'string')
        }
    }

    return {
        success: true,
        regexps
    }

  } catch (error) {
    console.error("Error fetching regex patterns:", error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}
