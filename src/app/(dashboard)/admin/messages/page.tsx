import { requireCommittee } from "@/lib/auth"
import { getApprovedTeams } from "@/lib/actions/teams"
import { getMessageThreads, getThreadMessages } from "@/lib/actions/messages"
import { MessagingPanel } from "@/components/messaging/messaging-panel"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"

export const metadata = {
  title: "Messages — Admin",
}

export default async function AdminMessagesPage() {
  const profile = await requireCommittee()
  const [threads, teams] = await Promise.all([
    getMessageThreads(),
    getApprovedTeams(),
  ])
  const messagesByThread: Record<string, Awaited<ReturnType<typeof getThreadMessages>>> = {}

  await Promise.all(
    threads.map(async (thread) => {
      messagesByThread[thread.id] = await getThreadMessages(thread.id)
    })
  )

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        section="admin"
        title="Messagerie"
        description="Annonces globales et conversations avec les coachs d'équipe."
      />
      <DashboardPanel>
        <MessagingPanel
          mode="admin"
          threads={threads}
          messagesByThread={messagesByThread}
          teams={teams.map((t) => ({ id: t.id, name: t.name }))}
          currentUserId={profile.id}
        />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
