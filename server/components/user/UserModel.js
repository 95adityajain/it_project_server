import { Schema, model } from "../../commons/client/MongooseClient";
import HashUtils from "../../commons/utils/HashUtils";
//import ErrorConstants from "../../commons/constants/ErrorConstants";
import { USERCONST } from "../../commons/constants/DataConstants";
import Utils from "../../commons/utils";





/**
 * Schema for @code User collection
 * @type {Schema}
 */
const userSchema = new Schema ({
    [USERCONST.FIELD_EMAIL]: {type: String, lowercase: true, unique: true, required: true},
    [USERCONST.FIELD_PASSWORD]: {type: String, required: true},
    [USERCONST.FIELD_PROFILE]: {
        [USERCONST.FIELD_NAME]: {type: String, required:true},
        [USERCONST.FIELD_GENDER]: {type: String, lowercase: true, required: true, enum: [USERCONST.VALUE_GENDER_MALE, USERCONST.VALUE_GENDER_FEMALE, USERCONST.VALUE_GENDER_OTHER]},
        [USERCONST.FIELD_PHOTO]: String,
        [USERCONST.FIELD_PHNO]: {type: String, required: true}
    }
});

userSchema.pre ("save", function(next) {
    const user = this;
    if (!user.isModified (USERCONST.FIELD_PASSWORD)) {
        return next ();
    }
    HashUtils.generatePassword (user[USERCONST.FIELD_PASSWORD]).then ((hashedPassword) => {
        user[USERCONST.FIELD_PASSWORD] = hashedPassword;
        next ();
    }).catch ((err) => {
        Utils.log ("error", (err));//(ErrorConstants.PASSWORD_HASH_GENERATION_ERROR);
        next (err);
    });
});

userSchema.statics.getDocByEmail =  function (email) {
    return this.findOne ({[USERCONST.FIELD_EMAIL]: email});
};

userSchema.statics.getObjByEmail =  function (email) {
    return this.findOne ({[USERCONST.FIELD_EMAIL]: email}).lean ();
};

userSchema.statics.getFieldByEmail = function (email, fieldName) {
    const projectionObj = {[fieldName]: 1};
    if (fieldName != USERCONST.FIELD_ID) {
        projectionObj [USERCONST.FIELD_ID] = -1;
    }
    return this.findOne ({[USERCONST.FIELD_EMAIL]: email}, projectionObj).lean ().then ((obj) => {
        if (!obj) {
            return null;
        }
        return obj [fieldName];
    });
};

userSchema.statics.updateFieldByEmail = function (email, fieldName, fieldValue) {
    return this.update ({[USERCONST.FIELD_EMAIL]: email}, {$set: {[fieldName]: fieldValue}}, {runValidators: true});
};

userSchema.statics.getMultiFieldByEmail = function (email, projectionObj) {
    if (!projectionObj [USERCONST.FIELD_ID]) {
        projectionObj [USERCONST.FIELD_ID] = -1;
    }
    return this.findOne ({[USERCONST.FIELD_EMAIL]: email}, projectionObj).lean ();
};

userSchema.statics.isEmailExists = function (email) {
    return this.count ({[USERCONST.FIELD_EMAIL]: email}).then ((count) => {
        return (count && count > 0)? true : false;
    });
};


const userModel = model (USERCONST.BASE, userSchema);

export default userModel;
