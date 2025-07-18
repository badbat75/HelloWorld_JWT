<script lang="ts">
  import { authStore } from '$lib/stores/auth'
  import { validateToken, getAuthenticatedUser, checkApiHealth, testUserEndpoint } from '$lib/api-client'
  import { onMount } from 'svelte'
  import { createSupabaseBrowserClient } from '$lib/supabase'
  
  export let data
  
  let userName = ''
  let apiStatus = 'checking...'
  let tokenValidation = { valid: false, message: '' }
  let apiUserData: any = null
  let userEndpointTest = { success: false, message: '', tested: false }
  
  // Initialize auth store with server data
  onMount(async () => {
    let lastSignIn = null
    let backendUser = null
    
    // Get current session from Supabase client (in case it was updated)
    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    // Use current session if available, otherwise use server data
    const currentSession = session || data.session
    const currentUser = session?.user || data.user
    
    authStore.set({
      user: currentUser,
      session: currentSession,
      loading: false,
      lastSignIn: $authStore.lastSignIn,
      backendUser: $authStore.backendUser
    })
    
    // Check API health
    const healthCheck = await checkApiHealth()
    apiStatus = healthCheck.success ? 'healthy' : 'unhealthy'
    
    // If user is authenticated, validate token with backend API
    if (currentSession?.access_token) {
      try {
        console.log('Testing /user endpoint with OAuth2.0 authentication from home page...')
        
        // Test the /user endpoint with OAuth2.0 authentication
        const userTest = await testUserEndpoint(currentSession.access_token)
        console.log('User endpoint test from home page:', userTest)
        
        userEndpointTest = {
          success: userTest.success,
          message: userTest.success ? 'OAuth2.0 /user endpoint working correctly' : userTest.error || 'Test failed',
          tested: true
        }
        
        if (userTest.success) {
          apiUserData = userTest.user
          tokenValidation = {
            valid: true,
            message: 'Token is valid - /user endpoint accessible'
          }
        } else {
          tokenValidation = {
            valid: false,
            message: userTest.error || 'OAuth2.0 authentication failed'
          }
        }
        
        // Extract user info for auth store
        if (userTest.success && userTest.user) {
          backendUser = userTest.user
          if (userTest.user.iat) {
            lastSignIn = new Date(userTest.user.iat * 1000)
          }
        }
        
        // Update auth store with backend data
        authStore.set({
          user: currentUser,
          session: currentSession,
          loading: false,
          lastSignIn,
          backendUser
        })
      } catch (error) {
        console.error('Error testing /user endpoint:', error)
        tokenValidation = {
          valid: false,
          message: 'Failed to connect to backend API'
        }
        userEndpointTest = {
          success: false,
          message: 'Failed to test /user endpoint',
          tested: true
        }
      }
    }
  })
  
  // React to auth store changes
  $: if ($authStore.user) {
    userName = $authStore.user.user_metadata?.name || 
               $authStore.user.user_metadata?.full_name || 
               $authStore.user.email?.split('@')[0] || 
               'User'
  }
  
  // Manual test of /user endpoint
  const testUserEndpointManually = async () => {
    const currentSession = $authStore.session
    if (!currentSession?.access_token) {
      userEndpointTest = {
        success: false,
        message: 'No access token available',
        tested: true
      }
      return
    }
    
    try {
      userEndpointTest = {
        success: false,
        message: 'Testing /user endpoint...',
        tested: true
      }
      
      const result = await testUserEndpoint(currentSession.access_token)
      userEndpointTest = {
        success: result.success,
        message: result.success ? 'Manual test successful!' : result.error || 'Test failed',
        tested: true
      }
      
      if (result.success) {
        apiUserData = result.user
        tokenValidation = {
          valid: true,
          message: 'Token validated via /user endpoint'
        }
      }
    } catch (error) {
      userEndpointTest = {
        success: false,
        message: `Test failed: ${error}`,
        tested: true
      }
    }
  }
</script>

