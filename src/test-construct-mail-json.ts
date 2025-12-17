/**
 * Test script demonstrating constructMailJson function
 * 
 * This script shows how to use constructMailJson to create EmailTemplate
 * from individual parameters instead of providing a complete JSON object
 * Run: npm run test:construct
 */

import { type EmailAttachment } from './index.js';
import { constructMailJson, batchSendTemplates } from './test-templated.js';

async function testConstructMailJson() {
  try {
    console.log('=== Testing constructMailJson Function ===\n');

    // Example 1: Basic usage with path attachment
    console.log('Example 1: Creating template with path attachment');
    const template1 = constructMailJson({
      id: 'email-1',
      subject: 'Test Email with Path Attachment',
      html: '<p>This email uses a file path for attachment.  text</p>',
      text: 'This email uses a file path for attachment.  html',
      attachments: [
        {
          filename: 'Columns.csv',
          path: '/Users/xianchenliu/ts-mailer/mail-template/src/Columns.csv',
          contentType: 'text/csv',
          disposition: 'attachment',
        },
      ],
    });
    console.log('✓ Template 1 created\n');

    // Example 2: Using Buffer content
    console.log('Example 2: Creating template with Buffer attachment');
    const { readFileSync } = await import('fs');
    let template2: ReturnType<typeof constructMailJson> | undefined;
    try {
      const fileBuffer = readFileSync('/Users/xianchenliu/ts-mailer/mail-template/src/logo.png');
      template2 = constructMailJson({
        id: 'email-2',
        subject: 'Test Email with Buffer Attachment',
        html: '<p>This email uses Buffer content for attachment.</p>',
        text: 'This email uses Buffer content for attachment.',
        attachments: [
          {
            filename: 'logo-from-buffer.png',
            content: fileBuffer,
            contentType: 'image/png',
            disposition: 'attachment',
          },
        ],
      });
      console.log('✓ Template 2 created\n');
    } catch (error) {
      console.log('⚠️  Could not create Buffer example:', error);
    }

    // Example 3: Using string content
    console.log('Example 3: Creating template with string content attachment');
    const template3 = constructMailJson({
      id: 'email-3',
      subject: 'Test Email with String Content Attachment',
      html: '<p>This email uses string content for attachment.</p>',
      text: 'This email uses string content for attachment.',
      attachments: [
        {
          filename: 'data.txt',
          content: 'This is file content as a string.\nLine 2\nLine 3',
          contentType: 'text/plain',
          disposition: 'attachment',
        },
      ],
    });
    console.log('✓ Template 3 created\n');

    // Example 4: Multiple attachments
    console.log('Example 4: Creating template with multiple attachments');
    const template4 = constructMailJson({
      id: 'email-4',
      subject: 'Test Email with Multiple Attachments',
      html: '<p>This email has multiple attachments.</p>',
      text: 'This email has multiple attachments.',
      attachments: [
        {
          filename: 'file1.csv',
          path: '/Users/xianchenliu/ts-mailer/mail-template/src/Columns.csv',
          contentType: 'text/csv',
          disposition: 'attachment',
        },
        {
          filename: 'data.txt',
          content: 'Inline content as string',
          contentType: 'text/plain',
          disposition: 'attachment',
        },
      ],
    });
    console.log('✓ Template 4 created\n');

    // Combine all templates
    const allTemplates = [
      ...template1,
      ...(template2 || []),
      ...template3,
      ...template4,
    ];

    console.log(`Total templates created: ${allTemplates.length}\n`);

    // Test sending emails
    console.log('Sending test emails...\n');
    await batchSendTemplates(allTemplates);

  } catch (error) {
    console.error('❌ Test execution error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run test
testConstructMailJson();

