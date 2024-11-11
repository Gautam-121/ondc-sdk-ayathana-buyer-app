import PhonePeService from "./phonePe.service.js"
import BadRequestParameterError from "../lib/errors/bad-request-parameter.error.js";
import {validationResult} from "express-validator"

const phonePeService = new PhonePeService()

class PaymentController {
    initializePayment(req, res, next) {
        const { orderId } = req.params;
        const currentUser = req.user;
        const data = req.body;
        const currentUserAccessToken = res.get('currentUserAccessToken');

        console.log("platform", req.headers['x-platform'])
        console.log("version", req.headers['x-app-version'])
        console.log("deviceId", req.headers['x-device-id'])

        // Get device information from request headers or body
        const deviceInfo = {
            platform: req.headers['x-platform'] || 'web', // 'android', 'ios', or 'web'
            version: req.headers['x-app-version'],
            deviceId: req.headers['x-device-id']
        };

        phonePeService
            .createPayment(orderId, data, currentUser, deviceInfo , currentUserAccessToken)
            .then(response => {
                res.json({ data: response });
            })
            .catch(err => next(err));
    }

    initializePayments(req, res, next) {
        try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = [
                {
                    status: 400,
                    error: {
                        name: "BAD_REQUEST_PARAMETER_ERROR",
                        message: errors.array()[0].msg
                    }
                }
            ]
            return res.status(400).json(error)
        }

        const { orderTransactionId } = req.params;
        const currentUser = req.user;
        const data = req.body;

        phonePeService
            .createPayments(orderTransactionId, data, currentUser)
            .then(response => {
                res.json({ data: response });
            })
            .catch(err => next(err));
        } catch (error) {
            console.log(error);
            return res.status(400).send(error)
        }
    }

    paymentStatus(req,res,next){
        try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = [
                {
                    status: 400,
                    error: {
                        name: "BAD_REQUEST_PARAMETER_ERROR",
                        message: errors.array()[0].msg
                    }
                }
            ]
            return res.status(400).json(error)
        }

        const { merchantTransactionId } = req.params;
        const currentUser = req.user;
        const confirmdata = req.body.confirmRequest;

        phonePeService
            .paymentState(merchantTransactionId , confirmdata, currentUser)
            .then(response => {
                res.json({ data: response });
            })
            .catch(err => next(err));
        } catch (error) {
            console.log(error);
            return res.status(400).send(error)
        }
    }

    phonePeWebhook(req,res,next) {
        try {
             // Get data from headers and request body
         const { 'x-verify': signature } = req.headers;
         const { response } = req.body;

        if(!response){
            throw new BadRequestParameterError('Invalid response data');
        }

        if(!signature){
            throw new BadRequestParameterError('Missing xVerify signature');
        }

        phonePeService.handleWebhook(signature,response).then(user => {
            res.json({data: user});
        }).catch((err) => {
            throw err;
        });
        } catch (error) {
            console.log(error);
            return res.status(400).send(error)
        }
    }

    handleDeepLinkReturn(req, res, next) {
        const { platform, transactionId } = req.params;

        phonePeService
            .handleDeepLinkReturn(platform, transactionId)
            .then(response => {
                res.json(response);
            })
            .catch(err => next(err));
    }

    async keys(req, res){
        try {
            const creadentials = {
                merchantId: "TEST123" || process.env.PHONEPE_MERCHANT_ID,
                saltKey: "saltkeys" || process.env.PHONEPE_SALT_KEY,
                saltIndex: 1 || process.env.PHONEPE_SALT_INDEX
            }
            res.json({creadentials:creadentials});
        } catch (error) {
            console.log(error);
            return res.status(400).send(error)
        }
    }

    // ... (keep other existing methods)
}

export default PaymentController