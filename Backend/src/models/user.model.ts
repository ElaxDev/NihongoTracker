import { Schema, model } from 'mongoose';
import { Types } from 'mongoose';
import { IUser, userRoles } from '../types';

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stats: { type: Types.ObjectId, required: true, ref: 'Stat' },
    avatar: { type: String, required: true },
    titles: { type: [String], required: true },
    roles: {
      type: String,
      enum: Object.values(userRoles),
      default: userRoles.user,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IUser>('User', UserSchema);
