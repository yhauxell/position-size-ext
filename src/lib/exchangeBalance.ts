
enum Exchange {
    BITVAVO,
    BYBIT,
}

const KNOWN_EXCHANGES = [{ code: Exchange.BITVAVO, url: 'account.bitvavo.com' }, { code: Exchange.BYBIT, url: 'bybit.com' }];


async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await chrome.tabs.query(queryOptions);

  return tab;
}


const getBalance = (exchange: Exchange, tabId: any, onLocated: (result: any) => void) => {

    let balance: string | null | undefined;

    switch (exchange) {
        case Exchange.BITVAVO:
            chrome.scripting
                .executeScript({
                    target: { tabId },
                    func: function (){

                        console.log('hello');
                        onLocated(document.querySelector('.balance-label-info .balance-info')?.textContent);
                    },
                    // args: [onLocated]
                })
                .then(() => 'Balance selector running done!');
    }
}

export const  exchangeBalance = async (onLocated: (result: any) => void) => {
  const current = await getCurrentTab();
  console.log(current);
  if (current && current.url) {
      const { hostname } = new URL(current.url);

      const currentExchange = KNOWN_EXCHANGES.find((exchange) => hostname.includes(exchange.url));


      console.log(currentExchange);

      if (currentExchange) {
        getBalance(currentExchange.code, current.id, onLocated);
      }
  }
}
