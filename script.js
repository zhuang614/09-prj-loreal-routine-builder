// Beginner-friendly L'Oréal Routine Builder main script

// Get references to DOM elements
const categoryFilter = document.getElementById("categoryFilter");
const productSearch = document.getElementById("productSearch");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateButton = document.getElementById("generateRoutine");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

// Cloudflare Worker endpoints for AI API
const WORKER_ENDPOINT = "https://loreal-routine-builder.zhuang61.workers.dev/";
const WEBSEARCH_ENDPOINT = "https://loreal-websearch.zhuang61.workers.dev/";

// Store all products and selected products
let allProducts = [];
let selectedProducts = [];

// Array to store conversation history
let conversationHistory = [];

// Constants for better maintainability (beginner-friendly)
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
  "ha",
  "ms",
  "ckb",
  "prs",
  "bal",
  "bqi",
  "glk",
  "lrc",
  "mzn",
];

const RTL_CHAR_PATTERN =
  /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const DIRECTION_SELECTORS = [
  ".product-card",
  ".product-name",
  ".product-category",
  ".product-brand",
  ".desc-btn",
  ".selected-product-item",
  ".chat-message",
  ".message-content",
  ".placeholder-message",
  ".empty-selection",
  ".modal-content",
  ".modal-header",
  ".modal-description",
  "#categoryFilter",
  "#categoryFilter option",
  "#productSearch",
];

// Keywords that suggest the user wants current information (optimized into constant)
const WEB_SEARCH_KEYWORDS = [
  "latest",
  "new",
  "current",
  "recent",
  "2024",
  "2025",
  "price",
  "cost",
  "where to buy",
  "availability",
  "reviews",
  "trending",
  "popular",
  "best",
  "top",
  "compare",
  "vs",
  "sale",
  "discount",
  "launch",
  "release",
  "update",
  "news",
  "product",
  "loreal",
  "l'oreal",
];

// Translation conflict prevention variables
let isTranslating = false;
let translationTimeout = null;
let lastLanguage = "en";

// === UTILITY FUNCTIONS (optimized and consolidated) ===

// Helper function to get current direction
function getCurrentDirection() {
  return document.documentElement.getAttribute("dir") || "ltr";
}

// Helper function to capitalize strings (beginner-friendly)
function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

// Enhanced RTL language detection (comprehensive list for beginners)
function isRTLLanguage(language) {
  return RTL_LANGUAGES.includes(language);
}

// Optimized translation mode control
function setTranslationMode(enabled) {
  isTranslating = enabled;

  if (enabled) {
    console.log("Translation mode ENABLED - all monitoring disabled");
    if (translationTimeout) clearTimeout(translationTimeout);
    translationTimeout = setTimeout(() => {
      isTranslating = false;
      console.log("Translation mode DISABLED - monitoring resumed");
    }, 5000);
  } else {
    console.log("Translation mode DISABLED - monitoring resumed");
  }
}

// === DIRECTION AND TRANSLATION FUNCTIONS (optimized) ===

// Unified function to apply direction formatting (reduces duplication)
function applyDirectionFormatting(direction) {
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
  body.classList.toggle("rtl-layout", isRTL);
  body.classList.toggle("ltr-layout", !isRTL);

  // Update all elements with the new direction
  updateAllElementsDirection(direction);

  console.log(`Applied ${direction.toUpperCase()} formatting to page`);

  // Refresh layout to apply changes to all components
  refreshLayoutForDirection(direction);
}

// Optimized direction application functions
const applyRTLFormatting = () => applyDirectionFormatting("rtl");
const applyLTRFormatting = () => applyDirectionFormatting("ltr");

// Enhanced updateAllElementsDirection with better persistence
function updateAllElementsDirection(direction) {
  if (isTranslating) return;

  DIRECTION_SELECTORS.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.setAttribute("dir", direction);
      element.style.direction = direction;
    });
  });

  console.log(
    `Updated ${DIRECTION_SELECTORS.length} element types with ${direction} direction`
  );
}

