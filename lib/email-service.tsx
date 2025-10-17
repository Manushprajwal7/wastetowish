import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "")

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const msg = {
      to: options.to,
      from: options.from || process.env.NEXT_PUBLIC_SENDGRID_FROM_EMAIL || "noreply@wastetowish.com",
      subject: options.subject,
      html: options.html,
    }

    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

export function getRequestNotificationEmail(requesterName: string, itemTitle: string, itemId: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d7d4a;">New Request for Your Item!</h2>
      <p>Hi there,</p>
      <p><strong>${requesterName}</strong> has requested your item: <strong>${itemTitle}</strong></p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/requests" style="background-color: #2d7d4a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Request
        </a>
      </p>
      <p>Best regards,<br/>Waste to Wish Team</p>
    </div>
  `
}

export function getAcceptedNotificationEmail(itemTitle: string, chatId: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d7d4a;">Your Request Was Accepted!</h2>
      <p>Great news! Your request for <strong>${itemTitle}</strong> has been accepted.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/chat/${chatId}" style="background-color: #2d7d4a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Start Chatting
        </a>
      </p>
      <p>Best regards,<br/>Waste to Wish Team</p>
    </div>
  `
}
