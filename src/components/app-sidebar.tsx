import * as React from "react"
import { Home, Search, FileText, Inbox, Settings, LogOut } from "lucide-react"
import { logout } from "@/app/login/actions"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Menu items.
// Menu items.
const items = [
  {
    title: "Início",
    url: "/",
    icon: Home,
    isActive: true,
  },
  {
    title: "Análise de Distribuições",
    url: "/distribution",
    icon: Search,
  },

  {
    title: "Validador de Regex",
    url: "/regex-validator",
    icon: Settings,
  },
 {
    title: "Análise de Relatório",
    url: "/report-analysis",
    icon: FileText,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex w-full items-center px-4 py-4">
          <img src="/logo.png" alt="Jusbrasil" className="h-15 w-auto object-contain pb-8" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-2">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive} className="font-medium">
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground text-center">
          © 2026 JUS SOLUÇÕES
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton asChild>
                <form action={logout} className="w-full">
                  <button type="submit" className="flex w-full items-center gap-2">
                    <LogOut />
                    <span>Sair</span>
                  </button>
                </form>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
