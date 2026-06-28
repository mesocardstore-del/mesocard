module.exports.isCartItemsAllowedInCoupon = function isCartItemsAllowedInCoupon(couponItems, cartItems) {
    let isCompatible = true;
    // if couponItems is an array and has items convert its array items to int
    if (Array.isArray(couponItems) && couponItems.length > 0) {
        couponItems = couponItems.map(item => parseInt(item));
    } else {
        return { isCompatible: null, notAllowedItems: null };
    }

    const notAllowedItems = [...cartItems].filter(item => !couponItems?.includes(item));
    if (notAllowedItems?.length > 0) {
        isCompatible = false;
    }

    return { isCompatible, notAllowedItems };
}
