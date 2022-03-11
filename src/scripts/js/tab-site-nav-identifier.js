/**
 * @file
 * Identify that the user is tabbing through the site
 */

(function ($, Drupal) {
  $(function() {
    function handleFirstTab(e) {
      if (e.keyCode === 9) {
        $('body').addClass('user-is-tabbing');
        $(window).off('keydown', handleFirstTab);
      }
    }

    $(window).keydown(handleFirstTab);
  });
})(jQuery, Drupal);