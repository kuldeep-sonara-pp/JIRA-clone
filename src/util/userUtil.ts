import User from "../model/user.model";

export const chackUserStatus = async(userId: number) => {
   const userState = await User.findOne({ where: { id: userId, status: 'active' } });
   return userState !== null;
}