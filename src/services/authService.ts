import { UserProfile } from '../types';

export const authService = {
  async signIn(): Promise<void> {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || '25f1pvpper6aiije0ufdod082l';
    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI || `${window.location.origin}${base}callback`;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    const authority = import.meta.env.VITE_COGNITO_AUTHORITY || 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_4IYy9fOND';

    if (cognitoDomain) {
      const loginUrl = `${cognitoDomain}/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid+email+profile`;
      window.location.href = loginUrl;
    } else {
      // Fallback redirect to OIDC identity provider authorization endpoint
      const authEndpoint = `${authority}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid+email+profile`;
      window.location.href = authEndpoint;
    }
  },

  async signOut(): Promise<void> {
    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI || `${window.location.origin}${base}`;
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || '25f1pvpper6aiije0ufdod082l';
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

    if (cognitoDomain) {
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    } else {
      window.location.href = logoutUri;
    }
  },

  isConfigured(): boolean {
    return Boolean(import.meta.env.VITE_COGNITO_CLIENT_ID);
  }
};
