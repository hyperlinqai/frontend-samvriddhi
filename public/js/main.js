/**
 * Samvriddhi — Frontend Main JavaScript
 * Handles sidebar toggle, active navigation, bar chart rendering, and animations
 */
document.addEventListener('DOMContentLoaded', () => {

    // ══════════════════════════════════════════════
    // SIDEBAR TOGGLE
    // ══════════════════════════════════════════════
    const sidebarToggle = document.getElementById('sidebarToggle');
    const appWrapper = document.getElementById('app-wrapper');
    const sidebar = document.getElementById('sidebar');
    const mainArea = document.getElementById('main-area');
    const overlay = document.getElementById('sidebarOverlay');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.preventDefault();

            // Mobile behavior
            if (window.innerWidth <= 991) {
                sidebar.classList.toggle('mobile-open');
                overlay.classList.toggle('show');
            } else {
                // Desktop collapse/expand
                appWrapper.classList.toggle('sidebar-collapsed');

                if (appWrapper.classList.contains('sidebar-collapsed')) {
                    mainArea.style.marginLeft = '72px';
                } else {
                    mainArea.style.marginLeft = '260px';
                }
            }
        });
    }

    // Close sidebar on overlay click (mobile)
    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('show');
        });
    }

    // ══════════════════════════════════════════════
    // ACTIVE NAV HIGHLIGHTING
    // ══════════════════════════════════════════════
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-page]');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
            item.classList.add('active');
        }
    });

    // ══════════════════════════════════════════════
    // BAR CHART — ATTENDANCE TRENDS
    // ══════════════════════════════════════════════
    const chartContainer = document.getElementById('attendanceChart');

    if (chartContainer && window.__dashboardStats) {
        const total = window.__dashboardStats.totalEmployees || 10;

        // Simulated weekly attendance data
        const weekData = [
            Math.round(total * 0.85),
            Math.round(total * 0.92),
            Math.round(total * 0.78),
            Math.round(total * 0.95),
            Math.round(total * 0.88),
            Math.round(total * 0.60),
            Math.round(total * 0.30)
        ];

        const maxVal = Math.max(...weekData, 1);

        weekData.forEach((val, i) => {
            const col = document.createElement('div');
            col.className = 'bar-col';

            const bar = document.createElement('div');
            bar.className = 'bar';
            const heightPct = (val / maxVal) * 100;
            bar.style.height = heightPct + '%';
            bar.title = val + ' present';

            // Staggered animation
            bar.style.opacity = '0';
            bar.style.transform = 'scaleY(0)';
            bar.style.transformOrigin = 'bottom';
            bar.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.07}s`;

            setTimeout(() => {
                bar.style.opacity = '1';
                bar.style.transform = 'scaleY(1)';
            }, 300);

            col.appendChild(bar);
            chartContainer.appendChild(col);
        });

        // Chart control buttons
        const chartBtns = document.querySelectorAll('.chart-control-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                chartBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // ══════════════════════════════════════════════
    // RESPONSIVE SIDEBAR ADJUSTMENTS
    // ══════════════════════════════════════════════
    function handleResize() {
        if (window.innerWidth <= 991) {
            if (mainArea) mainArea.style.marginLeft = '0';
            if (sidebar) sidebar.classList.remove('mobile-open');
            if (overlay) overlay.classList.remove('show');
            if (appWrapper) appWrapper.classList.remove('sidebar-collapsed');
        } else {
            if (appWrapper && appWrapper.classList.contains('sidebar-collapsed')) {
                if (mainArea) mainArea.style.marginLeft = '72px';
            } else {
                if (mainArea) mainArea.style.marginLeft = '260px';
            }
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    // ══════════════════════════════════════════════
    // STAT CARD HOVER COUNTER EFFECT
    // ══════════════════════════════════════════════
    const statValues = document.querySelectorAll('.stat-card-value');
    statValues.forEach(el => {
        const target = parseInt(el.textContent.trim());
        if (!isNaN(target) && target > 0) {
            el.textContent = '0';
            let current = 0;
            const step = Math.max(1, Math.floor(target / 30));
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.textContent = current;
            }, 30);
        }
    });

    // ══════════════════════════════════════════════
    // URL PARAMETER CLEANUP (Flash Messages)
    // ══════════════════════════════════════════════
    // Remove query parameters like ?success= or ?error= so they don't reappear on page refresh
    if (window.history.replaceState) {
        const url = new URL(window.location);
        if (url.searchParams.has('success') || url.searchParams.has('error')) {
            url.searchParams.delete('success');
            url.searchParams.delete('error');
            // Give original scripts a tiny moment to read them (e.g. for toasts) before clearing
            setTimeout(() => {
                window.history.replaceState({ path: url.href }, '', url.href);
            }, 500);
        }
    }
});
