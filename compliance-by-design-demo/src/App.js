import React, {Component} from 'react';
import ModelView from "./components/ModelView";
import { HashRouter, Route } from "react-router-dom";
import lb from './model/lerarenbeurs'
import * as log from 'loglevel'
import UploadModel from "./components/UploadModel";
class App extends Component {
    render() {
        log.getLogger('disciplLawReg').setLevel('debug')
        return (
            <HashRouter>
            <div>
                <Route
                    path="/"
                    exact
                    render={(props) => <ModelView {...props} model={lb}/>}
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