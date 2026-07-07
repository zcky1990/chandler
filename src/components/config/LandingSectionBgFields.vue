<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, Upload } from '@lucide/vue'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/composables/useI18n'
import { useAlertStore } from '@/stores/useAlertStore'
import { uploadSectionBgImage, removeSectionBgImage } from '@/lib/config'

const props = defineProps<{
  colorId: string
  imageId: string
  colorLabel: string
  sectionKey: string
}>()

const bgColor = defineModel<string>('bgColor', { required: true })
const bgImage = defineModel<string>('bgImage', { required: true })

const { t } = useI18n()
const alertStore = useAlertStore()
const isUploading = ref(false)
const isRemoving = ref(false)

async function handleUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) return

  if (!file.type.startsWith('image/webp')) {
    alertStore.showAlert(t('alert.error'), t('config.imageMustBeWebp'), 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alertStore.showAlert(t('alert.error'), t('config.imageMaxSize'), 'error')
    return
  }

  isUploading.value = true
  const { url, error } = await uploadSectionBgImage(file, props.sectionKey)
  isUploading.value = false

  if (error) {
    alertStore.showAlert(t('alert.error'), error.message, 'error')
    return
  }

  bgImage.value = url ?? ''
  alertStore.showAlert(t('alert.success'), t('config.landingSectionBgImageUploaded'), 'success')
}

async function handleRemove() {
  isRemoving.value = true
  await removeSectionBgImage(props.sectionKey)
  bgImage.value = ''
  isRemoving.value = false
  alertStore.showAlert(t('alert.success'), t('config.landingSectionBgImageDeleted'), 'success')
}
</script>

<template>
  <Field>
    <FieldLabel :for="colorId">{{ colorLabel }}</FieldLabel>
    <div class="flex items-center gap-3">
      <Input
        :id="colorId"
        v-model="bgColor"
        type="color"
        class="size-10 cursor-pointer border-0 p-1"
      />
      <span class="text-sm text-muted-foreground">{{ bgColor }}</span>
    </div>
  </Field>

  <Field>
    <FieldLabel :for="imageId">{{ t('config.landingSectionBgImage') }}</FieldLabel>
    <div v-if="bgImage" class="mb-2 overflow-hidden rounded-lg border">
      <img :src="bgImage" alt="Background" class="h-24 w-full object-cover">
    </div>
    <div class="flex flex-wrap gap-2">
      <Button as-child size="sm" variant="outline" :disabled="isUploading">
        <label class="cursor-pointer">
          <Upload class="size-3.5" />
          <span class="ml-1 text-xs">{{ isUploading ? t('config.uploading') : t('config.uploadImage') }}</span>
          <input type="file" accept="image/webp" class="hidden" :disabled="isUploading" @change="handleUpload">
        </label>
      </Button>
      <Button v-if="bgImage" size="sm" variant="ghost" :disabled="isRemoving" @click="handleRemove">
        <Trash2 class="size-3.5 text-red-500" />
      </Button>
    </div>
    <Input
      :id="imageId"
      v-model="bgImage"
      type="url"
      class="mt-2"
      :placeholder="t('config.landingSectionBgImageHint')"
    />
    <p class="mt-1 text-xs text-muted-foreground">{{ t('config.imageMustBeWebp') }}</p>
  </Field>
</template>
