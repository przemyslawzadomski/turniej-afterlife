'use client'
import Image from 'next/image';
import { Player } from '@/lib/types';
import { Group } from '@/lib/types';
import { shuffle } from 'lodash'; 
import {useState} from 'react'


type PlayerListProps = {
  players: Player[];
  onRemove: (index: number) => void;
};


export default function PlayerList({ players, onRemove }: PlayerListProps) {
  
const [groups, setGroups] = useState<Group[] | null>(null);

const handleStartTournament = () => {
  if (players.length !== 12) return;

  const shuffled = shuffle(players);
  const groupA = shuffled.slice(0, 6);
  const groupB = shuffled.slice(6, 12);

  setGroups([
    { name: 'A', players: groupA },
    { name: 'B', players: groupB },
  ]);
};
  return (
    <div className="mt-6 bg-gray-800 p-4 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Lista graczy ({players.length})</h2>
      {players.length === 0 ? (
        <p className="text-gray-500">Brak graczy 😅</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {players.map((player, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-2 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={`/logos/${player.logo}`}
                  alt={player.name}
                  width={40}
                  height={40}
                  className="rounded"
                />
                <span className="font-medium">{player.name}</span>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="text-red-500 hover:underline text-sm"
              >
                Usuń
              </button>
            </li>
          ))}
        </ul>
      )}
{groups && (
  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
    {groups.map((group) => (
      <div key={group.name} className="bg-white p-4 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold mb-4">Grupa {group.name}</h2>
        <ul className="space-y-2">
          {group.players.map((player, index) => (
            <li key={index} className="flex items-center gap-3">
              <Image
                src={`/logos/${player.logo}`}
                alt={player.name}
                width={40}
                height={40}
              />
              <span>{player.name}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
)}

    </div>
  );
}
