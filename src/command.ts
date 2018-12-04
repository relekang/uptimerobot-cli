import 'console.table';
import Conf from 'conf';
import inquirer from 'inquirer';
import bitbar from 'bitbar';

import { getMonitors, Monitor } from './uptimerobot';

export const name = 'uptimerobot';
export const help = '';
export const manual = '';

const emojiStatus = {
  paused: '🙈',
  'not-checked-yet': '⏱',
  up: '👌',
  'seems-down': '🤔',
  down: '🔥',
};

function formatter(data: Monitor[], format: string) {
  switch (format) {
    case 'bitbar':
      bitbar([
        {
          text: data.find(({ status }) => status === 'down')
            ? emojiStatus['down']
            : data.find(({ status }) => status === 'seems-down')
            ? emojiStatus['seems-down']
            : '-',
        },
        bitbar.separator,
        ...data.map(monitor => ({
          text: `${emojiStatus[monitor.status]} - ${monitor.name}`,
          href: `https://uptimerobot.com/dashboard#${monitor.id}`,
        })),
        bitbar.separator,
        { text: 'Refresh', refresh: true },
      ]);
      break;
    case 'default':
    default: {
      console.table(data);
      break;
    }
  }
}

type Options = {
  format: string;
};

export async function run(options: Options) {
  const config = new Conf();
  let apiKey = config.get('apiKey');

  if (!apiKey) {
    const answers = await inquirer.prompt<{ apiKey: string }>([
      { name: 'apiKey', message: 'What is your uptimerobot api key?' },
    ]);
    config.set('apiKey', answers.apiKey);
    apiKey = answers.apiKey;
  }

  try {
    const data = await getMonitors(apiKey);
    formatter(data, options.format);
  } catch (error) {
    if (error.options && error.options.response) {
      const { status, statusMessage } = error.options.response;
      console.error(`${status} - ${statusMessage}`);
    } else {
      console.error(error.toString());
    }
    process.exit(1);
  }
}
