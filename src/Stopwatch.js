import React, { createRef } from 'react';
import './Stopwatch.css';

import Toast from 'light-toast';

import StartIcon from './Start.png';
import TimestampIcon from './Timestamp.png';
import StopIcon from './Stop.png';
import CopyIcon from './Copy.png';
import ShareIcon from './Share.png';

class Stopwatch extends React.Component {
    
    constructor(props) {
        super(props);
        this.handleStart = this.handleStart.bind(this);
        this.handleStop = this.handleStop.bind(this);
        this.handleLogTime = this.handleLogTime.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.handleShare = this.handleShare.bind(this);
        
        this.copyTextAreaRef = React.createRef();
        
        this.state = {running: false, log: '(hit start)', logEntries:[]};
        this.audioRef = createRef(null);
    }

    handleStart(e) {
        console.log('start');
        this.clearLog();
        this.addLogEntry('start');
        this.setState({running: true});
    }

    handleStop(e) {
        console.log('stop');
        this.addLogEntry('stop');
        this.setState({running: false});
    }

    handleLogTime(e) {
        console.log('timestamp');
        this.addLogEntry('timestamp');
    }

    handleCopy(e) {
        Toast.info('Log copied to clipboard!', 2000);
        this.setState((state, props) => ({
            log: state.logEntries.map(entry => `${entry.timestamp.toISOString()} ${entry.note}`).join('\n')
        }), () => {
            this.copyTextAreaRef.current.select();
            document.execCommand('copy');
            console.log(`Copied to clipboard:\n${this.state.log}`);
        });
    }

    handleShare(e) {
        this.setState((state, props) => ({
            log: state.logEntries.map(entry => `${entry.timestamp.toISOString()} ${entry.note}`).join('\n')
        }), () => {
            navigator.share({
                text: this.state.log
            });
        });
    }

    clearLog() {
        this.setState({log: '', logEntries: []});
    }

    selectAllText(e) {
        e.target.select();
    }

    pad(number, size) {
        let s = String(number);
        while (s.length < (size || 2)) {s = "0" + s;}
        return s;
    }

    formatTimestamp(date) {
        return `${date.getHours()}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}.${this.pad(date.getMilliseconds(), 3)}`
    }

    addLogEntry(note) {
        this.setState((state, props) => ({
            logEntries: [{timestamp: new Date(), note: note}, ...state.logEntries]
        }));

    
        this.audioRef.current.play();
    }

    removeLogEntry() {
        console.log([...this.state.logEntries].shift())
        this.setState({
            logEntries: this.state.logEntries.slice(1)
        })
    }

    render() {
        let firstButton;
        if (!this.state.running) {
            firstButton = <button onClick={this.handleStart}>
                <img src={StartIcon} alt=""/>
                <span className="label">Start</span>
            </button>;
        } else {
            firstButton = <button onClick={this.handleLogTime}>
                <img src={TimestampIcon} alt=""/>
                <span className="label">Timestamp</span>
            </button>;
        }

        return (
            <div id="stopwatch">
                <audio ref={this.audioRef} className='audio' src="/click1.mp3" />
                <div id="buttons">
                    {firstButton}
                    <button onClick={this.handleStop} disabled={!this.state.running}>
                        <img src={StopIcon} alt=""/>
                        <span className="label">Stop</span>
                    </button>
                    <button onClick={this.handleCopy}>
                        <img src={CopyIcon} alt=""/>
                        <span className="label">Copy Log</span>
                    </button>
                    {navigator.share &&
                        <button onClick={this.handleShare}>
                            <img src={ShareIcon} alt=""/>
                            <span className="label">Share Log</span>
                        </button>
                    }
                </div>
                <textarea id="copylog" rows="5" cols="30" value={this.state.log} ref={this.copyTextAreaRef} readOnly/>
                {this.state.logEntries.length === 0 &&
                    <div id="instructions">
                        <div><b>Timestamp Stopwatch</b></div>
                        <div id="explanation">
                            This is a simple app for recording a set of
                            timestamps. Each timestamp can have a custom
                            note attached. Once finished, the entire log can
                            be copied (or on mobile, shared).
                            <br/><br/>
                            To use it, tap "Start" to log the first timestamp,
                            then "Timestamp" to keep adding more. You can
                            change the note next to any timestamp by tapping it.
                            <br/><br/>
                            For source and more information, see <a href="https://github.com/joehughes/timestamp-stopwatch-react">Github</a>.
                            <br/><br/>
                            version: {this.props.version}
                        </div>
                    </div>
                }
                {this.state.logEntries.length > 0 &&
                    <div className="log">
                        <ul>
                            {this.state.logEntries.map((entry, index) => (
                                <li key={entry.timestamp.toISOString()} className="logentry">
                                    <strong>{(this.state.logEntries?.length || 0) - index}</strong>
                                    <div>
                                        <span class="timestamp">{this.formatTimestamp(entry.timestamp)} </span>
                                        <input className="loginput" type="text" value={entry.note}
                                            onClick={this.selectAllText} onChange={ e => {
                                            let logEntries = this.state.logEntries;
                                            logEntries[index].note = e.target.value;
                                            this.setState({logEntries: logEntries});
                                        }} />
                                    </div>
                                    {index === 0 && this.state.running && 
                                        <button className='remove-button' onClick={() => this.removeLogEntry()}>Remove</button>
                                    }
                                </li>
                            ))}
                        </ul>
                    </div>
                }
            </div>
        );
    }
}

export default Stopwatch;
