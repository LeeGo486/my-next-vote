'use client'
import './vote.css'
import React, {useRef, useEffect, useState} from 'react';
import {RateData} from "@/app/types/rateData";
import { usePathname, useSearchParams } from 'next/navigation'

const LOCAL_KEY = 'rating'
const emojis = ['🤬', '😰', '🤨', '😄', '🥰']
let voted:Record<string, number> = {}

export default function Rating() {
  const emojiWrapper = useRef<HTMLDivElement>(null)

  const pathName = usePathname()
  const searchParams = useSearchParams()
  const [path, setPath] = useState('')
  const [myRate, setMyRate] = useState(0)


  useEffect(() => {

    setPath(pathName)

    const stored = localStorage.getItem(LOCAL_KEY)
    if (stored) {
      voted = JSON.parse(stored)
      setMyRate(voted[path] || 0)
    }

    if (myRate) { }

  }, [pathName, searchParams]);


  const voteChange = async (event :React.ChangeEvent<HTMLInputElement>) => {
    setMyRate(parseInt(event.target.value))

    emojiWrapper.current?.scrollTo({
      top: myRate * emojiWrapper.current.clientHeight,
      behavior: 'smooth'
    })

    const key = 'r' + myRate as keyof RateData
    const oldRate = voted[path] || 0

    voted[path] = myRate
    localStorage.setItem(LOCAL_KEY, JSON.stringify(voted))
    try {
      const data = await fetch('/api/rating',  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: path,
          rate: myRate,
          oldRate
        }),
      })

    } catch (e) {

    }
  }

  return (
      <div className="vote-grid">
        <div className="w-18 h-18 row-span-2 p-1
                flex flex-col items-center justify-items-center
                emoji-wrapper overflow-hidden"
             ref={emojiWrapper}
        >{
          emojis.map((emoji, index) => (
              <span className="text-7xl mb-2" key={emoji}>{emoji}</span>
          ))
        }</div>
        <div className="text-center leading-8">Your vote: ?</div>
        <div className="flex flex-row-reverse items-center justify-center rating" onChange={voteChange}>
            {
                ['5', '4', '3', '2', '1'].map((i, index) => {
                    return <label className="flex items-center justify-center p-1" key={i}>
                        <input className="w-8 h-8" type="radio" name="rating" value={i} />{i}
                    </label>
                })
            }
        </div>
        <div className="col-span-2 text-center pt-1">Ranks</div>
      </div>
  )
}