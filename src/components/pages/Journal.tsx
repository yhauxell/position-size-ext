import { ExchangeData } from "@/lib/exchangeBalance"
import { FC } from "react"

export const Journal:FC<{ exchange?: ExchangeData }> = ({ exchange }) => {
    return (
        <div>
            <h1>Journal {exchange?.name}</h1>
        </div>
    )
}