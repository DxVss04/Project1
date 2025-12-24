import express from "express";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes); // ✅ Dùng routes

app.listen(PORT, () => {
  console.log(`Backend running at: http://localhost:${PORT}`);
});
