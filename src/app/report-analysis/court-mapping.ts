/**
 * Court code to tribunal acronym mapping
 * Based on CNJ numbering standard
 */

/** Maps 3-digit court codes to tribunal acronyms */
export const COURT_MAP: Readonly<Record<string, string>> = {
    // State Courts (TJ)
    "801": "TJAC", "802": "TJAL", "803": "TJAP", "804": "TJAM", "805": "TJBA",
    "806": "TJCE", "807": "TJDFT", "808": "TJES", "809": "TJGO", "810": "TJMA",
    "811": "TJMT", "812": "TJMS", "813": "TJMG", "814": "TJPA", "815": "TJPB",
    "816": "TJPR", "817": "TJPE", "818": "TJPI", "819": "TJRJ", "820": "TJRN",
    "821": "TJRS", "822": "TJRO", "823": "TJRR", "824": "TJSC", "825": "TJSE",
    "826": "TJSP", "827": "TJTO",
    // Federal Regional Courts (TRF)
    "401": "TRF1", "402": "TRF2", "403": "TRF3", "404": "TRF4", "405": "TRF5", "406": "TRF6",
    // Labor Courts (TRT)
    "501": "TRT1", "502": "TRT2", "503": "TRT3", "504": "TRT4", "505": "TRT5",
    "506": "TRT6", "507": "TRT7", "508": "TRT8", "509": "TRT9", "510": "TRT10",
    "511": "TRT11", "512": "TRT12", "513": "TRT13", "514": "TRT14", "515": "TRT15",
    "516": "TRT16", "517": "TRT17", "518": "TRT18", "519": "TRT19", "520": "TRT20",
    "521": "TRT21", "522": "TRT22", "523": "TRT23", "524": "TRT24",
} as const;

/**
 * Extracts tribunal acronym from a CNJ number.
 * 
 * CNJ format: NNNNNNN-DD.YYYY.J.TR.OOOO
 * - NNNNNNN: Sequential number (7 digits)
 * - DD: Verification digit (2 digits)
 * - YYYY: Year (4 digits)
 * - J: Segment (1 digit)
 * - TR: Court code (2-3 digits)
 * - OOOO: Origin unit (4 digits)
 * 
 * @param cnj - CNJ number (formatted or raw)
 * @returns Tribunal acronym or null if invalid
 */
export function getTribunalFromCnj(cnj: string): string | null {
    const clean = cnj.replace(/\D/g, "");

    if (clean.length < 14) return null;

    // Court code is at position -7 to -4 (exclusive) in the clean number
    const courtCode = clean.slice(-7, -4);
    return COURT_MAP[courtCode] ?? `Tribunal ${courtCode}`;
}
