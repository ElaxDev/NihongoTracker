import { Schema, model } from 'mongoose';
import { IUser } from '../types';

const UserSchema = new Schema<IUser>(
  {
    uuid: { type: String, required: true, unique: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    stats: { type: Schema.Types.ObjectId, required: true, ref: 'Stat' },
    refreshToken: String,
    avatar: String,
    titles: { type: [String], default: [] },
    roles: { type: [String], required: true, default: ['user'] },
  },
  { timestamps: true }
);

UserSchema.pre('findOneAndDelete', async function (next) {
  const userId = this.getQuery()['_id'];
  const userDoc = await model('User').findById(userId);
  await model('Log').deleteMany({ user: userId });
  await model('Stat').deleteOne({ _id: userDoc.stats });
  next();
});

export default model<IUser>('User', UserSchema);
