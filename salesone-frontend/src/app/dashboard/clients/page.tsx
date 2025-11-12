"use client"

import { useState } from "react"
import { ClientDialog } from "@/components/clients/client-dialog"
import { ClientDrawer } from "@/components/clients/client-drawer"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useClients } from "@/hooks/use-clients"
import { Client } from "@/types/client"

export default function ClientsPage() {
  const { clients, isLoading } = useClients()
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">고객 관리</h1>
        <ClientDialog mode="create" />
      </div>
      <DataTable
        columns={columns}
        data={clients || []}
        onRowClick={(client: Client) => setSelectedClientId(client.id)}
      />
      <ClientDrawer
        clientId={selectedClientId}
        open={selectedClientId !== null}
        onOpenChange={(open) => !open && setSelectedClientId(null)}
      />
    </div>
  )
} 