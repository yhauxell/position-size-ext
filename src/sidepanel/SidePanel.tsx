import { useState, useEffect } from 'react'

import './SidePanel.css'
import { PositionSizeCalculator } from '@/components/pages/PositionSizeCalculator'

export const SidePanel = () => {
  const [countSync, setCountSync] = useState(0)
  const link = 'https://github.com/guocaoyi/create-chrome-ext'

  useEffect(() => {
    chrome.storage.sync.get(['count'], (result) => {
      setCountSync(result.count || 0)
    })

    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === 'COUNT') {
        setCountSync(request.count || 0)
      }
    })
  }, [])
  return (
    <div className="bg-transparent p-4">
      <PositionSizeCalculator />
    </div>
  )
}

export default SidePanel
