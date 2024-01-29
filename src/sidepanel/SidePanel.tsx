import { useState, useEffect } from 'react'

import './SidePanel.css'
import { PositionSizeCalculator } from '@/components/pages/PositionSizeCalculator'
import { CalculatorIcon } from 'lucide-react'
import { exchangeBalance } from '@/lib/exchangeBalance'

export const SidePanel = () => {
  const [countSync, setCountSync] = useState(0)
  const [balance, setBalance] = useState()
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


  useEffect(() => {
    (async function() {
      await exchangeBalance((exchangeBalance)=> setBalance(exchangeBalance))
    })();
  },[])

  return (
    <div className='min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-800'>
    <div className="fixed flex flex-col top-0 right-0 bg-white h-full border-l p-2 items-center justify-start">
      <CalculatorIcon className='hover:bg-gray-100 p-2 rounded-lg w-10 h-10'/>
    </div>
    <div className="bg-transparent mr-20 mt-4 ml-4">
      <div>{balance || 'no balance detected'}</div>
      <PositionSizeCalculator />
    </div>
    </div>

  )
}

export default SidePanel
