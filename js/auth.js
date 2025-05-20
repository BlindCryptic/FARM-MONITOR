// Authentication Functions

// DOM Elements for Authentication
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerConfirm = document.getElementById('register-confirm');
const registerError = document.getElementById('register-error');

const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const logoutButton = document.getElementById('logout-button');

const userDisplayName = document.getElementById('user-display-name');

// Global flag to control auto-anonymous login
let allowAnonymousAuth = false;

// Login Function
function login(email, password) {
  if (!loginError) return;
  loginError.textContent = "";

  if (!email || !password) {
    loginError.textContent = "Please enter both email and password";
    return;
  }

  if (loginButton) {
    loginButton.innerHTML = '<span class="spinner"></span> Logging in...';
    loginButton.disabled = true;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      console.log("Logged in:", user.email);
      if (loginEmail) loginEmail.value = "";
      if (loginPassword) loginPassword.value = "";
      if (userDisplayName) userDisplayName.textContent = user.email;
      showSection('dashboard');
    })
    .catch(error => {
      console.error("Login error:", error);
      if (!loginError) return;
      switch (error.code) {
        case 'auth/invalid-email':
          loginError.textContent = "Invalid email format";
          break;
        case 'auth/user-disabled':
          loginError.textContent = "This account has been disabled";
          break;
        case 'auth/user-not-found':
          loginError.textContent = "Email not registered";
          break;
        case 'auth/wrong-password':
          loginError.textContent = "Wrong password";
          break;
        default:
          loginError.textContent = "Login failed. Please try again";
      }
    })
    .finally(() => {
      if (loginButton) {
        loginButton.textContent = "Login";
        loginButton.disabled = false;
      }
    });
}

// Register Function
function register(name, email, password, confirmPassword) {
  if (!registerError) return;
  registerError.textContent = "";

  if (!name || !email || !password || !confirmPassword) {
    registerError.textContent = "Please fill in all fields";
    return;
  }
  if (password !== confirmPassword) {
    registerError.textContent = "Passwords do not match";
    return;
  }
  if (password.length < 6) {
    registerError.textContent = "Password must be at least 6 characters";
    return;
  }

  if (registerButton) {
    registerButton.innerHTML = '<span class="spinner"></span> Creating account...';
    registerButton.disabled = true;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      console.log("Registered:", user.email);
      return user.updateProfile({
        displayName: name
      });
    })
    .then(() => {
      if (registerName) registerName.value = "";
      if (registerEmail) registerEmail.value = "";
      if (registerPassword) registerPassword.value = "";
      if (registerConfirm) registerConfirm.value = "";
      if (userDisplayName) userDisplayName.textContent = name;
      showSection('dashboard');
    })
    .catch(error => {
      console.error("Registration error:", error);
      if (!registerError) return;
      switch (error.code) {
        case 'auth/email-already-in-use':
          registerError.textContent = "Email already registered";
          break;
        case 'auth/invalid-email':
          registerError.textContent = "Invalid email format";
          break;
        case 'auth/weak-password':
          registerError.textContent = "Password is too weak";
          break;
        default:
          registerError.textContent = "Registration failed. Please try again";
      }
    })
    .finally(() => {
      if (registerButton) {
        registerButton.textContent = "Register";
        registerButton.disabled = false;
      }
    });
}

// Logout button event listener
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    allowAnonymousAuth = false; // disable anonymous auth on sign out
    auth.signOut().then(() => {
      console.log("User logged out");
      showSection('landing-page');
    });
  });
}

// Event Listeners for Login/Register
if (loginButton) {
  loginButton.addEventListener("click", () => {
    login(loginEmail?.value, loginPassword?.value);
  });
}

if (registerButton) {
  registerButton.addEventListener("click", () => {
    register(
      registerName?.value,
      registerEmail?.value,
      registerPassword?.value,
      registerConfirm?.value
    );
  });
}

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    if (userDisplayName) {
      userDisplayName.textContent = user.displayName || user.email || "Guest";
    }
    showSection('dashboard');

    if (user.isAnonymous) {
      console.log("Using anonymous session");
    }
  } else if (allowAnonymousAuth) {
    // Anonymous fallback only if allowed
    auth.signInAnonymously()
      .catch(error => {
        console.error("Auth fallback failed:", error);
        showSection('landing-page');
      });
  } else {
    showSection('landing-page');
  }
});
