import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing email or name' }, { status: 400 });
    }

    // Create a transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'olakunlemicheal878@gmail.com',
        pass: process.env.EMAIL_PASS || 'mhms njzc okcn gxyg',
      },
    });

    // Email content
    const mailOptions = {
      from: '"OttoBob" <olakunlemicheal878@gmail.com>',
      to: email,
      subject: 'Welcome to OttoBob!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center;">
          
          <div style="background-color: #0a0a0f; padding: 30px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            
            <div style="margin-bottom: 24px;">
              <h1 style="color: #f0f0f4; font-size: 28px; font-weight: 700; margin: 0;">Welcome to OttoBob.ai!</h1>
              <p style="color: #00e5ff; font-size: 18px; font-weight: 500; margin-top: 8px;">Your growth journey begins here.</p>
            </div>
            
            <div style="background-color: #111118; border: 1px solid #1c1c24; border-radius: 16px; padding: 24px; text-align: left; margin-bottom: 24px;">
              <p style="color: #a0a0b0; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${name},</p>
              
              <p style="color: #a0a0b0; font-size: 16px; line-height: 1.6;">
                We are absolutely thrilled to welcome you to the OttoBob family. Our platform is designed to help you leverage the power of AI to supercharge your business growth.
              </p>
              
              <p style="color: #a0a0b0; font-size: 16px; line-height: 1.6;">
                Your account has been successfully created. Bob, our AI agent, is already standing by to assist you in running your operations more smoothly than ever.
              </p>
              
              <p style="color: #a0a0b0; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
                If you have any questions or need help getting started, just reply to this email!
              </p>
            </div>
            
            <div>
              <a href="https://ottobob.ai" style="display: inline-block; background-color: #00e5ff; color: #0a0a0f; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 28px; border-radius: 12px; transition: background-color 0.2s;">
                Go to Dashboard
              </a>
            </div>
            
          </div>
          
          <div style="margin-top: 24px; font-size: 12px; color: #6b7280;">
            &copy; ${new Date().getFullYear()} OttoBob.ai. All rights reserved.
          </div>
        </div>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
