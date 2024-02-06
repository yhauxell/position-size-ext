
export enum Exchange {
    BITVAVO,
    BYBIT,
}

export interface ExchangeData {
  code: Exchange,
  url: string,
  balance?: string,
  name: string,
  logoUrl: string,
  bgColorClass: string,
  futureOptions?: boolean,
}

export const KNOWN_EXCHANGES:ExchangeData[] = [
  {
    code: Exchange.BITVAVO,
    url: 'account.bitvavo.com',
    logoUrl: 'https://account.bitvavo.com/markets/favicon-32x32.png',
    name: 'Bitvavo',
    bgColorClass:'bg-slate-100',
  },
  {
    code: Exchange.BYBIT,
    url: 'bybit.com',
    logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODciIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCA4NyAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYyLjAwODMgMjUuMzU3MlYzSDY2LjUwMjJWMjUuMzU3Mkg2Mi4wMDgzWiIgZmlsbD0iI0Y3QTYwMCIvPgo8cGF0aCBkPSJNOS42MzQwNyAzMS45OTgzSDBWOS42NDExMUg5LjI0NjY2QzEzLjc0MDYgOS42NDExMSAxNi4zNTkxIDEyLjA5MDMgMTYuMzU5MSAxNS45MjE0QzE2LjM1OTEgMTguNDAxMyAxNC42Nzc0IDIwLjAwMzkgMTMuNTEzNCAyMC41Mzc1QzE0LjkwMjggMjEuMTY1MiAxNi42ODEzIDIyLjU3NzkgMTYuNjgxMyAyNS41NjI0QzE2LjY4MTMgMjkuNzM3MyAxMy43NDA2IDMxLjk5ODMgOS42MzQwNyAzMS45OTgzWk04Ljg5MDk2IDEzLjUzNTVINC40OTM5VjE4LjY4NTJIOC44OTA5NkMxMC43OTgxIDE4LjY4NTIgMTEuODY1MiAxNy42NDg4IDExLjg2NTIgMTYuMTA5NUMxMS44NjUyIDE0LjU3MTkgMTAuNzk4MSAxMy41MzU1IDguODkwOTYgMTMuNTM1NVpNOS4xODE1MSAyMi42MTA0SDQuNDkzOVYyOC4xMDU2SDkuMTgxNTFDMTEuMjE4OSAyOC4xMDU2IDEyLjE4NzQgMjYuODUwMyAxMi4xODc0IDI1LjM0MThDMTIuMTg3NCAyMy44MzUgMTEuMjE3MSAyMi42MTA0IDkuMTgxNTEgMjIuNjEwNFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zMC4zODgyIDIyLjgyOTNWMzEuOTk4M0gyNS45MjZWMjIuODI5M0wxOS4wMDczIDkuNjQxMTFIMjMuODg4NkwyOC4xODg4IDE4LjY1MjdMMzIuNDIzOSA5LjY0MTExSDM3LjMwNTJMMzAuMzg4MiAyMi44MjkzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTUwLjA0NTcgMzEuOTk4M0g0MC40MTE2VjkuNjQxMTFINDkuNjU4M0M1NC4xNTIyIDkuNjQxMTEgNTYuNzcwNyAxMi4wOTAzIDU2Ljc3MDcgMTUuOTIxNEM1Ni43NzA3IDE4LjQwMTMgNTUuMDg5IDIwLjAwMzkgNTMuOTI1IDIwLjUzNzVDNTUuMzE0NCAyMS4xNjUyIDU3LjA5MyAyMi41Nzc5IDU3LjA5MyAyNS41NjI0QzU3LjA5MyAyOS43MzczIDU0LjE1MjIgMzEuOTk4MyA1MC4wNDU3IDMxLjk5ODNaTTQ5LjMwMjYgMTMuNTM1NUg0NC45MDU1VjE4LjY4NTJINDkuMzAyNkM1MS4yMDk3IDE4LjY4NTIgNTIuMjc2OCAxNy42NDg4IDUyLjI3NjggMTYuMTA5NUM1Mi4yNzY4IDE0LjU3MTkgNTEuMjA5NyAxMy41MzU1IDQ5LjMwMjYgMTMuNTM1NVpNNDkuNTkzMSAyMi42MTA0SDQ0LjkwNTVWMjguMTA1Nkg0OS41OTMxQzUxLjYzMDUgMjguMTA1NiA1Mi41OTkgMjYuODUwMyA1Mi41OTkgMjUuMzQxOEM1Mi41OTkgMjMuODM1IDUxLjYzMDUgMjIuNjEwNCA0OS41OTMxIDIyLjYxMDRaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODAuOTg2IDEzLjUzNTVWMzJINzYuNDkyMVYxMy41MzU1SDcwLjQ3ODVWOS42NDExMUg4Ni45OTk2VjEzLjUzNTVIODAuOTg2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
    name: 'Bybit',
    bgColorClass:'bg-slate-800',
    futureOptions: true,
  }
];


async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await chrome.tabs.query(queryOptions);

  return tab;
}


const getBalance = async (exchange: Exchange, tabId: any) => {
    switch (exchange) {
        case Exchange.BITVAVO:
          console.log('bitvavo');
          const response = await chrome.scripting
              .executeScript({
                  target: { tabId},
                  func: ()=> {
                    return  document.querySelector('.balance-label-info .balance-info')?.textContent;
                  }
              });

              console.log(response[0]);

          if(Array.isArray(response) && response[0].result){
            return response[0].result;
          }
    }
}

export const getCurrentExchange = async ():Promise<ExchangeData | undefined>=> {
  const current = await getCurrentTab();

  if (current && current.url) {
      const { hostname } = new URL(current.url);

      const currentExchange = KNOWN_EXCHANGES.find((exchange) => hostname.includes(exchange.url));

      if (currentExchange) {
        //const balance = await getBalance(currentExchange.code, current.id);

        return {
          //balance,
          ...currentExchange
        }
      }
  }
}
