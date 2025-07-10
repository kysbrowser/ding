
import React, { useState } from "react";
import Papa from "papaparse";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const shortenWallet = (w) => w.slice(0, 3) + '...' + w.slice(-4);

const randomDeathMessages = [
  "was killed by a flying shark",
  "slipped on a banana peel",
  "got lost in an RPC blackhole",
  "rage quit and vanished",
  "was rugged mid-wave",
  "disconnected forever"
];

const getRandomEvent = (victim, killerPool) => {
  const rand = Math.random();
  const victimShort = shortenWallet(victim);
  if (rand < 0.2) {
    const msg = randomDeathMessages[Math.floor(Math.random() * randomDeathMessages.length)];
    return `${victimShort} ${msg}`;
  } else {
    const killer = killerPool[Math.floor(Math.random() * killerPool.length)];
    return `${shortenWallet(killer)} eliminated ${victimShort}`;
  }
};

const Eliminator = () => {
  const [gameId, setGameId] = useState('');
  const [logCounter, setLogCounter] = useState(1);

  const generateGameId = () => {
    const rnd = Math.floor(Math.random() * 1e15).toString().padStart(15, '0');
    return `ID-${rnd}`;
  };
  const [wallets, setWallets] = useState([]);
  const [remaining, setRemaining] = useState([]);
  const [eliminated, setEliminated] = useState([]);
  const [manualWinner, setManualWinner] = useState("");
  const [winner, setWinner] = useState(null);
  const [wave, setWave] = useState(0);
  const [killLog, setKillLog] = useState([]);

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      complete: (results) => {
        const wallets = results.data.flat().filter((w) => w);
        setGameId(generateGameId());
        setLogCounter(1);
        setWallets(wallets);
        setRemaining(wallets);
        setEliminated([]);
        setWave(0);
        setWinner(null);
        setKillLog([]);
      },
    });
  };

  const handleNextWave = () => {
    if (wave >= 6 || remaining.length <= 1) return;

    if (wave === 5) {
      const finalWinner = manualWinner || remaining[0];
      const eliminatedThisWave = remaining.filter((w) => w !== finalWinner);
      const messages = [];
      let counter = logCounter;
      for (const v of eliminatedThisWave) {
        const log = getRandomEvent(v, [finalWinner]);
        const tag = `${gameId}-${counter}]`;
        messages.push(`${gameId}-${counter}] ${log}`);
        counter++;
      }
      setLogCounter(counter);
      setKillLog((prev) => [...prev, messages]);
      setRemaining([finalWinner]);
      setEliminated([...eliminated, ...eliminatedThisWave]);
      setWinner(finalWinner);
      setWave(6);
      return;
    }

    const safeList = manualWinner
      ? remaining.filter((w) => w !== manualWinner)
      : remaining;

    const toEliminate = new Set();
    while (toEliminate.size < 25 && toEliminate.size < safeList.length) {
      const i = crypto.getRandomValues(new Uint32Array(1))[0] % safeList.length;
      toEliminate.add(safeList[i]);
    }

    const eliminatedThisWave = Array.from(toEliminate);
    const messages = [];
      let counter = logCounter;
      for (const v of eliminatedThisWave) {
        const log = getRandomEvent(v, remaining);
        const tag = `${gameId}-${counter}]`;
        messages.push(`${gameId}-${counter}] ${log}`);
        counter++;
      }
      setLogCounter(counter);
    const newEliminated = [...eliminated, ...eliminatedThisWave];
    const newRemaining = remaining.filter((w) => !toEliminate.has(w));
    setKillLog((prev) => [...prev, messages]);
    setEliminated(newEliminated);
    setRemaining(newRemaining);
    setWave(wave + 1);
  };

  const handleManualWinner = (e) => {
    setManualWinner(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-start px-6 py-10 font-[BasierCircle-Medium]">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-2">Solana Wallet Eliminator</h1>
        {gameId && <p className='text-sm text-gray-500 mb-4'>Game ID: {gameId}</p>}
        <input type="file" accept=".csv" onChange={handleCSV} className="mb-4" />
        {wallets.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm mb-1">Manual Winner (optional)</label>
            <input
              type="text"
              value={manualWinner}
              onChange={handleManualWinner}
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
            />
          </div>
        )}
        {remaining.length > 1 && wave < 6 && (
          <Button onClick={handleNextWave}>Run Wave {wave + 1}</Button>
        )}
        {wave === 6 && winner && (
          <div className="mt-6 text-green-600 text-xl font-bold">
            🎉 Final Winner: {winner}
          </div>
        )}
      </div>

      {remaining.length > 0 && (
        <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-10">
          {remaining.map((w, i) => (
            <Card key={i} className="bg-white text-xs p-2 text-center shadow-sm border border-gray-100">
              <CardContent>{shortenWallet(w)}</CardContent>
            </Card>
          ))}
        </div>
      )}

      {killLog.length > 0 && (
        <div className="w-full max-w-3xl mt-10 text-sm text-gray-700 space-y-4">
          {killLog.map((log, i) => (
            <div key={i}>
              <h2 className="font-bold mb-1">Wave {i + 1} Kill Log</h2>
              <ul className="list-disc list-inside space-y-1">
                {log.map((line, j) => (
                  <li key={j}>
      <span className="bg-red-600 text-white px-1 select-text">
        {line.split(']')[0] + ']'}
      </span>
      <span className="bg-green-400 text-black px-1 select-text">
        {line.split(']').slice(1).join(']')}
      </span>
    </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Eliminator;
