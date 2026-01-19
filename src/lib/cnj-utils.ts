/**
 * Regex para extrair CNJ de um texto misto.
 * Captura uma sequência de pelo menos 15 dígitos/pontos/traços que não é precedida ou seguida por um dígito.
 */
export const CNJ_EXTRACTION_REGEX = /(?:^|\D)([\d.-]{15,})(?:\D|$)/;

/**
 * Regex para validar o formato de um CNJ limpo (apenas números).
 * Deve ter exatamente 20 dígitos.
 */
export const CNJ_LENGTH = 20;

/**
 * Regex para formatar um CNJ de 20 dígitos no padrão NNNNNNN-NN.NNNN.N.NN.NNNN
 */
export const CNJ_FORMAT_REGEX = /^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})$/;

/**
 * Extrai e limpa um CNJ de uma string de entrada.
 * Retorna null se não encontrar um padrão válido ou se o tamanho for incorreto.
 */
export function extractAndCleanCnj(input: string): string | null {
  const match = input.match(CNJ_EXTRACTION_REGEX);
  
  if (!match) {
    return null;
  }

  // match[1] contém o grupo capturado com o potencial CNJ
  const cleanCnj = match[1].replace(/\D/g, '');

  if (cleanCnj.length !== CNJ_LENGTH) {
    return null;
  }

  return cleanCnj;
}

/**
 * Formata um CNJ limpo (20 dígitos) para o padrão com pontuação.
 * Retorna a string original se não der match no formato esperado (embora extractAndCleanCnj garanta 20 chars).
 */
export function formatCnj(cleanCnj: string): string {
  return cleanCnj.replace(
    CNJ_FORMAT_REGEX,
    "$1-$2.$3.$4.$5.$6"
  );
}
