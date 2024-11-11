// const confirmOrderService = new ConfirmOrderService();

// class PhonePeService {
//     constructor() {
//         this.baseUrl = process.env.PHONEPE_API_URL;
//         this.merchantId = process.env.PHONEPE_MERCHANT_ID;
//         this.saltKey = process.env.PHONEPE_SALT_KEY;
//         this.saltIndex = process.env.PHONEPE_SALT_INDEX;
//     }

//     async initiatePayment(transactionId, data, user, currentUserAccessToken) {
//         try {
//             const intent = await Order.findOne({ transactionId: transactionId });

//             if (!intent)
//                 throw new BadRequestParameterError();

//             let lastTransaction = await Transaction.find({}).sort({ createdAt: -1 }).limit(1);
//             let humanReadableID = this.generateHumanReadableID(lastTransaction);

//             const payload = {
//                 merchantId: this.merchantId,
//                 merchantTransactionId: humanReadableID,
//                 merchantUserId: user.decodedToken.uid,
//                 amount: Number(data.amount) * 100,
//                 redirectUrl: `${process.env.FRONTEND_URL}/payment/status`,
//                 redirectMode: 'POST',
//                 callbackUrl: `${process.env.BACKEND_URL}/api/v2/phonepe/webhook`,
//                 mobileNumber: user.phoneNumber,
//                 paymentInstrument: {
//                     type: 'PAY_PAGE'
//                 }
//             };

//             const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
//             const signature = this.generateSignature(base64Payload);

//             const response = await axios.post(`${this.baseUrl}/pg/v1/pay`, {
//                 request: base64Payload
//             }, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-VERIFY': signature
//                 }
//             });

//             const transaction = {
//                 amount: data.amount,
//                 status: 'PAYMENT_PENDING',
//                 paymentType: 'ON-ORDER',
//                 transactionId: transactionId,
//                 orderId: response.data.data.merchantTransactionId,
//                 humanReadableID: humanReadableID,
//             };

//             const intentTransaction = new Transaction(transaction);
//             await intentTransaction.save();

//             return {
//                 paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
//                 transactionId: intentTransaction._id
//             };
//         } catch (err) {
//             throw err;
//         }
//     }

//     async verifyPayment(data) {
//         try {
//             const { merchantTransactionId } = data;
//             const signature = this.generateSignature(`/pg/v1/status/${this.merchantId}/${merchantTransactionId}`);

//             const response = await axios.get(`${this.baseUrl}/pg/v1/status/${this.merchantId}/${merchantTransactionId}`, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-VERIFY': signature,
//                     'X-MERCHANT-ID': this.merchantId
//                 }
//             });

//             const transaction = await Transaction.findOne({ orderId: merchantTransactionId });

//             if (transaction) {
//                 transaction.status = response.data.code === 'PAYMENT_SUCCESS' ? 'COMPLETED' : 'FAILED';
//                 await transaction.save();

//                 if (transaction.status === 'COMPLETED') {
//                     return await confirmOrderService.confirmMultipleOrder(data, response.data);
//                 }
//             }

//             return response.data;
//         } catch (err) {
//             throw err;
//         }
//     }

//     async handleWebhook(signature, data) {
//         try {
//             const computedSignature = this.generateSignature(JSON.stringify(data));

//             if (computedSignature !== signature) {
//                 throw new BadRequestParameterError('Invalid Signature');
//             }

//             const transaction = await Transaction.findOne({ orderId: data.merchantTransactionId });

//             if (transaction) {
//                 transaction.status = data.code === 'PAYMENT_SUCCESS' ? 'COMPLETED' : 'FAILED';
//                 await transaction.save();
//             }

//             return { status: 'SUCCESS' };
//         } catch (err) {
//             throw err;
//         }
//     }

//     generateSignature(data) {
//         const hmac = crypto.createHmac('sha256', this.saltKey);
//         hmac.update(data + '/pg/v1/pay' + this.saltKey);
//         return hmac.digest('hex') + '###' + this.saltIndex;
//     }

//     generateHumanReadableID(lastTransaction) {
//         if (lastTransaction && lastTransaction.length > 0) {
//             const lastHumanReadableID = lastTransaction[0].humanReadableID;
//             if (lastHumanReadableID) {
//                 const lastTransactionNumber = lastHumanReadableID.split('-');
//                 return `transactionId_${pad(parseInt(lastTransactionNumber.slice(-1)) + 1, 4)}`;
//             }
//         }
//         return `transactionId_${pad(1, 4)}`;
//     }

