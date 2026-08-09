document.addEventListener('DOMContentLoaded', () => {
    // Prevent browser from restoring previous scroll position on refresh
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // Force scroll to top robustly
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 10);
    window.addEventListener('load', () => window.scrollTo(0, 0));

    const openBtn = document.getElementById('openBtn');
    const heroSection = document.querySelector('.hero');
    const detailsSection = document.getElementById('details');
    
    // Audio button logic
    const audioBtn = document.getElementById('audioBtn');
    const iconUnmuted = document.getElementById('iconUnmuted');
    const iconMuted = document.getElementById('iconMuted');
    const bgMusic = document.getElementById('bgMusic');
    let isPlaying = false; 

    if (openBtn && heroSection) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            openBtn.style.transform = 'scale(0.95)';
            
            // Try to start music on first interaction
            if (bgMusic && !isPlaying) {
                bgMusic.play().then(() => {
                    isPlaying = true;
                    if (iconMuted) iconMuted.style.display = 'none';
                    if (iconUnmuted) iconUnmuted.style.display = 'block';
                }).catch(err => {
                    console.log('Audio autoplay prevented:', err);
                });
            }
            
            setTimeout(() => {
                openBtn.style.transform = '';
                
                // "Open" the invitation by sliding up the hero screen
                heroSection.classList.add('is-open');
                
                // Completely hide hero from DOM after transition to prevent iOS overscroll glitches
                setTimeout(() => {
                    heroSection.style.display = 'none';
                }, 1200);

                // Allow scrolling on the body now that the cover is open
                document.body.classList.add('is-opened');
                
                // Show the audio button
                if (audioBtn) {
                    audioBtn.classList.add('visible');
                }
                
            }, 150);
        });
    }


