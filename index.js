document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================================
       1. NAV BAR SCROLL EFFECT & MOBILE TOGGLE
       ========================================================================= */
    const header = document.getElementById("main-header");
    const mobileToggle = document.getElementById("btn-mobile-toggle");
    const navMenu = document.getElementById("navigation-menu");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    if (mobileToggle) {
        mobileToggle.addEventListener("click", () => {
            mobileToggle.classList.toggle("active");
            // Simple mobile drawer toggle using visual height/opacity in CSS or toggle
            navMenu.style.display = navMenu.style.display === "flex" ? "" : "flex";
            if (navMenu.style.display === "flex") {
                navMenu.style.flexDirection = "column";
                navMenu.style.position = "absolute";
                navMenu.style.top = "100%";
                navMenu.style.left = "0";
                navMenu.style.width = "100%";
                navMenu.style.backgroundColor = "rgba(4, 14, 20, 0.98)";
                navMenu.style.padding = "20px";
                navMenu.style.gap = "20px";
                navMenu.style.borderBottom = "1px solid var(--border-glass)";
            } else {
                navMenu.style.flexDirection = "";
                navMenu.style.position = "";
                navMenu.style.top = "";
                navMenu.style.left = "";
                navMenu.style.width = "";
                navMenu.style.backgroundColor = "";
                navMenu.style.padding = "";
                navMenu.style.gap = "";
                navMenu.style.borderBottom = "";
            }
        });
    }

    // Close menu when clicking links in mobile view
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                navMenu.style.display = "";
                mobileToggle.classList.remove("active");
            }
        });
    });

    /* =========================================================================
       3. SIGNATURE VILLAS DATA & DETAILS DRAWER (TOGGLE)
       ========================================================================= */
    const villaData = {
        hillview: {
            title: "HillView Luxury Villa",
            desc: "Wake up above the clouds. This premium villa spans over 2,200 sq ft, offering panoramic mountain views, an expansive redwood deck, a private outdoor geothermal infinity pool, a glass fireplace, and direct access to alpine hiking trails.",
            price: "$750 / night",
            image: "assets/suite.jpg",
            amenities: [
                "Heated Geothermal Infinity Pool",
                "Private Finnish Sauna room",
                "Organic local craft minibar",
                "iPad-controlled audio & shades",
                "Airport Tesla Pickup service"
            ]
        },
        forest: {
            title: "Forest Stream Lodge",
            desc: "Immerse yourself in forest tranquility. Positioned on the edge of a rushing mountain creek, this intimate lodge features an outdoor deep-soaking copper tub, wood-burning stove, and a glass-dome ceiling for private stargazing.",
            price: "$620 / night",
            image: "assets/spa.jpg",
            amenities: [
                "Creekside Copper Soaking Tub",
                "Stargazing Glass Ceiling Dome",
                "Complimentary herbal tea bar",
                "In-lodge massage table access",
                "Private fireplace timber supply"
            ]
        },
        chef: {
            title: "Chef's Pavilion Suite",
            desc: "Designed for gastronomy enthusiasts. Features a fully equipped professional chef's kitchen, custom dining table, outdoor grill, private patio, hot tub, and a dedicated butler corridor for direct food service from Chef Nedumaran's kitchen.",
            price: "$980 / night",
            image: "assets/dining.jpg",
            amenities: [
                "Professional chef appliances",
                "Private dining patio & hot tub",
                "Priority Chef's Table bookings",
                "Private wine cabinet selection",
                "Full organic garden supply list"
            ]
        }
    };

    const drawerOverlay = document.getElementById("villa-details-overlay");
    const closeDrawerBtn = document.getElementById("btn-close-drawer");
    const drawerTitle = document.getElementById("drawer-villa-title");
    const drawerDesc = document.getElementById("drawer-villa-desc");
    const drawerImg = document.getElementById("drawer-img");
    const drawerPrice = document.getElementById("drawer-villa-price");
    const drawerAmenities = document.getElementById("drawer-amenities");
    const bookFromDrawerBtn = document.getElementById("btn-book-from-drawer");
    let activeVillaKey = "hillview";

    function openDrawer(key) {
        const data = villaData[key];
        if (!data) return;
        activeVillaKey = key;

        drawerTitle.textContent = data.title;
        drawerDesc.textContent = data.desc;
        drawerImg.src = data.image;
        drawerImg.alt = data.title;
        drawerPrice.textContent = data.price;
        
        drawerAmenities.innerHTML = "";
        data.amenities.forEach(am => {
            const li = document.createElement("li");
            li.innerHTML = `<i class="fa-solid fa-check text-gold"></i> ${am}`;
            drawerAmenities.appendChild(li);
        });

        drawerOverlay.classList.remove("hidden");
        setTimeout(() => drawerOverlay.classList.add("active"), 10);
    }

    function closeDrawer() {
        drawerOverlay.classList.remove("active");
        setTimeout(() => drawerOverlay.classList.add("hidden"), 400);
    }

    document.querySelectorAll(".btn-view-details").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-villa");
            openDrawer(key);
        });
    });

    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener("click", closeDrawer);
    }
    if (drawerOverlay) {
        drawerOverlay.addEventListener("click", (e) => {
            if (e.target === drawerOverlay) closeDrawer();
        });
    }

    /* =========================================================================
       4. INTERACTIVE BOOKING ENGINE & CALCULATION MODAL
       ========================================================================= */
    const bookingModal = document.getElementById("booking-modal");
    const closeBookingBtn = document.getElementById("btn-close-booking");
    const bookingForm = document.getElementById("booking-reservation-form");
    const selectVilla = document.getElementById("select-villa");
    const checkInInput = document.getElementById("input-check-in");
    const checkOutInput = document.getElementById("input-check-out");
    const summaryRate = document.getElementById("summary-rate");
    const summaryNights = document.getElementById("summary-nights");
    const summaryTotal = document.getElementById("summary-total");
    const successBox = document.getElementById("booking-success-message");
    const closeSuccessBtn = document.getElementById("btn-close-success");

    const villaRates = {
        hillview: 750,
        forest: 620,
        chef: 980
    };

    // Set default check-in date to tomorrow and check-out to 3 days later
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const leaveDay = new Date(tomorrow);
    leaveDay.setDate(leaveDay.getDate() + 3);

    if (checkInInput && checkOutInput) {
        checkInInput.min = today.toISOString().split("T")[0];
        checkInInput.value = tomorrow.toISOString().split("T")[0];
        checkOutInput.min = tomorrow.toISOString().split("T")[0];
        checkOutInput.value = leaveDay.toISOString().split("T")[0];
    }

    function calculatePrices() {
        const villaKey = selectVilla.value;
        const rate = villaRates[villaKey] || 0;
        summaryRate.textContent = `$${rate}`;

        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
            summaryNights.textContent = "0 nights";
            summaryTotal.textContent = "$0";
            return;
        }

        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        summaryNights.textContent = `${diffDays} night${diffDays > 1 ? 's' : ''}`;
        
        const total = rate * diffDays;
        summaryTotal.textContent = `$${total.toLocaleString()}`;
    }

    function openBookingModal(preselectedVillaKey = "hillview") {
        if (selectVilla) {
            selectVilla.value = preselectedVillaKey;
        }
        calculatePrices();
        bookingModal.classList.remove("hidden");
        if (successBox) successBox.classList.add("hidden");
        setTimeout(() => bookingModal.classList.add("active"), 10);
    }

    function closeBookingModal() {
        bookingModal.classList.remove("active");
        setTimeout(() => bookingModal.classList.add("hidden"), 400);
    }

    // Event listeners for booking triggers
    document.querySelectorAll(".btn-book-now").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-villa");
            openBookingModal(key);
        });
    });

    const reserveNavBtn = document.getElementById("btn-reserve-nav");
    if (reserveNavBtn) {
        reserveNavBtn.addEventListener("click", () => openBookingModal("hillview"));
    }

    const ctaReserveBtn = document.getElementById("btn-cta-reserve");
    if (ctaReserveBtn) {
        ctaReserveBtn.addEventListener("click", () => openBookingModal("hillview"));
    }

    if (bookFromDrawerBtn) {
        bookFromDrawerBtn.addEventListener("click", () => {
            closeDrawer();
            setTimeout(() => openBookingModal(activeVillaKey), 450);
        });
    }

    if (closeBookingBtn) closeBookingBtn.addEventListener("click", closeBookingModal);
    
    if (bookingModal) {
        bookingModal.addEventListener("click", (e) => {
            if (e.target === bookingModal) closeBookingModal();
        });
    }

    if (selectVilla) selectVilla.addEventListener("change", calculatePrices);
    if (checkInInput) {
        checkInInput.addEventListener("change", () => {
            checkOutInput.min = checkInInput.value;
            calculatePrices();
        });
    }
    if (checkOutInput) checkOutInput.addEventListener("change", calculatePrices);

    // Form submit success
    if (bookingForm) {
        bookingForm.addEventListener("submit", (e) => {
            e.preventDefault();
            if (successBox) successBox.classList.remove("hidden");
        });
    }

    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener("click", () => {
            closeBookingModal();
            if (successBox) successBox.classList.add("hidden");
        });
    }



    /* =========================================================================
       5. TESTIMONIAL SLIDER CAROUSEL
       ========================================================================= */
    const slides = document.querySelectorAll(".testimonial-slide");
    const dots = document.querySelectorAll(".slider-dots .dot");
    const prevBtn = document.getElementById("btn-slide-prev");
    const nextBtn = document.getElementById("btn-slide-next");
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));
        
        currentSlide = (index + slides.length) % slides.length;
        
        slides[currentSlide].classList.add("active");
        dots[currentSlide].classList.add("active");
    }

    function startAutoSlide() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 8000); // Transitions every 8 seconds
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener("click", () => {
            showSlide(currentSlide - 1);
            startAutoSlide();
        });

        nextBtn.addEventListener("click", () => {
            showSlide(currentSlide + 1);
            startAutoSlide();
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            showSlide(idx);
            startAutoSlide();
        });
    });

    // Start auto slide on initialization
    if (slides.length > 0) {
        startAutoSlide();
    }

});
