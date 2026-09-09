// =========================================================
// AUTENTICACION: LOGIN, REGISTRO Y PERFIL
// =========================================================

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;

  const normalized = normalizeEmail(email);
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

  return emailRegex.test(normalized);
}

function isValidDuocEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[a-zA-Z0-9._%+-]+@duoc\.cl$/i.test(normalizeEmail(email));
}

function isValidName(name) {
  const value = String(name || "").trim();
  return value.length >= 1 && value.length <= 100;
}

function isValidPassword(password) {
  const value = String(password || "");
  return value.length >= 4 && value.length <= 13 && /[A-Z]/.test(value);
}

function isAdultBirthDate(birthDate) {
  if (!birthDate) return false;

  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const birthdayPending =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() < birth.getDate());

  if (birthdayPending) age -= 1;

  return age >= 14;
}

function showProfileView(view) {
  const loginView = document.querySelector("#login-view");
  const registerView = document.querySelector("#register-view");

  loginView?.toggleAttribute("hidden", view !== "login");
  registerView?.toggleAttribute("hidden", view !== "register");
}

function renderProfile() {
  const authView = document.querySelector("#profile-auth-view");
  const sessionView = document.querySelector("#profile-session-view");
  const profileName = document.querySelector("#profile-session-name");
  const profileEmail = document.querySelector("#profile-session-email");
  const profileLinks = document.querySelectorAll(".profile-link");

  if (!authView || !sessionView) return;

  authView.toggleAttribute("hidden", Boolean(state.activeProfile));
  sessionView.toggleAttribute("hidden", !state.activeProfile);

  if (!state.activeProfile) {
    showProfileView("login");
  } else {
    if (profileName) profileName.textContent = state.activeProfile.name;
    if (profileEmail) profileEmail.textContent = state.activeProfile.email;
  }

  profileLinks.forEach((link) => {
    link.textContent = state.activeProfile
      ? `Perfil (${state.activeProfile.name})`
      : "Perfil";
  });
}

function startSession(profile) {
  state.activeProfile = {
    name: profile.name,
    email: profile.email,
    birthDate: profile.birthDate || "",
    phone: profile.phone || "",
  };

  saveToStorage(STORAGE_KEYS.SESSION, state.activeProfile);
  renderProfile();
  renderCart();
}

function logoutProfile() {
  state.activeProfile = null;
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  showProfileView("login");
  renderProfile();
  renderCart();
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const email = normalizeEmail(form.elements.email.value);
  const password = form.elements.password.value;
  const message = document.querySelector("#login-message");

  if (email.length > 100 || !isValidEmail(email)) {
    if (message) {
      message.textContent =
        "El correo es obligatorio, debe tener máximo 100 caracteres " +
        "y terminar en @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }
    return;
  }

  if (!isValidPassword(password)) {
    if (message) {
      message.textContent =
        "La contraseña debe tener entre 4 y 13 caracteres y al menos una mayúscula.";
    }
    return;
  }

  const profile = state.profiles.find((item) => item.email === email);

  if (!profile) {
    if (message) {
      message.textContent =
        "La cuenta no existe o las credenciales son incorrectas.";
    }
    return;
  }

  if (profile.locked) {
    if (message) {
      message.textContent =
        "Cuenta bloqueada por 3 intentos fallidos. Contacta a soporte para restablecerla.";
    }
    return;
  }

  if (profile.password !== password) {
    profile.failedAttempts = (profile.failedAttempts || 0) + 1;
    if (profile.failedAttempts >= 3) profile.locked = true;
    saveToStorage(STORAGE_KEYS.PROFILES, state.profiles);

    if (message) {
      message.textContent = profile.locked
        ? "Cuenta bloqueada por 3 intentos fallidos. Contacta a soporte para restablecerla."
        : "La cuenta no existe o las credenciales son incorrectas.";
    }
    return;
  }

  profile.failedAttempts = 0;
  saveToStorage(STORAGE_KEYS.PROFILES, state.profiles);
  startSession(profile);

  if (message) {
    message.textContent = "Sesión iniciada correctamente.";
  }

  form.reset();
}

function handleRegisterSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const apellido = form.elements.apellido.value.trim();
  const email = normalizeEmail(form.elements.email.value);
  const birthDate = form.elements.birthDate.value.trim();
  const direccion = form.elements.direccion.value.trim();
  const genero = form.elements.genero.value;
  const password = form.elements.password.value;
  const confirmPassword = form.elements.confirmPassword.value;
  const phone = form.elements.phone.value.trim();
  const region = form.elements.region.value;
  const comuna = form.elements.comuna.value;
  const aceptaTerminos = form.elements.aceptaTerminos.checked;
  const message = document.querySelector("#register-message");

  if (
    !isValidName(name) ||
    !isValidName(apellido) ||
    email.length > 100 ||
    !isValidDuocEmail(email) ||
    !isAdultBirthDate(birthDate) ||
    !isValidPassword(password) ||
    !direccion ||
    !genero
  ) {
    if (message) {
      message.textContent =
        "Revisa nombre, apellido, correo institucional (@duoc.cl), fecha de nacimiento " +
        "(mínimo 14 años), dirección, género y contraseña (4 a 13 caracteres con al " +
        "menos una mayúscula).";
    }
    return;
  }

  if (password !== confirmPassword) {
    if (message)
      message.textContent = "La confirmación de contraseña no coincide.";
    return;
  }

  if (!region || !comuna) {
    if (message) message.textContent = "Selecciona tu región y comuna.";
    return;
  }

  if (!aceptaTerminos) {
    if (message) {
      message.textContent = "Debes aceptar las condiciones de registro.";
    }
    return;
  }

  const emailAlreadyUsed = state.profiles.some((item) => item.email === email);
  const passwordAlreadyUsed = state.profiles.some(
    (item) => item.password === password,
  );

  if (emailAlreadyUsed || passwordAlreadyUsed) {
    if (message) {
      message.textContent = "El correo y/o la contraseña ya están en uso.";
    }
    return;
  }

  const profile = {
    name,
    apellido,
    email,
    birthDate,
    direccion,
    genero,
    phone,
    region,
    comuna,
    password,
    failedAttempts: 0,
    locked: false,
  };
  state.profiles.push(profile);
  saveToStorage(STORAGE_KEYS.PROFILES, state.profiles);
  startSession(profile);

  if (message) {
    message.textContent = "Cuenta creada y sesión iniciada correctamente.";
  }
  form.reset();
}

