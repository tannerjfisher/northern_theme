/**
 * @file
 * Attaches functionality for three level dropdown to '.custom-simple-menu'
 */

(function ($, Drupal) {

  // Extend Math.sign for IE11
  if (typeof Math.sign === 'undefined') { Math.sign = function (x) { return x > 0 ? 1 : x < 0 ? -1 : x; } }

  function DE_simpleMenu() {
    $('.custom-simple-menu').each(function() {

      // Menu <nav> element
      var $menu = '';

      if (!$(this).is('nav')) {
        $menu = $(this).find('nav');
      }

      else {
        $menu = $(this);
      }

      // Menu links
      var $menuLinks = $menu.find('a, span');

      // Menu items with children
      var $headers = $menu.children('ul').find('ul').parent();

      function processMenu() {

        var $targetul = $(this).children("ul:eq(0)");
        this._offsets = {
          left:$(this).offset().left,
          top:$(this).offset().top
        };

        $targetul.parent('li').addClass('show-children');
        var menuleft = $(this).outerWidth()
        var menuOverflow = (this._offsets.left + $(this).children("ul:eq(0)").outerWidth()) - $(window).width();
        var deepMenuOverflow = (this._offsets.left + $(this).children("ul:eq(0)").outerWidth() + $(this).outerWidth()) - $(window).width();

        if (this.istopheader) {
          $(this).parent().find('.menu-item--expanded').each(function() {
            var childMenuOverflow = ($(this).offset().left + $(this).outerWidth() + $(this).children("ul:eq(0)").outerWidth()) - $(window).width();

            if (Math.sign(childMenuOverflow) >= 0) {
              if ($(this).hasClass('menu-right')) {
                $(this).removeClass('menu-right');
              }
              $(this).addClass('menu-left');
            }
            else {
              if ($(this).hasClass('menu-left')) {
                $(this).removeClass('menu-left');
              }
              $(this).addClass('menu-right');
            }
          });
        }
      }


      // ===== Toggle Visibility On Focus

      $menuLinks.focus(function() {
        $(this).closest('ul').find('a:not(:focus), span:not(:focus)').closest('.menu-item').removeClass('show-children');
        $(this).closest('.menu-item--expanded').addClass('show-children');

        $(this).closest('li').each(processMenu);
      });

      $menuLinks.blur(function() {
        setTimeout(function() {
          if (!$menu.find('a, span').is(':focus')) {
            $menu.find('li').removeClass('show-children');
          }
        }, 100);
      });


      // ===== Process Each Header

      $headers.each(function(i) {
        var $curobj=$(this);
        var $subul=$(this).find('ul:eq(0)');
        this._dimensions = {
          w: this.offsetWidth,
          h: this.offsetHeight,
          subulw: $subul.outerWidth(),
          subulh: $subul.outerHeight()
        }
        this.istopheader = $curobj.parents("ul").length==1? true : false;


        // ===== Hover

        $curobj.on('mouseenter', processMenu); //end hover
        $curobj.on('mouseleave', function(e) {
          var $targetul=$(this).children("ul:eq(0)")
          $targetul.parent('li').toggleClass('show-children');
        });

        $curobj.click(function(){
          $(this).closest('li').removeClass('show-children');
          $(this).children("ul:eq(0)").hide();
        });
      });


      // Add aria controls to all expanded menu items
      $menu.find('.menu > li, .sub-nav > li').each(function() {
        if($(this).hasClass('menu-item--expanded')) {
          let menu_name = $(this).children('a, span').find('.link-inner').text().replace(' ', '-').toLowerCase().trim();
          menu_name = menu_name + '-menu';
          $(this).children('a, span').attr('aria-controls', menu_name);
          $(this).children('ul.menu').attr('id', menu_name);

          $(this).children('span').attr({'role':'button', 'tabindex': '0'});


          // Toggle Aria expanded on hover
          $(this).on('mouseover', function() {
            $(this).children('a, span').attr('aria-expanded', 'true');
          }).on('mouseout', function() {
            $(this).children('a, span').attr('aria-expanded', 'false');
          });
        }
      });

      keyboard_actions($(this));

    });

    // +++++ KEYBOARD FUNCTIONALITY

    function keyboard_actions(elm) {

      // ==== Escape key functionality
      $(elm).find('a').each(function() {
        $(this).on('focusin', function() {
          $(this).on('keydown', function(e) {
            if(e.which == 27){
              // Move focus to parent item
              let parent = $(this).parents('.menu').siblings('a, span');
              parent.focus();
            }
          });
        });
      });

      // ==== Arrow key functionality
      var list = $(elm).children('ul.menu').children('li');
      var li_first = list[0];
      var li_last = list[list.length - 1];


      list.each(function() {
        if($(this).hasClass('menu-item--expanded')) {
          $(this).children('a, span').attr('aria-expanded', 'false');
        }

        $(this).children('a, span').on('keydown', function(e) {
          var active = e.target.parentElement;

          // ==== Right arrow
          if ( e.which === 39 ) {
            // Move focus to next item
            $(this).parents('li').next().children('a, span').focus();

            // forward from last
            if (active === li_last) {
              $(li_first).children('a, span').focus();
            }
          }

          // ===== Left arrow
          else if ( e.which === 37 ){
            $(this).parents('li').prev().children('a, span').focus();
            // back from first
            if (active === li_first) {
              $(li_last).children('a, span').focus();
            }
          }

          // ===== Down arrow
          else if ( e.which === 40 && $(this).parent('li').hasClass('menu-item--expanded')){
            console.log('call subnav');
            $(this).siblings('ul').find('> li:first-child > a').focus();
            e.preventDefault();

            subnav_keyboard_actions();
          }
        });
      });

      function subnav_keyboard_actions() {
        var list = $(document.activeElement).parent('li').parent('ul').children('li');
        var li_first = list[0];
        var li_last = list[list.length - 1];

        list.each(function() {
          $(this).children('a, span').on('keydown', function(e) {
            var active = e.target.parentElement;

            // ==== Down arrow
            if ( e.which === 40 ) {
              $(this).parent('li').next().children('a, span').focus();
              // forward from last
              if (active === li_last) {
                $(li_first).children('a, span').focus();
              }
              e.preventDefault();
            }

            // ===== Up arrow
            else if ( e.which === 38 ){
              $(this).parent('li').prev().children('a, span').focus();
              // back from first
              if (active === li_first) {
                $(li_last).children('a, span').focus();
              }
              e.preventDefault();
            }

            // ===== Right arrow
            else if ( e.which === 39 && $(this).parent('li').hasClass('menu-item--expanded') && $(this).parent('li').hasClass('menu-right')){
              $(this).siblings('ul').find('> li:first-child > a').focus();
              e.preventDefault();
              subnav_keyboard_actions();
            }

            // ===== Left arrow
            else if ( e.which === 37 && $(this).parent('li').hasClass('menu-item--expanded') && $(this).parent('li').hasClass('menu-left')){
              $(this).siblings('ul').find('> li:first-child > a').focus();
              e.preventDefault();
              subnav_keyboard_actions();
            }
          });
        });
      }
    }
  }

  // ===== On document ready attach dropdown functionality

  $(document).ready(DE_simpleMenu);

})(jQuery, Drupal);
