import Markdown from 'markdown-to-jsx'
import React, { useEffect, useState } from 'react'

import './index.css'

import { systemPrompt } from '~systemPrompt'

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
      if (!session) {
        currentSession = await window.ai.languageModel.create({ systemPrompt })
        setSession(currentSession)
      } else if (session.countPromptTokens(prompt) > session.tokensLeft) {
        await session.destroy()
        currentSession = await window.ai.languageModel.create({ systemPrompt })
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

  const handleLinkClick = (event) => {
    const url = event.target.getAttribute('href')

    if (url && url.startsWith('chrome://')) {
      event.preventDefault() // Предотвращаем стандартное поведение

      chrome.runtime.sendMessage({ action: 'openChromeUrl', url })
    }
  }

  return (
    <div>
      <h1>Chrome Help</h1>
      <textarea
        placeholder='Type something, e.g. "How can I clear my cache?"'
        cols={30}
        rows={5}
        value={prompt}
        maxLength={1000}
        onChange={(e) => setPrompt(e.target.value)}></textarea>
      <div className="buttons">
        <button
          className="primary"
          disabled={!prompt.trim()}
          onClick={handleRunPrompt}>
          Ask
        </button>
        <button className="secondary" disabled={!session} onClick={reset}>
          Reset
        </button>
      </div>
      {loading && (
        <div className="text">
          <span className="blink">...</span>
        </div>
      )}
      {response && (
        <div className="text">
          <Markdown
            options={{
              overrides: {
                a: {
                  component: ({ href, children, ...props }) => (
                    <a
                      {...props}
                      href={href}
                      onClick={(e) => {
                        if (href.startsWith('chrome://')) {
                          handleLinkClick(e)
                        }
                      }}>
                      {children}
                    </a>
                  ),
                },
              },
            }}>
            {response}
          </Markdown>
        </div>
      )}
      {error && <div className="text">{error}</div>}
    </div>
  )
}

export default App
