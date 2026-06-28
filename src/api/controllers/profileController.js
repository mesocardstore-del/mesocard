const { StatusCodes } = require('http-status-codes');
const profileService = require('../../services/user/ProfileService');
const { 
    UnauthenticatedError, 
    InternalServerError,
    BadRequestError
} = require('../../errors');

/* - Update User Profile - */
const updateUserProfile = async (req, res) => {
    if (!req.user?.userId) throw new UnauthenticatedError('Authentication state invalid.');
    if (!req?.body) throw new BadRequestError('البيانات المطلوبة غير موجودة.');
    const userId = req.user.userId;

    const userData = { ...req.body }

    const user = await profileService.updateUserProfile(userId, userData, req?.file);
    if (!user) throw new InternalServerError('حدث خطأ اثناء تحديث الملف الشخصي.');

    res.status(StatusCodes.CREATED).json({ 
        message: 'User profile updated successfully.',
        results: user,
        success: true,
     });
};

module.exports = {
    updateUserProfile
}
