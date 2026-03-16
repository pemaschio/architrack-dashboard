'use server'

import { createClient } from '@/lib/supabase/server'

export interface UserDetail {
  id: string
  name: string
  phone: string
  role: 'architect' | 'director' | 'admin'
  hourly_rate: number | null
  is_active: boolean
  created_at: string
  totalMinutes: number
  projectCount: number
  recentEntries: {
    id: string
    started_at: string
    duration_min: number | null
    description: string | null
    project_name: string | null
  }[]
  projectSummary: {
    project_id: string
    project_name: string
    total_min: number
  }[]
}

export interface ProjectDetail {
  id: string
  name: string
  client_name: string | null
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  budget_hours: number | null
  budget_value: number | null
  alert_threshold: number
  start_date: string | null
  deadline: string | null
  created_at: string
  phase_name: string | null
  totalMinutes: number
  recentEntries: {
    id: string
    started_at: string
    duration_min: number | null
    description: string | null
    user_name: string | null
  }[]
  teamSummary: {
    user_id: string
    user_name: string
    total_min: number
  }[]
}

export async function fetchUserDetail(userId: string): Promise<UserDetail | null> {
  const supabase = await createClient()

  const [{ data: user }, { data: entries }] = await Promise.all([
    supabase
      .from('users')
      .select('id, name, phone, role, hourly_rate, is_active, created_at')
      .eq('id', userId)
      .single(),
    supabase
      .from('time_entries')
      .select('id, started_at, duration_min, description, project_id, projects(name)')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('started_at', { ascending: false }),
  ])

  if (!user) return null

  const allEntries = (entries || []) as {
    id: string
    started_at: string
    duration_min: number | null
    description: string | null
    project_id: string
    projects: { name: string } | null
  }[]

  const totalMinutes = allEntries.reduce((s, e) => s + (e.duration_min || 0), 0)

  // aggregate by project
  const projectMap = new Map<string, { name: string; total_min: number }>()
  for (const e of allEntries) {
    const pid = e.project_id
    const pname = e.projects?.name ?? '—'
    const prev = projectMap.get(pid)
    projectMap.set(pid, { name: pname, total_min: (prev?.total_min ?? 0) + (e.duration_min || 0) })
  }

  const projectSummary = [...projectMap.entries()]
    .map(([id, v]) => ({ project_id: id, project_name: v.name, total_min: v.total_min }))
    .sort((a, b) => b.total_min - a.total_min)
    .slice(0, 5)

  const recentEntries = allEntries.slice(0, 8).map((e) => ({
    id: e.id,
    started_at: e.started_at,
    duration_min: e.duration_min,
    description: e.description,
    project_name: e.projects?.name ?? null,
  }))

  return {
    ...user,
    totalMinutes,
    projectCount: projectMap.size,
    recentEntries,
    projectSummary,
  }
}

export async function fetchProjectDetail(projectId: string): Promise<ProjectDetail | null> {
  const supabase = await createClient()

  const [{ data: project }, { data: entries }] = await Promise.all([
    supabase
      .from('projects')
      .select(
        'id, name, client_name, status, budget_hours, budget_value, alert_threshold, start_date, deadline, created_at, project_phases(name)'
      )
      .eq('id', projectId)
      .single(),
    supabase
      .from('time_entries')
      .select('id, started_at, duration_min, description, user_id, users(name)')
      .eq('project_id', projectId)
      .eq('is_deleted', false)
      .order('started_at', { ascending: false }),
  ])

  if (!project) return null

  const allEntries = (entries || []) as {
    id: string
    started_at: string
    duration_min: number | null
    description: string | null
    user_id: string
    users: { name: string } | null
  }[]

  const totalMinutes = allEntries.reduce((s, e) => s + (e.duration_min || 0), 0)

  // aggregate by user
  const userMap = new Map<string, { name: string; total_min: number }>()
  for (const e of allEntries) {
    const uid = e.user_id
    const uname = e.users?.name ?? '—'
    const prev = userMap.get(uid)
    userMap.set(uid, { name: uname, total_min: (prev?.total_min ?? 0) + (e.duration_min || 0) })
  }

  const teamSummary = [...userMap.entries()]
    .map(([id, v]) => ({ user_id: id, user_name: v.name, total_min: v.total_min }))
    .sort((a, b) => b.total_min - a.total_min)

  const recentEntries = allEntries.slice(0, 8).map((e) => ({
    id: e.id,
    started_at: e.started_at,
    duration_min: e.duration_min,
    description: e.description,
    user_name: e.users?.name ?? null,
  }))

  return {
    ...project,
    phase_name: (project.project_phases as unknown as { name: string } | null)?.name ?? null,
    totalMinutes,
    recentEntries,
    teamSummary,
  }
}
