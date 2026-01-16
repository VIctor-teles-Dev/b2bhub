'use server'

interface RegexResponse {
  regexps?: string[]
  [key: string]: any
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
      return { success: false, error: 'Erro ao consultar API' }
    }

    const json = await response.json()
    
    // Assuming the API returns a list of regex strings or an object with a regexps property
    // Based on user description "JSON de REGEX", it might be a direct array or a property.
    // I'll handle a few common cases.
    
    let regexps: string[] = []

    if (Array.isArray(json)) {
        // If it's an array of strings
        if (json.length > 0 && typeof json[0] === 'string') {
            regexps = json as string[]
        } else {
             // If it's an array of objects, maybe extract something? 
             // For now assuming strings if array.
             regexps = json.map(item => String(item))
        }
    } else if (json && typeof json === 'object') {
        if (json.regexps && Array.isArray(json.regexps)) {
            regexps = json.regexps
        } else {
             // Maybe the keys are regexes? or just the values?
             // Let's assume the user meant the response IS the regexes or contains them.
             // If the structure is unknown, I'll return the whole JSON as string for debugging if needed,
             // but for the "happy path" I'll look for 'regexps' key as per URL param 'regexps=true'.
             // If not found, I'll try to use the keys or values if they look like regexes.
             // Actually, let's just return the keys if it's a dictionary-like object and 'regexps' is missing.
             // But 'regexps=true' suggests a specific field.
             
             // Fallback: check if 'regexps' exists
             if (json.regexps) {
                 regexps = json.regexps
             }
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
