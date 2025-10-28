const ENV = {
    development: {
      API_BASE_URL: 'https://lifestream-backend-he53.onrender.com/api',
    },
    production: {
      API_BASE_URL: 'https://lifestream-backend-he53.onrender.com/api',
    },
    staging: {
      API_BASE_URL: 'https://lifestream-backend-he53.onrender.com/api',
    },
  };
  
  const getEnvironment = () => {
    if (__DEV__) return ENV.development;
    
    // For production builds
    return ENV.production;
  };
  
  export const Config = getEnvironment();