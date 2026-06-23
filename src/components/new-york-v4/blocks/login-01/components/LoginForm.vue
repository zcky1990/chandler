<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/composables/useI18n'
import { ref } from 'vue'

interface LoginProps {
  class?: HTMLAttributes["class"],
  onSubmit: (email: string, password: string) => void,
}

const props = defineProps<LoginProps>()

const { t } = useI18n()

const handleSubmit = () => {
  props.onSubmit(email.value, password.value)
}

const email = ref('')
const password = ref('')

</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader>
        <CardTitle>{{ t('auth.loginTitle') }}</CardTitle>
        <CardDescription>
          {{ t('auth.loginDesc') }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit">
          <FieldGroup>
            <Field>
              <FieldLabel for="email">
                {{ t('auth.email') }}
              </FieldLabel>
              <Input
                id="email"
                type="email"
                v-model="email"
                placeholder="m@example.com"
                required
              />
            </Field>
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password">
                  {{ t('auth.password') }}
                </FieldLabel>
                <a
                  href="#"
                  class="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {{ t('auth.forgotPassword') }}
                </a>
              </div>
              <Input id="password" type="password" v-model="password" required />
            </Field>
            <Field>
              <Button type="submit">
                {{ t('auth.loginButton') }}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
