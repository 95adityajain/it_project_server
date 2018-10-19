import express from "express";
import * as UserService from "./UserService";
import * as UserMiddleware from "./UserMiddleware";



const Router = express.Router();

Router.post("/registrationRequest", UserMiddleware.preRegistrationRequest);
Router.post("/registrationRequest", UserService.registrationRequest);

Router.post("/login", UserMiddleware.preLogin);
Router.post("/login", UserService.login);

// Router.get("/requestResetPassword/:email", UserService.requestResetPassword);

// Router.post("/resetPassword", UserMiddleware.preResetPassword);
// Router.post("/resetPassword", UserService.resetPassword);

//authentication middleware
Router.use(UserMiddleware.authenticateLoggedInUser);

Router.get("/logout", UserService.logout);

//refreshSession Middleware - update session(expiry) for each request
Router.use(UserMiddleware.refershSession);

Router.get("/validateSession", (req, res) => {
	return res.status(200).end();
});

Router.get("/basicProfile", UserService.getBasicProfile);
Router.post("/basicProfile", UserService.updateBasicProfile);

Router.post("/password", UserMiddleware.preUpdatePassword);
Router.post("/password", UserService.updatePassword);


export default Router;
