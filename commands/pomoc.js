module.exports = (message, args) => {

	const msgText = `Wszystkie komendy bota poprzedzone są znakiem wykrzyknika (!). Argumenty w nawiasach kwadratowych [] są opcjonalne.

__Oto dostępne komendy:__

- **!pomoc** - wyświetla informacje na temat, jak używać bota oraz listę wszystkich dostępnych komend

- **!info** - wyświetla informacje na temat zabawy Ćwiczymy Razem

- **!nowy-profil** - dodaje nowego gracza do zabawy, używając nazwę użytkownika z discorda.

- **!profil _[nazwa-użytkownika]_** - wyświetla profil gracza *nazwa-użytkownika*. W przypadku pominięcia *nazwa-użytkownika*, wyświetlony zostaje profil użytkownika wydającego komendę

- **!raport _data=YYYY-MM-DD_ _czas=HH:MM_ _[technika=HH:MM]_ _[sluch=HH:MM]_ _[teoria=HH:MM]_** - dodaje raport dla podanej daty

  - _data_ - data wykonania ćwiczenia. Parametr wymagany w formacie _YYYY-MM-DD_, czyli 2020-10-01. Raporty można składać tylko do 7 dni wstecz
  - _czas_ - ilość czasu poświecona na wszystkie ćwiczenia danego dnia. Parametr wymagany w formacie _HH:MM_, czyli 00:30 to 30 minut, 05:15 to 5 godzin i 15 minut.
  - _technika_ - ilość czasu poświecona na ćwiczenie techniki danego dnia. Parametr opcjonalny w formacie _HH:MM_, czyli 00:30 to 30 minut, 01:15 to 1 godzina i 15 minut.
  - _sluch_ - ilość czasu poświecona na ćwiczenie słuchu danego dnia. Parametr opcjonalny w formacie _HH:MM_, czyli 00:30 to 30 minut, 01:15 to 1 godzina i 15 minut.
  - _teoria_ - ilość czasu poświecona na ćwiczenie teorii danego dnia. Parametr opcjonalny w formacie _HH:MM_, czyli 00:30 to 30 minut, 01:15 to 1 godzina i 15 minut.`;
	message.author.send(msgText);
}