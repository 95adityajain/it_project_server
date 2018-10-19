import UserLogic from "./UserLogic";
//import HashUtils from "../../commons/utils/HashUtils";
import Utils from "../../commons/utils";
import UserConstants from "../../commons/constants/UserConstants";
import ProcessErrorConstants from "../../commons/constants/ErrorConstants";
import { USERCONST } from "../../commons/constants/DataConstants";
import { OperationalError } from "bluebird";



/**
 * POST /user/registrationRequest
 * Submits Registration request, for admin to approve.
 */
export const registrationRequest = (req, res) => {
    const user = req.body.user;
    UserLogic.create(user).then(() => {
        res.status(200).json({"message": UserConstants.USER_REGISTRATION_REQUEST});
        return Utils.log("info", user);
    }).catch((err) => {
        res.status(500).json({"message": UserConstants.USER_REGISTRATION_REQUEST_ERROR});
        return Utils.log("error", UserConstants.USER_REGISTRATION_REQUEST_ERROR + "\n" + err);
    });
};


/**
 * POST /login
 * Login
 * @body    {
 *              "username": <String>,
 *              "email": <String>
 *          }
 */
export const login = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    UserLogic.verifyPassword(email, password).then(() => {
        return UserLogic.getSession(email).then((sessionId) => {
            if(!sessionId) {
                return UserLogic.generateSession(email).then((sid) => {
                    return res.status(200).json({email, sid, expiresAfter: USERCONST.VALUE_SESSION_EXPIRY_SECONDS});
                });
            }
            return UserLogic.setSession(email, sessionId).then(() => {
                return res.status(200).json({email, [USERCONST.FIELD_SESSION_ID]:sessionId, expiresAfter: USERCONST.VALUE_SESSION_EXPIRY_SECONDS});
            });
        });
    }).catch(OperationalError,(err) => {
        res.status(500).json({"message": err.cause});
        return Utils.log("error", err);
    }).catch((err) => {
        res.status(500).json({"message": UserConstants.USER_LOGIN_ERROR});
        return Utils.log("error", err);
    });
};


/**
 * POST /logout
 * Logout
 */
export const logout = (req, res) => {
    const email = req.query.email;
    UserLogic.deleteSession(email).then(() => {
        return res.status(200).end();
    }).catch((err) => {
        res.status(500).json({"message": UserConstants.USER_LOGOUT_ERROR});
        return Utils.log("error", err);
    });
};


/**
 * POST /basicProfile
 * BasicProfile
 */
export const getBasicProfile = (req, res) => {
    const email = req.query.email;
    return UserLogic.getField(email, USERCONST.FIELD_PROFILE).then((basicProfileObj) => {
        return res.status(200).json(basicProfileObj);
    }).catch((err) => {
        res.status(500).json({"message": UserConstants.USER_GET_PROFILE_ERROR});
        return Utils.log("error", UserConstants.USER_GET_PROFILE_ERROR+"\n"+err);
    });
};


/**
* POST /basicProfile
* basicProfile
*/
export const updateBasicProfile = (req, res) => {
    const email = req.query.email;
    const updatedBasicProfile = req.body;
    return UserLogic.updateField(email, USERCONST.FIELD_PROFILE, updatedBasicProfile).then(() => {
        return res.status(200).end();
    }).catch((err) => {
        res.status(500).json({"message": UserConstants.USER_UPDATE_PROFILE_ERROR});
        return Utils.log("error", UserConstants.USER_UPDATE_PROFILE_ERROR+"\n"+err);
    });
};

export const updatePassword = (req, res) => {
    const email = req.query.email;
    const newPassword = req.body.new_password;
    UserLogic.generateAndUpdatePassword(email, newPassword).then(() => {
        return res.status(200).end();
    }).catch(OperationalError,(err) => {
        res.status(500).json({"message": err.cause});
        return Utils.log("error", err);
    }).catch((err) => {
        res.status(500).json({"message": UserConstants.USER_UPDATE_PASSWORD_ERROR});
        return Utils.log("error", err);
    });
};

// // export const requestResetPassword =(req, res) => {
// //     const email = req.params.email;
// //     UserLogic.setResetPasswordToken(email).then(() => {
// //         return res.status(200).end();
// //     }).catch((err) => {
// //         res.status(500).json({"message": UserConstants.USER_RESET_PASSWORD_REQUEST_ERROR});
// //         return Utils.log("error", err);
// //     });
// // };


// //TODO:(THINK) can delete token after successfull updation of password.
// export const resetPassword =(req, res) => {
//     const email = req.query.email;
//     const newPassword = req.body.new_password;
//     UserLogic.generateAndUpdatePassword(email, newPassword).then(() => {
//         res.status(200).end();
//     }).catch((err) => {
//         res.status(500).json({"message": ProcessErrorConstants.PROCESSING_ERROR});
//         return Utils.log("error", err);
//     });
// };

// // export const getAllResetPasswordRequest =(req, res) => {
// //     UserLogic.getResetPasswordListforAdminDisplay().then((list) => {
// //         return res.status(200).json(list);
// //     }).catch((err) => {
// //         res.status(500).json({"message": ProcessErrorConstants.PROCESSING_ERROR});
// //         return Utils.log("error", err);
// //     });
// // };
