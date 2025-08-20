import express from "express";

const app = express();



app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the PH Tour Management System API"
})

});


export default app;
