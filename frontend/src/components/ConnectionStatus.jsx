import React from 'react'

const ConnectionStatus = ({ status }) => {
  const statusConfig = {
    connected: { text: 'CONNECTED', className: 'connected' },
    disconnected: { text: 'DISCONNECTED', className: 'disconnected' },
    connecting: { text: 'CONNECTING', className: 'connecting' }
  }
  
  const config = statusConfig[status] || statusConfig.disconnected
  
  return (
    <div className={`connection-status ${config.className}`}>
      {config.text}
    </div>
  )
}

export default ConnectionStatus