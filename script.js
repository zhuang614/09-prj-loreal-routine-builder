// Beginner-friendly L'Oréal Routine Builder main script

// Get references to DOM elements
const categoryFilter = document.getElementById("categoryFilter");
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

// Check if current language is RTL (updated with more RTL languages!)
function isRTLLanguage(language) {
  // Comprehensive list of RTL languages for beginners to understand
  const RTL_LANGUAGES = [
    "ar", // Arabic
    "he", // Hebrew
    "fa", // Persian/Farsi
    "ur", // Urdu
    "arc", // Aramaic
    "dv", // Dhivehi/Maldivian
    "syr", // Syriac
    "ps", // Pashto
    "sd", // Sindhi
    "ug", // Uyghur
    "yi", // Yiddish
  ];
  return RTL_LANGUAGES.includes(language);
}

// Load saved language preference (this function was missing!)
function loadSavedLanguage() {
  // Get saved language from localStorage (returns null if nothing is saved)
  const savedLanguage = localStorage.getItem("selectedLanguage");

  // If we have a saved language, apply it
  if (savedLanguage) {
    applyLanguageDirection(savedLanguage);
  } else {
    // Default to English (LTR)
    applyLanguageDirection("en");
  }
}

// Function to translate the page content (this function was missing!)
function translatePage(language) {
  // Simple translation function for beginners
  // You can expand this with more translations as needed
  console.log(`Page translated to: ${language}`);
}

// Load products from products.json
async function loadProducts() {
  try {
    // Use async/await to fetch products data
    const response = await fetch("products.json");
    const data = await response.json();
    allProducts = data.products;

    // Debug log for beginners to see what categories exist
    const categories = [...new Set(allProducts.map((p) => p.category))];
    console.log("Available categories:", categories);

    // Show all products initially
    showProducts(allProducts);
  } catch (error) {
    // Handle errors for beginners
    console.error("Error loading products:", error);
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        Error loading products. Please check your products.json file.
      </div>
    `;
  }
}

// Filter products by category (updated with better debugging)
function getFilteredProducts() {
  const value = categoryFilter.value;

  // Debug log for beginners to understand filtering
  console.log(`Selected category filter: "${value}"`);

  // Show all products if no category selected
  if (!value) {
    console.log("No filter selected, showing all products");
    return allProducts;
  }

  // Filter products by matching category exactly
  const filteredProducts = allProducts.filter(
    (product) => product.category === value
  );

  // Debug log to help beginners understand what's happening
  console.log(
    `Found ${filteredProducts.length} products in category "${value}"`
  );

  return filteredProducts;
}

// Show products in the grid
function showProducts(products) {
  // Clear the container first
  productsContainer.innerHTML = "";

  // Debug log for beginners
  console.log(`Displaying ${products.length} products`);

  // If no products to show, display a helpful message
  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        No products found in this category. Try selecting a different category.
      </div>
    `;
    return;
  }

  // Get current language direction
  const currentDir = document.documentElement.getAttribute("dir") || "ltr";
  const isRTL = currentDir === "rtl";

  // Create a card for each product
  products.forEach((product) => {
    // Create product card element
    const card = document.createElement("div");
    card.className = "product-card";

    // Apply RTL/LTR direction to the card
    if (isRTL) {
      card.style.direction = "rtl";
      card.setAttribute("dir", "rtl");
    } else {
      card.style.direction = "ltr";
      card.setAttribute("dir", "ltr");
    }

    // Highlight if this product is selected
    if (selectedProducts.some((p) => p.id === product.id)) {
      card.classList.add("selected");
    }

    // Set card content using template literals (beginner-friendly)
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-name" dir="${currentDir}">${product.name}</div>
      <div class="product-category" dir="${currentDir}">${capitalize(
      product.category
    )}</div>
      <div class="product-brand" dir="${currentDir}">${
      product.brand ? product.brand : ""
    }</div>
      <button class="desc-btn" aria-haspopup="dialog" dir="${currentDir}">Show Description</button>
    `;

    // Add click event to select/unselect product
    card.addEventListener("click", function (e) {
      // Don't select if user clicked the description button
      if (!e.target.classList.contains("desc-btn")) {
        toggleProduct(product);
      }
    });

    // Add click event for description button
    const descBtn = card.querySelector(".desc-btn");
    descBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent card selection
      showProductModal(product);
    });

    // Add the card to the products container
    productsContainer.appendChild(card);
  });
}

// Listen for category filter changes (updated with debugging)
categoryFilter.addEventListener("change", () => {
  // Get filtered products based on selected category
  const filteredProducts = getFilteredProducts();

  // Show the filtered products
  showProducts(filteredProducts);
});

// Modal creation and logic
function showProductModal(product) {
  // Check if modal already exists, remove if so
  let modal = document.getElementById("productModal");
  if (modal) modal.remove();

  // Get current language direction
  const currentDir = document.documentElement.getAttribute("dir") || "ltr";

  // Create modal elements using template literals
  modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "productModal";
  modal.setAttribute("dir", currentDir);

  modal.innerHTML = `
    <div class="modal-content" dir="${currentDir}">
      <div class="modal-header" dir="${currentDir}">
        <div>
          <h3 dir="${currentDir}">${product.name}</h3>
          <div class="brand" dir="${currentDir}">${
    product.brand ? product.brand : ""
  }</div>
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

  // Show modal
  modal.style.display = "block";

  // Close modal events
  modal.querySelector(".close").onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  // Close on Escape key for accessibility
  document.addEventListener("keydown", function escListener(ev) {
    if (ev.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", escListener);
    }
  });
}

// Capitalize first letter helper function
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Load saved selected products from localStorage
function loadSavedProducts() {
  const savedProducts = localStorage.getItem("selectedProducts");
  if (savedProducts) {
    selectedProducts = JSON.parse(savedProducts);
  }
}

// Save selected products to localStorage
function saveProductsToStorage() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

// Add or remove product from selection
function toggleProduct(product) {
  const index = selectedProducts.findIndex((p) => p.id === product.id);
  if (index === -1) {
    // Product not selected, so add it
    selectedProducts.push(product);
  } else {
    // Product already selected, so remove it
    selectedProducts.splice(index, 1);
  }

  // Save the updated list to localStorage
  saveProductsToStorage();

  // Update the display with current filter
  showProducts(getFilteredProducts());
  updateSelectedProductsDisplay();
}

// Update the Selected Products section
function updateSelectedProductsDisplay() {
  // Get current language direction
  const currentDir = document.documentElement.getAttribute("dir") || "ltr";

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
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const id = Number(btn.getAttribute("data-id"));
        selectedProducts = selectedProducts.filter((p) => p.id !== id);
        saveProductsToStorage();
        showProducts(getFilteredProducts());
        updateSelectedProductsDisplay();
      });
    });

    // Add event listener for clear all button
    const clearAllBtn = document.getElementById("clearAllBtn");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        selectedProducts = [];
        saveProductsToStorage();
        showProducts(getFilteredProducts());
        updateSelectedProductsDisplay();
      });
    }
  }
}

