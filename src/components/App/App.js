import React, { useEffect } from 'react';
import Arkanoid from '../../services/Arkanoid';

import './App.css';


function App() {

    useEffect(() => {
        Arkanoid.start("Arkanoid");
    }, [])

    return (
        <div className="App">
          <canvas id="Arkanoid" width="640" height="360"/>
        </div>
    );
}

export default App;