//     async getMerchantDetails() {
//         return {
//             merchantId: this.merchantId,
//             // Add any other relevant merchant details here
//         };
//     }
// }

// export default PhonePeService;



// const crypto = require('crypto');
// const axios = require('axios');
// const { v4: uuid } = require('uuid');
// const { Transaction } = require('../models/transaction');
// const { Order } = require('../models/order');
// const { BadRequestParameterError } = require('../errors');

// const PHONEPE_STATUS = {
//     IN_PROGRESS: 'PAYMENT_PENDING',
//     COMPLETED: 'PAYMENT_SUCCESS',
//     FAILED: 'PAYMENT_FAILED'
// };

// class PhonePeService {
//     constructor() {
//         this.merchantId = process.env.PHONEPE_MERCHANT_ID;
//         this.saltKey = process.env.PHONEPE_SALT_KEY;
//         this.saltIndex = process.env.PHONEPE_SALT_INDEX;
//         this.baseUrl = process.env.PHONEPE_API_URL; // Usually 'https://api.phonepe.com/apis/hermes'
//     }

//     async createPayment(transactionId, data, user, currentUserAccessToken) {
//         try {
//             console.log('[Payment] data....', data);

//             const intent = await Order.findOne({ transactionId: transactionId });
//             if (!intent) throw new BadRequestParameterError();

//             // Generate humanReadableID
//             let lastTransaction = await Transaction.find({}).sort({ createdAt: -1 }).limit(1);
//             let humanReadableID = this._generateHumanReadableId(lastTransaction);

//             // Create PhonePe payload
//             const payload = {
//                 merchantId: this.merchantId,
//                 merchantTransactionId: humanReadableID,
//                 merchantUserId: user.id || 'MUID' + Date.now(),
//                 amount: Math.round(Number(data.amount) * 100),
//                 redirectUrl: `${process.env.BASE_URL}/api/payment/redirect`,
//                 redirectMode: 'POST',
//                 callbackUrl: `${process.env.BASE_URL}/api/payment/webhook`,
//                 paymentInstrument: {
//                     type: 'PAY_PAGE'
//                 }
//             };

//             const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
//             const string = `${base64Payload}/pg/v1/pay${this.saltKey}`;
//             const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//             const checksum = `${sha256}###${this.saltIndex}`;

//             // Make API request to PhonePe
//             const response = await axios.post(`${this.baseUrl}/pg/v1/pay`, {
//                 request: base64Payload
//             }, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-VERIFY': checksum
//                 }
//             });

//             // Save transaction details
//             const transaction = {
//                 amount: data.amount,
//                 status: PHONEPE_STATUS.IN_PROGRESS,
//                 type: 'ON-ORDER',
//                 transactionId: transactionId,
//                 orderId: response.data.data.merchantTransactionId,
//                 humanReadableID: humanReadableID,
//             };

//             const intentTransaction = new Transaction(transaction);
//             await intentTransaction.save();

//             return {
//                 paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
//                 intentTransaction,
//                 transactionIdx: intentTransaction._id
//             };
//         } catch (err) {
//             console.error('[PhonePe Payment Error]', err);
//             throw err;
//         }
//     }

//     async verifyPaymentDetails(merchantId, transactionId, checksum) {
//         try {
//             // Verify checksum
//             const string = `/pg/v1/status/${merchantId}/${transactionId}${this.saltKey}`;
//             const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//             const expectedChecksum = `${sha256}###${this.saltIndex}`;

//             if (checksum !== expectedChecksum) {
//                 throw new BadRequestParameterError('Invalid Signature');
//             }

//             // Get status from PhonePe
//             const response = await axios.get(
//                 `${this.baseUrl}/pg/v1/status/${merchantId}/${transactionId}`,
//                 {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'X-VERIFY': checksum,
//                         'X-MERCHANT-ID': merchantId
//                     }
//                 }
//             );

//             // Update transaction status
//             const order = await Transaction.findOne({ orderId: transactionId });
//             if (!order) {
//                 throw new BadRequestParameterError('Transaction not found');
//             }

//             switch (response.data.code) {
//                 case 'PAYMENT_SUCCESS':
//                     order.status = PHONEPE_STATUS.COMPLETED;
//                     break;
//                 case 'PAYMENT_ERROR':
//                 case 'PAYMENT_DECLINED':
//                     order.status = PHONEPE_STATUS.FAILED;
//                     break;
//                 default:
//                     order.status = PHONEPE_STATUS.IN_PROGRESS;
//             }

