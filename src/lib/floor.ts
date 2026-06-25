import { getReservedTableNumbersForToday } from './booking'
import { getShopDayUtcRange } from './date'
import { supabase } from './supabase'
import { getActiveQueues } from './queue'
import { ACTIVE_TRANSACTION_STATUS } from './transaction'
import { expandTableNumberLabels } from './table'
import { floorTableSchema } from '@/schema/schema'
import type {
  DiningTable,
  FloorOccupancyStatus,
  FloorTable,
  FloorTableInput,
  TableOccupancy,
} from '@/types/database'

export const FLOOR_CANVAS_WIDTH = 1000
export const FLOOR_CANVAS_HEIGHT = 600
export const FLOOR_GRID_SIZE = 10

const OCCUPANCY_PRIORITY: Partial<Record<FloorOccupancyStatus, number>> = {
  serving: 50,
  ready: 40,
  preparing: 30,
  waiting: 20,
  occupied: 10,
  reserved: 5,
}

function occupancyPriority(status: FloorOccupancyStatus) {
  return OCCUPANCY_PRIORITY[status] ?? 0
}

function pickOccupancy(current: TableOccupancy | undefined, candidate: TableOccupancy) {
  if (!current) {
    return candidate
  }

  const currentPriority = occupancyPriority(current.status)
  const candidatePriority = occupancyPriority(candidate.status)

  if (candidatePriority !== currentPriority) {
    return candidatePriority > currentPriority ? candidate : current
  }

  if (current.queueNumber != null && candidate.queueNumber != null) {
    return candidate.queueNumber < current.queueNumber ? candidate : current
  }

  return current
}

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
    dining_table_id: table.kind === 'table' ? (table.dining_table_id ?? null) : null,
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

async function getOpenTableNumbersToday() {
  const { start, end } = getShopDayUtcRange()
  const supabaseClient = supabase()

  const { data, error } = await supabaseClient
    .from('transactions')
    .select('table_number')
    .eq('is_paid', false)
    .eq('status', ACTIVE_TRANSACTION_STATUS)
    .gte('created_at', start)
    .lte('created_at', end)
    .not('table_number', 'is', null)

  if (error) {
    return { tableNumbers: [] as string[], error }
  }

  const tableNumbers = new Set<string>()
  for (const row of data ?? []) {
    for (const label of expandTableNumberLabels(row.table_number)) {
      tableNumbers.add(label)
    }
  }

  return { tableNumbers: [...tableNumbers], error: null }
}

export const getTableOccupancy = async () => {
  const [
    { queues, error: queueError },
    { tableNumbers, error: txError },
    { reservedByLabel, error: reservedError },
  ] = await Promise.all([
    getActiveQueues(),
    getOpenTableNumbersToday(),
    getReservedTableNumbersForToday(),
  ])

  if (queueError || txError || reservedError) {
    return {
      occupancyByLabel: {} as Record<string, TableOccupancy>,
      error: queueError ?? txError ?? reservedError,
    }
  }

  const occupancyByLabel: Record<string, TableOccupancy> = {}

  for (const queue of queues ?? []) {
    for (const label of expandTableNumberLabels(queue.table_number)) {
      const candidate: TableOccupancy = {
        label,
        status: queue.status,
        queueNumber: queue.queue_number,
      }
      occupancyByLabel[label] = pickOccupancy(occupancyByLabel[label], candidate)
    }
  }

  for (const label of tableNumbers) {
    const candidate: TableOccupancy = {
      label,
      status: 'occupied',
      queueNumber: null,
    }
    occupancyByLabel[label] = pickOccupancy(occupancyByLabel[label], candidate)
  }

  for (const [label] of Object.entries(reservedByLabel)) {
    const candidate: TableOccupancy = {
      label,
      status: 'reserved',
      queueNumber: null,
    }
    occupancyByLabel[label] = pickOccupancy(occupancyByLabel[label], candidate)
  }

  return { occupancyByLabel, error: null }
}

export function resolveFloorOccupancy(
  floorTables: Pick<FloorTable, 'label' | 'kind' | 'dining_table_id'>[],
  diningTables: Pick<DiningTable, 'id' | 'table_number'>[],
  occupancyByTableNumber: Record<string, TableOccupancy>,
) {
  const diningById = new Map(diningTables.map((table) => [table.id, table]))
  const resolved: Record<string, TableOccupancy> = {}

  for (const floorTable of floorTables) {
    if (floorTable.kind !== 'table') {
      continue
    }

    const floorLabel = floorTable.label.trim()
    const lookupKeys = new Set<string>([floorLabel])

    if (floorTable.dining_table_id) {
      const dining = diningById.get(floorTable.dining_table_id)
      for (const key of expandTableNumberLabels(dining?.table_number)) {
        lookupKeys.add(key)
      }
    }

    for (const key of lookupKeys) {
      const occupancy = occupancyByTableNumber[key]
      if (!occupancy) {
        continue
      }

      resolved[floorLabel] = pickOccupancy(resolved[floorLabel], {
        ...occupancy,
        label: floorLabel,
      })
    }
  }

  return resolved
}

type RealtimeStatus = 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED'

/** Requires realtime publication on order_queues, transactions, and table_bookings (DDL 13, 36, 37). */
export const subscribeFloorOccupancy = (
  onChange: () => void,
  onStatusChange?: (status: RealtimeStatus) => void,
  channelName = 'floor_plan_occupancy',
) => {
  const supabaseClient = supabase()
  const channel = supabaseClient
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'order_queues' },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'transactions' },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'table_bookings' },
      () => onChange(),
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        onStatusChange?.(status)
      }
    })

  return () => {
    supabaseClient.removeChannel(channel)
  }
}
