import { createSupabaseBrowserClient } from '$lib/supabase'
import { authStore } from '$lib/stores/auth'
import { browser } from '$app/environment'

export const load = async ({ data }) => {
    if (browser) {
        const supabase = createSupabaseBrowserClient()
        
        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession()
        
        // Set initial auth state with current session
        authStore.set({
            user: session?.user || data?.user || null,
            session: session || data?.session || null,
            loading: false,
            lastSignIn: null,
            backendUser: null
        })

        return {
            supabase,
            user: session?.user || data?.user || null,
            session: session || data?.session || null
        }
    }

    return {
        user: data?.user || null,
        session: data?.session || null
    }
}
