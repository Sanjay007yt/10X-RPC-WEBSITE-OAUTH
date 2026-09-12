// 10X RPC — Central configuration
// All secrets come from environment variables in production.

export const CONFIG = {
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    botToken: process.env.DISCORD_BOT_TOKEN || '',
    redirectUri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/callback',
    // Gaming SDK scope — required for the Gaming SDK gateway connection.
    // `sdk.social_layer_presence` is what allows the app to push presence updates.
    // Do NOT add `activities.write` or `relationships.read` — they get rejected
    // for non-Gaming-SDK-verified apps.
    scope: process.env.DISCORD_OAUTH_SCOPE || 'openid identify sdk.social_layer_presence',
    authorizeUrl: 'https://discord.com/api/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    apiBase: 'https://discord.com/api/v9',
    // Gaming SDK gateway — this is DIFFERENT from the regular Discord gateway.
    // OAuth2 user tokens are REJECTED on gateway.discord.gg.
    // The Gaming SDK gateway (gateway.gaming-sdk.com) accepts OAuth2 user tokens
    // that have the `sdk.social_layer_presence` scope.
    gatewayUrl: 'wss://gateway.gaming-sdk.com/?v=10&encoding=json',
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
