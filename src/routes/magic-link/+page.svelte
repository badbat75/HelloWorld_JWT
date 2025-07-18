<script lang="ts">
  import { onMount } from 'svelte'
  import { goto, invalidateAll } from '$app/navigation'
  import { createSupabaseBrowserClient } from '$lib/supabase'
  import { authStore } from '$lib/stores/auth'
  
  let loading = true
  let error = ''
  let success = ''
  let status = 'Validating magic link...'
  
  onMount(async () => {
    try {
      const supabase = createSupabaseBrowserClient()
      
      // Check if there's a hash in the URL (from magic link)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const tokenType = hashParams.get('token_type')
      
      if (accessToken && refreshToken) {
        status = 'Processing authentication...'
        
        // Set the session using the tokens from the URL
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        
        if (sessionError) {
          error = 'Failed to validate magic link: ' + sessionError.message
          loading = false
          return
        }
        
        if (data.session && data.user) {
          // Update auth store
          authStore.set({
            user: data.user,
            session: data.session,
            loading: false,
            lastSignIn: null,
            backendUser: null
          })
          
          success = 'Magic link validated successfully! Redirecting...'
          
          // Invalidate all data to refresh server-side auth state
          await invalidateAll()
          
          // Wait a moment to show success message
          setTimeout(() => {
            goto('/')
          }, 2000)
        } else {
          error = 'Invalid magic link or expired session'
          loading = false
        }
      } else {
        // No tokens in URL, check for existing session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Already authenticated, redirect to home
          goto('/')
        } else {
          error = 'Invalid magic link. Please try requesting a new one.'
          loading = false
        }
      }
    } catch (err) {
      console.error('Magic link validation error:', err)
      error = 'An error occurred while validating the magic link'
      loading = false
    }
  })
  
  const requestNewLink = () => {
    goto('/login')
  }
</script>

<svelte:head>
  <title>Magic Link Validation - HelloWorld JWT</title>
</svelte:head>

<div class="max-w-md mx-auto fade-in">
  <div class="card text-center">
    <div class="card-header">
      <h2 class="card-title">🪄 Magic Link</h2>
      <p class="card-subtitle">Validating your authentication</p>
    </div>
    
    <div class="space-y-4">
      {#if loading}
        <div class="flex flex-col items-center gap-4">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <div class="spinner"></div>
          </div>
          <p class="text-gray-700">{status}</p>
        </div>
      {:else if error}
        <div class="space-y-4">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <div class="alert alert-error">
            <strong>Validation Failed</strong><br>
            {error}
          </div>
          
          <button
            on:click={requestNewLink}
            class="btn btn-primary btn-full hover-lift"
          >
            🔄 Request New Magic Link
          </button>
        </div>
      {:else if success}
        <div class="space-y-4">
          <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <div class="alert alert-success">
            <strong>Success!</strong><br>
            {success}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .space-y-4 > * + * {
    margin-top: 1rem;
  }
</style>
