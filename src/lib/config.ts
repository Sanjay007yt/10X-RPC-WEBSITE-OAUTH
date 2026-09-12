// 10X RPC — Central configuration
// All secrets come from environment variables in production.

export const CONFIG = {
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    botToken: process.env.DISCORD_BOT_TOKEN || '',
    redirectUri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/callback',
    // Gaming SDK scopes — matches the Roxy reference consent screen.
    // These enable rich presence, activity status, friend list access, and game invites.
    scope: process.env.DISCORD_OAUTH_SCOPE || 'openid identify email guilds sdk.social_layer_presence relationships.read',
    authorizeUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    apiBase: 'https://discord.com/api/v10',
    gatewayUrl: 'wss://gateway.discord.gg/?v=10&encoding=json',
  },
  app: {
    name: '10X RPC',
    tagline: 'Premium Discord Rich Presence',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    trialDays: 3,
  },
  weather: {
    // Open-Meteo — no API key required
    geocodeUrl: 'https://geocoding-api.open-meteo.com/v1/search',
    forecastUrl: 'https://api.open-meteo.com/v1/forecast',
  },
  session: {
    cookieName: '10x_rpc_session',
    ttlDays: 7,
    secret: process.env.SESSION_SECRET || '10x-rpc-dev-secret-change-me-in-production-32bytes-min',
  },
}

export type AppConfig = typeof CONFIG
