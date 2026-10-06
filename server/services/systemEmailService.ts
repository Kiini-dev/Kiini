import { sendEmail } from "../_core/mail";
import {
  renderNotificationTemplate,
  type NotificationRenderContext,
  type NotificationTemplateFallback,
} from "./notificationRenderer";

export async function sendSystemEmail(
  templateId: string,
  context: NotificationRenderContext,
  fallback: NotificationTemplateFallback,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  let rendered = fallback;
  try {
    rendered = await renderNotificationTemplate(templateId, context, fallback);
  } catch (error) {
    console.warn(`[SystemEmail] Template ${templateId} could not be rendered; using fallback`, error);
  }

  return sendEmail({
    to: String(context.recipientEmail || context.userEmail || context.user?.email || ""),
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    attachments: context.attachments,
  });
}