// Show initial placeholder
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Loading products...
  </div>
`;

// --- Chat & AI Routine Generation ---

/* Helper: Convert markdown to HTML */
function convertMarkdownToHtml(markdown) {
  return markdown
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

/* Function to send a message to the AI */
async function sendMessageToAI(userMessage, includeProducts = false) {
  try {
    // Get current language direction
    const currentDir = document.documentElement.getAttribute("dir") || "ltr";

    // Show loading message with proper direction
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
        model: "gpt-4o",
      }),
    });

    // Remove loading message
    const loadingElement = chatWindow.querySelector(".loading");
    if (loadingElement) {
      loadingElement.remove();
    }

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse the response and check for data.choices[0].message.content
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Add to conversation history
    conversationHistory.push({ role: "user", content: userMessage });
    conversationHistory.push({ role: "assistant", content: aiResponse });

    // Convert markdown to HTML and display with proper direction
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
    if (loadingElement) {
      loadingElement.remove();
    }

    // Get current language direction for error message
    const currentDir = document.documentElement.getAttribute("dir") || "ltr";

    // Display error message using template literals with proper direction
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

/* Generate Routine button click handler */
generateButton.addEventListener("click", async () => {
  if (selectedProducts.length === 0) {
    return;
  }

  // Get current language direction
  const currentDir = document.documentElement.getAttribute("dir") || "ltr";

  // Clear chat window and show user message with proper direction
  chatWindow.innerHTML = `
    <div class="chat-message user-message">
      <div class="message-content" dir="${currentDir}">
        Please create a personalized routine using my selected products.
      </div>
    </div>
  `;

  // Send detailed routine request to AI
  await sendMessageToAI(
    "Please create a comprehensive, step-by-step skincare and beauty routine using ONLY the products I've selected. Please include: 1) A complete morning routine with exact order of application, 2) A complete evening routine with exact order of application, 3) Detailed instructions for each product including how much to use and application techniques, 4) Wait times between products if needed, 5) Tips for best results, 6) Any important warnings or considerations. Be thorough and specific in your instructions.",
    true
  );
});

/* Chat form submission handler */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = document.getElementById("userInput");
  const userMessage = userInput.value.trim();

  if (!userMessage) {
    return;
  }

  // Get current language direction
  const currentDir = document.documentElement.getAttribute("dir") || "ltr";

  // Display user message using template literals with proper direction
  const userMessageHtml = `
    <div class="chat-message user-message">
      <div class="message-content" dir="${currentDir}">
        ${userMessage}
      </div>
    </div>
  `;
  chatWindow.innerHTML += userMessageHtml;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  userInput.value = "";
  await sendMessageToAI(userMessage, false);
});

// Function to detect RTL content from page text (this function was missing!)
function detectRTLFromPageContent() {
  // Get all text content from the page
  const pageText = document.body.textContent || document.body.innerText || "";

  // RTL character ranges (Arabic, Hebrew, etc.)
  const rtlCharPattern =
    /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

  // Check if page contains RTL characters
  if (rtlCharPattern.test(pageText)) {
    const currentDir = document.documentElement.getAttribute("dir");

    // Only apply RTL if not already applied
    if (currentDir !== "rtl") {
      document.documentElement.setAttribute("dir", "rtl");
      document.body.classList.add("rtl-layout");
      document.body.classList.remove("ltr-layout");

      // Debug log for beginners
      console.log(
        "Detected RTL characters in page content, applied RTL formatting"
      );

      // Refresh layout to apply RTL formatting
      const currentFilter = getFilteredProducts();
      showProducts(currentFilter);
      updateSelectedProductsDisplay();
    }
  } else {
    // If no RTL characters found, ensure LTR formatting
    const currentDir = document.documentElement.getAttribute("dir");
    if (currentDir !== "ltr") {
      restoreToNormalFormatting();
    }
  }
}

// Enhanced function to apply proper text direction based on content
function applyTextDirection(element, language) {
  // Apply direction to specific elements for better RTL support
  if (isRTLLanguage(language)) {
    // Set RTL direction for text elements
    element.style.direction = "rtl";
    element.style.textAlign = "right";
    element.setAttribute("dir", "rtl");
  } else {
    // Set LTR direction for text elements
    element.style.direction = "ltr";
    element.style.textAlign = "left";
    element.setAttribute("dir", "ltr");
  }
}

// Enhanced showProducts function with better RTL support
function showProducts(products) {
  // Clear the container first
  productsContainer.innerHTML = "";

  // Debug log for beginners
  console.log(`Displaying ${products.length} products`);

  // If no products to show, display a helpful message
  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="placeholder-message">
        No products found in this category. Try selecting a different category.
      </div>
    `;
    return;
  }

  // Get current language direction
  const currentDir = document.documentElement.getAttribute("dir") || "ltr";
  const isRTL = currentDir === "rtl";

  // Create a card for each product
  products.forEach((product) => {
    // Create product card element
    const card = document.createElement("div");
    card.className = "product-card";

    // Apply RTL/LTR direction to the card
    if (isRTL) {
      card.style.direction = "rtl";
      card.setAttribute("dir", "rtl");
    } else {
      card.style.direction = "ltr";
      card.setAttribute("dir", "ltr");
    }

    // Highlight if this product is selected
    if (selectedProducts.some((p) => p.id === product.id)) {
      card.classList.add("selected");
    }

    // Set card content using template literals (beginner-friendly)
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-name" dir="${currentDir}">${product.name}</div>
      <div class="product-category" dir="${currentDir}">${capitalize(
      product.category
    )}</div>
      <div class="product-brand" dir="${currentDir}">${
      product.brand ? product.brand : ""
    }</div>
      <button class="desc-btn" aria-haspopup="dialog" dir="${currentDir}">Show Description</button>
    `;

    // Add click event to select/unselect product
    card.addEventListener("click", function (e) {
      // Don't select if user clicked the description button
      if (!e.target.classList.contains("desc-btn")) {
        toggleProduct(product);
      }
    });

    // Add click event for description button
    const descBtn = card.querySelector(".desc-btn");
    descBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent card selection
      showProductModal(product);
    });

    // Add the card to the products container
    productsContainer.appendChild(card);
  });
}

// Enhanced modal function with RTL support
function showProductModal(product) {
  // Check if modal already exists, remove if so
  let modal = document.getElementById("productModal");
  if (modal) modal.remove();

  // Get current language direction
  const currentDir = document.documentElement.getAttribute("dir") || "ltr";

  // Create modal elements using template literals
  modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "productModal";
  modal.setAttribute("dir", currentDir);

  modal.innerHTML = `
    <div class="modal-content" dir="${currentDir}">
      <div class="modal-header" dir="${currentDir}">
        <div>
          <h3 dir="${currentDir}">${product.name}</h3>
          <div class="brand" dir="${currentDir}">${
    product.brand ? product.brand : ""
  }</div>
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

  // Show modal
  modal.style.display = "block";

  // Close modal events
  modal.querySelector(".close").onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  // Close on Escape key for accessibility
  document.addEventListener("keydown", function escListener(ev) {
    if (ev.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", escListener);
    }
  });
}

// Enhanced updateSelectedProductsDisplay with RTL support
function updateSelectedProductsDisplay() {
  // Get current language direction
  const currentDir = document.documentElement.getAttribute("dir") || "ltr";

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
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const id = Number(btn.getAttribute("data-id"));
        selectedProducts = selectedProducts.filter((p) => p.id !== id);
        saveProductsToStorage();
        showProducts(getFilteredProducts());
        updateSelectedProductsDisplay();
      });
    });

    // Add event listener for clear all button
    const clearAllBtn = document.getElementById("clearAllBtn");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        selectedProducts = [];
        saveProductsToStorage();
        showProducts(getFilteredProducts());
        updateSelectedProductsDisplay();
      });
    }
  }
}

