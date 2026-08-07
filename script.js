(() => {
    const root = document.documentElement;

    const THEME_KEY = 'melitel-theme';
    const LANGUAGE_KEY = 'melitel-language';

    const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    const languageButtons = document.querySelectorAll('[data-set-lang]');
    const translatedItems = document.querySelectorAll('[data-uk][data-en]');

    const titles = {
        home: {
            uk: 'Melitel Apps — застосунки та ігри',
            en: 'Melitel Apps — apps and games'
        },

        fortune: {
            uk: 'Київська ворожея — Melitel',
            en: 'Kyiv’s Fortune Teller — Melitel'
        },

        math: {
            uk: 'Математика: множення, ділення — Melitel',
            en: 'Mental Math: multiply, divide — Melitel'
        },

        count: {
            uk: 'Count Master: Bag of Marbles — Melitel',
            en: 'Count Master: Bag of Marbles — Melitel'
        },

        river: {
            uk: 'Swift River Catch — Melitel',
            en: 'Swift River Catch — Melitel'
        }
    };


    // =========================================================
    // Local Storage
    // =========================================================

    function readStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch {
            // Сайт продовжить працювати навіть без localStorage.
        }
    }


    // =========================================================
    // Theme
    // =========================================================

    let themeButton = null;

    const languageSwitch = document.querySelector('.lang-switch');

    if (languageSwitch) {
        themeButton = document.createElement('button');

        themeButton.type = 'button';
        themeButton.className = 'lang-button theme-button';
        themeButton.setAttribute('data-theme-toggle', '');

        languageSwitch.appendChild(themeButton);
    }


    function effectiveTheme() {
        return root.dataset.theme === 'dark'
            ? 'dark'
            : 'light';
    }


    function updateThemeButton() {
        if (!themeButton) {
            return;
        }

        const dark = effectiveTheme() === 'dark';
        const ukrainian = root.lang !== 'en';

        // Іконка показує, на яку тему можна перейти.
        themeButton.textContent = dark
            ? '☀︎'
            : '☾';

        let label;

        if (dark) {
            label = ukrainian
                ? 'Увімкнути світлу тему'
                : 'Switch to light theme';
        } else {
            label = ukrainian
                ? 'Увімкнути темну тему'
                : 'Switch to dark theme';
        }

        themeButton.setAttribute('aria-label', label);
        themeButton.setAttribute('title', label);
        themeButton.setAttribute('aria-pressed', String(dark));
    }


    function setTheme(theme, save = false) {
        const normalizedTheme = theme === 'dark'
            ? 'dark'
            : 'light';

        root.dataset.theme = normalizedTheme;

        if (save) {
            writeStorage(
                THEME_KEY,
                normalizedTheme
            );
        }

        // Колір верхньої панелі браузера на Android.
        if (themeColorMeta) {
            themeColorMeta.setAttribute(
                'content',
                normalizedTheme === 'dark'
                    ? '#141217'
                    : '#fbfaf7'
            );
        }

        updateThemeButton();
    }


    // Спочатку перевіряємо, чи користувач вже вручну обирав тему.
    const savedTheme = readStorage(THEME_KEY);

    let initialTheme;

    if (savedTheme === 'dark' || savedTheme === 'light') {
        initialTheme = savedTheme;
    } else {
        // Якщо ні — використовуємо тему ОС.
        initialTheme = darkMedia.matches
            ? 'dark'
            : 'light';
    }

    setTheme(initialTheme);


    // Ручне перемикання.
    if (themeButton) {
        themeButton.addEventListener('click', () => {
            const newTheme = effectiveTheme() === 'dark'
                ? 'light'
                : 'dark';

            setTheme(
                newTheme,
                true
            );
        });
    }


    // Якщо користувач ще НЕ робив ручного вибору,
    // сайт реагуватиме на зміну системної теми.
    function handleSystemThemeChange(event) {
        if (!readStorage(THEME_KEY)) {
            setTheme(
                event.matches
                    ? 'dark'
                    : 'light'
            );
        }
    }


    if (darkMedia.addEventListener) {
        darkMedia.addEventListener(
            'change',
            handleSystemThemeChange
        );
    } else if (darkMedia.addListener) {
        // Для старіших браузерів.
        darkMedia.addListener(
            handleSystemThemeChange
        );
    }


    // =========================================================
    // Language
    // =========================================================

    function setLang(lang) {
        lang = lang === 'en'
            ? 'en'
            : 'uk';

        root.lang = lang;

        writeStorage(
            LANGUAGE_KEY,
            lang
        );


        translatedItems.forEach(element => {
            element.textContent = element.dataset[lang];
        });


        languageButtons.forEach(button => {
            const active =
                button.dataset.setLang === lang;

            button.classList.toggle(
                'is-active',
                active
            );

            button.setAttribute(
                'aria-pressed',
                String(active)
            );
        });


        const page =
            document.body.dataset.page || 'home';

        document.title =
            (titles[page] || titles.home)[lang];


        // Оновлюємо tooltip кнопки теми,
        // бо він також має локалізацію.
        updateThemeButton();
    }


    languageButtons.forEach(button => {
        button.addEventListener(
            'click',
            () => {
                setLang(
                    button.dataset.setLang
                );
            }
        );
    });


    const savedLanguage =
        readStorage(LANGUAGE_KEY);

    const detectedLanguage =
        (navigator.language || '')
            .toLowerCase()
            .startsWith('uk')
            ? 'uk'
            : 'en';


    setLang(
        savedLanguage ||
        detectedLanguage
    );


    // =========================================================
    // Header
    // =========================================================

    const header =
        document.querySelector('.site-header');


    window.addEventListener(
        'scroll',
        () => {
            if (header) {
                header.classList.toggle(
                    'is-scrolled',
                    window.scrollY > 10
                );
            }
        },
        {
            passive: true
        }
    );


    // =========================================================
    // Reveal animations
    // =========================================================

    let observer = null;


    if ('IntersectionObserver' in window) {
        observer =
            new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add(
                                'is-visible'
                            );

                            observer.unobserve(
                                entry.target
                            );
                        }
                    });
                },
                {
                    threshold: 0.12
                }
            );
    }


    document
        .querySelectorAll('.reveal')
        .forEach(element => {
            if (observer) {
                observer.observe(element);
            } else {
                element.classList.add(
                    'is-visible'
                );
            }
        });


    // =========================================================
    // Current year
    // =========================================================

    document
        .querySelectorAll('[data-year]')
        .forEach(element => {
            element.textContent =
                new Date().getFullYear();
        });

})();