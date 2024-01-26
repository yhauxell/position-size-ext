
enum Exchange {
    BITVAVO,
    BYBIT,
}

const KNOWN_EXCHANGES = [{ code: Exchange.BITVAVO, url: 'account.bitvavo.com' }, { code: Exchange.BYBIT, url: 'bybit.com' }];

const getBalance = (exchange: Exchange, tabId: any, onLocated: (result: any) => void) => {

    let balance: string | null | undefined;

    switch (exchange) {
        case Exchange.BITVAVO:
            chrome.scripting
                .executeScript({
                    target: { tabId },
                    func: function (onLocated){
                        onLocated(document.querySelector('.balance-label-info .balance-info')?.textContent);
                    },
                    args: [onLocated]
                })
                .then(() => 'Balance selector running done!');
    }
}

export const exchangeBalance = (onLocated: (result: any) => void) => {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        const [current] = tabs;

        if (current.url) {
            const { hostname } = new URL(current.url);

            const currentExchange = KNOWN_EXCHANGES.find((exchange) => hostname.includes(exchange.url));

            if (currentExchange) {
                const balance = getBalance(currentExchange.code, current.id, onLocated);

            }
        }
    });
}