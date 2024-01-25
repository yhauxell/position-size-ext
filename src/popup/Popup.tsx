import { useState, useEffect, FC } from 'react'
import * as yup from "yup";
import './Popup.css'
import { Button } from '@/components/ui/button';
import Decimal from 'decimal.js';
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { MagicWandIcon } from '@radix-ui/react-icons';

type FormData = {
  accountBalance: number;
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
  withLeverage: number;
}

Decimal.set({ precision: 4 });

export const Popup: FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const [positionSize, setPositionSize] = useState<CalculatedPositionSize>();
  const defaultLeverage = 10;
  const [leverage, setLeverage] = useState<number>(defaultLeverage);

/* 
  useEffect(() => {
    const storedData = localStorage.getItem(LS_KEY_ACCOUNT);
    if(storedData){
      const parsedData = JSON.parse(storedData);

      if(parsedData.leverage){
        setLeverage(parsedData.leverage)
      }
    }
    
  }, []) */
  

  const onSubmit = ({
    accountBalance,
    entryPrice,
    riskPercentage,
    sl,
    tp,
  }: FormData) => {
    //do the math

    const dAccountBalance = new Decimal(accountBalance);
    const dEntryPrice = new Decimal(entryPrice);
    const dRiskPercentage = new Decimal(riskPercentage);
    const dSl = new Decimal(sl);
    const dTp = new Decimal(tp);

    const distanceToStop = dEntryPrice.minus(dSl);
    const distanceToProfit = dTp.minus(entryPrice);
    const r3 = new Decimal(100).div(distanceToStop.div(distanceToProfit)).div(100); //100 / (distanceToStop / distanceToProfit) / 100);
    const riskAmount = dAccountBalance.mul(dRiskPercentage.div(100));
    const size = riskAmount.div(distanceToStop);
    const requiredCapital = dEntryPrice.mul(size);
    const withLeverage = requiredCapital.div(leverage);

    setPositionSize({
      distanceToStop: distanceToStop.toNumber(),
      riskAmount: riskAmount.toNumber(),
      size: size.toNumber(),
      requiredCapital: requiredCapital.toNumber(),
      r3: r3.toSignificantDigits(2).toNumber(),
      withLeverage: withLeverage.toNumber(),
    });

    // localStorage.setItem(LS_KEY_ACCOUNT, JSON.stringify({accountBalance, leverage, riskPercentage}));
  };

  return (
    <div className="w-full grid grid-cols-2 grid-flow-row gap-2">
      <Card className='border-none rounded-none'>
        <CardHeader className="text-lg">
          Calculate your position size
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="accountBalance">Account balance</Label>
              <Input
                id="accountBalance"
                placeholder="Account balance"
                type="text"
                {...register("accountBalance", { required: true })}
                aria-invalid={!!errors.accountBalance}
              />
              {errors.accountBalance && (
                <p className="input-error">Account balance is required</p>
              )}
            </div>
            <div className="mb-4">
              <Label htmlFor="riskPercentage">Risk %</Label>
              <Input
                id="riskPercentage"
                placeholder="Risk % per trade"
                type="text"
                {...register("riskPercentage")}
                aria-invalid={!!errors.entryPrice}
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="entryPrice">Entry price</Label>
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
            <div className="mb-4">
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
            </div>
            <div className="mb-4">
              <Label htmlFor="sl">Stop loss</Label>
              <Input
                id="sl"
                placeholder="Stop loss price"
                type="text"
                {...register("sl")}
                aria-invalid={!!errors.entryPrice}
              />
            </div>
            <div>
              <Label htmlFor="tp">Take profit</Label>
              <Input
                id="tp"
                placeholder="Take profit price"
                type="text"
                {...register("tp")}
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
      <Card className="p-6 bg-slate-100 border-none rounded-none">
        <div className="flex justify-between mb-4">
          <span className="mr-4 font-bold">RRR</span>
          {positionSize?.r3 && `1:${positionSize?.r3}`}
        </div>
        <div className="flex justify-between mb-4">
          <span className="mr-4 font-bold">Risk amount</span>
          {positionSize?.riskAmount}
        </div>
        <div className="flex justify-between mb-4">
          <span className="mr-4 font-bold">Position Size</span>
          {positionSize?.size}
        </div>
        <div className="flex justify-between mb-4">
          <span className="mr-4 font-bold">Capital</span>
          {positionSize?.requiredCapital}
        </div>
        <div className="flex justify-between mb-4">
          <span className="mr-4 font-bold">Capital with leverage</span>
          {positionSize?.withLeverage}
        </div>
      </Card>
    </div>
  );
}

export default Popup
