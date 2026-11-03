import { Request, Response, NextFunction } from 'express';
import { EmailService } from '../../services/email.service';

export class ContactController {
  static async submitContactForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !message) {
        res.status(400).json({
          success: false,
          message: 'Please provide your name, a valid email address, and a message.',
        });
        return;
      }

      // Basic email regex validation
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please provide a valid email address.',
        });
        return;
      }

      // Dispatch admin alert and user acknowledgement safely
      await EmailService.sendContactFormEmails({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: (subject || 'General Directory Support Inquiry').trim(),
        message: message.trim(),
      });

      res.json({
        success: true,
        message:
          'Thank you for contacting Biz List Place. Your message has been sent successfully, and our support team will reply within 24 hours.',
      });
    } catch (err) {
      next(err);
    }
  }
}

