'use client';

import { Match, KnockoutMatch } from '@/lib/types';
import { Dialog } from '@headlessui/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

type MatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  match: Match | KnockoutMatch | null;
  onSave: (homeScore: number, awayScore: number) => void;
};

export default function MatchModal({
  isOpen,
  onClose,
  match,
  onSave,
}: MatchModalProps) {
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  useEffect(() => {
    setHomeScore('');
    setAwayScore('');
  }, [match]);

  if (!match) return null;

  const handleSave = () => {
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away)) return;
    onSave(home, away);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-gray-800 p-8 rounded-xl max-w-2xl w-full shadow-xl text-white">
          <Dialog.Title className="text-2xl font-bold mb-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <Image
                src={`/logos/${match.home.logo}`}
                alt={match.home.name}
                width={40}
                height={40}
              />
              <span>{match.home.name}</span>
              <span className="text-lg font-normal">vs</span>
              <span>{match.away.name}</span>
              <Image
                src={`/logos/${match.away.logo}`}
                alt={match.away.name}
                width={40}
                height={40}
              />
            </div>
          </Dialog.Title>

          <div className="flex gap-4 mb-6">
            <input
              type="number"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="Gole gospodarza"
              className="w-1/2 p-3 rounded bg-gray-700 text-white text-center text-lg"
            />
            <input
              type="number"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="Gole gościa"
              className="w-1/2 p-3 rounded bg-gray-700 text-white text-center text-lg"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 rounded text-white hover:bg-blue-700 transition text-lg font-semibold"
          >
            Zapisz wynik
          </button>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
