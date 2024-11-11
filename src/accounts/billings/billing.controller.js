import BillingService from './billing.service.js';
import {validationResult} from "express-validator"
import BadRequestParameterError from '../../lib/errors/bad-request-parameter.error.js';

const billingService = new BillingService();

class BillingController {

    /**
    * add billing address
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    billingAddress(req, res, next) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestParameterError(errors.array()[0].msg);
        }

        const { body: request, user } = req;

        billingService.billingAddress(request, user).then(response => {
            res.json(response);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * get billing address
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    onBillingDetails(req, res, next) {
        const { user } = req;

        billingService.onBillingDetails(user).then(order => {
            res.json(order);
        }).catch((err) => {
            next(err);
        });
    }

    /**
    * update billing address
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */
    updateBillingAddress(req, res, next) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new BadRequestParameterError(errors.array()[0].msg);
        }
        
        const { body: request, params } = req;
        const { id } = params;

        billingService.updateBillingAddress(id, request).then(response => {
            res.json(response);
        }).catch((err) => {
            next(err);
        });
    }
}

export default BillingController;
