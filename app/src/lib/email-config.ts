import {
  AlertTriangle,
  Mail,
  CreditCard,
  User,
  FileText,
  type LucideIcon
} from 'lucide-react'

export type Priority = 'critical' | 'high' | 'medium' | 'low'
export type Category = 'rav' | 'billing' | 'personal' | 'action_required' | 'other'

export interface PriorityConfigItem {
  label: string
  color: string
  textColor: string
}

export interface CategoryConfigItem {
  label: string
  icon: LucideIcon
}

export const PRIORITY_CONFIG: Record<Priority, PriorityConfigItem> = {
  critical: {
    label: 'Critical',
    color: 'bg-red-500/20 text-red-400 border-red-500/50',
    textColor: 'text-red-400'
  },
  high: {
    label: 'High',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    textColor: 'text-orange-400'
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    textColor: 'text-yellow-400'
  },
  low: {
    label: 'Low',
    color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50',
    textColor: 'text-zinc-400'
  }
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfigItem> = {
  rav: { label: 'RAV', icon: FileText },
  billing: { label: 'Billing', icon: CreditCard },
  personal: { label: 'Personal', icon: User },
  action_required: { label: 'Action', icon: AlertTriangle },
  other: { label: 'Other', icon: Mail }
}

export const PRIORITY_ORDER: Priority[] = ['critical', 'high', 'medium', 'low']

export function getPriorityConfig(priority: string | null | undefined): PriorityConfigItem {
  return PRIORITY_CONFIG[priority as Priority] || PRIORITY_CONFIG.low
}

export function getCategoryConfig(category: string | null | undefined): CategoryConfigItem {
  return CATEGORY_CONFIG[category as Category] || CATEGORY_CONFIG.other
}
