const performAct = (name) => {
    cy.contains(name)
        .parent().parent().children('button').click()
}

const answerQuestion = (question, answer) => {
    cy.contains(question).parent().contains(answer).click()

}


describe('The demo', function() {
    it('Should be able walk through a scenario', function() {
        cy.visit('')

        performAct('<<aanvraagformulieren verstrekken voor subsidie studiekosten op de website van de DUO>>')

        answerQuestion('[template voor aanvraagformulieren studiekosten]', 'Yes')

        performAct('<<leraar vraagt subsidie voor studiekosten aan>>')

        answerQuestion('[ingevuld aanvraagformulier studiekosten op de website van de Dienst Uitvoering Onderwijs]', 'Yes')

        answerQuestion('[indienen 1 april tot en met 30 juni, voorafgaand aan het studiejaar waarvoor subsidie wordt aangevraagd]', 'Yes')

        performAct('<<minister verstrekt subsidie lerarenbeurs aan leraar>>')

        answerQuestion('[subsidie lerarenbeurs]', 'Yes')

        answerQuestion('[subsidie voor bacheloropleiding leraar]', 'Yes')

        answerQuestion('[leraar voldoet aan bevoegdheidseisen]', 'Yes')

        answerQuestion('[leraar die bij aanvang van het studiejaar waarvoor de subsidie bestemd de graad Bachelor mag voeren]', 'Yes')
        answerQuestion('[leraar die op het moment van de subsidieaanvraag in dienst is bij een werkgever]', 'Yes')
        answerQuestion('[leraar werkt bij een of meer bekostigde onderwijsinstellingen]', 'Yes')
        answerQuestion('[leraar die voor minimaal twintig procent van zijn werktijd is belast met lesgebonden taken]', 'Yes')
        answerQuestion('[leraar die pedagogisch-didactisch verantwoordelijk is voor het onderwijs]', 'Yes')

        answerQuestion('[leraar is aangesteld als ambulant begeleider]', 'No')
        answerQuestion('[leraar is aangesteld als zorgcoördinator]', 'No')
        answerQuestion('[leraar is aangesteld als intern begeleider]', 'No')
        answerQuestion('[leraar is aangesteld als remedial teacher]', 'No')

        answerQuestion('[leraar die ingeschreven staat in registerleraar.nl]', 'Yes')

        answerQuestion('[subsidie wordt verstrekt voor één studiejaar en voor één opleiding]', 'Yes')
        answerQuestion('[leraar ontvangt van de minister een tegemoetkoming in de studiekosten voor het volgen van de opleiding]', 'No')
        answerQuestion('[minister verdeelt het beschikbare bedrag per doelgroep over de aanvragen]', 'Yes')
        answerQuestion('[budget volledig benut]', 'No')
    })
})