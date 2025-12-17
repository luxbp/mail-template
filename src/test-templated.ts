/**
 * Test script for sendTemplatedEmails function
 * 
 * This script tests the sendTemplatedEmails function using templateJsonArray
 * Run: npm test
 */

import { GmailMailer, loadConfig, type EmailTemplate, type EmailAttachment } from './index.js';

/**
 * Construct email template from individual parameters
 * @param params Email template parameters
 * @returns EmailTemplate array (always returns array with single element)
 * 
 * @example
 * ```typescript
 * const templates = constructMailJson({
 *   id: 'email-1',
 *   subject: 'Test Subject',
 *   html: '<p>Hello</p>',
 *   text: 'Hello',
 *   attachments: [
 *     {
 *       filename: 'file.csv',
 *       path: '/path/to/file.csv',
 *       contentType: 'text/csv',
 *       disposition: 'attachment'
 *     }
 *   ]
 * });
 * await testTemplatedEmails(templates);
 * ```
 */
export function constructMailJson(params: {
  id: string;
  subject: string;
  html?: string;
  text?: string;
  to?: string | string[];
  attachments: EmailAttachment[];
}): EmailTemplate[] {
  const template: EmailTemplate = {
    id: params.id,
    subject: params.subject,
    attachments: params.attachments,
  };

  // Only add optional fields if they are provided
  if (params.html !== undefined) {
    template.html = params.html;
  }
  if (params.text !== undefined) {
    template.text = params.text;
  }
  if (params.to !== undefined) {
    template.to = params.to;
  }

  // Return as array even though it's a single template
  return [template];
}

export async function batchSendTemplates(templates: EmailTemplate[]) {
  try {
    console.log('=== Testing sendTemplatedEmails function ===\n');

    // 1. load config
    console.log('1. Loading config...');
    const config = loadConfig();
    console.log('✓ Config loaded\n');

    // 2. create mailer
    console.log('2. Creating mailer...');
    const mailer = new GmailMailer(config);
    console.log('✓ Mailer created\n');

    // 3. verify connection
    console.log('3. Verifying Gmail connection...');
    const isValid = await mailer.verifyConnection();
    if (!isValid) {
      console.error('❌ Gmail connection verification failed');
      process.exit(1);
    }
    console.log('✓ Gmail connection verified\n');

    // 4. get recipient from environment or use default
    const recipient = process.env.TEST_RECIPIENT_EMAIL || 'recipient@example.com';
    console.log(`4. Using recipient: ${recipient}\n`);

    // 5. test sendTemplatedEmails with provided templates
    console.log('5. Testing sendTemplatedEmails with provided templates...');
    console.log(`   Number of templates: ${templates.length}\n`);

    // add recipient to each template if not present
    const templatesWithRecipient = templates.map((template) => ({
      ...template,
      to: template.to || recipient,
    }));

    const results = await mailer.sendTemplatedEmails(templatesWithRecipient);

    // 6. display results
    console.log('6. Results:');
    console.log('─'.repeat(60));
    results.forEach((result, index) => {
      console.log(`\nTemplate ${index + 1} (ID: ${result.templateId}):`);
      console.log(`  To: ${result.to}`);
      if (result.success) {
        console.log(`  Status: ✓ Success`);
        console.log(`  Message ID: ${result.messageId}`);
      } else {
        console.log(`  Status: ❌ Failed`);
        console.log(`  Error: ${result.error}`);
      }
    });
    console.log('\n' + '─'.repeat(60));

    // 7. summary
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;
    console.log(`\nSummary:`);
    console.log(`  Total templates: ${results.length}`);
    console.log(`  Successful: ${successCount}`);
    console.log(`  Failed: ${failCount}`);

    if (failCount > 0) {
      console.log('\n⚠️  Some emails failed to send. Check the errors above.');
      process.exit(1);
    } else {
      console.log('\n✓ All emails sent successfully!');
    }
  } catch (error) {
    console.error('❌ Test execution error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// run test with templateJsonArray from GmailMailer
async function main() {
  const config = loadConfig();
  const mailer = new GmailMailer(config);
  await batchSendTemplates(mailer.templateJsonArray);
}

// Example: Using constructMailJson with individual parameters
async function exampleWithConstructMailJson() {
  // Example 1: Using constructMailJson with individual parameters
  const templates = constructMailJson({
    id: 'email-2',
    subject: 'subject2',
    html: '<p>Hi welcome HTML </p>',
    text: 'Hi , welcome text',
    attachments: [
      {
        filename: 'Columns.csv',
        path: '/Users/xianchenliu/ts-mailer/mail-template/src/Columns.csv',
        contentType: 'text/csv',
        disposition: 'attachment',
      },
    ],
  });

  // Now pass the returned array to testTemplatedEmails
  await batchSendTemplates(templates);
}

// Uncomment the line below to test with constructMailJson instead
// exampleWithConstructMailJson();

// Default: run with templateJsonArray
main();
