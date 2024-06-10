import { ListenerBotApi, WireRecord } from "@uesio/bots"

type SubmitTokenResponse = {
	confirmation: string
	transactionid: string
}

export default function buy_product(bot: ListenerBotApi) {
	// Load in current product information
	const productResult = bot.load({
		collection: "usio/shop.product",
		fields: [
			{
				id: "usio/shop.name",
			},
			{
				id: "usio/shop.price",
			},
		],
		conditions: [
			{
				field: "uesio/core.id",
				operator: "EQ",
				value: bot.params.get("product"),
			},
		],
	})

	if (productResult.length !== 1) {
		throw new Error("Could not find product to buy.")
	}

	const productResultItem = productResult[0]

	const result = bot.runIntegrationAction("usio/pay.usio", "submit_token", {
		token: bot.params.get("token"),
		amount: productResultItem["usio/shop.price"] + "",
		secondaryAmount: 1.99 + "",
		firstName: bot.params.get("firstName"),
		lastName: bot.params.get("lastName"),
		address: bot.params.get("address"),
		city: bot.params.get("city"),
		state: bot.params.get("state"),
		zip: bot.params.get("zip"),
		description: productResultItem["usio/shop.name"],
	}) as SubmitTokenResponse

	// create an order
	// Since we were successful, create an order record with the transaction id.
	const orderResult = bot.save("usio/shop.order", [
		{
			"usio/shop.transaction": {
				"uesio/core.id": result.transactionid,
			},
			"usio/shop.product": {
				"uesio/core.id": bot.params.get("product"),
			},
			"usio/shop.amount": productResultItem["usio/shop.price"],
		},
	] as unknown as WireRecord[])

	bot.addResult("orderid", orderResult?.[0]?.["uesio/core.id"])
	bot.addResult("confirmation", result.confirmation)
}
