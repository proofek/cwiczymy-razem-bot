class Report {

	reportTime = null;
	technika = 0;
	sluch = 0;
	teoria = 0;
	dodatkowePunkty = 0;
	dokument = '';

	get czas() {
		return this.reportTime;
	}

	set czas(czas) {
		
		let userCzas = '';		

		if (czas.toString().indexOf(":") > 0) {
			userCzas = czas.split(':');
			this.reportTime = (+userCzas[0]*60 + +userCzas[1])/60;
		} else if (czas.toString().indexOf(".") > 0) {
			userCzas = czas.split('.');
			this.reportTime = (+userCzas[0]*60 + +userCzas[1])/60;
		} else {
			this.reportTime = +czas;
		}
  	};
}

module.exports = Report;