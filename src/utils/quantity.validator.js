const validateQuantity = (items, data) => {
    // Check available stock
    const availableQuantity = items.item_details?.quantity?.available?.count;
    const maxQuantity = items.item_details?.quantity.maximum.count;
    const minQuantity = items.item_details.quantity.minimum ? items.item_details.quantity.minimum.count : 1;

    if (data.quantity > availableQuantity) {
        return {
            status: 400,
            error: { message: 'Requested quantity exceeds available stock' }
        }
    }

    if (data.quantity > maxQuantity) {
        return {
            status: 400,
            error: { message: `Maximum quantity allowed is ${maxQuantity}` }
        }
    }

    if (data.quantity < minQuantity) {
        return {
            status: 400,
            error: { message: `Minimum quantity to purchase is ${minQuantity}` }
        }
    }

    return true
}

export default validateQuantity

