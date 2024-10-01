const SSE_CONNECTIONS = {};

/**
 * store sse connection object
 * @param {String} messageId 
 * @param {Object} sse 
 */
function addSSEConnection(messageId, sse) {
    console.log("Connect sse")
    SSE_CONNECTIONS[messageId] = sse;
}

function sendSSEResponse(messageId, action, response) {
    if(!SSE_CONNECTIONS?.[messageId]) {
        console.log("Enter second for not")
        setTimeout(()=>{
            SSE_CONNECTIONS?.[messageId]?.send(
                response,
                action,
                messageId
            );
        }, process.env.SSE_TIMEOUT);
    }
    else {
        console.log("Enter second for Yes")
        SSE_CONNECTIONS?.[messageId]?.send(
            response,
            action,
            messageId
        );
    }
}

export {
    addSSEConnection,
    sendSSEResponse,
    SSE_CONNECTIONS
};