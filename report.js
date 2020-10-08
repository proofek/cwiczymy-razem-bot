class Report {

	reportTime = '';
	technika = '';
	sluch = '';
	teoria = '';

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