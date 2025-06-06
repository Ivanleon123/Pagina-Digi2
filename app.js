// app.js

// ===== 1) Inicializar Firebase =====
// Sustituye cada "TU_…" por tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD6jY3Qhg18pzNFxAryxXZqQ6-EDbFExt4",
  authDomain: "digi-cf6a6.firebaseapp.com",
  projectId: "digi-cf6a6",
  storageBucket: "digi-cf6a6.firebasestorage.app",
  messagingSenderId: "391601220801",
  appId: "1:391601220801:web:0265eac126fb0b16bcb840",
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();

// ===== 2) Referencias a elementos del DOM =====
// Contenedor de Auth
const authContainer = document.getElementById("auth-container");
const tabLogin      = document.getElementById("tab-login");
const tabSignup     = document.getElementById("tab-signup");
const loginForm     = document.getElementById("login-form");
const signupForm    = document.getElementById("signup-form");
const loginStatus   = document.getElementById("login-status");
const signupStatus  = document.getElementById("signup-status");

// Contenedor de Contactos
const contactsContainer = document.getElementById("contacts-container");
const logoutBtn         = document.getElementById("logout-btn");
const contactForm       = document.getElementById("contact-form");
const contactStatus     = document.getElementById("contact-status");

// ===== 3) Funciones auxiliares =====
function showElement(el) {
  el.classList.remove("hidden");
}
function hideElement(el) {
  el.classList.add("hidden");
}
function activateTab(tabButton, formToShow) {
  // Desactivar ambos tabs y ambos formularios
  tabLogin.classList.remove("active");
  tabSignup.classList.remove("active");
  loginForm.classList.remove("active-form");
  signupForm.classList.remove("active-form");
  // Activar el seleccionado
  tabButton.classList.add("active");
  formToShow.classList.add("active-form");
}
function clearContactForm() {
  contactForm.reset();
}

// ===== 4) Alternar pestañas (Login / Signup) =====
tabLogin.addEventListener("click", () => {
  activateTab(tabLogin, loginForm);
  loginStatus.textContent = "";
  loginStatus.className = "hidden";
});
tabSignup.addEventListener("click", () => {
  activateTab(tabSignup, signupForm);
  signupStatus.textContent = "";
  signupStatus.className = "hidden";
});

// ===== 5) Estado de autenticación =====
auth.onAuthStateChanged(user => {
  if (user) {
    // Usuario autenticado: ocultar Auth y mostrar contactos
    hideElement(authContainer);
    showElement(contactsContainer);
  } else {
    // No hay usuario: mostrar Auth y ocultar contactos
    showElement(authContainer);
    hideElement(contactsContainer);
  }
});

// ===== 6) Registro de nuevos usuarios =====
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupStatus.textContent = "";
  signupStatus.className = "hidden";

  const email    = document.getElementById("signup-email").value.trim();
  const pass1    = document.getElementById("signup-password").value;
  const pass2    = document.getElementById("signup-password2").value;

  if (pass1 !== pass2) {
    signupStatus.textContent = "Las contraseñas no coinciden.";
    signupStatus.className = "error";
    return;
  }

  try {
    await auth.createUserWithEmailAndPassword(email, pass1);
    signupStatus.textContent = "Cuenta creada. Iniciando sesión…";
    signupStatus.className = "success";
    // Una vez creado, onAuthStateChanged detectará el login automático y mostrará contactos
  } catch (error) {
    console.error("Error registrando usuario:", error);
    signupStatus.textContent = "Error al registrarse: " + error.message;
    signupStatus.className = "error";
  }
});

// ===== 7) Login de usuarios existentes =====
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginStatus.textContent = "";
  loginStatus.className = "hidden";

  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // onAuthStateChanged se encargará de mostrar contactos
  } catch (error) {
    console.error("Error en login:", error);
    loginStatus.textContent = "Correo o contraseña incorrectos.";
    loginStatus.className = "error";
  }
});

// ===== 8) Logout =====
logoutBtn.addEventListener("click", async () => {
  try {
    await auth.signOut();
    // onAuthStateChanged mostrará la pantalla de Auth
  } catch (error) {
    console.error("Error cerrando sesión:", error);
  }
});

// ===== 9) Guardar contacto en Firestore =====
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  contactStatus.textContent = "";
  contactStatus.className = "hidden";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const phone     = document.getElementById("phone").value.trim();
  const email     = document.getElementById("emailContact").value.trim();
  const gender    = document.getElementById("gender").value;
  const age       = parseInt(document.getElementById("age").value, 10);

  if (isNaN(age) || age < 0) {
    contactStatus.textContent = "La edad debe ser un número válido.";
    contactStatus.className = "error";
    return;
  }

  const newContact = {
    firstName,
    lastName,
    phone,
    email,
    gender,
    age,
    uid: auth.currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    const docRef = await db.collection("contacts").add(newContact);
    console.log("Contacto creado con ID:", docRef.id);
    contactStatus.textContent = "Contacto guardado correctamente 👍";
    contactStatus.className = "success";
    clearContactForm();
  } catch (error) {
    console.error("Error guardando contacto:", error);
    contactStatus.textContent = "Error al guardar. Revisa la consola.";
    contactStatus.className = "error";
  }

  setTimeout(() => {
    contactStatus.textContent = "";
    contactStatus.className = "hidden";
  }, 3000);
});
