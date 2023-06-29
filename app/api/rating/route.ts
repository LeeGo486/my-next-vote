import Redis from 'ioredis'
import { NextResponse } from "next/server";

import getRedisKey, {createNewRating, getHour} from '../../utils/index'
import { rateLimit } from '@/lib/redis'
import {RateData} from "@/app/types/rateData";

export async function GET(req: Request) {
  let stored
  const { searchParams } = new URL(req.url)
  const uid = searchParams.get('uid')

  if (!uid) {
    return NextResponse.json({ data: createNewRating() }, { status: 200 });
  }

  const redisKey = getRedisKey(uid)
  //Up-stash rate limit
  const { success } = await rateLimit.limit(redisKey)
  if (!success) {
    return NextResponse.json({ message: 'Too Many Requests' }, { status: 429 })
  }

  const redis = new Redis(process.env.REDIS_URL as string)
  try {
    const existingStored = await redis.get(redisKey)
    stored = existingStored ? JSON.parse(existingStored): createNewRating()
  } catch (e) {

    return NextResponse.json({ data: {} }, { status: 500 });
  }
  redis.quit()

  return NextResponse.json({ data: stored }, { status: 200 });
}

export async function POST(req: Request) {
  const redis = new Redis(process.env.REDIS_URL as string)
  const param = await req.json()
  const redisKey = getRedisKey(param.uid)

  //Up-stash rate limit
  const { success } = await rateLimit.limit(redisKey)
  if (!success) {
    return NextResponse.json({ message: 'Too Many Requests' }, { status: 429 })
  }

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


