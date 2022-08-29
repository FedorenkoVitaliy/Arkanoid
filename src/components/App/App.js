import React, { useEffect } from 'react';
import Arkanoid from '../../services/Arkanoid';

import './App.css';


const App = () => {

    useEffect(() => {
        let ignore = false;

        if (!ignore) {
            Arkanoid.start("Arkanoid");
        }
        return () => { ignore = true }
    }, [])

    return (
        <div className="App">
          <canvas id="Arkanoid" width="640" height="360"/>
        </div>
    );
}

export default App;
