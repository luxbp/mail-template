/**
 * Examples of different attachment methods
 * 
 * This file demonstrates how to use path, content, or stream for attachments
 */

import { GmailMailer, loadConfig, type EmailTemplate } from './index.js';
import { createReadStream } from 'fs';
import { readFileSync } from 'fs';

async function demonstrateAttachmentMethods() {
  const config = loadConfig();
  const mailer = new GmailMailer(config);
  const recipient = process.env.TEST_RECIPIENT_EMAIL || 'recipient@example.com';

  console.log('=== Attachment Methods Examples ===\n');

  // 示例 1: 使用文件路径（当前方式）
  console.log('Example 1: Using file path');
  const templateWithPath: EmailTemplate = {
    id: 'example-path',
    subject: 'Email with path attachment',
    html: '<p>This email uses a file path for attachment.</p>',
    attachments: [
      {
        filename: 'logo.png',
        path: '/Users/xianchenliu/ts-mailer/src/logo.png',
        contentType: 'image/png',
        disposition: 'attachment',
      },
    ],
  };

  // 示例 2: 使用内容（字符串）
  console.log('Example 2: Using string content');
  const templateWithStringContent: EmailTemplate = {
    id: 'example-string-content',
    subject: 'Email with string content attachment',
    html: '<p>This email uses string content for attachment.</p>',
    attachments: [
      {
        filename: 'data.txt',
        content: 'This is the file content as a string.\nLine 2\nLine 3',
        contentType: 'text/plain',
        disposition: 'attachment',
      },
    ],
  };

  // 示例 3: 使用内容（Buffer）
  console.log('Example 3: Using Buffer content');
  try {
    const fileBuffer = readFileSync('/Users/xianchenliu/ts-mailer/src/logo.png');
    const templateWithBufferContent: EmailTemplate = {
      id: 'example-buffer-content',
      subject: 'Email with Buffer content attachment',
      html: '<p>This email uses Buffer content for attachment.</p>',
      attachments: [
        {
          filename: 'logo-from-buffer.png',
          content: fileBuffer,
          contentType: 'image/png',
          disposition: 'attachment',
        },
      ],
    };
    console.log('  Buffer size:', fileBuffer.length, 'bytes');
  } catch (error) {
    console.log('  Could not read file for Buffer example:', error);
  }

  // 示例 4: 使用流（Stream）
  console.log('Example 4: Using Stream');
  try {
    const fileStream = createReadStream('/Users/xianchenliu/ts-mailer/src/Columns.csv');
    const templateWithStream: EmailTemplate = {
      id: 'example-stream',
      subject: 'Email with Stream attachment',
      html: '<p>This email uses Stream for attachment.</p>',
      attachments: [
        {
          filename: 'data-from-stream.csv',
          stream: fileStream,
          contentType: 'text/csv',
          disposition: 'attachment',
        },
      ],
    };
    console.log('  Stream created successfully');
  } catch (error) {
    console.log('  Could not create stream:', error);
  }

  // 示例 5: 使用 Base64 编码的内容
  console.log('Example 5: Using Base64 encoded content');
  try {
    const fileBuffer = readFileSync('/Users/xianchenliu/ts-mailer/src/logo.png');
    const base64Content = fileBuffer.toString('base64');
    const templateWithBase64: EmailTemplate = {
      id: 'example-base64',
      subject: 'Email with Base64 content attachment',
      html: '<p>This email uses Base64 encoded content for attachment.</p>',
      attachments: [
        {
          filename: 'logo-from-base64.png',
          content: base64Content,
          contentType: 'image/png',
          encoding: 'base64', // 指定编码方式
          disposition: 'attachment',
        },
      ],
    };
    console.log('  Base64 content length:', base64Content.length, 'characters');
  } catch (error) {
    console.log('  Could not create Base64 example:', error);
  }

  // 示例 6: 混合使用多种附件方式
  console.log('Example 6: Mixed attachment methods');
  const templateWithMixed: EmailTemplate = {
    id: 'example-mixed',
    subject: 'Email with mixed attachment methods',
    html: '<p>This email uses multiple attachment methods.</p>',
    attachments: [
      {
        filename: 'from-path.txt',
        path: '/Users/xianchenliu/ts-mailer/src/Columns.csv',
        contentType: 'text/csv',
        disposition: 'attachment',
      },
      {
        filename: 'from-content.txt',
        content: 'This is inline content',
        contentType: 'text/plain',
        disposition: 'attachment',
      },
    ],
  };

  console.log('\n=== Summary ===');
  console.log('Nodemailer supports three ways to attach files:');
  console.log('1. path: File system path (current default method)');
  console.log('2. content: String or Buffer (supports encoding like base64)');
  console.log('3. stream: Readable stream (for large files or dynamic content)');
  console.log('\nAll three methods are now supported in this implementation!');
}

// 运行示例（仅展示，不实际发送）
demonstrateAttachmentMethods().catch(console.error);

