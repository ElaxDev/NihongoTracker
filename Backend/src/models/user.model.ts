import { Schema, model } from 'mongoose';
import { Types } from 'mongoose';
import { IUser, userRoles } from '../types';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    statsId: { type: Types.ObjectId, ref: 'Stats' },
    clubs: [{ type: Types.ObjectId, ref: 'Club' }],
    avatar: { type: String, default: '' },
    titles: { type: [String], default: [], required: true },
    roles: {
      type: String,
      enum: Object.values(userRoles),
      default: userRoles.user,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    await this.model('Stats').deleteOne({ _id: this.statsId });
    next();
  }
);

UserSchema.method(
  'matchPassword',
  async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
  }
);

export default model<IUser>('User', UserSchema);
