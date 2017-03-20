const utils = require('./utils');
const mongoose = require('mongoose');
const Community = mongoose.model('Community');

module.exports = (options) => {

    return  async (req, res, next) => {
        
        const userInfo = req.payload;

        if(userInfo) {
            if(options.community) {
                const usersCommunity = userInfo.community;

                const requestedCommunity = req.params.communityid || req.params.communityId;

                //no community id was found
                if(!requestedCommunity) {
                    next();
                    return;
                }

                if(usersCommunity !== requestedCommunity) {
                    console.log('Requesting something that isnt from your community');
                    utils.sendJSONresponse(res, 404, {err: 'Requesting something that isnt from your community'});
                    return;
                }
            }

            if(options.boss) {

                const userIsBoss = await isBoss(userInfo.community, userInfo._id);

                console.log(userIsBoss);

                if(!userIsBoss) {
                    utils.sendJSONresponse(res, 404, {err: "User is not a boss"});
                    return;
                }
            }
        } else {
            console.log('Authorization failed must be called after the auth middleware');
        }

        next();
    }
};

async function isBoss(communityid, boss) {

    const community = await Community.findById(communityid);

    if(String(community.boss) === String(boss)) {
        return true;
    } else {
        return false;
    }

}