import nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';
import type { Config } from './config.js';
import { existsSync } from 'fs';
import { resolve } from 'path';
import type { Readable } from 'stream';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  content: string;
  html?: boolean;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  cid?: string;
  disposition?: 'inline' | 'attachment';
  // support three ways to attach files: path, content, or stream
  path?: string;
  content?: string | Buffer;
  stream?: Readable;
  // optional: content encoding (when using content)
  encoding?: string;
}

export interface EmailTemplate {
  id: string;
  subject: string;
  html?: string;
  text?: string;
  to?: string | string[];
  attachments: EmailAttachment[];
}

export class GmailMailer {
  private transporter: Transporter;
  private config: Config;

  templateJsonArray: EmailTemplate[] = [
    {
      "id": "email-1",
      "subject": "subject1",
      "html": "<p>Hi  welcome HTML </p>\n<p><img src=\"cid:logoCid\" alt=\"logo\" width=\"120\"/></p>\n",
      "text": "Hi , welcome text",
      "attachments": [
        {
          "filename": "logo.png",
          "path": "/Users/xianchenliu/ts-mailer/mail-template/src/logo.png",
          "contentType": "image/png",
          "cid": "logoCid",
          "disposition": "inline"
        },
        {
          "filename": "test.pdf",
          "path": "/Users/xianchenliu/ts-mailer/mail-template/src/test.pdf",
          "contentType": "application/pdf",
          "disposition": "attachment"
        }
      ]
    },
    {
      "id": "email-2",
      "subject": "subject2",
      "html": "<p>Hi  welcome HTML </p>",
      "text": "Hi , welcome text",
      "attachments": [
        {
          "filename": "Columns.csv",
          "path": "/Users/xianchenliu/ts-mailer/mail-template/src/Columns.csv",
          "contentType": "text/csv",
          "disposition": "attachment"
        }
      ]
    }
  ];

  constructor(config: Config) {
    this.config = config;
    
    // create Gmail transport
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.GMAIL_USER,
        pass: config.GMAIL_APP_PASSWORD,
      },
    });
  }

  /**
   * verify email config is valid
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('config verification failed:', error);
      return false;
    }
  }

  /**
   * send email
   * @param options email options
   * @returns send result information
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions = {
        from: {
          name: this.config.GMAIL_FROM_NAME,
          address: this.config.GMAIL_USER,
        },
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        [options.html ? 'html' : 'text']: options.content,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * send multiple emails
   * @param emails email options array
   * @returns send result array
   */
  async sendBulkEmails(emails: EmailOptions[]): Promise<Array<{ success: boolean; messageId?: string; error?: string; to: string }>> {
    const results = await Promise.allSettled(
      emails.map(async (email) => {
        const result = await this.sendEmail(email);
        return {
          ...result,
          to: Array.isArray(email.to) ? email.to.join(', ') : email.to,
        };
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason?.message || 'send failed',
          to: Array.isArray(emails[index]?.to) ? emails[index]!.to.join(', ') : emails[index]?.to || 'unknown',
        };
      }
    });
  }

  /**
   * resolve file path, replacing {{assetsDir}} placeholder
   * @param path file path that may contain {{assetsDir}} placeholder
   * @returns resolved file path
   */
  private resolveAttachmentPath(path: string): string {
    const assetsDir = process.env.ASSETS_DIR || './src';
    const resolvedPath = path.replace(/\{\{assetsDir\}\}/g, assetsDir);
    
    // resolve relative paths
    if (resolvedPath.startsWith('./') || resolvedPath.startsWith('../')) {
      return resolve(process.cwd(), resolvedPath);
    }
    
    return resolvedPath;
  }

  /**
   * process attachments array, supporting path, content, or stream
   * @param attachments attachments array from template
   * @returns processed attachments array for nodemailer
   */
  private processAttachments(attachments: EmailAttachment[]): SendMailOptions['attachments'] {
    return attachments.map((attachment) => {
      const processedAttachment: {
        filename: string;
        contentType: string;
        cid?: string;
        contentDisposition?: 'inline' | 'attachment';
        path?: string;
        content?: string | Buffer;
        raw?: Readable;
        encoding?: string;
      } = {
        filename: attachment.filename,
        contentType: attachment.contentType,
      };

      // define 3 ways to attach files
      if (attachment.path) {
        // 1: use file path
        const resolvedPath = this.resolveAttachmentPath(attachment.path);
        
        // check if file exists
        if (!existsSync(resolvedPath)) {
          console.warn(`Warning: Attachment file not found: ${resolvedPath}`);
        }
        
        processedAttachment.path = resolvedPath;
      } else if (attachment.content !== undefined) {
        // 2: use content (string or Buffer)
        processedAttachment.content = attachment.content;
        if (attachment.encoding) {
          processedAttachment.encoding = attachment.encoding;
        }
      } else if (attachment.stream) {
        // 3: use stream (Stream)  for large files or dynamic content
        processedAttachment.raw = attachment.stream;
      } else {
        throw new Error(`Attachment ${attachment.filename} must have either 'path', 'content', or 'stream'`);
      }

      // add cid for inline attachments
      if (attachment.cid) {
        processedAttachment.cid = attachment.cid;
      }

      // set contentDisposition
      if (attachment.disposition) {
        processedAttachment.contentDisposition = attachment.disposition;
      }

      return processedAttachment;
    });
  }

  /**
   * send templated emails from JSON array
   * @param templates array of email templates
   * @param defaultTo default recipient if template doesn't have 'to' field
   * @returns send result array with template id
   */
  async sendTemplatedEmails(
    templates: EmailTemplate[],
    defaultTo?: string | string[]
  ): Promise<Array<{ success: boolean; messageId?: string; error?: string; templateId: string; to: string }>> {
    const results = await Promise.allSettled(
      templates.map(async (template) => {
        // use template.to if available, otherwise use defaultTo
        const to = template.to || defaultTo;
        
        if (!to) {
          throw new Error(`Template ${template.id} has no recipient specified`);
        }

        // determine content type (html or text)
        const hasHtml = !!template.html;
        const hasText = !!template.text;
        const content = hasHtml ? template.html! : (hasText ? template.text! : '');

        if (!content) {
          throw new Error(`Template ${template.id} has no content (html or text)`);
        }

        // process attachments
        const processedAttachments = this.processAttachments(template.attachments);

        // prepare mail options
        const mailOptions: SendMailOptions = {
          from: {
            name: this.config.GMAIL_FROM_NAME,
            address: this.config.GMAIL_USER,
          },
          to: Array.isArray(to) ? to.join(', ') : to,
          subject: template.subject,
          attachments: processedAttachments,
        };

        // set content (html or text)
        if (hasHtml) {
          mailOptions.html = template.html;
          if (hasText) {
            // provide text alternative for HTML emails
            mailOptions.text = template.text;
          }
        } else {
          mailOptions.text = template.text;
        }

        // send email
        const info = await this.transporter.sendMail(mailOptions);

        return {
          success: true,
          messageId: info.messageId,
          templateId: template.id,
          to: Array.isArray(to) ? to.join(', ') : to,
        };
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const template = templates[index];
        return {
          success: false,
          error: result.reason?.message || 'send failed',
          templateId: template?.id || 'unknown',
          to: (() => {
            const recipient = template?.to || defaultTo;
            if (Array.isArray(recipient)) {
              return recipient.join(', ');
            }
            return recipient || 'unknown';
          })(),
        };
      }
    });
  }
}