// Toggle audio button icons
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                if (iconMuted) iconMuted.style.display = 'none';
                if (iconUnmuted) iconUnmuted.style.display = 'block';
                if (bgMusic) bgMusic.play();
            } else {
                if (iconUnmuted) iconUnmuted.style.display = 'none';
                if (iconMuted) iconMuted.style.display = 'block';
                if (bgMusic) bgMusic.pause();
            }
        });
    }

    // Scroll Reveal Animation (IntersectionObserver)
    const revealCards = document.querySelectorAll('.reveal-card');
    const revealSections = document.querySelectorAll('.reveal-section');
    
    // Check if prefers-reduced-motion is enabled
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const revealOptions = {
            root: null,
            rootMargin: '0px 0px -15% 0px',
            threshold: 0.1
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    // Remove class when element is out of view so it animates again when scrolling back
                    entry.target.classList.remove('is-visible');
                }
            });
        }, revealOptions);

        revealCards.forEach(card => revealObserver.observe(card));
        revealSections.forEach(section => revealObserver.observe(section));
    } else {
        // Immediately show if reduced motion is preferred
        revealCards.forEach(card => card.classList.add('is-visible'));
        revealSections.forEach(section => section.classList.add('is-visible'));
    }

    // ============================================
    // COUNTDOWN TIMER
    // ============================================
    const WEDDING_DATE = new Date('2026-08-15T00:00:00');

    const cdDays = document.getElementById('cdDays');
    const cdHours = document.getElementById('cdHours');
    const cdMinutes = document.getElementById('cdMinutes');
    const cdSeconds = document.getElementById('cdSeconds');

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function updateCountdown() {
        const now = new Date();
        let diff = WEDDING_DATE - now;

        if (diff <= 0) {
            // Wedding date has passed
            if (cdDays) cdDays.textContent = '00';
            if (cdHours) cdHours.textContent = '00';
            if (cdMinutes) cdMinutes.textContent = '00';
            if (cdSeconds) cdSeconds.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
        const minutes = Math.floor(diff / (1000 * 60));
        diff -= minutes * (1000 * 60);
        const seconds = Math.floor(diff / 1000);

        if (cdDays) cdDays.textContent = pad(days);
        if (cdHours) cdHours.textContent = pad(hours);
        if (cdMinutes) cdMinutes.textContent = pad(minutes);
        if (cdSeconds) cdSeconds.textContent = pad(seconds);
    }

    // Only run countdown if elements exist
    if (cdDays) {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // ============================================
    // CALENDAR BUTTON (.ics download)
    // ============================================
    const calendarBtn = document.getElementById('calendarBtn');

    if (calendarBtn) {
        calendarBtn.addEventListener('click', () => {
            const icsContent = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//Wedding//Invitation//UZ',
                'BEGIN:VEVENT',
                'DTSTART:20260815T000000',
                'DTEND:20260815T235959',
                'SUMMARY:Aziz & Malika To\'yi',
                'DESCRIPTION:Sizni hayotimizdagi eng baxtli kun to\'yimizga taklif qilamiz. 15-avgust 2026-yil.',
                'LOCATION:Yakkasaroy To\'yxonasi, m-r Chukursoy',
                'UID:aziz-malika-wedding-2026',
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');

            const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'wedding-aziz-malika.ics';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    }

    // ============================================
    // PREMIUM WALLET MODAL
    // ============================================
    const giftBtn = document.getElementById('giftBtn');
    const walletModal = document.getElementById('walletModal');
    const walletBackdrop = document.getElementById('walletBackdrop');
    const walletCloseBtn = document.getElementById('walletCloseBtn');
    const plasticCopyBtn = document.getElementById('plasticCopyBtn');
    const plasticCardNumber = document.getElementById('plasticCardNumber');
    const copyTooltip = document.getElementById('copyTooltip');

    if (giftBtn && walletModal) {
        // Open Modal
        giftBtn.addEventListener('click', () => {
            walletModal.classList.add('is-open');
            walletModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Block scroll
        });

        // Close Modal Function
        const closeModal = () => {
            walletModal.classList.remove('is-open');
            walletModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restore scroll
        };

        // Close on X btn click
        if (walletCloseBtn) {
            walletCloseBtn.addEventListener('click', closeModal);
        }

        // Close on Backdrop click
        if (walletBackdrop) {
            walletBackdrop.addEventListener('click', closeModal);
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && walletModal.classList.contains('is-open')) {
                closeModal();
            }
        });

        // Copy functionality
        if (plasticCopyBtn && plasticCardNumber) {
            plasticCopyBtn.addEventListener('click', async () => {
                // Remove spaces for copying raw number
                const rawNumber = plasticCardNumber.textContent.replace(/\s+/g, '');
                
                try {
                    await navigator.clipboard.writeText(rawNumber);
                    
                    // Show checkmark
                    const originalHTML = plasticCopyBtn.innerHTML;
                    plasticCopyBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    `;
                    
                    // Show tooltip
                    if (copyTooltip) copyTooltip.classList.add('show');
                    
                    setTimeout(() => {
                        plasticCopyBtn.innerHTML = originalHTML;
                        if (copyTooltip) copyTooltip.classList.remove('show');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
            });
        }
    }

    // ============================================
    // WISHES (GUESTBOOK) FUNCTIONALITY
    // ============================================
    const wishForm = document.getElementById('wishForm');
    const guestList = document.getElementById('guestList');
    const wishesCount = document.getElementById('wishesCount');
    const emptyWishes = document.getElementById('emptyWishes');
    const submitWishBtn = document.getElementById('submitWishBtn');
    const formError = document.getElementById('formError');
    const formSuccess = document.getElementById('formSuccess');
    const wishMessage = document.getElementById('wishMessage');
    const charCount = document.getElementById('charCount');

    // Character counter logic
    if (wishMessage && charCount) {
        wishMessage.addEventListener('input', () => {
            const currentLength = wishMessage.value.length;
            charCount.textContent = `${currentLength} / 500`;
            if (currentLength >= 500) {
                charCount.style.color = '#ff4444';
            } else {
                charCount.style.color = '';
            }
        });
    }

    // Use Firebase Realtime Database REST API
    const apiUrl = 'https://wedding2026-cd883-default-rtdb.firebaseio.com/wishes.json';

    let wishesData = [];

    // Sanitize HTML to prevent XSS
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Render a single wish item
    const createWishElement = (wish) => {
        const div = document.createElement('div');
        div.className = 'wish-item';
        div.innerHTML = `
            <div class="wish-name">${escapeHTML(wish.name)}</div>
            <div class="wish-text">${escapeHTML(wish.message)}</div>
        `;
        return div;
    };

    // Render all wishes
    const renderWishes = () => {
        guestList.innerHTML = '';
        
        if (wishesData.length === 0) {
            if (emptyWishes) guestList.appendChild(emptyWishes);
            wishesCount.textContent = `Tilaklar (0)`;
            return;
        }

        wishesCount.textContent = `Tilaklar (${wishesData.length})`;
        
        // Wishes are assumed to be sorted by backend (newest first)
        wishesData.forEach(wish => {
            guestList.appendChild(createWishElement(wish));
        });
    };

    // Fetch wishes from Firebase
    const fetchWishes = async () => {
        try {
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    wishesData = Object.values(data).reverse();
                } else {
                    wishesData = [];
                }
                renderWishes();
                if (formError) formError.style.display = 'none'; // clear any previous fetch error
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Failed to fetch wishes:', error);
            if (formError) {
                formError.textContent = "Hozircha tilaklarni yuklab bo'lmadi. Birozdan so'ng urinib ko'ring.";
                formError.style.display = 'block';
            }
            // Ensure guestList is empty or shows fallback if it's the first load
            if (wishesData.length === 0 && emptyWishes) {
                 guestList.innerHTML = '';
                 guestList.appendChild(emptyWishes);
            }
        }
    };

    // Handle form submission
    if (wishForm) {
        wishForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('wishName');
            const messageInput = document.getElementById('wishMessage');
            
            const name = nameInput.value.trim();
            const message = messageInput.value.trim();

            formError.style.display = 'none';
            formSuccess.style.display = 'none';

            if (!name || !message) {
                formError.textContent = "Iltimos, barcha maydonlarni to'ldiring.";
                formError.style.display = 'block';
                return;
            }

            // Disable button, show loading
            const originalBtnText = submitWishBtn.innerHTML;
            submitWishBtn.disabled = true;
            submitWishBtn.innerHTML = '<span>Yuborilmoqda...</span>';

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        name, 
                        message,
                        timestamp: new Date().getTime()
                    })
                });

                if (response.ok) {
                    // Add to local state immediately (at the top)
                    wishesData.unshift({ name, message });
                    
                    // Re-render
                    renderWishes();
                    
                    // Clear form
                    wishForm.reset();
                    
                    // Show success
                    formSuccess.textContent = "Tabrikingiz yuborildi ❤️";
                    formSuccess.style.display = 'block';
                    
                    setTimeout(() => {
                        formSuccess.style.display = 'none';
                    }, 3000);
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                console.error(error);
                formError.textContent = "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
                formError.style.display = 'block';
            } finally {
                // Restore button
                submitWishBtn.disabled = false;
                submitWishBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Initial fetch
    if (document.getElementById('wishesSection')) {
        fetchWishes();
    }

    // ============================================
    // SCROLL TO TOP BUTTON
    // ============================================
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
