import { Schema, model } from "../../commons/client/MongooseClient";
import { USERCONST } from "../../commons/constants/DataConstants";


/**
 * Schema for @code UserSession collection
 * @type {Schema}
 */
const userSessionSchema = new Schema ({
    [USERCONST.FIELD_ID]: {type: String, required: true}, //email as _id
    [USERCONST.FIELD_SESSION_ID]: {type: String, required: true},
    [USERCONST.FIELD_EXPIRE_AT]: {type: Date, default: undefined}
}, {
    [USERCONST.FIELD_ID]: false
});

userSessionSchema.index({[USERCONST.FIELD_EXPIRE_AT]: 1}, {expireAfterSeconds: 0});

userSessionSchema.statics.upsert = function(email, sessionId, expiresAt) {
    return this.update({[USERCONST.FIELD_ID]: email},
        {$set: {[USERCONST.FIELD_ID]: email, [USERCONST.FIELD_SESSION_ID]: sessionId, [USERCONST.FIELD_EXPIRE_AT]: expiresAt}}, {runValidators: true, upsert: true});
};

userSessionSchema.statics.getSessionId = function(email) {
    return this.findOne({[USERCONST.FIELD_ID]: email}, {
    	[USERCONST.FIELD_SESSION_ID]: 1,
    	[USERCONST.FIELD_ID]: -1
    }).lean().then((obj) => {
        if(!obj) return null;
        return obj[USERCONST.FIELD_SESSION_ID];
    });
};

userSessionSchema.statics.delete = function(email) {
	return this.remove({[USERCONST.FIELD_ID]: email});
}

const userSessionModel = model (USERCONST.SESSION_BASE, userSessionSchema);



export default userSessionModel;
