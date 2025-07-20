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

// Constants for better maintainability (beginner-friendly)
const RTL_LANGUAGES = [
  "ar", "he", "fa", "ur", "arc", "dv", "syr", "ps", 
  "sd", "ug", "yi", "az", "ku", "ff", "ha", "ms",
  "ckb", "prs", "bal", "bqi", "glk", "lrc", "mzn"
];

const RTL_CHAR_PATTERN = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const DIRECTION_SELECTORS = [
  ".product-card", ".product-name", ".product-category", ".product-brand",
  ".desc-btn", ".selected-product-item", ".chat-message", ".message-content",
  ".placeholder-message", ".empty-selection", ".modal-content", ".modal-header",
  ".modal-description", "#categoryFilter", "#categoryFilter option", "#productSearch"
];

// FIXED: Better conflict prevention variables
let isTranslating = false; // Track if Google Translate is active
let translationTimeout = null; // Track translation timeouts
let lastLanguage = "en"; // Track last detected language

// Enhanced RTL language detection (comprehensive list for beginners)
function isRTLLanguage(language) {
  return RTL_LANGUAGES.includes(language);
}

// Helper function to get current direction
function getCurrentDirection() {
  return document.documentElement.getAttribute("dir") || "ltr";
}

// Helper function to capitalize strings (beginner-friendly)
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

// FIXED: Completely prevent conflicts during translation
function setTranslationMode(enabled) {
  isTranslating = enabled;
  
  if (enabled) {
    console.log("Translation mode ENABLED - all monitoring disabled");
    // Clear any existing timeout
    if (translationTimeout) {
      clearTimeout(translationTimeout);
    }
    // Auto-disable translation mode after 5 seconds
    translationTimeout = setTimeout(() => {
      isTranslating = false;
      console.log("Translation mode DISABLED - monitoring resumed");
    }, 5000);
  } else {
    console.log("Translation mode DISABLED - monitoring resumed");
  }
}

// Unified function to apply direction formatting (reduces duplication)
function applyDirectionFormatting(direction) {
  // Don't apply formatting if we're translating
  if (isTranslating) {
    console.log("Skipping direction formatting - translation in progress");
    return;
  }

  const html = document.documentElement;
  const body = document.body;
  const isRTL = direction === "rtl";

  // Set direction attributes and styles for persistence
  html.setAttribute("dir", direction);
  html.style.direction = direction;
  body.style.direction = direction;

  // Update CSS classes
  if (isRTL) {
    body.classList.add("rtl-layout");
    body.classList.remove("ltr-layout");
  } else {
    body.classList.add("ltr-layout");
    body.classList.remove("rtl-layout");
  }

  // Update all elements with the new direction
  updateAllElementsDirection(direction);

  console.log(`Applied ${direction.toUpperCase()} formatting to page`);

  // Refresh layout to apply changes to all components
  refreshLayoutForDirection(direction);
}

// New function to apply RTL formatting (beginner-friendly)
function applyRTLFormatting() {
  applyDirectionFormatting("rtl");
}

// New function to apply LTR formatting (beginner-friendly)
function applyLTRFormatting() {
  applyDirectionFormatting("ltr");
}

// Enhanced updateAllElementsDirection with better persistence
function updateAllElementsDirection(direction) {
  // Don't update if we're translating
  if (isTranslating) {
    return;
  }

  // Update direction for each element type using the constant array
  DIRECTION_SELECTORS.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.setAttribute("dir", direction);
      // Add inline style for better persistence during translation
      element.style.direction = direction;
    });
  });

  console.log(`Updated ${DIRECTION_SELECTORS.length} element types with ${direction} direction`);
}

