// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// <disable>JS1001.SyntaxError</disable>

const { Console } = require('console');
const databaseFunctions = require('./sqlDatabase');
const constants = require('./constants.json');

(function () {
    "use strict";

    // pull in the required packages.
    require('dotenv').config();
    const express = require('express');
    const axios = require('axios');
    const bodyParser = require('body-parser');
    const pino = require('express-pino-logger')();
    const cors = require('cors');
    const http = require("http")

    const app = express();

    const port = process.env.PORT || 3001
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(pino);
    app.use(cors());

    const server = http.createServer(app)
    const io = require("socket.io")(server, {
        cors: {
            origin: ["https://facial-emotion-recognition-dev-v2.azurewebsites.net", "http://localhost:3000"],
            methods: [ "GET", "POST" ]
        }
    })

    app.get('/', async (req, res, next) => {
        res.send({ message: "Welcome to FER Backend" });
    })

    app.get('/api/get-speech-token', async (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        const speechKey = process.env.SPEECH_KEY;
        const speechRegion = process.env.SPEECH_REGION;

        if (speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
            res.status(400).send('You forgot to add your speech key or region to the .env file.');
        } else {
            const headers = { 
                headers: {
                    'Ocp-Apim-Subscription-Key': speechKey,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            try {
                const tokenResponse = await axios.post(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, headers);
                res.send({ token: tokenResponse.data, region: speechRegion });
            } catch (err) {
                res.status(401).send('There was an error authorizing your speech key.');
            }
        }
    });


    app.post('/schedule-appointment', async (req, res, next) => {
        try{
            let connection = await databaseFunctions.connectToDB()
            if(!connection || connection == undefined){
                console.log("Database connection Failed")
                connection = await databaseFunctions.connectToDB()
                console.log("Database connection Established", connection)
                if(!connection || connection == undefined){
                    res.send(
                        { 
                            status: 500,
                            message: "Something went wrong"
                        }
                    );
                    return
                }
            }

            //console.log(connection)

            //console.log(req.body)
            
            let response = await databaseFunctions.queryAppointments(connection, "INSERT", req.body)

            if(response.message == "successfully inserted"){
                /*
                res.send(
                    { 
                        "status": 200,
                        "message" : "Data Inserted Successfully", 
                        "meetingLink" : constants.baseURL + response.data
                    }
                );
                */
                res.send(
                    { 
                        "conferenceId": response.data,
                        "conferenceUrl": constants.baseURL + response.data + "?email=" + req.body.userEmail,
                        "conferenceDetails": "Click here to join: " + constants.baseURL + response.data + "?email=" + req.body.userEmail
                    }
                );
                return
            }
            else{
                res.send(
                    { 
                        status: 500,
                        message: "Something went wrong"
                    }
                );
                return
            }
        }
        catch(err){
            console.log(err)
            res.send(
                { 
                    status: 500,
                    message: "Something went wrong"
                }
            );
        }
        //res.send({ message: "Welcome to FER Backend" });
    })

    app.post('/update-appointment', async (req, res, next) => {
        try{
            let connection = await databaseFunctions.connectToDB()
            if(!connection || connection == undefined){
                console.log("Database connection Failed")
                connection = await databaseFunctions.connectToDB()
                console.log("Database connection Established", connection)
                if(!connection || connection == undefined){
                    res.send(
                        { 
                            status: 500,
                            message: "Something went wrong"
                        }
                    );
                    return
                }
            }

            //console.log(connection)

            //console.log(req.body)
            
            let response = await databaseFunctions.queryAppointments(connection, "UPDATE", req.body)

            if(response.message == "successfully updated"){
                res.send(
                    { 
                        "conferenceId": response.data,
                        "conferenceUrl": constants.baseURL + response.data + "?email=" + req.body.userEmail,
                        "conferenceDetails": "Click here to join: " + constants.baseURL + response.data + "?email=" + req.body.userEmail
                    }
                );
                return
            }
            else{
                res.send(
                    { 
                        status: 500,
                        message: "Something went wrong"
                    }
                );
                return
            }
        }
        catch(err){
            console.log(err)
            res.send(
                { 
                    status: 500,
                    message: "Something went wrong"
                }
            );
        }
        //res.send({ message: "Welcome to FER Backend" });
    })

    app.post('/delete-appointment', async (req, res, next) => {
        try{
            let connection = await databaseFunctions.connectToDB()
            if(!connection || connection == undefined){
                console.log("Database connection Failed")
                connection = await databaseFunctions.connectToDB()
                console.log("Database connection Established", connection)
                if(!connection || connection == undefined){
                    res.send(
                        { 
                            status: 500,
                            message: "Something went wrong"
                        }
                    );
                    return
                }
            }

            //console.log(connection)

            //console.log(req.body)
            
            let response = await databaseFunctions.queryAppointments(connection, "DELETE", req.body)

            if(response.message == "successfully deleted"){
                res.send(
                    { 
                        "conferenceId": response.data,
                        "conferenceUrl": constants.baseURL + response.data,
                        "conferenceDetails": "Meeting Deleted"
                    }
                );
                return
            }
            else{
                res.send(
                    { 
                        status: 500,
                        message: "Something went wrong"
                    }
                );
                return
            }
        }
        catch(err){
            console.log(err)
            res.send(
                { 
                    status: 500,
                    message: "Something went wrong"
                }
            );
        }
        //res.send({ message: "Welcome to FER Backend" });
    })


    const nameToSocketIdMap = new Map();
    const socketidToNameMap = new Map();

    io.on("connection", (socket) => {
        socket.emit("me", socket.id)

        socket.on("room:join", (data) => {
            const { name, room } = data;
            nameToSocketIdMap.set(name, socket.id);
            socketidToNameMap.set(socket.id, name);
            io.to(room).emit("user:joined", { name, id: socket.id });
            socket.join(room);
            io.to(socket.id).emit("room:join", { name, room, id : socket.id });
        });

        socket.on("getId", () => {
            //console.log("called here", socket.id)
            io.to(socket.id).emit("me", socket.id)
        })

        socket.on("callEnded", () => {
            socket.broadcast.emit("callEnded")
        })

        socket.on("callUser", (data) => {
            //console.log(data)
            io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
        })

        socket.on("answerCall", (data) => {
            //io.to(data.to).emit("callAccepted", data.signal)
            io.to(data.to).emit("callAccepted", { signal: data.signal, from: data.to, name: data.name })
        })

        socket.on("sendMSG", (data) => {
            //console.log(data)
            io.to(data.to).emit("sendMSGToSalesmen", { to: data.to, message : data.message })
        })

        socket.on("IceCandidate", (data) => {
            //console.log("IceCandidate.START");
            let calleeId = data.calleeId;
            let iceCandidate = data.iceCandidate;
        
            //console.log("emit.IceCandidate.START");
            socket.to(calleeId).emit("IceCandidate", {
              sender: socket.user,
              iceCandidate: iceCandidate,
            });
            //console.log("emit.IceCandidate.END");
            //console.log("IceCandidate.END");
        });
    })

    server.listen(port, () => {
        console.log('Express server is running on localhost:' + port);
    });
}());
// </disable>
