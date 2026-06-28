const FavoriteService = require('../../services/user/FavoriteService');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../../errors');

const getFavorites = async (req, res) => {
    if(!req?.user?.userId) throw new BadRequestError('User ID is required');

    const favorites = await FavoriteService.getFavorites(req?.user?.userId);
    
    res.status(StatusCodes.OK).json({
        message: 'Favorites retrieved successfully',
        success: true,
        results: favorites
    });
};

const getFavoriteState = async (req, res) => {
    if(!req?.user?.userId) throw new BadRequestError('User ID is required');
    if(!req?.params?.productId) throw new BadRequestError('Product ID is required');

    const favorite = await FavoriteService.getFavoriteState(req?.user?.userId, req?.params?.productId);
    
    res.status(StatusCodes.OK).json({
        message: 'Favorite state retrieved successfully',
        success: true,
        results: favorite
    });
};

const addFavorite = async (req, res) => {
    if(!req?.user?.userId) throw new BadRequestError('User ID is required');
    if(!req?.params?.id) throw new BadRequestError('Favorite ID is required');

    const favorite = await FavoriteService.addFavorite(req?.user?.userId, req?.params?.id);
    
    res.status(StatusCodes.OK).json({
        message: 'Favorite added successfully',
        success: true,
        results: favorite
    });
};

const deleteFavorite = async (req, res) => {
    if(!req?.user?.userId) throw new BadRequestError('User ID is required');
    if(!req?.params?.id) throw new BadRequestError('Favorite ID is required');

    const favorite = await FavoriteService.removeFavorite(req?.user?.userId, req?.params?.id);
    
    res.status(StatusCodes.OK).json({
        message: 'Favorite deleted successfully',
        success: true,
        results: favorite
    });
};

module.exports = {
    getFavorites,
    getFavoriteState,
    addFavorite,
    deleteFavorite
}