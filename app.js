const express=require("express");
const app=express();
const ejs=require("ejs");
const cors = require('cors');
const bodyParser=require("body-parser");
const morgan=require("morgan");
const flash=require("connect-flash");
const session=require("express-session");
const passport=require("passport");
require("./module/config/passport")(passport);//配置passport

app.use(morgan("tiny"));

app.set("views","./views");
app.set("view engine","ejs");
app.use(cors());
app.use("/assets",express.static("assets"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    name:"youruniqueid",
    secret:"bulabula",
    resave:true,
    saveUninitialized:true,
    cookie:{
        maxAge:1000*60*60*24*7
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
require("./routes/route")(app,passport);


app.listen(8080);
console.log("Server is listening on 8080")