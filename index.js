import { registerRootComponent } from 'expo';

import App from './App';

import { Buffer } from 'buffer';

import 'fast-text-encoding';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
