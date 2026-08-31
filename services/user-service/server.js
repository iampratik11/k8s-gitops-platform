const express = require("express");
const client = require("prom-client");

const app = express();

const PORT = process.env.PORT || 8080;
const VERSION = process.env.VERSION || "1.0.0";
const SERVICE_NAME = "user-service";

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
 * Request counter middleware
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
    message: "User Service is running",
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
 * Example user endpoint
 */
app.get("/users", (req, res) => {
  res.json({
    users: [
      {
        id: 1,
        name: "Pratik"
      },
      {
        id: 2,
        name: "Demo User"
      }
    ]
  });
});

/*
 * Prometheus metrics
 */
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);

  res.end(await register.metrics());
});

/*
 * Start application
 */
app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} running on port ${PORT}`);
  console.log(`Version: ${VERSION}`);
});
