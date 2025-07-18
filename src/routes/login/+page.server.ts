import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
    const { session, user } = await locals.safeGetSession()
    
    // If user is already authenticated, redirect to home
    if (session && user) {
        throw redirect(302, '/')
    }
    
    return {}
}
