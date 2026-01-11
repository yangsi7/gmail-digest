'use client'

import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import type { Digest, ProcessedEmail } from '@/hooks/use-emails'

interface SummaryCardsProps {
  digest: Digest | null
  emails: ProcessedEmail[]
  draftsCount: number
}

export function SummaryCards({ digest, emails, draftsCount }: SummaryCardsProps) {
  const criticalCount = digest?.critical_count ?? emails.filter(e => e.priority === 'critical').length
  const highCount = digest?.high_count ?? emails.filter(e => e.priority === 'high').length
  const totalCount = digest?.email_count ?? emails.length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Emails</CardDescription>
          <CardTitle className="text-2xl">{totalCount}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="border-red-500/30">
        <CardHeader className="pb-2">
          <CardDescription className="text-red-400">Critical</CardDescription>
          <CardTitle className="text-2xl text-red-400">{criticalCount}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="border-orange-500/30">
        <CardHeader className="pb-2">
          <CardDescription className="text-orange-400">High Priority</CardDescription>
          <CardTitle className="text-2xl text-orange-400">{highCount}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="border-blue-500/30">
        <CardHeader className="pb-2">
          <CardDescription className="text-blue-400">Pending Drafts</CardDescription>
          <CardTitle className="text-2xl text-blue-400">{draftsCount}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
