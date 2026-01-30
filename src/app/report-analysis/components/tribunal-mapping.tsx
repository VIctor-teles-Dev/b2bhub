"use client";

interface TribunalMappingProps {
    tribunais: Record<string, number>;
}

export function TribunalMapping({ tribunais }: TribunalMappingProps) {
    const entries = Object.entries(tribunais);

    if (entries.length === 0) {
        return (
            <p className="text-center text-slate-300 text-sm italic">
                Nenhum tribunal identificado
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {entries.map(([tribunal, count]) => (
                <div key={tribunal} className="flex items-center justify-between text-sm group/item">
                    <span className="font-bold text-slate-500 group-hover/item:text-[#0A4D3C] transition-colors">
                        {tribunal}
                    </span>
                    <div className="flex-1 mx-3 border-b border-slate-100 border-dashed relative top-1" />
                    <span className="font-mono font-bold text-slate-900">{count}</span>
                </div>
            ))}
        </div>
    );
}
