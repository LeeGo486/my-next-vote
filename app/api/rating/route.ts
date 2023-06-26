import { NextRequest, NextResponse } from "next/server";
import Redis from 'ioredis'
import getRedisKey, {createNewRating, getHour} from '../../utils/index'
import {RateData} from "@/app/types/rateData";

const redis = new Redis(process.env.REDIS_URL as string)

export async function GET(req: Request) {

  const { pathname } = new URL(req.url)

  const { searchParams } = new URL(req.url)

  const uid = searchParams.get('uid')

  // const redisKey = getRedisKey(uid)
  // let data
  //
  // try {
  //   data = await redis.get(redisKey)
  //   res.status(200).json({ state: 'ok', message: 'success', data: data });
  // } catch (e) {
  //   res.status(400).json({ state: 'failed', message: (e as Error).message });
  // }
  // redis.quit()


  // return data
  // Do whatever you want
  return NextResponse.json({ message: "Hello World: " + pathname }, { status: 200 });
}

export async function POST(req: NextRequest) {
  console.info(JSON.stringify(req))
  const { param } = await req.json()
  console.info(JSON.stringify(req))
  console.log(param)
  const redisKey = getRedisKey(param.uid)
  let data

  try {
    let stored = await redis.get(redisKey)
    data = stored ? JSON.parse(stored): createNewRating()
  } catch (e) {
    return NextResponse.json({ message: "Hello World: " + e }, { status: 500 });
  }

  const key = `r${param.rate}` as keyof RateData
  data[key] += 1

  if (param.oldRate) {
    const key = `r${param.rate}` as keyof RateData
    data[key] -= 1
  }

  const hour = getHour(Date.now())
  const stored = JSON.stringify(data)

  await Promise.all([
    redis.set(redisKey, stored),
    redis.set(`${param.uid}_${hour}`, stored, 'EX', 86400 *30)
  ])
  redis.quit()
  return data
}