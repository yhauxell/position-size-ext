import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

export default defineManifest({
  name: packageData.displayName,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png',
  },
  action: {
    // default_popup: 'popup.html',
    default_icon: 'img/logo-48.png',
    default_title:'Click to open the calculator'
  },
  options_page: 'options.html',
  side_panel: { 
    default_path: 'sidepanel.html',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/contentScript/index.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: ['storage', 'tabs', 'scripting', 'sidePanel', 'identity'],
  host_permissions: ['*://*/*'],
  oauth2: {
    client_id: "217438524841-ksgtisjjq7bkac74d6265upems1221oo.apps.googleusercontent.com",
    scopes: ["openid", "email", "profile"]
  }
})
