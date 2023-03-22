import { Listener } from 'discord-akairo';

export default class MemberJoinedListener extends Listener {
    constructor() {
        super('guildMemberAdd', {
            emitter: 'client',
            event: 'guildMemberAdd'
        });
    }

    exec() {
    }
}
