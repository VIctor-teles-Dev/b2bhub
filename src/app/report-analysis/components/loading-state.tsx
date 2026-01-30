"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = "Iniciando..." }: LoadingStateProps) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-[#0A4D3C]" />
                <span className="font-medium">{message}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-[400px] w-full rounded-[2rem]" />
                <Skeleton className="h-[400px] w-full rounded-[2rem]" />
            </div>
        </div>
    );
}
