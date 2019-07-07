const sqlite = require("sqlite")
let db
const SQL = require('sql-template-strings')
const Command = require("discord.js-commando").Command
const Embed = require('discord.js').RichEmbed

module.exports = class CarCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'components',
			group: 'util',
			memberName: 'components',
			description: 'Advanced search for component names used in photon addons.',
			args: [{
				key: 'path',
				label: 'Search Path',
				prompt: 'Enter the path to search.',
				type: 'string',
			}]
		})
	}

	async run(msg, args, _){
		let reply = msg.say(`Searching for \`${args.path.replace(/`/, '\`')}\` in addons.`)
		let matches = await db.all(SQL`SELECT cname as path, COUNT(*) as count FROM components WHERE cname = ${args.path} GROUP BY cname`)

		matches = matches.filter(result => result.count > 0)
		if (matches.length === 0){return (await reply).edit("I haven't seen that car name before.")}

		let match = matches[0]
		let data = db.all(SQL`SELECT cname as path, owner, name, CAST(sid AS TEXT) as sid, sname FROM components INNER JOIN addons on components.owner = addons.wsid INNER JOIN authors ON addons.author = authors.sid WHERE cname = ${match.path}`)

		let i = 1
		let embed = new Embed()
		embed.setTitle(`Vehicle Report: ${match.path}`)

		;(await data).map(addon => {
			embed.addField(
				`Addon ${i++}`,
				`[${addon.name.replace(/([\[\]])/g, '\$1')}](https://steamcommunity.com/sharedfiles/filedetails/?id=${addon.owner}) by [${addon.sname.replace(/([\[\]])/g, '\$1')}](https://steamcommunity.com/profiles/${addon.sid})`
			)
		})

		return (await reply).edit(embed)
	}
}

async function main(){db = await sqlite.open("/app/photon.read.db")}
main()