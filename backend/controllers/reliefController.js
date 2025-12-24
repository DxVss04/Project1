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

// API 2: Tìm kiếm tên (Fuzzy Search)
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

// API 5: Tìm kiếm theo hoàn cảnh - ✅ SỬA LẠI HOÀN TOÀN
export const searchBySituation = (req, res) => {
  const { situation } = req.query; // ✅ Nhận "situation" từ URL

  console.log("=== DEBUG searchBySituation ===");
  console.log("Nhận tham số situation:", situation);

  try {
    const households = loadData();

    if (!situation) {
      return res.status(400).json({ error: "Thiếu tham số situation" });
    }

    // ✅ So sánh với h.status trong data
    const results = households.filter((h) => {
      if (!h.status) return false;
      const match =
        h.status.trim().toLowerCase() === situation.trim().toLowerCase();
      console.log(
        `${h.name}: status="${h.status}" vs situation="${situation}" => ${match}`
      );
      return match;
    });

    console.log(`Tìm thấy ${results.length} kết quả`);

    res.json({
      query: situation,
      count: results.length,
      results,
    });
  } catch (e) {
    console.error("Lỗi:", e);
    res.status(500).json({ error: e.message });
  }
};

// API 6: Tìm kiếm thành viên
export const searchByMember = (req, res) => {
  const { minAge, maxAge, gender } = req.query;

  console.log("=== DEBUG searchByMember ===");
  console.log("Params:", { minAge, maxAge, gender });

  try {
    const households = loadData();

    const results = households.filter((h) => {
      if (!h.members || !Array.isArray(h.members)) return false;

      return h.members.some((m) => {
        let match = true;

        if (minAge) match = match && m.age >= Number(minAge);
        if (maxAge) match = match && m.age <= Number(maxAge);

        if (gender)
          match =
            match &&
            m.gender &&
            m.gender.toLowerCase() === gender.toLowerCase();

        return match;
      });
    });

    console.log(`Tìm thấy ${results.length} hộ`);

    res.json({ count: results.length, results });
  } catch (e) {
    console.error("Lỗi:", e);
    res.status(500).json({ error: e.message });
  }
};
