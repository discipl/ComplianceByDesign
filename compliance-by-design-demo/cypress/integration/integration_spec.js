const performAct = (name) => {
    cy.contains(name).click()
}

const answerQuestion = (question, answer) => {
    // cy.wait(500)
    console.log("Clicking" ,answer)
    cy.get('.modal-main').last().contains(question).last().parent().contains(answer).click()

}

const answerQuestionWithValue = (question, value) => {
    console.log("Answering fact with value", value)
    if (typeof value === 'boolean') {
        answerQuestion(question, value ? 'Yes' : 'No')
    }
    else {
        cy.contains(question).last().parent().get('input').last().type(value)
        answerQuestion(question, 'Yes')
    }

}

const switchToActor = (actor) => {
    cy.get('.actorSelector').select(actor);
}

const performNonOrderedScenario = (acts, facts) => {
    for (let act of acts) {
        switchToActor(act.actor);
        performAct(act.act)
        for (let i = 0; i < act.numQuestions; i++) {
            console.log("Answering question number", i)
            const modal = cy.get('section.modal-main')
            cy.get('section.modal-main').last().find('span').first().invoke('text').then((question) => {
                for (let fact of Object.keys(facts)) {
                    if (question.includes(fact)) {
                        console.log("Answering fact", fact)
                        if (Array.isArray(facts[fact])) {
                            const value = facts[fact].shift()
                            if (value) {
                                answerQuestionWithValue(question, value)
                            }
                            else {
                                answerQuestionWithValue(question, false)
                            }

                        }
                        else {
                            answerQuestionWithValue(question, facts[fact])
                        }
                    }
                }
            })


        }
    }



}


