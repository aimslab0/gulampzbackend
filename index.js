const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("ws");
const cors = require("cors");
require("dotenv").config();

const Userrouter = require("./Routes/UserRoutes");
const Drawrouter = require("./Routes/DrawRoutes");
const Paymentrouter = require("./Routes/PaymentRoutes");
const Salerouter = require("./Routes/SaleRoutes");
const Reportrouter = require("./Routes/ReportsRoutes");
const { getDrawById } = require("./Controllers/Draw");
const { AuthenticateUser } = require("./utils");

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

app.use(express.json());
app.use(cors({ origin: '*' }));

app.use("/user", Userrouter);
app.use("/draw", Drawrouter);
app.use("/payment", Paymentrouter);
app.use("/sale", Salerouter);
app.use("/report", Reportrouter);

app.get("/", (req, res) => {
    res.json({ "Message": "Hello" });
});

mongoose.connect("mongodb+srv://i211130:AllahG92@cluster0.t4fkgpc.mongodb.net/prize")
    .then(() => {
        console.log("Connected");
    })
    .catch(err => {
        console.log(err);
    });
// WebSocket connection handler
wss.on("connection", (ws) => {
    console.log("New client connected");

    ws.on("message", async (message) => {
        try {
            const { token, drawId } = JSON.parse(message);

            // Authenticate user
            const user = await AuthenticateUser(token);
            if (!user) {
                ws.send(JSON.stringify({ status: "error", message: "Authentication failed" }));
                return;
            }

            // Fetch draw by ID
            const draw = await getDrawById(drawId);
            if (!draw) {
                ws.send(JSON.stringify({ status: "error", message: "Draw not found" }));
                return;
            }

            ws.send(JSON.stringify({ status: "success", data: draw }));

        } catch (error) {
            console.error("Error processing message:", error);
            ws.send(JSON.stringify({ status: "error", message: "An error occurred while processing your request" }));
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    // Handle ping/pong to keep connection alive
    ws.isAlive = true;
    ws.on('pong', () => ws.isAlive = true);

    const interval = setInterval(() => {
        wss.clients.forEach(client => {
            if (!client.isAlive) return client.terminate();

            client.isAlive = false;
            client.ping();
        });
    }, 30000);

    ws.on('close', () => clearInterval(interval));
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