function initializeStandaloneAuth() {
  const loginForm = document.querySelector("[data-standalone-login]");
  const registerForm = document.querySelector("[data-standalone-register]");

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const email = normalizeEmail(form.elements.email.value);
    const password = form.elements.password.value;
    const message = document.querySelector("#standalone-login-message");
    const emailError = document.querySelector("#email-error");
    const passwordError = document.querySelector("#password-error");

    if (emailError) emailError.textContent = "";
    if (passwordError) passwordError.textContent = "";
    if (message) message.textContent = "";

    if (email.length > 100 || !isValidEmail(email)) {
      if (emailError) {
        emailError.textContent =
          "El correo debe terminar en @duoc.cl, @profesor.duoc.cl o @gmail.com.";
      }
      return;
    }

    if (!isValidPassword(password)) {
      if (passwordError) {
        passwordError.textContent =
          "La contraseña debe tener entre 4 y 13 caracteres y al menos una mayúscula.";
      }
      return;
    }

    const profile = state.profiles.find((item) => item.email === email);

    if (!profile) {
      if (emailError)
        emailError.textContent =
          "No existe una cuenta registrada con este correo.";
      return;
    }

    if (profile.locked) {
      if (passwordError) {
        passwordError.textContent =
          "Cuenta bloqueada por 3 intentos fallidos. Contacta a soporte para restablecerla.";
      }
      return;
    }

    if (profile.password !== password) {
      profile.failedAttempts = (profile.failedAttempts || 0) + 1;
      if (profile.failedAttempts >= 3) profile.locked = true;
      saveToStorage(STORAGE_KEYS.PROFILES, state.profiles);

      if (passwordError) {
        passwordError.textContent = profile.locked
          ? "Cuenta bloqueada por 3 intentos fallidos. Contacta a soporte para restablecerla."
          : "La contraseña no coincide con esta cuenta.";
      }
      return;
    }

    profile.failedAttempts = 0;
    saveToStorage(STORAGE_KEYS.PROFILES, state.profiles);
    startSession(profile);

    if (message) message.textContent = "Sesión iniciada correctamente.";
    window.location.href = "index.html";
  });

  registerForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const message = document.querySelector("#standalone-register-message");
    const email = normalizeEmail(data.email);

    if (
      !form.checkValidity() ||
      !isValidName(data.name) ||
      !isValidName(data.apellido) ||
      email.length > 100 ||
      !isValidDuocEmail(email) ||
      !isAdultBirthDate(data.birthDate) ||
      !isValidPassword(data.password) ||
      !String(data.direccion || "").trim() ||
      !data.genero
    ) {
      if (message) {
        message.textContent =
          "Revisa nombre, apellido, correo institucional (@duoc.cl), fecha de " +
          "nacimiento (mínimo 14 años), dirección, género y contraseña (4 a 13 " +
          "caracteres con al menos una mayúscula).";
      }
      return;
    }

    if (data.password !== data.confirmPassword) {
      if (message)
        message.textContent = "La confirmación de contraseña no coincide.";
      return;
    }

    if (!data.region || !data.comuna) {
      if (message) message.textContent = "Selecciona tu región y comuna.";
      return;
    }

    if (!data.aceptaTerminos) {
      if (message)
        message.textContent = "Debes aceptar las condiciones de registro.";
      return;
    }

    const emailAlreadyUsed = state.profiles.some(
      (item) => item.email === email,
    );
    const passwordAlreadyUsed = state.profiles.some(
      (item) => item.password === data.password,
    );

    if (emailAlreadyUsed || passwordAlreadyUsed) {
      if (message) {
        message.textContent = emailAlreadyUsed
          ? "Ese correo ya está registrado."
          : "Esa contraseña ya está en uso.";
      }
      return;
    }

    const profile = {
      name: String(data.name || "").trim(),
      apellido: String(data.apellido || "").trim(),
      email,
      birthDate: data.birthDate,
      direccion: String(data.direccion || "").trim(),
      genero: data.genero,
      phone: String(data.phone || "").trim(),
      region: data.region,
      comuna: data.comuna,
      password: data.password,
      failedAttempts: 0,
      locked: false,
    };

    state.profiles.push(profile);
    saveToStorage(STORAGE_KEYS.PROFILES, state.profiles);
    startSession(profile);
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeStandaloneAuth();
});
