'use client'

import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

interface WebTerminalProps {
  containerId: string
  hostname: string
  onClose: () => void
}

export function WebTerminal({ containerId, hostname, onClose }: WebTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const terminalInstance = useRef<Terminal | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    // Initialize xterm
    const xterm = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Courier New, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
      },
    })

    const fitAddon = new FitAddon()
    xterm.loadAddon(fitAddon)
    xterm.open(terminalRef.current)
    fitAddon.fit()

    terminalInstance.current = xterm

    // Connect to WebSocket terminal endpoint
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(
      `${protocol}//${window.location.host}/api/v1/admin/containers/${containerId}/terminal/ws`
    )

    ws.onopen = () => {
      setIsConnecting(false)
      xterm.writeln(`✅ Connected to ${hostname}`)
      xterm.writeln(`Type 'exit' to disconnect\n`)
    }

    ws.onmessage = (event) => {
      if (terminalInstance.current) {
        terminalInstance.current.write(event.data)
      }
    }

    ws.onerror = (event) => {
      setError('Connection error')
      xterm.writeln('\r\n❌ Connection error')
    }

    ws.onclose = () => {
      xterm.writeln('\r\n⚠️ Connection closed')
      setIsConnecting(false)
    }

    // Send input from terminal to server
    xterm.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data)
      }
    })

    wsRef.current = ws

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit()
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'resize',
            cols: xterm.cols,
            rows: xterm.rows,
          })
        )
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
      xterm.dispose()
    }
  }, [containerId, hostname])

  return (
    <div className="flex flex-col h-full bg-bg rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <div>
          <h3 className="font-mono font-semibold text-white">{hostname}</h3>
          <p className="text-xs text-muted">
            {isConnecting && 'Connecting...'}
            {!isConnecting && error && `Error: ${error}`}
            {!isConnecting && !error && 'Connected'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Terminal */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-hidden"
        style={{
          backgroundColor: '#1e1e1e',
          padding: '10px',
        }}
      />

      {/* Footer */}
      <div className="px-4 py-2 bg-surface border-t border-border">
        <p className="text-xs text-muted">SSH: {hostname}@openspace.cm:22</p>
      </div>
    </div>
  )
}
