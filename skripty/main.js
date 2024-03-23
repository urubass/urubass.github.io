document.addEventListener('DOMContentLoaded', () => {
    const languageSwitch = document.querySelector('.language-switch');
    const flags = document.querySelectorAll('.flag');
    const translatableElements = document.querySelectorAll('[data-text]');
    const themeSwitch = document.querySelector('.theme-switch');
    const themeIcons = document.querySelectorAll('.theme-icon');
    const body = document.body;
    const registerModal = document.getElementById('register-modal');
    const loginModal = document.getElementById('login-modal');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const userActions = document.querySelectorAll('.user-actions');

    // Přepínač jazyka
    languageSwitch.addEventListener('click', toggleLanguage);

    // Přepínač motivů
    themeSwitch.addEventListener('click', toggleTheme);
    loadTheme();

    // Modální okna
    if (registerModal && loginModal) {
        document.querySelectorAll('.close').forEach((closeBtn) => {
            closeBtn.addEventListener('click', () => {
                closeModal(registerModal);
                closeModal(loginModal);
            });
        });

        window.addEventListener('click', (event) => {
            if (event.target === registerModal || event.target === loginModal) {
                closeModal(registerModal);
                closeModal(loginModal);
            }
        });
    }

    // Registrace a přihlášení
    if (registerForm && loginForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            await registerUser(username, email, password);
        });

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            await loginUser(username, password);
        });
    }

    // Aktualizace UI pro přihlášení/odhlášení
    updateLoginButtons();

    // Funkce pro přepínání jazyka
    function toggleLanguage() {
        const activeFlag = document.querySelector('.flag.active');
        const hiddenFlag = document.querySelector('.flag.hidden');

        activeFlag.classList.add('fade-out');
        setTimeout(() => {
            activeFlag.classList.remove('active', 'fade-out');
            activeFlag.classList.add('hidden');
            hiddenFlag.classList.remove('hidden');
            hiddenFlag.classList.add('active', 'fade-in');
            setTimeout(() => {
                hiddenFlag.classList.remove('fade-in');
            }, 200);

            const selectedLanguage = hiddenFlag.dataset.lang;
            saveLanguage(selectedLanguage);

            translatableElements.forEach((element) => {
                const [czechText, englishText] = element.dataset.text.split('|');
                element.textContent = selectedLanguage === 'cs' ? czechText : englishText;
            });
        }, 200);
    }

    // Funkce pro přepínání motivu
    function toggleTheme() {
        const activeIcon = document.querySelector('.theme-icon.active');
        const hiddenIcon = document.querySelector('.theme-icon.hidden');

        activeIcon.classList.add('fade-out');
        setTimeout(() => {
            activeIcon.classList.remove('active', 'fade-out');
            activeIcon.classList.add('hidden');
            hiddenIcon.classList.remove('hidden');
            hiddenIcon.classList.add('active', 'fade-in');
            setTimeout(() => {
                hiddenIcon.classList.remove('fade-in');
            }, 200);

            const selectedTheme = hiddenIcon.dataset.theme;
            body.classList.toggle('dark-theme', selectedTheme === 'dark');
            localStorage.setItem('theme', selectedTheme);
        }, 200);
    }

    // Načtení uloženého motivu
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            themeIcons[0].classList.add('hidden');
            themeIcons[0].classList.remove('active');
            themeIcons[1].classList.remove('hidden');
            themeIcons[1].classList.add('active');
        }
    }

    // Modální okna
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Registrace
    async function registerUser(username, email, password) {
        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                console.log('Registrace úspěšná');
                await loginUser(username, password);
                closeModal(registerModal);
                registerForm.reset();
                console.log('Uživatel se úspěšně zaregistroval');
                updateLoginButtons();
            } else {
                console.error('Registrace selhala');
            }
        } catch (error) {
            console.error('Chyba při registraci:', error);
        }
    }

    // Přihlášení
    async function loginUser(username, password) {
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username', username);
                updateUI();
                closeModal(loginModal);
                loginForm.reset();
                showSuccessMessage('Přihlášení úspěšné', 'success');
                console.log('Uživatel se úspěšně přihlásil');
                updateLoginButtons();
            } else {
                showSuccessMessage('Neplatné přihlašovací údaje', 'error');
                console.error('Přihlášení selhalo');
            }
        } catch (error) {
            console.error('Chyba při přihlášení:', error);
        }
    }

    // Odhlášení
    async function logoutUser() {
        if (confirm('Opravdu se chcete odhlásit?')) {
            try {
                const response = await fetch('http://localhost:3000/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    localStorage.removeItem('userId');
                    updateUI();
                    console.log('Uživatel se úspěšně odhlásil');
                    updateLoginButtons();
                } else {
                    console.error('Odhlášení selhalo');
                }
            } catch (error) {
                console.error('Chyba při odhlášení:', error);
            }
        }
    }

    // Aktualizace UI
    function updateUI() {
        const userId = localStorage.getItem('userId');

        const commentForm = document.querySelector('.comment-form');
        if (commentForm) {
            commentForm.style.display = userId ? 'flex' : 'none';
        }

        const ratingStars = document.querySelectorAll('.rating');
        ratingStars.forEach((rating) => {
            rating.style.display = userId ? 'block' : 'none';
        });
    }

    function showSuccessMessage(message, type) {
        const successMessage = document.getElementById('success-message');
        successMessage.textContent = message;
        successMessage.classList.remove('success', 'error');
        successMessage.classList.add(type, 'show');
        setTimeout(() => {
            successMessage.classList.remove('show');
        }, 5000);
    }

     // Aktualizace tlačítek pro přihlášení/odhlášení
     function updateLoginButtons() {
        const userId = localStorage.getItem('userId');
    
        userActions.forEach((actions) => {
            actions.innerHTML = '';
    
            if (userId) {
                const logoutBtn = document.createElement('button');
                logoutBtn.classList.add('logout-btn');
                logoutBtn.textContent = 'Odhlásit se';
                logoutBtn.addEventListener('click', logoutUser);
                actions.appendChild(logoutBtn);
            } else {
                const registerBtn = document.createElement('button');
                registerBtn.classList.add('register-btn');
                registerBtn.textContent = 'Registrovat se';
                registerBtn.addEventListener('click', () => {
                    openModal(registerModal);
                });
                actions.appendChild(registerBtn);
    
                const loginBtn = document.createElement('button');
                loginBtn.classList.add('login-btn');
                loginBtn.textContent = 'Přihlásit se';
                loginBtn.addEventListener('click', () => {
                    openModal(loginModal);
                });
                actions.appendChild(loginBtn);
            }
        });
    }

    document.querySelectorAll('.toggle-password').forEach((button) => {
        button.addEventListener('click', function () {
            const passwordInput = this.previousElementSibling;
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        });
    });
});