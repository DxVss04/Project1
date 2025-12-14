import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import BKTree from "../utils/bkTree.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "../data/data.json");

let bkTree = new BKTree();

// Hàm đọc/ghi dữ liệu
const loadData = () => {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
};
const saveData = (data) =>
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

// API 1: Khởi tạo
export const initData = (req, res) => {
  try {
    const households = loadData();
    bkTree = new BKTree();
    households.forEach((hh) => bkTree.add(hh));
    res.json({ message: "Đã nạp dữ liệu!", count: households.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// API 2: Tìm kiếm
export const searchHousehold = (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Thiếu query" });
  const results = bkTree.search(query, 3);
  res.json(results);
};

// API 3: Lấy tất cả
export const getAllHouseholds = (req, res) => {
  try {
    res.json(loadData());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// API 4: Cập nhật trạng thái
export const updateStatus = (req, res) => {
  const { id, isSupported } = req.body;
  try {
    let households = loadData();
    const index = households.findIndex((h) => h.id === id);
    if (index === -1)
      return res.status(404).json({ error: "Không tìm thấy ID" });

    households[index].isSupported = isSupported;
    saveData(households);

    // Re-build tree
    bkTree = new BKTree();
    households.forEach((hh) => bkTree.add(hh));

    res.json({ message: "Thành công", data: households[index] });
  } catch (e) {
    res.status(500).json({ error: "Lỗi ghi file" });
  }
};
