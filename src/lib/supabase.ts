import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import type { Database } from './database.types'

export const createSupabaseLoadClient = (fetch: typeof globalThis.fetch) => {
    const supabase = createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll: () => {
                return []
            },
            setAll: () => {
                // No-op for server during load
            }
        },
        global: {
            fetch
        }
    })

    return supabase
}

export const createSupabaseServerClient = (
    cookies: {
        getAll: () => Array<{ name: string; value: string }>
        setAll: (cookies: Array<{ name: string; value: string; options: any }>) => void
    }
) => {
    return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll: () => {
                return cookies.getAll()
            },
            setAll: (cookiesToSet) => {
                cookies.setAll(cookiesToSet)
            }
        }
    })
}

export const createSupabaseBrowserClient = () => {
    if (isBrowser()) {
        return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
            auth: {
                detectSessionInUrl: false,
                persistSession: true,
                autoRefreshToken: true
            }
        })
    }
    
    throw new Error('createSupabaseBrowserClient can only be called in browser environment')
}
