<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Eye, Plus, Save, Square, Trash2 } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import FloorPlanCanvas, { type CanvasTable } from '@/components/floor/FloorPlanCanvas.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/composables/useI18n'
import { getFloorTables, saveFloorTables } from '@/lib/floor'
import { getUnassignedDiningTables } from '@/lib/table'
import { useAlertStore } from '@/stores/useAlertStore'
import type { DiningTable, FloorTableInput, TableShape } from '@/types/database'

const { t } = useI18n()
const alertStore = useAlertStore()

const tables = ref<CanvasTable[]>([])
const unassignedTables = ref<DiningTable[]>([])
const selectedMasterTableId = ref('')
const selectedId = ref<string | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)

const selectedTable = computed(() =>
  tables.value.find((table) => table.id === selectedId.value) ?? null,
)

const selectedMasterTable = computed(() =>
  unassignedTables.value.find((table) => table.id === selectedMasterTableId.value) ?? null,
)

async function loadUnassignedTables() {
  const { tables: data, error } = await getUnassignedDiningTables()
  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  const usedIds = new Set(
    tables.value
      .filter((table) => table.kind === 'table' && table.dining_table_id)
      .map((table) => table.dining_table_id as string),
  )

  unassignedTables.value = (data ?? []).filter((table) => !usedIds.has(table.id))
  if (!unassignedTables.value.some((table) => table.id === selectedMasterTableId.value)) {
    selectedMasterTableId.value = unassignedTables.value[0]?.id ?? ''
  }
}

async function loadTables() {
  isLoading.value = true
  const { tables: data, error } = await getFloorTables()
  isLoading.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  tables.value = (data ?? []).map((table) => ({
    id: table.id,
    label: table.label,
    shape: table.shape,
    kind: table.kind,
    color: table.color,
    pos_x: table.pos_x,
    pos_y: table.pos_y,
    width: table.width,
    height: table.height,
    seats: table.seats,
    dining_table_id: table.dining_table_id,
  }))

  await loadUnassignedTables()
}

function handleUpdateTables(updated: CanvasTable[]) {
  tables.value = updated
}

function addTableFromMaster() {
  const masterTable = selectedMasterTable.value
  if (!masterTable) {
    alertStore.showAlert(t('alert.warning'), t('floor.createTableInMasterFirst'), 'error')
    return
  }

  const id = crypto.randomUUID()
  tables.value = [
    ...tables.value,
    {
      id,
      label: masterTable.table_number,
      shape: 'square',
      kind: 'table',
      color: null,
      pos_x: 20,
      pos_y: 20,
      width: 80,
      height: 80,
      seats: masterTable.seats,
      dining_table_id: masterTable.id,
    },
  ]
  selectedId.value = id
  selectedMasterTableId.value = ''
  void loadUnassignedTables()
}

function addZone() {
  const id = crypto.randomUUID()
  tables.value = [
    ...tables.value,
    {
      id,
      label: t('floor.newZoneName'),
      shape: 'square',
      kind: 'zone',
      color: '#94a3b8',
      pos_x: 20,
      pos_y: 20,
      width: 160,
      height: 100,
      seats: null,
      dining_table_id: null,
    },
  ]
  selectedId.value = id
}

function deleteSelected() {
  if (!selectedTable.value) return
  tables.value = tables.value.filter((table) => table.id !== selectedId.value)
  selectedId.value = null
  void loadUnassignedTables()
}

function updateSelected<K extends keyof CanvasTable>(key: K, value: CanvasTable[K]) {
  if (!selectedId.value) return
  tables.value = tables.value.map((table) =>
    table.id === selectedId.value ? { ...table, [key]: value } : table,
  )
}