// FIXED: Completely disabled RTL detection during translation
function detectRTLFromPageContent() {
  // COMPLETELY SKIP if translating
  if (isTranslating) {
    console.log("Skipping RTL detection - translation in progress");
    return;
  }

  // Get all text content from the page
  const pageText = document.body.textContent || document.body.innerText || "";

  // Count RTL vs LTR characters for better detection
  const rtlMatches = pageText.match(RTL_CHAR_PATTERN);
  const rtlCount = rtlMatches ? rtlMatches.length : 0;
  const totalChars = pageText.replace(/\s/g, "").length;
  const rtlPercentage = totalChars > 0 ? (rtlCount / totalChars) * 100 : 0;

  console.log(`RTL character detection: ${rtlCount} RTL chars, ${rtlPercentage.toFixed(1)}% RTL content`);

  // FIXED: Much higher threshold to prevent false switching (50% instead of 30%)
  const currentDir = getCurrentDirection();
  const shouldBeRTL = rtlPercentage > 50;

  // Only switch if there's a VERY significant difference
  if (shouldBeRTL && currentDir !== "rtl") {
    console.log("Detected VERY significant RTL content - applying RTL formatting");
    applyRTLFormatting();
  } else if (!shouldBeRTL && currentDir !== "ltr" && rtlPercentage < 2) {
    // Only switch to LTR if RTL content is almost zero (less than 2%)
    console.log("Detected almost no RTL content - applying LTR formatting");
    applyLTRFormatting();
  }
}

// FIXED: Completely rebuilt category filter update to prevent conflicts
function updateCategoryFilter(categories, direction, selectedValue = "") {
  // COMPLETELY SKIP if translating
  if (isTranslating) {
    console.log("Skipping category filter update - translation in progress");
    return;
  }

  // Only update if we actually have categories and the filter exists
  if (!categoryFilter || !categories || categories.length === 0) {
    return;
  }

  // Store current selection if not provided
  if (!selectedValue) {
    selectedValue = categoryFilter.value;
  }

  // Clear and rebuild
  categoryFilter.innerHTML = "";
  categoryFilter.setAttribute("dir", direction);
  categoryFilter.style.direction = direction;

  // Create default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Selected Category";
  defaultOption.setAttribute("dir", direction);
  defaultOption.style.direction = direction;
  categoryFilter.appendChild(defaultOption);

  // Add category options
  const sortedCategories = categories.sort();
  sortedCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = capitalize(category);
    option.setAttribute("dir", direction);
    option.style.direction = direction;
    categoryFilter.appendChild(option);
  });

  // Restore selection
  if (selectedValue) {
    categoryFilter.value = selectedValue;
  }

  console.log(`Category filter updated with ${direction} direction (${categories.length} options)`);
}

// Enhanced createCategoryFilterOptions with translation support
function createCategoryFilterOptions(categories) {
  const currentDir = getCurrentDirection();
  const currentLang = document.documentElement.getAttribute("lang") || "en";

  updateCategoryFilter(categories, currentDir);

  console.log(`Category filter created with translation support for ${currentLang} (${currentDir})`);
  console.log(`Added ${categories.length} category options`);
}

// FIXED: Only update direction, never rebuild during translation
function maintainCategoryFilterDirection() {
  // COMPLETELY SKIP if translating
  if (isTranslating) {
    return;
  }

  const currentDir = getCurrentDirection();

  if (categoryFilter) {
    // Only update direction attributes, don't touch content
    categoryFilter.setAttribute("dir", currentDir);
    categoryFilter.style.direction = currentDir;

    // Update direction for existing options
    const options = categoryFilter.querySelectorAll("option");
    options.forEach((option) => {
      option.setAttribute("dir", currentDir);
      option.style.direction = currentDir;
    });

    console.log(`Category filter direction maintained: ${currentDir}`);
  }
}

// FIXED: Minimal category filter update for translation
function updateCategoryFilterForTranslation(language) {
  // COMPLETELY SKIP if translating or no filter
  if (isTranslating || !categoryFilter) {
    return;
  }

  // Only update direction, never rebuild
  const newDirection = isRTLLanguage(language) ? "rtl" : "ltr";
  
  categoryFilter.setAttribute("dir", newDirection);
  categoryFilter.style.direction = newDirection;

  // Update existing options direction only
  const options = categoryFilter.querySelectorAll("option");
  options.forEach((option) => {
    option.setAttribute("dir", newDirection);
    option.style.direction = newDirection;
  });

  console.log(`Category filter direction updated for translation: ${language} (${newDirection})`);
}

