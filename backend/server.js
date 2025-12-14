import express from "express";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Cho phép Frontend gọi vào
app.use(express.json());

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`Backend running at: http://localhost:${PORT}`);
});
