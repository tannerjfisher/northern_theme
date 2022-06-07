# Drupal-Theme-Example

A default theme focused on providing more fleshed out appearances for components like Webforms, Navigation, Search, and elements at the atomic level.

## Cloning
Clone this project with a custom directory name using the following command: 
`git clone git@github.com:tannerjfisher/Drupal-Theme-Example.git northern_theme`

## Requirements
- **Node version** `14.x`. Highly recommended to use [nvm](#node-version-requirements).

## Installation
run `npm install` to install dependencies

## Gulp Commands
`npm start`
- This will run the default gulp task which is **watch**.
- This will watch for changes to **sass, scripts, images, and fonts** and compile the changes to the **dist** directory
- This will also initialize a browsersync instance using the the base url of your local site defined in **config.json** in the root of the theme. A new tab will open in your browser on port 3000 and updating your theme files will trigger a refresh/reload in this tab.

`npx gulp sass`
- Compile **sass** partials to the **dist** directory.

`npx gulp js`
- Compile **scripts** to the **dist** directory.

`npx gulp images`
- Move **image assets** to the **dist** directory.

`npx gulp fonts`
- Move **font assets** to the **dist** directory.

`npx gulp build-raw`
- Deletes all files and folders in the **dist** directory then recompiles all distributable assets in their **Un-minified** form to clean up any stale files that no longer have a source.

`npx gulp build`
- Deletes all files and folders in the **dist** directory then recompiles all distributable assets in their **minified** form for a performance boost in preparation for launch and while the site is live.

## Node Version Requirements
The theme build tools should be used with the current LTS (Long Term Support) version of Node which is ***10.x*** at the time of writing this.

If possible, you should install nvm on your machine if it is not already for ease of switching versions. See scenarios below:

**nvm is Not Installed:**
Here is our [internal documentation](https://git.echidna.ca/echidna/internal/-/wikis/nvm) for install and setup. This should apply to Mac, Linux, and Windows Subsystem for Linux (WSL), but WSL has not yet been tested.

Here is a guide to install a similar tool on [Windows](https://github.com/coreybutler/nvm-windows), but note that this tool is completely separate from the main nvm project, and doesn't currently support .nvmrc files.

**nvm is Installed:**
Ensure you are in the root of the theme directory in your terminal tab and run `nvm use`.

This will either switch you to the version required by the theme if you've already installed that version via nvm, or prompt you with a command to install the required version.

The `.nvmrc` file in the root of the theme allows for easy switching to the required version of node in your current terminal tab.

## Browsersync Configuration
This theme makes use of the Browsersync node module. Upon running `npm start` the gulp tasks should instantiate an instance of Browsersync, utilizing the `proxyTarget` defined in `config.json`. The proxyTarget should be the base URL of your local site. The default is `http://echidnet-project.localhost`

Once the `proxyTarget` passes it will open a window in your browser where the theme assets will be reloaded anytime a change is made to the theme, without having to refresh the page.

**Note that this usage of Browsersync will only work with your devTools open, see Known Issues below for instructions on how to disable caching** 

#### Known Issues:
* If your `localhost:3000` window is just hanging you may need to add an entry in your `hosts` file to match that of your `httpd-vhosts.conf`. The entry in your `hosts` file should look something like this:

```
127.0.0.1   echidnet-project.localhost
::1     echidnet-project.localhost
```

* If your `localhost:3000` window is loading the page and shows browsersync as watching your files but doesn't actually visually update, make sure your `settings.local.php` file has the following lines:

```
/**
 * Disable CSS and JS aggregation.
 */
$config['system.performance']['css']['preprocess'] = FALSE;
$config['system.performance']['js']['preprocess'] = FALSE;
```

then restart apache.

If the lines above do exist check your devtools settings in the browser and check the box *"Disable cache (while DevTools is Open)"* under *"Network"* to ensure the browser does not cache the css files that Browsersync is trying to update.


## Maintainers
Current maintainers:
* Tanner Fisher (tfisher@northern.co)
