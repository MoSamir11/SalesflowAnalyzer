
$(document).ready(function() {
        function checkScreenWidth() {
            var screenWidth = $(window).width();
            var sidebar = $('#sidebar');
            var main = $('.main');
            var videoCall = $('.videoCall');
            var controls = $('.controls');


            if (screenWidth <= 700) {
                sidebar.addClass('collapsed');
                main.removeClass('fixed');
                videoCall.addClass('videoCall-collapsed');
                controls.addClass('controls-collapsed');
            }else if (screenWidth <= 768){
                sidebar.addClass('collapsed');
                main.removeClass('fixed');
                videoCall.addClass('videoCall-collapsed');
                controls.addClass('controls-collapsed');
            }else if (screenWidth <= 820){
                sidebar.addClass('collapsed');
                main.removeClass('fixed');
                videoCall.addClass('videoCall-collapsed');
                controls.addClass('controls-collapsed');
            }else {
                sidebar.removeClass('collapsed');
                main.addClass('fixed');
                videoCall.removeClass('videoCall-collapsed');
                controls.removeClass('controls-collapsed');
            }
        }

        checkScreenWidth();
        $(window).on('resize', checkScreenWidth);

        $('.navbar-btn').click(function() {
            var sidebar = $('#sidebar');
            var main = $('.main');
            var videoCall = $('.videoCall');
            var controls = $('.controls');

            if (sidebar.hasClass('collapsed')) {
                main.addClass('fixed');
                videoCall.removeClass('videoCall-collapsed');
                controls.removeClass('controls-collapsed');
            } else {
                main.removeClass('fixed');
                videoCall.addClass('videoCall-collapsed');
                controls.addClass('controls-collapsed');
            }

            sidebar.toggleClass('collapsed');
        });
    });


// Circular Progress bar 1 //


$(document).ready(function() {
    $("#copyButton").click(function() {
        var textToCopy = $(this).data("text-to-copy");

        var tempInput = $("<input>");
        tempInput.val(textToCopy).css({position: "absolute", left: "-1000px", top: "-1000px"});
        $("body").append(tempInput);
        tempInput.select();
        document.execCommand("copy");
        tempInput.remove();

        var copyToast = new bootstrap.Toast(document.getElementById('copyToast'));
        copyToast.show();

        setTimeout(function() {
            copyToast.hide();
        }, 2000);
    });


    function enableScrollOnMobile() {
            const mainLayout = $(".main-layout");
            if (window.innerWidth <= 768) {
                mainLayout.css("overflow", "auto");
            } else {
                mainLayout.css("overflow", "hidden");
            }
        }

        enableScrollOnMobile();
        $(window).on("resize", enableScrollOnMobile);
});







