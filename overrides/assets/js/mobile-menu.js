// Mobile menu collapse/expand functionality
(function() {
    // Only apply on mobile viewports
    function isMobile() {
        return window.innerWidth < 1200;
    }

    function setupMobileMenus() {
        // Get only the main dropdown toggle (not submenu parent items)
        const mainDropdownToggles = document.querySelectorAll('.navbar-collapse .nav-item.dropdown > .dropdown-toggle');

        mainDropdownToggles.forEach(function(toggle) {
            // Check if we already set up this toggle
            if (toggle.dataset.mobileMenuSetup) return;
            toggle.dataset.mobileMenuSetup = 'true';

            // Store original data-bs-toggle attribute
            if (!toggle.dataset.originalBsToggle && toggle.getAttribute('data-bs-toggle')) {
                toggle.dataset.originalBsToggle = toggle.getAttribute('data-bs-toggle');
            }

            // Manage data-bs-toggle based on viewport size
            if (isMobile()) {
                toggle.removeAttribute('data-bs-toggle');
            } else {
                // Restore on desktop
                if (toggle.dataset.originalBsToggle) {
                    toggle.setAttribute('data-bs-toggle', toggle.dataset.originalBsToggle);
                }
            }

            // Add click handler
            toggle.addEventListener('click', function(e) {
                if (!isMobile()) return; // Allow Bootstrap behavior on desktop

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const parentDropdown = this.closest('.dropdown');
                const dropdownMenu = parentDropdown.querySelector(':scope > .dropdown-menu');

                if (!dropdownMenu) return;

                // Toggle the show class
                const isShowing = parentDropdown.classList.contains('show');

                if (isShowing) {
                    parentDropdown.classList.remove('show');
                    dropdownMenu.classList.remove('show');
                } else {
                    parentDropdown.classList.add('show');
                    dropdownMenu.classList.add('show');
                }

                return false;
            }, true); // Use capture phase to intercept before Bootstrap
        });

        // Remove the &raquo; (») from all category items (both mobile and desktop)
        const allSubmenuParents = document.querySelectorAll('.dropdown-menu > li > .dropdown-item[href="#"]');
        allSubmenuParents.forEach(function(item) {
            if (!item.dataset.arrowRemoved) {
                item.textContent = item.textContent.replace(/\s*»\s*$/, '').trim();
                item.dataset.arrowRemoved = 'true';
            }
        });

        // For submenu parent items (Broadband, LLM/AI, etc.) - toggle submenu visibility
        const submenuParents = document.querySelectorAll('.navbar-collapse .dropdown-menu > li > .dropdown-item[href="#"]');

        submenuParents.forEach(function(item) {
            if (item.dataset.submenuSetup) return;
            item.dataset.submenuSetup = 'true';

            item.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                const parentLi = this.parentElement;
                const submenu = parentLi.querySelector('.submenu');

                if (!submenu) return;

                // Toggle the show class on both the li and submenu
                if (parentLi.classList.contains('show')) {
                    parentLi.classList.remove('show');
                    submenu.classList.remove('show');
                } else {
                    // On desktop, close other open submenus in the same dropdown
                    if (!isMobile()) {
                        const siblingItems = parentLi.parentElement.querySelectorAll(':scope > li');
                        siblingItems.forEach(function(sibling) {
                            if (sibling !== parentLi) {
                                sibling.classList.remove('show');
                                const siblingSubmenu = sibling.querySelector('.submenu');
                                if (siblingSubmenu) siblingSubmenu.classList.remove('show');
                            }
                        });
                    }

                    parentLi.classList.add('show');
                    submenu.classList.add('show');
                }

                return false;
            }, true);
        });

        // Also prevent clicks on the actual dropdown items from closing the menu
        const allDropdownItems = document.querySelectorAll('.navbar-collapse .dropdown-menu .dropdown-item:not([href="#"])');

        allDropdownItems.forEach(function(item) {
            if (item.dataset.clickSetup) return;
            item.dataset.clickSetup = 'true';

            item.addEventListener('click', function(e) {
                if (!isMobile()) return;

                // Allow navigation but stop propagation to prevent Bootstrap from closing
                e.stopPropagation();
            }, true);
        });
    }

    // Run setup immediately and after DOM loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupMobileMenus);
    } else {
        setupMobileMenus();
    }

    // Also run after a slight delay to catch dynamically loaded content
    setTimeout(setupMobileMenus, 100);

    // Re-setup on window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setupMobileMenus, 250);
    });
})();
