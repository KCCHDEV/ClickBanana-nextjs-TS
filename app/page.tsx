"use client";

import { useState } from 'react';

export default function Home() {
  const [A, setA] = useState(0);


  const clickBanana = () => {
    setA(A + 1);
    if (A > 100) {
      const audio = new Audio('/1.mp3');
      audio.volume = 0.2;
      audio.play();
    }
  };

  return (
    <main className="flex justify-center flex-col items-center min-h-screen bg-yellow-200">
      <h1 className="text-[3vw]">จำนวนการกด {A} ครั้ง</h1>
      <button onClick={clickBanana} className="text-[20vw] hover:shadow-xl transition ease-in-out duration-200 hover:scale-105 active:scale-75">🍌</button>
      <a href='https://github.com/KCCHDEV' className='absolute top-0'>Make By NayGolf@MakiShop Team : V0.3bata</a>
    </main>
  );
}
