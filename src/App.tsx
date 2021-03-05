import React, { ChangeEvent, FormEvent, useRef, useState } from 'react';
import './App.css';
import axios from 'axios';
import { Box, Button, Grid, Link, Typography } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import Slide from '@material-ui/core/Slide';
import CircularProgress from '@material-ui/core/CircularProgress';



interface File1 extends File {
  webkitRelativePath?: string;
}

const getName = (file: File1) => file.webkitRelativePath || file.name

// const url = 'http://extractcsv-env.eba-q9jcpbqj.eu-west-2.elasticbeanstalk.com'
const url = 'http://localhost:4000'

function App() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('')
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [status, setStatus] = useState('new')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setStatus('started')

    const newFiles = Array.from(e.target.files!)

    const htmlFiles = newFiles.filter(file => file.type === 'text/html')

    const largeFiles = htmlFiles.filter(file => file.size > 50000)

    if (largeFiles.length){
      setError('These files are too large:\n'+ largeFiles.map(getName).join('\n'))
      return
    }
    console.log({htmlFiles})

    setError('')
    setFiles([...files, ...htmlFiles]) 
  }

  const handleSubmitSend = (e: FormEvent<HTMLFormElement>) => {
    setDownloadLink(null)
    setStatus('loading')
    e.preventDefault()

    const data = new FormData()

    files.forEach((file: File1) => {
      data.append(getName(file), file)
    })

    axios.post(`${url}/upload`, data, { headers: {"Access-Control-Allow-Origin": "*"} })
      .then(res => setDownloadLink(res.data.link))
      .then(() => setStatus('finish'))
      .then(() => setFiles([]))
      .catch(err => console.log(err.response))
  }

  const handleClick = () => {
    inputRef.current!.click()
  }

  const handleReset = () => {
    setStatus('new')
    setFiles([])
    setDownloadLink(null)
    setError('')
    inputRef.current!.value = ''
  }

  return (
  <Grid container xs justify='center'>
    <Grid xs={6} container direction='column' alignItems='center' >
      <Box padding={4}>
        <Typography variant='h1'>WELCOME</Typography>
      </Box>
      <form style={{ width: '100%' }} onSubmit={handleSubmitSend}>
        <Grid container alignItems='center' justify='center' direction='column'>
          <input style={{ display: 'none' }} type="file" directory='' webkitdirectory='' onChange={handleChange} ref={inputRef}/>
          <Grid container justify='center'>
            <Button startIcon={<FolderIcon />} variant='outlined' color='primary' onClick={handleClick} type='button' disabled={status === 'finish' || status === 'loading'}>SELECT FOLDER</Button>
          </Grid>
          {status ==='started' && <Typography variant='h6' color='textSecondary'>You can select more</Typography>}
          <p style={{ color: 'red' }}>{error}</p>
          <Grid container xs={6} justify='space-around'>
            <Button variant='outlined' color='secondary' disabled={status === 'new' || status === 'loading'} onClick={handleReset}>Start Again</Button>
            <Button variant='contained' color='primary' type='submit' disabled={!!error || !files.length}>create csv</Button>
          </Grid>
        </Grid>
      </form>
      {status === 'loading' && 'loading...' && <CircularProgress />}
      <Box padding={4}>
        <Grid container alignItems='center' justify='center' direction='column'>
          {status !== 'finish' &&
          <Typography variant='h6' style={{ color: files.length ? 'blue' : 'black' }}>Total html files: {files.length}</Typography>
          }
          {files.map((file: File1) => (<Typography color='primary' variant='subtitle1' key={getName(file)}>{getName(file)}</Typography>))}
        </Grid>
      </Box>
      
        <Slide direction="up" in={!!downloadLink}>
          <Button variant='contained' color='primary' href={downloadLink!} download>
            Click here to download output
          </Button>
        </Slide>
    </Grid>
  </Grid>
  );
}



export default App;
