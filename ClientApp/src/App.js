import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { SingleHalfPeriodPage } from './components/SingleHalfPeriodPage';
import { MultiplePointPage } from './components/MultiplePointPage';
import { Recordings } from './components/Recordings';

import './custom.css'

export default function App() {
    const defaultNoiseSensity = 400;
    const defaultBufferSize = 10;
    const defaultLowPassSensity = 4;
    const defaultDisplaySeconds = 30;

    return (
        <Layout>
            <Route exact path='/' component={() => <Home defaultNoiseSensity={defaultNoiseSensity} defaultBufferSize={defaultBufferSize} defaultLowPassSensity={defaultLowPassSensity} defaultDisplaySeconds={defaultDisplaySeconds} />} />
            <Route exact path='/SinglePeriod' component={() => <SingleHalfPeriodPage defaultNoiseSensity={defaultNoiseSensity} defaultBufferSize={defaultBufferSize} defaultLowPassSensity={defaultLowPassSensity} defaultDisplaySeconds={defaultDisplaySeconds} />} />
            <Route exact path='/MultiplePoint' component={() => <MultiplePointPage defaultNoiseSensity={defaultNoiseSensity} defaultBufferSize={defaultBufferSize} defaultLowPassSensity={defaultLowPassSensity} defaultDisplaySeconds={defaultDisplaySeconds} />} />
            <Route path='/recordings' component={Recordings} />
        </Layout>
    );
}
