import { QueryBot } from './query-bot';

import { OutputUtil } from './utils/output.util';
import { EventsUtil } from './utils/events.util';

import { outputEnabled } from './settings/settings';

OutputUtil.configure(outputEnabled);
EventsUtil.setupHandlers();

new QueryBot().initialize();