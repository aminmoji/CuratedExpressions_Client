import { env } from "cloudflare:workers";

export type FirebaseUser = {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
};

type LookupResponse = {
  users?: Array<{
    localId?: string;
    email?: string;
    emailVerified?: boolean;
    displayName?: string;
  }>;
};

export async function getFirebaseUser(
  request: Request,
): Promise<FirebaseUser | null> {
  const authorization = request.headers.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const apiKey = env.FIREBASE_API_KEY?.trim();
  if (!match || !apiKey) return null;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: match[1] }),
      },
    );
    if (!response.ok) return null;

    const data = (await response.json()) as LookupResponse;
    const user = data.users?.[0];
    if (!user?.localId || !user.email) return null;

    return {
      uid: user.localId,
      email: user.email.toLowerCase(),
      emailVerified: user.emailVerified === true,
      displayName: user.displayName?.trim() ?? "",
    };
  } catch {
    return null;
  }
}
