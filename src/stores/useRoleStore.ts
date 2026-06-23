import { defineStore } from 'pinia'
import { getCurrentUserProfile } from '@/lib/profile'
import type { UserRole } from '@/lib/permissions'

export const useRoleStore = defineStore('role', {
  state: () => ({
    role: null as UserRole | null,
    loaded: false,
    loading: false,
  }),

  getters: {
    isOwner: (state) => state.role === 'owner',
    isStaff: (state) => state.role === 'staff',
    canWriteMaster: (state) => state.role === 'owner',
  },

  actions: {
    async loadRole(force = false) {
      if (this.loading) return
      if (this.loaded && !force) return

      this.loading = true
      const { profile, error } = await getCurrentUserProfile()
      this.loading = false

      if (error || !profile) {
        this.role = null
        this.loaded = false
        return
      }

      this.role = profile.role
      this.loaded = true
    },

    clear() {
      this.role = null
      this.loaded = false
      this.loading = false
    },
  },
})