// Optimized RTL detection with higher threshold
function detectRTLFromPageContent() {
  if (isTranslating) {
    console.log("Skipping RTL detection - translation in progress");
    return;
  }

  const pageText = document.body.textContent || document.body.innerText || "";
  const rtlMatches = pageText.match(RTL_CHAR_PATTERN);
  const rtlCount = rtlMatches ? rtlMatches.length : 0;
  const totalChars = pageText.replace(/\s/g, "").length;
  const rtlPercentage = totalChars > 0 ? (rtlCount / totalChars) * 100 : 0;

  console.log(
    `RTL character detection: ${rtlCount} RTL chars, ${rtlPercentage.toFixed(
      1
    )}% RTL content`
  );

  const currentDir = getCurrentDirection();
  const shouldBeRTL = rtlPercentage > 50;

  if (shouldBeRTL && currentDir !== "rtl") {
    console.log(
      "Detected VERY significant RTL content - applying RTL formatting"
    );
    applyRTLFormatting();
  } else if (!shouldBeRTL && currentDir !== "ltr" && rtlPercentage < 2) {
    console.log("Detected almost no RTL content - applying LTR formatting");
    applyLTRFormatting();
  }
}

// === CATEGORY FILTER FUNCTIONS (optimized to reduce duplication) ===

// Optimized category filter update
function updateCategoryFilter(categories, direction, selectedValue = "") {
  if (
    isTranslating ||
    !categoryFilter ||
    !categories ||
    categories.length === 0
  ) {
    if (isTranslating)
      console.log("Skipping category filter update - translation in progress");
    return;
  }

  selectedValue = selectedValue || categoryFilter.value;

  // Clear and rebuild with optimized loop
  categoryFilter.innerHTML = "";
  categoryFilter.setAttribute("dir", direction);
  categoryFilter.style.direction = direction;

  // Create and append default option
  const defaultOption = document.createElement("option");
  Object.assign(defaultOption, {
    value: "",
    textContent: "Selected Category",
  });
  defaultOption.setAttribute("dir", direction);
  defaultOption.style.direction = direction;
  categoryFilter.appendChild(defaultOption);

  // Create category options with optimized forEach
  categories.sort().forEach((category) => {
    const option = document.createElement("option");
    Object.assign(option, {
      value: category,
      textContent: capitalize(category),
    });
    option.setAttribute("dir", direction);
    option.style.direction = direction;
    categoryFilter.appendChild(option);
  });

  // Restore selection
  if (selectedValue) categoryFilter.value = selectedValue;

  console.log(
    `Category filter updated with ${direction} direction (${categories.length} options)`
  );
}

// Enhanced createCategoryFilterOptions with translation support
function createCategoryFilterOptions(categories) {
  const currentDir = getCurrentDirection();
  const currentLang = document.documentElement.getAttribute("lang") || "en";

  updateCategoryFilter(categories, currentDir);

  console.log(
    `Category filter created with translation support for ${currentLang} (${currentDir})`
  );
  console.log(`Added ${categories.length} category options`);
}

// Optimized category filter direction maintenance
function updateCategoryFilterForTranslation(language) {
  if (isTranslating || !categoryFilter) return;

  const newDirection = isRTLLanguage(language) ? "rtl" : "ltr";

  categoryFilter.setAttribute("dir", newDirection);
  categoryFilter.style.direction = newDirection;

  // Update existing options direction only
  categoryFilter.querySelectorAll("option").forEach((option) => {
    option.setAttribute("dir", newDirection);
    option.style.direction = newDirection;
  });

  console.log(
    `Category filter direction updated for translation: ${language} (${newDirection})`
  );
}

// === LANGUAGE HANDLING FUNCTIONS (optimized) ===

