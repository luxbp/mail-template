/**
 * Test script for Buffer attachment functionality
 * 
 * This script tests sending emails with attachments using Buffer content
 * Run: npm run test:buffer
 */

import { GmailMailer, loadConfig, type EmailTemplate } from './index.js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

async function testBufferAttachment() {
  try {
    console.log('=== Testing Buffer Attachment ===\n');

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

    // 5. prepare test files
    console.log('5. Preparing test files...');
    const testFiles = [
      {
        name: 'logo.png',
        path: resolve(process.cwd(), 'src/logo.png'),
        contentType: 'image/png',
      },
      {
        name: 'Columns.csv',
        path: resolve(process.cwd(), 'src/Columns.csv'),
        contentType: 'text/csv',
      },
    ];

    // 6. create templates with Buffer attachments
    console.log('6. Creating templates with Buffer attachments...\n');
    const templates: EmailTemplate[] = [];

    for (const file of testFiles) {
      if (!existsSync(file.path)) {
        console.warn(`⚠️  File not found: ${file.path}, skipping...`);
        continue;
      }

      console.log(`   Reading file: ${file.name}`);
      const fileBuffer = readFileSync(file.path);
      console.log(`   ✓ File read as Buffer (${fileBuffer.length} bytes)\n`);

      const template: EmailTemplate = {
        id: `buffer-test-${file.name}`,
        subject: `Test Email with Buffer Attachment - ${file.name}`,
        html: `
          <h2>Buffer Attachment Test</h2>
          <p>This email contains an attachment loaded as a Buffer.</p>
          <p><strong>File:</strong> ${file.name}</p>
          <p><strong>Size:</strong> ${fileBuffer.length} bytes</p>
          <p><strong>Content Type:</strong> ${file.contentType}</p>
        `,
        text: `Buffer Attachment Test\n\nFile: ${file.name}\nSize: ${fileBuffer.length} bytes\nContent Type: ${file.contentType}`,
        attachments: [
          {
            filename: `buffer-${file.name}`,
            content: fileBuffer, // 使用 Buffer 作为附件内容
            contentType: file.contentType,
            disposition: 'attachment',
          },
        ],
      };

      templates.push(template);
    }

    if (templates.length === 0) {
      console.error('❌ No valid test files found. Please ensure test files exist.');
      process.exit(1);
    }

    console.log(`   Created ${templates.length} template(s) with Buffer attachments\n`);

    // 7. add recipient to templates
    const templatesWithRecipient = templates.map((template) => ({
      ...template,
      to: template.to || recipient,
    }));

    // 8. send emails
    console.log('7. Sending emails with Buffer attachments...\n');
    const results = await mailer.sendTemplatedEmails(templatesWithRecipient);

    // 9. display results
    console.log('8. Results:');
    console.log('─'.repeat(60));
    results.forEach((result, index) => {
      const template = templates[index];
      console.log(`\nTemplate ${index + 1} (ID: ${result.templateId}):`);
      console.log(`  File: ${template?.attachments[0]?.filename}`);
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

    // 10. summary
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
      console.log('\n✓ All emails with Buffer attachments sent successfully!');
      console.log('\n📧 Check your inbox to verify the attachments were received correctly.');
    }
  } catch (error) {
    console.error('❌ Test execution error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// run test
testBufferAttachment();

