const mongoose = require('mongoose');
const express = require("express");
const redis = require('redis');
const session = require('express-session');
const connectRedis = require('connect-redis');
const cors = require("cors");
let RedisStore = require("connect-redis")(session);


const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_IP,
    MONGO_PORT,
    REDIS_URL,
    REDIS_PORT,
    SESSION_SECRET,
} = require("./config/config");

let redisClient = redis.createClient({
    legacyMode: true,
    url: `redis://${REDIS_URL}:${REDIS_PORT}`
});
redisClient.connect().catch(console.error);






const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
    mongoose
        .connect(mongoURL)
        .then(() => console.log("Succesfully connected to DB"))
        .catch((e) => {
            console.log(e);
            setTimeout(connectWithRetry, 5000);

        });
};

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}))
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: SESSION_SECRET,
      
        cookie: {
            resave: false,
            saveUninitialized: true,
            secure: false,
            httpOnly: true,
            maxAge: 30000,
        }
    })
);

app.use(express.json());

app.get("/api/v1", (req, res) => {
    
    res.send("<h2> Hi there !!!!</h2>");
    console.log("yeah it ran");
});


app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`));