import packageData from '../../package.json'
import { useState, useEffect } from 'react'

import './SidePanel.css'
import { PositionSizeCalculator } from '@/components/pages/PositionSizeCalculator'
import { CalculatorIcon, NotebookPenIcon } from 'lucide-react'
import { Exchange, ExchangeData, getCurrentExchange } from '@/lib/exchangeBalance'
import { Journal } from '@/components/pages/Journal'


const ExchangeLogo = {
  [Exchange.BITVAVO]: 'https://account.bitvavo.com/markets/favicon-32x32.png'
}

type SidePanelView = 'calculator' | 'journal';

export const SidePanel = () => {

  const [currentView, setCurrentView] = useState<SidePanelView>('calculator');
  const [exchange, setExchange] = useState<ExchangeData>();

  useEffect(() => {
    (async function () {
      const result = await getCurrentExchange();

      if (result) {
        setExchange(result);
      }

    })();
  }, [])

  const onLogin = async () => {

    console.log(chrome.identity.getRedirectURL('provider_cb'));

    const manifest = chrome.runtime.getManifest()

    const url = new URL('https://accounts.google.com/o/oauth2/auth')

    if (manifest.oauth2 && manifest.oauth2.scopes) {

      url.searchParams.set('client_id', manifest.oauth2.client_id)
      url.searchParams.set('response_type', 'id_token')
      url.searchParams.set('access_type', 'offline')
      url.searchParams.set('redirect_uri', chrome.identity.getRedirectURL('provider_cb'))
      url.searchParams.set('scope', manifest.oauth2.scopes?.join(' '))

      chrome.identity.launchWebAuthFlow(
        {
          url: url.href,
          interactive: true,
        },
        async (redirectedTo) => {
          if (chrome.runtime.lastError) {
            // auth was not successful
          } else {
            if (redirectedTo) {
              // auth was successful, extract the ID token from the redirectedTo URL
              const url = new URL(redirectedTo)
              const params = new URLSearchParams(url.hash)

              console.log('params: ', params.get('id_token'));

              //const { data, error } = await supabase.auth.signInWithIdToken({
              //   provider: 'google',
              //   token: params.get('id_token'),
              // })
            }
          }
        }
      )
    }
  }

  return (
    <div className='min-h-screen flex flex-col flex-auto flex-shrink-0 antialiased bg-gray-50 text-gray-800'>
      <div className="fixed flex flex-col top-0 right-0 bg-white h-full border-l p-2 items-center justify-start">
        <CalculatorIcon className='hover:bg-gray-100 p-2 rounded-lg w-10 h-10' onClick={() => setCurrentView('calculator')} />
        <NotebookPenIcon className='hover:bg-gray-100 p-2 rounded-lg w-10 h-10' onClick={() => setCurrentView('journal')} />
      </div>
      <div className="bg-transparent mr-20 mt-4 ml-4">
        <button className='bg-gray-50 hover:bg-gray-100 p-2 rounded-lg' onClick={onLogin}>LOGIN</button>
        {exchange && (<div className='flex gap-2 mb-4'>
          <div className={`p-2 rounded-md ${exchange.bgColorClass}`}>
            <img src={exchange.logoUrl} alt="logo" className="h-4" />
            {/* <span className='font-bold'>Available balance: {exchange?.balance || 'no balance detected'}</span> */}
          </div>
        </div>)}
        {currentView === 'calculator' && <PositionSizeCalculator exchange={exchange} />}
        {currentView === 'journal' && <Journal exchange={exchange} />}
        <span className='absolute top-2 right-16 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-700/10'>v{packageData.version}</span>
      </div>
    </div>

  )
}

export default SidePanel
