'use client'
import './vote.css'
import React, {useRef, useEffect, useState} from 'react';
import {RateData} from "@/app/types/rateData";
import { useRouter } from 'next/navigation';

const LOCAL_KEY = 'rating'
const emojis = ['🤬', '😰', '🤨', '😄', '🥰']
let voted:Record<string, number> = {}

export default function Rating() {
  const emojiWrapper = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLInputElement | null>(null);
  const myRate = useRef<number>(0)

  const router = useRouter();
  const [path, setPath] = useState('')


  useEffect(() => {
    setPath('');
    const stored = localStorage.getItem(LOCAL_KEY)
    if (stored) {
      voted = JSON.parse(stored)
      myRate.current = voted[path] || 0
    }
  }, [router]);

  const voteChange = (event :React.ChangeEvent<HTMLInputElement>):void => {
    const selectedRating = parseInt(event.target.value);

    emojiWrapper.current?.scrollTo({
      top: (selectedRating - 1) * emojiWrapper.current.clientHeight,
      behavior: 'smooth'
    })

    const key = 'r' + selectedRating as keyof RateData
    const oldRate = voted[path] || 0
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
                    return <label className="flex items-center justify-center p-1">
                        <input className="w-8 h-8" type="radio" name="rating" value={i} ref={ref} v-model="myRate" />{i}
                    </label>
                })
            }
        </div>
        <div className="col-span-2 text-center pt-1">Ranks</div>
      </div>
  )
}