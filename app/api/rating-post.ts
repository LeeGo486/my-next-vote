import {NextApiRequest, NextApiResponse} from "next"
import getRedisKey, {createNewRating, getHour} from '../utils/index'
import {RateData} from "@/app/types/rateData";
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL as string)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return false
    }

    const body =  req.body
    const redisKey = getRedisKey(body.uid)
    let data

    try {
        let stored = await redis.get(redisKey)
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