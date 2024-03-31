// import User from '../models/user.model';
// import { Request, Response } from 'express';
// import { IUser } from '../types';

// export async function deleteUser(_req: Request, res: Response) {
//   await User.findByIdAndDelete(res.locals.user.id);
//   res.clearCookie('token');
//   return res.sendStatus(204);
// }

// export async function deleteUserById(req: Request, res: Response) {
//   const deletedUser = await User.findByIdAndDelete(req.params.id);
//   if (!deletedUser) return res.status(404).json({ message: 'User not found' });
//   return res.sendStatus(204);
// }

// export async function updateUser(req: Request, res: Response) {
//   const { username, stats, avatar, titles } = req.body as IUser;

//   const updatedUser = await User.findByIdAndUpdate(
//     res.locals.user.id,
//     {
//       username,
//       stats,
//       avatar,
//       titles,
//     },
//     { new: true }
//   );
//   if (!updatedUser) return res.status(404).json({ message: 'User not found' });
//   return res.json(updatedUser);
// }

// export async function updateUserById(req: Request, res: Response) {
//   const { username, stats, avatar, titles } = req.body as IUser;
//   const updatedUser = await User.findByIdAndUpdate(
//     req.params.id,
//     {
//       username,
//       stats,
//       avatar,
//       titles,
//     },
//     { new: true }
//   );
//   if (!updatedUser) return res.status(404).json({ message: 'User not found' });
//   return res.json(updatedUser);
// }

// export async function getUser(req: Request, res: Response) {
//   const userFound = await User.findOne({
//     username: req.params.username,
//   }).populate('stats');
//   if (!userFound) return res.status(404).json({ message: 'User not found' });

//   return res.json({
//     id: userFound._id,
//     username: userFound.username,
//     email: userFound.email,
//     stats: userFound.stats,
//     avatar: userFound.avatar,
//     titles: userFound.titles,
//     createdAt: userFound.createdAt,
//     updatedAt: userFound.updatedAt,
//   });
// }
