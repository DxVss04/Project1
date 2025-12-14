const API_URL = "http://localhost:3000/api";
let CACHE_DATA = []; // Lưu dữ liệu tạm để lọc nhanh

// Khởi chạy khi mở trang
window.onload = async () => {
  try {
    await fetch(`${API_URL}/init`); // Báo backend nạp cây BK-Tree
    await loadAllData();
  } catch (err) {
    alert("Không kết nối được Server Backend!");
  }
};

// Hàm lấy tất cả dữ liệu
async function loadAllData() {
  const res = await fetch(`${API_URL}/all`);
  CACHE_DATA = await res.json();
  updateStats();
}

function updateStats() {
  const total = CACHE_DATA.length;
  const done = CACHE_DATA.filter((x) => x.isSupported).length;
  document.getElementById(
    "stats"
  ).innerHTML = `Tổng: <b>${total}</b> hộ | Đã hỗ trợ: <b>${done}</b> | Chưa: <b>${
    total - done
  }</b>`;
}

// Chuyển đổi chế độ xem
function switchMode(mode) {
  document.getElementById("searchBox").style.display =
    mode === "search" ? "block" : "none";
  document.getElementById("filterBox").style.display =
    mode === "list" ? "flex" : "none";
  document.getElementById("results").innerHTML = "";
  if (mode === "list") render(CACHE_DATA);
}

// Tìm kiếm
async function doSearch() {
  const query = document.getElementById("inpSearch").value;
  if (!query) return alert("Vui lòng nhập tên!");

  const res = await fetch(`${API_URL}/search?query=${query}`);
  const data = await res.json();
  render(data);
}

// Lọc trạng thái (ở chế độ danh sách)
function filterStatus(status) {
  const filtered = CACHE_DATA.filter((x) => x.isSupported === status);
  render(filtered);
}

// Cập nhật trạng thái (Ghi xuống server)
async function toggleStatus(id, currentStatus) {
  if (!confirm("Xác nhận đổi trạng thái?")) return;

  const res = await fetch(`${API_URL}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, isSupported: !currentStatus }),
  });

  if (res.ok) {
    await loadAllData(); // Tải lại dữ liệu mới nhất
    // Nếu đang ở màn hình search thì search lại để cập nhật view
    if (document.getElementById("searchBox").style.display === "block")
      doSearch();
    else render(CACHE_DATA); // Nếu ở list thì render lại list
  } else {
    alert("Lỗi cập nhật!");
  }
}

// Hàm vẽ giao diện
function render(list) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML =
      '<p style="text-align:center; width:100%">Không có dữ liệu.</p>';
    return;
  }

  list.forEach((hh) => {
    const div = document.createElement("div");
    div.className = `card ${hh.isSupported ? "supported" : "unsupported"}`;
    div.innerHTML = `
            <h3>${hh.name}</h3>
            <p>🏠 ${hh.address}</p>
            <p>👨‍👩‍👧‍👦 ${hh.members} thành viên - ${hh.status}</p>
            <span class="status-badge ${
              hh.isSupported ? "bg-green" : "bg-red"
            }" 
                  onclick="toggleStatus('${hh.id}', ${hh.isSupported})">
                ${hh.isSupported ? "Đã Nhận Hỗ Trợ" : "Chưa Nhận Hỗ Trợ"}
            </span>
        `;
    container.appendChild(div);
  });
}
