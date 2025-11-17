import { db } from "../db";
import { article } from "../schema";

export async function seedArticles() {
  console.log("Seeding articles...");

  const articles = [
    {
      title: "Hellerup-ambassade solgt i én af årets største handler",
      slug: "hellerup-ambassade-solgt-i-en-af-aarets-storste-handler",
      summary: "Den tidligere saudiske ambassade på Lille Strandvej i Hellerup er solgt for 153,2 mio. kr., og handlen er registreret via nystiftede LSV 27 ApS. Ejendommen på knap 3.000 m² står i dårlig stand, men rummer potentiale til renovering eller nedrivning og udstykning.",
      metaDescription: "Tidligere saudisk ambassade i Hellerup solgt for 153,2 mio. kr. i én af årets største ejendomshandler. Potentiale til renovering eller udstykning.",
      categories: "Investering, Bolig",
      status: "published" as const,
      publishedDate: new Date("2025-11-17"),
      content: `# Hellerup-ambassade solgt for 153,2 mio. kr. i én af årets største ejendomshandler

Den tidligere saudiarabiske ambassade på Lille Strandvej 27 i Hellerup er blevet handlet for 153,2 mio. kr. Handlen, der ifølge flere medier hører til blandt årets største private ejendomstransaktioner i Danmark, er registreret gennem selskabet LSV 27 ApS (CVR 45986837), hvor Peter Sextus Rasmussen er angivet som bestyrelsesformand.

## Handlens detaljer og ejendommens historie

Ejendommen, et palæ opført i 1902 med omkring 21–23 værelser, ligger på en grund tæt på 2.968–3.000 m² på en af Hellerups mest eftertragtede adresser. Saudi-Arabien købte ejendommen i 1975 fra General Motors og benyttede den som ambassade, indtil repræsentationen senere blev flyttet til Lyngbyvej på Østerbro. Bygningen har i flere år stået tom og fremstod ved udbud i dårlig stand.

Ejendommen blev tidligere udbudt i 2023 med en annonceret pris på 250 mio. kr., mens den offentlige ejendomsværdi i 2020 lå omkring 80 mio. kr., og grundværdien blev angivet til cirka 23,7 mio. kr. Den seneste handel er registreret via det nystiftede selskab LSV 27 ApS, stiftet i oktober 2025, og ejerskabsstrukturen er knyttet til holdingselskabet SEXTUS NEXT ApS.

Nis Nordang fra Home Hellerup er tidligere citeret for at understrege beliggenhedens værdi: "Beliggenheden er helt unik med et stort potentiale for den rigtige køber …" Flere medier har omtalt handlen med bemærkningen: "Handlen placerer sig blandt de dyreste i Danmark nogensinde."

## Udviklingspotentiale og lokalplanbegrænsninger

Salgsoplysninger og mæglermateriale fremhæver, at ejendommen kan renoveres eller rives ned for at udstykke eller udvikle grunden. Lokale bestemmelser i Gentofte Kommune fastsætter dog minimumsgrundstørrelser på cirka 700 m² ved udstykning, hvilket i praksis begrænser mulighederne til typisk 3–4 nye byggegrunde, hvis nedrivning og udstykning gennemføres.`,
    },
    {
      title: "Ny logistics hub åbner ved Øresund – 45.000 m² til e-handel",
      slug: "ny-logistics-hub-aabner-ved-oresund-45000-kvm",
      summary: "Prologis indvier et nyt logistikcenter på 45.000 m² ved Københavns lufthavn. Faciliteten er fuldt udlejet til en førende e-handelsaktør og markerer den største nybyggede logistikejendom i hovedstadsområdet i 2025.",
      metaDescription: "Prologis indvier 45.000 m² logistikcenter ved Københavns lufthavn, fuldt udlejet til e-handelsaktør. Største nybyggeri i hovedstadsområdet 2025.",
      categories: "Logistik, Byggeri",
      status: "published" as const,
      publishedDate: new Date("2025-11-16"),
      content: `# Ny logistics hub åbner ved Øresund – 45.000 m² til e-handel

Prologis, en af verdens største udviklere af logistikejendomme, har indviet et nyt, moderne logistikcenter på 45.000 m² i nærheden af Københavns lufthavn. Ejendommen, der ligger strategisk placeret tæt på motorvejsnettet og lufthavnen, er allerede fuldt udlejet til en førende e-handelsaktør, der ønsker at forblive anonym frem til officiel åbning.

## Strategisk beliggenhed og moderne faciliteter

Det nye center er udstyret med state-of-the-art teknologi, herunder automatiserede sorteringssystemer, LED-belysning og solcellepaneler på taget, der forventes at dække op mod 40% af bygningens energiforbrug. Faciliteten er certificeret efter BREEAM Excellent og opfylder de højeste standarder for bæredygtighed i logistiksektoren.

"Dette projekt understreger den fortsatte efterspørgsel efter moderne logistikfaciliteter i Danmark, især i hovedstadsområdet, hvor nærhed til både lufthavn og motorveje er afgørende," udtaler Morten Nielsen, landechef for Prologis Danmark.

## E-handelens krav former logistikmarkedet

Den fulde udlejning før ibrugtagning afspejler den stærke efterspørgsel fra e-handelsselskaber, der har brug for effektive distributionscentre til at håndtere den voksende onlinehandel. Analyser fra CBRE viser, at e-handelssegmentet nu udgør næsten 30% af den samlede efterspørgsel efter logistikareal i Danmark.`,
    },
    {
      title: "Kontormarkedet i København viser første tegn på genopretning",
      slug: "kontormarkedet-i-kobenhavn-viser-forste-tegn-paa-genopretning",
      summary: "Ledighedsprocenten for kontorejendomme i København er faldet til 7,8% i 3. kvartal 2025 – det laveste niveau siden pandemiens start. Især områder som Nordhavn og Sydhavn oplever stigende efterspørgsel.",
      metaDescription: "Københavns kontormarked viser fremgang med ledighed faldet til 7,8%. Nordhavn og Sydhavn oplever stigende efterspørgsel efter kontorarealer.",
      categories: "Kontor, Investering",
      status: "published" as const,
      publishedDate: new Date("2025-11-15"),
      content: `# Kontormarkedet i København viser første tegn på genopretning

Efter flere års nedgang viser det københavnske kontormarked nu klare tegn på stabilisering. Ledighedsprocenten er faldet til 7,8% i 3. kvartal 2025, hvilket er en nedgang på 1,2 procentpoint sammenlignet med samme periode sidste år, viser nye tal fra Colliers Danmark.

## Nordhavn og Sydhavn trækker markedet

De tidligere havneområder, især Nordhavn og Sydhavn, står for en stor del af den positive udvikling. Områderne tiltrækker både danske og internationale virksomheder, der søger moderne kontorfaciliteter med gode transport- og servicemuligheder. I Nordhavn er ledigheden nu nede på 4,2%, hvilket svarer til et marked i balance.

"Vi ser en markant ændring i virksomhedernes tilgang til kontorarealer. Der er øget fokus på kvalitet, beliggenhed og fleksibilitet frem for kvadratmeter," forklarer Anna Kjerulf, Research Director hos Colliers.

## Prisniveau og investeringsappetit

Kvadratmeterpriserne for nyere kontorejendomme i København er steget med 8% over det seneste år, mens ældre kontorejendomme fortsat oplever prispres. Investorerne viser særlig interesse for DGNB-certificerede bygninger med lave driftsomkostninger og god tilgængelighed via offentlig transport.`,
    },
    {
      title: "Supermarkedskæde ekspanderer – 12 nye butikker i 2026",
      slug: "supermarkedskade-ekspanderer-12-nye-butikker-i-2026",
      summary: "Coop har indgået lejeaftaler for 12 nye butikslokaler fordelt over hele Danmark. Ekspansionen fokuserer på byer mellem 15.000 og 50.000 indbyggere og forventes at skabe over 300 nye arbejdspladser.",
      metaDescription: "Coop ekspanderer med 12 nye butikker i 2026 i danske provinsbyer. Over 300 nye arbejdspladser skabes i byer med 15.000-50.000 indbyggere.",
      categories: "Detailhandel, Investering",
      status: "published" as const,
      publishedDate: new Date("2025-11-14"),
      content: `# Supermarkedskæde ekspanderer – 12 nye butikker i 2026

Coop har netop offentliggjort planerne om at åbne 12 nye SuperBrugsen- og Dagli'Brugsen-butikker fordelt over hele Danmark i løbet af 2026. Ekspansionen er den største i kædens historie siden 2018 og markerer en strategisk satsning på provinsbyer.

## Strategisk fokus på mellemstore byer

De nye butikker vil blive placeret i byer mellem 15.000 og 50.000 indbyggere, hvor Coop identificerer et underforsynet marked. "Vi ser et stort potentiale i de mellemstore byer, hvor lokalbefolkningen efterspørger moderne indkøbsmuligheder med et bredt sortiment," udtaler Kåre Michaelsen, ejendomschef i Coop Danmark.

Lejeaftalerne er typisk 15-20 årige og omfatter lokaler på mellem 1.200 og 2.500 m². Flere af ejendommene er nybyggerier, der er udviklet specifikt til formålet, mens andre er eksisterende butikslokaler, der totalrenoveres.

## Betydning for udlejere og lokalsamfund

For ejendomsudviklere og investorer repræsenterer de lange lejeaftaler med en stærk lejer som Coop en attraktiv mulighed for stabile afkast. Samtidig forventes etableringerne at skabe over 300 nye jobs og bidrage positivt til de lokale handelsområder.`,
    },
    {
      title: "Hotel-boom i Aarhus: Tre nye hoteller på vej",
      slug: "hotel-boom-i-aarhus-tre-nye-hoteller-paa-vej",
      summary: "Aarhus oplever en markant stigning i hotelbyggeriet med tre nye projekter på i alt 520 værelser. Projekterne, der alle forventes indviet inden udgangen af 2026, investeres der samlet over 800 mio. kr. i.",
      metaDescription: "Tre nye hoteller med 520 værelser på vej til Aarhus. Over 800 mio. kr. investeres i hotelbyggeri, med indvielse inden udgangen af 2026.",
      categories: "Hotel, Byggeri, Investering",
      status: "published" as const,
      publishedDate: new Date("2025-11-13"),
      content: `# Hotel-boom i Aarhus: Tre nye hoteller på vej

Aarhus oplever i øjeblikket en sand hotel-renæssance. Tre større hotelprojekter med tilsammen 520 værelser er under udvikling, og de forventes alle at stå klar inden udgangen af 2026. De samlede investeringer beløber sig til over 800 mio. kr., hvilket gør det til den største satsning på hotelkapacitet i byen nogensinde.

## Tre forskellige koncepter

De tre projekter repræsenterer forskellige segmenter af hotelmarkedet. Et 200-værelses businesshotel i havneområdet målretter sig mod erhvervsrejsende og konferencegæster, mens et boutique-hotel med 120 værelser i den latinske kvarter fokuserer på turister og weekendgæster. Det tredje projekt er et budget-koncept med 200 værelser nær Aarhus Letbane.

"Aarhus har udviklet sig til en international by med stigende efterspørgsel fra både erhvervslivet og turister. De nye hoteller vil hjælpe med at imødekomme denne vækst," forklarer Peter Riis, direktør i Visit Aarhus.

## Økonomiske perspektiver

Hotelmarkedet i Aarhus har vist stærk vækst de seneste år med stigende belægningsprocenter og højere gennemsnitspriser pr. værelse. Investorerne bag projekterne forventer et afkast på 6-8% ved fuld drift, hvilket gør segmentet attraktivt for både danske og internationale kapitalfonde.`,
    },
    {
      title: "Bæredygtighed driver renoveringsbølge i industribygninger",
      slug: "baeredygtighed-driver-renoveringsbolge-i-industribygninger",
      summary: "Danske industrivirksomheder investerer massivt i energirenovering af produktionsfaciliteter. I 2025 forventes investeringer på over 2,5 mia. kr. i forbedringer, der kan reducere energiforbruget med op til 40%.",
      metaDescription: "Danske industrivirksomheder investerer 2,5 mia. kr. i energirenovering af produktionsfaciliteter for at reducere energiforbrug med op til 40% i 2025.",
      categories: "Industri, Bæredygtighed",
      status: "published" as const,
      publishedDate: new Date("2025-11-12"),
      content: `# Bæredygtighed driver renoveringsbølge i industribygninger

Stigende energipriser og skærpede krav til CO2-reduktion får danske industrivirksomheder til at investere massivt i forbedring af deres bygninger. Ifølge brancheorganisationen Dansk Industri (DI) forventes investeringerne i energirenovering at nå 2,5 mia. kr. i 2025 – en stigning på 35% i forhold til året før.

## Fokus på energieffektivisering

De mest almindelige tiltag omfatter installation af LED-belysning, forbedret isolering, udskiftning af ventilationssystemer og installation af solcelleanlæg. Flere virksomheder vælger også at investere i varmepumper og genvinding af procesvarme, hvilket kan reducere energiforbruget med 30-40%.

"Vi ser en klar trend, hvor virksomhederne ikke længere ser energieffektivisering som en omkostning, men som en investering med både økonomisk og strategisk værdi," siger Lars Sandahl Sørensen, administrerende direktør i DI.

## Effekt på ejendomsværdier

For ejere af industriejendomme kan de forbedrede bygninger give højere lejeindtægter og bedre muligheder for at tiltrække kvalitetslejere. Ejendomme med høj energimærkning og bæredygtighedscertificeringer viser sig at være lettere at udleje og generelt opnår de 10-15% højere m²-priser.`,
    },
    {
      title: "Pensionsselskab køber storcentre i 4,2 mia. kr. handel",
      slug: "pensionsselskab-kober-storcentre-i-42-mia-kr-handel",
      summary: "PFA Ejendomme har erhvervet en portefølje af fem danske storcentre for 4,2 mia. kr. Handlen er en af de største på det danske detailmarked i årevis og omfatter centre i både København, Aarhus og Odense.",
      metaDescription: "PFA Ejendomme køber fem danske storcentre for 4,2 mia. kr. i en af de største detailhandler. Porteføljen omfatter centre i København, Aarhus og Odense.",
      categories: "Detailhandel, Investering",
      status: "published" as const,
      publishedDate: new Date("2025-11-11"),
      content: `# Pensionsselskab køber storcentre i 4,2 mia. kr. handel

PFA Ejendomme har netop afsluttet købet af en portefølje bestående af fem danske storcentre for i alt 4,2 mia. kr. Transaktionen, der er en af de største på det danske erhvervsejendomsmarked i de seneste år, omfatter centre i København, Aarhus, Odense og to provinsbyer.

## Strategisk porteføljeinvestering

De fem centre har tilsammen et udlejbart areal på cirka 125.000 m² og rummer både dagligvarebutikker, special retail og serviceerhverv. Porteføljen er næsten fuldt udlejet med en gennemsnitlig belægning på 96%.

"Denne investering styrker vores position inden for detailsegmentet og giver os en velspredning geografisk. De købte centre ligger i stærke handelsmæssige positioner og har veletablerede lejermix," udtaler Kasper Ahm Pedersen, direktør for PFA Ejendomme.

## Marked i forandring

Selv om detailhandlen har været under pres fra e-handel, viser velplacerede storcentre med stærk lejermix fortsat god performance. Særligt centre med fokus på oplevelser, fødevarer og serviceerhverv klarer sig godt. Analyser viser, at de bedst performende centre har oplevet vækst i både omsætning og besøgstal gennem 2025.`,
    },
    {
      title: "Data center-investering skaber debat om strømforbrug",
      slug: "data-center-investering-skaber-debat-om-stromforbrug",
      summary: "En international tech-gigant planlægger Danmarks største datacenter ved Esbjerg. Projektet på 150.000 m² og med en investering på 6 mia. kr. skaber debat om infrastruktur og grøn energi.",
      metaDescription: "Danmarks største datacenter planlægges ved Esbjerg med 150.000 m² og 6 mia. kr. investering. Projektet skaber debat om strømforbrug og grøn energi.",
      categories: "Industri, Bæredygtighed, Investering",
      status: "published" as const,
      publishedDate: new Date("2025-11-10"),
      content: `# Data center-investering skaber debat om strømforbrug

En af verdens største tech-virksomheder har offentliggjort planer om at bygge Danmarks hidtil største datacenter i nærheden af Esbjerg. Projektet vil omfatte 150.000 m² serverfaciliteter fordelt på flere bygninger og repræsenterer en samlet investering på cirka 6 mia. kr.

## Infrastruktur og energibehov

Datacentret vil ved fuld drift have et årligt strømforbrug svarende til en dansk by på omkring 50.000 indbyggere. Virksomheden har forpligtet sig til at anvende 100% vedvarende energi og er i dialog med flere vindmølleparker om direkte strømaftaler.

"Vi vælger Danmark på grund af den stabile infrastruktur, den høje andel af vedvarende energi og den kvalificerede arbejdskraft," udtaler en talsperson for tech-virksomheden, der ønsker at forblive anonym indtil alle tilladelser er på plads.

## Lokal modstand og muligheder

Projektet har udløst debat lokalt, hvor bekymringer om strømforbrug og varmebelastning vejer op mod forventningerne om job og økonomisk aktivitet. Virksomheden forventer at skabe 150-200 fastansatte og omkring 800 jobs under byggeriet. Desuden er der planer om at levere spildvarme til fjernvarmenettet i Esbjerg.`,
    },
    {
      title: "Kølelagre oplever rekordefterspørgsel fra fødevarebranchen",
      slug: "kolelagre-oplever-rekordeftersporgsel-fra-fodevarebranchen",
      summary: "Markedet for temperaturkontrollerede lagerfaciliteter vokser med 15% årligt. Fødevareproducenter og distributører efterspørger moderne køle- og fryselagre med avanceret teknologi til kvalitetsstyring.",
      metaDescription: "Temperaturkontrollerede lagerfaciliteter oplever 15% årlig vækst. Fødevarebranchen efterspørger moderne køle- og fryselagre med avanceret teknologi.",
      categories: "Logistik, Lager",
      status: "published" as const,
      publishedDate: new Date("2025-11-09"),
      content: `# Kølelagre oplever rekordefterspørgsel fra fødevarebranchen

Markedet for temperaturkontrollerede lagerfaciliteter oplever markant vækst i Danmark. Ifølge tal fra Danmarks Statistik er efterspørgslen efter køle- og fryselagre steget med 15% årligt de seneste tre år, drevet af både øget e-handel med fødevarer og skærpede krav til fødevaresikkerhed.

## Teknologiske krav stiger

Moderne kølelagre skal nu kunne dokumentere temperaturen løbende med IoT-sensorer og levere realtidsdata til både leverandører og myndighederne. Samtidig kræver kunderne højere energieffektivitet, hvilket driver investeringer i nye kølesystemer, der kan reducere elforbruget med op til 30%.

"Vi ser en professionalisering af hele segmentet. Lejerne stiller ikke længere blot krav om en temperatur på -18 grader, men ønsker avanceret styring, dokumentation og minimal klimapåvirkning," forklarer Mette Nygaard, partner i CBRE Food & Beverage.

## Investormuligheder

For ejendomsinvestorer repræsenterer segmentet en attraktiv niche med lange lejeaftaler, typisk 10-15 år, og stabile lejere fra fødevarebranchen. De seneste handler viser afkastkrav på 6,5-7,5% for moderne kølelagerejendommede, hvilket er 0,5-1 procentpoint over almindelige lagerlejemål.`,
    },
    {
      title: "Fjernvarmenettet udvides med spildvarme fra industrien",
      slug: "fjernvarmenettet-udvides-med-spildvarme-fra-industrien",
      summary: "Fem danske kommuner indgår partnerskaber med lokale industrivirksomheder om levering af spildvarme til fjernvarmenettet. Projekterne forventes at levere varme til over 15.000 husstande og reducere CO2-udledningen med 25.000 tons årligt.",
      metaDescription: "Fem danske kommuner indgår partnerskaber om spildvarme fra industrien til fjernvarmenettet. Projekterne varmer 15.000 husstande og reducerer CO2.",
      categories: "Industri, Bæredygtighed",
      status: "published" as const,
      publishedDate: new Date("2025-11-08"),
      content: `# Fjernvarmenettet udvides med spildvarme fra industrien

Fem danske kommuner har indgået aftaler med lokale industrivirksomheder om at integrere industriel spildvarme i de kommunale fjernvarmenet. Projekterne, der støttes af Energistyrelsen, forventes samlet at levere varme til over 15.000 husstande og reducere CO2-udledningen med cirka 25.000 tons om året.

## Fra spild til ressource

Mange industrielle processer genererer betydelig overskudsvarme, som traditionelt er blevet kølet væk. Med ny teknologi kan denne varme nu opsamles, opgraderes og sendes ud i fjernvarmenettet. Typiske kilder er fødevareproduktion, datacentre og kemisk industri.

"Det er en win-win situation. Virksomhederne får indtægter fra deres spildvarme, mens kommunerne får billigere og grønnere varme," udtaler Henrik Mortensen, direktør i Dansk Fjernvarme.

## Økonomiske og miljømæssige fordele

For industrivirksomhederne kan levering af spildvarme bidrage med årlige indtægter på mellem 2 og 5 mio. kr. afhængigt af produktionsvolumen. Samtidig bidrager projekterne til virksomhedernes bæredygtighedsmål og kan gøre det lettere at opnå certifikater som ISO 14001.`,
    },
    {
      title: "Studenterbyer mangler studieboligbyggerier trods stigende behov",
      slug: "studenterbyer-mangler-studieboligbyggerier-trods-stigende-behov",
      summary: "Antallet af studerende i Danmark er steget med 12% de seneste fem år, men byggeriet af studieboligbyggerier har ikke fulgt med. I København og Aarhus er ventetiden på en studiebolig nu over 12 måneder.",
      metaDescription: "Studerende-antal stiger med 12%, men studieboliger halter bagefter. Ventetid i København og Aarhus over 12 måneder. Krav om flere byggeprojekter.",
      categories: "Bolig, Byggeri",
      status: "published" as const,
      publishedDate: new Date("2025-11-07"),
      content: `# Studenterbyer mangler studieboligbyggerier trods stigende behov

Danmarks største studenterbyer kæmper med akut mangel på studieboligbyggerier. Antallet af studerende er steget med 12% de seneste fem år, mens byggeriet af nye studieboligbyggerier stort set har stået stille. I både København og Aarhus er den gennemsnitlige ventetid på en studiebolig nu over 12 måneder.

## Barrierer for byggeri

Flere faktorer bremser udviklingen af nye studieboligbyggerier. Stigende byggomkostninger, komplekse regler og vanskelighederne ved at opnå økonomisk bæredygtighed uden offentlig støtte gør mange projekter urentable for private investorer.

"Det kræver politisk handling at få løst denne udfordring. Enten skal der mere offentlig støtte til eller mere enkle byggeproces, der kan reducere omkostningerne," siger Marie Kruse, formand for Danske Studerendes Fællesråd.

## Nye initiativer på vej

Flere boligorganisationer og private investorer undersøger nu mulighederne for modulbyggerier og alternative boligformer, der kan realiseres hurtigere og billigere end traditionelle byggeprojekter. I Odense er et pilotprojekt med 250 modulære studieboligbyggerier under planlægning med forventet ibrugtagning i 2027.`,
    },
    {
      title: "Kommuner sælger byggrunde til rekordpriser",
      slug: "kommuner-saelger-byggrunde-til-rekordpriser",
      summary: "Danske kommuner har i 2025 solgt byggrunde for over 3,5 mia. kr. – en stigning på 40% sammenlignet med 2024. Især grunde til erhvervsformål oplever markant prisstigninger.",
      metaDescription: "Kommunale byggrunde solgt for 3,5 mia. kr. i 2025 – 40% stigning. Erhvervsgrunde oplever markante prisstigninger i hele Danmark.",
      categories: "Investering, Byggeri",
      status: "published" as const,
      publishedDate: new Date("2025-11-06"),
      content: `# Kommuner sælger byggrunde til rekordpriser

Danmarks kommuner har i 2025 indtjent rekordhøje beløb på salg af byggrunde. Tal fra KL viser, at kommunerne samlet har solgt grunde for over 3,5 mia. kr., hvilket er en stigning på 40% sammenlignet med året før. Især grunde til erhvervsformål har oplevet markante prisstigninger.

## Erhvervsgrunde i højsæde

Mens boliggrunde har oplevet moderat prisvækst, er priserne på erhvervsgrunde steget med gennemsnitligt 25% på landsplan. I vækstområder omkring de største byer kan stigningerne være endnu større. I eksempelvis Ballerup Kommune er prisen pr. m² erhvervsgrund steget fra 1.200 kr. til 1.800 kr. på blot to år.

"Vi ser en betydelig interesse fra både danske og udenlandske virksomheder, der ønsker at etablere sig eller udvide i Danmark. Det skaber et pres på de tilgængelige erhvervsarealer," forklarer Bo Nilsson, formand for KL's økonomiudvalg.

## Strategisk planlægning afgørende

For kommunerne handler det om at balancere indtjeningen fra grundsalg med behovet for at sikre variation i erhvervslivet og arbejdspladser. Flere kommuner arbejder nu med at reservere visse arealer til specifikke brancher eller virksomhedsstørrelser for at undgå, at kun de mest kapitalkræftige aktører får adgang.`,
    },
    {
      title: "Landbrugets nedlagte bygninger får nyt liv som erhvervslejemål",
      slug: "landbrugets-nedlagte-bygninger-faar-nyt-liv-som-erhvervslejemaal",
      summary: "Gamle landbrugsbygninger konverteres i stigende grad til små erhvervslejemål for håndværkere, kunstnere og mindre produktionsvirksomheder. Konverteringerne skaber værdi for både ejere og lokalsamfund.",
      metaDescription: "Gamle landbrugsbygninger konverteres til erhvervslejemål for håndværkere og mindre virksomheder. Skaber værdi for ejere og lokalsamfund.",
      categories: "Investering, Byggeri",
      status: "published" as const,
      publishedDate: new Date("2025-11-05"),
      content: `# Landbrugets nedlagte bygninger får nyt liv som erhvervslejemål

Nedlagte landbrugsbygninger oplever en renæssance som erhvervslejemål. Mange landmænd, der har moderniseret eller ændret drift, sidder tilbage med ældre driftsbygninger, som nu kan omdannes til attraktive faciliteter for små virksomheder, håndværkere og kunstnere.

## Bred efterspørgsel fra mindre virksomheder

Især håndværkere og mindre produktionsvirksomheder efterspørger billige lokaler med lav leje og få restriktioner. Landbrugsbygninger i landdistrikter kan tilbyde netop dette sammen med gode parkeringsforhold og lav nabogenest.

"Vi har konverteret tre ældre stalde til værkstedslokaler og kontorer. Alle er fuldt udlejede, og der er venteliste," fortæller Lars Johansen, landmand og udlejer i Midtjylland.

## Lovgivning og muligheder

Planloven blev lempet i 2023, så det er blevet lettere at konvertere landbrugsbygninger til erhverv uden detaljeret lokalplan, hvilket har accelereret udviklingen. Dog skal ejerne stadig overholde krav om brandsikring, miljøgodkendelser og adgangsforhold, hvilket kan kræve investeringer på mellem 500.000 og 2 mio. kr. afhængigt af bygningens stand.`,
    },
    {
      title: "Investeringsselskab satser stort på seniorboliger",
      slug: "investeringsselskab-satser-stort-paa-seniorboliger",
      summary: "Et dansk investeringsselskab annoncerer planer om at bygge 1.000 nye seniorboliger i fire danske byer inden 2028. Projekterne retter sig mod den voksende gruppe af aktive +65-årige med fokus på fællesskab og service.",
      metaDescription: "Dansk investeringsselskab bygger 1.000 seniorboliger i fire byer inden 2028. Fokus på aktive +65-årige med fællesskab og service.",
      categories: "Bolig, Investering, Byggeri",
      status: "published" as const,
      publishedDate: new Date("2025-11-04"),
      content: `# Investeringsselskab satser stort på seniorboliger

Senior Living Group, et dansk investeringsselskab med fokus på ældreboliger, har offentliggjort ambitiøse planer om at opføre 1.000 nye seniorboliger fordelt på fire danske byer inden udgangen af 2028. De samlede investeringer anslås til cirka 2,8 mia. kr.

## Et voksende marked

Med en aldrende befolkning og en generation af velhavende pensionister, der ønsker at bevare selvstændighed længst muligt, vokser markedet for seniorboliger markant. I modsætning til traditionelle plejecentre retter de nye projekter sig mod aktive +65-årige, der søger mindre boliger med fællesfaciliteter, service og sociale aktiviteter.

"Der er et enormt uudnyttet potentiale i dette segment. Mange ældre ønsker at sælge det store hus, men vil ikke bo i en almindelig lejlighed uden fællesskab og service," udtaler Christian Bjørn, CEO i Senior Living Group.

## Koncept og økonomi

Boligerne vil være til leje med månedlige udgifter omkring 12.000-18.000 kr. inklusiv service som rengøring, fællesspisning og aktiviteter. Projekterne er designet med fælleshuse, grønne områder og god tilgængelighed til offentlig transport og lokale faciliteter. Investeringsselskabet forventer et langsigtet afkast på 5-6% baseret på stabile lejeindtægter.`,
    },
    {
      title: "Udlejning af tagflader til solceller giver nye indtægter",
      slug: "udlejning-af-tagflader-til-solceller-giver-nye-indtaegter",
      summary: "Ejere af større erhvervsejendomme kan nu leje tagarealer ud til solcelleoperatører og opnå passive indtægter på 50-150 kr. pr. m² årligt. Ordningen bliver populær især inden for logistik og industri.",
      metaDescription: "Ejere af erhvervsejendomme kan leje tagarealer ud til solcelleoperatører og opnå 50-150 kr. pr. m² årligt. Populært inden for logistik og industri.",
      categories: "Bæredygtighed, Logistik, Industri",
      status: "published" as const,
      publishedDate: new Date("2025-11-03"),
      content: `# Udlejning af tagflader til solceller giver nye indtægter

Ejere af større erhvervsejendomme opdager en ny indtægtskilde: udlejning af tagflader til solcelleoperatører. Ordningen, hvor operatøren installerer, driver og vedligeholder solcellerne mod at betale leje for tagarealet, vinder frem især inden for logistik- og industribygninger.

## En simpel forretningsmodel

Typiske lejekontrakter løber over 15-25 år og giver ejeren en årlig lejeindtægt på mellem 50 og 150 kr. pr. m² afhængigt af tagets stand, orientering og energiproduktonspotentiale. Operatøren står for alle investeringer og tager risikoen ved elproduktionen og -salget.

"Det er en helt risikofri indtægt for ejeren. Vi står for installation, vedligehold og forsikring, og bygningsejeren skal ikke investere en krone," forklarer Nina Svendsen, CEO i SolarLease Denmark.

## Praktiske overvejelser

Ikke alle tage er egnede. Tagfladen skal være i god stand, have korrekt orientering (ideelt syd eller vest) og kunne bære den ekstra vægt fra solcellepanelerne. Desuden skal ejendommen have en tilstrækkelig kapacitet i el-nettet til at håndtere produktionen, hvilket i nogle tilfælde kræver opgradering.`,
    },
    {
      title: "Detailhandlen vender tilbage til indre by efter års tilbagegang",
      slug: "detailhandlen-vender-tilbage-til-indre-by-efter-aars-tilbagegang",
      summary: "Flere mindre byer rapporterer om øget aktivitet i de indre byområder efter flere års tilbagegang. Initiatierne centrerer sig om events, pop-up stores og et fornyet fokus på oplevelser frem for traditionel varehandel.",
      metaDescription: "Detailhandlen i indre by oplever fremgang efter års tilbagegang. Pop-up stores, events og oplevelser skaber fornyet aktivitet i mindre byer.",
      categories: "Detailhandel",
      status: "published" as const,
      publishedDate: new Date("2025-11-02"),
      content: `# Detailhandlen vender tilbage til indre by efter års tilbagegang

Efter mange års nedgang for detailhandlen i de mindre byers indre byområder ses nu tegn på en vending. En kombination af innovative handelskoncepter, kommunale initiativer og en ny generation af ildsjæle blandt de lokale erhvervsdrivende skaber fornyet liv i gågader og torve.

## Fra varer til oplevelser

En central strategi er skiftet fra traditionel varehandel til oplevelsesøkonomi. Butikkerne suppleres med cafeer, værksteder og pop-up events, der tiltrækker besøgende og skaber et mere varieret og spændende bybillede.

"Vi har indset, at vi ikke kan konkurrere med e-handel på pris og sortiment. Derfor fokuserer vi på at skabe oplevelser, som folk ikke kan få online," fortæller Susanne Nielsen, formand for handelsforeningen i Slagelse.

## Kommunal opbakning afgørende

Flere kommuner støtter op med økonomiske incitamenter, lavere leje i kommunale lokaler og hjælp til markedsføring. Nogle steder er lejen for nye butikker i midlertidigt tomme lokaler sat helt ned til symbolske beløb de første 6-12 måneder for at tiltrække iværksættere.`,
    },
    {
      title: "Nye krav til brandssikkerhed udfordrer ejendomsejere",
      slug: "nye-krav-til-brandssikkerhed-udfordrer-ejendomsejere",
      summary: "Skærpede brandkrav træder i kraft fra 2026 og vil påvirke tusindvis af ældre erhvervsbygninger. Ejere skal investere i oprustning af brandalarmer, flugtveje og sprinkleranlæg med estimerede omkostninger på 200-800 kr. pr. m².",
      metaDescription: "Nye brandkrav fra 2026 kræver oprustning af ældre erhvervsbygninger. Omkostninger på 200-800 kr. pr. m² til alarmer, flugtveje og sprinkler.",
      categories: "Kontor, Industri",
      status: "published" as const,
      publishedDate: new Date("2025-11-01"),
      content: `# Nye krav til brandssikkerhed udfordrer ejendomsejere

Fra 1. januar 2026 træder nye og skærpede krav til brandsikkerhed i kraft, som vil få betydelige konsekvenser for ejere af ældre erhvervsbygninger. Reglerne omfatter primært bygninger opført før 1995 og vil kræve investeringer i opdatering af brandalarmer, flugtveje og i mange tilfælde installation af sprinkleranlæg.

## Omfattende krav

De nye regler stiller blandt andet krav om trådløse brandalarmsystemer med direkte forbindelse til alarmcentral, clearly markerede og oplyste flugtveje samt sprinkleranlæg i bygninger over 600 m² med mere end 50 personer til stede samtidigt. For mange ejendomsejere betyder det betydelige investeringer.

"Vi estimerer omkostningerne til mellem 200 og 800 kr. pr. m² afhængigt af bygningens stand og om der skal installeres sprinkler," forklarer Michael Christensen, direktør i Dansk Brand- og Sikringsteknisk Institut.

## Tidsplan og overgangskrav

Bygninger skal være i overensstemmelse med reglerne inden 1. januar 2027, hvilket giver ejerne et år til at planlægge og gennemføre nødvendige forbedringer. Kommunerne vil gennemføre stikprøvekontroller, og manglende overholdelse kan føre til påbud eller i yderste konsekvens forbud mod anvendelse af bygningen.`,
    },
    {
      title: "Co-working spaces ekspanderer i provinsbyerne",
      slug: "co-working-spaces-ekspanderer-i-provinsbyerne",
      summary: "Konceptet med co-working spaces spreder sig fra de store byer til provinsen. Nye fælles kontorfaciliteter åbner i Horsens, Holstebro og Næstved med fokus på fleksibilitet og fællesskab for freelancere og mindre virksomheder.",
      metaDescription: "Co-working spaces ekspanderer til provinsbyer som Horsens, Holstebro og Næstved. Fleksible kontorfaciliteter for freelancere og små virksomheder.",
      categories: "Kontor",
      status: "published" as const,
      publishedDate: new Date("2025-10-31"),
      content: `# Co-working spaces ekspanderer i provinsbyerne

Konceptet med co-working spaces, der længe har været populært i København og Aarhus, spreder sig nu til mindre provinsbyer. I løbet af 2025 er nye faciliteter åbnet i Horsens, Holstebro og Næstved, og flere byer står i kø.

## Fleksibilitet og fællesskab

De nye co-working spaces tilbyder fleksible arbejdspladser til freelancere, iværksættere og mindre virksomheder, der ikke ønsker eller har råd til egne kontorfaciliteter. Medlemmerne betaler typisk mellem 2.000 og 5.000 kr. om måneden afhængigt af om de ønsker en fast plads eller blot adgang til fællesarealerne.

"Vi ser en stor efterspørgsel fra folk, der arbejder hjemmefra men savner det sociale element og professionelle rammer. Co-working giver dem begge dele," siger Louise Friis, der driver det nye co-working space i Horsens.

## Økonomien i konceptet

For ejendomsejere kan co-working være en attraktiv måde at udleje tidligere vanskelige eller tomme kontorarealer. Ved at tilbyde fuldt møblerede og servicerede pladser kan de opnå en højere m²-pris end ved traditionel udlejning, samtidig med at de får mere fleksibilitet og flere lejere fordelt over samme areal.`,
    },
    {
      title: "Containerboliger testes som løsning på boligmangel",
      slug: "containerboliger-testes-som-losning-paa-boligmangel",
      summary: "Aalborg Kommune igangsætter et pilotprojekt med 40 containerboliger som midlertidig løsning på den akutte boligmangel. Boligerne kan opføres på tre måneder og koster halvdelen af traditionelt byggeri.",
      metaDescription: "Aalborg tester 40 containerboliger som hurtig løsning på boligmangel. Opføres på tre måneder til halvdelen af prisen for traditionelt byggeri.",
      categories: "Bolig, Byggeri",
      status: "published" as const,
      publishedDate: new Date("2025-10-30"),
      content: `# Containerboliger testes som løsning på boligmangel

Aalborg Kommune har godkendt et pilotprojekt med 40 containerboliger på en midlertidig grund i den nordlige bydel. Projektet skal afprøve, om container- og modulbyggeri kan være en hurtig og økonomisk løsning på den akutte boligmangel, som mange danske byer oplever.

## Hurtig realisering

En af de store fordele ved containerboliger er den korte byggetid. Mens traditionelle boliger typisk tager 12-18 måneder fra påbegyndelse til indflytning, kan containermoduler produceres parallelt og samles på grunden på blot 3-4 måneder.

"Vi har akut brug for boliger nu, ikke om to år. Containerkonceptet giver os mulighed for at reagere meget hurtigere på behovet," udtaler Erik Lauritzen, rådmand i Aalborg Kommune.

## Økonomi og kvalitet

Omkostningerne per bolig anslås til cirka 1,2 mio. kr. for en 50 m² bolig, hvilket er omkring halvdelen af prisen for sammenlignelige traditionelle lejligheder. Kritikere peger dog på, at containerboliger ofte har kortere levetid og kan opleves som mindre attraktive, hvilket kan give udfordringer ved udlejning.`,
    },
    {
      title: "Parkeringshuse omdannes til blandede byudviklinger",
      slug: "parkeringshuse-omdannes-til-blandede-byudviklinger",
      summary: "I takt med færre biler i byerne overvejer flere parkeringshusejere at konvertere deres bygninger til boliger, kontorer eller blandede funktioner. I Odense er det første konverteringsprojekt nu under planlægning.",
      metaDescription: "Parkeringshuse konverteres til boliger og kontorer i takt med færre biler i byerne. Odense planlægger første konverteringsprojekt.",
      categories: "Bolig, Kontor, Byggeri",
      status: "published" as const,
      publishedDate: new Date("2025-10-29"),
      content: `# Parkeringshuse omdannes til blandede byudviklinger

Med stigende brug af offentlig transport, delebiler og cykling falder behovet for parkeringspladser i de centrale byområder. Dette får ejere af parkeringshuse til at overveje alternative anvendelser. I Odense er det første større konverteringsprojekt nu under planlægning, hvor et parkeringshus skal omdannes til en kombination af boliger, kontorer og detailhandel.

## Udfordrende, men muligt

At konvertere et parkeringshus til boliger eller kontor er teknisk komplekst. Parkeringshuse har typisk store etagehøjder, begrænset daglys og ingen infrastruktur til vand og varme. Men med de rette investeringer og kreative arkitektløsninger kan bygningerne genbruges.

"Det handler om at se mulighederne frem for begrænsningerne. Parkeringshusenes centrale placering og solide konstruktion gør dem faktisk ret velegnede til omdannelse," forklarer arkitekt Louise Henriksen fra firmaet bag Odense-projektet.

## Økonomien kan være udfordrende

Konverteringerne er bekostelige, ofte mellem 20.000 og 35.000 kr. pr. m², men kan alligevel være attraktive på grund af de centrale placeringer og relativt lave anskaffelsespriser for eksisterende parkeringshuse. Desuden er der politisk goodwill og i nogle tilfælde økonomiske incitamenter til projekter, der gør byerne mere levende.`,
    },
  ];

  // Insert articles in batches
  console.log(`Inserting ${articles.length} articles...`);

  for (const articleData of articles) {
    await db.insert(article).values(articleData);
  }

  console.log(`✓ Successfully seeded ${articles.length} articles`);
}
