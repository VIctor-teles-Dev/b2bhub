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

export type ValidationResult = {
  companyId: string
  success: boolean
  matchedRegex?: string
  error?: string
}

export async function validatePartAgainstCompanies(part: string, companyIds: string[]): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []

  for (const companyId of companyIds) {
    const response = await getRegexPatterns(companyId)

    if (!response.success || !response.regexps) {
      results.push({
        companyId,
        success: false,
        error: response.error || 'Não foi possível obter os regexes da empresa.'
      })
      continue
    }

    let matchedRegex: string | undefined

    for (const pattern of response.regexps) {
      try {
        const regex = new RegExp(pattern)
        if (regex.test(part)) {
          matchedRegex = pattern
          break
        }
      } catch (e) {
        console.warn(`Invalid regex pattern received for company ${companyId}: ${pattern}`, e)
      }
    }

    if (matchedRegex) {
      results.push({
        companyId,
        success: true,
        matchedRegex
      })
    } else {
      results.push({
        companyId,
        success: false,
        error: 'Nenhuma correspondência encontrada.'
      })
    }
  }

  return results
}
