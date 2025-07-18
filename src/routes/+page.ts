export const load = async ({ parent }) => {
    const { user, session } = await parent()
    
    return {
        user,
        session
    }
}
