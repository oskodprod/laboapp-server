//const path = require("path");
require('dotenv').config();
const express = require("express")
const mongoose = require("mongoose")
const db = require("./db/db")
const header_middleware = require("./middlewares/header")

//const postRouter = require("./Routes/post");
const userRoutes = require("./Routes/user");
const companyRoutes = require('./Routes/company');
const fieldRoutes = require('./Routes/formfield');
const samplingRoutes = require('./Routes/sampling');
const labratRoutes = require("./Routes/labrat");
const clientRoutes = require("./Routes/client");
const recipeRoutes = require("./Routes/recipe");
const sampleRoutes = require("./Routes/sample");
const reportRoutes = require("./Routes/report");
//const profileRoutes = require("./Routes/profile");

var cors = require('cors');


const app = express()
app.use(cors({origin: '*'}));
const PORT = process.env.PORT;


app.use(express.json())
app.use(header_middleware)

//app.use("/api/posts", postRouter);
app.use("/api/user", userRoutes);
//app.use("/api/profile", profileRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/formfield", fieldRoutes);
app.use("/api/sampling", samplingRoutes);
app.use("/api/labrat", labratRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/recipe", recipeRoutes);
app.use("/api/sample", sampleRoutes);
app.use("/api/report", reportRoutes);



app.get('/api/test', (req, res) => {
    res.send('Hello World!')
  })

app.listen(PORT, (req,res) => {
    
    console.log(`app is listening to PORT ${PORT}`)
})
