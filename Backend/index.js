// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
// <disable>JS1001.SyntaxError</disable>
//V-1.1
const { Console } = require("console");
const databaseFunctions = require("./sqlDatabase");
const constants = require("./constants.json");
const { BlobServiceClient, BlobSASPermissions, SASProtocol } = require("@azure/storage-blob");
const {
  TextAnalyticsClient,
  AzureKeyCredential,
} = require("@azure/ai-text-analytics");
const containerName = constants.CONTAINER_NAME;
const connectionString = constants.AZURE_STORAGE_CONNECTION_STRING;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
(function () {
  "use strict";

  // pull in the required packages.
  require("dotenv").config();
  const express = require("express");
  const axios = require("axios");
  const bodyParser = require("body-parser");
  const pino = require("express-pino-logger")();
  const cors = require("cors");
  const http = require("http");

  const app = express();

  const port = process.env.PORT || 3001;

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(pino);
  app.use(cors());

  const server = http.createServer(app);
  const io = require("socket.io")(server, {
    cors: {
      origin: [
        "https://facial-emotion-recognition-dev-v2.azurewebsites.net",
        "http://localhost:3000",
        "https://facial-emotion-recognition-dev-v3.azurewebsites.net",
        "https://magiccx.azurewebsites.net/",
      ],
      methods: ["GET", "POST"],
    },
  });

  app.get("/", async (req, res, next) => {
    res.send({ message: "Welcome to SalesFlow Analyzer Backend" });
  });

  app.get("/api/get-speech-token", async (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    const speechKey = process.env.SPEECH_KEY;
    const speechRegion = process.env.SPEECH_REGION;

    if (
      speechKey === "paste-your-speech-key-here" ||
      speechRegion === "paste-your-speech-region-here"
    ) {
      res
        .status(400)
        .send("You forgot to add your speech key or region to the .env file.");
    } else {
      const headers = {
        headers: {
          "Ocp-Apim-Subscription-Key": speechKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };

      try {
        const tokenResponse = await axios.post(
          `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
          null,
          headers
        );
        res.send({ token: tokenResponse.data, region: speechRegion });
      } catch (err) {
        res.status(401).send("There was an error authorizing your speech key.");
      }
    }
  });

  app.post("/schedule-appointment", async (req, res, next) => {
    try {
      let connection = await databaseFunctions.connectToDB();
      if (!connection || connection == undefined) {
        console.log("Database connection Failed");
        connection = await databaseFunctions.connectToDB();
        console.log("Database connection Established", connection);
        if (!connection || connection == undefined) {
          res.send({
            status: 500,
            message: "Something went wrong",
          });
          return;
        }
      }

      //console.log(connection)

      //console.log(req.body)

      let response = await databaseFunctions.queryAppointments(
        connection,
        "INSERT",
        req.body
      );

      if (response.message == "successfully inserted") {
        /*
                res.send(
                    { 
                        "status": 200,
                        "message" : "Data Inserted Successfully", 
                        "meetingLink" : constants.baseURL + response.data
                    }
                );
                */
        res.send({
          conferenceId: response.data,
          conferenceUrl: constants.baseURL + response.data,
          conferenceDetails:
            "Click here to join: " + constants.baseURL + response.data,
        });
        return;
      } else {
        res.send({
          status: 500,
          message: "Something went wrong",
        });
        return;
      }
    } catch (err) {
      console.log(err);
      res.send({
        status: 500,
        message: "Something went wrong",
      });
    }
    //res.send({ message: "Welcome to FER Backend" });
  });

  app.post("/update-appointment", async (req, res, next) => {
    try {
      let connection = await databaseFunctions.connectToDB();
      if (!connection || connection == undefined) {
        console.log("Database connection Failed");
        connection = await databaseFunctions.connectToDB();
        console.log("Database connection Established", connection);
        if (!connection || connection == undefined) {
          res.send({
            status: 500,
            message: "Something went wrong",
          });
          return;
        }
      }

      //console.log(connection)

      //console.log(req.body)

      let response = await databaseFunctions.queryAppointments(
        connection,
        "UPDATE",
        req.body
      );

      if (response.message == "successfully updated") {
        res.send({
          conferenceId: response.data,
          conferenceUrl: constants.baseURL + response.data,
          conferenceDetails: "Click here to join: " + constants.baseURL,
        });
        return;
      } else {
        res.send({
          status: 500,
          message: "Something went wrong",
        });
        return;
      }
    } catch (err) {
      console.log(err);
      res.send({
        status: 500,
        message: "Something went wrong",
      });
    }
    //res.send({ message: "Welcome to FER Backend" });
  });

  app.post("/delete-appointment", async (req, res, next) => {
    try {
      let connection = await databaseFunctions.connectToDB();
      if (!connection || connection == undefined) {
        console.log("Database connection Failed");
        connection = await databaseFunctions.connectToDB();
        console.log("Database connection Established", connection);
        if (!connection || connection == undefined) {
          res.send({
            status: 500,
            message: "Something went wrong",
          });
          return;
        }
      }

      //console.log(connection)

      //console.log(req.body)

      let response = await databaseFunctions.queryAppointments(
        connection,
        "DELETE",
        req.body
      );

      if (response.message == "successfully deleted") {
        res.send({
          conferenceId: response.data,
          conferenceUrl: constants.baseURL + response.data,
          conferenceDetails: "Meeting Deleted",
        });
        return;
      } else {
        res.send({
          status: 500,
          message: "Something went wrong",
        });
        return;
      }
    } catch (err) {
      console.log(err);
      res.send({
        status: 500,
        message: "Something went wrong",
      });
    }
    //res.send({ message: "Welcome to FER Backend" });
  });

  app.post("/get-sentiment", async (req, res, next) => {
    try {
      //console.log(req.body)

      const client = new TextAnalyticsClient(
        constants.AILanguageServiceEndPoint,
        new AzureKeyCredential(constants.AILanguageServiceKey)
      );

      const documents = [req.body.data];

      const results = await client.analyzeSentiment(documents);

      for (const result of results) {
        if (result.error === undefined) {
          //console.log(result)
          //console.log("Overall sentiment:", result.sentiment);
          //console.log("Scores:", result.confidenceScores);
          res.send({
            aggregate_sentiment: result.confidenceScores,
            overall_sentiment: result.sentiment,
          });
          return;
        } else {
          console.error("Encountered an error:", result.error);
          res.send({
            status: 500,
            message: "Something went wrong",
          });
        }
      }
    } catch (err) {
      console.log(err);
      res.send({
        status: 500,
        message: "Something went wrong",
      });
    }
  });

  /*
    var userDeatils = []
    io.on("connection", (socket) => {
        socket.emit("me", socket.id)

        socket.on("room:join", (data) => {
            const { name, room, person } = data;
            if(!userDeatils[room]){
                userDeatils[room] = []
            }

            userDeatils[room].push({"id" : socket.id, "person" : person })
            socket.join(room);
            let users = io.sockets.adapter.rooms.get(room);
            //console.log(users)
            //console.log(userDeatils[room])
            io.to(room).emit("user:joined", { name, id: socket.id, users: [...users] });
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
    */

//   async function writeBlobFile(mySbMsg) {
//           var timestamp = new Date().toLocaleString("en-GB", { hour12: false });
//           const data = "\n" + timestamp + " " + mySbMsg;

//           const AZURE_STORAGE_CONNECTION_STRING = constants.AZURE_STORAGE_CONNECTION_STRING;

//           const blobServiceClient = BlobServiceClient.fromConnectionString(
//             AZURE_STORAGE_CONNECTION_STRING
//           );

//           const containerName = constants.CONTAINER_NAME;

//           const blobName = 'MeetingDetails';

//           const containerClient =
//             blobServiceClient.getContainerClient(containerName);

//           try {
//             const existingAppendBlobClient =
//               containerClient.getAppendBlobClient(blobName);
//             await existingAppendBlobClient.appendBlock(data, data.length);
//             return;
//           } catch (err) {
//             console.log('370-->',mySbMsg);
//             console.log('371-->',err);
//             const existingAppendBlobClient =
//               containerClient.getAppendBlobClient(blobName);
//             await existingAppendBlobClient.create();
//             await existingAppendBlobClient.appendBlock(data, data.length);
//             return;
//           }
        
      
//   }

    function writeBlobFile(msg,data){
      data = JSON.parse(JSON.stringify(data))
      let blobLink = '';
        const AZURE_STORAGE_CONNECTION_STRING = constants.AZURE_STORAGE_CONNECTION_STRING;

          const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

          const containerName = constants.CONTAINER_NAME;

          const containerClient = blobServiceClient.getContainerClient(containerName);

          var date = new Date()
          const fileName = 'meeting-detail'+date+'.txt';
          // const textBuffer = Buffer.from(data.history, 'text');
          // console.log('397-->',textBuffer);
          try{
            const blockBlobClient = containerClient.getBlockBlobClient(`meeting-details${date}`)
          const uploadBlobResponse = blockBlobClient.upload(
            data.history,
            data.history.length
          );
          console.log('404-->',blockBlobClient.url);
          if(uploadBlobResponse){
            console.log("File uploaded");
          } else {
            console.log("File not uploaded");
          }
          var blobClient = containerClient.getBlobClient(`meeting-details${date}`);
          
          var url = blobClient.generateSasUrl({
            permissions: BlobSASPermissions.parse('r'),
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + 5 * 60 * 1000),
            protocol: SASProtocol.HttpsAndHttp
          });
          const promiseObject = Promise.resolve(url);
          promiseObject.then(async url => {
            // console.log('411-->',url);
            let body ={
              "meetingURL": "https://magiccx.azurewebsites.net/"+data.roomID,
              "summarize": data.msg,
              "recordLink" :"https://www.demo.com/recording/",
              "fullConversationLink" : url,
              "sentimentAnalysis" : data.sentiment
          }
            blobLink = url;
            console.log('423-->',body);
            
            const res = await axios.post("https://magiccxhs.azurewebsites.net/update-ticket",body)
            console.log('426-->',res.data);
            if(res.status==200){
              console.log("Updated Successfully");
            } else{
              console.log("Something went wrong");
            }
          }).catch(error => {
            console.error(error);
          });
        } catch (err){
            console.log('442--',err);
        }
        
    }
    function writeBlobMediaFile(filePath){
      console.log(constants.AZURE_STORAGE_CONNECTION_STRING);
      const AZURE_STORAGE_CONNECTION_STRING = constants.AZURE_STORAGE_CONNECTION_STRING;

        const blobServiceClient = BlobServiceClient.fromConnectionString(
          AZURE_STORAGE_CONNECTION_STRING
        );
        const containerName = constants.CONTAINER_NAME;
        const containerClient = blobServiceClient.getContainerClient('video-recordings');
        const blockBlobClient = containerClient.getBlockBlobClient('meeting-details')
        try{
        const uploadBlobResponse = blockBlobClient.uploadFile(
          filePath
        );
        if(uploadBlobResponse){
          console.log("File uploaded");
        } else {
          console.log("File not uploaded");
        }
        var blobClient = containerClient.getBlobClient('meeting-details');
        var url = blobClient.generateSasUrl({
          permissions: BlobSASPermissions.parse('r'),
          startsOn: new Date(),
          expiresOn: new Date(new Date().valueOf() + 5 * 60 * 1000),
          protocol: SASProtocol.HttpsAndHttp
        });
        const promiseObject = Promise.resolve(url);
        promiseObject.then(url => {
          console.log('448-->',url);
        }).catch(error => {
          console.error(error);
        });
      } catch (err){
          console.log(err);
      }
  
  }

  const users = {};

  const socketToRoom = {};

  io.on("connection", (socket) => {
    socket.on("join room", (data) => {
      // console.log(socket.id,data.roomID);
      let { roomID, email, person } = data;
      if (users[roomID]) {
        const length = users[roomID].length;
        if (length === 4) {
          socket.emit("room full");
          return;
        }
        //users[roomID].push(socket.id);
        users[roomID].push({
          id: socket.id,
          email: email,
          role: person,
          audio: true,
          video: true,
        });
      } else {
        //users[roomID] = [socket.id];
        users[roomID] = [
          {
            id: socket.id,
            email: email,
            role: person,
            audio: true,
            video: true,
          },
        ];
      }
      socketToRoom[socket.id] = roomID;
      socket.join(roomID);
      // console.log(`375--> ${socket.id}, ${person}`);
      //const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
      const usersInThisRoom = users[roomID].filter(
        (obj) => obj.id !== socket.id
      );
      // console.log(usersInThisRoom)
      socket.emit("all users", usersInThisRoom);
    });

    socket.on("mute:me", (data) => {
      // var id = users[data.roomID].find((obj) => obj.id === socket.id);
      if(users[data.roomID]){
      users[data.roomID].find((obj) => obj.id === socket.id).audio = false;
      }
      socket.to(data.roomID).emit("mute:user", { person: data.person, sentiment: data.sentiment });
    });

    socket.on("unmute:me", (data) => {
      socket.to(data.roomID).emit("unmute:user", { person: data.person });
    });

    socket.on("sending signal", (payload) => {
      //console.log(payload)
      io.to(payload.userToSignal).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,
        role: payload.person,
      });
    });

    socket.on("returning signal", (payload) => {
      io.to(payload.callerID).emit("receiving returned signal", {
        signal: payload.signal,
        id: socket.id,
        role: payload.role,
      });
    });
    try{
    socket.on("sendMSG", (data) => {
      // console.log(`532--> ${JSON.stringify(data)}`);
      io.in(data.to).emit("sendMSGToSalesmen", {
        to: data.to,
        message: data.message,
        time: data.time,
        userType: data.person,
        sentiment: data.sentiment,
        email: data.email
      });
      // console.log("Sent")
    });
    }catch(e){
      console.log('570-->',e);
    }

    socket.on("hide:me", (data) => {
      // console.log(`413--> ${JSON.stringify(data)}`);
      socket
        .to(data.roomID)
        .emit("hide:user", { person: data.role, id: socket.id });
    });

    socket.on("show:me", (data) => {
      // console.log(`413--> ${JSON.stringify(data)}`);
      socket
        .to(data.roomID)
        .emit("show:user", { person: data.role, id: socket.id });
    });

    socket.on("disconnectUser", async (data) => {
      const roomID = socketToRoom[socket.id];
      let room = users[roomID];
      if (room) {
        room = room.filter((obj) => obj.id !== socket.id);
        // console.log(room)
        users[roomID] = room;
      }
      if (data.msg !== "") {
        // fs.writeFileSync('MeetingDetails.txt',data.msg)
        writeBlobFile(data.msg);
      }
      //io.sockets.socket(socket.id).disconnect();
      //io.sockets.connected[socket.id].disconnect();
      socket.to(data.roomId).emit("disconnected",{id: socket.id, role: data.person});
      socket.leave(room);

      // Today's code
      // delete socketToRoom[data.id];
      // socket.broadcast.to(data.roomID).emit("disconnect:user",{userId: data.id});
      // socket.leave(data.roomID);
    });

    socket.on("salesperson-disconnected",(data)=>{
        // writeBlobFile(data.msg,data);        
        socket.to(data.roomID).emit("sp-disconnect",{roomId: data.roomID, id: data.id})
    });

    socket.on("upload-meeting",(data)=>{
      writeBlobMediaFile(data)
    });

    socket.on("disconnect",(reason)=>{
      let room = socketToRoom[socket.id];
      if(room){
        var user = users[room];
        let role = user.find(data=>data.id === socket.id);
        socket.to(room).emit("leave:room",role);
      }
    });

  });

  server.listen(port, () => {
    console.log("Express server is running on localhost:" + port);
  });
})();
// </disable>
