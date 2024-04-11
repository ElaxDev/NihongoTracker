import { Schema, model } from 'mongoose';
import { Types } from 'mongoose';
import { IUser, userRoles } from '../types';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stats: {
      userLevel: { type: Number, required: true, default: 1 },
      userXp: { type: Number, required: true, default: 0 },
      readingXp: { type: Number, required: true, default: 0 },
      readingLevel: { type: Number, required: true, default: 1 },
      listeningXp: { type: Number, required: true, default: 0 },
      listeningLevel: { type: Number, required: true, default: 1 },
      charCountVn: { type: Number, required: true, default: 0 },
      charCountLn: { type: Number, required: true, default: 0 },
      readingTimeVn: { type: Number, required: true, default: 0 },
      charCountReading: { type: Number, required: true, default: 0 },
      pageCountLn: { type: Number, required: true, default: 0 },
      readingTimeLn: { type: Number, required: true, default: 0 },
      pageCountManga: { type: Number, required: true, default: 0 },
      charCountManga: { type: Number, required: true, default: 0 },
      readingTimeManga: { type: Number, required: true, default: 0 },
      mangaPages: { type: Number, required: true, default: 0 },
      listeningTime: { type: Number, required: true, default: 0 },
      readingTime: { type: Number, required: true, default: 0 },
      animeEpisodes: { type: Number, required: true, default: 0 },
      animeWatchingTime: { type: Number, required: true, default: 0 },
      videoWatchingTime: { type: Number, required: true, default: 0 },
      lnCount: { type: Number, required: true, default: 0 },
      readManga: { type: [String], required: true, default: [] },
      watchedAnime: { type: [String], required: true, default: [] },
      playedVn: { type: [String], required: true, default: [] },
      readLn: { type: [String], required: true, default: [] },
    },
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
    await this.model('Log').deleteMany({ user: this._id });
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
