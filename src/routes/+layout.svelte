<script lang="ts">
  import { onMount } from 'svelte'
  import { authStore } from '$lib/stores/auth'
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { invalidateAll } from '$app/navigation'
  import '../app.css'
  
  export let data
  
  // Initialize auth store with server data immediately
  $: {
    authStore.set({
      user: data?.user || null,
      session: data?.session || null,
      loading: false,
      lastSignIn: null,
      backendUser: null
    })
  }
  
  onMount(() => {
    if (browser && data?.supabase) {
      // Listen for auth state changes
      const { data: { subscription } } = data.supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          authStore.set({
            user: null,
            session: null,
            loading: false,
            lastSignIn: null,
            backendUser: null
          })
        } else if (event === 'SIGNED_IN' && session) {
          // Update auth store with new session
          authStore.set({
            user: session.user,
            session: session,
            loading: false,
            lastSignIn: null,
            backendUser: null
          })
          
          // Refresh the page data to get updated server-side data
          await invalidateAll()
        }
      })
      
      // Cleanup on unmount
      return () => {
        subscription.unsubscribe()
      }
    }
  })
</script>

<div class="min-h-screen bg-gray-50">
  <nav class="navbar">
    <div class="navbar-content">
      <div class="flex items-center">
        <a href="/" class="navbar-brand">
          🔐 HelloWorld JWT
        </a>
      </div>
      <div class="navbar-nav">
        {#if $authStore.user}
          <span class="text-sm text-gray-600">Welcome, {$authStore.user.user_metadata?.name || $authStore.user.user_metadata?.full_name || $authStore.user.email?.split('@')[0] || 'User'}</span>
          <form action="/logout" method="post">
            <button type="submit" class="btn btn-sm btn-outline">
              Logout
            </button>
          </form>
        {:else if $page.route.id !== '/login'}
          <a href="/login" class="nav-link">Access Account</a>
        {/if}
      </div>
    </div>
  </nav>
  
  <main class="main-content">
    <div class="container">
      <slot />
    </div>
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
</style>