//             order.payment = response.data;
//             await order.save();

//             return order;
//         } catch (err) {
//             console.error('[PhonePe Verification Error]', err);
//             throw err;
//         }
//     }

//     async handleWebhook(signature, payload) {
//         try {
//             // Verify webhook signature
//             const expectedSignature = crypto
//                 .createHmac('sha256', this.saltKey)
//                 .update(JSON.stringify(payload))
//                 .digest('hex');

//             if (signature !== expectedSignature) {
//                 throw new BadRequestParameterError('Invalid Webhook Signature');
//             }

//             const transaction = await Transaction.findOne({
//                 orderId: payload.merchantTransactionId
//             });

//             if (!transaction) {
//                 throw new BadRequestParameterError('Transaction not found');
//             }

//             // Update transaction status based on webhook event
//             switch (payload.code) {
//                 case 'PAYMENT_SUCCESS':
//                     transaction.status = PHONEPE_STATUS.COMPLETED;
//                     break;
//                 case 'PAYMENT_ERROR':
//                 case 'PAYMENT_DECLINED':
//                     transaction.status = PHONEPE_STATUS.FAILED;
//                     break;
//             }

//             transaction.payment = payload;
//             await transaction.save();

//             return transaction;
//         } catch (err) {
//             console.error('[PhonePe Webhook Error]', err);
//             throw err;
//         }
//     }

//     async refundAmount(txnId, amount) {
//         try {
//             const transaction = await Transaction.findOne({ transactionId: txnId });

//             if (transaction) {
//                 const payload = {
//                     merchantId: this.merchantId,
//                     merchantUserId: transaction.userId,
//                     merchantTransactionId: transaction.orderId,
//                     originalTransactionId: transaction.orderId,
//                     amount: amount * 100,
//                     callbackUrl: `${process.env.BACKEND_URL}/api/v2/phonepe/refund-webhook`
//                 };

//                 const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
//                 const signature = this.generateSignature(base64Payload);

//                 const response = await axios.post(`${this.baseUrl}/pg/v1/refund`, {
//                     request: base64Payload
//                 }, {
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'X-VERIFY': signature
//                     }
//                 });

//                 if (response.data.code === 'PAYMENT_SUCCESS') {
//                     const refund = new Refund({
//                         amount: amount,
//                         orderId: transaction.orderId,
//                         paymentId: transaction.paymentId,
//                         status: 'refunded'
//                     });
//                     await refund.save();
//                 }

//                 return response.data;
//             }
//         } catch (err) {
//             console.log("refund error ---", err);
//             throw err;
//         }
//     }

//     _generateHumanReadableId(lastTransaction) {
//         if (lastTransaction && lastTransaction.length > 0) {
//             const lastHumanReadableID = lastTransaction[0].humanReadableID;
//             if (lastHumanReadableID) {
//                 const lastNumber = parseInt(lastHumanReadableID.split('_').pop());
//                 return `transactionId_${String(lastNumber + 1).padStart(4, '0')}`;
//             }
//         }
//         return `transactionId_${String(1).padStart(4, '0')}`;
//     }
// }

// module.exports = new PhonePeService();


import { uuid } from 'uuidv4';
import Transaction from './db/transaction.js';
import Order from '../order/v1/db/order.js';
import {pad} from '../utils/stringHelper.js';
import crypto from 'crypto';
import BadRequestParameterError from '../lib/errors/bad-request-parameter.error.js';
import ConfirmOrderService from "../order/v2/confirm/confirmOrder.service.js";
import axios from 'axios';
import { PHONEPE_STATUS ,  PLATFORMS } from '../utils/constants.js';
import NoRecordFoundError from '../lib/errors/no-record-found.error.js';
const confirmOrderService = new ConfirmOrderService();

class PhonePeService {
    constructor() {
        this.merchantId = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT78";
        this.saltKey = process.env.PHONEPE_SALT_KEY || "b843d817-f5e8-4d36-8917-1c6e045a1af9";
        this.saltIndex = process.env.PHONEPE_SALT_INDEX || 1;
        this.baseUrl = process.env.PHONEPE_API_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";
        this.appUrl = process.env.APP_URL || "http://localhost:3001"
    }

