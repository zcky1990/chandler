<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Eye, Plus, Save, Trash2 } from '@lucide/vue'
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
import { useAlertStore } from '@/stores/useAlertStore'
import type { FloorTableInput, TableShape } from '@/types/database'

const { t } = useI18n()
const alertStore = useAlertStore()

const tables = ref<CanvasTable[]>([])
const selectedId = ref<string | null>(null)
const isLoading = ref(true)
const isSaving = ref(false)

const selectedTable = computed(() =>
  tables.value.find((table) => table.id === selectedId.value) ?? null,
)

function nextLabel() {
  const numbers = tables.value
    .map((table) => Number.parseInt(table.label, 10))
    .filter((value) => !Number.isNaN(value))

  if (numbers.length) {
    return String(Math.max(...numbers) + 1)
  }

  return String(tables.value.length + 1)
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
    pos_x: table.pos_x,
    pos_y: table.pos_y,
    width: table.width,
    height: table.height,
    seats: table.seats,
  }))
}

function handleUpdateTables(updated: CanvasTable[]) {
  tables.value = updated
}

function addTable() {
  const id = crypto.randomUUID()
  tables.value = [
    ...tables.value,
    {
      id,
      label: nextLabel(),
      shape: 'square',
      pos_x: 20,
      pos_y: 20,
      width: 80,
      height: 80,
      seats: 4,
    },
  ]
  selectedId.value = id
}

function deleteSelected() {
  if (!selectedTable.value) return
  tables.value = tables.value.filter((table) => table.id !== selectedId.value)
  selectedId.value = null
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
    pos_x: table.pos_x,
    pos_y: table.pos_y,
    width: table.width,
    height: table.height,
    seats: table.seats ?? null,
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
          <div class="flex items-center gap-2">
            <Button size="sm" @click="addTable">
              <Plus class="size-4" />
              {{ t('floor.addTable') }}
            </Button>
            <span class="text-sm text-muted-foreground">{{ t('floor.dragHint') }}</span>
          </div>

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
            <Field>
              <FieldLabel>{{ t('floor.tableLabel') }}</FieldLabel>
              <Input
                :model-value="selectedTable.label"
                @update:model-value="updateSelected('label', String($event))"
              />
            </Field>

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

            <Field>
              <FieldLabel>{{ t('floor.seats') }}</FieldLabel>
              <Input
                type="number"
                min="0"
                :model-value="selectedTable.seats ?? 0"
                @update:model-value="updateSelected('seats', Number($event))"
              />
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
              {{ t('floor.deleteTable') }}
            </Button>
          </FieldGroup>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
