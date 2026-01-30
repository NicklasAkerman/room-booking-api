# Analyysi
Tässä dokumentissa analysoin työtäni, tekoälyä sekä myös hieman avaan työskentelytapaani. Tein erikseen työskentelyn ohessa työvaihaiden dokumentointia, mikä löytyy alla erikseen omana osionaan.

- [Mitä tekoäly teki hyvin?](##Mitä-tekoäly-teki-hyvin?)
- [Mitä tekoäly teki huonosti?](##Mitä-tekoäly-teki-huonosti?)
- [Tärkeimmät muutokset](##Mitkä-olivat-tärkeimmät-parannukset,-jotka-teit-tekoälyn-tuottamaan-koodiin-ja-miksi?)
- [Työvaiheiden dokumentointi](##-Työvaiheiden-dokumentointi)

## Mitä tekoäly teki hyvin?
- Paransi [startPrompt.md](/startPrompt.md) tiedostoa paremmaksi (alkuperäinen [startPromptOriginal.md](/startPromptOriginal.md))
- Tekoäly teki hyvin pohjakoodin, jonka sai myös ajettua erittäin helposti.
- Tuotti testit, in-memory databasen sekä myös Swagger-dokumentoinnin.
- Osasi noudattaa selkeästi määriteltyjä endpoint- ja validointisääntöjä.
- Generoi useimmat virheenkäsittelyt ja status-koodit itsenäisesti oikein.

## Mitä tekoäly teki huonosti?
- Tekoäly teki virheitä lähinnä niissä kohdissa, joihin [startPrompt.md](/startPrompt.md) ei sisällyttänyt ohjeistusta. Toisaalta se tarjosi myös vaihtoehtoisia tapoja toteuttaa toiminnallisuus, koska pyysin sitä tekemään niin.

## Mitkä olivat tärkeimmät parannukset, jotka teit tekoälyn tuottamaan koodiin ja miksi?
Myöhemmässä [4. Koodin tarkistus](###-4.-Koodin-tarkistus) osiossa käyn laajemmin läpi kaikki tekemäni muutokset, minne olen lisännyt myös suoraan commit linkit. En osaa varsinaisesti eritellä mitkä olivat tärkeimmät parannukset, mutta kokonaisuudessaan tein seuraavat muutokset ja lisäykset projektiin:
- Poistin käyttämättömät funktiot ja middlewaret, koska se  paransi koodin luettavuutta ja vähensi turhaa koodia.
- Siistin Swagger-dokumentaatiota niin, että se vastaa todellista logiikkaa ja käyttöoikeuksia.
- Poistin turhat tiedostot ja korjasin muutaman endpointin virheellisen logiikan.
- Tarkistin kaikki endpointit ja testit, lisäsin uuden GET /api/bookings -endpointin ja siihen liittyvät testit sekä dokumentoinnin jälkikäteen tekoälyn avulla.
- Varmistin yhtenäisen virhevastausformaatin kaikissa endpointeissa.
- Lisäsin Postman-testit ja varmennukset reunaehdoille, kuten päällekkäisyydet, menneet ajat ja virheelliset aikavälit.

## Työvaiheiden dokumentointi

### 1. Aloitin luomalla startPrompt.txt -tiedoston

1. Alkuun kirjasin hyväksi havaitsemiani ohjeita tekoälylle työn tueksi.
2. Määrittelin projektin tavoitteet ja rajaukset (MVP-tasoinen kokoushuonevarausrajapinta).
3. Kuvasin käyttäjäroolit ja käyttöoikeussäännöt (normaalikäyttäjä ja superuser).
4. Määrittelin varauksiin liittyvät liiketoimintasäännöt (ei päällekkäisyyksiä, ei menneitä aikoja, kelvollinen aikaväli).
5. Suunnittelin rajapinnan endpointit ja HTTP-metodit.
6. Määrittelin käytettävät datarakenteet (Booking ja Room).
7. Kuvasin alkudatan, joka ladataan muistiin palvelimen käynnistyessä.
8. Määrittelin virhetilanteet ja HTTP-statuskoodit yhtenäisellä virhevastausformaatilla.
9. Listasin testitapaukset toiminnallisuuden varmistamiseksi.
10. Määrittelin käytettävät teknologiat, Swagger-dokumentaation sekä projektirakenteen.

Näiden määrittelyjen avulla sain hyvän lähtökohdan projektille. Muotoilin promptin niin, että ennen varsinaista tekoälyavusteista koodin tuottamista voin saada palautetta mahdollisista puutteista ja parannusehdotuksista, jolloin määrittely toimi samalla myös projektin suunnitteluna.

### 2. Koodiagentin käyttö

1. Tehtävässä käytin OpenCode-agenttia. Aluksi selvitin, mitä kielimalleja agentti tukee, ja käytin aikaa testailuun, koska kyseinen agentti oli minulle uusi. Testien perusteella valitsin kielimalliksi Z\.ai:n GLM-4.7, joka oli ilmainen ja osoittautui hyvin toimivaksi koodin tuottamisessa.
2. Pyysin agenttia lukemaan [startPrompt.md](/startPrompt.md) -tiedoston, josta sain palautetta. Otin alkuperäisen tiedoston talteen nimellä [startPromptOriginal.md](/startPromptOriginal.md) ja pyysin agenttia tekemään tiedostoon ehdotetut muutokset alkuperäiseen tiedostoon.
3. Kun muutokset oli tehty, tarkistin ne itse ja pyysin sitten agenttia toteuttamaan koodin.
4. Kävin koodin läpi, testasin sen toimivuutta ja pyysin listaamaan kaikki endpointit osoitteessa localhost:3000. Lisäksi pyysin Swagger-dokumentaatioon lisäämään endpointit, HTTP-metodit sekä request- ja response-tiedot esimerkkien kera.
5. Koska localhost:3000 ei ollut vielä halutussa muodossa, pyysin lisäämään kaikki saatavilla olevat endpointit siten, että järjestelmä ensin lukee kaikki reitit ja luo ne niiden perusteella. Lisäsin myös esimerkin.
6. Pyysin tarkistamaan, onko [README.md](/README.md) ajan tasalla kaikkien muutosten jälkeen, ja agentti sai myös ehdottaa muita parannuksia. Hyväksyin kaikki muut muutosehdotukset paitsi yhden.
7. Kopioin kaiken käydyn keskustelun [PROMPTIT.md](/PROMPTIT.md) tiedostoon ja muutin sitä hieman ulkoasullisesti luettavampaan muotoon.

### 3. Toiminnan tarkistus

1. Asensin postmanin ja tein sinne erilaisia pyyntöjä. Lisäsin myös postmanin JSON tiedoston kansioon. [postman_JSON](/Bookings%20API%20tests.postman_collection.json)
2. Pyysin tekoälyä tekemään uuden GET metodin, jolla saadaan kaikki varaukset haettua.
3. Muutoksia GitHubiin laittaessa huomasin, että rivinvaihto on mennyt sekaisin CLRF-LF. Tämä oli ennestään tuttu ongelma työelämästä, jolloin muistin, että voin tehdä juureen määritykset [.gitattributes](/.gitattributes) tiedostoon. Tein uuden projektin, johon git historian avulla kopioin kaikki muutokset askeleen kerrallaan, mutta lisäsin jo ensimmäiseen committiin tämän [.gitattributes](/.gitattributes) tiedoston, jolloin oikeat muutokset ovat havaittavissa ilman tarvetta miettiä oikeaa rivinvaihtoa.
4. Ajoin kaikki postman testit läpi vielä kertaalleen testaten seuraavat reunaehdot/virheet:
- **Varauksen luonti**: Varaa huone tietylle aikavälille
    ```json
    {
      "roomId": "room1",
      "userId": "user1",
      "startTime": "2031-01-01T10:00:00.000Z",
      "endTime": "2031-01-01T12:00:00.000Z",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
    Vastaus: **201 Created**
    
    {
        "id": "3e849910-0715-4176-bd63-08205703f564",
        "roomId": "room1",
        "userId": "user1",
        "startTime": "2031-01-01T10:00:00.000Z",
        "endTime": "2031-01-01T12:00:00.000Z",
        "createdAt": "2026-01-30T09:58:41.537Z"
    }

- **Varauksen peruutus**: Poista varaus.
    >Varauksen poisto onnistui DELETE pyynnöllä, kun headerissä oli oikea userId sekä varaukse ID oli oikein.

- **Varausten katselu**: Listaa kaikki tietyn huoneen varaukset.
    >Get pyyntö \http://localhost:3000/api/bookings listasi oikein kaikki varaukset JSON muodossa


- **Varaukset eivät saa mennä päällekkäin**
    ```json
    {
      "roomId": "room1",
      "userId": "user1",
      "startTime": "2030-01-01T10:00:00.000Z",
      "endTime": "2030-01-01T12:00:00.000Z",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
    Vastaus: **400 Bad Request**
    {
        "error": "Booking overlaps with an existing booking"
    }

- **Varaukset eivät voi sijoittua menneisyyteen**
    ```json
    {
      "roomId": "room1",
      "userId": "user1",
      "startTime": "2000-01-01T10:00:00.000Z",
      "endTime": "2030-01-01T12:00:00.000Z",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
    Vastaus: **400 Bad Request**
    {
        "error": "startTime must be in the future"
    }

- **Aloitusajan täytyy olla ennen lopetusaikaa.**
    ```json
    {
      "roomId": "room1",
      "userId": "user1",
      "startTime": "2030-01-01T10:00:00.000Z",
      "endTime": "2029-01-01T12:00:00.000Z",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
    Vastaus: **400 Bad Request**
    {
        "error": "startTime must be less than endTime"
    }

### 4. Koodin tarkistus

katselmoin aiemman vaiheen generoidun koodin keskittyen logiikkaan, koodin laatuun ja luettavuuteen, virheenkäsittelyyn sekä rakenteeseen. Suurin osa koodista oli loogista, funktioiden ja muuttujien nimeämiset olivat selkeitä ja koodi helppolukuista. Virheenkäsittely toteutui loogisesti kaikissa perustoiminnoissa, kuten varauksen luonnissa ja poistossa. Koska projekti on MVP-tasoinen, koodia on melko vähän, eikä laajempia arkkitehtuurisia haasteita ilmennyt. Joissain kohdissa, kuten käyttäjän tietojen päivityksessä, voisi harkita tarkempia virheilmoituksia, mutta kokonaisuudessaan koodi täyttää vaatimukset hyvin.

1. roomsList.js ei tee mitään, joten sen voi poistaa [Commit](https://github.com/NicklasAkerman/room-booking-api/commit/92823a289d928a626bae37ec1aae24d182ad25ab)
2. Jos varausta yrittää muuttaa niin, että myös userId vaihdetaan, menee pyyntö läpi, mutta userId ei vaihdu, joten tähän(bookings.js rivi 207) voisi mahdollisesti miettiä virheilmoitusta, mutta en koe tarpeelliseksi MVP versioon.
3. Reitit, funktiot ja nimet ovat toimintaansa kuvaavia, joten ylimääräistä koodin kommentointia en tässä tapauksessa pidä olennaisena.
4. Swaggeriin oli jääny väärä description (bookings endpoint ainoastaan superuserille) [Commit](https://github.com/NicklasAkerman/room-booking-api/commit/6745c0454ab8e6f04c8e86df9ab8131c3dac2550)
5. auth.js osiossa checkSuperUser ei ole käytössä, joten se on turhaa koodia. PUT ja DELETE käyttävät checkBookingOwnership joten tämän osion voi poistaa. Tämä osio tuli, kun pyysin tekoälyä tekemään /bookings endpointin.[Commit1](https://github.com/NicklasAkerman/room-booking-api/commit/976caec93a96234f79da5511798b8e966a86331f) & [commit2](https://github.com/NicklasAkerman/room-booking-api/commit/31766293b42d1c902518a245bebce948cb39117a)
6. auth.js osiossa checkBookingOwnership tarkistaa jo, onko ID olemassa, joten en tarvitse bookings.js osiossa samaa tarkistusta.[Commit](https://github.com/NicklasAkerman/room-booking-api/commit/9b1010088e00c160e530af8b7de42de295b0708b)
7. validation.js piti sisällään validateBookingExists function, joka ei ole missään käytössä. [Commit](https://github.com/NicklasAkerman/room-booking-api/commit/9c70f2a6a0d169adf744ea265efda8fbbe8a5fe7)
8. Ajoin npm test ja testit olivat rikki. Koska testit eivät menneet läpi PUT osalta, oli se helppo selvittää. Koodin siistimisen yhteydessä bookind.roomId ei ollut enää saatavilla.