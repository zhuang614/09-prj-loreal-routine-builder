// Beginner-friendly L'Oréal Routine Builder main script

// Get references to DOM elements
const categoryFilter = document.getElementById("categoryFilter");
const productSearch = document.getElementById("productSearch");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateButton = document.getElementById("generateRoutine");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Cloudflare Worker endpoint for AI API */
const WORKER_ENDPOINT = "https://loreal-routine-builder.zhuang61.workers.dev/";

// Store all products and selected products
let allProducts = [];
let selectedProducts = [];

/* Array to store conversation history */
let conversationHistory = [];

// Store the full chat history for follow-up questions
let chatHistory = [];

// Check if current language is RTL (comprehensive list for beginners)
function isRTLLanguage(language) {
  const RTL_LANGUAGES = [
    "ar",
    "he",
    "fa",
    "ur",
    "arc",
    "dv",
    "syr",
    "ps",
    "sd",
    "ug",
    "yi",
    "az",
    "ku",
    "ff",
  ];
  return RTL_LANGUAGES.includes(language);
}

// Load saved language preference
function loadSavedLanguage() {
  const savedLanguage = localStorage.getItem("selectedLanguage");
  if (savedLanguage) {
    applyLanguageDirection(savedLanguage);
  } else {
    applyLanguageDirection("en");
  }
}

// Helper function to get current direction
function getCurrentDirection() {
  return document.documentElement.getAttribute("dir") || "ltr";
}

// Helper functions
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function loadSavedProducts() {
  const savedProducts = localStorage.getItem("selectedProducts");
  if (savedProducts) {
    selectedProducts = JSON.parse(savedProducts);
  }
}

function saveProductsToStorage() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

// Load products from products.json and create category filter dynamically
async function loadProducts() {
  try {
    // Fetch products from the JSON file using async/await
    const response = await fetch("products.json");
    const data = await response.json();
    allProducts = data.products;

    // Get all unique categories from the products (for beginners to understand)
    const categories = [
      ...new Set(allProducts.map((product) => product.category)),
    ];
    console.log("Available categories in products.json:", categories);

    // Log product count for each category (helpful for debugging)
    categories.forEach((category) => {
      const count = allProducts.filter(
        (product) => product.category === category
      ).length;
      console.log(`Category "${category}" has ${count} products`);
    });

    // Create the category filter dropdown completely from product data
    createCategoryFilterOptions(categories);

    // Show initial placeholder message
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        Please select a category or search for products to get started.
      </div>
    `;
  } catch (error) {
    console.error("Error loading products:", error);
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        Error loading products. Please check your products.json file.
      </div>
    `;
  }
}

// Create category filter options completely from product data (no hardcoded HTML)
function createCategoryFilterOptions(categories) {
  // Get current language direction for proper text alignment
  const currentDir = getCurrentDirection();

  // Clear all existing options first
  categoryFilter.innerHTML = "";

  // Create "Selected Category" option first
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Selected Category";
  defaultOption.setAttribute("dir", currentDir);
  categoryFilter.appendChild(defaultOption);

  // Sort categories alphabetically for better user experience
  const sortedCategories = categories.sort();

  // Add an option for each category found in the products data
  sortedCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    // Capitalize the category name for display (beginner-friendly helper)
    option.textContent = capitalize(category);
    option.setAttribute("dir", currentDir);
    categoryFilter.appendChild(option);
  });

  console.log("Category filter created completely from products.json data");
  console.log(`Added ${sortedCategories.length} category options`);
}

