// DOM Elements
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const cartModal = document.getElementById('cart-modal');
const closeButtons = document.querySelectorAll('.close-button');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const cartNotification = document.getElementById('cart-notification');
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const continueShoppingBtn = document.getElementById('continue-shopping');
const checkoutBtn = document.getElementById('checkout-btn');
const contactForm = document.getElementById('contact-form');
const buyButtons = document.querySelectorAll('.buy-button');

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
updateCartCount();

// Initialize users in localStorage if not exists
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}

// Event Listeners for Modal Controls
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
});

registerBtn.addEventListener('click', () => {
    registerModal.style.display = 'flex';
});

// Add to Cart functionality for all buy buttons
buyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        const name = e.target.dataset.name || productCard.querySelector('.product-title').textContent;
        const priceText = e.target.dataset.price || productCard.querySelector('.product-price').textContent;
        const price = parseInt(priceText.replace(' BDT', '').replace(/,/g, ''));
        const image = e.target.dataset.image || productCard.querySelector('img').src;
        
        addToCart(name, price, image);
    });
});

// Open cart modal
cartIcon.addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    renderCart();
    cartModal.style.display = 'flex';
});

// Close modals
closeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal, .cart-modal');
        modal.style.display = 'none';
    });
});

// Continue shopping button
continueShoppingBtn.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

// Switch between login and register modals
showRegister.addEventListener('click', () => {
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
});

showLogin.addEventListener('click', () => {
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === registerModal) {
        registerModal.style.display = 'none';
    }
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// Login form submission
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
   
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
   
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification('Login successful!');
        loginModal.style.display = 'none';
        updateAuthButtons();
    } else {
        showNotification('Invalid email or password', 'error');
    }
});

// Registration form submission
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('register-first-name').value;
    const lastName = document.getElementById('register-last-name').value;
    const name = `${firstName} ${lastName}`;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
   
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
   
    const users = JSON.parse(localStorage.getItem('users') || '[]');
   
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showNotification('User with this email already exists', 'error');
        return;
    }
   
    // Add new user
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
   
    showNotification('Registration successful! Please login.');
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
    document.getElementById('register-form').reset();
});

// Contact form submission
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showNotification('Message sent successfully! We will contact you soon.');
    contactForm.reset();
});

// Shop Now button in hero section
document.querySelector('.hero .cta-button').addEventListener('click', () => {
    document.querySelector('#men').scrollIntoView({
        behavior: 'smooth'
    });
});

// Functions
function addToCart(name, price, image) {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showNotification('Please login to add items to cart', 'error');
        loginModal.style.display = 'flex';
        return;
    }

    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
    showNotification(`${name} added to cart!`);
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
        cartTotalElement.textContent = '0';
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/90x100?text=No+Image'">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price} BDT</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <div class="cart-item-total" style="font-weight: bold; margin-right: 16px;">${itemTotal} BDT</div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    cartTotalElement.textContent = total;
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    
    if (cart.length === 0) {
        setTimeout(() => {
            cartModal.style.display = 'none';
        }, 500);
    }
}

// Checkout function
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`Order placed successfully! Total: ${total} BDT`);
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    cartModal.style.display = 'none';
});

function updateAuthButtons() {
    const currentUser = localStorage.getItem('currentUser');
    const authButtons = document.querySelector('.auth-buttons');
   
    if (currentUser) {
        const user = JSON.parse(currentUser);
        authButtons.innerHTML = `
            <span class="welcome-message">Welcome, ${user.name}</span>
            <button id="logout-btn">Logout</button>
        `;
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            updateAuthButtons();
            showNotification('Logged out successfully');
        });
    } else {
        authButtons.innerHTML = `
            <button id="login-btn">Login</button>
            <button id="register-btn">Register</button>
        `;
        // Reattach event listeners
        document.getElementById('login-btn').addEventListener('click', () => {
            loginModal.style.display = 'flex';
        });
        document.getElementById('register-btn').addEventListener('click', () => {
            registerModal.style.display = 'flex';
        });
    }
}

function showNotification(message, type = 'success') {
    cartNotification.textContent = message;
    cartNotification.style.backgroundColor = type === 'error' ? 'red' : 'rgb(121, 209, 173)';
    cartNotification.style.display = 'block';
   
    setTimeout(() => {
        cartNotification.style.display = 'none';
    }, 3000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButtons();
    
    // Add hover effects to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});