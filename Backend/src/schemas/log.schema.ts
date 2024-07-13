import { z } from 'zod';
import { Types } from 'mongoose';

const LogSchemaValidator = z
  .strictObject({
    user: z.string(),
    type: z.enum(['anime', 'ln', 'manga', 'vn', 'video', 'reading']), // Add all possible values
    contentId: z.number(),
    xp: z.number(),
    description: z.string().min(1), // Assuming at least one character is required
    episodes: z.number(),
    pages: z.number(),
    time: z.number(),
    chars: z.number(),
    date: z.date(), // You can make it optional if it has a default value
  })
  .partial({
    contentId: true,
    xp: true,
    episodes: true,
    pages: true,
    time: true,
    chars: true,
    date: true,
  })
  .refine(
    (data) => {
      return Types.ObjectId.isValid(data.user);
    },
    {
      message: 'Invalid user ID',
    }
  )
  .refine(
    (data) => {
      if (data.type === 'anime') {
        return data.episodes !== undefined;
      }
      return true;
    },
    {
      message: 'The chosen type require an amount of episodes',
    }
  )
  .refine(
    (data) => {
      if (['ln', 'manga'].includes(data.type)) {
        return (
          (data.pages !== undefined || data.chars !== undefined) &&
          data.episodes === undefined
        );
      }
      return true;
    },
    {
      message: 'The chosen type require an amount of pages or characters',
    }
  )
  .refine(
    (data) => {
      if (['reading', 'vn'].includes(data.type)) {
        return (
          (data.chars !== undefined || data.time !== undefined) &&
          data.episodes === undefined
        );
      }
      return true;
    },
    {
      message:
        'The chosen type require an amount of time (in minutes) or an amount of characters',
    }
  )
  .refine(
    (data) => {
      if (data.type === 'video') {
        return (
          data.time !== undefined &&
          data.episodes === undefined &&
          data.pages === undefined
        );
      }
      return true;
    },
    {
      message: 'The chosen type require an amount of time (in minutes)',
    }
  );

export default LogSchemaValidator;