async function handleSave() {
  isSaving.value = true
  const payload: FloorTableInput[] = tables.value.map((table, index) => ({
    id: table.id,
    label: table.label,
    shape: table.shape,
    kind: table.kind,
    color: table.color ?? null,
    pos_x: table.pos_x,
    pos_y: table.pos_y,
    width: table.width,
    height: table.height,
    seats: table.seats ?? null,
    dining_table_id: table.kind === 'table' ? (table.dining_table_id ?? null) : null,
    sort_order: index,
  }))

  const { error } = await saveFloorTables(payload)
  isSaving.value = false

  if (error) {
    const message = typeof error === 'object' && error && 'message' in error
      ? String((error as { message: string }).message)
      : t('floor.saveFailed')
    alertStore.showAlert(t('alert.error'), message, 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('floor.saved'), 'success')
  await loadTables()
}

onMounted(loadTables)
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col gap-6 p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ t('floor.editorTitle') }}</h1>
          <p class="text-sm text-muted-foreground">{{ t('floor.editorSubtitle') }}</p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" as-child>
            <RouterLink to="/floor-plan">
              <Eye class="size-4" />
              {{ t('floor.viewLive') }}
            </RouterLink>
          </Button>
          <Button :disabled="isSaving || isLoading" @click="handleSave">
            <Save class="size-4" />
            {{ isSaving ? t('common.saving') : t('floor.save') }}
          </Button>
        </div>
      </div>

      <div class="flex flex-col gap-4 lg:flex-row">
        <div class="flex-1 space-y-3">
          <div class="flex flex-wrap items-end gap-2">
            <Field class="min-w-[200px] flex-1 sm:max-w-xs">
              <FieldLabel>{{ t('floor.pickMasterTable') }}</FieldLabel>
              <Select v-model="selectedMasterTableId">
                <SelectTrigger>
                  <SelectValue :placeholder="t('master.selectDiningTable')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="table in unassignedTables"
                    :key="table.id"
                    :value="table.id"
                  >
                    {{ table.table_number }} · {{ t('master.diningTableSeatsCount', { count: table.seats }) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Button
              size="sm"
              :disabled="!selectedMasterTableId"
              @click="addTableFromMaster"
            >
              <Plus class="size-4" />
              {{ t('floor.addTableFromMaster') }}
            </Button>
            <Button size="sm" variant="outline" @click="addZone">
              <Square class="size-4" />
              {{ t('floor.addZone') }}
            </Button>
            <span class="text-sm text-muted-foreground">{{ t('floor.dragHint') }}</span>
          </div>
          <p v-if="!isLoading && !unassignedTables.length" class="text-sm text-muted-foreground">
            {{ t('floor.noUnassignedTable') }}
          </p>

          <FloorPlanCanvas
            :tables="tables"
            editable
            :selected-id="selectedId"
            @update:tables="handleUpdateTables"
            @select="selectedId = $event"
          />
        </div>

        <div class="w-full shrink-0 rounded-xl border bg-background p-4 lg:w-72">
          <h2 class="mb-3 text-sm font-semibold">{{ t('floor.properties') }}</h2>

          <p v-if="!selectedTable" class="text-sm text-muted-foreground">
            {{ t('floor.selectTableHint') }}
          </p>

          <FieldGroup v-else class="gap-3">
            <template v-if="selectedTable.kind === 'table' && selectedTable.dining_table_id">
              <Field>
                <FieldLabel>{{ t('floor.tableLabel') }}</FieldLabel>
                <Input :model-value="selectedTable.label" disabled />
              </Field>
              <Field>
                <FieldLabel>{{ t('floor.seats') }}</FieldLabel>
                <Input :model-value="selectedTable.seats ?? 0" disabled />
              </Field>
              <p class="text-xs text-muted-foreground">{{ t('floor.masterTableReadonly') }}</p>
            </template>

            <template v-else>
              <Field>
                <FieldLabel>
                  {{ selectedTable.kind === 'zone' ? t('floor.zoneName') : t('floor.tableLabel') }}
                </FieldLabel>
                <Input
                  :model-value="selectedTable.label"
                  @update:model-value="updateSelected('label', String($event))"
                />
              </Field>

              <Field v-if="selectedTable.kind === 'table'">
                <FieldLabel>{{ t('floor.seats') }}</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  :model-value="selectedTable.seats ?? 0"
                  @update:model-value="updateSelected('seats', Number($event))"
                />
              </Field>
            </template>

            <Field>
              <FieldLabel>{{ t('floor.shape') }}</FieldLabel>
              <Select
                :model-value="selectedTable.shape"
                @update:model-value="updateSelected('shape', $event as TableShape)"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">{{ t('floor.shapeSquare') }}</SelectItem>
                  <SelectItem value="round">{{ t('floor.shapeRound') }}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field v-if="selectedTable.kind === 'zone'">
              <FieldLabel>{{ t('floor.color') }}</FieldLabel>
              <div class="flex items-center gap-2">
                <input
                  type="color"
                  class="h-9 w-12 cursor-pointer rounded border bg-background"
                  :value="selectedTable.color ?? '#94a3b8'"
                  @input="updateSelected('color', ($event.target as HTMLInputElement).value)"
                >
                <Input
                  class="flex-1"
                  :model-value="selectedTable.color ?? ''"
                  @update:model-value="updateSelected('color', String($event))"
                />
              </div>
            </Field>

            <div class="grid grid-cols-2 gap-2">
              <Field>
                <FieldLabel>{{ t('floor.width') }}</FieldLabel>
                <Input
                  type="number"
                  min="40"
                  :model-value="selectedTable.width"
                  @update:model-value="updateSelected('width', Number($event))"
                />
              </Field>
              <Field>
                <FieldLabel>{{ t('floor.height') }}</FieldLabel>
                <Input
                  type="number"
                  min="40"
                  :model-value="selectedTable.height"
                  @update:model-value="updateSelected('height', Number($event))"
                />
              </Field>
            </div>

            <Button variant="destructive" size="sm" @click="deleteSelected">
              <Trash2 class="size-4" />
              {{ selectedTable.kind === 'zone' ? t('floor.deleteZone') : t('floor.deleteTable') }}
            </Button>
          </FieldGroup>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
