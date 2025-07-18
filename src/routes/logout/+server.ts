import { redirect } from '@sveltejs/kit'
import { createSupabaseServerClient } from '$lib/supabase'

export const POST = async ({ cookies }) => {
    const supabase = createSupabaseServerClient({
        getAll: () => {
            return cookies.getAll().map(({ name, value }: { name: string; value: string }) => ({ name, value }))
        },
        setAll: (cookiesToSet: Array<{ name: string; value: string; options: any }>) => {
            cookiesToSet.forEach(({ name, value, options }) => {
                cookies.set(name, value, { ...options, path: '/' })
            })
        }
    })

    await supabase.auth.signOut()
    
    throw redirect(302, '/')
}
