export interface TurnstileResult {
  success: boolean;
  error?: string;
}

export async function verifyTurnstile(token: string, ip?: string): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: true };
  }

  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  if (ip) {
    formData.append('remoteip', ip);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    return { success: false, error: 'turnstile_unavailable' };
  }

  const result = (await response.json()) as { success: boolean };
  return { success: result.success, error: result.success ? undefined : 'turnstile_failed' };
}
