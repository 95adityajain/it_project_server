/**
 * Module dependencies
 */
import bodyParser from "body-parser";
import compression from "compression";
import express from "express";
import http from "http";
import Promise from "bluebird";
import cors from "cors";

import mongoose from "./server/commons/client/MongooseClient";

import config from "./server/config";
import Utils from "./server/commons/utils";

import UserRoutes from "./server/components/user/UserRoute";



// If the Node process ends, close all connection
process.on("SIGINT", function() {
    Promise.all ([mongoose.connection.close]).finally(() => {
        Utils.log("info", "All resources freed. :)");
        process.exit (0);
    });

});

/**
 * creating express and socket.IO app instance
 */
const app = new express ();
const httpServer = http.Server (app);


if(config.env == "development") {
	app.use(cors({
		origin: "http://localhost:8100"
	}));
}

/**
 * Express configuration
 */
app.set ("env", config.env);
app.set ("port", config.express.port);
//app.use ("/static", express.static (config.staticPath));
app.use (compression ());
app.use (bodyParser.json ());
app.use(bodyParser.urlencoded({extended:true}));

/**
 * Request logger
 */
app.use (Utils.requestLogger);


/**
 * App Routes
 */
/*app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
});*/

app.use ("/user", UserRoutes);

app.use(function(req, res){
    res.type("text/html");
    res.status(404);
    res.send("404 - Not Found");
});



/**
 * Starting server
 */
httpServer.listen(config.express.port, function(){
    Utils.log("info", "Server Listening at port no. : " + config.express.port);
});
