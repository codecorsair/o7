import {
  MessageReaction,
  User,
  TextChannel,
  DMChannel,
  NewsChannel,
  MessageCollectorOptions,
  Message
} from 'discord.js';

export interface Options extends MessageCollectorOptions {
  resetTimerOnMessage?: boolean;
}

export function collectMessages(
  channel: TextChannel | DMChannel | NewsChannel,
  filter: (message: Message) => boolean,
  stopFilter: (message: Message) => boolean,
  options: Options = { time: 60_000, max: 1 },
  onMessage?: (message: Message) => any,
  onTimeout?: () => any) {

  return new Promise(async resolve => {
    const collector = channel.createMessageCollector({
      ...options,
      filter
    });
    const results: string[] = [];

    collector.on('collect', async message => {
      if (stopFilter(message)) {
        collector.stop();
        resolve(results);
        return;
      }

      if (onMessage) {
        const processed = await onMessage(message);
        if (processed) {
          results.push(processed);
        }
      } else {
        results.push(message.content);
      }

      if (results.length === options.max) {
        collector.stop();
        resolve(options.max == 1 ? results[0] : results);
        return;
      }

      if (options.resetTimerOnMessage) {
        collector.resetTimer();
      }
    });

    collector.on('end', async () => onTimeout && await onTimeout());
  });
}

export function collectReactions(
  sourceMessage: Message,
  filter: (message: MessageReaction, reactor: User) => boolean,
  stopFilter: (message: MessageReaction, reactor: User) => boolean,
  options: Options = { time: 60_000, max: 1 },
  onReaction?: (message: MessageReaction, reactor: User) => string | Promise<string> | undefined,
  onTimeout?: () => any) {

  return new Promise(async resolve => {
    const collector = sourceMessage.createReactionCollector({
      ...options,
      filter
    });

    collector.on('collect', async (reaction, reactor) => {
      const results: string[] = [];
      if (stopFilter(reaction, reactor)) {
        collector.stop();
        resolve(undefined);
        return;
      }

      if (onReaction) {
        const processed = await onReaction(reaction, reactor);
        if (processed) {
          results.push(processed);
        }
      } else {
        results.push(reaction.emoji.name as string);
      }

      if (results.length === options.max) {
        collector.stop();
        resolve(options.max == 1 ? results[0] : results);
        return;
      }

      if (options.resetTimerOnMessage) {
        collector.resetTimer();
      }
    });

    collector.on('end', async () => onTimeout && await onTimeout());
  });
}


