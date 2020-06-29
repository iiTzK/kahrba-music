const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://kahrbaa-mu.glitch.me/`);
}, 280000);
 

const Discord = require('discord.js');
const converter = require('number-to-words');
const moment = require('moment');
const dateformat = require('dateformat');
const ms = require('parse-ms')
const fs = require('fs');


const prefix = process.env.PREFIX
const PREFIX = process.env.PREFIX


const client = new Discord.Client({ disableEveryone: true});
const ownerID = ["286088294234718209"]; // ايدي ادارة البوت او صاحب البوت ..


client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();


let cmds = {
  play: { cmd: 'play', a: ['p','شغل','تشغيل'] },
  skip: { cmd: 'skip', a: ['s','تخطي','next']},
  stop: { cmd: 'stop', a:['ايقاف','توقف'] },
  pause: { cmd: 'pause', a:['لحظة','مؤقت'] },
  resume: { cmd: 'resume', a: ['r','اكمل','استكمال'] },
  volume: { cmd: 'volume', a: ['vol','صوت'] },
  queue: { cmd: 'queue', a: ['q','list','قائمة'] },
  repeat: { cmd: 'repeat', a: ['re','تكرار','اعادة'] },
  forceskip: { cmd: 'forceskip', a: ['fs', 'fskip'] },
  skipto: { cmd: 'skipto', a: ['st','تخطي الي'] },
  nowplaying: { cmd: 'Nowplaying', a: ['np','الان'] }
};



Object.keys(cmds).forEach(key => {
var value = cmds[key];
  var command = value.cmd;
  client.commands.set(command, command);

  if(value.a) {
    value.a.forEach(alias => {
    client.aliases.set(alias, command)
  })
  }
})

const ytdl = require('ytdl-core');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube(process.env.YOUTUBE_API_KEY);


let active = new Map();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => {
    console.log(`Created By: Kahrbaa`);
    console.log(`Guilds: ${client.guilds.size}`);
    console.log(`Users: ${client.users.size}`);
    client.user.setActivity(`’Music{KAHRBA} | ${prefix}help`,{type: 'Playing'});
});

client.on('message', async msg => {
  /////////////
let ply = '<:play:714509168291348570>'
let skp = '<:skip:714509168198811699>'
let pase = '<:pause:714509167838101516>'
let pllist = '<:plist:714509167951347805>'
let rep = '<:repeat:714509168559784037>'
let inff = '<:infokah:714512299825692772>'
let plyng = '<a:playing:714517951474040932>'
let load = '<a:kahloading:714516371568066611>'
let err = '<a:erorr:714538409288400987>'
let vol = '<:voll:714548437114290306>'
let misc = '<:music:714509167787900989>';
  ////////////
  
    if(msg.author.bot) return undefined;
  if(!msg.content.startsWith(prefix)) return undefined;

  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
const command = args.shift().toLowerCase();

    const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';

    let cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))

    let s;

    if(cmd === 'play') {
        const voiceChannel = msg.member.voiceChannel;
       const notarvoice = new Discord.RichEmbed()
              .setColor('BLACK')
         .setDescription(`**${inff} \`\`${msg.author.username}\`\` You should be in the voice channel**`)
        if(!voiceChannel) return msg.channel.send(notarvoice);
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if(!permissions.has('CONNECT')) {
            return msg.channel.send(`:no_entry_sign: I can't join Your voiceChannel because i don't have ` + '`' + '`CONNECT`' + '`' + ` permission!`);
        }

        if(!permissions.has('SPEAK')) {
            return msg.channel.send(`:no_entry_sign: I can't SPEAK in your voiceChannel because i don't have ` + '`' + '`SPEAK`' + '`' + ` permission!`);
        }

        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();

			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
         const embed2 = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${ply} \`\`Added to queue\`\` ${playlist.title}**`)
			return msg.channel.send(embed2);
		} else {
			try {

				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(args, 1);

					// eslint-disable-next-line max-depth
					var video = await youtube.getVideoByID(videos[0].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('I can\'t find any thing');
				}
			}

			return handleVideo(video, msg, voiceChannel);
		}

        async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = active.get(msg.guild.id);


//	console.log('yao: ' + Util.escapeMarkdown(video.thumbnailUrl));

