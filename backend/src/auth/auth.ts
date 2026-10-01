import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP, phoneNumber } from 'better-auth/plugins';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY ?? '');

/**
 * Better Auth is the ONLY auth system: phone + email OTP, sessions,
 * device tracking. Email codes go through Resend. Phone codes go through
 * the configured SMS sender; until SMS_API_KEY exists they are logged
 * for development and never accepted as verified without a matching code.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: false },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      async sendVerificationOTP({ email, otp }) {
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? 'Trex <hello@example.com>',
          to: email,
          subject: 'Your Trex code',
          text: `Your Trex code is ${otp}. It expires in 10 minutes.`,
        });
      },
    }),
    phoneNumber({
      otpLength: 6,
      expiresIn: 600,
      sendOTP: async ({ phoneNumber: phone, code }) => {
        if (!process.env.SMS_API_KEY) {
          console.log(`[sms-preview] code for ${phone}: ${code}`);
          return;
        }
        // Provider seam: POST code to the SMS sender here (Termii/Twilio),
        // then throw on non-2xx so the OTP is NOT marked delivered.
        const res = await fetch('https://api.sms-provider.example/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SMS_API_KEY}` },
          body: JSON.stringify({ to: phone, from: process.env.SMS_SENDER ?? 'TREX', text: `Your Trex code is ${code}.` }),
        });
        if (!res.ok) throw new Error('SMS delivery failed.');
      },
    }),
  ],
});
