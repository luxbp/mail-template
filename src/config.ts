import { z } from 'zod';
import dotenv from 'dotenv';

// load environment variables
dotenv.config();

// config validation schema
const ConfigSchema = z.object({
  GMAIL_USER: z.string().email('GMAIL_USER must be a valid email address'),
  GMAIL_APP_PASSWORD: z.string().min(1, 'GMAIL_APP_PASSWORD cannot be empty'),
  GMAIL_FROM_NAME: z.string().optional().default('mailer'),
});

// validate and export config
export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const result = ConfigSchema.safeParse({
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    GMAIL_FROM_NAME: process.env.GMAIL_FROM_NAME,
  });

  if (!result.success) {
    const errorMessages = result.error?.message || 'Unknown validation error';
    throw new Error(`config validation failed:\n${errorMessages}\n\nplease check the .env file for configuration items.`);
  }

  return result.data;
}

