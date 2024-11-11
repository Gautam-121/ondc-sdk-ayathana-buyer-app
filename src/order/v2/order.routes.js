import {Router} from 'express';
import { authentication } from '../../middlewares/index.js';

import selectValidator from './select/selectOrder.validator.js';
import initValidator from "./init/intOrder.validator.js"
import orderHistoryValidator from "./history/orderHistory.validator.js"

import CancelOrderController from './cancel/cancelOrder.controller.js';
import ConfirmOrderController from './confirm/confirmOrder.controller.js';
import InitOrderController from './init/initOrder.controller.js';
import OrderHistoryController from './history/orderHistory.controller.js';
import OrderStatusController from './status/orderStatus.controller.js';
import SelectOrderController from './select/selectOrder.controller.js';
import UpdateOrderController from './update/updateOrder.controller.js';
import ComplaintOrderController from './complaint/complaintOrder.controller.js';
import UploadController from '../upload/upload.controller.js';
import RatingController from './rating/ratingcontroller.js';

const rootRouter = new Router();

const cancelOrderController = new CancelOrderController();
const confirmOrderController = new ConfirmOrderController();
const initOrderController = new InitOrderController();
const orderHistoryController = new OrderHistoryController();
const orderStatusController = new OrderStatusController();
const selectOrderController = new SelectOrderController();
const updateOrderController = new UpdateOrderController();
const complaintOrderController  = new  ComplaintOrderController ();
const uploadController = new  UploadController();
const ratingController = new  RatingController();
//#region confirm order



// confirm order v1
rootRouter.post(
    '/v1/confirm_order',
    confirmOrderController.confirmOrder,
);

// confirm order v2
rootRouter.post(
    '/v2/confirm_order',
    authentication(),
    confirmOrderController.confirmMultipleOrder,
);

// on confirm order v1
rootRouter.get('/v1/on_confirm_order', confirmOrderController.onConfirmOrder);

// on confirm order v2
rootRouter.get('/v2/on_confirm_order', authentication(), confirmOrderController.onConfirmMultipleOrder);

//#endregion

//#region cancel order

rootRouter.post(
    '/v2/cancel_order',
    authentication(),
    cancelOrderController.cancelOrder,
);

rootRouter.get('/v2/on_cancel_order', authentication(), cancelOrderController.onCancelOrder);

//#endregion

//#region order history
rootRouter.get('/v2/orders', authentication(), orderHistoryValidator.orderList ,  orderHistoryController.getOrdersList);
//#endregion

//#region Initialize order

// initialize order v1
rootRouter.post(
    '/v1/initialize_order',
    initOrderController.initOrder,
);

// initialize order v2
rootRouter.post(
    '/v2/initialize_order', 
    authentication(),
    initValidator.init,
    initOrderController.initMultipleOrder,
);

// on initialize order v1
//rootRouter.get('/v2/on_initialize_order', initOrderController.onInitOrder);

// on initialize order v2
rootRouter.get('/v2/on_initialize_order', authentication(), initValidator.on_init , initOrderController.onInitMultipleOrder);

//#endregion

//#region order status

// order status v1
rootRouter.post(
    '/v1/order_status',
    orderStatusController.orderStatus,
);

// order status v2
rootRouter.post(
    '/v2/order_status', 
    authentication(),
    orderStatusController.orderStatusV2,
);

// on order status v1
rootRouter.get('/v1/on_order_status', orderStatusController.onOrderStatus);

// on order status v2
rootRouter.get('/v2/on_order_status', authentication(), orderStatusController.onOrderStatusV2);

//#endregion

//#region select order

// select order v1
rootRouter.post(
    '/v1/select', 
    authentication(),
    selectOrderController.selectOrder,
);

// select order v2
rootRouter.post(
    '/v2/select', 
    authentication(),
    selectValidator.select,
    selectOrderController.selectMultipleOrder,
);

// select order v2
rootRouter.post(
    '/v2/complaint',
    complaintOrderController.raiseComplaint,
);

// on select order v1
rootRouter.get('/v1/on_select', authentication(), selectOrderController.onSelectOrder);

// on select order v2
rootRouter.get('/v2/on_select', authentication(), selectValidator.on_select , selectOrderController.onSelectMultipleOrder);

rootRouter.post('/v2/update', authentication(), updateOrderController.update);

rootRouter.get('/v2/on_update', authentication(), updateOrderController.onUpdate);

rootRouter.post('/v2/getSignUrlForUpload/:orderId', authentication(), uploadController.upload);

rootRouter.get('/v2/orders/:orderId', authentication(), confirmOrderController.orderDetails);

rootRouter.post('/v2/orders/push/oms', confirmOrderController.orderPushToOMS);

rootRouter.post('/v2/rating/:orderId', authentication(),  ratingController.rateOrder);

rootRouter.get('/v2/rating/:orderId', authentication(),  ratingController.getRating);


export default rootRouter;
