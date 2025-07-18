import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
    const { session, user } = await locals.safeGetSession()
    
    // Return session and user data (can be null if not authenticated)
    return {
        session,
        user
    }
}
