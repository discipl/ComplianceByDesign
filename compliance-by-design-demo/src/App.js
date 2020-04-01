import React, {Component} from 'react';
import ModelView from "./components/ModelView";
import {HashRouter, Route} from "react-router-dom";
import model from './model/tegemoetkoming-schade-covid19.flint'

import * as log from 'loglevel'

class App extends Component {
    render() {
        log.getLogger('disciplLawReg').setLevel('warn')


        const config = {
            'actors': ['RVO', 'onderneming'],
            'activeActors': ['onderneming'],
            'factFunctionSpec': {
                '[RVO]': 'RVO',
                '[onderneming]': 'onderneming'
            }
        }

        console.log("Using config", config)
        return (
            <HashRouter>
            <div>
                <Route
                    path="/"
                    exact
                    render={(props) => <ModelView {...props} model={model} config={config}/>}
                />
            </div>
        </HashRouter>
    );
    }

}

export default App