    async createPayment(transactionId, data, user, deviceInfo) {
        try {

            // Validate order
            const intent = await Order.findOne({ transactionId });
            if (!intent) throw new BadRequestParameterError('Invalid transaction ID');

            // Generate transaction ID
            const humanReadableID = await this._generateHumanReadableId();

            // Get platform-specific redirect configurations
            const redirectConfig = this._getPlatformRedirectConfig(deviceInfo, humanReadableID);

            // Prepare PhonePe payload
            const payload = {
                merchantId: this.merchantId,
                merchantTransactionId: humanReadableID+"123456",
                merchantUserId: user.decodedToken.uid || `MUID_${Date.now()}`,
                amount: Math.round(Number(data.amount) * 100),
                redirectUrl: redirectConfig.redirectUrl,
                redirectMode: 'POST',
                callbackUrl: `https://9e52-106-51-37-219.ngrok-free.app/clientApis/v2/phonepe/webhook`,
                paymentInstrument: {
                    type: 'PAY_PAGE'
                }
            };

            // Add platform-specific configurations
            if (deviceInfo.platform !== PLATFORMS.WEB) {
                payload.deviceContext = {
                    deviceOS: deviceInfo.platform.toUpperCase(),
                    sourceApp: redirectConfig.appIdentifier
                };
            }

            // Generate PhonePe checksum
            const { base64Payload, checksum } = this._generatePhonePeChecksum(payload);

            console.log("CHECKsUM " , checksum)
            console.log("base64Payload" ,  base64Payload)

            // Make request to PhonePe
            const response = await this._makePhonePeRequest(base64Payload, checksum);

            console.log("Create-response", response)
            console.log("redirectionInfo", response.data. instrumentResponse.redirectInfo)

            // Save transaction
            const transaction = await this._saveTransaction({
                amount: data.amount,
                transactionId,
                orderId: response.data.merchantTransactionId,
                humanReadableID,
                deviceInfo
            });

            // Return platform-specific response
            return this._formatPaymentResponse(response.data, deviceInfo, transaction, redirectConfig);

        } catch (error) {
            console.error('[PhonePe Payment Error]', error);
            throw error;
        }
    }

    async createPayments(transactionId, data, user) {
        try {

            // Validate order
            const intent = await Order.findOne({ transactionId });
            if (!intent) throw new BadRequestParameterError('Invalid transaction ID');

            const transactionExist = await Transaction.findOne({orderId:data.merchantTransactionId})
            
            if(transactionExist){
                throw new BadRequestParameterError('merchantTransactionId already exist');
            }
            
            const transaction = new Transaction({
                amount: data.amount,
                transactionId,
                orderId: data.merchantTransactionId,
                humanReadableID: data.merchantTransactionId,
                status: "INITIALIZE-PAYMENT",
                paymentType: 'ON-ORDER',
                createdAt: Date.now()
            });

            await transaction.save()
            // Return platform-specific response
            return { success: 200 , message: "Transaction detail store successfully"}

        } catch (error) {
            console.error('[PhonePe Payment Error]', error);
            throw error;
        }
    }

    async handleWebhook(signature, encodedResponse) {
        try {

            // Step 1: Verify the webhook signature
            const verify = this._verifyWebhookSignature(signature, encodedResponse);

            if (!verify) {
                throw new BadRequestParameterError('Invalid webhook signature');
            }

            // Step 2: Decode base64 response and parse JSON
            const decodedPayload = JSON.parse(Buffer.from(encodedResponse, 'base64').toString());

            console.log("DecodeTokenPayload", decodedPayload )

            if(!decodedPayload || !decodedPayload?.data){
                throw new BadRequestParameterError('Invalid webhook signature');
            }

            const orderTransaction = await Transaction.findOne({orderId:decodedPayload?.data?.merchantTransactionId});

            if (!orderTransaction) {
                throw new NoRecordFoundError('Order not found');
            }

            // Update transaction status based on PhonePe event state
            switch (decodedPayload.code) {
                case 'PAYMENT_SUCCESS':
                    orderTransaction.status = 'TXN_SUCCESS';
                    orderTransaction.payment = decodedPayload.data?.paymentInstrument
                    break;
                case 'PAYMENT_ERROR':
                    orderTransaction.status = 'TXN_FAILURE';
                    break;
                case 'PAYMENT_PENDING':
                    orderTransaction.status = 'TXN_PENDING';
                    break;
                default:
                    orderTransaction.status = 'TXN_FAILURE';
                    break;
            }

            // Save the updated transaction status
            await orderTransaction.save();

            // Return the updated order
            console.log("Updation done")
            return orderTransaction;

        } catch (error) {
            console.error('[Webhook Error]', error);
            throw error;
        }
    }

