import { onOrderTrack } from "../utils/protocolApis/index.js";
import { PROTOCOL_CONTEXT } from "../utils/constants.js";

import BppTrackService from "./bppTrack.service.js";
import ContextFactory from "../factories/ContextFactory.js";

const bppTrackService = new BppTrackService();

class TrackService {

    /**
    * track order
    * @param {Object} trackRequest
    */
    async track(trackRequest) {
        try {
            const { context: requestContext } = trackRequest || {};

            const contextFactory = new ContextFactory();
            const context = contextFactory.create({
                action: PROTOCOL_CONTEXT.TRACK,
                transactionId: requestContext?.transaction_id,
                bppId: requestContext?.bpp_id
            });

            return await bppTrackService.track(
                context,
                trackRequest
            );
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * track multiple orders
     * @param {Array} requests 
     */
    async trackMultipleOrder(requests) {

        const trackResponses = await Promise.all(
            requests.map(async request => {
                try {
                    const trackResponse = await this.track(request);
                    return trackResponse;
                }
                catch (err) {
                    throw err;
                }
            })
        );

        return trackResponses;
    }

    /**
    * on track order
    * @param {Object} messageId
    */
    async onTrack(messageId) {
        try {
            const protocolTrackResponse = await onOrderTrack(messageId);
            if(protocolTrackResponse && protocolTrackResponse.length)
                return protocolTrackResponse?.[0];
            else {
                const contextFactory = new ContextFactory();
                const context = contextFactory.create({
                    messageId: messageId,
                    action: PROTOCOL_CONTEXT.ON_TRACK
                });

                return {
                    context,
                    error: {
                        message: "No data found"
                    }
                };
            }
        }
        catch (err) {
            throw err;
        }
    }

    /**
    * on track multiple order
    * @param {Object} messageId
    */
    async onTrackMultipleOrder(messageIds) {
        try {
            const onTrackResponse = await Promise.all(
                messageIds.map(async messageId => {
                    try {
                        const onTrackResponse = await this.onTrack(messageId);
                        return { ...onTrackResponse };
                    }
                    catch (err) {
                        throw err;
                    }
                })
            );

            return onTrackResponse;
        }
        catch (err) {
            throw err;
        }
    }
}

export default TrackService;