// FIXED: Much better language change handling
function handleLanguageChange(language) {
  // Skip if same language
  if (language === lastLanguage) {
    return;
  }

  console.log(`Handling language change from ${lastLanguage} to: ${language}`);
  lastLanguage = language;

  // Enable translation mode to prevent conflicts
  setTranslationMode(true);

  // Apply appropriate formatting based on language
  if (isRTLLanguage(language)) {
    console.log(`${language} is an RTL language - applying RTL formatting`);
    applyRTLFormatting();
    // Set additional attributes to help maintain RTL
    document.documentElement.style.direction = "rtl";
    document.body.style.direction = "rtl";
  } else {
    console.log(`${language} is an LTR language - applying LTR formatting`);
    applyLTRFormatting();
    // Set additional attributes for LTR
    document.documentElement.style.direction = "ltr";
    document.body.style.direction = "ltr";
  }

  // Only update category filter direction after a longer delay
  setTimeout(() => {
    updateCategoryFilterForTranslation(language);
    // Keep translation mode enabled longer
    setTimeout(() => {
      setTranslationMode(false);
    }, 3000);
  }, 2000);
}

// FIXED: Completely rebuilt language monitoring with minimal conflicts
function setupLanguageMonitoring() {
  // ONLY watch for language attribute changes (nothing else)
  const languageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "lang") {
        const newLang = document.documentElement.getAttribute("lang");
        
        // Skip if same language or if we're already translating
        if (newLang === lastLanguage || isTranslating) {
          return;
        }

        console.log(`Google Translate changed language to: ${newLang}`);

        // Enable translation mode immediately
        setTranslationMode(true);

        // Handle language change with longer delay
        setTimeout(() => {
          handleLanguageChange(newLang);
        }, 3000); // Longer delay to let Google Translate completely finish
      }
    });
  });

  // Only observe language changes
  languageObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });

  // COMPLETELY REMOVED content observer to prevent all conflicts
  console.log("Simplified language monitoring setup complete (no content observer)");
}

// Load saved products from localStorage
function loadSavedProducts() {
  const savedProducts = localStorage.getItem("selectedProducts");
  if (savedProducts) {
    selectedProducts = JSON.parse(savedProducts);
  }
}

// Save products to localStorage
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
    const categories = [...new Set(allProducts.map((product) => product.category))];
    console.log("Available categories in products.json:", categories);

    // Log product count for each category (helpful for debugging)
    categories.forEach((category) => {
      const count = allProducts.filter((product) => product.category === category).length;
      console.log(`Category "${category}" has ${count} products`);
    });

    // Create the category filter dropdown completely from product data
    createCategoryFilterOptions(categories);

    // Setup language monitoring for Google Translate
    setupLanguageMonitoring();

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

