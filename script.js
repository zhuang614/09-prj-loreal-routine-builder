// Beginner-friendly L'Oréal Routine Builder main script

// Get references to DOM elements
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const selectedProductsList = document.getElementById("selectedProductsList");
const generateButton = document.getElementById("generateRoutine");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Cloudflare Worker endpoint for AI API */
const WORKER_ENDPOINT = "https://loreal-chatbot.zhuang61.workers.dev/";

// Store all products and selected products
let allProducts = [];
let selectedProducts = [];

/* Array to store conversation history */
let conversationHistory = [];

// Store the full chat history for follow-up questions
let chatHistory = [];

// Load products from products.json
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  allProducts = data.products;
  showProducts(allProducts);
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

    // Card content with a description modal trigger button
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="product-name">${product.name}</div>
      <div class="product-category">${capitalize(product.category)}</div>
      <div class="product-brand">${product.brand ? product.brand : ""}</div>
      <button class="desc-btn" aria-haspopup="dialog">Show Description</button>
    `;

    // Click to select/unselect (but not when clicking the description button)
    card.addEventListener("click", function (e) {
      if (!e.target.classList.contains("desc-btn")) {
        toggleProduct(product);
      }
    });

    // Description modal logic
    const descBtn = card.querySelector(".desc-btn");
    descBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent card selection
      showProductModal(product);
    });

    productsContainer.appendChild(card);
  });
}

// Modal creation and logic
function showProductModal(product) {
  // Check if modal already exists, remove if so
  let modal = document.getElementById("productModal");
  if (modal) modal.remove();

  // Create modal elements
  modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "productModal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h3>${product.name}</h3>
          <div class="brand">${product.brand ? product.brand : ""}</div>
        </div>
        <button class="close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <img class="modal-product-image" src="${product.image}" alt="${
    product.name
  }">
        <div class="modal-description">${product.description}</div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Show modal
  modal.style.display = "block";

  // Close modal on click of close button or outside modal content
  modal.querySelector(".close").onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  // Accessibility: close on Escape key
  document.addEventListener("keydown", function escListener(ev) {
    if (ev.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", escListener);
    }
  });
}

// Capitalize first letter
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Load saved selected products from localStorage when the page loads
function loadSavedProducts() {
  // Get saved products from localStorage (returns null if nothing is saved)
  const savedProducts = localStorage.getItem("selectedProducts");

  // If we have saved products, parse them and update our list
  if (savedProducts) {
    selectedProducts = JSON.parse(savedProducts);
  }
}

// Save selected products to localStorage
function saveProductsToStorage() {
  // Convert our selectedProducts array to JSON and save it
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

// Add or remove product from selection (updated to save to localStorage)
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

  // Update the display
  showProducts(getFilteredProducts());
  updateSelectedProductsDisplay();
}

// Update the Selected Products section (updated to save to localStorage when clearing)
function updateSelectedProductsDisplay() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `
      <div class="empty-selection">
        No products selected yet. Click on product cards to add them to your routine.
      </div>
    `;
    generateButton.disabled = true;
  } else {
    selectedProductsList.innerHTML = `
      <div class="selected-products-header">
        <span class="selected-count">${selectedProducts.length} product${
      selectedProducts.length === 1 ? "" : "s"
    } selected</span>
        <button class="clear-all-btn" id="clearAllBtn" title="Clear all products">
          <i class="fas fa-trash"></i> Clear All
        </button>
      </div>
      <div class="selected-products-list">
        ${selectedProducts
          .map(
            (product) => `
            <div class="selected-product-item">
              <span>${product.name}</span>
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

    // Add event listeners for remove buttons (updated to save to localStorage)
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const id = Number(btn.getAttribute("data-id"));
        // Remove the product from our list
        selectedProducts = selectedProducts.filter((p) => p.id !== id);

        // Save the updated list to localStorage
        saveProductsToStorage();

        // Update the display
        showProducts(getFilteredProducts());
        updateSelectedProductsDisplay();
      });
    });

    // Add event listener for clear all (updated to save to localStorage)
    const clearAllBtn = document.getElementById("clearAllBtn");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        // Clear all selected products
        selectedProducts = [];

        // Save the empty list to localStorage
        saveProductsToStorage();

        // Update the display
        showProducts(getFilteredProducts());
        updateSelectedProductsDisplay();
      });
    }
  }
}

// Filter products by category
function getFilteredProducts() {
  const value = categoryFilter.value;
  if (!value) return allProducts;
  return allProducts.filter((p) => p.category === value);
}

// Listen for category filter changes
categoryFilter.addEventListener("change", () => {
  showProducts(getFilteredProducts());
});

// Show initial placeholder until user selects a category
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

// --- Chat & AI Routine Generation ---

/* Helper: Convert markdown to HTML (basic for beginners) */
function convertMarkdownToHtml(markdown) {
  // Simple replacements for bold, italics, and line breaks
  return markdown
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

/* Function to send a message to the AI */
async function sendMessageToAI(userMessage, includeProducts = false) {
  try {
    // Show loading message while waiting for response
    const loadingMessage = `
      <div class="chat-message ai-message loading">
        <div class="message-content">
          <i class="fas fa-spinner fa-spin"></i> Thinking...
        </div>
      </div>
    `;
    chatWindow.innerHTML += loadingMessage;
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Prepare the message with context
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

    // Send request to Cloudflare Worker
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

    // Parse the response
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Add user message to conversation history
    conversationHistory.push({ role: "user", content: userMessage });

    // Add AI response to conversation history
    conversationHistory.push({ role: "assistant", content: aiResponse });

    // Convert markdown to HTML for better formatting
    const formattedResponse = convertMarkdownToHtml(aiResponse);

    // Display the AI response
    const aiMessageHtml = `
      <div class="chat-message ai-message">
        <div class="message-content">
          ${formattedResponse}
        </div>
      </div>
    `;
    chatWindow.innerHTML += aiMessageHtml;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    // Remove loading message if there's an error
    const loadingElement = chatWindow.querySelector(".loading");
    if (loadingElement) {
      loadingElement.remove();
    }

    // Display error message
    const errorMessage = `
      <div class="chat-message error-message">
        <div class="message-content">
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
    return; // Button should be disabled anyway
  }

  // Clear chat window for the routine generation
  chatWindow.innerHTML = `
    <div class="chat-message user-message">
      <div class="message-content">
        Please create a personalized routine using my selected products.
      </div>
    </div>
  `;

  // Generate a complete and detailed routine based on selected products
  await sendMessageToAI(
    "Please create a comprehensive, step-by-step skincare and beauty routine using ONLY the products I've selected. Please include: 1) A complete morning routine with exact order of application, 2) A complete evening routine with exact order of application, 3) Detailed instructions for each product including how much to use and application techniques, 4) Wait times between products if needed, 5) Tips for best results, 6) Any important warnings or considerations. Be thorough and specific in your instructions.",
    true // include products context
  );
});

/* Chat form submission handler */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message
  const userInput = document.getElementById("userInput");
  const userMessage = userInput.value.trim();

  if (!userMessage) {
    return; // Don't send empty messages
  }

  // Display user message in chat
  const userMessageHtml = `
    <div class="chat-message user-message">
      <div class="message-content">
        ${userMessage}
      </div>
    </div>
  `;
  chatWindow.innerHTML += userMessageHtml;
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Clear the input field
  userInput.value = "";

  // Send message to AI
  await sendMessageToAI(userMessage, false);
});

// Initial load (updated to load saved products)
loadSavedProducts(); // Load saved products first
loadProducts(); // Then load all products and show them
updateSelectedProductsDisplay(); // Update the display with saved products
