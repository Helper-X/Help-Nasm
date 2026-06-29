(function () {
    'use strict';

    const SCROLL_KEY  = 'sp-scroll';
    const SECTIONS_KEY = 'sp-sections';

    /* ── Сохранение / восстановление открытых разделов ── */
    function saveOpenSections() {
        const ids = Array.from(
            document.querySelectorAll('details[open][id^="section-"]')
        ).map(el => el.id);
        try { localStorage.setItem(SECTIONS_KEY, JSON.stringify(ids)); } catch (_) {}
    }

    function restoreOpenSections() {
        try {
            const saved = localStorage.getItem(SECTIONS_KEY);
            if (!saved) return;
            JSON.parse(saved).forEach(id => {
                const el = document.getElementById(id);
                if (el && el.tagName === 'DETAILS') el.open = true;
            });
        } catch (_) {}
    }

    /* ── Сохранение / восстановление позиции прокрутки ── */
    function saveScroll() {
        try { localStorage.setItem(SCROLL_KEY, window.scrollY); } catch (_) {}
    }

    function restoreScroll() {
        try {
            const saved = localStorage.getItem(SCROLL_KEY);
            if (saved) window.scrollTo({ top: parseInt(saved, 10), behavior: 'auto' });
        } catch (_) {}
    }

    /* ── Кнопка «Свернуть» ── */
    function initCollapseAll() {
        const btn = document.getElementById('collapse-all');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const all = Array.from(
                document.querySelectorAll('details[id^="section-"]')
            );
            // Первый клик — сворачивает подразделы (содержащие точку в id).
            // Если все подразделы уже закрыты — сворачивает и верхние.
            const anyOpenSub = all.some(d => d.open && d.id.includes('.'));
            all.forEach(d => {
                if (d.id.includes('.') || !anyOpenSub) d.open = false;
            });
            saveOpenSections();
        });
    }

    /* ── Инициализация ── */
    function init() {
        restoreOpenSections();
        restoreScroll();

        // Сохранять при каждом переключении details
        document.addEventListener('toggle', (e) => {
            if (e.target.tagName === 'DETAILS') saveOpenSections();
        }, true);

        // Сохранять позицию прокрутки (троттлинг 100 мс)
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(saveScroll, 100);
        }, { passive: true });

        window.addEventListener('beforeunload', () => {
            saveScroll();
            saveOpenSections();
        });

        initCollapseAll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
