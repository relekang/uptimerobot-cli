import request from 'request-promise-native';

const statuses: {
  [key: number]: 'paused' | 'not-checked-yet' | 'up' | 'seems-down' | 'down';
} = {
  0: 'paused',
  1: 'not-checked-yet',
  2: 'up',
  8: 'seems-down',
  9: 'down',
};

export type Response<A> = {
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
} & A;

type UrMonitor = {
  id: number;
  friendly_name: string;
  url: string;
  type: 1 | 2 | 3 | 4;
  sub_type: 1 | 2 | 3 | 4 | 5 | 6 | 99;
  keyword_type: 1 | 2;
  keyword_value: string;
  port: number;
  interval: number;
  status: 0 | 1 | 2 | 8 | 9;
  create_datetime: number;
};

export async function uptimerobotRequest<A>(options: {
  path: string;
  apiKey: string;
}): Promise<Response<A>> {
  return JSON.parse(
    await request({
      uri: 'https://api.uptimerobot.com/v2/' + options.path,
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: { api_key: options.apiKey, format: 'json', logs: '1' },
    })
  );
}

export type Monitor = {
  id: number;
  name: string;
  url: string;
  interval: number;
  status: 'paused' | 'not-checked-yet' | 'up' | 'seems-down' | 'down';
};

export async function getMonitors(apiKey: string): Promise<Monitor[]> {
  const response = await uptimerobotRequest<{ monitors: UrMonitor[] }>({
    path: 'getMonitors',
    apiKey,
  });
  return response.monitors.map(monitor => ({
    id: monitor.id,
    name: monitor.friendly_name,
    url: monitor.url,
    status: statuses[monitor.status],
    interval: monitor.interval,
  }));
}
