import { z } from 'zod';
import { Types } from 'mongoose';

const UserSchemaValidator = z
  .strictObject({
    uuid: z.string(),
    username: z.string(),
    email: z.string().email('This is not a valid email.'),
    stats: z.string(),
    avatar: z.string().url(),
    titles: z.string().array(),
    roles: z.string().array(),
    refreshToken: z.string(),
  })
  .partial({
    avatar: true,
    titles: true,
    refreshToken: true,
  })
  .refine(
    (data) => {
      return Boolean(data.stats);
    },
    {
      message: 'A stat document is required',
    }
  )
  .refine(
    (data) => {
      return Types.ObjectId.isValid(data.stats);
    },
    {
      message: 'Invalid stats ID',
    }
  )
  .refine(
    (data) => {
      return Boolean(data.username);
    },
    {
      message: 'An username is required',
    }
  )
  .refine(
    (data) => {
      return Boolean(data.uuid);
    },
    {
      message: 'An user ID is required',
    }
  );

export default UserSchemaValidator;
