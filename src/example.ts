/**
 * example
 * 
 * show an example program to use GmailMailer to send email
 * run: npx tsx src/example.ts
 */

import { GmailMailer, loadConfig } from './index.js';

async function example() {
  try {
    // 1. load config
    const config = loadConfig();
    console.log('config loaded\n');

    // 2. create mailer
    const mailer = new GmailMailer(config);

    // 3. verify connection (optional, but recommended)
    console.log('verifying Gmail connection...');
    const isValid = await mailer.verifyConnection();
    if (!isValid) {
      console.error('❌ Gmail failed to verify connection');
      return;
    }
    console.log('✓ Gmail connection verified successfully\n');

    // 4. example 1: send simple text email
    console.log('example 1: send text email');
    const result1 = await mailer.sendEmail({
      to: 'recipient@example.com',
      subject: 'test email - text format',
      content: 'this is a simple text email.',
      html: false,
    });
    console.log('result:', result1);
    console.log('');

    // 5. example 2: send HTML email
    console.log('example 2: send HTML email');
    const result2 = await mailer.sendEmail({
      to: 'recipient@example.com',
      subject: 'test email - HTML format',
      content: `
        <h1>welcome</h1>
        <p>this is an <strong>HTML</strong> email.</p>
        <ul>
          <li>item 1</li>
          <li>item 2</li>
        </ul>
      `,
      html: true,
    });
    console.log('result:', result2);
    console.log('');

    // 6. example 3: send bulk emails
    console.log('example 3: send bulk emails');
    const results = await mailer.sendBulkEmails([
      {
        to: 'user1@example.com',
        subject: 'bulk email 1',
        content: 'this is the first bulk email.',
      },
      {
        to: 'user2@example.com',
        subject: 'bulk email 2',
        content: 'this is the second bulk email.',
      },
    ]);
    console.log('bulk send results:');
    results.forEach((result, index) => {
      console.log(`  email ${index + 1}:`, result.success ? '✓ success' : `❌ failed - ${result.error}`);
    });

  } catch (error) {
    console.error('error:', error instanceof Error ? error.message : error);
  }
}

// run example
example();

