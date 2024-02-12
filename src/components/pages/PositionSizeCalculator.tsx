import { useState, FC, useEffect } from 'react'
import * as yup from "yup";

import Decimal from 'decimal.js';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

import { ExchangeData } from '@/lib/exchangeBalance';
import { Tooltip, TooltipProvider } from '@radix-ui/react-tooltip';
import { TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { InfoIcon } from 'lucide-react';

type FormData = {
  accountBalance?: number;
  entryPrice: number;
  riskPercentage: number;
  sl: number;
  tp: number;
};

const schema = yup
  .object({
    accountBalance: yup.number().positive().required(),
    entryPrice: yup.number().positive().required(),
    riskPercentage: yup.number().positive().required(),
    sl: yup.number().positive().required(),
    tp: yup.number().positive().required(),
  })
  .required();

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
  //do the math 

  const dAccountBalance = new Decimal(accountBalance || 0);
  const dEntryPrice = new Decimal(entryPrice || 0);
  const dRiskPercentage = new Decimal(riskPercentage || 0);
  const dSl = new Decimal(sl || 0);
  const dTp = new Decimal(tp || 0);

  const distanceToStop = dEntryPrice.minus(dSl);
  const distanceToProfit = dTp.minus(dEntryPrice);
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

enum Direction {
  LONG = 'long',
  SHORT = 'short'
}

export const PositionSizeCalculator: FC<{ exchange?: ExchangeData }> = ({ exchange }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const [direction, setDirection] = useState<Direction>(Direction.LONG);

  const form = useWatch({ control });

  const [positionSize, setPositionSize] = useState<CalculatedPositionSize>();
  const defaultLeverage = 10;
  const [leverage, setLeverage] = useState<number>(defaultLeverage);
  const [storedData, setStoredData] = useState<PositionSizeStorageData>({
    leverage
  });

  const storageKey = `${STORAGE_KEY}${exchange ? exchange.code : ''}`;

  useEffect(() => {

    const getStoredData = async () => {
      const data = await chrome.storage.sync.get(storageKey);

      if (data[storageKey]) {
        setStoredData(data[storageKey]);
        setLeverage(storedData.leverage ?? 0)
      }
    }

    getStoredData();

  }, [])


  useEffect(() => {
    const data = caculatePositionSize(form, leverage)

    setPositionSize(data);

    //save data to storage
    chrome.storage.sync.set({
      [storageKey]: {
        accountBalance: form.accountBalance,
        leverage,
        riskPercentage: form.riskPercentage
      }
    });

  }, [form])

  return (
    <div className="w-full grid grid-cols-1 grid-flow-row gap-2">
      <TooltipProvider>
        <Card>
          <CardHeader className="text-lg">
            {/* <Tabs defaultValue="long" className='w-full'>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger className="data-[state=active]:text-green-600" value="long" onClick={() => setDirection(Direction.LONG)}>Long</TabsTrigger>
              <TabsTrigger className=" data-[state=active]:text-red-600" value="short" onClick={() => setDirection(Direction.SHORT)}>Short</TabsTrigger>
            </TabsList>
          </Tabs> */}

            <div className="flex justify-between">
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
              {positionSize?.size}
            </div>

          </CardHeader>
          <form>
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
                  type="text"
                  defaultValue={storedData.accountBalance}
                  {...register("accountBalance", { required: true })}
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
                  defaultValue={storedData.riskPercentage}
                  {...register("riskPercentage")}
                  aria-invalid={!!errors.entryPrice}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor='entryPrice'>Entry</Label>
                <Input
                  id="entryPrice"
                  placeholder="Enter your entry price"
                  type="text"
                  {...register("entryPrice")}
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
                  type="text"
                  {...register("sl")}
                  aria-invalid={!!errors.entryPrice}
                />
              </div>
              <div>
                <Label htmlFor='tp'>Take Profit</Label>
                <Input
                  id="tp"
                  placeholder="Take profit price"
                  type="text"
                  {...register("tp")}
                  aria-invalid={!!errors.entryPrice}
                />
              </div>
            </CardContent>
            {/* <CardFooter>
            <Button variant="default" size="lg" className="flex-1">
              Calculate
              <MagicWandIcon className="ml-2" />
            </Button>
          </CardFooter> */}
          </form>
        </Card>
      </TooltipProvider>
    </div>
  );
}
