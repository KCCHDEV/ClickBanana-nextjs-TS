"use client";
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

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

const fishIcons = ["🐟", "🐠", "🐡", "🦈", "🦦", "👽", "💀", "👻"];
const baitIcons = ["🍌", "🍎", "🍇", "🍓", "🍒", "🍍", "🥕", "🍉"];
const specialFishIcons = [
  { icon: "🦈", points: 25, size: "text-4xl" },  // Shark
  { icon: "🐉", points: 25, size: "text-4xl" }   // Dragon
];

export default function Fisher() {
  const [baitPosition, setBaitPosition] = useState<Position>({ top: 0, left: 50, icon: "🍌" });
  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);
  const [fishPosition, setFishPosition] = useState<Position[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(2);
  const [spawnRate, setSpawnRate] = useState<number>(3000);
  const [baitSize, setBaitSize] = useState<number>(4);
  const [name, setName] = useState<string>('');
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [nextSpawnCost, setNextSpawnCost] = useState<number>(50000);
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
        if (newTop >= 100) newTop = 0; // Reset position if it reaches the bottom
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
    if (points >= 10 && speed < 12) { // Speed cap at 12
      const newSpeed = speed + 1;
      setPoints(points - 10);
      setSpeed(newSpeed);
      Cookies.set('speed', newSpeed.toString());
      Cookies.set('points', (points - 10).toString());
    }
  };

  const upgradeSpawnRate = () => {
    if (points >= nextSpawnCost) {
      const newSpawnRate = Math.max(500, spawnRate - 500);
      setPoints(points - nextSpawnCost);
      setSpawnRate(newSpawnRate);
      setNextSpawnCost(nextSpawnCost * 2);
      Cookies.set('spawnRate', newSpawnRate.toString());
      Cookies.set('points', (points - nextSpawnCost).toString());
      Cookies.set('nextSpawnCost', (nextSpawnCost * 2).toString());
    }
  };

  const upgradeBaitSize = () => {
    if (points >= 10) {
      const newBaitSize = baitSize + 2;
      setPoints(points - 10);
      setBaitSize(newBaitSize);
      Cookies.set('baitSize', newBaitSize.toString());
      Cookies.set('points', (points - 10).toString());
    }
  };

  const randomizeBaitIcon = () => {
    if (points >= 100) {
      const randomIcon = baitIcons[Math.floor(Math.random() * baitIcons.length)];
      setPoints(points - 100);
      setBaitPosition((prev) => ({ ...prev, icon: randomIcon }));
      Cookies.set('baitIcon', randomIcon);
      Cookies.set('points', (points - 100).toString());
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    Cookies.set('name', e.target.value);
  };

  const saveHighScore = () => {
    const newHighScores = [...highScores, { name, score: points, spawnRate }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setHighScores(newHighScores);
    Cookies.set('highScores', JSON.stringify(newHighScores));
  };

  const generateResetCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setResetCode(code);
    setResetPromptVisible(true);
  };

  const handleReset = () => {
    if (resetInput === resetCode) {
      setPoints(0);
      setSpeed(2);
      setSpawnRate(3000);
      setBaitSize(4);
      setNextSpawnCost(50000);
      setBaitPosition((prev) => ({ ...prev, icon: "😏" }));
      Cookies.set('points', '0');
      Cookies.set('speed', '2');
      Cookies.set('spawnRate', '3000');
      Cookies.set('baitSize', '4');
      Cookies.set('nextSpawnCost', '50000');
      Cookies.set('baitIcon', '😏');
      setResetPromptVisible(false);
      setResetInput('');
    }
  };

  return (
    <main className="relative w-full h-screen bg-blue-200">
      <div
        className="absolute bait text-2xl"
        style={{ top: `${baitPosition.top}%`, left: `${baitPosition.left}%`, width: `${baitSize}px`, height: `${baitSize}px` }}
      >
        {baitPosition.icon}
      </div>
      {fishPosition.map((fish: any, index) => (
        <div
          key={index}
          className={`absolute w-6 h-6 fish ${fish.size || 'text-2xl'}`}
          style={{ top: `${fish.top}%`, left: `${fish.left}%` }}
        >
          {fish.icon}
        </div>
      ))}
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
      <div className="absolute top-0 left-0 p-4">
        <div className="text-xl text-white">Points: {points}</div>
        <button className="bg-green-500 text-white p-2 rounded mt-2" onClick={upgradeSpeed}>Upgrade Speed (10 points)</button>
        <button className="bg-blue-500 text-white p-2 rounded mt-2" onClick={upgradeSpawnRate}>Increase Spawn Rate (Cost: {nextSpawnCost} points)</button>
        <button className="bg-purple-500 text-white p-2 rounded mt-2" onClick={upgradeBaitSize}>Increase Bait Size (10 points)</button>
        <button className="bg-orange-500 text-white p-2 rounded mt-2" onClick={randomizeBaitIcon}>Randomize Bait Icon (100 points)</button>
      </div>
      <div className="absolute top-16 left-0 p-4">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={handleNameChange}
          className="p-2 rounded"
        />
        <button
          className="bg-yellow-500 text-white p-2 rounded mt-2"
          onClick={saveHighScore}
        >
          Save High Score
        </button>
      </div>
      <div className="absolute top-32 left-0 p-4">
        <div className="text-xl text-white">High Scores</div>
        {highScores.map((score, index) => (
          <div key={index} className="text-white">
            {index + 1}. {score.name}: {score.score} (Spawn Rate: {score.spawnRate}ms)
          </div>
        ))}
      </div>
      <div className="absolute top-48 left-0 p-4">
        <button
          className="bg-red-500 text-white p-2 rounded"
          onClick={generateResetCode}
        >
          Reset Game
        </button>
        {resetPromptVisible && (
          <div className="mt-2">
            <div className="text-white">Enter Reset Code: {resetCode}</div>
            <input
              type="text"
              placeholder="Enter reset code"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              className="p-2 rounded mt-2"
            />
            <button
              className="bg-red-500 text-white p-2 rounded mt-2"
              onClick={handleReset}
            >
              Confirm Reset
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
