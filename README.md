Technologie sieci Web
=====================

Projekt egzaminacyjny – MicroReddit
===================================

*   Interfejs
    *   zarówno „przeglądarkowy” jak i (responsywny) „mobilny” (oparty o [Vue.js 3](https://v3.vuejs.org/) i [SCSS](https://sass-lang.com/))
*   Funkcjonalność
    *   Użytkownicy
        *   rejestracja _(prosty formularz – login w postaci adresu e-mail, hasło, powtórzone hasło + walidacja danych – login musi być unikatowy i poprawny „składniowo” jako adres e-mail, a hasła identyczne)_ \***DST**
        *   modyfikacja profilu użytkownika _(zmiana hasła)_ \***DST**
        *   obsługa logowania _(w oparciu o zapamiętane w lokalnej bazie dane użytkownika)_ \***DST**
        *   podział ról:
            *   moderatorzy – zarządzają subredditami /r/temat: \***DST**
                *   edycja metadanych _(opis – obsługa edycji za pomocą pola tekstowego)_
                *   usuwanie postów/komentarzy
            *   administratorzy
                *   usuwanie/banowanie „niegrzecznych” użytkowników
                *   wgląd do statystyk (największe subreddity – hierarchia, hierachia polubień postów/suredditów) \***BDB**
        *   aktywacja konta po kliknięciu na „ograniczony czasowo link aktywacyjny” \***BDB**
        *   przypominanie hasła
        *   dołączanie do konkretnych subredditów \***DST**
    *   Subreddity (_/r/nazwaSubreddita_)
        *   tworzenie subredditów (twórca automatycznie zostaje moderatorem) \***DST**
        *   opcje wyświetlania postów w ramach subreddita (np. karty/lista/…)
        *   tworzenie postów w ramach danego (sub)reddita \***DST**
        *   możliwość przechodzenia pomiędzy subredditami \***DST**
        *   głosowanie na posty _(głos „za”/„przeciw” – można oddać tylko jeden)_ \***DST**
        *   post może zawierać: tekst, link, wideo (z Youtube), obrazek (na serwerze) \***DST**,
        *   (hierarchiczny \***BDB** i) dynamiczny system komentarzy ([socket.io](https://socket.io/)) _(„aktywni” użytkownicy widzą komentarze w momencie ich dodania; komentarze/posty po usunięciu przez moderatora znikają)_ \***DST**
    *   Wymagane podstrony
        *   home użytkownika z opcjami sortowanie (Best, Hot - tempo przyrostu polubień, New) (na \***DST** wyłącznie jeden sposób sortowania)
    *   Pozostałe funkcjonalności
        *   wyszukiwarka (postów według treści/subredditów według nazwy) _(pole/pola tekstowe z ewentualnym „przełącznikiem” treść/nazwa)_ \***DST**
        *   powiadomienia o odpowiedziach lub zmianach w trendach dotyczący postów danego użytkownika ([socket.io](https://socket.io/)) \***BDB**
        *   wybór popularnych subredditów (według liczby postów i liczby użytkowników) _(Top-Five najlepszych względem wybranego kryterium)_

Strona serwerowa
----------------

*   struktura będzie zadana, wstępne dane do załadowania będą zapewnione
*   serwer [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) i jego API do zrobienia
*   [socket.io](https://socket.io/)

Interfejs i zależności
----------------------

*   [Vue.js 3](https://v3.vuejs.org/) + Vue-router (!!!)
*   [Bootstrap](https://getbootstrap.com/) + [SCSS](https://sass-lang.com/) lub Vuetify lub ewentualnie inna bibiloteka do „współpracy” Vue-Bootstrap (koniecznie należy użyć SCSS!)
*   [axios.js](https://www.npmjs.com/package/axios) lub standardowy [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
*   [pg](https://www.npmjs.com/package/pg)
*   [Passport.js](http://www.passportjs.org/)
*   [socket.io](https://socket.io/) (do wszelkich zastosowań „komunikacyjnych” wykorzystujących Websockets)
*   wybrana biblioteka do obsługi poczty elektronicznej (np. [Nodemailer](https://nodemailer.com/)) – w kontekście aktywacji konta \***BDB**.