import { args } from '@relekang/args';

import * as command from './command';

// @ts-ignore
args({
  single: true,
  ...command,
})(process.argv);
