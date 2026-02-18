"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { EditDemandDialog } from "./edit-demand-dialog"
import { DemandColumn } from "./types"

interface DemandNameCellProps {
    demand: DemandColumn
}

export function DemandNameCell({ demand }: DemandNameCellProps) {
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)

    // Determine if user can edit (reuse logic from demand-actions.tsx if possible, 
    // but here we primarily want to allow VIEWING even if they can't edit everything)
    const canEdit = (() => {
        if (!session?.user) return false
        const { role, id } = session.user
        const userId = parseInt(id)

        if (role === "ADMIN") return true

        if (role === "SUPERVISOR") {
            if (demand.assignee?.id === userId) return true
            if (demand.assignee?.role === "BACKOFFICE") return true
            return false
        }

        if (role === "BACKOFFICE") {
            return demand.assignee?.id === userId
        }

        return false
    })()

    return (
        <>
            <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary hover:underline text-left whitespace-normal h-auto"
                onClick={() => setOpen(true)}
            >
                {demand.partner.nickname}
            </Button>
            <EditDemandDialog
                demand={demand}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    )
}
