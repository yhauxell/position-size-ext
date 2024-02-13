import { useState, FC, useEffect } from 'react'
import * as yup from "yup";

import Decimal from 'decimal.js';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

import { ExchangeData } from '@/lib/exchangeBalance';
import { Tooltip, TooltipProvider } from '@radix-ui/react-tooltip';
import { TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { MagicWandIcon } from '@radix-ui/react-icons';
import { formatNumber } from '@/lib/utils';

type FormData = {
  accountBalance?: number;
  entryPrice: number;
  riskPercentage: number;
  sl: number;
  tp: number;
};

interface CalculatedPositionSize {
  distanceToStop: number;
  riskAmount: number;
  size: number;
  requiredCapital: number;
  r3: number;
  withLeverage?: number;
}

interface PositionSizeStorageData {
  accountBalance?: number;
  leverage?: number;
  riskPercentage?: number;
}

Decimal.set({ precision: 4 });

const STORAGE_KEY = 'PSC_ACCOUNT';

const caculatePositionSize = ({
  accountBalance,
  entryPrice,
  riskPercentage,
  sl,
  tp,
}: FormData, leverage: number) => {

  const dAccountBalance = new Decimal(accountBalance || 0);
  const dEntryPrice = new Decimal(entryPrice || 0);
  const dRiskPercentage = new Decimal(riskPercentage || 0);
  const dSl = new Decimal(sl || 0);
  const dTp = new Decimal(tp || 0);

  const distanceToStop = dEntryPrice > dSl ? dEntryPrice.minus(dSl) : dSl.minus(dEntryPrice);
  const distanceToProfit = dEntryPrice < dTp ? dTp.minus(dEntryPrice) : dEntryPrice.minus(dTp);
  const r3 = new Decimal(100).div(distanceToStop.div(distanceToProfit)).div(100); //100 / (distanceToStop / distanceToProfit) / 100);
  const riskAmount = dAccountBalance.mul(dRiskPercentage.div(100));
  const size = riskAmount.div(distanceToStop);
  const requiredCapital = dEntryPrice.mul(size);
  const withLeverage = leverage > 0 ? requiredCapital.div(leverage) : undefined;

  const r3Result = r3.toSignificantDigits(2).toNumber();
  const sizeResult = size.toNumber();
  const requiredCapitalResult = requiredCapital.toNumber()

  return {
    distanceToStop: distanceToStop.toNumber(),
    riskAmount: riskAmount.toNumber(),
    size: isNaN(sizeResult) || !isFinite(sizeResult) ? 0 : sizeResult,
    requiredCapital: isNaN(requiredCapitalResult) || !isFinite(requiredCapitalResult) ? 0 : requiredCapitalResult,
    r3: isNaN(r3Result) ? 0 : r3Result,
    withLeverage: withLeverage?.toNumber(),
  };

};

export const PositionSizeCalculator: FC<{ exchange?: ExchangeData }> = ({ exchange }) => {
  const [positionSize, setPositionSize] = useState<CalculatedPositionSize>();
  const defaultLeverage = 10;
  const [leverage, setLeverage] = useState<number>(defaultLeverage);

  const {
    register,
    setValue,
    control,
    formState: { errors },
    handleSubmit
  } = useForm<FormData>();


  const storageKey = `${STORAGE_KEY}${exchange ? exchange.code : ''}`;

  useEffect(() => {
    const getStoredData = async () => {
      const data = await chrome.storage.sync.get(storageKey);

      try {
        const { accountBalance, levarege, riskPercentage } = JSON.parse(data[storageKey]);

        if (accountBalance && riskPercentage) {
          setValue('accountBalance', accountBalance);
          setValue('riskPercentage', riskPercentage);
        }

        if (levarege) {
          setLeverage(levarege);
        }

      } catch (error) {
        console.log('error getting stored data: ', error);
      }
    }

    getStoredData();

  }, [storageKey])


  const onHandleSubmit = (form: FormData) => {
    const data = caculatePositionSize(form, leverage)

    setPositionSize(data);

    //save data to storage
    chrome.storage.sync.set({
      [storageKey]: JSON.stringify({
        accountBalance: form.accountBalance,
        riskPercentage: form.riskPercentage,
        leverage: leverage
      })
    });

  };

  return (
    <div className="w-full grid grid-cols-1 grid-flow-row gap-2">
      <TooltipProvider>
        <Card>
          <CardHeader className="text-lg">
            <div className="flex justify-between p-2 border-red-500 border-solid border-1">
              <span className="mr-4 font-bold flex items-center gap-1">
                Position Size
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className='w-3' />
                  </TooltipTrigger>
                  <TooltipContent className='font-normal'>
                    <p>Fill all the fields bellow to calculate your position size</p>
                  </TooltipContent>
                </Tooltip>
              </span>
              <b>{formatNumber(positionSize?.size ?? 0, 'u')}</b>
            </div>

          </CardHeader>
          <form onSubmit={handleSubmit(onHandleSubmit)}>
            <CardContent>
              <Card className='mb-6'>
                <CardContent className='p-4'>
                  <div className="flex justify-between mb-4">
                    <span className="mr-4 font-bold">Risk amount</span>
                    {positionSize?.riskAmount}
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="mr-4 font-bold">Required capital</span>
                    {positionSize?.requiredCapital}
                  </div>
                  {exchange?.futureOptions && (<div className="flex justify-between mb-4">
                    <span className="mr-4 font-bold">Capital with leverage</span>
                    {positionSize?.withLeverage}
                  </div>)}
                  <div className="flex justify-between mb-4">
                    <span className="mr-4 font-bold flex gap-1 items-center">
                      Ratio
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className='w-3' />
                        </TooltipTrigger>
                        <TooltipContent className='font-normal'>
                          <p>Only when Take Profit target is entered</p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    {positionSize?.r3 && `1:${positionSize?.r3}`}
                  </div>
                </CardContent>
              </Card>
              <div className="mb-4">
                <Label htmlFor='accountBalance'>Account size</Label>
                <Input
                  id="accountBalance"
                  placeholder="Account balance"
                  type="number"
                  {...register("accountBalance", { required: true, valueAsNumber: true })}
                  aria-invalid={!!errors.accountBalance}
                />
                {errors.accountBalance && (
                  <p className="text-red-600">Account balance is required</p>
                )}
              </div>
              <div className="mb-4">
                <Label htmlFor='riskPercentage'>Risk %</Label>
                <Input
                  id="riskPercentage"
                  placeholder="Risk % per trade"
                  type="number"
                  step="0.1"
                  {...register("riskPercentage", { required: true, min: 0.1, max: 100, valueAsNumber: true })}
                  aria-invalid={!!errors.entryPrice}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor='entryPrice'>Entry</Label>
                <Input
                  id="entryPrice"
                  placeholder="Enter your entry price"
                  type="number"
                  step="0.0001"
                  {...register("entryPrice", {
                    required: true, valueAsNumber: true,
                  })}
                  aria-invalid={!!errors.entryPrice}
                />
                {errors.entryPrice && (
                  <p className="input-error">Entry price required</p>
                )}
              </div>
              {exchange?.futureOptions && (<div className="mb-4">
                <Label className="mb-2 flex justify-between">
                  Leverage <span>{leverage}x</span>
                </Label>
                <Slider
                  className=""
                  defaultValue={[defaultLeverage]}
                  value={[leverage]}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setLeverage(value)}
                />
                <div></div>
              </div>)}
              <div className="mb-4">
                <Label htmlFor='sl'>Stop Loss</Label>
                <Input
                  id="sl"
                  placeholder="Stop loss price"
                  type="number"
                  step="0.0001"
                  {...register("sl", { required: true, valueAsNumber: true })}
                  aria-invalid={!!errors.entryPrice}
                />
              </div>
              <div>
                <Label htmlFor='tp'>Take Profit</Label>
                <Input
                  id="tp"
                  placeholder="Take profit price"
                  type="number"
                  step="0.0001"
                  {...register("tp", { required: true, valueAsNumber: true })}
                  aria-invalid={!!errors.entryPrice}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="default" size="lg" className="flex-1">
                Calculate
                <MagicWandIcon className="ml-2" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TooltipProvider>
    </div>
  );
}
