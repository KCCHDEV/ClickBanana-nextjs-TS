"use client";

import { useState, useEffect } from 'react';
import { saveclick, getClick, getViwes } from '@/app/lib/save';

export default function Home() {
  const [A, setA] = useState(0);
  const [B, setB] = useState("🍌");
  const [C, setC] = useState(0.1);
  const [D, setD] = useState('/1.mp3');
  const [S, setS] = useState(0);
  const [Z, setZ] = useState(0);
  const [viewRef, setViewRef] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const views = await getViwes();
      setViewRef((views / 2));
      const initialClicks = await getClick();
      setS(initialClicks);
    };

    fetchData();
  }, []);

  const clickBanana = async () => {
    setA(A + 1);

    if (Z >= 100) {
      setZ(0);
      await saveclick(100);
      const updatedClicks = await getClick();
      setS(updatedClicks);
    } else {
      setZ(Z + 1);
    }

    const audio = new Audio(D);
    audio.volume = C;
    audio.play();
  };

  const handleInputChange = (event: any) => {
    setB(event.target.value);
  };

  const handleInputChange2 = (event: any) => {
    setC(parseFloat(event.target.value));
  };

  const handleInputChange3 = (event: any) => {
    setD(event.target.value);
  };

  return (
    <main className="flex justify-center flex-col items-center min-h-screen bg-yellow-200">
      <h1 className="text-[3vw]">จำนวนการกด {A} ครั้ง</h1>
      <button onClick={clickBanana} className="text-[20vw] hover:shadow-xl transition ease-in-out duration-200 hover:scale-105 active:scale-75">{B}</button>
      <input
        type="text"
        value={B}
        onChange={handleInputChange}
        className="mt-4 p-2 border border-gray-300 rounded"
        placeholder="ปุ่มกด"
      />
      <input
        type="number"
        value={C}
        onChange={handleInputChange2}
        className="mt-4 p-2 border border-gray-300 rounded"
        placeholder="0.0 - 1 ระดับเสียง"
        step="0.1"
        min="0"
        max="1"
      />
      <input
        type="url"
        value={D}
        onChange={handleInputChange3}
        className="mt-4 p-2 border border-gray-300 rounded"
        placeholder="ลิงค์เสียง"
      />
      <a href='https://github.com/KCCHDEV' className='absolute top-0'>Make By NayGolf@MakiShop Team : V0.3bata : รอบการเข้าเล่น {viewRef} ครั้ง : ยอดการกด {S} ครั้ง</a>
    </main>
  );
}
