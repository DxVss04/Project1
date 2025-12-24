const API_URL = "http://localhost:3000/api";
let CACHE_DATA = [];

window.onload = async () => {
  try {
    await fetch(`${API_URL}/init`);
    await loadAllData();
  } catch (err) {
    alert("Không kết nối được Server Backend!");
    console.error(err);
  }
};

async function loadAllData() {
  try {
    const res = await fetch(`${API_URL}/all`);
    CACHE_DATA = await res.json();
    render(CACHE_DATA);
    updateStats();
  } catch (err) {
    console.error("Lỗi tải dữ liệu:", err);
  }
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

function switchMode(mode) {
  document.getElementById("searchBox").style.display =
    mode === "search" ? "flex" : "none";
  document.getElementById("filterBox").style.display =
    mode === "list" ? "flex" : "none";

  if (mode === "list") render(CACHE_DATA);
  else document.getElementById("results").innerHTML = "";
}

async function doSearch() {
  const query = document.getElementById("inpSearch").value.trim();
  if (!query) return alert("Vui lòng nhập tên!");
  try {
    const res = await fetch(
      `${API_URL}/search?query=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    render(data);
  } catch (err) {
    console.error("Lỗi tìm kiếm:", err);
    alert("Lỗi kết nối Server!");
  }
}

function filterStatus(status) {
  const filtered = CACHE_DATA.filter((x) => x.isSupported === status);
  render(filtered);
}

async function toggleStatus(id, currentStatus) {
  if (!confirm("Xác nhận đổi trạng thái?")) return;
  try {
    const res = await fetch(`${API_URL}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isSupported: !currentStatus }),
    });

    if (res.ok) {
      await loadAllData();
    } else {
      alert("Lỗi cập nhật!");
    }
  } catch (err) {
    console.error("Lỗi cập nhật:", err);
    alert("Lỗi kết nối Server!");
  }
}

function render(list) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!list || list.length === 0) {
    container.innerHTML =
      '<p style="text-align:center; width:100%; padding:40px; background:white; border-radius:8px;">Không có dữ liệu.</p>';
    return;
  }

  list.forEach((hh) => {
    const div = document.createElement("div");
    div.className = `card ${hh.isSupported ? "supported" : "unsupported"}`;

    const memberCount = Array.isArray(hh.members)
      ? hh.members.length
      : hh.members;

    div.innerHTML = `
      <h3>${hh.name}</h3>
      <p>🏠 ${hh.address}</p>
      <p>👨‍👩‍👧‍👦 <b>${memberCount}</b> thành viên - ${hh.status || hh.situation}</p>
      <span class="status-badge ${hh.isSupported ? "bg-green" : "bg-red"}" 
            onclick="toggleStatus('${hh.id}', ${hh.isSupported})">
        ${hh.isSupported ? "✓ Đã Nhận Hỗ Trợ" : "✗ Chưa Nhận Hỗ Trợ"}
      </span>
    `;
    container.appendChild(div);
  });
}

const searchBySituation = async () => {
  const situation = document.getElementById("situationSelect").value;
  try {
    const res = await fetch(
      `${API_URL}/search-by-situation?situation=${encodeURIComponent(
        situation
      )}`
    );
    const data = await res.json();
    render(data.results);
  } catch (e) {
    console.error(e);
    alert("Lỗi kết nối Server!");
  }
};

const searchMilitary = async () => {
  try {
    const res = await fetch(
      `${API_URL}/search-member?minAge=18&maxAge=27&gender=Nam`
    );
    const data = await res.json();
    render(data.results);
    alert(`Tìm thấy ${data.count} hộ có công dân trong độ tuổi NVQS!`);
  } catch (e) {
    console.error(e);
    alert("Lỗi kết nối Server!");
  }
};
