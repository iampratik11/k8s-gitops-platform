const express = require("express");
const client = require("prom-client");

const app = express();

const PORT = process.env.PORT || 8080;
const VERSION = process.env.VERSION || "1.0.0";
const SERVICE_NAME = "payment-service";

app.use(express.json());

/*
 * Prometheus metrics
 */

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

/*
 * HTTP request metrics middleware
 */

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

/*
 * Root endpoint
 */

app.get("/", (req, res) => {
  res.json({
    service: SERVICE_NAME,
    message: "Payment Service is running",
    version: VERSION
  });
});

/*
 * Health check
 */

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP"
  });
});

/*
 * Readiness check
 */

app.get("/ready", (req, res) => {
  res.status(200).json({
    status: "READY"
  });
});

/*
 * Version endpoint
 */

app.get("/version", (req, res) => {
  res.json({
    service: SERVICE_NAME,
    version: VERSION
  });
});

/*
 * Payment endpoint
 */

app.get("/payments", (req, res) => {
  res.json({
    payments: [
      {
        id: 501,
        orderId: 101,
        amount: 75000,
        currency: "INR",
        status: "SUCCESS"
      },
      {
        id: 502,
        orderId: 102,
        amount: 1500,
        currency: "INR",
        status: "SUCCESS"
      }
    ]
  });
});

/*
 * Prometheus metrics endpoint
 */

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);

  res.end(await register.metrics());
});

/*
 * Start server
 */

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} running on port ${PORT}`);
  console.log(`Version: ${VERSION}`);
});
