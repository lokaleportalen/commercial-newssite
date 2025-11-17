import { db } from "../db";
import { article } from "../schema";

export async function seedArticles() {
  console.log("Seeding articles...");

  const articles = [
    {
      title: "Hellerup-ambassade solgt i én af årets største handler",
      slug: "hellerup-ambassade-solgt-i-en-af-aarets-storste-handler",
      summary:
        "Den tidligere saudiske ambassade på Lille Strandvej i Hellerup er solgt for 153,2 mio. kr., og handlen er registreret via nystiftede LSV 27 ApS. Ejendommen på knap 3.000 m² står i dårlig stand, men rummer potentiale til renovering eller nedrivning og udstykning.",
      metaDescription:
        "Tidligere saudisk ambassade i Hellerup solgt for 153,2 mio. kr. i én af årets største ejendomshandler. Potentiale til renovering eller udstykning.",
      categories: "Investering, Bolig",
      status: "published" as const,
      publishedDate: new Date("2025-11-17"),
      content: `# Hellerup-ambassade solgt for 153,2 mio. kr. i én af årets største ejendomshandler

Den tidligere saudiarabiske ambassade på Lille Strandvej 27 i Hellerup er blevet handlet for 153,2 mio. kr. Handlen, der ifølge flere medier hører til blandt årets største private ejendomstransaktioner i Danmark, er registreret gennem selskabet LSV 27 ApS (CVR 45986837), hvor Peter Sextus Rasmussen er angivet som bestyrelsesformand.

## Handlens detaljer og ejendommens historie

Ejendommen, et palæ opført i 1902 med omkring 21–23 værelser, ligger på en grund tæt på 2.968–3.000 m² på en af Hellerups mest eftertragtede adresser. Saudi-Arabien købte ejendommen i 1975 fra General Motors og benyttede den som ambassade, indtil repræsentationen senere blev flyttet til Lyngbyvej på Østerbro. Bygningen har i flere år stået tom og fremstod ved udbud i dårlig stand.

Den historiske bygning bærer præg af sin lange historie som diplomatisk repræsentation. Interiøret rummer stadig originale stuklofter, parketgulve og marmorkaminer fra begyndelsen af 1900-tallet, om end alt trænger til omfattende renovering. Facaden er fredet, hvilket stiller særlige krav til eventuelle renoveringsarbejder.

Ejendommen blev tidligere udbudt i 2023 med en annonceret pris på 250 mio. kr., mens den offentlige ejendomsværdi i 2020 lå omkring 80 mio. kr., og grundværdien blev angivet til cirka 23,7 mio. kr. Den seneste handel er registreret via det nystiftede selskab LSV 27 ApS, stiftet i oktober 2025, og ejerskabsstrukturen er knyttet til holdingselskabet SEXTUS NEXT ApS.

Forskellen mellem udbudsprisen og salgsprisen afspejler den usikkerhed, der knytter sig til ejendommens stand og de omfattende investeringer, der vil være nødvendige uanset hvilken udviklingsretning den nye ejer vælger.

## Markedsperspektiv og prisniveau

Handlen placerer sig i den absolut høje ende af det danske ejendomsmarked og understreger den fortsatte efterspørgsel efter unikke ejendomme i absolutte topplaceringer. Lille Strandvej i Hellerup betragtes som en af landets mest престижфульde boligadresser med direkte adgang til Strandvejen og Øresund.

"Beliggenheden er helt unik med et stort potentiale for den rigtige køber. Der er ikke mange grunde af denne størrelse tilbage i Hellerup," udtaler Nis Nordang fra Home Hellerup, der var involveret i markedsføringen af ejendommen.

Flere ejendomseksperter peger på, at prisen pr. m² grund på cirka 51.000 kr. ligger væsentligt over gennemsnittet for området, men at købers forventede økonomiske bæreevne og udviklingspotentialet retfærdiggør prislejet. Sammenlignet med andre større handler i Hellerup de seneste år ligger prisen i toppen, kun overgået af enkelte nybyggede luksusejendomme direkte på Strandvejen.

## Udviklingspotentiale og lokalplanbegrænsninger

Salgsoplysninger og mæglermateriale fremhæver, at ejendommen kan renoveres eller rives ned for at udstykke eller udvikle grunden. Lokale bestemmelser i Gentofte Kommune fastsætter dog minimumsgrundstørrelser på cirka 700 m² ved udstykning, hvilket i praksis begrænser mulighederne til typisk 3–4 nye byggegrunde, hvis nedrivning og udstykning gennemføres.

En totalrenovering af den eksisterende bygning vil kræve investeringer på anslået 40-60 mio. kr., afhængigt af ambitionsniveauet og de materialer der anvendes. Fredningen af facaden indebærer, at alle ændringer skal godkendes af Kulturstyrelsen, hvilket kan forlænge processen betydeligt.

Alternativt kan ejendommen nedrives og grunden udstykkes i 4 byggegrunde på hver cirka 700-750 m². Ved salg af disse grunde til typisk 15-20 mio. kr. pr. styk, kan den nye ejer potentielt realisere en samlet indtægt på 60-80 mio. kr., hvilket dog skal ses i forhold til nedrivningsomkostninger, infrastruktur og de juridiske omkostninger ved udstykning.

En tredje mulighed er at bevare bygningen og omdanne den til flere selvstændige lejligheder eller en eksklusiv fælles bolig. Dette kræver omfattende ombygning, men kan potentielt give en højere samlet værdi end udstykning, især hvis der kan skabes 6-8 eksklusive lejligheder med hver deres del af haven.

## Ejerskabsstruktur og fremtidsplaner

LSV 27 ApS blev stiftet i oktober 2025 med en selskabskapital på 40.000 kr. og har til formål at eje og drive fast ejendom. Peter Sextus Rasmussen, der er kendt fra flere større ejendomsprojekter i hovedstadsområdet, fremstår som den drivende kraft bag købet gennem sin position som bestyrelsesformand.

Den nye ejer har endnu ikke offentliggjort konkrete planer for ejendommen. Lokale beboere og byrådsmedlemmer har udtrykt håb om, at bygningen bevares og renoveres frem for nedrivning, men anerkender samtidig, at beslutningen ligger hos den private ejer inden for lokalplanens rammer.

Gentofte Kommune har bekræftet, at man vil være i dialog med den nye ejer om fremtidsplanerne og sikre, at al udvikling sker i overensstemmelse med lokalplanen og eventuelle fredningskrav. Kommunen har tidligere givet udtryk for, at man gerne ser, at ejendommens historiske værdi bevares.`,
    },
    {
      title: "Ny logistics hub åbner ved Øresund – 45.000 m² til e-handel",
      slug: "ny-logistics-hub-aabner-ved-oresund-45000-kvm",
      summary:
        "Prologis indvier et nyt logistikcenter på 45.000 m² ved Københavns lufthavn. Faciliteten er fuldt udlejet til en førende e-handelsaktør og markerer den største nybyggede logistikejendom i hovedstadsområdet i 2025.",
      metaDescription:
        "Prologis indvier 45.000 m² logistikcenter ved Københavns lufthavn, fuldt udlejet til e-handelsaktør. Største nybyggeri i hovedstadsområdet 2025.",
      categories: "Logistik, Byggeri",
      status: "published" as const,
      publishedDate: new Date("2025-11-16"),
      content: `# Ny logistics hub åbner ved Øresund – 45.000 m² til e-handel

Prologis, en af verdens største udviklere af logistikejendomme, har indviet et nyt, moderne logistikcenter på 45.000 m² i nærheden af Københavns lufthavn. Ejendommen, der ligger strategisk placeret tæt på motorvejsnettet og lufthavnen, er allerede fuldt udlejet til en førende e-handelsaktør, der ønsker at forblive anonym frem til officiel åbning.

Projektet repræsenterer en samlet investering på cirka 520 mio. kr. og er det største nybyggede logistikprojekt i hovedstadsområdet i 2025. Byggeriet blev påbegyndt i foråret 2024 og er nu klar til ibrugtagning efter 18 måneders intensivt byggeri.

## Strategisk beliggenhed og moderne faciliteter

Det nye center er udstyret med state-of-the-art teknologi, herunder automatiserede sorteringssystemer, LED-belysning og solcellepaneler på taget, der forventes at dække op mod 40% af bygningens energiforbrug. Faciliteten er certificeret efter BREEAM Excellent og opfylder de højeste standarder for bæredygtighed i logistiksektoren.

Bygningens placering ved motorvejsnettet giver direkte adgang til både Øresundsmotorvejen og motorvejene mod nord og vest, hvilket er kritisk for effektiv distribution. Afstanden til Københavns centrum er kun 15 km, hvilket gør det muligt at levere varer til kunder i hovedstadsområdet inden for 1-2 timer fra ordreafgivelse.

Interiøret er designet til maksimal fleksibilitet med en frihøjde på 12 meter, hvilket gør det muligt at stable varer højt og optimere lagerkapaciteten. Der er 60 lastporte, så flere lastbiler kan losse og læsse samtidigt, hvilket reducerer ventetider og øger effektiviteten.

"Dette projekt understreger den fortsatte efterspørgsel efter moderne logistikfaciliteter i Danmark, især i hovedstadsområdet, hvor nærhed til både lufthavn og motorveje er afgørende," udtaler Morten Nielsen, landechef for Prologis Danmark.

## Teknologisk innovation

Ud over de fysiske faciliteter er bygningen udstyret med avanceret warehouse management software, der kan integreres direkte med lejerens eksisterende IT-systemer. Dette gør det muligt at automatisere mange processer og reducere behovet for manuel håndtering.

Automatiserede mobile roboter (AMR'er) kan navigere rundt i lageret og transportere varer mellem forskellige zoner, hvilket reducerer behovet for gaffeltruck og manuel transport. Systemet kan håndtere op til 100.000 ordrer pr. dag ved fuld kapacitet.

Der er også installeret et omfattende sensor-netværk, der overvåger temperatur, luftfugtighed og bevægelser i realtid. Dette sikrer optimal opbevaring af varerne og giver mulighed for at opdage eventuelle problemer, før de bliver kritiske.

## E-handelens krav former logistikmarkedet

Den fulde udlejning før ibrugtagning afspejler den stærke efterspørgsel fra e-handelsselskaber, der har brug for effektive distributionscentre til at håndtere den voksende onlinehandel. Analyser fra CBRE viser, at e-handelssegmentet nu udgør næsten 30% af den samlede efterspørgsel efter logistikareal i Danmark.

E-handelens krav til logistikfaciliteter er markant anderledes end traditionel detail- og engroshandel. Hvor traditionelle lagre ofte håndterer store leverancer til få modtagere, skal e-handelscentre kunne håndtere tusindvis af små ordrer til individuelle forbrugere hver dag.

Dette stiller krav om høj grad af automatisering, effektive pakkelinjer og tæt integration med transportører. Samtidig skal faciliteterne kunne håndtere returnerede varer, som typisk udgør 15-20% af alle e-handelskøb.

"Vi ser en fundamental ændring i, hvordan varer distribueres. E-handel kræver helt anderledes logistikløsninger end traditionel handel, og det driver efterspørgslen efter moderne, teknologitunge faciliteter som denne," forklarer Anne-Marie Skov, seniorkonsulent hos CBRE.

## Betydning for det lokale arbejdsmarked

Åbningen af det nye logistikcenter forventes at skabe 250-300 direkte arbejdspladser samt yderligere 100-150 indirekte job hos samarbejdspartnere og transportører. Lejeren har bekræftet, at rekrutteringen vil foregå primært lokalt, med fokus på at tiltrække medarbejdere fra de omkringliggende kommuner.

Arbejdspladserne spænder fra lagermedarbejdere og chauffører til IT-specialister, der skal administrere de automatiserede systemer, og logistikplanlæggere, der optimerer vareflowen. Lønningerne ligger typisk mellem 28.000 og 45.000 kr. om måneden afhængigt af kompetencer og ansvar.

## Fremtidig udvikling i området

Prologis har bekræftet, at man undersøger muligheden for yderligere udvikling i området. Der er reserveret en tilstødende grund på 30.000 m², hvor man overvejer at opføre et supplerende logistikcenter, hvis efterspørgslen fortsætter med at være høj.

Andre udviklere følger også udviklingen med stor interesse. Det forventes, at området omkring Københavns lufthavn vil se flere større logistikprojekter de kommende år, drevet af både e-handel og international handel via lufthavnen.`,
    },
    {
      title: "Kontormarkedet i København viser første tegn på genopretning",
      slug: "kontormarkedet-i-kobenhavn-viser-forste-tegn-paa-genopretning",
      summary:
        "Ledighedsprocenten for kontorejendomme i København er faldet til 7,8% i 3. kvartal 2025 – det laveste niveau siden pandemiens start. Især områder som Nordhavn og Sydhavn oplever stigende efterspørgsel.",
      metaDescription:
        "Københavns kontormarked viser fremgang med ledighed faldet til 7,8%. Nordhavn og Sydhavn oplever stigende efterspørgsel efter kontorarealer.",
      categories: "Kontor, Investering",
      status: "published" as const,
      publishedDate: new Date("2025-11-15"),
      content: `# Kontormarkedet i København viser første tegn på genopretning

Efter flere års nedgang viser det københavnske kontormarked nu klare tegn på stabilisering. Ledighedsprocenten er faldet til 7,8% i 3. kvartal 2025, hvilket er en nedgang på 1,2 procentpoint sammenlignet med samme periode sidste år, viser nye tal fra Colliers Danmark.

Faldet i ledigheden er særligt markant set i lyset af, at flere års pandemidrevet arbejde hjemmefra og efterfølgende hybrid arbejdsmodeller har sat markedet under pres. At udviklingen nu vender, indikerer, at virksomhederne igen prioriterer fysiske kontorfaciliteter, om end på en anden måde end før pandemien.

## Nordhavn og Sydhavn trækker markedet

De tidligere havneområder, især Nordhavn og Sydhavn, står for en stor del af den positive udvikling. Områderne tiltrækker både danske og internationale virksomheder, der søger moderne kontorfaciliteter med gode transport- og servicemuligheder. I Nordhavn er ledigheden nu nede på 4,2%, hvilket svarer til et marked i balance.

Nordhavn har udviklet sig til et attraktivt erhvervsområde med moderne arkitektur, gode forbindelser via metro og letbane, samt et stigende udbud af caféer, restauranter og andre servicetilbud. Området tiltrækker især tech-virksomheder, rådgivningsfirmaer og kreative virksomheder.

"Nordhavn og Sydhavn repræsenterer en ny type kontorområde, hvor der er fokus på kvalitet, bæredygtighed og livskvalitet. Det er ikke bare et sted, man arbejder – det er et sted, man gerne vil være," forklarer Thomas Holst, partner hos Colliers.

I Sydhavn er udviklingen primært drevet af større virksomheder, der har konsolideret flere spredte lokationer til én stor, moderne hovedkontorbygning. Området har fordel af god vejadgang og nærhed til både lufthavn og centrum.

## Ændrede kontorbehov driver efterspørgslen

"Vi ser en markant ændring i virksomhedernes tilgang til kontorarealer. Der er øget fokus på kvalitet, beliggenhed og fleksibilitet frem for kvadratmeter," forklarer Anna Kjerulf, Research Director hos Colliers.

Mens det samlede arealforbrug pr. medarbejder er faldet med cirka 15-20% siden 2019, investerer virksomhederne i stedet mere i de kvadratmeter, de faktisk beholder. Det betyder bedre indretning, mere fleksible mødezoner, forbedrede fælleslokaler og ofte også bedre teknologi.

Mange virksomheder er gået fra lukkede enkeltmandskontorer til åbne kontorlandskaber med varierende arbejdszoner. Der er mere fokus på at skabe rum til både koncentreret arbejde, samarbejde og sociale interaktioner. Køkkener og loungeområder opgraderes, så de kan fungere som alternative arbejdspladser og mødesteder.

Samtidig stilles der højere krav til bygningernes bæredygtighed og indeklima. WELL-certificering og fokus på medarbejdernes trivsel er blevet centrale parametre, når virksomheder vælger nye lokaler.

## Prisniveau og investeringsappetit

Kvadratmeterpriserne for nyere kontorejendomme i København er steget med 8% over det seneste år, mens ældre kontorejendomme fortsat oplever prispres. Investorerne viser særlig interesse for DGNB-certificerede bygninger med lave driftsomkostninger og god tilgængelighed via offentlig transport.

For de mest attraktive nybyggerier i Nordhavn og Indre By ligger hyrene nu på 1.800-2.200 kr. pr. m² årligt, hvilket er en stigning på 12-15% over de seneste to år. Til sammenligning ligger hyrerne for ældre kontorbygninger uden væsentlige opgraderinger typisk på 1.000-1.400 kr. pr. m².

Denne prisspredning afspejler, at markedet er blevet mere polariseret. Virksomheder, der prioriterer moderne faciliteter, er villige til at betale en præmie, mens ældre bygninger har svært ved at tiltrække lejere, medmindre de kan tilbyde betydeligt lavere priser.

## Investeringsmarkedet vågner op

Efter en lang periode med få handler viser investeringsmarkedet for kontorejendomme nu tegn på at komme tilbage. I 3. kvartal 2025 blev der handlet kontorejendomme for cirka 4,2 mia. kr., hvilket er det højeste kvartalsniveau siden 2022.

Internationale investorer viser fornyet interesse for det danske marked, især for nyere, bæredygtige bygninger med stærke lejere på lange kontrakter. Afkastkravene for primeejendomme er faldet fra 5,5-6% for et år siden til nu 4,8-5,2%, hvilket afspejler den øgede investorappetit.

"Vi ser en klar opdeling mellem core-ejendomme, som handles til lave afkastkrav, og value-add muligheder, hvor køberne skal påtage sig ombygnings- og udlejningsrisiko. Prisforskellen mellem de to kategorier er betydelig," uddyber Anna Kjerulf.

## Fremtidsudsigter

Prognoserne for det københavnske kontormarked er forsigtigt optimistiske. Analyserne peger på, at ledigheden vil fortsætte med at falde gennem 2026, om end i et mere moderat tempo end det seneste år.

Der forventes dog fortsat at være udfordringer for ældre kontorejendomme i sekundære beliggenhed. Ejere af sådanne ejendomme vil skulle overveje omfattende opgraderinger eller alternative anvendelsesmuligheder som boliger, hoteller eller blandede formål.

Det største ukendte er udviklingen i arbejdsmodellerne. Hvis flere virksomheder i fremtiden vælger at øge andelen af hjemmearbejde, kan det igen lægge pres på efterspørgslen. Omvendt viser internationale erfaringer, at behovet for fysiske kontorer er mere robust, end mange forudså under pandemien.`,
    },
    {
      title: "Supermarkedskæde ekspanderer – 12 nye butikker i 2026",
      slug: "supermarkedskade-ekspanderer-12-nye-butikker-i-2026",
      summary:
        "Coop har indgået lejeaftaler for 12 nye butikslokaler fordelt over hele Danmark. Ekspansionen fokuserer på byer mellem 15.000 og 50.000 indbyggere og forventes at skabe over 300 nye arbejdspladser.",
      metaDescription:
        "Coop ekspanderer med 12 nye butikker i 2026 i danske provinsbyer. Over 300 nye arbejdspladser skabes i byer med 15.000-50.000 indbyggere.",
      categories: "Detailhandel, Investering",
      status: "published" as const,
      publishedDate: new Date("2025-11-14"),
      content: `# Supermarkedskæde ekspanderer – 12 nye butikker i 2026

Coop har netop offentliggjort planerne om at åbne 12 nye SuperBrugsen- og Dagli'Brugsen-butikker fordelt over hele Danmark i løbet af 2026. Ekspansionen er den største i kædens historie siden 2018 og markerer en strategisk satsning på provinsbyer.

De nye butikker repræsenterer en samlet investering på cirka 350 mio. kr. og omfatter både nybyggerier og overtagelse af eksisterende butikslokaler, der totalrenoveres. Ekspansionen er et resultat af flere års analyse af markedet og identifikation af underforsynede områder.

## Strategisk fokus på mellemstore byer

De nye butikker vil blive placeret i byer mellem 15.000 og 50.000 indbyggere, hvor Coop identificerer et underforsynet marked. "Vi ser et stort potentiale i de mellemstore byer, hvor lokalbefolkningen efterspørger moderne indkøbsmuligheder med et bredt sortiment," udtaler Kåre Michaelsen, ejendomschef i Coop Danmark.

Analyser viser, at mange provinsbyer har oplevet en svækkelse af deres lokale detailhandel de seneste 10-15 år. Mindre, ældre supermarkeder har lukket, og indbyggerne har måttet køre til større byer for at handle. Dette skaber et vakuum, som Coop nu søger at udfylde.

"Vores strategi er at tilbyde moderne butikker med et bredt varesortiment, friske varer og gode priser i byer, hvor lokalbefolkningen ellers skal køre langt for at handle. Vi tror på, at der er et stort uudnyttet potentiale," forklarer Michaelsen.

De 12 nye butikker vil blive spredt geografisk over hele landet med fokus på Jylland og Fyn, hvor Coop traditionelt har en stærk markedsposition. Konkret er der planlagt butikker i byer som Skive, Lemvig, Nykøbing Mors, Fåborg, Assens og flere andre.

## Detaljerede lejeaftaler og økonomisk model

Lejeaftalerne er typisk 15-20 årige og omfatter lokaler på mellem 1.200 og 2.500 m². Flere af ejendommene er nybyggerier, der er udviklet specifikt til formålet, mens andre er eksisterende butikslokaler, der totalrenoveres.

De årlige lejeudgifter ligger typisk på 800-1.200 kr. pr. m² afhængigt af beliggenhed og bygningens standard. For en typisk butik på 1.800 m² betyder det en årlig leje på 1,4-2,1 mio. kr., hvilket er en væsentlig omkostning, men som Coop forventer at kunne bære gennem stabile omsætningstal.

Nybyggerierne er alle designet efter Coops nyeste butikskoncept med fokus på bæredygtighed, energieffektivitet og kundevenlighed. Det omfatter LED-belysning, køleanlæg med naturlige kølemidler, solceller på taget og genanvendelse af varme fra kølediske til opvarmning af butikken.

Butikkerne vil alle have et bredt sortiment på 10.000-15.000 varenumre, herunder et stort udvalg af økologiske og lokale produkter. Der vil være fokus på friske varer med egne bagere, slagtere og grøntafdelinger, hvilket adskiller konceptet fra discount-kæderne.

## Betydning for udlejere og lokalsamfund

For ejendomsudviklere og investorer repræsenterer de lange lejeaftaler med en stærk lejer som Coop en attraktiv mulighed for stabile afkast. Samtidig forventes etableringerne at skabe over 300 nye jobs og bidrage positivt til de lokale handelsområder.

En typisk SuperBrugsen-butik beskæftiger 15-25 medarbejdere i forskellige stillinger fra butiksassistenter og kassemedarbejdere til afdelingsledere og butikschefer. Med 12 nye butikker forventes der skabt 250-300 direkte arbejdspladser samt yderligere 50-100 indirekte job hos leverandører og serviceudbydere.

"Når vi åbner en ny butik i en mindre by, er det ikke bare en butik – det er et lokalt samlingssted og en vigtig arbejdsplads. Vi ansætter lokalt og prioriterer at være en aktiv del af lokalsamfundet," understreger Michaelsen.

For de lokale kommuner er etableringerne også positive, da de styrker handelsmønstret, reducerer behovet for transport til andre byer og bidrager til at holde liv i bycentrene. Flere kommuner har også givet økonomisk støtte til forbedring af infrastruktur og parkeringspladser omkring de nye butikker.

## Konkurrencesituation og markedsudvikling

Ekspansionen sker i et marked, hvor konkurrencen er intensiv. Discount-kæder som Netto, Rema 1000 og Aldi har de seneste år åbnet mange butikker i provinsbyer, mens andre supermarkedskæder har trukket sig tilbage eller lukket mindre, urentable butikker.

Coops strategi er at differentiere sig gennem et bredere sortiment, højere kvalitet og bedre service end discount-kæderne. "Vi ved, at vi ikke kan konkurrere på de laveste priser, men vi kan konkurrere på udvalg, kvalitet og kundeoplevelse," siger Michaelsen.

Analysere peger på, at der er plads til både discount og supermarkeder i de fleste byer, hvis de formår at finde deres egen niche. Coops fokus på friske varer, lokale produkter og god service forventes at appellere til en kundegrup, der ikke udelukkende er prisorienteret.

## Fremtidsudsigter og yderligere ekspansion

Hvis de 12 nye butikker lever op til forventningerne, har Coop signaleret, at der kan følge yderligere ekspansion i de kommende år. Der er identificeret yderligere 15-20 potentielle lokationer, hvor en Coop-butik kunne være relevant.

"2026 er bare begyndelsen. Hvis vi får succes med denne første bølge, er vi klar til at fortsætte. Der er stadig mange steder i Danmark, hvor vi ser et uudnyttet potentiale," afslutter Michaelsen.`,
    },
  ];

  // Insert articles in batches
  console.log(`Inserting ${articles.length} articles...`);

  for (const articleData of articles) {
    await db.insert(article).values(articleData);
  }

  console.log(`✓ Successfully seeded ${articles.length} articles`);
}
