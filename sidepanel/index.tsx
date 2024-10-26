import React, { useEffect, useState } from 'react'

import './index.css'

declare global {
  interface Window {
    ai: any
  }
}

const App = () => {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const initDefaults = async () => {
      if (!window.ai) {
        setError('Error: window.ai not supported in this browser')
        return
      }
    }

    initDefaults()
  }, [])

  const runPrompt = async (prompt: string) => {
    try {
      let currentSession = session
      if (!currentSession) {
        currentSession = await window.ai.languageModel.create()
        setSession(currentSession)
      }
      return currentSession.prompt(prompt)
    } catch (e) {
      console.error('Prompt failed', e)
      reset()
      throw e
    }
  }

  const reset = async () => {
    if (session) {
      session.destroy()
    }
    setSession(null)
    setResponse('')
    setError('')
    setLoading(false)
  }

  const handleRunPrompt = async () => {
    setLoading(true)
    setError('')
    setResponse('')
    try {
      const res = await runPrompt(prompt)
      setResponse(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Chrome built-in AI</h1>
      <textarea
        placeholder='Type something, e.g. "Write a haiku about Chrome Extensions"'
        cols={30}
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}></textarea>
      <button
        className="primary"
        disabled={!prompt.trim()}
        onClick={handleRunPrompt}>
        Run
      </button>
      <button className="secondary" disabled={!session} onClick={reset}>
        Reset
      </button>
      {loading && (
        <div className="text">
          <span className="blink">...</span>
        </div>
      )}
      {response && (
        <div className="text">
          {response.split(/\r?\n/).map((paragraph, index) => (
            <React.Fragment key={index}>
              {paragraph}
              <br />
            </React.Fragment>
          ))}
        </div>
      )}
      {error && <div className="text">{error}</div>}
    </div>
  )
}

export default App
