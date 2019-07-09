import React, {Component} from 'react';
import ModelView from "./components/ModelView";
import lb from './model/lerarenbeurs'
class App extends Component {
    render() {
        return <ModelView model={lb}></ModelView>
    }

}

export default App