import type { Component } from 'vue'
import { Blocks, FlaskConical, Folder, LayoutDashboard, Network, Newspaper, PlaneTakeoff, Server, Target } from 'lucide-vue-next'

// One icon per project, picked by its `visual` in content/projects
const PROJECT_ICONS: Record<string, Component> = {
  grid: LayoutDashboard,
  tennis: Target,
  news: Newspaper,
  mutation: FlaskConical,
  components: Blocks,
  site: Server,
  homelab: Network,
  hangar: PlaneTakeoff,
}

export const projectIcon = (visual?: string): Component => (visual && PROJECT_ICONS[visual]) || Folder