// Enhanced chat message display with RTL support
async function sendMessageToAI(userMessage, includeProducts = false) {
  try {
    // Get current language direction
    const currentDir = document.documentElement.getAttribute("dir") || "ltr";

    // Show loading message with proper direction
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
        model: "gpt-4o",
      }),
    });

    // Remove loading message
    const loadingElement = chatWindow.querySelector(".loading");
    if (loadingElement) {
      loadingElement.remove();
    }

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse the response and check for data.choices[0].message.content
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Add to conversation history
    conversationHistory.push({ role: "user", content: userMessage });
    conversationHistory.push({ role: "assistant", content: aiResponse });

    // Convert markdown to HTML and display with proper direction
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
    if (loadingElement) {
      loadingElement.remove();
    }

    // Get current language direction for error message
    const currentDir = document.documentElement.getAttribute("dir") || "ltr";

    // Display error message using template literals with proper direction
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

// Enhanced chat form submission with RTL support
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userInput = document.getElementById("userInput");
  const userMessage = userInput.value.trim();

  if (!userMessage) {
    return;
  }

  // Get current language direction
  const currentDir = document.documentElement.getAttribute("dir") || "ltr";

  // Display user message using template literals with proper direction
  const userMessageHtml = `
    <div class="chat-message user-message">
      <div class="message-content" dir="${currentDir}">
        ${userMessage}
      </div>
    </div>
  `;
  chatWindow.innerHTML += userMessageHtml;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  userInput.value = "";
  await sendMessageToAI(userMessage, false);
});