// Enhanced getFilteredProducts function with better debugging
function getFilteredProducts() {
  // Get the selected category and search term
  const categoryValue = categoryFilter.value;
  const searchValue = productSearch
    ? productSearch.value.toLowerCase().trim()
    : "";

  // Debug logs to help beginners understand what's happening
  console.log(`Category filter: "${categoryValue}"`);
  console.log(`Search filter: "${searchValue}"`);
  console.log(`Total products: ${allProducts.length}`);

  // Start with all products
  let filteredProducts = allProducts;

  // Apply category filter if a category is selected
  if (categoryValue) {
    filteredProducts = filteredProducts.filter((product) => {
      const matches = product.category === categoryValue;
      if (!matches) {
        console.log(
          `Product "${product.name}" category "${product.category}" doesn't match "${categoryValue}"`
        );
      }
      return matches;
    });
    console.log(`After category filter: ${filteredProducts.length} products`);

    // If no products found, show available categories for debugging
    if (filteredProducts.length === 0) {
      const availableCategories = [
        ...new Set(allProducts.map((product) => product.category)),
      ];
      console.log("Available categories:", availableCategories);
    }
  }

  // Apply search filter if user typed something
  if (searchValue) {
    filteredProducts = filteredProducts.filter((product) => {
      // Search in product name, brand, and description (beginner-friendly approach)
      const productName = product.name.toLowerCase();
      const productBrand = product.brand ? product.brand.toLowerCase() : "";
      const productDescription = product.description
        ? product.description.toLowerCase()
        : "";

      return (
        productName.includes(searchValue) ||
        productBrand.includes(searchValue) ||
        productDescription.includes(searchValue)
      );
    });
    console.log(`After search filter: ${filteredProducts.length} products`);
  }

  console.log(`Final result: ${filteredProducts.length} products`);
  return filteredProducts;
}

// Show products function (simplified)
function showProducts(products) {
  productsContainer.innerHTML = "";
  const currentDir = getCurrentDirection();

  console.log(`Displaying ${products.length} products`);

  if (products.length === 0) {
    const isSearching = productSearch && productSearch.value.trim() !== "";
    const isFiltering = categoryFilter.value !== "";

    let message = "No products found.";
    if (isSearching && isFiltering) {
      message = `No products found for "${productSearch.value}" in the ${categoryFilter.value} category.`;
    } else if (isSearching) {
      message = `No products found for "${productSearch.value}".`;
    } else if (isFiltering) {
      message = `No products found in ${categoryFilter.value} category.`;
    } else {
      message =
        "Please select a category or search for products to get started.";
    }

    productsContainer.innerHTML = `
      <div class="placeholder-message" dir="${currentDir}">
        ${message}
      </div>
    `;
    return;
  }

  // Create product cards
  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("dir", currentDir);

    if (selectedProducts.some((p) => p.id === product.id)) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-name" dir="${currentDir}">${product.name}</div>
      <div class="product-category" dir="${currentDir}">${capitalize(
      product.category
    )}</div>
      <div class="product-brand" dir="${currentDir}">${
      product.brand || ""
    }</div>
      <button class="desc-btn" aria-haspopup="dialog" dir="${currentDir}">Show Description</button>
    `;

    // Event listeners for product selection and modal
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("desc-btn")) {
        toggleProduct(product);
      }
    });

    card.querySelector(".desc-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      showProductModal(product);
    });

    productsContainer.appendChild(card);
  });
}

// Function to handle real-time search filtering
function handleSearchInput() {
  clearTimeout(handleSearchInput.timeout);
  handleSearchInput.timeout = setTimeout(() => {
    const filteredProducts = getFilteredProducts();
    showProducts(filteredProducts);
    console.log(`Search results: ${filteredProducts.length} products found`);
  }, 300);
}

// Modal creation and logic
function showProductModal(product) {
  let modal = document.getElementById("productModal");
  if (modal) modal.remove();

  const currentDir = getCurrentDirection();
  modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "productModal";
  modal.setAttribute("dir", currentDir);

  modal.innerHTML = `
    <div class="modal-content" dir="${currentDir}">
      <div class="modal-header" dir="${currentDir}">
        <div>
          <h3 dir="${currentDir}">${product.name}</h3>
          <div class="brand" dir="${currentDir}">${product.brand || ""}</div>
        </div>
        <button class="close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body" dir="${currentDir}">
        <img class="modal-product-image" src="${product.image}" alt="${
    product.name
  }">
        <div class="modal-description" dir="${currentDir}">${
    product.description
  }</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = "block";

  // Close modal events
  modal.querySelector(".close").onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  document.addEventListener("keydown", function escListener(ev) {
    if (ev.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", escListener);
    }
  });
}