// Optimized language change handling
function handleLanguageChange(language) {
  if (language === lastLanguage) return;

  console.log(`Handling language change from ${lastLanguage} to: ${language}`);
  lastLanguage = language;

  setTranslationMode(true);

  const isRTL = isRTLLanguage(language);
  console.log(
    `${language} is an ${isRTL ? "RTL" : "LTR"} language - applying ${
      isRTL ? "RTL" : "LTR"
    } formatting`
  );

  // Apply formatting and set direction attributes
  isRTL ? applyRTLFormatting() : applyLTRFormatting();
  document.documentElement.style.direction = isRTL ? "rtl" : "ltr";
  document.body.style.direction = isRTL ? "rtl" : "ltr";

  // Update category filter direction after delay
  setTimeout(() => {
    updateCategoryFilterForTranslation(language);
    setTimeout(() => setTranslationMode(false), 3000);
  }, 2000);
}

// Optimized language monitoring setup
function setupLanguageMonitoring() {
  const languageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.attributeName === "lang") {
        const newLang = document.documentElement.getAttribute("lang");

        if (newLang === lastLanguage || isTranslating) return;

        console.log(`Google Translate changed language to: ${newLang}`);
        setTranslationMode(true);

        setTimeout(() => handleLanguageChange(newLang), 3000);
      }
    });
  });

  languageObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });

  console.log(
    "Simplified language monitoring setup complete (no content observer)"
  );
}

// === STORAGE FUNCTIONS (optimized) ===

// Load saved products from localStorage
function loadSavedProducts() {
  const savedProducts = localStorage.getItem("selectedProducts");
  if (savedProducts) {
    selectedProducts = JSON.parse(savedProducts);
  }
}

// Save products to localStorage
const saveProductsToStorage = () =>
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));

// === PRODUCT LOADING AND FILTERING (optimized) ===

