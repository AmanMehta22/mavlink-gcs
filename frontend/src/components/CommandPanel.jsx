import React from 'react'

const CommandPanel = ({ onSendCommand, disabled }) => {
  const commands = [
    { name: 'TAKEOFF', label: 'Takeoff', color: '#10b981' },
    { name: 'LAND', label: 'Land', color: '#f59e0b' },
    { name: 'RTL', label: 'Return to Launch', color: '#ef4444' }
  ]

  return (
    <div className="data-card">
      <h3>Vehicle Commands</h3>
      <div className="command-buttons">
        {commands.map(command => (
          <button
            key={command.name}
            className="command-button"
            style={{ backgroundColor: command.color }}
            onClick={() => onSendCommand(command.name)}
            disabled={disabled}
          >
            {command.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '10px' }}>
        Note: Commands require proper simulation setup and may not work with all simulators.
      </p>
    </div>
  )
}

export default CommandPanel