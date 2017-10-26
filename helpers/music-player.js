const EventEmitter = require('events');
const ytdl = require('ytdl-core');

module.exports = class MusicPlayer extends EventEmitter
{
    constructor()
    {
        super();
        this._queue = new Map();
        this._state = new Map();
    }

    /**
     *
     * @param guild
     * @returns {*}
     */
    play(guild)
    {
        let queue = this._queue(guild.id);
        let connection = guild.voiceConnection;
        let state = this._state(guild.id);
        if (!state) state = this._initState(guild.id);

        if (!queue) return this.emit('info', 'Queue for given guild is empty', guild);
        if (!connection) return this.emit('info', 'Not connected to voice channel for given guild', guild);

        let track = queue.tracks[queue.position];
        let stream = ytdl(track.url, {filter: 'audioonly', quality: 'lowest'});
        let dispatcher = connection.playStream(stream, {passes: state.passes, volume: state.volume, seek: state.seek});

        if (queue.queue_end_reached === true && state.loop === true) {
            this._resetQueuePosition(guild.id);
            track = queue.tracks[0];
        } else if (queue.queue_end_reached === true && state.loop === false) return this.emit('info', 'Playback has finished for given guild. Looping is not enabled', guild);

        dispatcher.on('start', () => {
            console.log(`Playback start for ${guild.id}/${guild.name} [${track.title} - ${track.url}]`);
            // playing text goes here
            this.emit('playing', track, guild);
        });

        dispatcher.on('end', () => {
            console.log(`Playback over for ${guild.id}/${guild.name} [${track.title} - ${track.url}]`);
            this._incrementQueue(guild.id);
            this.play(guild);
        });
    }

    pause(guild)
    {
        //TODO complete this method
    }

    resume(guild)
    {
        //TODO complete this method
    }

    skip(guild)
    {
        //TODO complete this method
    }

    seek(guild)
    {
        //TODO complete this method
    }

    jump(guild)
    {
        //TODO complete this method
    }

    stop(guild)
    {
        //TODO complete this method
    }

    /**
     * @param track
     * @param guild
     */
    loadTrack(track, guild)
    {
        this._validateTrackObject(track);

        let queue = this._queue(guild.id);
        if (!queue) queue = this._getDefaultQueueObject(guild.id);
        queue.tracks.push(track);

        this._queue.set(guild.id, queue);
    }

    /**
     *
     * @param guildID
     * @private
     */
    _initState(guildID)
    {
        let state = {
            passes: 2,
            seek: 0,
            volume: 1,
            increment_queue: true,
            loop: true,
            stop: false,
            last_action_timestamp: null
        };
        this._state.set(guildID, state);

        return state;
    }

    /**
     *
     * @param guildID
     * @private
     */
    _incrementQueue(guildID)
    {
        let queue = this._queue(guildID);

        if (queue.position >= queue.tracks.length) queue.queue_end_reached = true;
        queue.position++;

        this._queue.set(guildID, queue);
    }

    /**
     *
     * @param guildID
     * @private
     */
    _resetQueuePosition(guildID)
    {
        let queue = this._queue(guildID);
        queue.position = 0;
        this._queue.set(guildID, queue);
    }

    /**
     *
     * @param guildID
     * @returns {{guild_id: *, tracks: Array, position: number}}
     * @private
     */
    _getDefaultQueueObject(guildID)
    {
        return {
            guild_id: guildID,
            tracks: [],
            position: 0,
            queue_end_reached: false,
            created_timestamp: new Date().getTime(),
        }
    }

    /**
     *
     * @param track
     * @returns {boolean}
     * @private
     */
    _validateTrackObject(track)
    {
        if (!track.name) throw 'Track object must specify track name';
        if (!track.author) throw 'Track object must specify track author';
        if (!track.url) throw 'Track must specify stream url';

        return true;
    }
};