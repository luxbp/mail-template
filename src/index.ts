/**
 * Main entry point for the mailer module
 * 
 * This file serves as a barrel export, providing a unified API for:
 * - GmailMailer class
 * - Configuration loading (loadConfig)
 * - Type definitions (EmailOptions, EmailTemplate, EmailAttachment)
 */

// export for other modules
export { GmailMailer } from './mailer.js';
export { loadConfig } from './config.js';
export type { EmailOptions, EmailTemplate, EmailAttachment } from './mailer.js';

