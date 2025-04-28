import User from '../models/user.model.js';
import Log from '../models/log.model.js';
import { Request, Response, NextFunction } from 'express';
import { updateRequest } from '../types.js';
import { customError } from '../middlewares/errorMiddleware.js';
import uploadFile from '../services/uploadFile.js';

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, newPassword, newPasswordConfirm, password, discordId } =
    req.body as updateRequest;

  try {
    const user = await User.findById(res.locals.user._id);
    if (!user) {
      throw new customError('User not found', 404);
    }

    if (newPassword || newPasswordConfirm) {
      if (!password) {
        throw new customError('Old password is required', 400);
      }
      if (!newPassword) {
        throw new customError('New password is required', 400);
      }
      if (!newPasswordConfirm) {
        throw new customError('You need to confirm the new password', 400);
      }
      if (newPassword !== newPasswordConfirm) {
        throw new customError('Passwords do not match', 403);
      }
      if (!(await user.matchPassword(password))) {
        throw new customError('Incorrect password', 401);
      }

      user.password = newPassword;
    }

    if (username) {
      if (!username.match(/^[a-zA-Z0-9_]*$/)) {
        throw new customError(
          'Username can only contain letters, numbers and underscores',
          400
        );
      }
      if (username.length < 1 || username.length > 20) {
        throw new customError(
          'Username must be between 1 and 20 characters',
          400
        );
      }
      if (await User.findOne({ username })) {
        throw new customError('Username already taken', 400);
      }
      if (!password) {
        throw new customError('Password is required', 400);
      }
      if (!(await user.matchPassword(password))) {
        throw new customError('Incorrect password', 401);
      }

      if (user.username !== username) user.username = username;
    }

    if (req.files && Object.keys(req.files).length > 0) {
      try {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        if (files && files.avatar) {
          const file = await uploadFile(files.avatar[0]);
          user.avatar = file.downloadURL;
        } else if (files && files.banner) {
          const file = await uploadFile(files.banner[0]);
          user.banner = file.downloadURL;
        } else {
          throw new customError('Invalid fieldname', 400);
        }
      } catch (error) {
        return next(error as customError);
      }
    }

    if (discordId) {
      user.discordId = discordId;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      discordId: updatedUser.discordId,
      stats: updatedUser.stats,
      avatar: updatedUser.avatar,
      banner: updatedUser.banner,
      titles: updatedUser.titles,
      roles: updatedUser.roles,
    });
  } catch (error) {
    return next(error as customError);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  const userFound = await User.findOne({
    username: req.params.username,
  }).collation({ locale: 'en', strength: 2 });
  if (!userFound) return next(new customError('User not found', 404));

  return res.json({
    id: userFound._id,
    username: userFound.username,
    stats: userFound.stats,
    discordId: userFound.discordId,
    avatar: userFound.avatar,
    banner: userFound.banner,
    titles: userFound.titles,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
}

export async function getRanking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const filter = (req.query.filter as string) || 'userLevel';
    const sort = (req.query.sort as string) || 'desc';

    const rankingUsers = await User.aggregate([
      { $sort: { [`stats.${filter}`]: sort === 'asc' ? 1 : -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: { _id: 0, avatar: 1, username: 1, stats: 1 },
      },
    ]);

    return res.status(200).json(rankingUsers);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getUsers(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await User.find({}).select('-password');
    if (!users) throw new customError('No users found', 404);
    return res.json(users);
  } catch (error) {
    return next(error as customError);
  }
}

export async function clearUserData(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await User.findById(res.locals.user._id);
    if (!user) {
      throw new customError('User not found', 404);
    }

    await user.updateOne({
      discordId: '',
      clubs: [],
      titles: [],
      $unset: { stats: '', lastImport: '' },
    });

    await Log.deleteMany({ user: user._id });

    return res.status(200).json({ message: 'User data cleared' });
  } catch (error) {
    return next(error as customError);
  }
}

interface ImmersionGroup {
  _id: 'anime' | 'manga' | 'reading' | 'vn' | 'video';
  media: any[];
}

export async function getImmersionList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) throw new customError('User not found', 404);

    const immersionList: ImmersionGroup[] = await Log.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$mediaId',
        },
      },
      {
        $lookup: {
          from: 'media', // The name of the Media collection
          localField: '_id',
          foreignField: 'contentId',
          as: 'mediaDetails',
        },
      },
      { $unwind: '$mediaDetails' },
      {
        $replaceRoot: { newRoot: '$mediaDetails' },
      },
      {
        $group: {
          _id: '$type',
          media: { $push: '$$ROOT' },
        },
      },
    ]);

    const result: { [key in ImmersionGroup['_id']]: any[] } = {
      anime: [],
      manga: [],
      reading: [],
      vn: [],
      video: [],
    };

    immersionList.forEach((group) => {
      if (result[group._id]) {
        result[group._id] = group.media;
      }
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error as customError);
  }
}
