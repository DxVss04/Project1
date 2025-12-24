import express from "express";
import {
  initData,
  searchHousehold,
  getAllHouseholds,
  updateStatus,
  searchBySituation,
  searchByMember,
} from "../controllers/reliefController.js";

const router = express.Router();

router.get("/init", initData);
router.get("/search", searchHousehold);
router.get("/all", getAllHouseholds);
router.post("/update", updateStatus);
router.get("/search-by-situation", searchBySituation);
router.get("/search-member", searchByMember);

export default router;
