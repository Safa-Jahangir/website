const API_BASE = `http://${location.hostname}:5000`;

// --- Create HTML element ---
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

// --- Update Cart Count Display ---
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartBtn = document.getElementById("cart-count");
  if (cartBtn) {
    cartBtn.textContent = `Cart (${cart.length})`;
  }
}

// --- Sidebar Toggle ---
const cartSidebar   = document.getElementById("cart-sidebar");
const cartOverlay   = document.getElementById("cart-overlay");
const cartToggleBtn = document.getElementById("cart-toggle");
const closeCartBtn  = document.getElementById("close-cart");
const cartItemsDiv  = document.getElementById("cart-items");
const cartTotalP    = document.getElementById("cart-total");

function openCart() {
  cartSidebar.classList.add("open");
  cartOverlay.classList.add("show");
  renderCart();
}

function closeCartSidebar() {
  cartSidebar.classList.remove("open");
  cartOverlay.classList.remove("show");
}

cartToggleBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCartSidebar);
cartOverlay.addEventListener("click", closeCartSidebar);

// --- Cart Logic ---
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  cartToggleBtn.textContent = `🛒 Cart (${totalQty})`;
}

function renderCart() {
  const cart = getCart();  // ✅ FIX: cart is now defined
  cartItemsDiv.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
  } else {
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;

      const div = document.createElement("div");
      div.classList.add("cart-item");
      div.innerHTML = `
        <div class="cart-item-header">
          <strong>${item.name}</strong>
        </div>
        <div class="cart-item-controls">
          <button onclick="decreaseQty(${index})">−</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty(${index})">+</button>
          <span class="price">$${itemTotal.toFixed(2)}</span>
          <button class="remove-btn" onclick="removeItem(${index})">❌</button>
        </div>
      `;
      cartItemsDiv.appendChild(div);
    });
  }

  cartTotalP.textContent = `Total: $${total.toFixed(2)}`;
  updateCartCount();
}

// --- Quantity & Remove ---
function increaseQty(index) {
  let cart = getCart();
  cart[index].qty += 1;
  saveCart(cart);
  renderCart();
}

function decreaseQty(index) {
  let cart = getCart();
  cart[index].qty -= 1;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// --- Init ---
updateCartCount();


// --- Load Products from Server ---
async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();

    const prodGrid = document.getElementById("product-grid");
    if (!prodGrid) return;

    prodGrid.innerHTML = "";

    products.forEach(p => {
      const card = el(`
        <div class="card product-card">
          <h3>${p.name}</h3>
          <div class="price">$${p.price}</div>
          <button class="btn primary">Add to cart</button>
        </div>
      `);

      card.querySelector("button").addEventListener("click", () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = cart.find(item => item.id === p.id);
        if (existingItem) {
          existingItem.qty += 1;
        } else {
          cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        alert(`✅ Added to cart: ${p.name}`);
        updateCartCount();
      });

      prodGrid.appendChild(card);
    });

    updateCartCount(); // initial update
  } catch (err) {
    console.error("Error loading products:", err);
    alert(`❌ Could not load products: ${err.message}`);
  }
}

// --- Checkout Form Handler ---
const form = document.getElementById('checkoutForm');
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("❌ Your cart is empty.");
      return;
    }

    data.cart = cart;

    try {
      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok) {
        alert('✅ Order placed successfully!');
        localStorage.removeItem("cart"); // clear cart
        updateCartCount(); // reset count to 0
        window.location.href = '/thankyou.html';
      } else {
        throw new Error(result.message || 'Something went wrong');
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  });
}

// --- Init ---
loadProducts();