// Toggle product selection
function toggleProduct(product) {
  const index = selectedProducts.findIndex((p) => p.id === product.id);
  if (index === -1) {
    selectedProducts.push(product);
  } else {
    selectedProducts.splice(index, 1);
  }

  saveProductsToStorage();
  showProducts(getFilteredProducts());
  updateSelectedProductsDisplay();

  console.log(
    `Product ${product.name} ${
      index === -1 ? "added to" : "removed from"
    } selection`
  );
}

// Update the Selected Products section
function updateSelectedProductsDisplay() {
  const currentDir = getCurrentDirection();

  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `
      <div class="empty-selection" dir="${currentDir}">
        No products selected yet. Click on product cards to add them to your routine.
      </div>
    `;
    generateButton.disabled = true;
  } else {
    selectedProductsList.innerHTML = `
      <div class="selected-products-header" dir="${currentDir}">
        <span class="selected-count">${selectedProducts.length} product${
      selectedProducts.length === 1 ? "" : "s"
    } selected</span>
        <button class="clear-all-btn" id="clearAllBtn" title="Clear all products">
          <i class="fas fa-trash"></i> Clear All
        </button>
      </div>
      <div class="selected-products-list" dir="${currentDir}">
        ${selectedProducts
          .map(
            (product) => `
          <div class="selected-product-item" dir="${currentDir}">
            <span dir="${currentDir}">${product.name}</span>
            <button class="remove-btn" data-id="${product.id}" title="Remove product">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
    generateButton.disabled = false;

    // Add event listeners for remove buttons
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = Number(btn.getAttribute("data-id"));
        selectedProducts = selectedProducts.filter((p) => p.id !== id);
        saveProductsToStorage();
        showProducts(getFilteredProducts());
        updateSelectedProductsDisplay();
      });
    });

    // Clear all button
    const clearAllBtn = document.getElementById("clearAllBtn");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedProducts = [];
        saveProductsToStorage();
        showProducts(getFilteredProducts());
        updateSelectedProductsDisplay();
      });
    }
  }
}

// --- Chat & AI Routine Generation ---

// Helper: Convert markdown to HTML
function convertMarkdownToHtml(markdown) {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

// Function to send a message to the AI using gpt-4o model
async function sendMessageToAI(userMessage, includeProducts = false) {
  try {
    const currentDir = getCurrentDirection();

    // Show loading message
    const loadingMessage = `
      <div class="chat-message ai-message loading">
        <div class="message-content" dir="${currentDir}">
          <i class="fas fa-spinner fa-spin"></i> Thinking...
        </div>
      </div>
    `;
    chatWindow.innerHTML += loadingMessage;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Prepare system message
    let systemMessage =
      "You are a helpful L'Oréal beauty advisor. You ONLY provide personalized skincare and beauty advice related to L'Oréal products, skincare routines, makeup application, and beauty tips. If a user asks about anything unrelated to beauty, skincare, makeup, or L'Oréal products, politely decline and redirect them back to beauty-related topics. Always stay focused on L'Oréal's mission of helping people look and feel their best.";

    // Add selected products context if requested
    if (includeProducts && selectedProducts.length > 0) {
      const productContext = selectedProducts
        .map(
          (product) =>
            `${product.name} by ${product.brand} - ${product.description}`
        )
        .join("\n");
      systemMessage += ` The user has selected these products: ${productContext}. Please create a personalized routine using these products and provide usage tips.`;
    }

    // Prepare messages array for OpenAI API
    const messages = [
      { role: "system", content: systemMessage },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    // Send request to Cloudflare Worker using async/await
    const response = await fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model: "gpt-4o" }),
    });

    // Remove loading message
    const loadingElement = chatWindow.querySelector(".loading");
    if (loadingElement) loadingElement.remove();

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse the response and check for data.choices[0].message.content
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Add to conversation history
    conversationHistory.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: aiResponse }
    );

    // Display AI response
    const formattedResponse = convertMarkdownToHtml(aiResponse);
    const aiMessageHtml = `
      <div class="chat-message ai-message">
        <div class="message-content" dir="${currentDir}">
          ${formattedResponse}
        </div>
      </div>
    `;
    chatWindow.innerHTML += aiMessageHtml;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    // Remove loading message if error
    const loadingElement = chatWindow.querySelector(".loading");
    if (loadingElement) loadingElement.remove();

    const currentDir = getCurrentDirection();
    const errorMessage = `
      <div class="chat-message error-message">
        <div class="message-content" dir="${currentDir}">
          Sorry, I encountered an error: ${error.message}. Please try again.
        </div>
      </div>
    `;
    chatWindow.innerHTML += errorMessage;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