// Load products from products.json and create category filter dynamically
async function loadProducts() {
  try {
    const response = await fetch("products.json");
    const data = await response.json();
    allProducts = data.products;

    // Get all unique categories from the products (optimized)
    const categories = [
      ...new Set(allProducts.map((product) => product.category)),
    ];
    console.log("Available categories in products.json:", categories);

    // Log product count for each category (optimized)
    categories.forEach((category) => {
      const count = allProducts.filter(
        (product) => product.category === category
      ).length;
      console.log(`Category "${category}" has ${count} products`);
    });

    createCategoryFilterOptions(categories);
    setupLanguageMonitoring();

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

// Enhanced getFilteredProducts function (optimized)
function getFilteredProducts() {
  const categoryValue = categoryFilter.value;
  const searchValue = productSearch
    ? productSearch.value.toLowerCase().trim()
    : "";

  console.log(
    `Filters - Category: "${categoryValue}", Search: "${searchValue}", Total: ${allProducts.length}`
  );

  let filteredProducts = allProducts;

  // Apply category filter
  if (categoryValue) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === categoryValue
    );
    console.log(`After category filter: ${filteredProducts.length} products`);

    if (filteredProducts.length === 0) {
      const availableCategories = [
        ...new Set(allProducts.map((product) => product.category)),
      ];
      console.log("Available categories:", availableCategories);
    }
  }

  // Apply search filter
  if (searchValue) {
    filteredProducts = filteredProducts.filter((product) => {
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

// === PRODUCT DISPLAY FUNCTIONS (optimized) ===

// Optimized show products function
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

    productsContainer.innerHTML = `<div class="placeholder-message" dir="${currentDir}">${message}</div>`;
    return;
  }

  // Create product cards (optimized)
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

    // Optimized event listeners
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

// Optimized search input handling
function handleSearchInput() {
  clearTimeout(handleSearchInput.timeout);
  handleSearchInput.timeout = setTimeout(() => {
    const filteredProducts = getFilteredProducts();
    showProducts(filteredProducts);
    console.log(`Search results: ${filteredProducts.length} products found`);
  }, 300);
}

// === MODAL FUNCTIONS (optimized) ===

// Modal creation and logic (optimized)
function showProductModal(product) {
  // Remove existing modal
  const existingModal = document.getElementById("productModal");
  if (existingModal) existingModal.remove();

  const currentDir = getCurrentDirection();
  const modal = document.createElement("div");
  Object.assign(modal, {
    className: "modal",
    id: "productModal",
  });
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

  // Optimized modal event handlers
  const closeModal = () => modal.remove();
  modal.querySelector(".close").onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Optimized escape key handler
  const escListener = (ev) => {
    if (ev.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escListener);
    }
  };
  document.addEventListener("keydown", escListener);
}

// === PRODUCT SELECTION FUNCTIONS (optimized) ===

// Toggle product selection (optimized)
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

// Update the Selected Products section (optimized)
function updateSelectedProductsDisplay() {
  const currentDir = getCurrentDirection();

  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `
      <div class="empty-selection" dir="${currentDir}">
        No products selected yet. Click on product cards to add them to your routine.
      </div>
    `;
    generateButton.disabled = true;
    return;
  }

  const productCount = selectedProducts.length;
  selectedProductsList.innerHTML = `
    <div class="selected-products-header" dir="${currentDir}">
      <span class="selected-count">${productCount} product${
    productCount === 1 ? "" : "s"
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

  // Optimized event listeners for remove buttons
  const removeProduct = (id) => {
    selectedProducts = selectedProducts.filter((p) => p.id !== id);
    saveProductsToStorage();
    showProducts(getFilteredProducts());
    updateSelectedProductsDisplay();
  };

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeProduct(Number(btn.getAttribute("data-id")));
    });
  });

  // Clear all button (optimized)
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

// === MARKDOWN CONVERSION FUNCTIONS (optimized to reduce duplication) ===

// Base markdown to HTML converter
function convertMarkdownToHtml(markdown) {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

// Fixed enhanced markdown to HTML converter for students (beginner-friendly)
function convertMarkdownToHtmlWithLinks(markdown) {
  console.log("Converting markdown for students:", markdown);

  // Step-by-step conversion that students can understand and debug
  let converted = markdown;

  // Step 1: Convert bold text **text** to <strong>text</strong> (students are learning regex)
  converted = converted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Step 2: Convert italic text *text* to <em>text</em> (students need to see the pattern)
  converted = converted.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Step 3: Convert markdown links [text](url) to clickable HTML links (MOST IMPORTANT for students)
  // This regex finds [text](url) and converts to proper HTML anchor tags
  converted = converted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="citation-link">$1 🔗</a>'
  );

  // Step 4: Convert plain URLs to clickable links (students need to handle both patterns)
  // This finds URLs that aren't already in anchor tags
  converted = converted.replace(
    /(?<!href=")(?<!>)(https?:\/\/[^\s<]+)(?![^<]*<\/a>)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="citation-link">$1</a>'
  );

  // Step 5: Convert line breaks to HTML (students can see the simple replacement)
  converted = converted.replace(/\n/g, "<br>");

  console.log("Converted HTML for students:", converted);
  return converted;
}

// === AI FUNCTIONS (optimized to reduce duplication) ===

// Optimized function to decide which AI function to use
function shouldUseWebSearch(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  const needsWebSearch = WEB_SEARCH_KEYWORDS.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  console.log(`Checking if web search needed: ${needsWebSearch}`);
  return needsWebSearch;
}

// Optimized function to create system message (reduces duplication)
function createSystemMessage(includeProducts = false, isWebSearch = false) {
  let systemMessage = isWebSearch
    ? `You are a helpful L'Oréal beauty advisor with access to current web information. 

IMPORTANT INSTRUCTIONS:
- You ONLY provide personalized skincare and beauty advice related to L'Oréal products, skincare routines, makeup application, and beauty tips
- Use web search to find the most current information about L'Oréal products, prices, availability, reviews, and trends
- When you find relevant information from web search, always include citations with clickable links
- If a user asks about anything unrelated to beauty, skincare, makeup, or L'Oréal products, politely decline and redirect them back to beauty-related topics
- Always stay focused on L'Oréal's mission of helping people look and feel their best
- Format citations as: "Source: [Website Name](URL)"
- Prioritize official L'Oréal websites and reputable beauty retailers in your search results`
    : "You are a helpful L'Oréal beauty advisor. You ONLY provide personalized skincare and beauty advice related to L'Oréal products, skincare routines, makeup application, and beauty tips. If a user asks about anything unrelated to beauty, skincare, makeup, or L'Oréal products, politely decline and redirect them back to beauty-related topics. Always stay focused on L'Oréal's mission of helping people look and feel their best.";

  // Add selected products context if requested
  if (includeProducts && selectedProducts.length > 0) {
    const productContext = selectedProducts
      .map(
        (product) =>
          `${product.name} by ${product.brand} - ${product.description}`
      )
      .join("\n");
    systemMessage += isWebSearch
      ? `\n\nThe user has selected these products: ${productContext}. Please search for current information about these specific products and create a personalized routine with the most up-to-date usage tips and complementary product recommendations.`
      : ` The user has selected these products: ${productContext}. Please create a personalized routine using these products and provide usage tips.`;
  }

  return systemMessage;
}

// Optimized function to display AI message (reduces duplication)
function displayAIMessage(
  content,
  isWebSearch = false,
  wasWebSearchUsed = false
) {
  const currentDir = getCurrentDirection();
  const formattedResponse = isWebSearch
    ? convertMarkdownToHtmlWithLinks(content)
    : convertMarkdownToHtml(content);

  const aiMessageHtml = `
    <div class="chat-message ai-message ${
      wasWebSearchUsed ? "web-search-result" : ""
    }">
      <div class="message-content" dir="${currentDir}">
        ${formattedResponse}
      </div>
    </div>
  `;
  chatWindow.innerHTML += aiMessageHtml;
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Optimized function to show loading message (reduces duplication)
function showLoadingMessage(isWebSearch = false) {
  const currentDir = getCurrentDirection();
  const loadingMessage = `
    <div class="chat-message ai-message loading">
      <div class="message-content" dir="${currentDir}">
        <i class="fas fa-${isWebSearch ? "search" : "spinner"} fa-spin"></i> ${
    isWebSearch
      ? "Searching the web for current L'Oréal information..."
      : "Thinking..."
  }
      </div>
    </div>
  `;
  chatWindow.innerHTML += loadingMessage;
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Optimized function to remove loading message
const removeLoadingMessage = () => {
  const loadingElement = chatWindow.querySelector(".loading");
  if (loadingElement) loadingElement.remove();
};

// Fixed function to send message to AI with enhanced search (for students)
async function sendMessageToAIWithWebSearch(
  userMessage,
  includeProducts = false
) {
  try {
    // Show loading message to students
    showLoadingMessage(true);

    // Create system message using the helper function students learned
    const systemMessage = createSystemMessage(includeProducts, true);

    // Create messages array using the pattern students are learning
    const messages = [
      { role: "system", content: systemMessage },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    // Send request to Cloudflare Worker using async/await (students are learning this)
    const response = await fetch(WEBSEARCH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages, // Using messages parameter as students learned
        model: "gpt-4o", // Using gpt-4o model as instructed
        useWebSearch: true, // Simple flag students can understand
      }),
    });

    // Remove loading message for students to see
    removeLoadingMessage();

    // Check if response is ok (students need to learn error handling)
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse response and check for data.choices[0].message.content (per student instructions)
    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Check if enhanced information was used (students can see this)
    const wasEnhanced = data.choices[0].message.web_search_used || false;

    if (wasEnhanced) {
      // Add indicator for students to understand what happened
      aiResponse = `🌐 *Enhanced with helpful information*\n\n${aiResponse}`;
    }

    // Add to conversation history using pattern students learned
    conversationHistory.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: aiResponse }
    );

    // Display AI response using the helper function students learned
    displayAIMessage(aiResponse, true, wasEnhanced);
    console.log("Enhanced response received successfully for students");
  } catch (error) {
    // Remove loading message if there's an error
    removeLoadingMessage();
    console.error("Enhanced search error for students:", error);

    // Get current direction for students learning about internationalization
    const currentDir = getCurrentDirection();

    // Show helpful fallback message for students
    const fallbackMessage = `
      <div class="chat-message ai-message">
        <div class="message-content" dir="${currentDir}">
          <i class="fas fa-exclamation-triangle"></i> The enhanced search is having issues, but I can still help you learn about L'Oréal products using my knowledge!
        </div>
      </div>
    `;
    chatWindow.innerHTML += fallbackMessage;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Fall back to regular AI so students can continue learning
    await sendMessageToAI(userMessage, includeProducts);
  }
}

