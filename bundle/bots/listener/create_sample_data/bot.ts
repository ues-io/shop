import { ListenerBotApi } from "@uesio/bots"

export default function create_sample_data(bot: ListenerBotApi) {
	bot.callBot("usio/shop.create_sample_products", {})
}
