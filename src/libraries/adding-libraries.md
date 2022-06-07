# Adding Libraries

1.  Download the third party library from its source and add it to the themes [libraries directory](https://git.echidna.ca/themes/de-d8-perth-theme/-/tree/master/src%2Flibraries) at `/src/libraries/`.
2.  Add an entry to the `northern_theme.libraries.yml` file in the root of the theme. This defines the library and it's files to attach/dependencies and looks something like this:
```yaml
mmenu:
  version: VERSION
  js:
    src/libraries/mmenu/dist/jquery.mmenu.all.js: {}
  css:
    theme:
      src/libraries/mmenu/dist/jquery.mmenu.all.css: {}
  dependencies:
    - core/jquery
    - core/drupalSettings
    - core/jquery.once
    - core/drupal
```
3.  Now that the library is defined, you can add the library to the themes output in `northern_theme.info.yml` either by adding an entry to the `libraries` key like the following:
```yaml
libraries:
  - northern_theme/slick
  - northern_theme/fonts
  - northern_theme/base
```
Or by overriding another library, which could be coming from Drupal core or a contrib module:
```yaml
libraries-override:
  classy/base:
    css:
      component:
        css/components/menu.css: false
        css/components/tabs.css: false
        css/components/pager.css: false
        css/components/forms.css: false
        css/components/breadcrumb.css: false

  core/modernizr:
    js:
      assets/vendor/modernizr/modernizr.min.js: dist/scripts/js/vendor/modernizr.min.js

  responsive_menu/responsive_menu.mmenu: northern_theme/mmenu

```
4.  If you've followed the previous steps you should be able to flush your Drupal cache, clear your browser cache (if needed) and check the DOM for your new library.
5.  Reverse these steps to easily remove a library.
