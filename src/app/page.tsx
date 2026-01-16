import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSearch, BarChart, Settings, Inbox } from "lucide-react"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-sidebar-foreground">Painel de Automação</h1>
        <p className="text-muted-foreground">
          Centralize as suas operações e agilize o fluxo jurídico da Jus Soluções.
        </p>
      </div>
      
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {/* Card 1: Encontrar Tribunal por CNJ */}
        <Link href="/court" className="contents">
          <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-sidebar-primary/50 cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary">
                <FileSearch className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Encontrar Tribunal por CNJ</CardTitle>
              <CardDescription className="mt-2 text-base">
                Identifique instantaneamente a qual tribunal pertence um número de processo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter>
              <Button variant="ghost" className="p-0 font-semibold text-sidebar-primary hover:bg-transparent hover:text-sidebar-primary/80">
                Abrir ferramenta <span className="ml-2">›</span>
              </Button>
            </CardFooter>
          </Card>
        </Link>

        {/* Card 2: Análise de Relatórios */}
        <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-sidebar-primary/50 cursor-pointer group">
          <CardHeader className="pb-2">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary">
              <BarChart className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Análise de Relatórios</CardTitle>
            <CardDescription className="mt-2 text-base">
              Automatize a leitura e extração de dados de relatórios jurídicos complexos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1" />
          <CardFooter>
            <Button variant="ghost" className="p-0 font-semibold text-sidebar-primary hover:bg-transparent hover:text-sidebar-primary/80">
              Abrir ferramenta <span className="ml-2">›</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Card 3: Análisar Destribuições de processos*/}
        <Link href="/distribution" className="contents">
          <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-sidebar-primary/50 cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary">
                <Inbox className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Análise de Distribuições</CardTitle>
              <CardDescription className="mt-2 text-base">
                Verifique a data e para quem foi distribuído o processo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter>
              <Button variant="ghost" className="p-0 font-semibold text-sidebar-primary hover:bg-transparent hover:text-sidebar-primary/80">
                Abrir ferramenta <span className="ml-2">›</span>
              </Button>
            </CardFooter>
          </Card>
        </Link>

        {/* Card 4: Validador de Regex */}
        <Link href="/regex-validator" className="contents">
          <Card className="flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-sidebar-primary/50 cursor-pointer group">
            <CardHeader className="pb-2">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary">
                <Settings className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Validador de Regex</CardTitle>
              <CardDescription className="mt-2 text-base">
                Valide partes do processo contra os padrões da empresa.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter>
              <Button variant="ghost" className="p-0 font-semibold text-sidebar-primary hover:bg-transparent hover:text-sidebar-primary/80">
                Abrir ferramenta <span className="ml-2">›</span>
              </Button>
            </CardFooter>
          </Card>
        </Link>

        {/* Card 5: Em Desenvolvimento */}
        <Card className="flex flex-col border-dashed bg-muted/50">
          <CardHeader className="pb-2 items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Settings className="h-6 w-6" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Em Desenvolvimento</CardTitle>
            <CardDescription className="mt-2 text-sm text-muted-foreground">
              Novas automações estão a ser preparadas para o setor.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
