
// $(document).ready(function() {
//         function checkScreenWidth() {
//             var screenWidth = $(window).width();
//             var sidebar = $('#sidebar');
//             var main = $('.main');
//             var videoCall = $('.videoCall');
//             var controls = $('.controls');


//             if (screenWidth <= 700) {
//                 sidebar.addClass('collapsed');
//                 main.removeClass('fixed');
//                 videoCall.addClass('videoCall-collapsed');
//                 controls.addClass('controls-collapsed');
//             }else if (screenWidth <= 768){
//                 sidebar.addClass('collapsed');
//                 main.removeClass('fixed');
//                 videoCall.addClass('videoCall-collapsed');
//                 controls.addClass('controls-collapsed');
//             }else if (screenWidth <= 820){
//                 sidebar.addClass('collapsed');
//                 main.removeClass('fixed');
//                 videoCall.addClass('videoCall-collapsed');
//                 controls.addClass('controls-collapsed');
//             }else {
//                 sidebar.removeClass('collapsed');
//                 main.addClass('fixed');
//                 videoCall.removeClass('videoCall-collapsed');
//                 controls.removeClass('controls-collapsed');
//             }
//         }

//         checkScreenWidth();
//         $(window).on('resize', checkScreenWidth);

//         /*
//         $('#navbtn').click(function() {
//             console.log("JS Testing")
//             var sidebar = $('#sidebar');
//             var main = $('.main');
//             var videoCall = $('.videoCall');
//             var controls = $('.controls');

//             if (sidebar.hasClass('collapsed')) {
//                 main.addClass('fixed');
//                 videoCall.removeClass('videoCall-collapsed');
//                 controls.removeClass('controls-collapsed');
//             } else {
//                 main.removeClass('fixed');
//                 videoCall.addClass('videoCall-collapsed');
//                 controls.addClass('controls-collapsed');
//             }

//             sidebar.toggleClass('collapsed');
//         });
//         */
//     });


// // Circular Progress bar 1 //
// /*
// $(document).ready(function() {

//     let $progressBars = $(".circular-progress");

//     $progressBars.each(function() {
//         let $progressBar = $(this);
//         let $valueContainer = $progressBar.next(".value-container");

//         let progressValue = parseInt($progressBar.data("start-value"));
//         let progressEndValue = parseInt($progressBar.data("end-value"));
//         let speed = parseInt($progressBar.data("speed"));

//         let progress = setInterval(function() {
//             progressValue++;
//             $valueContainer.text(`${progressValue}%`);
//             $progressBar.css("background", `conic-gradient(#712cf9 ${progressValue * 3.6}deg, #eee ${progressValue * 3.6}deg)`);

//             if (progressValue == progressEndValue) {
//                 clearInterval(progress);
//             }
//         }, speed);
//     });
// });

// // Circular Progress bar 2 //


// $(document).ready(function() {
//     let $progressBars2 = $(".circular-progress2");

//     $progressBars2.each(function() {
//         let $progressBar2 = $(this);
//         let $valueContainer2 = $progressBar2.next(".value-container2");

//         let progressValue2 = parseInt($progressBar2.data("start-value"));
//         let progressEndValue2 = parseInt($progressBar2.data("end-value"));
//         let speed2 = parseInt($progressBar2.data("speed"));

//         let progress2 = setInterval(function() {
//             progressValue2++;
//             $valueContainer2.text(`${progressValue2}%`);
//             $progressBar2.css("background", `conic-gradient(#FFA500 ${progressValue2 * 3.6}deg, #eee ${progressValue2 * 3.6}deg)`);

//             if (progressValue2 == progressEndValue2) {
//                 clearInterval(progress2);
//             }
//         }, speed2);
//     });
// });
// */

// $(document).ready(function(){

//     // Sentiment Radar chart //

//     /*
//     $(document).ready(function() {
//     let $chart = $("#chartId");
//     let labels = $chart.data("labels").split(", ").map(label => label.trim());
//     let data = $chart.data("data").split(", ").map(value => parseInt(value.trim()));
//     let bgColor = $chart.data("bg-color");
//     let pointBgColor = $chart.data("point-bg-color");
//     let borderColor = $chart.data("border-color");
//     let borderWidth = parseInt($chart.data("border-width"));
//     let pointRadius = parseInt($chart.data("point-radius"));
//     let lineWidth = parseInt($chart.data("line-width"));
//     let isResponsive = $chart.data("responsive") === "true";

//     var chrt = $chart[0].getContext("2d");

//     var chartId = new Chart(chrt, {
//         type: 'radar',
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: "",
//                 data: data,
//                 backgroundColor: [bgColor],
//                 pointBackgroundColor: [pointBgColor, pointBgColor, pointBgColor, pointBgColor, pointBgColor],
//                 borderColor: [borderColor],
//                 borderWidth: borderWidth,
//                 pointRadius: pointRadius,
//             }],
//         },
//         options: {
//             responsive: isResponsive,
//             maintainAspectRatio: false,
//             elements: {
//                 line: {
//                     borderWidth: lineWidth,
//                 }
//             }
//         }
//     });
    
//     });
//     */
    


//     /*
//     // Voice Tone chart

//     let $chart2 = $("#voice-tone-chart");
//     let labels2 = $chart2.data("labels").split(", ");
//     let data2 = $chart2.data("data").split(",").map(value => parseInt(value));
//     let backgroundColors2 = $chart2.data("bg-colors").split(",");
//     let max2 = parseInt($chart2.data("max"));

