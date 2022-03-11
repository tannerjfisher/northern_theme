
/**
 * @file
 * Animates the details accordion.
 */

 (function ($, Drupal) {

  Drupal.behaviors.details_animation = {
    attach: function (context) {

      $(context).find('.dialog-off-canvas-main-canvas details').once('details-animation').each(function () {
        function setDetailsHeight(selector, wrapper = document) {
          const setHeight = (detail, open = false) => {
            detail.open = open;
            const rect = detail.getBoundingClientRect();
            detail.dataset.width = rect.width;
            detail.style.setProperty(open ? `--expanded` : `--collapsed`,`${rect.height}px`);
          }
          const details = wrapper.querySelectorAll(selector);
          const RO = new ResizeObserver(entries => {
            return entries.forEach(entry => {
              const detail = entry.target;
              const width = parseInt(detail.dataset.width, 10);
              if (width !== parseInt(entry.borderBoxSize[0].inlineSize, 10)) {
                detail.removeAttribute('style');
                setHeight(detail);
                setHeight(detail, true);
                detail.open = false;
              }
            })
          });
          details.forEach(detail => {
            RO.observe(detail);
          });
        }
        
        /* Run it */
        setDetailsHeight('.dialog-off-canvas-main-canvas details');
      });
    }
  };

})(jQuery, Drupal);