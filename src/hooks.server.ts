import { createSupabaseServerClient } from '$lib/supabase'
import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const supabase: Handle = async ({ event, resolve }) => {
    event.locals.supabase = createSupabaseServerClient({
        getAll: () => {
            return event.cookies.getAll().map(({ name, value }) => ({ name, value }))
        },
        setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
                event.cookies.set(name, value, { ...options, path: '/' })
            })
        }
    })

    event.locals.safeGetSession = async () => {
        const {
            data: { user },
            error
        } = await event.locals.supabase.auth.getUser()
        
        if (error || !user) {
            return { session: null, user: null }
        }

        // Get session data but use the authenticated user from getUser()
        const {
            data: { session }
        } = await event.locals.supabase.auth.getSession()
        
        return { session, user }
    }

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version'
        }
    })
}

const authGuard: Handle = async ({ event, resolve }) => {
    const { session, user } = await event.locals.safeGetSession()
    event.locals.session = session
    event.locals.user = user

    return resolve(event)
}

export const handle: Handle = sequence(supabase, authGuard)