// Enhanced generate routine button with RTL support
generateButton.addEventListener("click", async () => {
  if (selectedProducts.length === 0) {
    return;
  }

  // Get current language direction
  const currentDir = document.documentElement.getAttribute("dir") || "ltr";

  // Clear chat window and show user message with proper direction
  chatWindow.innerHTML = `
    <div class="chat-message user-message">
      <div class="message-content" dir="${currentDir}">
        Please create a personalized routine using my selected products.
      </div>
    </div>
  `;

  // Send detailed routine request to AI
  await sendMessageToAI(
    "Please create a comprehensive, step-by-step skincare and beauty routine using ONLY the products I've selected. Please include: 1) A complete morning routine with exact order of application, 2) A complete evening routine with exact order of application, 3) Detailed instructions for each product including how much to use and application techniques, 4) Wait times between products if needed, 5) Tips for best results, 6) Any important warnings or considerations. Be thorough and specific in your instructions.",
    true
  );
});

// Enhanced Google Translate detection function (updated to restore normal formatting)
function detectGoogleTranslateLanguage() {
  // Check if Google Translate dropdown exists
  const translateElement = document.querySelector(".goog-te-combo");

  if (translateElement) {
    // Listen for Google Translate language changes
    translateElement.addEventListener("change", function () {
      // Small delay to let Google Translate finish translating
      setTimeout(() => {
        const selectedValue = translateElement.value;

        // Debug log for beginners to see what language was selected
        console.log(`Google Translate selected: ${selectedValue}`);

        // Check if user selected "Original" (no translation) - this restores to normal
        if (
          !selectedValue ||
          selectedValue === "" ||
          selectedValue === "auto"
        ) {
          // Restore to normal English LTR formatting
          document.documentElement.setAttribute("dir", "ltr");
          document.documentElement.setAttribute("lang", "en");
          document.body.classList.add("ltr-layout");
          document.body.classList.remove("rtl-layout");

          console.log("Restored to original English (LTR) formatting");

          // Refresh layout to show normal formatting
          const currentFilter = getFilteredProducts();
          showProducts(currentFilter);
          updateSelectedProductsDisplay();
          return; // Exit early since we've restored to normal
        }

        // Enhanced language mapping for RTL languages
        const rtlLanguageMap = {
          ar: "ar", // Arabic
          he: "he", // Hebrew
          fa: "fa", // Persian/Farsi
          ur: "ur", // Urdu
          arc: "arc", // Aramaic
          az: "az", // Azerbaijani
          dv: "dv", // Dhivehi
          ku: "ku", // Kurdish
          syr: "syr", // Syriac
          ff: "ff", // Fula
          ps: "ps", // Pashto
          sd: "sd", // Sindhi
          ug: "ug", // Uyghur
          yi: "yi", // Yiddish
        };

        // Apply RTL formatting if the language is RTL
        if (rtlLanguageMap[selectedValue]) {
          // Set RTL direction for the entire page
          document.documentElement.setAttribute("dir", "rtl");
          document.documentElement.setAttribute("lang", selectedValue);
          document.body.classList.add("rtl-layout");
          document.body.classList.remove("ltr-layout");

          // Debug log for beginners
          console.log(`Applied RTL formatting for language: ${selectedValue}`);
        } else {
          // Set LTR direction for non-RTL languages (normal formatting)
          document.documentElement.setAttribute("dir", "ltr");
          document.documentElement.setAttribute("lang", selectedValue || "en");
          document.body.classList.add("ltr-layout");
          document.body.classList.remove("rtl-layout");

          // Debug log for beginners
          console.log(
            `Applied normal LTR formatting for language: ${selectedValue}`
          );
        }

        // Force refresh of product layout to apply new direction
        const currentFilter = getFilteredProducts();
        showProducts(currentFilter);
        updateSelectedProductsDisplay();
      }, 1000); // Delay to ensure Google Translate has finished
    });
  } else {
    // If Google Translate isn't loaded yet, try again in 1 second
    setTimeout(detectGoogleTranslateLanguage, 1000);
  }
}