let hrs = video.duration.hours > 0 ? (video.duration.hours > 9 ? `${video.duration.hours}:` : `0${video.duration.hours}:`) : '';
let min = video.duration.minutes > 9 ? `${video.duration.minutes}:` : `0${video.duration.minutes}:`;
let sec = video.duration.seconds > 9 ? `${video.duration.seconds}` : `0${video.duration.seconds}`;
let dur = `${hrs}${min}${sec}`

  let ms = video.durationSeconds * 1000;

	const song = {
		id: video.id,
		title: video.title,
    duration: dur,
    msDur: ms,
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 50,
      requester: msg.author,
			playing: true,
      repeating: false
		};
		active.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			active.delete(msg.guild.id);
			return msg.channel.send(`I cant join this voice channel`);
		}
	} else {
		serverQueue.songs.push(song);
     const embed = new Discord.RichEmbed()
              .setColor('BLACK')
         .setDescription(`**${load} Loading... \`\`${args}\`\`**`)
     const embed2 = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${ply} Added [${song.title}](${song.url}) to the queue at position ${serverQueue.songs.length}.**`)
		if (playlist) return undefined;
		if(!args) return msg.channel.send('no results.');
		else return msg.channel.send(embed).then(m => {
      setTimeout(() => {//:watch: Loading... [let]
                m.edit(embed2);
      }, 500)
    }) 
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = active.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		active.delete(guild.id);
		return;
	}
	//console.log(serverQueue.songs);
  if(serverQueue.repeating) {
	console.log('Repeating');
  } else {
     const embed = new Discord.RichEmbed()
              .setColor('BLACK')
         .setDescription(`**${load} Loading... \`\`${args}\`\`**`)
     const embed2 = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${ply} Added [${song.title}](${song.url}) \`\`${song.duration}\`\` to begin playing.**`)
	serverQueue.textChannel.send(embed).then(m => { setTimeout(() => { m.edit(embed2)},500)
})
}
	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			//if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			//else console.log(reason);
      if(serverQueue.repeating) return play(guild, serverQueue.songs[0])
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);


}
} else if(cmd === 'stop') {
        if(msg.guild.me.voiceChannel !== msg.member.voiceChannel) return msg.channel.send(`You must be in ${msg.guild.me.voiceChannel.name}`)
        if(!msg.member.hasPermission('ADMINISTRATOR')) {
          msg.react('❌')
          return msg.channel.send('You don\'t have permission `ADMINSTRATOR`');
        }
        let queue = active.get(msg.guild.id);
        if(queue.repeating) return msg.channel.send('Repeating Mode is on, you can\'t stop the music, run `' + `${prefix}repeat` + '` to turn off it.')
        queue.songs = [];
        queue.connection.dispatcher.end();
        return msg.channel.send(':notes: The player has stopped and the queue has been cleared.');

    } else if(cmd === 'skip') {

      let vCh = msg.member.voiceChannel;

      let queue = active.get(msg.guild.id);

     const m14 = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${err} Sorry, but you can\'t because you are not in voice channel**`)

        if(!vCh) return msg.channel.send(m14);

     const m04 = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**No music playing to skip it**`)

        if(!queue) return msg.channel.send(m04);

     const m2002 = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**'You can\'t skip it, because repeating mode is on, run \`\`${prefix}forceskip\`\`**`)

        if(queue.repeating) return msg.channel.send(m2002);

        let req = vCh.members.size - 1;

        if(req == 1) {

     const kbot = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${pllist} Skipped ${args}**`)

            msg.channel.send(kbot);
            return queue.connection.dispatcher.end('Skipping ..')
        }

        if(!queue.votes) queue.votes = [];

     const abot = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**🎶 You already voted for skip! ${queue.votes.length}/${req}**`)

        if(queue.votes.includes(msg.member.id)) return msg.channel.send(abot);

        queue.votes.push(msg.member.id);

        if(queue.votes.length >= req) {
          
     const abot = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**🎶 Skipped ${args} .**`)

            msg.channel.send(abot);

            delete queue.votes;

            return queue.connection.dispatcher.end('Skipping ..')
        }

         const hbot = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**🎶 You have successfully voted for skip! ${queue.votes.length}/${req}**`)

        msg.channel.send(hbot)

    } else if(cmd === 'pause') {

      let queue = active.get(msg.guild.id);

        let vCh = msg.member.voiceChannel;

     const rbot = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${inff} \`\`${msg.author.username}\`\` You should be in the voice channel**`)

        if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(rbot);

        if(!queue) {

          const bbot = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**No music playing to pause.**`)

            return msg.channel.send(bbot)
        }

     const Has = new Discord.RichEmbed()
     .setColor('BLACK')
     .setDescription(`**${err} There must be music playing to use that!**`)

        if(!queue.playing) return msg.channel.send(Has)

        let disp = queue.connection.dispatcher;

        disp.pause('Pausing..')

        queue.playing = false;
      
     const saN = new Discord.RichEmbed()
     .setColor('BLACK')
     .setDescription(`**${pase}Paused ${args}. Type \`\`${prefix}resume\`\` to unpause!**`)

        msg.channel.send(saN)

    } else if (cmd === 'resume') {

      let queue = active.get(msg.guild.id);

        let vCh = msg.member.voiceChannel;

     const h14 = new Discord.RichEmbed()
              .setColor('BLACK')
         .setDescription(`**${inff} \`\`${msg.author.username}\`\` You should be in the voice channel**`)

        if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(h14);

         const h04 = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${pllist} No music \`\`paused\`\`to resume .**`)


        if(!queue) return msg.channel.send(h04)

        if(queue.playing) return msg.channel.send(h04)

        let disp = queue.connection.dispatcher;

        disp.resume('Resuming..')

        queue.playing = true;

         const h2002 = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${pllist} \`\`Resumed\`\`.**`)

        msg.channel.send(h2002)

    } else if(cmd === 'volume') {

      let queue = active.get(msg.guild.id);

         const abot = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${vol} There is no music playing to set volume.**`)

      if(!queue || !queue.songs) return msg.channel.send(abot);

      let vCh = msg.member.voiceChannel;

           const notarvoice = new Discord.RichEmbed()
              .setColor('BLACK')
         .setDescription(`**${inff} \`\`${msg.author.username}\`\` You should be in the voice channel**`)

      if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(notarvoice);

      let disp = queue.connection.dispatcher;

        const aabot = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${err} Numbers only!**`)

      if(isNaN(args[0])) return msg.channel.send(aabot);

         const as = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**You can\'t set the volume more than 100.**`)

      if(parseInt(args[0]) > 100) return msg.channel.send(as)
