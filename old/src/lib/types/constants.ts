export enum DiscordPermissions {
  CREATE_INSTANT_INVITE = 'CREATE_INSTANT_INVITE', //	Allows creation of instant invites	T, V
  KICK_MEMBERS = 'KICK_MEMBERS', //	Allows kicking members	 *Requires 2fa if enabled on the server.
  BAN_MEMBERS = 'BAN_MEMBERS', //	Allows banning members	 *Requires 2fa if enabled on the server.
  ADMINISTRATOR = 'ADMINISTRATOR', //	Allows all permissions and bypasses channel permission overwrites	 *Requires 2fa if enabled on the server.
  MANAGE_CHANNELS = 'MANAGE_CHANNELS', //	Allows management and editing of channels	T, V *Requires 2fa if enabled on the server.
  MANAGE_GUILD = 'MANAGE_GUILD', //	Allows management and editing of the guild	 *Requires 2fa if enabled on the server.
  ADD_REACTIONS = 'ADD_REACTIONS', //	Allows for the addition of reactions to messages	T
  VIEW_AUDIT_LOG = 'VIEW_AUDIT_LOG', //	Allows for viewing of audit logs	
  PRIORITY_SPEAKER = 'PRIORITY_SPEAKER', //	Allows for using priority speaker in a voice channel	V
  STREAM = 'STREAM', //	Allows the user to go live	V
  VIEW_CHANNEL = 'VIEW_CHANNEL', //	Allows guild members to view a channel, which includes reading messages in text channels	T, V
  SEND_MESSAGES = 'SEND_MESSAGES', //	Allows for sending messages in a channel	T
  SEND_TTS_MESSAGES = 'SEND_TTS_MESSAGES', //	Allows for sending of /tts messages	T
  MANAGE_MESSAGES = 'MANAGE_MESSAGES', //	Allows for deletion of other users messages	T *Requires 2fa if enabled on the server.
  EMBED_LINKS = 'EMBED_LINKS', //	Links sent by users with this permission will be auto-embedded	T
  ATTACH_FILES = 'ATTACH_FILES', //	Allows for uploading images and files	T
  READ_MESSAGE_HISTORY = 'READ_MESSAGE_HISTORY', //	Allows for reading of message history	T
  MENTION_EVERYONE = 'MENTION_EVERYONE', //	Allows for using the @everyone tag to notify all users in a channel, and the @here tag to notify all online users in a channel	T
  USE_EXTERNAL_EMOJIS = 'USE_EXTERNAL_EMOJIS', //	Allows the usage of custom emojis from other servers	T
  VIEW_GUILD_INSIGHTS = 'VIEW_GUILD_INSIGHTS', //	Allows for viewing guild insights	
  CONNECT = 'CONNECT', //	Allows for joining of a voice channel	V
  SPEAK = 'SPEAK', //	Allows for speaking in a voice channel	V
  MUTE_MEMBERS = 'MUTE_MEMBERS', //	Allows for muting members in a voice channel	V
  DEAFEN_MEMBERS = 'DEAFEN_MEMBERS', //	Allows for deafening of members in a voice channel	V
  MOVE_MEMBERS = 'MOVE_MEMBERS', //	Allows for moving of members between voice channels	V
  USE_VAD = 'USE_VAD', //	Allows for using voice-activity-detection in a voice channel	V
  CHANGE_NICKNAME = 'CHANGE_NICKNAME', //	Allows for modification of own nickname	
  MANAGE_NICKNAMES = 'MANAGE_NICKNAMES', //	Allows for modification of other users nicknames	
  MANAGE_ROLES = 'MANAGE_ROLES', //	Allows management and editing of roles	T, V *Requires 2fa if enabled on the server.
  MANAGE_WEBHOOKS = 'MANAGE_WEBHOOKS', //	Allows management and editing of webhooks	T, V *Requires 2fa if enabled on the server.
  MANAGE_EMOJIS = 'MANAGE_EMOJIS', // Allows management and editing of emojis *Requires 2fa if enabled on the server.
}

export const CommonEmojis = {
  Confirm: {
    name: '✅',
    id: '✅'
  },
  Cancel: {
    name: ':cancel:',
    id: '764518283503992862',
  },
};

