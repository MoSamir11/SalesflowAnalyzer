const { Connection, Request } = require("tedious");
require('dotenv').config();
const constants = require('./constants.json')
const mssql = require('mssql');
const { DefaultAzureCredential } = require("@azure/identity");
const { v4: uuidv4 } = require('uuid');
const moment = require('moment')

// Create connection to database
const connectToDB = async function(){
  try{
    const credential = new DefaultAzureCredential();
    const accessToken = await credential.getToken("https://database.windows.net/.default");
    
    const config = {
      server: constants.server,
      authentication: {
          type: 'azure-active-directory-access-token',
          options: {
              token: accessToken.token
          }
      },
      options: {
          database: constants.database,
          encrypt: true,
          port: 1433
      },
      pool: {
        max: 20,
        min: 0,
        idleTimeoutMillis: 30000
      }
    };

    const conn = new mssql.ConnectionPool(config);
    const connection = await conn.connect()
    return connection
  }
  catch(err){
    console.log(err)
    return undefined
  }
}

const closeDBConnection = async function(conn){
  if(conn["_connected"]){
    conn.close()
  }
}

async function queryAppointments(conn, dbOperation, body) {
  if(dbOperation == "INSERT"){
    try{
      const RoomCode = `${uuidv4()}`;

      let sql  = "INSERT INTO [sa].[Appointments] ([PortalId], [UserId], [UserEmail], [Topic], [Source], [StartTime], [EndTime], [MeetingRoomCode], [CreatedBy], [CreatedOn], [IsActive]) VALUES ('"+body.portalId+"','"+body.userId+"', '"+((body.userEmail!=null)?body.userEmail.replaceAll("'", "''"):null)+"','"+((body.topic!=null)?body.topic.replaceAll("'", "''"):null)+"', '"+((body.source!=null)?body.source.replaceAll("'", "''"):null)+"','"+body.startTime+"', '"+body.endTime+"','"+((RoomCode!=null)?RoomCode.replaceAll("'", "''"):null)+"', "+body.userId+", GETDATE(), 'Y')"
      //console.log("sql",sql)
      try{
          const data = await conn.query(sql)
          return {"message" : "successfully inserted", "data" : RoomCode}
      }
      catch(err2){
          console.log(err2)
          return {"message" : "something went wrong"}
      }
    }
    catch(err){
      console.log(err)
      return {"message" : "something went wrong"}
    }
  }
  else if(dbOperation == "UPDATE"){
    let sql  = "UPDATE [sa].[Appointments] SET PortalId = '" + body.portalId + "', UserId = '" + body.userId + "', userEmail = '" + body.userEmail + "', Topic = '" + body.topic + "', StartTime = '" + body.startTime + "', EndTime = '" + body.endTime + "', LastModifiedBy = "+body.userId+", LastModifiedDate = GETDATE() where MeetingRoomCode = '"+body.conferenceId+"'"
      //console.log("sql",sql)
      try{
          const data = await conn.query(sql)
          return {"message" : "successfully updated", "data" : body.conferenceId}
      }
      catch(err2){
          console.log(err2)
          return {"message" : "something went wrong"}
      }
  }
  else if(dbOperation == "DELETE"){
    let sql  = "UPDATE [sa].[Appointments] SET IsActive = 'N', LastModifiedDate = GETDATE() where MeetingRoomCode = '"+body.conferenceId+"'"
      //console.log("sql",sql)
      try{
          const data = await conn.query(sql)
          return {"message" : "successfully deleted", "data" : body.conferenceId}
      }
      catch(err2){
          console.log(err2)
          return {"message" : "something went wrong"}
      }
  }
  else if(dbOperation == "QUERY"){
    try{
      let sql_select_query = "select * from [sa].[Appointments]"
      
      const data = await conn.query(sql_select_query)
      //console.log("length", data.recordset.length)
      if(data.recordset.length == 0){
          return []
      }
      else{
        return data.recordset
      }
    }
    catch(err2){
        console.log(err2)
        return []
    }
  }
}



module.exports = {
  queryAppointments, connectToDB, closeDBConnection
}