// RTL Language Support Functions
function detectRTLFromPageContent() {
  const pageText = document.body.textContent || document.body.innerText || "";
  const rtlCharPattern =
    /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  if (rtlCharPattern.test(pageText)) {
    const currentDir = document.documentElement.getAttribute("dir");
    if (currentDir !== "rtl") {
      document.documentElement.setAttribute("dir", "rtl");
      document.body.classList.add("rtl-layout");
      document.body.classList.remove("ltr-layout");
      console.log("Detected RTL characters, applied RTL formatting");
      refreshLayout();
    }
  } else {
    const currentDir = document.documentElement.getAttribute("dir");
    if (currentDir !== "ltr") {
      restoreToNormalFormatting();
    }
  }
}

function restoreToNormalFormatting() {
  document.documentElement.setAttribute("dir", "ltr");
  document.documentElement.setAttribute("lang", "en");
  document.body.classList.add("ltr-layout");
  document.body.classList.remove("rtl-layout");
  console.log("Website restored to normal LTR formatting");
  refreshLayout();
}

function refreshLayout() {
  // Update category filter options with proper text direction
  const categories = [
    ...new Set(allProducts.map((product) => product.category)),
  ];
  createCategoryFilterOptions(categories);

  // Refresh the displayed products
  const currentFilter = getFilteredProducts();
  showProducts(currentFilter);
  updateSelectedProductsDisplay();
}

function applyLanguageDirection(language) {
  const body = document.body;
  const html = document.documentElement;

  if (isRTLLanguage(language)) {
    html.setAttribute("dir", "rtl");
    html.setAttribute("lang", language);
    body.classList.add("rtl-layout");
    body.classList.remove("ltr-layout");
    console.log(`Applied RTL formatting for language: ${language}`);
  } else {
    html.setAttribute("dir", "ltr");
    html.setAttribute("lang", language);
    body.classList.add("ltr-layout");
    body.classList.remove("rtl-layout");
    console.log(`Applied normal LTR formatting for language: ${language}`);
  }

  // Save language preference to localStorage for beginners to understand persistence
  localStorage.setItem("selectedLanguage", language);
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Load saved language preference first
  loadSavedLanguage();

  // Load saved products from localStorage
  loadSavedProducts();

  // Load products from JSON file
  loadProducts();

  // Update selected products display
  updateSelectedProductsDisplay();

  // Add event listeners for search and category filter
  if (productSearch) {
    productSearch.addEventListener("input", handleSearchInput);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      const filteredProducts = getFilteredProducts();
      showProducts(filteredProducts);
    });
  }

  // Add generate routine button listener
  if (generateButton) {
    generateButton.addEventListener("click", () => {
      if (selectedProducts.length > 0) {
        const userMessage =
          "Please create a personalized beauty routine using my selected products.";
        // Add user message to chat
        const currentDir = getCurrentDirection();
        const userMessageHtml = `
          <div class="chat-message user-message">
            <div class="message-content" dir="${currentDir}">
              ${userMessage}
            </div>
          </div>
        `;
        chatWindow.innerHTML += userMessageHtml;
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Send to AI with products included
        sendMessageToAI(userMessage, true);
      }
    });
  }

  // Add chat form listener
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const userInput = document.getElementById("userInput");
      if (userInput && userInput.value.trim()) {
        const userMessage = userInput.value.trim();

        // Add user message to chat
        const currentDir = getCurrentDirection();
        const userMessageHtml = `
          <div class="chat-message user-message">
            <div class="message-content" dir="${currentDir}">
              ${userMessage}
            </div>
          </div>
        `;
        chatWindow.innerHTML += userMessageHtml;
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Clear input
        userInput.value = "";

        // Send to AI
        sendMessageToAI(userMessage, false);
      }
    });
  }

  console.log("L'Oréal Routine Builder initialized successfully");
});
