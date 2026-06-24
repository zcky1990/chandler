import { supabase } from './supabase'
import { getActiveQueues } from './queue'
import { floorTableSchema } from '@/schema/schema'
import type { FloorTable, FloorTableInput, TableOccupancy } from '@/types/database'

export const FLOOR_CANVAS_WIDTH = 1000
export const FLOOR_CANVAS_HEIGHT = 600
export const FLOOR_GRID_SIZE = 10

export const getFloorTables = async () => {
  const supabaseClient = supabase()
  const { data, error } = await supabaseClient
    .from('floor_tables')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return { tables: data as FloorTable[] | null, error }
}

export const saveFloorTables = async (tables: FloorTableInput[]) => {
  for (const table of tables) {
    const validated = floorTableSchema().safeParse(table)
    if (!validated.success) {
      return { error: validated.error.flatten().fieldErrors }
    }
  }

  const supabaseClient = supabase()

  const { data: existing, error: existingError } = await supabaseClient
    .from('floor_tables')
    .select('id')

  if (existingError) {
    return { error: existingError }
  }

  const keptIds = new Set(tables.filter((table) => table.id).map((table) => table.id as string))
  const removedIds = (existing ?? [])
    .map((row) => row.id as string)
    .filter((id) => !keptIds.has(id))

  if (removedIds.length) {
    const { error: deleteError } = await supabaseClient
      .from('floor_tables')
      .delete()
      .in('id', removedIds)

    if (deleteError) {
      return { error: deleteError }
    }
  }

  const rows = tables.map((table, index) => ({
    ...(table.id ? { id: table.id } : {}),
    label: table.label.trim(),
    shape: table.shape,
    kind: table.kind,
    color: table.kind === 'zone' ? (table.color?.trim() || null) : null,
    pos_x: Math.round(table.pos_x),
    pos_y: Math.round(table.pos_y),
    width: Math.round(table.width),
    height: Math.round(table.height),
    seats: table.kind === 'table' ? (table.seats ?? null) : null,
    area: table.area?.trim() || null,
    sort_order: index,
  }))

  if (rows.length) {
    const { error: upsertError } = await supabaseClient
      .from('floor_tables')
      .upsert(rows, { onConflict: 'id' })

    if (upsertError) {
      return { error: upsertError }
    }
  }

  return { error: null }
}

export const deleteFloorTable = async (id: string) => {
  const supabaseClient = supabase()
  const { error } = await supabaseClient.from('floor_tables').delete().eq('id', id)
  return { error }
}

export const getTableOccupancy = async () => {
  const { queues, error } = await getActiveQueues()
  if (error) {
    return { occupancyByLabel: {} as Record<string, TableOccupancy>, error }
  }

  const occupancyByLabel: Record<string, TableOccupancy> = {}

  for (const queue of queues ?? []) {
    const label = queue.table_number?.trim()
    if (!label) continue

    const existing = occupancyByLabel[label]
    if (!existing || queue.queue_number < existing.queueNumber) {
      occupancyByLabel[label] = {
        label,
        status: queue.status,
        queueNumber: queue.queue_number,
      }
    }
  }

  return { occupancyByLabel, error: null }
}