describe('The demo', function() {
    // it('Should be able walk through a scenario', function() {
    //     cy.visit('')
    //
    //     performAct('<<aanvraagformulieren verstrekken voor subsidie studiekosten op de website van de DUO>>')
    //
    //     answerQuestion('[template voor aanvraagformulieren studiekosten]', 'Yes')
    //
    //     performAct('<<leraar vraagt subsidie voor studiekosten aan>>')
    //
    //     answerQuestion('[ingevuld aanvraagformulier studiekosten op de website van de Dienst Uitvoering Onderwijs]', 'Yes')
    //
    //     answerQuestion('[indienen 1 april tot en met 30 juni, voorafgaand aan het studiejaar waarvoor subsidie wordt aangevraagd]', 'Yes')
    //
    //     performAct('<<minister verstrekt subsidie lerarenbeurs aan leraar>>')
    //
    //     answerQuestion('[subsidie lerarenbeurs]', 'Yes')
    //
    //     answerQuestion('[subsidie voor bacheloropleiding leraar]', 'Yes')
    //
    //     answerQuestion('[leraar die bij aanvang van het studiejaar waarvoor de subsidie bestemd de graad Bachelor mag voeren]', 'Yes')
    //     answerQuestion('[leraar die op het moment van de subsidieaanvraag in dienst is bij een werkgever]', 'Yes')
    //     answerQuestion('[leraar werkt bij een of meer bekostigde onderwijsinstellingen]', 'Yes')
    //     answerQuestion('[leraar die voor minimaal twintig procent van zijn werktijd is belast met lesgebonden taken]', 'Yes')
    //     answerQuestion('[leraar die pedagogisch-didactisch verantwoordelijk is voor het onderwijs]', 'Yes')
    //
    //     answerQuestion('[leraar is aangesteld als ambulant begeleider]', 'No')
    //     answerQuestion('[leraar is aangesteld als zorgcoördinator]', 'No')
    //     answerQuestion('[leraar is aangesteld als intern begeleider]', 'No')
    //     answerQuestion('[leraar is aangesteld als remedial teacher]', 'No')
    //
    //     answerQuestion('[leraar die ingeschreven staat in registerleraar.nl]', 'Yes')
    //
    //     answerQuestion('[subsidie wordt verstrekt voor één studiejaar en voor één opleiding]', 'Yes')
    //     answerQuestion('[leraar ontvangt van de minister een tegemoetkoming in de studiekosten voor het volgen van de opleiding]', 'No')
    //     answerQuestion('[minister verdeelt het beschikbare bedrag per doelgroep over de aanvragen]', 'Yes')
    //     answerQuestion('[budget volledig benut]', 'No')
    // })

    it('Should be able walk through a scenario with ANLb', () => {
        cy.viewport(1900, 1000)
        cy.visit('/#/anlb')

        performNonOrderedScenario([
            {
                act: '<<indienen betalingsaanvraag>>',
                actor: 'collectief',
                numQuestions: 16
            },
            {
                act: '<<verantwoorden beheeractiviteiten en wijzigingen>>',
                actor: 'collectief',
                numQuestions: 12
            },
            {
                act: '<<beoordelen betalingsaanvraag>>',
                actor: 'RVO',
                numQuestions: 46
            }

        ],
            {
                '[identiteit van de begunstigde]': 'Coöperatie Natuurrijk Limburg U.A.',
                '[De naam van de regeling]': 'ANLb',
                '[De totale omvang in hectares in 2 decimalen per leefgebied/deelgebied waarvoor betaling wordt gevraagd]': 132.54,
                '[De ligging (geometrie)]': ['SCANGIS:1234', false, 'SCANGIS:1234', false, 'SCANGIS:1234', false, 'SCANGIS:1234', false],
                '[Het leefgebied waartoe het perceel behoort.]': 'open grasland',
                '[Indien van toepassing het deelgebied waartoe het perceel behoort.]': 'weidevogels',
                '[Omvang van de beheerde oppervlakte (in hectares in 2 decimalen voor landbouwgrond, die exact past bij de geometrie (uit eerste punt).]': [10, 10, 45, 45, 45, false],
                '[Aard van het grondgebruik (grasland, bouwland, landschapselement of water).]': 'grasland',
                '[De identificatie van niet-landbouwgrond die voor steun in aanmerking komt (subsidiabele landschapselementen (met uitzondering van hoogstamboomgaard, natuurvriendelijke oever en solitaire boom) en water).]': true,
                '[Verklaring van het agrarisch collectief dat de individuele deelnemers weten wat de verplichtingen en consequenties zijn]': true,
                '[De unieke identificatie van iedere deelnemer van het agrarisch collectief]': true,
                '[Aanvraagnummer gebiedsaanvraag (provincie) als bewijsstuk om te bepalen of de begunstigde voor betaling in aanmerking komt.]': true,
                '[De bewijsstukken die nodig zijn om te bepalen of de aanspraak op de steun/bijstand kan worden gemaakt. Hier moet worden gedacht aan stukken die de inhoud van de betalingsaanvraag onderbouwen]': true,
                '[betaalverzoek is tussen 1 maart en 15 mei ingediend]': true,
                '[goedgekeurde gebiedsaanvraag]': true,
                '[Het deelgebied waartoe het perceel behoort (indien van toepassing).]': 'weidevogels',
                '[De beheerfunctie waartoe het perceel behoort]': 'Optimaliseren foerageer-, en broed en opgroeimogelijkheden Creëren nat biotoop',
                '[Opgave van de uitgevoerde beheeractiviteit (Nederlandse versie van de koppeltabel) of combinatie van beheeractiviteiten.]': true,
                '[kenmerk van de bijbehorende beschikking tot subsidieverlening van de gebiedsaanvraag]': true,
                '[De wijzigingen (ten opzichte van jaarlijks beheer) die doorgevoerd zijn op de beheeractiviteiten met reden van wijzigen en per welke datum (indien van toepassing).]': true,
                '[Digitale handtekening van de verantwoording]': true,
                '[verantwoording]': true,
                '[agrarisch collectief heeft subsidie ANLb ontvangen in betreffende provincie]': true,
                '[agrarisch collectief heeft een certificaat collectief agrarisch natuurbeheer verkregen van de Stichting certificering SNL voor de gehele subsidieperiode]': true,
                '[Er is een beheerplan]': true,
                '[Wijzigingen zijn ingediend voor 1 oktober van het betreffende jaar]': true,
                '[Meldingen zijn gedaan uiterlijk op 20 september van het lopende jaar]': true,
                '[Gecontroleerd is dat het minimale percentage dat genoemd is, is gehaald in de betreffende beheeractiviteit qua oppervlakte]': true,
                '[Vastgesteld is dat de reden van de wijziging van de beheeractiviteit geoorloofd is]': true,
                '[Vastgesteld is dat de wijziging of melding is toegestaan]': true,
                '[staan de opgegeven leefgebieden/deelgebieden ook in de beschikking tot subsidieverlening genoemd]': true,
                '[staan de opgegeven beheerfuncties in het betreffende leefgebied/deelgebied ook vermeld in de beschikking tot subsidieverlening]': true,
                '[ligt het perceel binnen het leefgebied/deelgebied zoals dit bepaald is op de kaart bij de beschikking van de gebiedsaanvraag]': true,
                '[indien er nadere voorwaarden in de beschikking tot subsidieverlening van de gebiedsaanvraag zijn opgenomen: wordt daar aan voldaan]': true,
                '[controle of de totale (netto) oppervlakte van de percelen per leefgebied (of deelgebied) binnen het minimum en maximum aantal hectares blijft, zoals vermeld in de beschikking tot subsidieverlening van de gebiedsaanvraag]': true,
                '[controle of het maximale subsidiebedrag per jaar per leefgebied of (indien van toepassing) deelgebied niet wordt overschreden]': true,
                '[de subsidieverlening is door de provincie verstrekt]': true,
                '[1,15]': 1.15
            })
    })
})