const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
const MONGO_URI = config.mongoose.url;
const OPTIONS = config.mongoose.options;
const PORT = config.port;
let server;

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port

const mongooseConnection = async (app) => {
    try {
        await mongoose.connect(MONGO_URI,OPTIONS);
        console.log(`Connected to database`);
        app.listen(PORT, () => console.log(`Listening on PORT ${PORT}...`));
    } catch (error) {
        console.log(`Connected failed\n ${error}`);
    }
}

mongooseConnection(app);
