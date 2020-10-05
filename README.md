
Wymaganie techniczne
====================
* Node.js (zbudowano na wersji 12.18.4)
* discord.js (zbudowano na wersji 12.3.1)
* Git (zbudowano na wersji 2.28.0)
* Dostęp do github
* Dostęp do Heroku
* Heroku CLI

Stworzenie Bota
===============

1. Stwórz nową aplikację na [portalu Discorda](https://discordapp.com/developers/applications/) 
   * nazwij go 'cwiczymy-razem-bot'
   * możesz użyć ikony gitary w katalogu 'sources/img'
2. Dodaj bota do nowej aplikacji - nazwij go 'cwiczymy-razem-bot'

Dodanie bota do prywatnego serwera Discorda
-------------------------------------------

1. Kliknij ikonę plus (+), żeby dodać nowy serwer (jeżeli go jeszcze nie masz)
2. Nadaj nazwę swojemu serwerowi i wybierz region, w którym chcesz go stworzyć
3. Przejdź do [portalu Discorda](https://discordapp.com/developers/applications/) i kliknij OAuth2 po lewej stronie.
4. W sekcji _SCOPES_ wybierz _bot_ i naciśnij _Copy_
5. Otwórz nowe okno lub zakładkę w przeglądarce i wklej adres URL, który właśnie skopiowaliśmy - wybierz swój server z listy i kliknij _Autoryzuj_.
6. Zamknij to okno/zakładkę w przeglądarce.
7. Przejdź do aplikacji Discorda - bot powinien pojawić się na liście użytkowników twojego serwera

Dodanie bota do serwera Bazoka
------------------------------

Do uzupełnienia

Uprawnienia Bota
----------------

Do uzupełnienia

Umieszczenie bota na serwerze Heroku
------------------------------------

1. Stwórz nowe konto w serwisie [Heroku](https://heroku.com/)
2. Dodaj nową aplikację - kliknij _New_ > _Create New App_
   * nazwij ją 'cwiczymy-razem-bot' i wybierz odpowiedni region (najprawdopodobniej Europę)
   * kliknij _Create app_
3. Zaloguj się do heroku z lini poleceń używając komendy `heroku login`
4. Dodaj zdalny serwer heroku do gita używając komendy `heroku git:remote -a cwiczymy-razem-bot`
5. Wyślij zmiany na serwer używając komendy `git push heroku main`
6. Wyłącz tryb 'web' i włącz tryb 'worker' w zakładce 'Resources'
7. Ustaw zmienną środowiskową z wartością tokena (Token należy pobrać z [portalu Discorda](https://discordapp.com/developers/applications/) - zakładka Bot > TOKEN > przycisk _Copy_)
```
heroku config:set BOT_TOKEN=TWOJ_TOKEN
```
8. Zrestartuj aplikację używając komendy `heroku restart --app cwiczymy-razem-bot`
9. Zobacz logi, aby upewnić się, że aplikacja uruchomiła się poprawnie używając komendy `heroku logs --tail`

Aktualizacja wersji bota na serwerze Heroku
-------------------------------------------

Po wprowadzeniu zmian do kodu, należy je zapisać w Git oraz wysłać zmiany na serwer github oraz heroku.

```
$ git add .
$ git commit -am "Opis zmian w kodzie"
$ git push origin main
$ git push heroku main
```

Referencje
==========

* [Portal developerski Discorda](https://discord.com/developers/applications)
* [Heroku application](https://dashboard.heroku.com/)
* [Oryginalna aplikacja Ćwiczym razem](https://bazok-98f32.web.app/)
* [Poradnik na podstawie którego stworzono bota](https://thomlom.dev/create-a-discord-bot-under-15-minutes/)
* [Moduł discorda w Node](https://discord.js.org/)
* [Make Your Own Discord Bot | Private Messages](https://www.youtube.com/watch?v=v8YTRDQsFUo)
