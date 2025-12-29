import '@ethersproject/shims';
import 'react-native-url-polyfill/auto';
import 'text-encoding-polyfill';
import 'react-native-get-random-values';
import {Buffer} from 'buffer';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}
