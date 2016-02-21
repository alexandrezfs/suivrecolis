$(document).ready(function() {

    //For iphone we need to refresh select boxes later
    //Or for laggy users
    //Or for IE users
    setTimeout(function() {
        onLoadScript();
    }, 1000);

    $('.slider').bxSlider({
        slideWidth: 255,
        slideMargin: 10,
        minSlides: 2,
        maxSlides: 4,
        moveSlides: 1,
        auto: true,
        responsive: true
    });

    // user announcements
    $page = $('.page').height();
    $page = $page - 80;// remove header height
    if ($page > 958) {
        $box = 334;//height of the little announcements
        $new_page = $page - 624; //substract the height of the big box
        // se how many fits on the page
        $nr_boxes = $new_page / $box;
        //round up the number
        $nr_boxes = Math.floor($nr_boxes);

        $('.user-announcement:lt(' + $nr_boxes + ')').show();
    }
});

function onLoadScript() {

    var $timeline_block = $('.cd-timeline-block');

    //hide timeline blocks which are outside the viewport
    $timeline_block.each(function(){
        if($(this).offset().top > $(window).scrollTop()+$(window).height()*0.75) {
            $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
        }
    });

    //on scolling, show/animate timeline blocks when enter the viewport
    $(window).on('scroll', function(){
        $timeline_block.each(function(){
            if( $(this).offset().top <= $(window).scrollTop()+$(window).height()*0.75 && $(this).find('.cd-timeline-img').hasClass('is-hidden') ) {
                $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
            }
        });
    });

    jQuery(".shmenu").off('click');
    jQuery(".shmenu").click(function () {
        jQuery(this).parent().parent().parent().children('#menu-header-menu').slideToggle(500);
    });
    jQuery(".shmenufooter").off('click');
    jQuery(".shmenufooter").click(function () {
        jQuery(this).parent().parent().parent().children('#footer-menu').slideToggle(500);
    });
    jQuery(".shmenu-interior").off('click');
    jQuery(".shmenu-interior").click(function () {
        jQuery(this).parent().parent().parent().children('.menu').slideToggle(500);
    });

    /***********help dropdown***************/
    jQuery(".drop-answer").off('click');
    jQuery(".drop-answer").click(function () {
        if (jQuery(this).parent().hasClass("active")) {
            jQuery(this).parent().removeClass("active");
        }
        else {
            jQuery(this).parent().addClass("active");
        }
        jQuery(this).parents('li').find('.answer').slideToggle(50);
    });

    //$("#selectPrettyCityDeparture").select2({placeholder: "Choose city"});
    //$("#selectPrettyCityArrival").select2({placeholder: "Choose city"});
    //$("#selectPrettyRegionDeparture").select2({placeholder: "Choose region"});
    //$("#selectPrettyRegionArrival").select2({placeholder: "Choose region"});
    $("#carrierRating").select2({placeholder: "Choose a Carrier", width: "270px"});

    $("#selectIsNameParcel").select2({placeholder: "Choose"});
    $("#selectIsNameParcel").select2("val", 1);
    $("#selectIsNameParcel").on("change", function (e) {

        if ($("#selectIsNameParcel").select2("val") == "0") {
            $("#flyFormParcelName").prop('disabled', false);
        }
        else {
            $("#flyFormParcelName").prop('disabled', true);
        }
    });
    $("#selectIsReceiveNotifications").select2({placeholder: "Choose"});
    $("#selectIsReceiveNotifications").select2("val", 1);
    $("#selectIsRegister").select2({placeholder: "Choose"});
    $("#selectIsRegister").select2("val", 1);
    $("#selectIsRegister").on("change", function (e) {

        if ($("#selectIsRegister").select2("val") == "0") {
            $("#flyFormFirstname").prop('disabled', false);
            $("#flyFormLastname").prop('disabled', false);
            $("#flyFormEmail").prop('disabled', false);
            $("#flyFormPhone").prop('disabled', false);
            $("#flyFormPassword").prop('disabled', false);
            $("#flyFormPasswordConfirm").prop('disabled', false);
            $("#selectIsNameParcel").prop('disabled', false);
            $("#selectIsReceiveNotifications").prop('disabled', false);
        }
        else {
            $("#flyFormFirstname").prop('disabled', true);
            $("#flyFormLastname").prop('disabled', true);
            $("#flyFormEmail").prop('disabled', true);
            $("#flyFormPhone").prop('disabled', true);
            $("#flyFormPassword").prop('disabled', true);
            $("#flyFormPasswordConfirm").prop('disabled', true);
            $("#selectIsNameParcel").prop('disabled', true);
            $("#selectIsReceiveNotifications").prop('disabled', true);
        }

    });

}
