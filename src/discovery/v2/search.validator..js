import { query } from "express-validator";

const discovery = {
    search : [
        query("latitude")
            .exists().withMessage("Latitude is required")
            .isFloat({ min: -90, max: 90 }).withMessage("Latitude must be a valid coordinate between -90 and 90"),
            
        query("longitude")
            .exists().withMessage("Longitude is required")
            .isFloat({ min: -180, max: 180 }).withMessage("Longitude must be a valid coordinate between -180 and 180"),
        
        query("pageNumber")
            .optional()
            .isInt({ min: 1 }).withMessage("Page number must be an integer greater than 0"),
    
        query("limit")
            .optional()
            .isInt({ min: 1 }).withMessage("Limit must be an integer greater than 0"),
    
        query("priceMin")
            .optional()
            .isFloat({ min: 0 }).withMessage("Minimum price must be a positive number"),
        
        query("priceMax")
            .optional()
            .isFloat({ min: 0 }).withMessage("Maximum price must be a positive number"),
    
        query("rating")
            .optional()
            .isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),
    
        query("providerIds")
            .optional()
            .isString().withMessage("Provider IDs must be valid UUIDs"),
    
        query("categoryIds")
            .optional()
            .isString().withMessage("Category IDs must be a string"),
    
        query("name")
            .optional()
            .isString().withMessage("Name must be a string"),
    
        query("sortField")
            .optional()
            .isIn(['quantity', 'price' , 'rating']).withMessage("Sort field must be either 'quantity' or 'price'"), // Enforce enum validation
    
        query("sortOrder")
            .optional()
            .isIn(['asc', 'desc']).withMessage("Sort order must be either 'asc' or 'desc'")
    ],
    provider: [
        query('latitude')
          .exists().withMessage('Latitude is required')
          .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid latitude value between -90 and 90'),
        query('longitude')
          .exists().withMessage('Longitude is required')
          .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid longitude value between -180 and 180'),
        query('limit')
          .optional()
          .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
        query('domain')
          .optional()
          .isString().withMessage('Domain must be a string'),
        query('name')
          .optional()
          .isString().withMessage('Name must be a string'),
    ],
    providerDetails: [
        query('providerId')
          .exists().withMessage('providerId is required')
          .isString().withMessage('providerId must be a string'),
        query('locationId')
          .exists().withMessage('locationId is required')
          .isString().withMessage('locationId must be a string'),
      ]
} 

export default discovery


