<script setup lang="ts">
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/composables/useI18n'
import { RouterLink } from 'vue-router'
import { ref } from 'vue'

interface SignupFormProps {
  onSubmit: (name: string, email: string, password: string, confirmPassword: string) => void,
}

const props = withDefaults(defineProps<SignupFormProps>(), {
  onSubmit: () => { },
})

const { t } = useI18n()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleSubmit = () => {
  props.onSubmit(name.value, email.value, password.value, confirmPassword.value)
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>{{ t('auth.signupTitle') }}</CardTitle>
      <CardDescription>
        {{ t('auth.signupDesc') }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form>
        <FieldGroup>
          <Field>
            <FieldLabel for="name">
              {{ t('auth.fullName') }}
            </FieldLabel>
            <Input id="name" type="text" v-model="name" placeholder="John Doe" required />
          </Field>
          <Field>
            <FieldLabel for="email">
              {{ t('auth.email') }}
            </FieldLabel>
            <Input id="email" type="email" v-model="email" placeholder="m@example.com" required />
            <FieldDescription>
              {{ t('auth.emailHint') }}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel for="password">
              {{ t('auth.password') }}
            </FieldLabel>
            <Input id="password" type="password" v-model="password" required />
            <FieldDescription>{{ t('auth.passwordMinHint') }}</FieldDescription>
          </Field>
          <Field>
            <FieldLabel for="confirm-password">
              {{ t('auth.confirmPassword') }}
            </FieldLabel>
            <Input id="confirm-password" type="password" v-model="confirmPassword" required />
            <FieldDescription>{{ t('auth.confirmPasswordHint') }}</FieldDescription>
          </Field>
          <FieldGroup>
            <Field>
              <Button type="submit" @click="handleSubmit">
                {{ t('auth.createAccount') }}
              </Button>
              <FieldDescription class="px-6 text-center">
                {{ t('auth.alreadyHaveAccount') }}
                <RouterLink to="/login">{{ t('auth.signInLink') }}</RouterLink>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</template>
