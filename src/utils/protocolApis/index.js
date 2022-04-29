import HttpRequest from "../HttpRequest.js";
import PROTOCOL_API_URLS from "./routes.js";

/**
 * on confirm order
 * @param {String} messageId 
 */
const onOrderConfirm = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_CONFIRM + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};


/**
 * on cancel order
 * @param {String} messageId 
 */
const onOrderCancel = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_CANCEL + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

/**
 * on init order
 * @param {String} messageId 
 */
const onOrderInit = async (messageId) => {
    const apiCall = new HttpRequest(
        process.env.PROTOCOL_BASE_URL,
        PROTOCOL_API_URLS.ON_INIT + "?messageId="+ messageId,
        "get",
    );

    let result = await apiCall.send();
    return result.data;
};

export { onOrderCancel, onOrderConfirm, onOrderInit };
