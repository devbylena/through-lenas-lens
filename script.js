
document.addEventListener("DOMContentLoaded", () => {
    // 1. Copyright-Jahr automatisch aktualisieren
    document.querySelectorAll(".current-year").forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    // Falls der Footer kein Element mit .current-year hat
    const footer = document.querySelector("footer");

    if (footer && !footer.querySelector(".current-year")) {
        footer.innerHTML =
            `© ${new Date().getFullYear()} Through Lena's Lens · Mit Leidenschaft fotografiert`;
    }

    // 2. Bilder beim Scrollen sanft einblenden
    const photos = document.querySelectorAll(".photo");

    photos.forEach((photo) => {
        photo.style.opacity = "0";
        photo.style.transform = "translateY(20px)";
        photo.style.transition =
            "opacity 0.7s ease, transform 0.7s ease";
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    photos.forEach((photo) => observer.observe(photo));

    // 3. Portfolio nach Kategorien filtern
    const filterButtons = document.querySelectorAll(".filter-button");
    const galleryPhotos = document.querySelectorAll(
        ".portfolio-gallery .photo"
    );

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;

            filterButtons.forEach((item) => {
                item.classList.remove("active");
                item.setAttribute("aria-pressed", "false");
            });

            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            galleryPhotos.forEach((photo) => {
                const matches =
                    filter === "all" ||
                    photo.dataset.category === filter;

                photo.hidden = !matches;
            });
        });

        button.setAttribute(
            "aria-pressed",
            button.classList.contains("active") ? "true" : "false"
        );
    });


// 4. Kontaktformular: Nachricht direkt versenden
const contactForm = document.querySelector("#contact-form");

if (contactForm) {
    const statusMessage = document.querySelector("#form-status");
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);

        const payload = {
            name: formData.get("name"),
            email: formData.get("email"),
            subject: formData.get("subject"),
            message: formData.get("message")
        };

        statusMessage.textContent = "Nachricht wird gesendet ...";
        submitButton.disabled = true;

        try {
            const response = await fetch(
                "http://localhost:3000/api/contact",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Die Nachricht konnte nicht gesendet werden."
                );
            }

            statusMessage.textContent = "Danke! Deine Nachricht wurde gesendet.";
            contactForm.reset();

        } catch (error) {
            console.error("Kontaktformular-Fehler:", error);

            statusMessage.textContent =
                "Leider hat das Senden nicht funktioniert. Bitte versuche es später erneut.";
        } finally {
            submitButton.disabled = false;
        }
    });
}

    // 5. Lightbox: Fotos per Klick gross anzeigen
    let lightbox = null;

    if (photos.length > 0) {
        lightbox = document.createElement("div");
        lightbox.className = "lightbox";
        lightbox.setAttribute("role", "dialog");
        lightbox.setAttribute("aria-modal", "true");
        lightbox.setAttribute("aria-label", "Fotoansicht");

        lightbox.innerHTML = `
            <button class="lightbox-close"
                    aria-label="Fotoansicht schliessen">&times;</button>
            <img src="" alt="">
        `;

        document.body.appendChild(lightbox);

        const lightboxImage = lightbox.querySelector("img");
        const closeButton = lightbox.querySelector(".lightbox-close");
        let previousFocus = null;

        function closeLightbox() {
            lightbox.classList.remove("active");
            document.body.style.overflow = "";

            if (previousFocus) {
                previousFocus.focus();
            }
        }

        photos.forEach((photo) => {
            const image = photo.querySelector("img");
            if (!image) return;

            image.tabIndex = 0;
            image.style.cursor = "zoom-in";
            image.setAttribute("role", "button");
            image.setAttribute("aria-label", "Foto gross anzeigen");

            function openLightbox() {
                previousFocus = image;
                lightboxImage.src = image.src;
                lightboxImage.alt = image.alt;
                lightbox.classList.add("active");
                document.body.style.overflow = "hidden";
                closeButton.focus();
            }

            image.addEventListener("click", openLightbox);

            image.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLightbox();
                }
            });
        });

        closeButton.addEventListener("click", closeLightbox);

        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (
                event.key === "Escape" &&
                lightbox.classList.contains("active")
            ) {
                closeLightbox();
            }
        });
    }
});
