'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Player } from '@/lib/types';
import { logos } from '@/lib/logos';
import { Combobox } from '@headlessui/react';

type PlayerFormProps = {
  onAddPlayer: (player: Player) => void;
};

export default function PlayerForm({ onAddPlayer }: PlayerFormProps) {
  const [name, setName] = useState('');
  const [selectedLogo, setSelectedLogo] = useState<{ name: string; file: string } | null>(null);
  const [query, setQuery] = useState('');

  const filteredLogos =
    query === ''
      ? logos
      : logos.filter((logo) =>
          logo.name.toLowerCase().includes(query.toLowerCase())
        );

  const handleAdd = () => {
    if (!name || !selectedLogo) return;
    onAddPlayer({ name, logo: selectedLogo.file });
    setName('');
    setSelectedLogo(null);
    setQuery('');
  };

  return (
    <div className="p-4 bg-gray-800 rounded-2xl shadow-md text-white">
      <h2 className="text-xl font-bold mb-4">Dodaj gracza</h2>

      <input
        className="border border-gray-700 p-2 rounded w-full mb-4 bg-gray-700 text-white"
        type="text"
        placeholder="Imię gracza"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Combobox value={selectedLogo} onChange={setSelectedLogo}>
        <Combobox.Input
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white mb-2"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(logo: any) => logo?.name || ''}
          placeholder="Wyszukaj klub..."
        />
        <Combobox.Options className="bg-gray-700 max-h-60 overflow-auto rounded-md mt-1 border border-gray-600">
          {filteredLogos.map((logo) => (
            <Combobox.Option
              key={logo.file}
              value={logo}
              className="p-2 hover:bg-gray-600 cursor-pointer"
            >
              {logo.name}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>

      {selectedLogo && (
        <div className="mb-4 flex justify-center mt-4">
          <Image
            src={`/logos/${selectedLogo.file}`}
            alt="Logo klubu"
            width={100}
            height={100}
            className="rounded"
          />
        </div>
      )}

      <button
        onClick={handleAdd}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
      >
        Dodaj gracza
      </button>
    </div>
  );
}
