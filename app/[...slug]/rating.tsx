'use client'
import './vote.css'
import React, {useRef, useEffect, useState} from 'react'
import {RateData} from "@/app/types/rateData"
import { usePathname } from 'next/navigation'
import {createNewRating} from "@/app/utils"
import {motion, useAnimation} from "framer-motion"

const LOCAL_KEY = 'rating'
const emojis = ['🤬', '😰', '🤨', '😄', '🥰']
const options = [5, 4, 3, 2, 1]
let voted:Record<string, number> = {}

export default function Rating() {
  const emojiWrapper = useRef<HTMLDivElement>(null)
  const [rate, setRate] = useState(0)
  const [totalRate, setTotalRate] = useState(0)
  const pathName = usePathname()
  // 创建 animation controller
  const controls = useAnimation();

  useEffect(() => {

    const localStored = localStorage.getItem(LOCAL_KEY)

    if (localStored) {
      voted = JSON.parse(localStored)
      setRate(voted[pathName])
      wrapperEmoji(voted[pathName])
    }

    getRemoteVoteData(pathName).then( res => {
      const { data :rateData } = res
      calculateTotalRanks(rateData)
    })

  }, [pathName]);

  const wrapperEmoji = (rate :number) => {
    // emojiWrapper.current?.scrollTo({
    //   top: (rate - 1) * emojiWrapper.current.clientHeight,
    //   behavior: 'smooth'
    // })

    // 初始化时，默认第三个emoji
    const emojiNum = rate === undefined ? 3: rate
    if(emojiWrapper.current) {
      controls.start({y: (emojiNum - 1) * - emojiWrapper.current.clientHeight}).then(r => {})
     }
  }

  const calculateTotalRanks = (rateData: RateData) => {

    setTotalRate(0)

    options.map(i => {
      const key = 'r' + i as keyof RateData
      const itemScore = rateData[key] * i
      setTotalRate(totalRate => totalRate + itemScore)
    })
  }

  const voteChange = async (event :React.ChangeEvent<HTMLInputElement>) => {

    const newRate = parseInt(event.target.value)
    setRate(newRate)
    wrapperEmoji(newRate)

    const key = 'r' + newRate as keyof RateData
    const oldRate = voted[pathName] || 0

    voted[pathName] = newRate
    localStorage.setItem(LOCAL_KEY, JSON.stringify(voted))

    const param = {
      uid: pathName,
      rate: newRate,
      oldRate
    }

    vote(param).then(res => {
      const { data :rateData } = res
      calculateTotalRanks(rateData)
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
                  className="text-7xl mb-2" key={emoji}
                  initial={{ y: 0 }}
                  animate={ controls }
                  transition={{ ease: "backOut", duration: 1 }}
              >{emoji}</motion.span>
              // >{rate? emoji: '🤨'}</motion.span>
          ))
        }</div>
        <div className="text-center leading-8">Your vote: {rate ? rate :'❓'}</div>
        <div className="flex flex-row-reverse items-center justify-center rating" onChange={voteChange}>
            {
              options.map((i, index) => {
                return <label className="flex items-center justify-center p-1" key={i}>
                  <input className="w-8 h-8" checked={rate === i}
                         type="radio" name="rating" value={i} readOnly />{i}
                </label>
              })
            }
        </div>
        <div className="col-span-2 text-center pt-1">Total Ranks is: {totalRate}</div>
      </div>
  )
}


async function getRemoteVoteData(uid :string) {
  const response = await fetch('/api/rating?uid=' + uid)

  if(response.status === 200) {
    return await response.json();
  }
  return createNewRating()
}

async function vote(param = {}) {
  try {
    const response = await fetch('/api/rating',  {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(param),
    })

    if(response.status === 200) {
      return await response.json();
    }
  } catch (e) {

  }

  return createNewRating()
}