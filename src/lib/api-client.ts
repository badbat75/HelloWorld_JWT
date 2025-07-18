// API Client for HelloWorldAPI_JWT Backend
// Integration with the backend API

const API_BASE_URL = 'http://localhost:3001';

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

/**
 * Make an API request with JWT token
 * @param {string} endpoint - API endpoint path
 * @param {string} token - JWT token
 * @param {ApiOptions} options - Additional fetch options
 * @returns {Promise<any>} API response
 */
async function apiRequest(endpoint: string, token: string, options: ApiOptions = {}): Promise<any> {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return await response.json();
}

/**
 * Validate JWT token with backend API by calling a protected endpoint
 * @param {string} token - JWT token to validate
 * @returns {Promise<object>} Validation result
 */
export async function validateToken(token: string): Promise<{ success: boolean; error?: string; [key: string]: any }> {
  try {
    // Use the /api/user endpoint to validate the token
    // This endpoint requires authentication, so if it succeeds, the token is valid
    const result = await apiRequest('/api/user', token);
    return { success: true, user: result.user, message: 'Token is valid' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get authenticated user information from backend API
 * @param {string} token - JWT token
 * @returns {Promise<object>} User information
 */
export async function getAuthenticatedUser(token: string): Promise<{ success: boolean; error?: string; [key: string]: any }> {
  try {
    const result = await apiRequest('/api/user', token);
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Test the /user endpoint with OAuth2.0 authentication
 * @param {string} token - JWT token from OAuth2.0 authentication
 * @returns {Promise<object>} User information and validation result
 */
export async function testUserEndpoint(token: string): Promise<{ success: boolean; error?: string; [key: string]: any }> {
  try {
    console.log('Testing /user endpoint with OAuth2.0 authentication...');
    const result = await apiRequest('/api/user', token);
    console.log('User endpoint test successful:', result);
    return { 
      success: true, 
      message: 'User endpoint test successful with OAuth2.0 authentication',
      ...result 
    };
  } catch (error) {
    console.error('User endpoint test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'User endpoint test failed'
    };
  }
}

/**
 * Check backend API health
 * @returns {Promise<object>} Health status
 */
export async function checkApiHealth(): Promise<{ success: boolean; error?: string; [key: string]: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return { success: true, ...data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
