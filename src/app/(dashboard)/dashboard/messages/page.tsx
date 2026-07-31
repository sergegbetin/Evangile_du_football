import { requireAuth } from "@/lib/auth"
import { getMessageThreads, getThreadMessages } from "@/lib/actions/messages"
import { MessagingPanel } from "@/components/messaging/messaging-panel"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { DashboardPageShell } from "@/components/layout/dashboard-page-shell"
import { DashboardPanel } from "@/components/layout/dashboard-panel"

export const metadata = {
  title: "Messages",
}

export default async function CoachMessagesPage() {
  const profile = await requireAuth()
  const threads = await getMessageThreads()
  const messagesByThread: Record<string, Awaited<ReturnType<typeof getThreadMessages>>> = {}

  await Promise.all(
    threads.map(async (thread) => {
      messagesByThread[thread.id] = await getThreadMessages(thread.id)
    })
  )

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="Messages"
        description="Échangez avec le comité d'organisation. Les annonces officielles apparaissent ici."
      />
      <DashboardPanel>
        <MessagingPanel
          mode="coach"
          threads={threads}
          messagesByThread={messagesByThread}
          currentUserId={profile.id}
        />
      </DashboardPanel>
    </DashboardPageShell>
  )
}