//:speaker: Volume changed from 20 to 20 ! The volume has been changed from ${queue.volume} to ${args[0]}
      
         const wa = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**:speaker: Volume has been **changed** from \`\`${queue.volume}\`\` to \`\`${args[0]}\`\`.**`)

      msg.channel.send(wa);

      queue.volume = args[0];

      disp.setVolumeLogarithmic(queue.volume / 100);

    } else if (cmd === 'queue') {

      let queue = active.get(msg.guild.id);

         const wa = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${err} There must be music playing to use that!**`)

      if(!queue) return msg.channel.send(wa);

      let embed = new Discord.RichEmbed()
         .setColor('BLACK')
      .setAuthor(`Queue Music`, 'https://cdn0.iconfinder.com/data/icons/music-ui/32/queue-512.png')
      let text = '';

      for (var i = 0; i < queue.songs.length; i++) {
        let num;
        if((i) > 8) {
          let st = `${i+1}`
          let n1 = converter.toWords(st[0])
          let n2 = converter.toWords(st[1])
          num = `:${n1}::${n2}:`
        } else {
        let n = converter.toWords(i+1)
        num = `:${n}:`
      }
        text += `${num} ${queue.songs[i].title} [${queue.songs[i].duration}]\n`
      }
      embed.setDescription(`**Songs Queue in \`\`${msg.guild.name}\`\` :\n\n ${text}**`)
      msg.channel.send(embed)

    } else if(cmd === 'repeat') {

      let vCh = msg.member.voiceChannel;

           const n = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${inff} \`\`${msg.author.username}\`\` You should be in the voice channel**`)

      if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(n);

      let queue = active.get(msg.guild.id);

      const apr = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${err} There is no music playing to repeat it.**`)

      if(!queue || !queue.songs) return msg.channel.send(apr);

      if(queue.repeating) {
        queue.repeating = false;
        
         const rfalse = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${rep} Repeating Mode \`\`False\`\`**`)

        return msg.channel.send(rfalse);
      } else {
        
         const rtrue = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${rep} Repeating Mode \`\`True\`\`**`)

        queue.repeating = true;
        return msg.channel.send(rtrue);
      }

    } else if(cmd === 'forceskip') {

      let vCh = msg.member.voiceChannel;

         const notarvoice = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${inff} \`\`${msg.author.username}\`\` You should be in the voice channel**`)

      if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(notarvoice);

      let queue = active.get(msg.guild.id);

      if(queue.repeating) {

        queue.repeating = false;

         const fskip = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${pllist} ForceSkipped, Repeating mode is on.**`)

        msg.channel.send(fskip)

        queue.connection.dispatcher.end('ForceSkipping..')

        queue.repeating = true;

      } else {

        queue.connection.dispatcher.end('ForceSkipping..')

         const fskid = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${pllist} ForceSkipped.**`)

        msg.channel.send(fskid)

      }

     } else if(cmd === 'skipto') {

      let vCh = msg.member.voiceChannel;

                  const notarvoice = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${inff} \`\`${msg.author.username}\`\` You should be in the voice channel**`)

      if(!vCh || vCh !== msg.guild.me.voiceChannel) return msg.channel.send(notarvoice);

      let queue = active.get(msg.guild.id);

         const kmisc = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${err} There is no music to skip to.**`)

      if(!queue.songs || queue.songs < 2) return msg.channel.send(kmisc);

         const h14x = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**You can\'t skip, because repeating mode is on, run  \`\`${prefix}repeat\`\` to turn off.**`)

    if(queue.repeating) return msg.channel.send(h14x);

         const h04x = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${err} Please input song number to skip to it, run ${prefix} ${queue} to see songs numbers.**`)

      if(!args[0] || isNaN(args[0])) return msg.channel.send(h04x);

      let sN = parseInt(args[0]) - 1;

         const h2002x = new Discord.RichEmbed()
         .setColor('BLACK')
         .setDescription(`**${err} There is no song with this number.**`)

      if(!queue.songs[sN]) return msg.channel.send(h2002x);

      let i = 1;

      msg.channel.send(`Skipped to: **${queue.songs[sN].title}[${queue.songs[sN].duration}]**`)

      while (i < sN) {
        i++;
        queue.songs.shift();
      }

      queue.connection.dispatcher.end('SkippingTo..')

    } else if(cmd === 'Nowplaying') {

      let q = active.get(msg.guild.id);

      let now = npMsg(q)

      msg.channel.send(now.mes, now.embed)
      .then(me => {
        setInterval(() => {
          let noww = npMsg(q)
          me.edit(noww.mes, noww.embed)
        }, 5000)
      })

      function npMsg(queue) {

        let m = !queue || !queue.songs[0] ? 'No music playing.' : "Now Playing..."

      const eb = new Discord.RichEmbed();

      eb.setColor(msg.guild.me.displayHexColor)

      if(!queue || !queue.songs[0]){

        eb.setTitle("No music playing");
            eb.setDescription("\u23F9 "+bar(-1)+" "+volumeIcon(!queue?100:queue.volume));
      } else if(queue.songs) {

        if(queue.requester) {

          let u = msg.guild.members.get(queue.requester.id);

          if(!u)
            eb.setAuthor('Unkown (ID:' + queue.requester.id + ')')
          else
            eb.setAuthor(`Now Playing`,`https://assets.website-files.com/5d440ec0b47bfbe0f4ca8018/5d440ec0b47bfbe73aca81e3_button.gif`)
        }

        if(queue.songs[0]) {
        try {
            eb.setTitle(queue.songs[0].title);
            eb.setURL(queue.songs[0].url);
        } catch (e) {
          eb.setTitle(queue.songs[0].title);
        }
}
        eb.setDescription(embedFormat(queue))

      }

      return {
        mes: m,
        embed: eb
      }

    }

      function embedFormat(queue) {

        if(!queue || !queue.songs) {
          return "No music playing\n\u23F9 "+bar(-1)+" "+volumeIcon(100);
        } else if(!queue.playing) {
          return "No music playing\n\u23F9 "+bar(-1)+" "+volumeIcon(queue.volume);
        } else {

          let progress = (queue.connection.dispatcher.time / queue.songs[0].msDur);
          let prog = bar(progress);
          let volIcon = volumeIcon(queue.volume);
          let playIcon = (queue.connection.dispatcher.paused ? "\u23F8" : "\u25B6")
          let dura = queue.songs[0].duration;

          return playIcon + ' ' + prog + ' `[' + formatTime(queue.connection.dispatcher.time) + '/' + dura + ']`' + volIcon;


        }

      }

      function formatTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return (hours > 0 ? hours + ":" : "") + minutes + ":" + seconds;
}

      function bar(precent) {

        var str = '';

        for (var i = 0; i < 12; i++) {

          let pre = precent
          let res = pre * 12;

          res = parseInt(res)

          if(i == res){
            str+="\uD83D\uDD18";
          }
          else {
            str+="▬";
          }
        }

        return str;

      }

      function volumeIcon(volume) {

        if(volume == 0)
           return "\uD83D\uDD07";
       if(volume < 30)
           return "\uD83D\uDD08";
       if(volume < 70)
           return "\uD83D\uDD09";
       return "\uD83D\uDD0A";

      }

    }

});