// Enhanced getFilteredProducts function with better debugging
function getFilteredProducts() {
  // Get the selected category and search term
  const categoryValue = categoryFilter.value;
  const searchValue = productSearch ? productSearch.value.toLowerCase().trim() : "";

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
        console.log(`Product "${product.name}" category "${product.category}" doesn't match "${categoryValue}"`);
      }
      return matches;
    });
    console.log(`After category filter: ${filteredProducts.length} products`);

    // If no products found, show available categories for debugging
    if (filteredProducts.length === 0) {
      const availableCategories = [...new Set(allProducts.map((product) => product.category))];
      console.log("Available categories:", availableCategories);
    }
  }

  // Apply search filter if user typed something
  if (searchValue) {
    filteredProducts = filteredProducts.filter((product) => {
      // Search in product name, brand, and description (beginner-friendly approach)
      const productName = product.name.toLowerCase();
      const productBrand = product.brand ? product.brand.toLowerCase() : "";
      const productDescription = product.description ? product.description.toLowerCase() : "";

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
      message = "Please select a category or search for products to get started.";
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
      <div class="product-category" dir="${currentDir}">${capitalize(product.category)}</div>
      <div class="product-brand" dir="${currentDir}">${product.brand || ""}</div>
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
        <img class="modal-product-image" src="${product.image}" alt="${product.name}">
        <div class="modal-description" dir="${currentDir}">${product.description}</div>
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

  console.log(`Product ${product.name} ${index === -1 ? "added to" : "removed from"} selection`);
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
        <span class="selected-count">${selectedProducts.length} product${selectedProducts.length === 1 ? "" : "s"} selected</span>
        <button class="clear-all-btn" id="clearAllBtn" title="Clear all products">
          <i class="fas fa-trash"></i> Clear All
        </button>
      </div>
      <div class="selected-products-list" dir="${currentDir}">
        ${selectedProducts.map((product) => `
          <div class="selected-product-item" dir="${currentDir}">
            <span dir="${currentDir}">${product.name}</span>
            <button class="remove-btn" data-id="${product.id}" title="Remove product">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `).join("")}
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
    let systemMessage = "You are a helpful L'Oréal beauty advisor. You ONLY provide personalized skincare and beauty advice related to L'Oréal products, skincare routines, makeup application, and beauty tips. If a user asks about anything unrelated to beauty, skincare, makeup, or L'Oréal products, politely decline and redirect them back to beauty-related topics. Always stay focused on L'Oréal's mission of helping people look and feel their best.";

    // Add selected products context if requested
    if (includeProducts && selectedProducts.length > 0) {
      const productContext = selectedProducts
        .map((product) => `${product.name} by ${product.brand} - ${product.description}`)
        .join("\n");
      systemMessage += ` The user has selected these products: ${productContext}. Please create a personalized routine using these products and provide usage tips.`;
    }

    // Prepare messages array for OpenAI API
    const messages = [
      { role: "system", content: systemMessage },
      ...conversationHistory,
      { role: "user", content: userMessage }
    ];

    // Send request to Cloudflare Worker using async/await
    const response = await fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model: "gpt-4o" })
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

// FIXED: Enhanced refreshLayout function that respects translation mode
function refreshLayoutForDirection(direction) {
  // COMPLETELY SKIP if translating
  if (isTranslating) {
    console.log("Skipping layout refresh - translation in progress");
    return;
  }

  // Update category filter options with proper text direction and translation support
  const categories = [...new Set(allProducts.map((product) => product.category))];
  createCategoryFilterOptions(categories);

  // Refresh the displayed products
  const currentFilter = getFilteredProducts();
  showProducts(currentFilter);
  updateSelectedProductsDisplay();

  // Ensure all elements maintain proper direction
  updateAllElementsDirection(direction);

  console.log(`Layout refreshed for ${direction} direction with translation support`);
}

function refreshLayout() {
  const currentDir = getCurrentDirection();
  refreshLayoutForDirection(currentDir);
}

function restoreToNormalFormatting() {
  applyLTRFormatting();
}

function applyLanguageDirection(language) {
  const direction = isRTLLanguage(language) ? "rtl" : "ltr";

  // Apply direction formatting
  applyDirectionFormatting(direction);

  // Set language attribute
  document.documentElement.setAttribute("lang", language);

  console.log(`Applied ${direction.toUpperCase()} formatting for language: ${language}`);

  // Save language preference to localStorage for beginners to understand persistence
  localStorage.setItem("selectedLanguage", language);
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
        const userMessage = "Please create a personalized beauty routine using my selected products.";
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

        // Send to AI with products included using gpt-4o model
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

        // Send to AI using gpt-4o model
        sendMessageToAI(userMessage, false);
      }
    });
  }

  console.log("L'Oréal Routine Builder initialized successfully with RTL/LTR support");
});