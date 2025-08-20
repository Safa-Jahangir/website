const API_BASE = "http://127.0.0.1:5000";

// Load all orders
async function loadOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const orders = await res.json();

    const tbody = document.querySelector("#orders-table tbody");
    tbody.innerHTML = "";

    orders.forEach(o => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${o.id ?? "-"}</td>
        <td>${o.customerName ?? "-"}</td>
        <td>${safeParseItems(o.items)}</td>
        <td>${o.paymentMethod ?? "-"}</td>
        <td>
          ${o.status ?? "Pending"}
          ${o.status !== "Delivered" ? 
            `<button class="btn" onclick="updateStatus(${o.id}, 'Delivered')">✔ Deliver</button>` 
            : ""}
        </td>
      `;

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading orders:", err);
    alert("❌ Failed to load orders. Check backend.");
  }
}

// Safely parse items JSON
function safeParseItems(itemsJson) {
  try {
    const items = JSON.parse(itemsJson);
    return items.map(i => `${i.name} ($${i.price})`).join(", ");
  } catch {
    return itemsJson;
  }
}

// Update order status
async function updateStatus(orderId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await loadOrders(); // refresh table
  } catch (err) {
    console.error("Update status failed:", err);
    alert(`❌ Update failed: ${err.message}`);
  }
}

// Load orders on page load
loadOrders();
