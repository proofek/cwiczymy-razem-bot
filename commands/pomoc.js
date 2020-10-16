module.exports = (message, args) => {

	const msgText1 = `Wszystkie komendy bota poprzedzone są znakiem wykrzyknika (!). Argumenty w nawiasach kwadratowych [] są opcjonalne.

__Oto dostępne komendy:__

  - **!pomoc** - wyświetla informacje na temat, jak używać bota oraz listę wszystkich dostępnych komend

  - **!info** - wyświetla informacje na temat zabawy Ćwiczymy Razem

  - **!nowy-profil** - dodaje nowego gracza do zabawy, używając nazwę użytkownika z discorda.

  - **!profil _[nazwa-użytkownika]_** - wyświetla profil gracza *nazwa-użytkownika*. W przypadku pominięcia *nazwa-użytkownika*, wyświetlony zostaje profil użytkownika wydającego komendę

  - **!raport** - dodaje raport z ćwiczenia w formacie jak niżej

    -------------------------------
    Data: 2020-10-01
    Czas ćwiczeń: 1:00h
    1. Technika: opis ćwiczenia
    2. Słuch: opis ćwiczenia
    3. Teoria: opis ćwiczenia
    -----------------------------

    - Data wykonania ćwiczenia jest opcjonalna (w przypadku braku używana jest aktualna data). Wymagany format to _YYYY-MM-DD_, czyli np. 2020-10-01. Raporty można składać tylko do 7 dni wstecz
    - Czas ćwiczeń - ilość czasu poświecona na wszystkie ćwiczenia danego dnia. Parametr wymagany w formacie _HH:MM_, czyli 00:30 to 30 minut, 05:15 to 5 godzin i 15 minut.
    - Technika - za ćwiczenie techniki danego dnia przyznawany jest 1 punkt.
    - Słuch - za ćwiczenie słuchu danego dnia przyznawany jest 1 punkt.
    - Teoria - za ćwiczenie teorii danego dnia przyznawany jest 1 punkt.
    - Aby zdobyć 1 dodatkowy punkt - umieść w raporcie link dokumentujący ćwiczenie LUB wrzuć na kanał załącznik dokumentujący ćwiczenie i dołącz raport w komentarzu do pliku. `

  const msgText2 = `

  - **!top10** - wyświetla aktualną tablicę wyników dla 10-ciu najlepszych graczy

  - **!nowy-sezon _startDate=YYYY-MM-DD_ _endDate=YYYY-MM-DD_** - tworzy nowy sezon gry w podanym terminie. Wymagany format daty to _YYYY-MM-DD_, czyli np. 2020-10-01.

  - **!status _[sezon=numer-sezonu]_** - wyświetla status i statystki dla sezonu o podanym _numerze-sezonu_. W przypadku pominięcia *numeru-sezonu*, wyświetlony zostaje status is statystyki aktualnego sezonu.

  - **!odznaki** - wyświetla listę dostępnych odznak do zdobycia przez graczy
_Wersja bota: 1.0.6_
`
	message.author.send(msgText1);
  message.author.send(msgText2);
}