// Function to send a message to the AI using gpt-4o model (optimized)
async function sendMessageToAI(userMessage, includeProducts = false) {
  try {
    showLoadingMessage(false);

    const systemMessage = createSystemMessage(includeProducts, false);
    const messages = [
      { role: "system", content: systemMessage },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ];

    const response = await fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model: "gpt-4o" }),
    });

    removeLoadingMessage();

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    conversationHistory.push(
      { role: "user", content: userMessage },
      { role: "assistant", content: aiResponse }
    );

    displayAIMessage(aiResponse, false, false);
  } catch (error) {
    removeLoadingMessage();

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

// === LAYOUT REFRESH FUNCTIONS (optimized) ===

// Optimized layout refresh function
function refreshLayoutForDirection(direction) {
  if (isTranslating) {
    console.log("Skipping layout refresh - translation in progress");
    return;
  }

  const categories = [
    ...new Set(allProducts.map((product) => product.category)),
  ];
  createCategoryFilterOptions(categories);

  const currentFilter = getFilteredProducts();
  showProducts(currentFilter);
  updateSelectedProductsDisplay();
  updateAllElementsDirection(direction);

  console.log(
    `Layout refreshed for ${direction} direction with translation support`
  );
}

// Optimized helper functions
const refreshLayout = () => refreshLayoutForDirection(getCurrentDirection());
const restoreToNormalFormatting = () => applyLTRFormatting();

// Optimized language direction application
function applyLanguageDirection(language) {
  const direction = isRTLLanguage(language) ? "rtl" : "ltr";

  applyDirectionFormatting(direction);
  document.documentElement.setAttribute("lang", language);

  console.log(
    `Applied ${direction.toUpperCase()} formatting for language: ${language}`
  );
  localStorage.setItem("selectedLanguage", language);
}

// Load saved language preference (optimized)
function loadSavedLanguage() {
  const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
  applyLanguageDirection(savedLanguage);
}

// === EVENT HANDLERS (optimized to reduce duplication) ===

// Optimized function to add user message to chat
function addUserMessageToChat(userMessage) {
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
}

// === INITIALIZATION (optimized) ===

// Initialize the app when DOM is loaded (optimized)
document.addEventListener("DOMContentLoaded", () => {
  // Load saved data
  loadSavedLanguage();
  loadSavedProducts();
  loadProducts();
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

  // Add generate routine button listener (optimized)
  if (generateButton) {
    generateButton.addEventListener("click", () => {
      if (selectedProducts.length > 0) {
        const userMessage =
          "Please create a personalized beauty routine using my selected products and search for current information about these products.";
        addUserMessageToChat(userMessage);
        sendMessageToAIWithWebSearch(userMessage, true);
      }
    });
  }

  // Add chat form listener (optimized)
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const userInput = document.getElementById("userInput");

      if (userInput && userInput.value.trim()) {
        const userMessage = userInput.value.trim();
        addUserMessageToChat(userMessage);
        userInput.value = "";

        // Decide whether to use web search or regular AI
        if (shouldUseWebSearch(userMessage)) {
          console.log("Using web search for this query");
          sendMessageToAIWithWebSearch(userMessage, false);
        } else {
          console.log("Using regular AI for this query");
          sendMessageToAI(userMessage, false);
        }
      }
    });
  }

  console.log(
    "L'Oréal Routine Builder initialized successfully with RTL/LTR support"
  );
});