client.on('message', message => {



    let argresult = message.content.split(` `).slice(1).join(' ');
    if (message.content.startsWith(prefix + 'setStreaming')) {
      if (!ownerID.includes(message.author.id)) return;
      message.delete();
      client.user.setGame(argresult, 'https://twitch.tv/Kahrbaa');

    } else if(message.content.startsWith(prefix + 'setWatching')) {
        client.user.setActivity(argresult,{type: 'WATCHING'});

      } else if(message.content.startsWith(prefix + 'setListening')) {
        client.user.setActivity(argresult,{type: 'LISTENING'});

      } else if(message.content.startsWith(prefix + 'setPlaying')) {
        client.user.setActivity(argresult,{type: 'PLAYING'});

      } else if(message.content.startsWith(prefix + 'setName')) {
        client.user.setUsername(argresult);

      } else if(message.content.startsWith(prefix + 'setAvatar')) {
        client.user.setAvatar(argresult);


      } else if(message.content.startsWith(prefix + 'setStatus')) {
        if(!argresult) return message.channel.send('`online`, `DND(Do not Distrub),` `idle`, `invisible(Offline)` :notes: أختر أحد الحالات');
		client.user.setStatus(argresult);


    }

  });

client.on('message', message => {
  var helplist = `**:notes:  قائمة الاوامر:  

> Play : تشغيل الاغنية او اضافتها للقائمة او اكمال الاغنية [p] 
> Pause : ايقاف مؤقت الاغنية  
> Resume : اكمال الاغنية 
> stop : لأيقاف الأغنية وخروج البوت من الروم
> forceskip : لتخطي الأغنية بشكل مباشر
> Queue : عرض القائمة 
> skipto : لتخطي الأغنية الى الأغنية القادمة في طابور الموسيقى القادمة
> Skip : تخطي للاغنية التالية 
> Volume : تغيير الصوت [vol] 
> Nowplaying : عرض مايتم تشغيله الان [np] 
> Ping : سرعة استجابة البوت 
> repeat : تكرار الاغنية 
> Leave : الخروج من الروم الصوتي  

K-MUSIC BOT v2 - CODE BY : KAHRBAA
- https://www.youtube.com/channel/UCb0HLm_jF-k72G2DN4yX1sA
- https://discord.gg/gGthrQq
**`
  if(message.content === prefix + 'help') {
            message.delete(1000)
    let e = '** جاري الارســال .. :envelope_with_arrow: **'
	  message.reply(e).then(m => m.delete(1000))
	  message.author.send(helplist).catch(error => message.reply('** لم اتمكن من الارسال الاوامر لك , يرجي فتح خاصك :negative_squared_cross_mark:**'))
}
});

client.on('message', message => {
      if (!ownerID.includes(message.author.id)) return;
  var helplist = `**:gear: | اوامر الادارة:  
> setStreaming : لجعل وضع البوت ستريمنق
> setWatching : لجعل وضع البوت واتشنق
> setListening : لجعل وضع البوت ليستننق
> setName :  لتغيير أسم البوت
> setAvatar : لتغيير صورة البوت
> setStatus : لتغيير حالة البوت
**`
  if(message.content === prefix + 'help') {
    message.author.send(helplist);
  }
  });




client.login(process.env.BOT_TOKEN);