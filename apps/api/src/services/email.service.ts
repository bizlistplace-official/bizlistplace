import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;

  /**
   * Initializes and returns the Nodemailer Transporter singleton
   */
  public static getTransporter(): Transporter {
    if (!this.transporter) {
      const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass } = config.email;

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure, // true for port 465, false for 587
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          // Prevent self-signed or local certificate chain failure on certain OS/node configurations
          rejectUnauthorized: false,
        },
      });
    }

    return this.transporter;
  }

  /**
   * Verifies SMTP connection health with Gmail
   */
  public static async verifyConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      return {
        success: true,
        message: 'Gmail SMTP connection verified successfully.',
      };
    } catch (err: any) {
      console.error('[SMTP VERIFY ERROR]:', err?.message || err);
      return {
        success: false,
        message: err?.message || 'Failed to authenticate with Gmail SMTP server.',
      };
    }
  }

  /**
   * Base method to send emails safely. Email failure will NOT crash application workflows.
   */
  public static async sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!options.to || !options.to.includes('@')) {
        console.warn(`[EMAIL SKIPPED] Invalid recipient email address: "${options.to}"`);
        return { success: false, error: 'Invalid recipient email' };
      }

      // If credentials are not provided (e.g. test env), fallback to simulated dispatch
      if (!config.email.smtpUser || !config.email.smtpPass) {
        console.log(`[EMAIL SIMULATED - NO SMTP PASS] To: ${options.to} | Subject: ${options.subject}`);
        return { success: true, messageId: 'simulated-no-pass' };
      }

      const transporter = this.getTransporter();
      const fromAddress = `"${config.email.fromName}" <${config.email.fromEmail}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
        replyTo: options.replyTo || config.email.adminEmail,
      });

      console.log(`[EMAIL SENT] To: ${options.to} | Subject: "${options.subject}" | MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[EMAIL DISPATCH FAILED] To: ${options.to} | Subject: "${options.subject}":`, err?.message || err);
      return { success: false, error: err?.message || 'Unknown email transmission error' };
    }
  }

  /**
   * Generates a modern, responsive HTML email template using Biz List Place branding
   */
  private static renderTemplate(params: {
    title: string;
    preheader?: string;
    greeting?: string;
    paragraphs: string[];
    otpCode?: string;
    ctaButton?: { text: string; url: string };
    highlightBox?: { label: string; value: string; isWarning?: boolean };
    footnote?: string;
  }): string {
    const siteUrl = config.clientUrl || 'https://bizlistplace.com';
    const logoUrl = `${siteUrl}/apple-touch-icon.png`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 40px 16px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 20px;
      border: 1px solid #E2E8F0;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }
    .header {
      padding: 32px 36px 24px 36px;
      text-align: left;
      border-bottom: 1px solid #F1F5F9;
      background-color: #FFFFFF;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.5px;
      text-decoration: none;
      display: inline-block;
    }
    .logo-accent {
      color: #1D68F2;
    }
    .body {
      padding: 36px 36px 28px 36px;
    }
    .heading {
      font-size: 22px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 16px 0;
      line-height: 1.3;
      letter-spacing: -0.3px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 16px 0;
    }
    .otp-card {
      margin: 28px 0;
      padding: 24px;
      background: #EFF6FF;
      border: 1.5px dashed #93C5FD;
      border-radius: 16px;
      text-align: center;
    }
    .otp-label {
      font-size: 12px;
      font-weight: 700;
      color: #1D68F2;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
    }
    .otp-number {
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 10px;
      color: #0F172A;
      font-family: 'Courier New', Courier, monospace;
      margin: 4px 0;
    }
    .otp-timer {
      font-size: 12px;
      color: #64748B;
      margin-top: 8px;
    }
    .cta-container {
      margin: 28px 0;
      text-align: left;
    }
    .cta-btn {
      display: inline-block;
      background-color: #1D68F2;
      color: #FFFFFF !important;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(29, 104, 242, 0.25);
    }
    .info-box {
      margin: 24px 0;
      padding: 16px 20px;
      background-color: #F8FAFC;
      border-left: 4px solid #1D68F2;
      border-radius: 8px;
    }
    .info-box.warning {
      background-color: #FFFBEB;
      border-left-color: #F59E0B;
    }
    .info-label {
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      color: #0F172A;
      font-weight: 600;
      line-height: 1.5;
    }
    .footer {
      padding: 24px 36px 36px 36px;
      border-top: 1px solid #F1F5F9;
      background-color: #FAFBFD;
      text-align: center;
    }
    .footer-text {
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.5;
      margin: 0 0 8px 0;
    }
    .footer-link {
      color: #1D68F2;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <a href="${siteUrl}" class="logo-text">
          BizListPlace<span class="logo-accent">.com</span>
        </a>
      </div>

      <!-- Main Content -->
      <div class="body">
        <h1 class="heading">${params.title}</h1>

        ${params.greeting ? `<p class="text"><strong>${params.greeting}</strong></p>` : ''}

        ${params.paragraphs.map((p) => `<p class="text">${p}</p>`).join('')}

        <!-- 6-Digit OTP Box (if supplied) -->
        ${
          params.otpCode
            ? `
          <div class="otp-card">
            <div class="otp-label">Your Verification Code</div>
            <div class="otp-number">${params.otpCode}</div>
            <div class="otp-timer">This code expires in 15 minutes. Do not share it with anyone.</div>
          </div>
        `
            : ''
        }

        <!-- Highlight Callout Box (if supplied) -->
        ${
          params.highlightBox
            ? `
          <div class="info-box ${params.highlightBox.isWarning ? 'warning' : ''}">
            <div class="info-label">${params.highlightBox.label}</div>
            <div class="info-value">${params.highlightBox.value}</div>
          </div>
        `
            : ''
        }

        <!-- CTA Button (if supplied) -->
        ${
          params.ctaButton
            ? `
          <div class="cta-container">
            <a href="${params.ctaButton.url}" class="cta-btn" target="_blank">
              ${params.ctaButton.text} &rarr;
            </a>
          </div>
        `
            : ''
        }

        <!-- Footnote / Notice -->
        ${
          params.footnote
            ? `
          <p class="text" style="font-size: 12px; color: #94A3B8; margin-top: 24px; border-top: 1px solid #F1F5F9; padding-top: 16px;">
            ${params.footnote}
          </p>
        `
            : ''
        }
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          <strong>BizListPlace.com</strong> &bull; The Worldwide Verified Business Directory
        </p>
        <p class="footer-text">
          This is an automated system email from Biz List Place. If you did not request this, please contact 
          <a href="mailto:${config.email.adminEmail}" class="footer-link">${config.email.adminEmail}</a>.
        </p>
        <p class="footer-text" style="margin-top: 12px;">
          &copy; ${new Date().getFullYear()} BizListPlace.com. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  // =========================================================================
  // 1. User Registration Verification (OTP + 1-Click Link)
  // =========================================================================
  public static async sendRegistrationVerification(
    email: string,
    name: string,
    otp: string,
    token: string
  ): Promise<void> {
    const siteUrl = config.clientUrl || 'http://localhost:3000';
    const verifyUrl = `${siteUrl}/verify-email?token=${token}`;

    const html = this.renderTemplate({
      title: 'Verify Your Email Address',
      greeting: `Hello ${name || 'there'},`,
      paragraphs: [
        'Welcome to Biz List Place! Please verify your email address to complete your account setup and activate your listing management privileges.',
        'You can verify your email using the 6-digit code below or by clicking the one-click verification button.',
      ],
      otpCode: otp,
      ctaButton: {
        text: 'Verify Email Address',
        url: verifyUrl,
      },
      footnote: `If the button above does not work, copy and paste this link into your browser: <br/><a href="${verifyUrl}" style="color:#1D68F2; word-break:break-all;">${verifyUrl}</a>`,
    });

    await this.sendMail({
      to: email,
      subject: `Verify Your Biz List Place Account - Code: ${otp}`,
      html,
    });
  }

  // =========================================================================
  // 2. Forgot Password and Password Reset (6-Digit OTP + Direct Link)
  // =========================================================================
  public static async sendPasswordResetOtp(email: string, name: string, otp: string): Promise<void> {
    const html = this.renderTemplate({
      title: 'Reset Your Password - Verification Code',
      greeting: `Hello ${name || 'there'},`,
      paragraphs: [
        'We received a request to reset the password for your Biz List Place account.',
        'Use the 6-digit verification code below to verify your identity and set a new password:',
      ],
      otpCode: otp,
      footnote: 'This code expires in 5 minutes and can only be used once. If you did not request a password reset, you can safely ignore this email. Your account remains completely secure.',
    });

    await this.sendMail({
      to: email,
      subject: `[Code: ${otp}] Reset Your Biz List Place Password`,
      html,
    });
  }

  public static async sendPasswordReset(email: string, token: string, name?: string): Promise<void> {
    const siteUrl = config.clientUrl || 'http://localhost:3000';
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    const html = this.renderTemplate({
      title: 'Reset Your Password',
      greeting: `Hello ${name || 'User'},`,
      paragraphs: [
        'We received a request to reset the password for your Biz List Place account.',
        'Click the button below to securely set up a new password. This link is valid for 60 minutes and can only be used once.',
      ],
      ctaButton: {
        text: 'Reset My Password',
        url: resetUrl,
      },
      footnote: 'If you did not request a password reset, you can safely ignore this email. Your account remains completely secure.',
    });

    await this.sendMail({
      to: email,
      subject: 'Reset Your Biz List Place Password',
      html,
    });
  }

  public static async sendPasswordResetSuccess(email: string, name: string): Promise<void> {
    const html = this.renderTemplate({
      title: 'Password Successfully Changed',
      greeting: `Hello ${name || 'User'},`,
      paragraphs: [
        'The password for your Biz List Place account has been updated successfully.',
        'You can now log in using your new credentials.',
      ],
      ctaButton: {
        text: 'Log In to Account',
        url: `${config.clientUrl}/login`,
      },
      footnote: 'If you did not make this change, please immediately reset your password or contact our security team at bizlistplaceofficial@gmail.com.',
    });

    await this.sendMail({
      to: email,
      subject: 'Security Alert: Password Changed Successfully',
      html,
    });
  }

  // =========================================================================
  // 3. Business Listing Submission Confirmation (to submitter)
  // =========================================================================
  public static async sendListingSubmissionConfirmation(
    email: string,
    businessName: string,
    submitterName?: string
  ): Promise<void> {
    const html = this.renderTemplate({
      title: 'Listing Submission Received',
      greeting: `Hello ${submitterName || 'Business Owner'},`,
      paragraphs: [
        `Thank you for listing <strong>${businessName}</strong> on Biz List Place!`,
        'Your business submission has been received and entered into our compliance queue with status: <strong>Pending Review</strong>.',
        'Our editorial and verification team verifies commercial registration, location validity, and contact accuracy. This typically takes 1-2 business days.',
      ],
      highlightBox: {
        label: 'Current Status',
        value: 'Pending Moderation Review &bull; Not Yet Visible Publicly',
      },
      ctaButton: {
        text: 'View in Your Dashboard',
        url: `${config.clientUrl}/dashboard`,
      },
      footnote: 'Once reviewed, you will receive an immediate email notification confirming publication or providing feedback.',
    });

    await this.sendMail({
      to: email,
      subject: `Listing Received: "${businessName}" is Pending Review`,
      html,
    });
  }

  // =========================================================================
  // 4. Admin Alert for New Business Listing Submission
  // =========================================================================
  public static async sendNewBusinessAdminAlert(business: {
    name: string;
    slug: string;
    contactEmail: string;
    city?: string;
    countryCode?: string;
  }): Promise<void> {
    const adminUrl = `${config.clientUrl}/admin`;

    const html = this.renderTemplate({
      title: 'New Business Listing Submitted for Moderation',
      greeting: 'Admin Notification:',
      paragraphs: [
        `A new business listing has just been submitted and requires moderation review:`,
      ],
      highlightBox: {
        label: 'Business Details',
        value: `<strong>Name:</strong> ${business.name}<br/><strong>Contact:</strong> ${business.contactEmail}<br/><strong>Location:</strong> ${business.city || 'N/A'}, ${business.countryCode || 'N/A'}<br/><strong>Slug:</strong> /business/${business.slug}`,
      },
      ctaButton: {
        text: 'Review in Admin Portal',
        url: adminUrl,
      },
      footnote: 'Log in with your administrator credentials to approve, request revisions, or reject this listing.',
    });

    await this.sendMail({
      to: config.email.adminEmail,
      subject: `[Admin Alert] New Business Pending Review: "${business.name}"`,
      html,
    });
  }

  // =========================================================================
  // 5. Business Approval Notification (to owner)
  // =========================================================================
  public static async sendListingApprovedNotification(
    email: string,
    businessName: string,
    slug: string
  ): Promise<void> {
    const listingUrl = `${config.clientUrl}/business/${slug}`;

    const html = this.renderTemplate({
      title: 'Congratulations! Your Listing is Live',
      greeting: 'Great news!',
      paragraphs: [
        `Your business listing for <strong>${businessName}</strong> has been verified and published to Biz List Place.`,
        'Your profile is now discoverable worldwide across search results, category indexes, and regional directory pages.',
      ],
      highlightBox: {
        label: 'Live Listing URL',
        value: `<a href="${listingUrl}" style="color:#1D68F2; text-decoration:none;">${listingUrl}</a>`,
      },
      ctaButton: {
        text: 'View Your Live Business Profile',
        url: listingUrl,
      },
      footnote: 'You can update branch addresses, logo images, service areas, and operational hours anytime from your Owner Dashboard.',
    });

    await this.sendMail({
      to: email,
      subject: `Approved & Published: "${businessName}" is now live on Biz List Place`,
      html,
    });
  }

  // =========================================================================
  // 6. Business Rejection / Revision Notification
  // =========================================================================
  public static async sendListingRejectedNotification(
    email: string,
    businessName: string,
    reason?: string
  ): Promise<void> {
    const html = this.renderTemplate({
      title: 'Listing Update Required',
      greeting: 'Important Listing Notice:',
      paragraphs: [
        `Thank you for submitting <strong>${businessName}</strong> to Biz List Place.`,
        'During our moderation review, we were unable to approve the listing in its current state.',
      ],
      highlightBox: {
        label: 'Feedback from Compliance Team',
        value: reason || 'Listing details do not meet our minimum directory verification guidelines.',
        isWarning: true,
      },
      ctaButton: {
        text: 'Open Dashboard to Revise',
        url: `${config.clientUrl}/dashboard`,
      },
      footnote: 'Please review your description, contact address, and premises details and resubmit. If you have questions, reply to this email.',
    });

    await this.sendMail({
      to: email,
      subject: `Action Required: Moderation feedback on "${businessName}"`,
      html,
    });
  }

  // =========================================================================
  // 7. Business Claim Verification (OTP + 1-Click Link)
  // =========================================================================
  public static async sendClaimVerification(
    email: string,
    otp: string,
    token: string,
    businessName: string
  ): Promise<void> {
    const verifyUrl = `${config.clientUrl}/claim-verify?token=${token}`;

    const html = this.renderTemplate({
      title: 'Verify Listing Ownership Claim',
      greeting: 'Ownership Verification Request',
      paragraphs: [
        `We received a claim request to verify and manage the profile of <strong>${businessName}</strong> on Biz List Place.`,
        'To confirm that you have direct access to this corporate email address, please use the 6-digit code or the one-click verification link below:',
      ],
      otpCode: otp,
      ctaButton: {
        text: '1-Click Confirm Ownership Link',
        url: verifyUrl,
      },
      footnote: 'Note: Verifying your email proves recipient authorization. Official ownership transfer is finalized upon administrative compliance review.',
    });

    await this.sendMail({
      to: email,
      subject: `[Verification Code: ${otp}] Claim Listing: "${businessName}"`,
      html,
    });
  }

  // =========================================================================
  // 8. Business Claim Status Decision Notification
  // =========================================================================
  public static async sendClaimStatusNotification(
    email: string,
    businessName: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<void> {
    const isApproved = status === 'approved';

    const html = this.renderTemplate({
      title: isApproved ? 'Ownership Claim Approved' : 'Ownership Claim Decision',
      paragraphs: isApproved
        ? [
            `Congratulations! Your ownership claim for <strong>${businessName}</strong> has been approved by administration.`,
            'The listing is now associated with your account with verified owner credentials.',
          ]
        : [
            `Your ownership claim request for <strong>${businessName}</strong> was reviewed and could not be approved at this time.`,
          ],
      highlightBox: {
        label: isApproved ? 'Ownership Status' : 'Review Feedback',
        value: isApproved
          ? 'Verified Business Owner &bull; Full Management Enabled'
          : reason || 'Submitted evidence did not sufficiently substantiate operational ownership.',
        isWarning: !isApproved,
      },
      ctaButton: {
        text: isApproved ? 'Open Owner Dashboard' : 'Visit Help Center',
        url: isApproved ? `${config.clientUrl}/dashboard` : `${config.clientUrl}/help`,
      },
      footnote: 'For further queries regarding corporate claims, contact bizlistplaceofficial@gmail.com.',
    });

    await this.sendMail({
      to: email,
      subject: `Claim Decision: Ownership claim for "${businessName}" ${status.toUpperCase()}`,
      html,
    });
  }

  // =========================================================================
  // 9. Contact Form Email Notifications (Admin + User Acknowledgement)
  // =========================================================================
  public static async sendContactFormEmails(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    // 1. Admin Alert Email
    const adminHtml = this.renderTemplate({
      title: 'New Contact Support Inquiry',
      greeting: 'Support Message Received:',
      paragraphs: [
        `You have received a new customer inquiry via the Biz List Place contact form:`,
      ],
      highlightBox: {
        label: `From: ${data.name} (${data.email})`,
        value: `<strong>Subject:</strong> ${data.subject}<br/><br/><strong>Message:</strong><br/>${data.message.replace(/\n/g, '<br/>')}`,
      },
      footnote: `Reply directly to this email to respond to ${data.name} (${data.email}).`,
    });

    await this.sendMail({
      to: config.email.adminEmail,
      subject: `[Contact Form] ${data.subject} - from ${data.name}`,
      html: adminHtml,
      replyTo: data.email,
    });

    // 2. User Acknowledgement Email
    const userHtml = this.renderTemplate({
      title: 'We Received Your Message',
      greeting: `Hello ${data.name},`,
      paragraphs: [
        'Thank you for reaching out to Biz List Place support.',
        'We have received your inquiry and a member of our support team will review your message and reply within 24 business hours.',
      ],
      highlightBox: {
        label: 'Inquiry Summary',
        value: `<strong>Subject:</strong> ${data.subject}<br/><strong>Reference Email:</strong> ${data.email}`,
      },
      ctaButton: {
        text: 'Explore Biz List Place Directory',
        url: config.clientUrl,
      },
      footnote: 'This is an automated receipt confirmation. Please do not reply directly to this notice.',
    });

    await this.sendMail({
      to: data.email,
      subject: `We have received your message: "${data.subject}"`,
      html: userHtml,
    });
  }

  // =========================================================================
  // 10. Admin Test Email
  // =========================================================================
  public static async sendTestEmail(toEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.renderTemplate({
      title: 'Gmail SMTP Test Dispatch',
      greeting: 'System Diagnostics:',
      paragraphs: [
        'Congratulations! If you are reading this email, your <strong>Gmail SMTP integration</strong> with Biz List Place is configured correctly and fully operational.',
        `Sent from: <code>${config.email.fromEmail}</code> via <code>${config.email.smtpHost}:${config.email.smtpPort}</code>`,
      ],
      highlightBox: {
        label: 'Configuration Diagnostics',
        value: `SMTP Host: ${config.email.smtpHost}<br/>Port: ${config.email.smtpPort}<br/>Secure: ${config.email.smtpSecure ? 'Yes (SSL)' : 'No (STARTTLS)'}<br/>Timestamp: ${new Date().toISOString()}`,
      },
      ctaButton: {
        text: 'Admin Dashboard',
        url: `${config.clientUrl}/admin`,
      },
      footnote: 'This diagnostic test was triggered by an authorized administrator in Biz List Place.',
    });

    return await this.sendMail({
      to: toEmail,
      subject: '✅ Biz List Place SMTP Test Email Delivery',
      html,
    });
  }
}