// Function to restore website to normal LTR formatting (beginner-friendly helper)
function restoreToNormalFormatting() {
  // Reset to normal English LTR formatting
  document.documentElement.setAttribute("dir", "ltr");
  document.documentElement.setAttribute("lang", "en");
  document.body.classList.add("ltr-layout");
  document.body.classList.remove("rtl-layout");

  // Debug log for beginners
  console.log("Website restored to normal LTR formatting");

  // Refresh the layout to show normal formatting
  const currentFilter = getFilteredProducts();
  showProducts(currentFilter);
  updateSelectedProductsDisplay();
}

// Enhanced function to continuously monitor for Google Translate changes
function monitorGoogleTranslate() {
  // Check every 2 seconds if Google Translate has changed the page
  setInterval(() => {
    // Look for Google Translate's language indicator
    const gtCombo = document.querySelector(".goog-te-combo");

    if (gtCombo) {
      const currentLang = gtCombo.value;
      const currentDir = document.documentElement.getAttribute("dir");

      // Check if user has reset to original language (no translation)
      if (!currentLang || currentLang === "" || currentLang === "auto") {
        // Restore to normal if not already normal
        if (currentDir !== "ltr") {
          restoreToNormalFormatting();
        }
        return; // Exit early since we've handled the restoration
      }

      // Check if we need to update RTL/LTR based on current language
      if (isRTLLanguage(currentLang) && currentDir !== "rtl") {
        // Apply RTL formatting
        document.documentElement.setAttribute("dir", "rtl");
        document.documentElement.setAttribute("lang", currentLang);
        document.body.classList.add("rtl-layout");
        document.body.classList.remove("ltr-layout");
        console.log(`Corrected to RTL for language: ${currentLang}`);

        // Refresh layout
        const currentFilter = getFilteredProducts();
        showProducts(currentFilter);
        updateSelectedProductsDisplay();
      } else if (!isRTLLanguage(currentLang) && currentDir !== "ltr") {
        // Apply normal LTR formatting
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.setAttribute("lang", currentLang);
        document.body.classList.add("ltr-layout");
        document.body.classList.remove("rtl-layout");
        console.log(`Corrected to normal LTR for language: ${currentLang}`);

        // Refresh layout
        const currentFilter = getFilteredProducts();
        showProducts(currentFilter);
        updateSelectedProductsDisplay();
      }
    } else {
      // If Google Translate dropdown doesn't exist, restore to normal
      const currentDir = document.documentElement.getAttribute("dir");
      if (currentDir !== "ltr") {
        restoreToNormalFormatting();
      }
    }

    // Also check page content for RTL characters
    detectRTLFromPageContent();
  }, 2000); // Check every 2 seconds
}

