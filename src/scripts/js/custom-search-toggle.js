/**
 * @file
 * Search Toggle Script.
 */

(function ($, Drupal) {

  // ===== Toggle and handle search input on mobile and mid screened devices

  $(function() {
    var $html = $('html');
    var $searchToggle = $('.search-toggle');
    var $searchToggleButton = $('.block-search-toggle .search-toggle');
    var $searchBlock = $('.region--search-overlay');
    var $searchBlockInput = $('.region--search-overlay .form-type-textfield input');

    function toggleSearch() {
      $searchBlock.toggleClass('show');
      $searchToggle.toggleClass('open');
      $html.toggleClass('search-active').toggleClass('no-scroll');

      // Toggled Open
      if ($searchToggle.hasClass('open')) {
        $searchToggle.attr("aria-pressed", true);
        $searchToggle.attr("aria-expanded", true);
      }

      // Toggled Closed
      else {
        $searchToggle.attr("aria-pressed", false);
        $searchToggle.attr("aria-expanded", false);
      }

      // Focus search input if opened
      if ($searchBlock.hasClass('show')) {
        $searchBlockInput.focus();
      }

      // Focus the search toggle if closed
      else {
        $searchToggleButton.focus();
      }
    }

    // Bind Click
    $searchToggle.click(toggleSearch);

    // Remove the visibility classes if scaling up from mobile
    function resetSearchToggle() {
      if (x.matches) {
        if ($searchBlock.hasClass('show')) {
          $searchBlock.removeClass('show');
          $searchToggle.removeClass('open');
          $html.removeClass('search-active').toggleClass('no-scroll');
        }
      }
    }

    var x = window.matchMedia("(min-width: 900px)")
    resetSearchToggle(x) // Call listener function at run time
    x.addListener(resetSearchToggle) // Attach listener function on state changes
  });
})(jQuery, Drupal);
