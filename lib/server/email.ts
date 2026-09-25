import 'server-only'
import { getSettings } from './settings'

type EmailMessage = { to: string | string[]; subject: string; text: string }

export function emailProviderStatus() {
  const provider = process.env.EMAIL_PROVIDER ?? (process.env.RESEND_API_KEY ? 'resend' : 'none')
  const configured = provider === 'resend' && !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM
  return { provider, configured }
}

/**
 * Provider-agnostic email sender. Credentials come only from server env vars
 * (EMAIL_PROVIDER, RESEND_API_KEY, EMAIL_FROM). When no provider is configured
 * the message is skipped and in-app notifications remain the delivery channel.
 */
export async function sendEmail(message: EmailMessage): Promise<{ sent: boolean; reason?: string }> {
  const settings = await getSettings()
  const status = emailProviderStatus()
  if (!settings.email.enabled) return { sent: false, reason: 'disabled' }
  if (!status.configured) return { sent: false, reason: 'not_configured' }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${settings.email.fromName} <${process.env.EMAIL_FROM}>`,
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        text: message.text,
      }),
    })
    if (!response.ok) return { sent: false, reason: `provider_error_${response.status}` }
    return { sent: true }
  } catch {
    return { sent: false, reason: 'network_error' }
  }
}