// Enhanced function to detect when Google Translate is completely removed
function detectGoogleTranslateRemoval() {
  // Check if Google Translate elements are completely gone
  const gtElements = document.querySelectorAll(
    ".goog-te-combo, .goog-te-gadget, #google_translate_element"
  );

  if (gtElements.length === 0) {
    // Google Translate has been removed, restore to normal
    restoreToNormalFormatting();
    console.log("Google Translate removed, restored to normal formatting");
  }
}

// Apply language direction function (updated to handle restoration better)
function applyLanguageDirection(language) {
  const body = document.body;
  const html = document.documentElement;

  // Check if the selected language is RTL using our enhanced function
  if (isRTLLanguage(language)) {
    // Apply RTL direction for all RTL languages
    html.setAttribute("dir", "rtl");
    html.setAttribute("lang", language);
    body.classList.add("rtl-layout");
    body.classList.remove("ltr-layout");

    // Debug log for beginners
    console.log(`Applied RTL formatting for language: ${language}`);
  } else {
    // Apply normal LTR direction for English and other LTR languages
    html.setAttribute("dir", "ltr");
    html.setAttribute("lang", language);
    body.classList.add("ltr-layout");
    body.classList.remove("rtl-layout");

    // Debug log for beginners
    console.log(`Applied normal LTR formatting for language: ${language}`);
  }

  // Translate the page content using our custom translations
  translatePage(language);

  // Save language preference to localStorage for beginners to understand persistence
  localStorage.setItem("selectedLanguage", language);
}

// Enhanced initial load - Load everything in the right order for beginners
loadSavedLanguage();
loadSavedProducts();
loadProducts();
updateSelectedProductsDisplay();

// Enhanced Google Translate detection with multiple fallbacks
setTimeout(() => {
  console.log("Starting Google Translate detection...");
  detectGoogleTranslateLanguage();
}, 2000);

// Start continuous monitoring for Google Translate changes
setTimeout(() => {
  console.log("Starting Google Translate monitoring...");
  monitorGoogleTranslate();
}, 5000);

// Monitor for Google Translate removal
setTimeout(() => {
  console.log("Starting Google Translate removal monitoring...");
  setInterval(detectGoogleTranslateRemoval, 3000); // Check every 3 seconds
}, 7000);

// Also check when the page finishes loading completely
window.addEventListener("load", () => {
  setTimeout(() => {
    detectGoogleTranslateLanguage();
    detectRTLFromPageContent();
  }, 3000);
});

// Listen for page visibility changes to restore normal formatting when needed
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // When page becomes visible, check if we need to restore normal formatting
    setTimeout(() => {
      const gtCombo = document.querySelector(".goog-te-combo");
      if (!gtCombo || !gtCombo.value) {
        restoreToNormalFormatting();
      }
    }, 1000);
  }
});
