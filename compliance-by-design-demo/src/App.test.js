import React from 'react';
import ReactDOM from 'react-dom';
import ModelView from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ModelView />, div);
  ReactDOM.unmountComponentAtNode(div);
});
