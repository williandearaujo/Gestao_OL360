import {
  BarChart3,
  Bell,
  Users,
  BookOpen,
  Link as LinkIcon,
  Settings,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Alertas', href: '/dashboard/alertas', icon: Bell },
  { label: 'Colaboradores', href: '/dashboard/colaboradores', icon: Users },
  { label: 'Conhecimentos', href: '/dashboard/conhecimentos', icon: BookOpen },
  { label: 'Vínculos', href: '/dashboard/vinculos', icon: LinkIcon },
  { label: 'Administração', href: '/dashboard/admin', icon: Settings },
]
