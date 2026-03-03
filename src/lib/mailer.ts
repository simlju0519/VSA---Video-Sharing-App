import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

export async function sendMeetingStarted(to: string[], meetingSubject: string, joinUrl: string, streamUrl?: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || to.length === 0) return;

  const streamLink = streamUrl ? `<p><a href="${streamUrl}">📺 Open Stream</a></p>` : "";

  await transporter.sendMail({
    from: `"VSA Watch Party" <${process.env.GMAIL_USER}>`,
    to: to.join(", "),
    subject: `🔴 ${meetingSubject} is starting now!`,
    html: `
      <h2>${meetingSubject}</h2>
      <p>The watch party is starting! Join now:</p>
      <p><a href="${joinUrl}">🎥 Join Meeting</a></p>
      ${streamLink}
    `,
  });
}
