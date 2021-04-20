(function($) {
  'use strict';

    $( document ).ready(function() {
        // ScrollUp
        $(window).on('scroll', function () {
          if ($(this).scrollTop() > 200) {
            $('.scrollingUp').addClass('is-active');
          } else {
            $('.scrollingUp').removeClass('is-active');
          }
        });
        $('.scrollingUp').on('click', function () {
          $("html, body").animate({
            scrollTop: 0
          }, 600);
          return false;
        });

        // Sticky Header
        $(window).on('scroll', function() {
          if ($(window).scrollTop() >= 250) {
              $('.is-sticky-on').addClass('is-sticky-menu');
          }
          else {
              $('.is-sticky-on').removeClass('is-sticky-menu');
          }
        });

        // Breadcrumb Sticky Menu
        $(window).on('scroll', function() {
          if ($(window).scrollTop() >= 420) {
              $('.breadcrumb-sticky-on').addClass('breadcrumb-sticky-menu');
          }
          else {
              $('.breadcrumb-sticky-on').removeClass('breadcrumb-sticky-menu');
          }
        });

		// Home Slider
          var $owlHome = $('.home-slider');
          $owlHome.owlCarousel({
              rtl: $("html").attr("dir") == 'rtl' ? true : false,
              items: 1,
              autoplay: false,
              autoplayTimeout: 10000,
              margin: 0,
              loop: true,
              dots: true,
              nav: true,
              navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
              singleItem: true,
              transitionStyle: "fade",
              touchDrag: true,
              mouseDrag: false,
              responsive: {
                  0: {
                      nav: false
                  },
                  768: {
                      nav: true
                  },
                  992: {
                      nav: true
                  }
              }
          });
          $owlHome.owlCarousel();
          $owlHome.on('translate.owl.carousel', function (event) {
              var data_anim = $("[data-animation]");
              data_anim.each(function() {
                  var anim_name = $(this).data('animation');
                  $(this).removeClass('animated ' + anim_name).css('opacity', '0');
              });
          });
          $("[data-delay]").each(function() {
              var anim_del = $(this).data('delay');
              $(this).css('animation-delay', anim_del);
          });
          $("[data-duration]").each(function() {
              var anim_dur = $(this).data('duration');
              $(this).css('animation-duration', anim_dur);
          });
          $owlHome.on('translated.owl.carousel', function() {
              var data_anim = $owlHome.find('.owl-item.active').find("[data-animation]");
              data_anim.each(function() {
                  var anim_name = $(this).data('animation');
                  $(this).addClass('animated ' + anim_name).css('opacity', '1');
              });
          });
		
		 // Testimonial Slider
          var owlTestimonial = $(".testimonials-slider");
          owlTestimonial.owlCarousel({
              rtl: $("html").attr("dir") == 'rtl' ? true : false,
              loop: true,
              nav: false,
              margin: 30,
              mouseDrag: true,
              touchDrag: true,
              autoplay: true,
              autoplayTimeout: 12000,
              responsive: {
                  0: {
                      stagePadding: 10,
                      dots: false,
                      items: 1
                  },
                  768: {
                      stagePadding: 10,
                      dots: true,
                      items: 2
                  },
                  992: {
                      stagePadding: 15,
                      dots: true,
                      items: 3
                  }
              }
          });
    });
	
}(jQuery));
