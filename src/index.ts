#!/usr/bin/env node

import { loadConfig } from './config.js';
import { GmailMailer } from './mailer.js';

/**
 * main program entry
 */
async function main() {
  try {
    // load and verify config
    console.log('loading config...');
    const config = loadConfig();
    console.log('✓ config loaded');

    // create mailer
    const mailer = new GmailMailer(config);

    // verify connection
    console.log('verifying Gmail connection...');
    const isValid = await mailer.verifyConnection();
    
    if (!isValid) {
      console.error('❌ Gmail connection verification failed, please check the config');
      process.exit(1);
    }
    
    console.log('✓ Gmail connection verification successful\n');

    // example: send email
    // you can send email by command line parameters or modify here
    const emailOptions = {
      to: process.env.TEST_RECIPIENT_EMAIL || 'recipient@example.com',
      subject: process.env.TEST_SUBJECT || 'default subject',
      content: process.env.TEST_CONTENT || 'default content',
      html: false,
    };

    console.log('sending email...');
    console.log(`recipient: ${emailOptions.to}`);
    console.log(`subject: ${emailOptions.subject}`);
    console.log(`content: ${emailOptions.content}\n`);

    const result = await mailer.sendEmail(emailOptions);

    if (result.success) {
      console.log('✓ email sent successfully!');
      console.log(`mail ID: ${result.messageId}`);
    } else {
      console.error('❌ email sending failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ program execution error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// execute main program
main();

// export for other modules
export { GmailMailer } from './mailer.js';
export { loadConfig } from './config.js';
export type { EmailOptions, EmailTemplate, EmailAttachment } from './mailer.js';

