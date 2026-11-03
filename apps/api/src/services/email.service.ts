export class EmailService {
  static async sendEmailVerification(email: string, token: string): Promise<void> {
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    console.log('---------------------------------------------------------');
    console.log(`[EMAIL DISPATCH] Verification link sent to: ${email}`);
    console.log(`[ACTION URL] ${verifyUrl}`);
    console.log('---------------------------------------------------------');
  }

  static async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log('---------------------------------------------------------');
    console.log(`[EMAIL DISPATCH] Password reset link sent to: ${email}`);
    console.log(`[ACTION URL] ${resetUrl}`);
    console.log('---------------------------------------------------------');
  }

  static async sendListingApprovedNotification(email: string, businessName: string, slug: string): Promise<void> {
    const listingUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/business/${slug}`;
    console.log('---------------------------------------------------------');
    console.log(`[EMAIL DISPATCH] Listing Approved for: ${businessName} (${email})`);
    console.log(`[VIEW LISTING] ${listingUrl}`);
    console.log('---------------------------------------------------------');
  }

  static async sendClaimVerification(
    email: string,
    otp: string,
    token: string,
    businessName: string
  ): Promise<void> {
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/claim-verify?token=${token}`;
    console.log('---------------------------------------------------------');
    console.log(`[EMAIL DISPATCH] Claim Verification for: ${businessName}`);
    console.log(`[TO] ${email}`);
    console.log(`[6-DIGIT VERIFICATION CODE] ===> ${otp} <===`);
    console.log(`[1-CLICK VERIFICATION LINK] ${verifyUrl}`);
    console.log('---------------------------------------------------------');
  }

  static async sendClaimStatusNotification(
    email: string,
    businessName: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<void> {
    console.log('---------------------------------------------------------');
    console.log(`[EMAIL DISPATCH] Claim Status Update for: ${businessName} (${email})`);
    console.log(`[DECISION] Claim has been ${status.toUpperCase()}`);
    if (reason) console.log(`[NOTE / REASON] ${reason}`);
    console.log('---------------------------------------------------------');
  }
}
