# ZUNO email OTP setup

The frontend now uses Supabase email OTP sign-in and expects a six-digit code.

## 1. Configure the email template
In Supabase Dashboard, open Authentication → Email Templates → Magic Link.
Set the subject to: Your ZUNO verification code
Use the `{{ .Token }}` variable in the body. Example:

```html
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#0b0b0b;color:#f4efe4;border:1px solid #5d4b2c;border-radius:16px">
  <h2 style="color:#d8b45e">ZUNO</h2>
  <p>Use this code to sign in to your ZUNO account:</p>
  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#e5d2a6">{{ .Token }}</p>
  <p>This code is for one-time use. Do not share it with anyone.</p>
</div>
```

The template must use `{{ .Token }}` rather than `{{ .ConfirmationURL }}` to send a code.

## 2. Configure delivery for real users
Supabase's default SMTP is restricted to authorized team addresses and has a low sending limit. To send to arbitrary Gmail addresses, configure a custom SMTP provider in Authentication → SMTP Settings. Never put SMTP credentials in frontend code or Git.

For Google Workspace SMTP, Supabase's current guidance requires the sender and SMTP username to be the Workspace admin email and an App Password; use smtp.gmail.com on port 465 or 587. Do not use the normal Gmail account password. Google account security settings may restrict this setup. A dedicated transactional provider such as Resend, Brevo, Postmark, or SES is usually more suitable for a public app.

## 3. Security notes
- Keep email confirmation enabled.
- Keep OTP expiry at or below one hour.
- Configure CAPTCHA/rate limits before public launch.
- Never expose service-role keys or SMTP credentials in VITE_ variables.
- Test delivery to an address outside the project team before launch.
