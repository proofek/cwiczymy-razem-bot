module.exports = (message) => {
	const reply = new RichEmbed()
            .setTitle("O zabawie")
            .setColor(0xFF0000)
            .setDescription("Ćwiczymy razem to zabawa utworzona i działająca w grupie patronów Bazoka na platformie Discord. Ćwiczysz, raportujesz i dostajesz punkty. Celem jest zmotywowanie Ciebie do częstszej i regularnej gry na instrumencie.")
            .addFields(
				{
					name: 'Za co przydzielane są punkty?',
					value: 'Punkty możesz zdobyć na trzy sposoby:' },
				{ name: '\u200B', value: '\u200B' },

			);

	message.author.send(reply) 
}