    async paymentState(transactionId, confirmdata) {
        try {

            const orderTransaction = await Transaction.findOne({orderIid:transactionId});

            if (!orderTransaction) {
                throw new NoRecordFoundError('Order not found');
            }

            // Verify checksum
            const string = `/pg/v1/status/${this.merchantId}/${transactionId}${this.saltKey}`;
            const calculatedChecksum = this._calculateChecksum(string);

            // Get payment status from PhonePe
            const paymentStatus = await this._fetchPaymentStatus(transactionId, calculatedChecksum);

            if(!paymentStatus){
                return {
                    status: 400,
                    error:{
                        message: `No payment transaction found with id:${transactionId}`
                    }
                }
            }

            // Update transaction status based on PhonePe event state
            switch (paymentStatus?.code) {
                case 'PAYMENT_SUCCESS':
                    orderTransaction.status = 'TXN_SUCCESS';
                    orderTransaction.payment = paymentStatus.data?.paymentInstrument
                    break;
                case 'PAYMENT_ERROR':
                    orderTransaction.status = 'TXN_FAILURE';
                    break;
                case 'PAYMENT_PENDING':
                    orderTransaction.status = 'TXN_PENDING';
                    break;
                default:
                    orderTransaction.status = 'TXN_FAILURE';
                    break;
            }

            await orderTransaction.save();

            if(paymentStatus?.code!=="PAYMENT_SUCCESS"){
                return {
                    status: paymentStatus?.data?.code,
                    merchantTransactionId: transactionId,
                    message: paymentStatus?.message
                }
            }
            return await confirmOrderService.confirmMultipleOrder(confirmdata,transactionId)

        } catch (error) {
            console.error('[Payment Verification Error]', error);
            throw error;
        }
    }

    // Private helper methods
    async _generateHumanReadableId() {
        const lastTransaction = await Transaction.findOne().sort({ createdAt: -1 });
        const nextNumber = lastTransaction 
            ? parseInt(lastTransaction.humanReadableID.split('_').pop()) + 1 
            : 1;
        return `txn_${String(nextNumber).padStart(6, '0')}`;
    }

    async _updateTransactionFromWebhook(data) {
        const {
            merchantTransactionId,
            transactionId,
            amount,
            state,
            responseCode,
            paymentInstrument,
        } = data;
    
        // Update or create transaction in your database
        const transaction = await Transaction.findOneAndUpdate(
            { orderId: merchantTransactionId },
            {
                transactionId,
                amount,
                state,
                responseCode,
                paymentInstrument,
                updatedAt: new Date(),
            },
            { upsert: true, new: true }
        );
    
        if (!transaction) throw new Error('Transaction update failed');
    
        return transaction;
    }

    _getPlatformRedirectConfig(deviceInfo, transactionId) {
        const baseRedirectUrl = `${this.appUrl}/api/payment/redirect`;
        
        switch (deviceInfo.platform) {
            case PLATFORMS.ANDROID:
                return {
                    redirectUrl: baseRedirectUrl,
                    appIdentifier: process.env.ANDROID_PACKAGE_NAME,
                    deepLink: `${process.env.ANDROID_SCHEME}://payment/result?txnId=${transactionId}`,
                    fallbackUrl: `${this.appUrl}/payment/result?platform=android&txnId=${transactionId}`
                };

            case PLATFORMS.IOS:
                return {
                    redirectUrl: baseRedirectUrl,
                    appIdentifier: process.env.IOS_BUNDLE_ID,
                    deepLink: `${process.env.IOS_SCHEME}://payment/result?txnId=${transactionId}`,
                    universalLink: `${process.env.IOS_UNIVERSAL_LINK}/payment/result?txnId=${transactionId}`,
                    fallbackUrl: `${this.appUrl}/payment/result?platform=ios&txnId=${transactionId}`
                };

            default:
                return {
                    redirectUrl: baseRedirectUrl,
                    fallbackUrl: `${this.appUrl}/payment/result?txnId=${transactionId}`
                };
        }
    }

