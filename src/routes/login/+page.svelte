<script lang="ts">
  import { createSupabaseBrowserClient } from '$lib/supabase'
  import { goto, invalidateAll } from '$app/navigation'
  import { authStore } from '$lib/stores/auth'
  import { validateToken, getAuthenticatedUser, checkApiHealth, testUserEndpoint } from '$lib/api-client'
  
  let email = ''
  let loading = false
  let error = ''
  let success = ''
  let apiTestResult = ''
  
  // Manual API test function (should fail - no token)
  const testAPI = async () => {
    try {
      apiTestResult = 'Testing API without authentication...'
      console.log('Manual API test started (should fail)')
      
      // Test health endpoint (should work)
      const healthCheck = await checkApiHealth()
      console.log('Manual health check:', healthCheck)
      
      // Test protected endpoint without token (should fail)
      const validation = await validateToken('fake-invalid-token')
      console.log('Manual token validation (should fail):', validation)
      
      if (healthCheck.success) {
        apiTestResult = `✅ Public API works, ❌ Protected API fails: ${validation.error || 'No valid token'}`
      } else {
        apiTestResult = `❌ API connection failed: ${healthCheck.error}`
      }
    } catch (error) {
      console.error('Manual API test error:', error)
      apiTestResult = `❌ API test failed: ${error}`
    }
  }
  
  const handleLogin = async () => {
    if (!email) {
      error = 'Please enter your email'
      return
    }
    
    loading = true
    error = ''
    success = ''
    
    try {
      const supabase = createSupabaseBrowserClient()
      
      const { data, error: loginError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/magic-link`
        }
      })
      
      if (loginError) {
        error = loginError.message
        loading = false
        return
      }
      
      // Show success message
      success = 'Magic link sent! Check your email and click the link to access your account.'
      
      // Don't redirect - let user click the magic link in their email
      loading = false
    } catch (err) {
      error = 'An unexpected error occurred'
      console.error('Login error:', err)
      loading = false
    }
  }
</script>

<div class="max-w-md mx-auto fade-in">
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">🪄 Access Your Account</h2>
      <p class="card-subtitle">Login or create account with magic link</p>
    </div>
    
    {#if error}
      <div class="alert alert-error">
        {error}
      </div>
    {/if}
    
    {#if success}
      <div class="alert alert-success">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <strong>Magic Link Sent!</strong>
          </div>
          <p class="text-sm">{success}</p>
          <p class="text-xs text-green-700">
            <strong>Next steps:</strong> Check your email inbox, click the magic link, and you'll be automatically logged in!
          </p>
        </div>
      </div>
    {/if}
    
    {#if apiTestResult}
      <div class="alert alert-info">
        <div class="flex items-center gap-2">
          {#if apiTestResult.includes('Testing')}
            <div class="spinner"></div>
          {/if}
          <span>{apiTestResult}</span>
        </div>
        {#if apiTestResult.includes('Success') || apiTestResult.includes('Failed')}
          <p class="text-sm mt-2">Redirecting to home page...</p>
        {/if}
      </div>
    {/if}
    
    <form on:submit|preventDefault={handleLogin} class="space-y-4">
      <div class="form-group">
        <label for="email" class="form-label">
          📧 Email
        </label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          class="form-input"
          placeholder="Enter your email"
        />
      </div>
      
      <div class="alert alert-info">
        <strong>Passwordless Authentication!</strong> We'll send you a magic link to your email. Works for both login and account creation!
      </div>
      
      <div class="btn-group">
        <button
          type="submit"
          disabled={loading}
          class="btn btn-primary btn-full hover-lift"
        >
          {#if loading}
            <div class="spinner"></div>
            {#if success}
              Sending magic link...
            {:else}
              Sending Link...
            {/if}
          {:else}
            🚀 Send Magic Link
          {/if}
        </button>
      </div>
    </form>
    
    <!-- Test API Button -->
    <div class="border-t pt-4 mt-6">
      <button
        type="button"
        on:click={testAPI}
        class="btn btn-outline btn-full hover-lift"
      >
        🧪 Test API Without Authentication
      </button>
      <p class="text-xs text-gray-500 mt-2 text-center">
        This should fail as expected - no valid token
      </p>
    </div>
  </div>
</div>

<style>
  .space-y-4 > * + * {
    margin-top: 1rem;
  }
  
  .space-y-2 > * + * {
    margin-top: 0.5rem;
  }
</style>