//     var ctx = $chart2[0].getContext("2d");

//     if (voiceToneChart) {
//         voiceToneChart.destroy();
//     }

//     var voiceToneChart = new Chart(ctx, {
//         type: "bar",
//         data: {
//             labels: labels2,
//             datasets: [
//                 {
//                     label: "",
//                     data: data2,
//                     backgroundColor: backgroundColors2
//                 }
//             ]
//         },
//         options: {
//             responsive: true, 
//             maintainAspectRatio: false,
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     min: 0,
//                     max: max2
//                 }
//             }
//         }
//     });
//     */


//   // progress bar

//     /*
//     $(".bar").each(function() {
//         var $bar = $(this);
//         var label = $bar.data("label");
//         var value = $bar.data("value");
//         var color = $bar.data("color");

//         var barHtml = '<div class="progress-line"><span style="width: ' + value + '%; background: ' + color + ';"></span></div>';
//         var labelHtml = '<div class="info"><span>' + label + '</span></div>';
//         var valueHtml = '<div class="value-display">' + value + '</div>';

//         $bar.html(labelHtml + barHtml + valueHtml);
//     });
//     */
// });


// $(document).ready(function() {
//     /*
//     $("#copyButton").click(function() {
//         var textToCopy = $(this).data("text-to-copy");

//         var tempInput = $("<input>");
//         tempInput.val(textToCopy).css({position: "absolute", left: "-1000px", top: "-1000px"});
//         $("body").append(tempInput);
//         tempInput.select();
//         document.execCommand("copy");
//         tempInput.remove();

//         var copyToast = new bootstrap.Toast(document.getElementById('copyToast'));
//         copyToast.show();

//         setTimeout(function() {
//             copyToast.hide();
//         }, 2000);
//     });
//     */


//     function enableScrollOnMobile() {
//             const mainLayout = $(".main-layout");
//             if (window.innerWidth <= 768) {
//                 mainLayout.css("overflow", "auto");
//             } else {
//                 mainLayout.css("overflow", "hidden");
//             }
//         }

//         enableScrollOnMobile();
//         $(window).on("resize", enableScrollOnMobile);
// });

// Sidebar//
$(document).ready(function() {
    function checkScreenWidth() {
        var screenWidth = $(window).width();
        var sidebar = $('#sidebar');
        var main = $('.main');
        var videoCall = $('.videoCall');
        var controls = $('.controls');
        // $('#sidebar').hide()
        $('#exampleModal').modal({backdrop: 'static', keyboard: false,show: true})
        $("#exampleModal2").modal({backdrop: 'static', keyboard: false,show: true})
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
        }else if (screenWidth <= 991){
            sidebar.addClass('collapsed');
            main.removeClass('fixed');
            videoCall.addClass('videoCall-collapsed');
            controls.addClass('controls-collapsed');
        }else if (screenWidth <= 13000){
            sidebar.addClass('collapsed');
            main.removeClass('fixed');
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





// Customer's vibe chart //


$(document).ready(function() {
let $chart = $("#sentiment-chart");
let labels = $chart.data("labels").split(", ").map(label => label.trim());
let data = $chart.data("data").split(", ").map(value => parseInt(value.trim()));
let bgColor = $chart.data("bg-color");
let pointBgColor = $chart.data("point-bg-color");
let borderColor = $chart.data("border-color");
let borderWidth = parseInt($chart.data("border-width"));
let pointRadius = parseInt($chart.data("point-radius"));
let lineWidth = parseInt($chart.data("line-width"));
let isResponsive = $chart.data("responsive") === "true";

var chrt = $chart[0].getContext("2d");
var chartId = new Chart(chrt, {
    type: 'radar',
    data: {
        labels: labels,
        datasets: [{
            label: "",
            data: data,
            backgroundColor: [bgColor],
            pointBackgroundColor: [pointBgColor, pointBgColor, pointBgColor, pointBgColor, pointBgColor],
            borderColor: [borderColor],
            borderWidth: borderWidth,
            pointRadius: pointRadius,
        }],
    },
    options: {
        responsive: isResponsive,
        elements: {
            line: {
                borderWidth: lineWidth,
            }
        }
    }
});
});


$(document).ready(function(){
// progress bar


$(".bar").each(function() {
    var $bar = $(this);
    var label = $bar.data("label");
    var value = $bar.data("value");
    var color = $bar.data("color");

    var barHtml = '<div class="progress-line"><span style="width: ' + value + '%; background: ' + color + ';"></span></div>';
    var labelHtml = '<div class="info"><span>' + label + '</span></div>';
    var valueHtml = '<div class="value-display">' + value + '</div>';

    $bar.html(labelHtml + barHtml + valueHtml);
});

});

// Copy meeting

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

// Show All Collapsable

$(document).ready(function() {
$('#collapseExample').on('hidden.bs.collapse', function () {
    $('.text-showAll').text('Show all');
    $('.icon-s').removeClass('bi-caret-up-fill').addClass('bi-caret-down-fill');
});

$('#collapseExample').on('shown.bs.collapse', function () {
    $('.text-showAll').text('Close all');
    $('.icon-s').removeClass('bi-caret-down-fill').addClass('bi-caret-up-fill');
});
});















