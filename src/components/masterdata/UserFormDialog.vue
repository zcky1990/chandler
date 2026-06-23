<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/composables/useI18n'
import { createUserWithRole, getRoleLabelKey } from '@/lib/profile'
import { userCreateSchema } from '@/schema/schema'
import { useAlertStore } from '@/stores/useAlertStore'
import type { UserRole } from '@/types/database'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: []
}>()

const { t } = useI18n()
const alertStore = useAlertStore()
const fullName = ref('')
const email = ref('')
const password = ref('')
const role = ref<UserRole>('staff')
const isSubmitting = ref(false)

const roleOptions: UserRole[] = ['owner', 'staff']

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    fullName.value = ''
    email.value = ''
    password.value = ''
    role.value = 'staff'
  },
)

async function handleSubmit() {
  const validated = userCreateSchema().safeParse({
    fullName: fullName.value,
    email: email.value,
    password: password.value,
    role: role.value,
  })

  if (!validated.success) {
    const first = validated.error.issues[0]?.message
    alertStore.showAlert(t('alert.error'), first ?? t('alert.error'), 'error')
    return
  }

  isSubmitting.value = true
  const { userId, error } = await createUserWithRole(validated.data)
  isSubmitting.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  if (!userId) {
    alertStore.showAlert(t('alert.error'), t('role.createFailed'), 'error')
    return
  }

  alertStore.showAlert(t('alert.success'), t('role.userCreated'), 'success')
  emit('update:open', false)
  emit('saved')
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('role.addUser') }}</DialogTitle>
        <DialogDescription>{{ t('role.addUserDesc') }}</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <Field>
          <FieldLabel for="user-full-name">{{ t('master.name') }}</FieldLabel>
          <Input id="user-full-name" v-model="fullName" autocomplete="name" />
        </Field>
        <Field>
          <FieldLabel for="user-email">{{ t('master.email') }}</FieldLabel>
          <Input id="user-email" v-model="email" type="email" autocomplete="off" />
        </Field>
        <Field>
          <FieldLabel for="user-password">{{ t('auth.password') }}</FieldLabel>
          <Input id="user-password" v-model="password" type="password" autocomplete="new-password" />
        </Field>
        <Field>
          <FieldLabel for="user-role">{{ t('role.roleColumn') }}</FieldLabel>
          <Select v-model="role">
            <SelectTrigger id="user-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="option in roleOptions" :key="option" :value="option">
                {{ t(getRoleLabelKey(option)) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <DialogFooter>
          <DialogClose as-child>
            <Button type="button" variant="outline">{{ t('common.cancel') }}</Button>
          </DialogClose>
          <Button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? t('common.saving') : t('role.addUser') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
