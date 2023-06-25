
import { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis'
import getRedisKey, {createNewRating, getHour} from '../utils/index'
import {RateData} from "@/app/types/rateData";

const redis = new Redis(process.env.REDIS_URL as string)

export default async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  // 在这里编写你的数据请求逻辑
  // 例如使用 axios 或 fetch 发送请求并处理返回的数据


  const uid = req.url
  const redisKey = getRedisKey(uid)
  let data

  try {
    data = await redis.get(redisKey)
    res.status(200).json({ state: 'ok', message: 'success', data: data });
  } catch (e) {
    res.status(400).json({ state: 'failed', message: (e as Error).message });
  }
  redis.quit()

  return data
}

export async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const body =  req.body
  const redisKey = getRedisKey(body.uid)
  let data

  try {
    let stored = await  redis.get(redisKey)
    data = stored ? JSON.parse(stored): createNewRating()
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong' });
  }

  const key = `r${body.rate}` as keyof RateData
  data[key] += 1

  if (body.oldRate) {
    const key = `r${body.rate}` as keyof RateData
    data[key] -= 1
  }

  const hour = getHour(Date.now())
  const stored = JSON.stringify(data)

  await Promise.all([
      redis.set(redisKey, stored),
      redis.set(`${body.uid}_${hour}`, stored, 'EX', 86400 *30)
  ])
  redis.quit()
  return data
}
