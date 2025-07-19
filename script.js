/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

// This script enables product selection and updates the UI for selected products.

// Store all products and selected products
let allProducts = [];
let selectedProducts = [];

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  allProducts = data.products;
  showProducts(allProducts);
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
    </div>
  `
    )
    .join("");
}

// Show products in the grid, filtered by category if needed
function showProducts(products) {
  productsContainer.innerHTML = "";
  products.forEach((product) => {
    // Create product card
    const card = document.createElement("div");
    card.className = "product-card";
    // Highlight if selected
    if (selectedProducts.some((p) => p.id === product.id)) {
      card.classList.add("selected");
    }

    // Card content with a description toggle button and description area
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-name">${product.name}</div>
      <div class="product-category">${capitalize(product.category)}</div>
      <div class="product-brand">${product.brand}</div>
      <button class="desc-btn" aria-expanded="false">Show Description</button>
      <div class="product-desc" hidden>${product.description}</div>
    `;

    // Click to select/unselect (but not when clicking the description button)
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("desc-btn")) {
        toggleProduct(product);
      }
    });

    // Description toggle logic
    const descBtn = card.querySelector(".desc-btn");
    const descDiv = card.querySelector(".product-desc");
    descBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent card selection
      const isOpen = !descDiv.hasAttribute("hidden");
      if (isOpen) {
        descDiv.setAttribute("hidden", "");
        descBtn.textContent = "Show Description";
        descBtn.setAttribute("aria-expanded", "false");
      } else {
        descDiv.removeAttribute("hidden");
        descBtn.textContent = "Hide Description";
        descBtn.setAttribute("aria-expanded", "true");
      }
    });

    productsContainer.appendChild(card);
  });
}

// Capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Add or remove product from selection
function toggleProduct(product) {
  const index = selectedProducts.findIndex((p) => p.id === product.id);
  if (index === -1) {
    selectedProducts.push(product);
  } else {
    selectedProducts.splice(index, 1);
  }
  showProducts(getFilteredProducts());
  updateSelectedProducts();
}

// Update the Selected Products section
function updateSelectedProducts() {
  selectedProductsList.innerHTML = "";
  selectedProducts.forEach((product) => {
    const item = document.createElement("div");
    item.className = "selected-product-item";
    item.innerHTML = `
      <span>${product.name}</span>
      <button class="remove-btn" title="Remove">&times;</button>
    `;
    // Remove button
    item.querySelector(".remove-btn").addEventListener("click", () => {
      toggleProduct(product);
    });
    selectedProductsList.appendChild(item);
  });
}

// Filter products by category
function getFilteredProducts() {
  const value = categoryFilter.value;
  if (!value) return allProducts;
  return allProducts.filter((p) => p.category === value);
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});

// Get reference to the Generate Routine button
const generateBtn = document.getElementById("generateRoutine");

// Listen for Generate Routine button click
generateBtn.addEventListener("click", async () => {
  // If no products are selected, show a message and return
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML = `<div class="chat-message bot">Please select at least one product to generate a routine.</div>`;
    return;
  }

  // Show loading message in chat window
  chatWindow.innerHTML = `<div class="chat-message bot">Generating your personalized routine...</div>`;

  // Prepare the messages array for OpenAI API
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful skincare and beauty advisor. Create a step-by-step routine using only the provided products. Be clear, friendly, and concise. Use the product names and categories. If a product is not for skin, hair, or makeup, skip it.",
    },
    {
      role: "user",
      content: `Here are my selected products:\n${JSON.stringify(
        selectedProducts.map((p) => ({
          name: p.name,
          brand: p.brand,
          category: p.category,
          description: p.description,
        })),
        null,
        2
      )}\nPlease generate a personalized routine using only these products.`,
    },
  ];

  try {
    // Call the OpenAI API using fetch and async/await
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    // Check for a valid response and display it
    if (
      data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      chatWindow.innerHTML = `
        <div class="chat-message user">Generate a routine for my selected products.</div>
        <div class="chat-message bot">${data.choices[0].message.content.replace(
          /\n/g,
          "<br>"
        )}</div>
      `;
    } else {
      chatWindow.innerHTML = `<div class="chat-message bot">Sorry, I couldn't generate a routine. Please try again.</div>`;
    }
  } catch (error) {
    chatWindow.innerHTML = `<div class="chat-message bot">Error: Unable to connect to OpenAI API.</div>`;
  }
});

// Initial load
loadProducts();
