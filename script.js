const mobileMenuButton = document.getElementById("mobileMenuButton");
const mainNav = document.getElementById("mainNav");

mobileMenuButton.addEventListener("click", function () {

    const isOpen = mainNav.classList.toggle("mobile-open");

    mobileMenuButton.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
    );

    mobileMenuButton.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );

    mobileMenuButton.textContent = isOpen ? "×" : "☰";

});


/* Close mobile menu after selecting a section */

const navigationLinks = mainNav.querySelectorAll("a");

navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        mainNav.classList.remove("mobile-open");

        mobileMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        mobileMenuButton.setAttribute(
            "aria-label",
            "Open navigation"
        );

        mobileMenuButton.textContent = "☰";

    });

});