    _generatePhonePeChecksum(payload) {
        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const string = `${base64Payload}/pg/v1/pay${this.saltKey}`;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        return {
            base64Payload,
            checksum: `${sha256}###${this.saltIndex}`
        };
    }

    async _makePhonePeRequest(base64Payload, checksum) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/pg/v1/pay`,
                { request: base64Payload },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': checksum
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw new Error('PhonePe API request failed: ' + error.message);
        }
    }

    async _saveTransaction(transactionData) {
        const transaction = new Transaction({
            ...transactionData,
            type: 'ON-ORDER',
            createdAt: Date.now()
        });
        return await transaction.save();
    }

    _formatPaymentResponse(phonepeResponse, deviceInfo, transaction, redirectConfig) {
        const baseResponse = {
            success: true,
            transactionId: transaction.transactionId,
            merchantTransactionId: transaction.humanReadableID,
            amount: transaction.amount
        };

        switch (deviceInfo.platform) {
            case PLATFORMS.ANDROID:
                return {
                    ...baseResponse,
                    paymentUrl: phonepeResponse.instrumentResponse.redirectInfo.url,
                    deepLink: redirectConfig.deepLink,
                    fallbackUrl: redirectConfig.fallbackUrl,
                    packageName: process.env.ANDROID_PACKAGE_NAME
                };

            case PLATFORMS.IOS:
                return {
                    ...baseResponse,
                    paymentUrl: phonepeResponse.instrumentResponse.redirectInfo.url,
                    deepLink: redirectConfig.deepLink,
                    universalLink: redirectConfig.universalLink,
                    fallbackUrl: redirectConfig.fallbackUrl,
                    bundleId: process.env.IOS_BUNDLE_ID
                };

            default:
                return {
                    ...baseResponse,
                    paymentUrl: phonepeResponse.instrumentResponse.redirectInfo.url,
                    redirectUrl: redirectConfig.redirectUrl
                };
        }
    }

    async _updateTransactionStatus(transactionId, paymentStatus) {
        const transaction = await Transaction.findOne({ orderId: transactionId });
        if (!transaction) {
            throw new BadRequestParameterError('Transaction not found');
        }

        transaction.status = this._mapPhonePeStatus(paymentStatus.code);
        transaction.payment = paymentStatus;
        return await transaction.save();
    }

    _mapPhonePeStatus(phonepeStatus) {
        const statusMap = {
            'PAYMENT_SUCCESS': PHONEPE_STATUS.COMPLETED,
            'PAYMENT_ERROR': PHONEPE_STATUS.FAILED,
            'PAYMENT_DECLINED': PHONEPE_STATUS.FAILED,
            'PAYMENT_PENDING': PHONEPE_STATUS.IN_PROGRESS
        };
        return statusMap[phonepeStatus] || PHONEPE_STATUS.IN_PROGRESS;
    }

    _verifyWebhookSignature(signature, payload) {
        const calculatedSignature = crypto
            .createHmac('sha256', this.saltKey)
            .update(JSON.stringify(payload))
            .digest('hex');

        return signature !== calculatedSignature
    }

    _calculateChecksum(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

     // Helper method to fetch payment status from PhonePe
     async _fetchPaymentStatus(transactionId, checksum) {
        const url = `${this.baseUrl || "https://api-preprod.phonepe.com/apis/pg-sandbox"}/pg/v1/status/${this.merchantId}/${transactionId}`;

        // Set headers as per PhonePe API requirements
        const headers = {
            'Content-Type': 'application/json',
            'X-VERIFY': `${checksum}###${this.saltIndex}` // Append ###1 as version indicator
        };

        try {
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error) {
            console.error('[PhonePe API Error]', error.response ? error.response.data : error.message);
            throw new Error('Failed to fetch payment status from PhonePe');
        }
    }

     // Helper method to update the transaction in your database
     async _updateTransactionStatus(transactionId, paymentStatus) {
        const statusMapping = {
            SUCCESS: 'TXN_SUCCESS',
            FAILURE: 'TXN_FAILURE',
            PENDING: 'TXN_PENDING'
        };

        const updatedStatus = statusMapping[paymentStatus.code] || 'TXN_UNKNOWN';

        const transaction = await Transaction.findOneAndUpdate(
            { transactionId: transactionId },
            { status: updatedStatus },
            { new: true }
        );

        if (!transaction) {
            throw new Error(`Transaction with ID ${transactionId} not found`);
        }

        return transaction;
    }

}

export default PhonePeService