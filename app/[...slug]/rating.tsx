'use client'
import './page.css'
import React, {useEffect, useRef, useState} from 'react'
import {RateData} from "@/app/types/rateData"
import {usePathname} from 'next/navigation'
import {createNewRating} from "@/app/utils"
import {AnimatePresence, motion, useAnimation} from "framer-motion"

const LOCAL_KEY = 'rating'
const emojis = ['🤬', '😰', '🤨', '😄', '🥰']
const options = [1, 2, 3, 4, 5]
let voted: Record<string, number> = {}

export default function Rating() {
  const emojiWrapper = useRef<HTMLDivElement>(null)
  const [rate, setRate] = useState(0)
  const [totalRate, setTotalRate] = useState(0)
  const [errMsg, setErrMsg] = useState('')
  const pathName = usePathname()
  // 创建 animation controller
  const controls = useAnimation()

  useEffect(() => {

    const localStored = localStorage.getItem(LOCAL_KEY)

    if (localStored) {
      voted = JSON.parse(localStored)
      setRate(voted[pathName])
      wrapperEmoji(voted[pathName])
    }

    getRemoteVoteData(pathName).then(res => {
      const {data: rateData} = res
      const {message} = res

      rateData && calculateTotalRanks(rateData)
      message && setErrMsg(message)
    })
  }, [pathName]);

  const wrapperEmoji = (rate: number) => {
    // emojiWrapper.current?.scrollTo({
    //   top: (rate - 1) * emojiWrapper.current.clientHeight,
    //   behavior: 'smooth'
    // })

    // 初始化时，默认第三个emoji
    const emojiNum = rate === undefined ? 3 : rate
    if (emojiWrapper.current) {
      controls.start({y: (emojiNum - 1) * -emojiWrapper.current.clientHeight}).then(r => {
        console.info(`r is: ${r}`)
      })
    }
  }

  const calculateTotalRanks = (rateData: RateData) => {

    setTotalRate(0)
    setErrMsg('')

    options.map(i => {
      const key = 'r' + i as keyof RateData
      const itemScore = rateData[key] * i
      setTotalRate(totalRate => totalRate + itemScore)
    })
  }

  const voteChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const newRate = parseInt(event.target.value)
    setRate(newRate)
    wrapperEmoji(newRate)

    const oldRate = voted[pathName] || 0

    voted[pathName] = newRate
    localStorage.setItem(LOCAL_KEY, JSON.stringify(voted))

    const param = {
      uid: pathName,
      rate: newRate,
      oldRate
    }

    vote(param).then(res => {

      const {data: rateData} = res
      const {message} = res

      rateData && calculateTotalRanks(rateData)
      message && setErrMsg(message)
    })
  }

  return (
      <div className="vote-grid">

        <div className="w-18 h-18 row-span-2 p-1
                 flex flex-col items-center justify-items-center
                 emoji-wrapper overflow-hidden"
             ref={emojiWrapper}
        >{
          emojis.map((emoji, index) => (
              <motion.span
                  className="text-7xl mb-2" key={index}
                  initial={{y: 0}}
                  animate={controls}
                  transition={{ease: "backOut", duration: 1}}
              >{emoji}</motion.span>
          ))
        }</div>
        <motion.div className="text-center leading-8"
                    layout
                    animate={{opacity: 1}}
                    transition={{
                      opacity: {ease: "anticipate"},
                      layout: {duration: 1}
                    }}
        >Your vote: {rate ? rate : '❓'}</motion.div>
        <motion.div className="rating justify-center items-center" onChange={voteChange} layout>
          {
            options.map((i) => {
              return (
                  <motion.input type="radio" name="rating" value={i} key={i}
                                className={`mask mask-star-2 bg-orange-400 w-10 h-10`}
                                checked={rate === i} readOnly={true}
                                whileHover={{scale: 1.2}}
                                whileTap={{scale: .95}}
                                initial={{scale: 1}}
                  />
              )
            })
          }
        </motion.div>
        <div className="col-span-2 text-center pt-1">Total Ranks is: {totalRate}</div>
        <AnimatePresence>
          {errMsg && <motion.div className="col-span-2 text-center text-red-500"
                                 initial={{opacity: 0, x: -100}}
                                 animate={{opacity: 1, x: 0}}
                                 exit={{opacity: 0, x: 100, transition: {duration: 0.3}}}
                                 transition={{type: "spring", duration: 0.7}}
          >提示信息: {errMsg}</motion.div>}
        </AnimatePresence>
      </div>
  )
}

async function getRemoteVoteData(uid: string) {
  const response = await fetch('/api/rating?uid=' + uid)
  return await response.json()
}

async function vote(param = {}) {

  try {
    const response = await fetch('/api/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(param),
    })

    return await response.json()
  } catch (e) {
    console.info(`vote error message is: ${JSON.stringify(e)}`)
  }
  return createNewRating()
}