let HelperToastify = (function() {

    function HelperToastify(){}

    HelperToastify.error = function(text, timer = 7000) {
        Toastify({
            text: `<i class="bi bi-exclamation-circle font-bold fs-4"></i> ${text}`,
            duration: timer,
            close:true,
            gravity:"top",
            position: "right",
            backgroundColor: "#c81010",
        }).showToast();
    }

    HelperToastify.success = function (text, timer = 3000) {
        Toastify({
            text: `
                <svg class="toastify-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="toastify-checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="toastify-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg> ${text}
            `,
            duration: timer,
            close:true,
            gravity:"top",
            position: "right",
            backgroundColor: "#4fbe87",
        }).showToast();
    }

    HelperSweetAlert.close = function () {
        Swal.close();
    }

    return HelperToastify;
})();