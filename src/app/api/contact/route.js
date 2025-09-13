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
            subject: `📧 Nouveau message portfolio : ${subject}`,
            html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Nouveau Message de votre Portfolio</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
                            line-height: 1.5; 
                            color: #1c1c22; 
                            background: #f8fafc;
                            padding: 32px;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 0 auto; 
                            background: white; 
                            border-radius: 16px; 
                            overflow: hidden; 
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                            border: 1px solid #e2e8f0;
                        }
                        .header { 
                            background: #FF9932;
                            color: white; 
                            padding: 48px 32px; 
                            text-align: center; 
                        }
                        .header-icon {
                            font-size: 64px;
                            margin: 0 auto 24px auto;
                            display: block;
                        }
                        .header h1 { 
                            font-size: 24px; 
                            font-weight: 600; 
                            margin-bottom: 8px;
                        }
                        .header p {
                            font-size: 16px;
                            opacity: 0.9;
                            font-weight: 400;
                        }
                        .content { 
                            padding: 40px 32px; 
                        }
                        .info-section {
                            margin-bottom: 40px;
                        }
                        .section-header {
                            display: flex;
                            align-items: center;
                            gap: 16px;
                            margin-bottom: 24px;
                            padding-bottom: 16px;
                            border-bottom: 2px solid #f1f5f9;
                        }
                        .section-icon {
                            font-size: 20px;
                            color: #FF9932;
                        }
                        .section-title {
                            font-size: 18px;
                            font-weight: 600;
                            color: #1e293b;
                        }
                        .info-grid {
                            display: grid;
                            gap: 20px;
                        }
                        .info-item {
                            display: flex;
                            align-items: flex-start;
                            gap: 16px;
                            padding: 20px;
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                        }
                        .info-icon {
                            font-size: 16px;
                            color: #FF9932;
                            flex-shrink: 0;
                            margin-top: 2px;
                        }
                        .info-content {
                            flex: 1;
                        }
                        .info-label {
                            font-size: 12px;
                            font-weight: 500;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            margin-bottom: 4px;
                        }
                        .info-value {
                            font-size: 15px;
                            font-weight: 500;
                            color: #1e293b;
                            word-break: break-word;
                        }
                        .message-section {
                            background: #fafafa;
                            border: 1px solid #e4e4e7;
                            border-radius: 12px;
                            padding: 32px;
                            margin-bottom: 32px;
                        }
                        .subject-item {
                            margin-bottom: 24px;
                        }
                        .subject-label {
                            font-size: 12px;
                            font-weight: 500;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            margin-bottom: 8px;
                        }
                        .subject-value {
                            display: inline-block;
                            background: #FF9932;
                            color: white;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 500;
                        }
                        .message-item {
                            border-top: 1px solid #e4e4e7;
                            padding-top: 24px;
                        }
                        .message-label {
                            font-size: 12px;
                            font-weight: 500;
                            color: #64748b;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            margin-bottom: 16px;
                        }
                        .message-text {
                            background: white;
                            border: 1px solid #e2e8f0;
                            border-radius: 8px;
                            padding: 20px;
                            font-size: 15px;
                            line-height: 1.6;
                            color: #374151;
                        }
                        .message-text p {
                            margin: 0 0 12px 0;
                        }
                        .message-text p:last-child {
                            margin-bottom: 0;
                        }
                        .footer {
                            background: #f8fafc;
                            border-top: 1px solid #e2e8f0;
                            padding: 24px 32px;
                            text-align: center;
                        }
                        .timestamp {
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            font-size: 14px;
                            color: #64748b;
                            font-weight: 500;
                        }
                        .timestamp-icon {
                            color: #FF9932;
                        }
                        @media (min-width: 640px) {
                            .info-grid {
                                grid-template-columns: 1fr 1fr;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="header-icon">📧</div>
                            <h1>Nouveau Message Portfolio</h1>
                            <p>Un nouveau message a été reçu via votre site web</p>
                        </div>
                        
                        <div class="content">
                            <!-- Contact Information -->
                            <div class="info-section">
                                <div class="section-header">
                                    <div class="section-icon">👤</div>
                                    <div class="section-title">Informations de Contact</div>
                                </div>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <div class="info-icon">👤</div>
                                        <div class="info-content">
                                            <div class="info-label">Nom complet</div>
                                            <div class="info-value">${name}</div>
                                        </div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-icon">@</div>
                                        <div class="info-content">
                                            <div class="info-label">Adresse email</div>
                                            <div class="info-value">${email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Message Content -->
                            <div class="info-section">
                                <div class="section-header">
                                    <div class="section-icon">💬</div>
                                    <div class="section-title">Message Reçu</div>
                                </div>
                                <div class="message-section">
                                    <div class="subject-item">
                                        <div class="subject-label">Sujet</div>
                                        <div class="subject-value">${subject}</div>
                                    </div>
                                    <div class="message-item">
                                        <div class="message-label">Contenu</div>
                                        <div class="message-text">
                                            ${message.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '<p>&nbsp;</p>').join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <div class="timestamp">
                                <span class="timestamp-icon">🕒</span>
                                Reçu le ${new Date().toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                </body>
                </html>
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