// components/Terminal.tsx
import React, { useState } from "react"

interface TerminalProps {
  onSendCommand: (command: string) => void
}

const Terminal: React.FC<TerminalProps> = ({ onSendCommand }) => {
  const [input, setInput] = useState("")
  const [logs, setLogs] = useState<string[]>([])

  const handleSend = () => {
    if (input.trim() !== "") {
      onSendCommand(input.trim())
      setLogs((prev) => [...prev, `> ${input.trim()}`])
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend()
    }
  }

  return (
    <div className="bg-black text-green-400 p-2 rounded h-40 flex flex-col">
      <div className="flex-1 overflow-auto mb-2">
        {logs.map((log, index) => (
          <p key={index} className="text-sm">{log}</p>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 bg-gray-800 text-green-400 p-2 rounded-l outline-none"
          placeholder="Enter command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend} className="bg-gray-700 p-2 rounded-r">
          Send
        </button>
      </div>
    </div>
  )
}

export default Terminal
