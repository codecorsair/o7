export interface GuildVoiceConfig {
  // guild id
  id: string;
  // voice channels -> channel id: config
  channels: { [id: string]: ChannelConfig; };
}

export interface BaseChannelConfig {
  // channel id
  id: string;
}

interface StandardChannelConfig extends BaseChannelConfig {
  type: 'standard';
}

interface SequentialChannelConfig extends BaseChannelConfig {
  type: 'sequential';
  name: string;
}

export type ChannelConfig = StandardChannelConfig | SequentialChannelConfig;


export interface CreatedChannel {
  // id of the channel that was created
  id: string;
  // id of the channel that has the config this was created from (the channel the user joined to make this one)
  from: string;
}
