import React, {Component} from 'react';
import ModelView from "./components/ModelView";
import { HashRouter, Route } from "react-router-dom";
import lb from './model/lerarenbeurs'
import UploadModel from "./components/UploadModel";
class App extends Component {
    render() {
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