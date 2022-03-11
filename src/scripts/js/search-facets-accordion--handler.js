
/**
 * @file
 * Handle the accodion components
 */

(function ($, Drupal) {

  // Create toggle elements and containers
  $(function() {
    $('.block-facets-block').wrapAll('<div class="facet-blocks-toggle--container"><div class="facet-blocks--container accordion-closed"></div></div>');
    $('.facet-blocks-toggle--container').prepend('<button class="facet-blocks-toggle accordion-trigger accordion-closed" aria-label="Click to show facets" aria-expanded="false">Show Facets</button>');
  });

  // Handler
  $(function() {
    var $accordionTrigger = $('.accordion-trigger');

    function toggleAccordion(e) {
      e.toggleClass('accordion-closed accordion-open');
      e.next().toggleClass('accordion-closed accordion-open');

      e.attr('aria-label', function(index, attr) {
        return attr == 'Click to show the content' ? 'Click to hide the content' : 'Click to show the content';
      });

      e.attr('aria-expanded', function(index, attr) {
        return attr == 'false' ? 'true' : 'false';
      });

      // Search Facets
      if (e.hasClass('facet-blocks-toggle')) {
        if (e.hasClass('accordion-open')) {
          e.text('Hide Facets');
        }
        else {
          e.text('Show Facets');
        }
      }
    }

    $accordionTrigger.on('click', function(e) {
      toggleAccordion($(this));
    });

    if (! $accordionTrigger.is('button')) {
      $accordionTrigger.on('keypress', function(e) {
        if (e.which == 13 || e.which == 32) {
          toggleAccordion($(this));
        }
      });
    }
  });
})(jQuery, Drupal);
