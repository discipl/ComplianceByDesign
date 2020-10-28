import React, {Component} from 'react';
import ModelView from "./components/ModelView";
import {HashRouter, Route} from "react-router-dom";
import lb from './model/lerarenbeurs.flint'
import anlb from './model/ANLb.flint'
import vw from './model/Vreemdelingenwet.flint'
import * as log from 'loglevel'
import UploadModel from "./components/UploadModel";

class App extends Component {
    render() {
        log.getLogger('disciplLawReg').setLevel('warn')
        const lbWithOverride = window.model || lb;
        const anlbWithOverride = window.model || anlb;
        const vwWithOverride = window.model || vw;

        const anlbConfig = {
            'actors': ['RVO', 'collectief'],
            'activeActors': ['collectief'],
            'factFunctionSpec': {
                '[RVO]': 'RVO',
                '[agrarisch collectief]': 'collectief'
            }
        }

        const vreemdelingenwetConfig = {
            'actors': ['IND', 'vreemdeling', 'referent', 'erkend referent', 'Staatssecretaris van Justitie en Veiligheid'],
            'activeActors': ['IND'],
            'factFunctionSpec': {
                '[Onze Minister van Justitie en Veiligheid]': 'IND',
                '[bestuursorgaan]': 'IND',
                '[vreemdeling]': 'vreemdeling',
                '[belanghebbende]': 'vreemdeling'
            }
        }

        const lerarenbeursConfig = {
            'actors': ['Leraar 1', 'Leraar 2', 'Minister van OCW', 'bevoegdGezag'],
            'activeActors': ['Leraar 1', 'Minister van OCW'],
            'factFunctionSpec': {
                '[persoon wiens belang rechtstreeks bij een besluit is betrokken]': ['Leraar 1', 'Leraar 2'],
                '[degene die voldoet aan bevoegdheidseisen gesteld in]': ['Leraar 1', 'Leraar 2'],
                '[artikel 3 van de Wet op het primair onderwijs]': ['Leraar 1', 'Leraar 2'],
                '[artikel 3 van de Wet op de expertisecentra]': ['Leraar 1', 'Leraar 2'],
                '[artikel XI van de Wet op de beroepen in het onderwijs]': ['Leraar 1', 'Leraar 2'],
                '[artikel 3 van de Wet primair onderwijs BES]': ['Leraar 1', 'Leraar 2'],
                '[is benoemd of tewerkgesteld zonder benoeming als bedoeld in artikel 33 van de Wet op het voortgezet onderwijs]': ['Leraar 1', 'Leraar 2'],
                '[artikel 4.2.1. van de Wet educatie en beroepsonderwijs]': ['Leraar 1', 'Leraar 2'],
                '[artikel 80 van de Wet voortgezet onderwijs BES]': ['Leraar 1', 'Leraar 2'],
                '[artikel 4.2.1 van de Wet educatie beroepsonderwijs BES]': ['Leraar 1', 'Leraar 2'],
                '[die lesgeeft in het hoger onderwijs]': ['Leraar 1', 'Leraar 2'],
                '[orgaan]': 'Minister van OCW',
                '[rechtspersoon die krachtens publiekrecht is ingesteld]': 'Minister van OCW',
                '[met enig openbaar gezag bekleed]': 'Minister van OCW',
                '[artikel 1 van de Wet op het primair onderwijs]': 'bevoegdGezag',
                '[artikel 1 van de Wet op de expertisecentra]': 'bevoegdGezag',
                '[artikel 1 van de Wet op het voortgezet onderwijs]': 'bevoegdGezag',
                '[artikel 1.1.1., onderdeel w, van de Wet educatie en beroepsonderwijs]': 'bevoegdGezag',
                '[artikel 1 van de Wet primair onderwijs BES]': 'bevoegdGezag',
                '[artikel 1 van de Wet voortgezet onderwijs BES]': 'bevoegdGezag',
                '[artikel 1.1.1, van de Wet educatie en beroepsonderwijs BES]': 'bevoegdGezag',
                '[instellingsbestuur bedoeld in artikel 1.1, onderdeel j, van de Wet op het hoger onderwijs en wetenschappelijk onderzoek]': 'bevoegdGezag',
                '[minister van Onderwijs, Cultuur en Wetenschap]': 'Minister van OCW',
                '[persoon]': 'ANYONE'
            }
        }

        const lerarenbeursConfigWithOverride = window.flintConfig || lerarenbeursConfig;

        const vreemdelingenwetConfigWithOverride = window.flintConfig || vreemdelingenwetConfig;
        console.log("Using config", lerarenbeursConfigWithOverride)
        return (
            <HashRouter>
            <div>
                <Route
                    path="/"
                    exact
                    render={(props) => <ModelView {...props} model={lbWithOverride} config={lerarenbeursConfigWithOverride}/>}
                />
                <Route
                    path="/anlb"
                    exact
                    render={(props) => <ModelView {...props} model={anlbWithOverride} config={anlbConfig}/>}
                />
                <Route
                    path="/vw"
                    exact
                    render={(props) => <ModelView {...props} model={vwWithOverride} config={vreemdelingenwetConfigWithOverride}/>}
                />
                <Route
                    path="/upload"
                    component={UploadModel}
                />
            </div>
        </HashRouter>
    );
    }

}

export default App
