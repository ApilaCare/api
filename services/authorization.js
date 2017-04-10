const utils = require('./utils');
const mongoose = require('mongoose');
const Community = mongoose.model('Community');

module.exports = (options) => {

    return  async (req, res, next) => {
        
        const userInfo = req.payload;

        if(userInfo) {
            if(options.community) {
                const usersCommunity = userInfo.community;

                const requestedCommunity = req.params.communityid || req.params.community;

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

                if(!userIsBoss) {
                    utils.sendJSONresponse(res, 404, {err: "User is not a boss"});
                    return;
                }
            }

            if(options.director) {
                const userIsDirector = await isDirector(userInfo.community, userInfo._id);

                if(!userIsDirector) {
                    utils.sendJSONresponse(res, 404, {err: "User is not a director"});
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

async function isDirector(communityid, director) {

    const community = await Community.findById(communityid);

    if(community.directors.indexOf(director) !== -1) {
        return true;
    }

    return false;

}