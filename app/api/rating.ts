
import { NextApiRequest, NextApiResponse } from 'next';
import Redis from 'ioredis'
import getRedisKey, {createNewRating, getHour} from '../utils/index'

const redis = new Redis(process.env.REDIS_URL as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

