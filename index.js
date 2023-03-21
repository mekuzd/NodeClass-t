const express = require("express");
const app = express();
const cors = require("cors");
const moongoose = require("mongoose");
const { MONGO_URL, PORT } = require("./src/Config/config");
const userRoutes = require("./src/Routes/user.routes");
const Error404 = require("./src/middleware/error404");
const auth = require("./src/middleware/auth");

//middleware
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(express.json());

//routes
app.use("/users", userRoutes);
// testingauth

app.get("/admin", [auth], (req, res) => {
  res.status(200).json(req.user);
});

app.use(Error404); //this middleware has to be after our route same as app.all

//db connection
moongoose
  .connect(MONGO_URL)
  .then((res) => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log("not connected");
  });

//listening port
app.listen(PORT, () => {
  console.log("app  is running on port 9000");
});

// app.use((req, res, next) => {   //this can also be done to avoid cors policy restriction
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:4000");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
//   next();
// });

// function CheckNumber(req, res, next) {
//   if (req.body.Fn < 20) {
//     res.status(406).json({ message: "Fn is too small to carry out operation" });
//     return;
//   }
//   next();
// }

// app.post("/calc", [CheckNumber], (req, res) => {
//   const { Fn, Sn, operator } = req.body;
//   function checkOperator() {
//     if (operator === "+") {
//       return Fn + Sn;
//     } else if (operator === "-") {
//       return Fn - Sn;
//     }
//   }
//   res.status(200).json({ message: `all done ${checkOperator()}` });
// });
