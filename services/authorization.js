const utils = require('./utils');


module.exports = (options) => {

    return  (req, res, next) => {
        
        const userInfo = req.payload;

        if(userInfo) {
            if(options.community) {
                const usersCommunity = userInfo.community;

                const requestedCommunity = req.params.communityid || req.params.communityId;

                if(usersCommunity !== requestedCommunity) {
                    console.log('Requesting something that isnt from your community');
                    utils.sendJSONresponse(res, 404, {err: 'Requesting something that isnt from your community'});
                    return;
                }
            }

            if(options.boss) {
                
            }
        } else {
            console.log('Authorization failed must be called after the auth middleware');
        }

        next();
    }
};