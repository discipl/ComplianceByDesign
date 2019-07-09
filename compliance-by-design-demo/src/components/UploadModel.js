import React, {Component} from 'react'
import * as Papa from 'papaparse'
import ModelView from "./ModelView";


class UploadModel extends Component {
    constructor(props){
        super(props)
        this.state = {}
    }
    async processModel(event) {
        console.log(Array.from(event.target.files))

        let parsedArrays = await Promise.all(Array.from(event.target.files).map((inputFile) =>
            new Promise((resolve, reject) => {
                Papa.parse(inputFile,
                    {'complete': (result) => resolve(result.data)})
            })
        ))

        const resultObjectArrays = parsedArrays.map((parsedArray) => this.doubleArrayToObjectArray(parsedArray))

        console.log(resultObjectArrays)

        const acts = resultObjectArrays.filter((array) => Object.keys(array[0]).includes('act'))[0].filter(act => act['act'] != null && act['act'] !== '')
        const facts = resultObjectArrays.filter((array) => Object.keys(array[0]).includes('fact'))[0].filter(fact => fact['fact'] != null && fact['fact'] !== '')
        const duties = resultObjectArrays.filter((array) => Object.keys(array[0]).includes('duty'))[0].filter(duty => duty['duty'] != null && duty['duty'] !== '')

        const model = {
            'acts': acts,
            'facts': facts,
            'duties': duties
        }

        console.log(model)
        this.setState({
            ...this.state,
            'model': model
        })
    }

    doubleArrayToObjectArray(doubleArray) {
        const result = []
        const numRows = doubleArray.length
        const numCols = doubleArray[0].length

        for (let row = 1; row < numRows; row++) {
            let resultObject = {}
            for (let col = 0; col < numCols; col++ ) {
                resultObject[doubleArray[0][col]] = doubleArray[row][col]
            }
            result.push(resultObject)
        }


        return result
    }

    render() {
        if (this.state.model) {
            return (
                <ModelView model={this.state.model}/>
            )
        }
        return (
            <div>
            <input type='file' onChange={this.processModel.bind(this)} required multiple/>
        </div>
        )
    }
}

export default UploadModel