<div class="max-w-4xl mx-auto fade-in">
  {#if $authStore.loading}
    <div class="card text-center">
      <div class="flex items-center justify-center gap-3">
        <div class="spinner"></div>
        <p class="text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  {:else if $authStore.session}
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="card text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Hello {userName}! 👋
        </h1>
        <p class="text-lg text-gray-600">
          Welcome to your authenticated SvelteKit application with Supabase!
        </p>
      </div>

      <!-- Profile Information -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title text-left">Your Profile Information</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-gray-500">📧</span>
              <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-medium">{$authStore.user?.email}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-500">🆔</span>
              <div>
                <p class="text-sm text-gray-500">User ID</p>
                <p class="font-medium text-xs">{$authStore.user?.id}</p>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="text-gray-500">📅</span>
              <div>
                <p class="text-sm text-gray-500">Created</p>
                <p class="font-medium">{new Date($authStore.user?.created_at || '').toLocaleDateString()}</p>
              </div>
            </div>
            {#if $authStore.user?.user_metadata?.name}
              <div class="flex items-center gap-2">
                <span class="text-gray-500">👤</span>
                <div>
                  <p class="text-sm text-gray-500">Name</p>
                  <p class="font-medium">{$authStore.user.user_metadata.name}</p>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Backend API Integration Status -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title text-left">Backend API Integration</h2>
          <p class="card-subtitle">Real-time authentication status with your Rust backend</p>
        </div>
        
        <div class="space-y-4">
          <!-- Status Indicators -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="status-indicator {apiStatus === 'healthy' ? 'success' : 'error'}">
              <span>{apiStatus === 'healthy' ? '✅' : '❌'}</span>
              <div>
                <p class="font-medium">API Status</p>
                <p class="text-xs">{apiStatus}</p>
              </div>
            </div>
            
            <div class="status-indicator {tokenValidation.valid ? 'success' : 'error'}">
              <span>{tokenValidation.valid ? '✅' : '❌'}</span>
              <div>
                <p class="font-medium">JWT Token</p>
                <p class="text-xs">{tokenValidation.valid ? 'Valid' : 'Invalid'}</p>
              </div>
            </div>
            
            {#if userEndpointTest.tested}
              <div class="status-indicator {userEndpointTest.success ? 'success' : 'error'}">
                <span>{userEndpointTest.success ? '✅' : '❌'}</span>
                <div>
                  <p class="font-medium">OAuth2.0 Test</p>
                  <p class="text-xs">{userEndpointTest.success ? 'Success' : 'Failed'}</p>
                </div>
              </div>
            {/if}
          </div>
          
          <!-- Messages -->
          {#if tokenValidation.message}
            <div class="alert alert-info">
              <strong>Token Status:</strong> {tokenValidation.message}
            </div>
          {/if}
          
          {#if userEndpointTest.message}
            <div class="alert {userEndpointTest.success ? 'alert-success' : 'alert-error'}">
              <strong>Endpoint Test:</strong> {userEndpointTest.message}
            </div>
          {/if}
          
          <!-- Backend API User Data -->
          {#if apiUserData}
            <div class="card bg-gray-50">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Backend API User Data</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <p><strong>ID:</strong> <span class="text-sm">{apiUserData.id}</span></p>
                  <p><strong>Email:</strong> {apiUserData.email}</p>
                  {#if apiUserData.name}
                    <p><strong>Name:</strong> {apiUserData.name}</p>
                  {/if}
                </div>
                <div class="space-y-2">
                  <p><strong>Email Confirmed:</strong> 
                    <span class={`px-2 py-1 rounded text-xs ${apiUserData.email_confirmed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {apiUserData.email_confirmed ? 'Yes' : 'No'}
                    </span>
                  </p>
                  <p><strong>Last Sign In:</strong> <span class="text-sm">{new Date(apiUserData.last_sign_in).toLocaleString()}</span></p>
                </div>
              </div>
            </div>
          {/if}
          
          <!-- Action Buttons -->
          <div class="flex gap-3 flex-wrap">
            <button
              type="button"
              on:click={testUserEndpointManually}
              class="btn btn-primary hover-lift"
            >
              🔍 Test /user Endpoint
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="card text-center max-w-2xl mx-auto">
      <div class="card-header">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          🌍 Hello World!
        </h1>
        <p class="text-lg text-gray-600">
          Access your account with a magic link to see your personalized greeting and test the JWT authentication.
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .grid {
    display: grid;
  }
  
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  @media (min-width: 768px) {
    .md\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    
    .md\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  
  .space-y-2 > * + * {
    margin-top: 0.5rem;
  }
  
  .space-y-3 > * + * {
    margin-top: 0.75rem;
  }
  
  .space-y-4 > * + * {
    margin-top: 1rem;
  }
  
  .space-y-6 > * + * {
    margin-top: 1.5rem;
  }
</style>
