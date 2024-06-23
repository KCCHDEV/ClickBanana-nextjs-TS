// Fisher.tsx
"use client";
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { saveHighScores, getHighScores } from '@/app/lib/save';
import Swal from 'sweetalert2'

interface Position {
  top: number;
  left: number;
  icon?: string;
}

interface HighScore {
  name: string;
  score: number;
  spawnRate: number;
}

const fishIcons = ["🐟", "🐠", "🐡", "🦈", "🦦", "👽", "💀", "👻", "😘", "🥵"];
const baitIcons = ["🍌", "🍎", "🍇", "🍓", "🍒", "🍍", "🥕", "🍉", "🏳️‍🌈", "🧋", "✈️"];
const specialFishIcons = [
  { icon: "🦈", points: 25, size: "text-6xl" },
  { icon: "📦", points: 250, size: "text-6xl" },
  { icon: "🏢", points: 70, size: "text-6xl" },
  { icon: "🐉", points: 25, size: "text-6xl" }
];

export default function Fisher() {
  const [baitPosition, setBaitPosition] = useState<Position>({ top: 0, left: 50, icon: "🍌" });
  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);
  const [fishPosition, setFishPosition] = useState<Position[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(2);
  const [spawnRate, setSpawnRate] = useState<number>(3000);
  const [baitSize, setBaitSize] = useState<number>(2);
  const [name, setName] = useState<string>('');
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [nextSpawnCost, setNextSpawnCost] = useState<number>(1000);
  const [resetCode, setResetCode] = useState<string>('');
  const [resetInput, setResetInput] = useState<string>('');
  const [resetPromptVisible, setResetPromptVisible] = useState<boolean>(false);

  useEffect(() => {
    const savedPoints = Cookies.get('points');
    const savedSpeed = Cookies.get('speed');
    const savedSpawnRate = Cookies.get('spawnRate');
    const savedBaitSize = Cookies.get('baitSize');
    const savedName = Cookies.get('name');
    const savedHighScores = Cookies.get('highScores');
    const savedNextSpawnCost = Cookies.get('nextSpawnCost');
    const savedBaitIcon = Cookies.get('baitIcon');
    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedSpeed) setSpeed(parseInt(savedSpeed));
    if (savedSpawnRate) setSpawnRate(parseInt(savedSpawnRate));
    if (savedBaitSize) setBaitSize(parseInt(savedBaitSize));
    if (savedName) setName(savedName);
    if (savedHighScores) setHighScores(JSON.parse(savedHighScores));
    if (savedNextSpawnCost) setNextSpawnCost(parseInt(savedNextSpawnCost));
    if (savedBaitIcon) setBaitPosition((prev) => ({ ...prev, icon: savedBaitIcon }));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setIsMovingLeft(true);
      if (e.key === "ArrowRight") setIsMovingRight(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setIsMovingLeft(false);
      if (e.key === "ArrowRight") setIsMovingRight(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const moveBait = () => {
      setBaitPosition((prev) => {
        let newLeft = prev.left;
        if (isMovingLeft) newLeft -= speed;
        if (isMovingRight) newLeft += speed;
        newLeft = Math.max(0, Math.min(100, newLeft));
        return { ...prev, left: newLeft };
      });
    };
    const intervalId = setInterval(moveBait, 25);
    return () => clearInterval(intervalId);
  }, [isMovingLeft, isMovingRight, speed]);

  useEffect(() => {
    const dropBait = () => {
      setBaitPosition((prev) => {
        let newTop = prev.top + speed;
        if (newTop >= 100) newTop = 0;
        return { ...prev, top: newTop };
      });
    };
    const intervalId = setInterval(dropBait, 100);
    return () => clearInterval(intervalId);
  }, [speed]);

  useEffect(() => {
    const generateFish = () => {
      const randomIconIndex = Math.floor(Math.random() * (fishIcons.length + specialFishIcons.length));
      if (randomIconIndex < fishIcons.length) {
        const randomIcon = fishIcons[randomIconIndex];
        setFishPosition((prev) => [
          ...prev,
          { top: Math.random() * 100, left: Math.random() * 100, icon: randomIcon },
        ]);
      } else {
        const specialFish = specialFishIcons[randomIconIndex - fishIcons.length];
        setFishPosition((prev) => [
          ...prev,
          { top: Math.random() * 100, left: Math.random() * 100, icon: specialFish.icon, size: specialFish.size },
        ]);
      }
    };
    const intervalId = setInterval(generateFish, spawnRate);
    return () => clearInterval(intervalId);
  }, [spawnRate]);

  useEffect(() => {
    const checkCollision = () => {
      const bait = document.querySelector('.bait') as HTMLElement;
      const fish = document.querySelectorAll('.fish');
      const baitRect = bait.getBoundingClientRect();

      fish.forEach((f, index) => {
        const fishRect = f.getBoundingClientRect();
        if (
          baitRect.left < fishRect.right &&
          baitRect.right > fishRect.left &&
          baitRect.top < fishRect.bottom &&
          baitRect.bottom > fishRect.top
        ) {
          setFishPosition((prev) => prev.filter((_, i) => i !== index));
          const caughtFish = fishPosition[index];
          const pointsToAdd = specialFishIcons.some(sf => sf.icon === caughtFish.icon) ? 25 : 2;
          setPoints((prevPoints) => {
            const newPoints = prevPoints + pointsToAdd;
            Cookies.set('points', newPoints.toString());
            return newPoints;
          });
        }
      });
    };

    const intervalId = setInterval(checkCollision, 20);
    return () => clearInterval(intervalId);
  }, [fishPosition]);

  const upgradeSpeed = () => {
    if (points >= 10 && speed < 12) {
      const newSpeed = speed + 0.5;
      setPoints((prevPoints) => {
        const newPoints = prevPoints - 10;
        Cookies.set('points', newPoints.toString());
        return newPoints;
      });
      setSpeed(newSpeed);
      Cookies.set('speed', newSpeed.toString());
      Swal.fire({
        title: "+ speed!",
        icon: "success"
      });
    }
  };

  const upgradeBaitSize = () => {
    if (points >= 10 && baitSize < 12) {
      const newBaitSize = baitSize + 1;
      setPoints((prevPoints) => {
        const newPoints = prevPoints - 10;
        Cookies.set('points', newPoints.toString());
        return newPoints;
      });
      setBaitSize(newBaitSize);
      Cookies.set('baitSize', newBaitSize.toString());
      Swal.fire({
        title: "+ baitSize!",
        icon: "success"
      });
    }
  };

  const decreaseSpawnRate = () => {
    if (points >= nextSpawnCost && spawnRate > 250) {
      const newSpawnRate = spawnRate - 250;
      setPoints((prevPoints) => {
        const newPoints = prevPoints - nextSpawnCost;
        Cookies.set('points', newPoints.toString());
        return newPoints;
      });
      setSpawnRate(newSpawnRate);
      setNextSpawnCost(nextSpawnCost * 2);
      Cookies.set('spawnRate', newSpawnRate.toString());
      Cookies.set('nextSpawnCost', nextSpawnCost.toString());
      Swal.fire({
        title: "+ SpawnRate!",
        icon: "success"
      });
    }
  };

  const changeBaitIcon = () => {
    const randomIconIndex = Math.floor(Math.random() * baitIcons.length);
    const newIcon = baitIcons[randomIconIndex];
    setBaitPosition((prev) => ({ ...prev, icon: newIcon }));
    Cookies.set('baitIcon', newIcon);
    Swal.fire({
      title: "You change bait icon!",
      icon: "success"
    });
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    Cookies.set('name', event.target.value);
  };

  const saveHighScore = async () => {
    Cookies.set('highScores', JSON.stringify(await getHighScores()));
    const newScore: HighScore = {
      name: name,
      score: points,
      spawnRate: spawnRate,
    };
    const updatedHighScores = [...highScores, newScore].sort((a, b) => b.score - a.score).slice(0, 10);
    setHighScores(updatedHighScores);
    await saveHighScores(updatedHighScores);
    Cookies.set('highScores', JSON.stringify(updatedHighScores));
    Swal.fire({
      title: "You save High Score!",
      icon: "success"
    });
  };

  const resetGame = async () => {
    if (resetInput === resetCode) {
      setPoints(0);
      setSpeed(2);
      setSpawnRate(3000);
      setBaitSize(2);
      setNextSpawnCost(1000);
      setBaitPosition((prev) => ({ ...prev, icon: "🍌" }));
      Cookies.remove('points');
      Cookies.remove('speed');
      Cookies.remove('spawnRate');
      Cookies.remove('baitSize');
      Cookies.remove('name');
      Cookies.remove('nextSpawnCost');
      Cookies.remove('baitIcon');
    }
    setResetInput('');
    setResetPromptVisible(false);
    Swal.fire({
      title: "You Reset Data game!",
      icon: "success"
    });
  };

  return (
    <div className="relative h-screen bg-blue-500 overflow-hidden">
      <div className="drawer">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content h-screen">
          <label htmlFor="my-drawer" className="btn btn-primary drawer-button">Open manu</label>
          <div className="absolute bottom-0 left-0 w-full flex justify-between p-4">
            <button
              className="bg-gray-700 text-white p-2 rounded"
              onMouseDown={() => setIsMovingLeft(true)}
              onMouseUp={() => setIsMovingLeft(false)}
              onTouchStart={() => setIsMovingLeft(true)}
              onTouchEnd={() => setIsMovingLeft(false)}
            >
              ซ้าย
            </button>
            <button
              className="bg-gray-700 text-white p-2 rounded"
              onMouseDown={() => setIsMovingRight(true)}
              onMouseUp={() => setIsMovingRight(false)}
              onTouchStart={() => setIsMovingRight(true)}
              onTouchEnd={() => setIsMovingRight(false)}
            >
              ขวา
            </button>
          </div>
          <div
            className={`absolute bait transition bg-white/5`}
            style={{ top: `${baitPosition.top}%`, left: `${baitPosition.left}%`, fontSize: `${baitSize}em` }}
          >
            {baitPosition.icon}
          </div>
          {fishPosition.map((fish: any, index) => (
            <div
              key={index}
              className={`absolute bg-white/5 fish transition-all animate__animated animate__bounce duration-200 ${fish.size || ''}`}
              style={{ top: `${fish.top}%`, left: `${fish.left}%` }}
            >
              {fish.icon}
            </div>
          ))}

        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content flex flex-col gap-5">
            <button
              className="bg-gray-800 text-white py-1 px-3 rounded"
              onClick={upgradeSpeed}
            >
              Upgrade Speed (10 points)
            </button>
            <button
              className="bg-gray-800 text-white py-1 px-3 rounded ml-2"
              onClick={upgradeBaitSize}
            >
              Upgrade Bait Size (10 points)
            </button>
            <button
              className="bg-gray-800 text-white py-1 px-3 rounded ml-2"
              onClick={decreaseSpawnRate}
            >
              Decrease Spawn Rate ({nextSpawnCost} points)
            </button>
            <button
              className="bg-gray-800 text-white py-1 px-3 rounded ml-2"
              onClick={changeBaitIcon}
            >
              Change Bait Icon
            </button>
            <button
              className="bg-red-800 text-white py-1 px-3 rounded ml-2"
              onClick={() => setResetPromptVisible(true)}
            >
              Reset Game
            </button>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter your name"
              className="py-1 px-3 rounded"
            />
            <button
              className="bg-green-800 text-white py-1 px-3 rounded ml-2"
              onClick={saveHighScore}
            >
              Save High Score
            </button>
            <div className='absolute bottom-0 left-0 p-4'>
              <div className="text-xl text-white">Points: {points}</div>
              <div className="text-xl text-white">Speed: {speed}</div>
              <div className="text-xl text-white">Spawn Rate: {spawnRate}ms</div>
              <div className="text-xl text-white">Bait Size: {baitSize}</div>
              <div className="text-xl text-white">High Scores</div>
              {highScores.map((score, index) => (
                <div key={index} className="text-white">
                  {index + 1}. {score.name}: {score.score} (Spawn Rate: {score.spawnRate}ms)
                </div>
              ))}
            </div>
          </div>
          {resetPromptVisible && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center">
              <div className="bg-white p-8 rounded shadow-md">
                <div className="text-xl mb-4">Are you sure you want to reset the game?</div>
                <button
                  className="bg-red-800 text-white py-1 px-3 rounded mr-2"
                  onClick={resetGame}
                >
                  Confirm Reset
                </button>
                <button
                  className="bg-gray-800 text-white py-1 px-3 rounded"
                  onClick={() => setResetPromptVisible(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
