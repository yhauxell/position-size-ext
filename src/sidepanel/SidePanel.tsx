import packageData from '../../package.json'
import { useState, useEffect } from 'react'

import './SidePanel.css'
import { PositionSizeCalculator } from '@/components/pages/PositionSizeCalculator'
import { CalculatorIcon } from 'lucide-react'
import { Exchange, ExchangeData, getCurrentExchange } from '@/lib/exchangeBalance'


const ExchangeLogo = {
  [Exchange.BITVAVO]: 'https://account.bitvavo.com/markets/favicon-32x32.png'
}

export const SidePanel = () => {

  const [exchange, setExchange] = useState<ExchangeData>();

  useEffect(() => {
    (async function() {
      const result = await getCurrentExchange();

      if(result){
        setExchange(result);
      }

    })();
  },[])

  return (
    <div className='min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-800'>
      <div className="fixed flex flex-col top-0 right-0 bg-white h-full border-l p-2 items-center justify-start">
        <CalculatorIcon className='hover:bg-gray-100 p-2 rounded-lg w-10 h-10'/>
      </div>
      <div className="bg-transparent mr-20 mt-4 ml-4">
        {exchange && (<div className='flex gap-2 mb-4'>
          <div className={`p-2 rounded-md ${exchange.bgColorClass}`}>
            <img src={exchange.logoUrl} alt="logo" className="h-4" />
            {/* <span className='font-bold'>Available balance: {exchange?.balance || 'no balance detected'}</span> */}
          </div>
        </div>)}
        <PositionSizeCalculator exchange={exchange}/>
        <span className='absolute top-2 right-16 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-700/10'>v{packageData.version}</span>
      </div>
    </div>

  )
}

export default SidePanel
