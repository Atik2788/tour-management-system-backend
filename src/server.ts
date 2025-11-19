/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

// let abc

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL as string)
    console.log("Connected to MongoDB");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on port ${envVars.PORT} in ${envVars.NODE_ENV} mode`);
    });


  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
}


(async()=>{
    await startServer();
    await seedSuperAdmin()
})();



process.on("SIGTERM", () =>{
    console.log("SIGTERM signal received, shutting down server...");

    if(server){
        server.close(() =>{
            process.exit(1);
        });
    };

    process.exit(1);    
})


process.on("SIGINT", () =>{
    console.log("SIGINT signal received, shutting down server...");

    if(server){
        server.close(() =>{
            process.exit(1);
        });
    };

    process.exit(1);    
})


process.on("unhandledRejection", (error) =>{
    console.log("Unhandled Rejection detected, shutting down server...", error);

    if(server){
        server.close(() =>{
            process.exit(1);
        });
    };

    process.exit(1);    

})

process.on("uncaughtException", (error) =>{
    console.log("Uncaught Exception detected, shutting down server...", error);

    if(server){
        server.close(() =>{
            process.exit(1);
        });
    };

    process.exit(1);    

})


// Promise.reject(new Error("Unhandled Rejection Example"));