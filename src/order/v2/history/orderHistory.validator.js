import { body , param , query} from "express-validator"

const orderHistory = {
    orderList: [
        query("limit")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Limit must be a positive integer."),
        
        query("pageNumber")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page number must be a positive integer."),
    ]
}

export default orderHistory