import nodemailer, { type Transporter } from 'nodemailer'

// Sends contact form messages over SMTP. Any provider works; with Gmail, use an app
// password (docs/deployment.md). The transport is created on first use and reused.

let transporter: Transporter | undefined

export function isMailerConfigured(): boolean {
  const { contact } = useRuntimeConfig()
  return Boolean(contact.smtpHost && contact.smtpUser && contact.smtpPass && contact.to)
}

export async function sendContactMail(message: ContactInput): Promise<void> {
  const { contact } = useRuntimeConfig()

  transporter ??= nodemailer.createTransport({
    host: contact.smtpHost,
    port: Number(contact.smtpPort),
    secure: String(contact.smtpSecure) !== 'false',
    auth: { user: contact.smtpUser, pass: contact.smtpPass },
    // Nodemailer waits minutes by default. Fail fast so the visitor gets the "email me" message
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })

  const from = contact.from || contact.smtpUser
  const subject = `benduffaut.com: ${message.name}${message.company ? ` (${message.company})` : ''}`
  const text = [
    `From: ${message.name} <${message.email}>`,
    message.company ? `Company: ${message.company}` : '',
    '',
    message.message,
    '',
    '-- Sent from the contact form on benduffaut.com. Reply to answer them directly.',
  ]
    .filter((line, i) => line !== '' || i > 1)
    .join('\n')

  await transporter.sendMail({
    from: { name: 'benduffaut.com', address: from },
    to: contact.to,
    replyTo: { name: message.name, address: message.email },
    subject,
    text,
  })
}
