import admin from 'firebase-admin';
import { dbAdmin as db } from "@/lib/firebase-admin";
import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;
    const adminEmail = process.env.ADMIN_EMAIL; // Your email address

    // 1. Validate required fields
    if (!name || !email || !subject || !message || !adminEmail) {
      return new Response(
        JSON.stringify({ error: "All fields are required and admin email must be set." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Save message to Firestore
    await db.collection("messages").add({
      name,
      email,
      subject,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });

    // 4. Send email notification via Resend
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev', // Default Resend address
            to: adminEmail,
            subject: `New Portfolio Message: ${subject}`,
            html: `
                <h1>New Message from your Portfolio</h1>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <hr>
                <p>This message was saved to your Firestore database. Log in to the admin dashboard to view and manage it.</p>
            `,
        });
    } catch (emailError) {
    }

    return new Response(
      JSON.stringify({ message: "Message sent successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}