import { Router } from 'express';
import PhonePeController from './phonePe.controller.js';
import { authentication } from '../middlewares/index.js';
import paymentConfirmValidator from "./phonePe.confirm_order.validator.js"

const router = new Router();

const phonePeController = new PhonePeController();

router.post('/v2/phonepe/webhook', phonePeController.phonePeWebhook);

router.get('/v2/phonepe/keys',authentication(), phonePeController.keys);

router.post('/v2/phonepe/:orderTransactionId',
    authentication(),
    paymentConfirmValidator.initializePayment,
    phonePeController.initializePayments
);

router.post('/v2/phonepe/paymenStatus/:merchantTransactionId',
    authentication(),
    paymentConfirmValidator.confirm_payment,
    phonePeController.paymentStatus
);

// Initiate payment
// router.post('/v2/phonepe/:orderId',
//     authentication(),
//     phonePeController.initializePayment);

// // Verify payment
// router.post('/v2/phonepe/verify/process', phonePeController.verifyPayment);

// // Webhook


// // Get merchant details
// router.get('/v2/phonepe/merchant-details',
//     authentication(),
//     phonePeController.getMerchantDetails);







export default router;