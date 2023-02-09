import { Button } from '@mui/material';
import React from 'react';
import Terminal, { ColorMode, TerminalOutput } from 'react-terminal-ui';

export default function ExtractorLogs(props: { rows: any; }) {
    const { rows } = props;
    const [logState, setLogState] = React.useState(0)

    const [terminalLineData, setTerminalLineData] = React.useState([
      <TerminalOutput>{logs[logState]}</TerminalOutput>
    ]);

    const updateLogState = () => {
        let newLogState = logState
        
        if (logState < 4) {
            newLogState += 1
        }

        setLogState(newLogState)
        setTerminalLineData([<TerminalOutput>{logs[newLogState]}</TerminalOutput>])

        rows[0].latestStatus = logs[newLogState]
    }

    // Terminal has 100% width by default so it should usually be wrapped in a container div
    return (
      <div className="container" style={{ maxHeight: '1000px'}}>
        <Button variant="contained" onClick={updateLogState}>Update</Button>
        <br></br>
        <Terminal name='word-count-example logs' colorMode={ ColorMode.Light }   onInput={ terminalInput => console.log(`New terminal input received: '${ terminalInput }'`) }>
        { terminalLineData }
        </Terminal>
        
      </div>
    )
  }

// TODO: Remove the hardcoded data below
// Currently used to render the static UI

const logs = [
    '💻 Submitted! (2s)',
    '💻 Submitted! (2s)\n⏳ PROCESS: Uploading file metadata...(5s)',
    '💻 Submitted! (2s)\n⏳ PROCESS: Uploading file metadata...(5s)\n⏳ PROCESS: Downloading file...(26s)',
    '💻 Submitted! (2s)\n⏳ PROCESS: Uploading file metadata...(5s)\n⏳ PROCESS: Downloading file...(26s)\n⏳ PROCESS: Start processing... (58s)',
    '💻 Submitted! (2s)\n⏳ PROCESS: Uploading file metadata...(5s)\n⏳ PROCESS: Downloading file...(26s)\n⏳ PROCESS: Start processing... (58s)\n✅ DONE (elapsed time: 2 mins)'
]