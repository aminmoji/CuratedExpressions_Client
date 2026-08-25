import { env } from "cloudflare:workers";

export function GET() {
  const config = {
    apiKey: env.FIREBASE_API_KEY?.trim() ?? "",
    authDomain: env.FIREBASE_AUTH_DOMAIN?.trim() ?? "",
    projectId: env.FIREBASE_PROJECT_ID?.trim() ?? "",
    appId: env.FIREBASE_APP_ID?.trim() ?? "",
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "",
  };

  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    return Response.json(
      { error: "Sign-in is being configured. Please try again shortly." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(config, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
