import { NextResponse } from "next/server";
import Redis from 'ioredis'
import getRedisKey, {createNewRating, getHour} from '../../utils/index'
import {RateData} from "@/app/types/rateData";
import {Request} from "next/dist/compiled/@edge-runtime/primitives";



export async function GET(req: Request) {
  const redis = new Redis(process.env.REDIS_URL as string)

  const { searchParams } = new URL(req.url)
  const uid = searchParams.get('uid')

  if (!uid) {
    return NextResponse.json({ data: createNewRating() }, { status: 200 });
  }

  const redisKey = getRedisKey(uid)
  let stored
  try {

    const existingStored = await redis.get(redisKey)
    stored = existingStored ? JSON.parse(existingStored): createNewRating()
  } catch (e) {

    return NextResponse.json({ data: {} }, { status: 500 });
  }
  redis.quit()

  // const newHeaders = new Headers(req.headers)
  // newHeaders.set('content-type', 'application/json')
  // newHeaders.set('cache-control', 'public, s-maxage=1800, stale-while-revalidate=2400')

  return NextResponse.json({ data: stored }, { status: 200 });
}

export async function POST(req: Request) {
  const redis = new Redis(process.env.REDIS_URL as string)
  const param = await req.json()
  const redisKey = getRedisKey(param.uid)

  let stored
  try {
    const existingStored = await redis.get(redisKey)
    stored = existingStored ? JSON.parse(existingStored): createNewRating()
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 })
  }

  const key = `r${ param.rate }` as keyof RateData
  stored[key] += 1

  const hour = getHour(Date.now())

  await Promise.all([
    redis.set(redisKey, JSON.stringify(stored)),
    redis.set(`${param.uid}_${hour}`, JSON.stringify(stored), 'EX', 86400 *30)
  ])
  redis.quit()
  return NextResponse.json({ data: stored }, { status: 200 })
}