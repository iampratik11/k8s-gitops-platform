const express = require("express");
const client = require("prom-client");

const app = express();

const PORT = process.env.PORT || 8080;
const VERSION = process.env.VERSION || "1.0.0";
const SERVICE_NAME = "order-service";

app.use(express.json());

const register = new client.Registry();

client.collectDefaultMetrics({
  register
});

const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"]
});

register.registerMetric(httpRequests);

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequests.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });
  });

  next();
});

app.get("/", (req, res) => {
  res.json({
    service: SERVICE_NAME,
    message: "Order Service is running",
    version: VERSION
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP"
  });
});

app.get("/ready", (req, res) => {
  res.status(200).json({
    status: "READY"
  });
});

app.get("/version", (req, res) => {
  res.json({
    service: SERVICE_NAME,
    version: VERSION
  });
});

app.get("/orders", (req, res) => {
  res.json({
    orders: [
      {
        id: 101,
        product: "Laptop",
        status: "CONFIRMED"
      },
      {
        id: 102,
        product: "Keyboard",
        status: "PROCESSING"
      }
    ]
  });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);

  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} running on port ${PORT}`);
  console.log(`Version: ${VERSION}`);
});
