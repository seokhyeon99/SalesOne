"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ClientForm } from "./client-form"
import { useClientActions } from "@/hooks/use-client-actions"
import { Client } from "@/types/client"
import { useState } from "react"

interface ClientDialogProps {
  mode: "create" | "edit"
  client?: Client
  trigger?: React.ReactNode
}

export function ClientDialog({ mode, client, trigger }: ClientDialogProps) {
  const [open, setOpen] = useState(false)
  const { createClient, updateClient } = useClientActions()

  const handleSubmit = async (data: any) => {
    try {
      if (mode === "create") {
        await createClient(data)
      } else if (mode === "edit" && client) {
        await updateClient(client.id, data)
      }
      setOpen(false)
    } catch (error) {
      console.error("Failed to save client:", error)
      throw error
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{mode === "create" ? "고객 추가" : "수정"}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "새 고객 추가" : "고객 정보 수정"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "새로운 고객의 정보를 입력해주세요."
              : "고객의 정보를 수정해주세요."}
          </DialogDescription>
        </DialogHeader>
        <ClientForm
          onSubmit={handleSubmit}
          defaultValues={client}
        />
      </DialogContent>
    </Dialog>
  )
} 