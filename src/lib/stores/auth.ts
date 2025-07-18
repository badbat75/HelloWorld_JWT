import { writable } from 'svelte/store'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
    user: User | null
    session: Session | null
    loading: boolean
    lastSignIn?: Date | null
    backendUser?: any
}

export const authStore = writable<AuthState>({
    user: null,
    session: null,
    loading: true,
    lastSignIn: null,
    backendUser: null
})
