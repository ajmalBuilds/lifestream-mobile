// Helper to extract data from different API response structures
export const extractAuthData = (response: any) => {
    
    // Case 1: Direct user and token properties
    if (response.user && response.token) {
      return { user: response.user, token: response.token };
    }
    
    // Case 2: Nested under data property (your current structure)
    if (response.data && response.data.user && response.data.token) {
      return { user: response.data.user, token: response.data.token };
    }
    
    // Case 3: Different nested structure
    if (response.data) {
      // Try to find user and token in the data object
      const user = response.data.user || response.data.data?.user;
      const token = response.data.token || response.data.data?.token;
      
      if (user && token) {
        return { user, token };
      }
    }
    
    console.error('Could not extract auth data from response:', response);
    throw new Error('Invalid authentication response format');
  };
  
  // Helper to extract user data for checkAuth
  export const extractUserData = (response: any) => {
    
    // Case 1: Direct user property
    if (response.user) {
      return response.user;
    }
    
    // Case 2: Nested under data property
    if (response.data) {
      return response.data.user || response.data;
    }
    
    console.error('Could not extract user data from response:', response);
    throw new Error('Invalid user data response format');
  };