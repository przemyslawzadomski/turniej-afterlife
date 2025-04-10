'use client';

import { useEffect, useState } from 'react';
import { shuffle } from 'lodash';
import PlayerForm from '@/components/PlayerForm';
import PlayerList from '@/components/PlayerList';
import MatchModal from '@/components/MatchModal';
import Image from 'next/image';
import {
  Player,
  Group,
  Match,
  KnockoutMatch,
} from '@/lib/types';
import {
  generateGroupMatches,
  calculateGroupStandings,
  generateKnockoutMatches,
  generateNextRound,
  scheduleMatchesSmartly,
} from '@/lib/utils';
import {
  saveToStorage,
  loadFromStorage,
} from '@/lib/storage';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatch[]>([]);
  const [selectedKnockout, setSelectedKnockout] = useState<KnockoutMatch | null>(null);

  useEffect(() => {
    const savedPlayers = loadFromStorage<Player[]>('players');
    const savedGroups = loadFromStorage<Group[]>('groups');
    const savedMatches = loadFromStorage<Match[]>('matches');

    if (savedPlayers) setPlayers(savedPlayers);
    if (savedGroups) setGroups(savedGroups);
    if (savedMatches) setMatches(savedMatches);
  }, []);

  useEffect(() => {
    saveToStorage('players', players);
  }, [players]);

  useEffect(() => {
    saveToStorage('groups', groups);
  }, [groups]);

  useEffect(() => {
    saveToStorage('matches', matches);
  }, [matches]);

  const handleAddPlayer = (player: Player) => {
    setPlayers((prev) => [...prev, player]);
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartTournament = () => {
    if (players.length !== 12) return;

    const shuffled = shuffle(players);
    const groupA = shuffled.slice(0, 6);
    const groupB = shuffled.slice(6, 12);

    setGroups([
      { name: 'A', players: groupA },
      { name: 'B', players: groupB },
    ]);

    const groupAMatches = generateGroupMatches(groupA, 'A');
    const groupBMatches = generateGroupMatches(groupB, 'B');
    const allMatches = shuffle([...groupAMatches, ...groupBMatches]);
    const smartMatches = scheduleMatchesSmartly(allMatches);

    setMatches(smartMatches);
  };

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleSaveScore = (home: number, away: number) => {
    if (!selectedMatch) return;
    setMatches((prev) =>
      prev.map((m) =>
        m === selectedMatch
          ? { ...m, scoreHome: home, scoreAway: away }
          : m
      )
    );
    setSelectedMatch(null);
  };

  const handleKnockoutClick = (match: KnockoutMatch) => {
    setSelectedKnockout(match);
    setIsModalOpen(true);
  };

  const handleKnockoutScore = (home: number, away: number) => {
    if (!selectedKnockout) return;
    const winner = home > away ? selectedKnockout.home : selectedKnockout.away;

    const updated = knockoutMatches.map((m) =>
      m === selectedKnockout
        ? {
            ...m,
            scoreHome: home,
            scoreAway: away,
            winner,
          }
        : m
    );

    setKnockoutMatches(updated);
    setSelectedKnockout(null);

    if (
      updated.filter((m) => m.round === 'Ćwierćfinał' && m.winner !== null).length === 4 &&
      updated.filter((m) => m.round === 'Półfinał').length === 0
    ) {
      const semi = generateNextRound(updated.filter((m) => m.round === 'Ćwierćfinał'), 'Półfinał');
      setKnockoutMatches((prev) => [...prev, ...semi]);
    }

    if (
      updated.filter((m) => m.round === 'Półfinał' && m.winner !== null).length === 2 &&
      updated.filter((m) => m.round === 'Finał').length === 0
    ) {
      const final = generateNextRound(updated.filter((m) => m.round === 'Półfinał'), 'Finał');
      setKnockoutMatches((prev) => [...prev, ...final, ...third]);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Turniej AFTERLIFE 🔥</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlayerForm onAddPlayer={handleAddPlayer} />
        <PlayerList players={players} onRemove={handleRemovePlayer} />
      </div>

      <button
        disabled={players.length !== 12}
        onClick={handleStartTournament}
        className={`mt-6 w-full py-3 text-white font-bold rounded-lg transition ${
          players.length === 12 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Rozpocznij turniej
      </button>

      {matches.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Mecze grupowe</h2>
          <ul className="space-y-2">
            {matches.map((match, index) => (
              <li
                key={index}
                className="p-2 bg-gray-800 rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-700"
                onClick={() => handleMatchClick(match)}
              >
                <span className="text-white font-medium flex items-center gap-2">
                  <Image src={`/logos/${match.home.logo}`} alt={match.home.name} width={24} height={24} />
                  {match.home.name} vs {match.away.name}
                  <Image src={`/logos/${match.away.logo}`} alt={match.away.name} width={24} height={24} />
                </span>
                <span className="text-sm text-gray-400">
                  Wynik: {match.scoreHome ?? '-'} : {match.scoreAway ?? '-'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {groups && groups.map((group) => {
        const groupMatches = matches.filter((m) => m.group === group.name);
        const standings = calculateGroupStandings(group.players, groupMatches);

        return (
          <div key={group.name} className="mt-8 bg-gray-800 p-4 rounded-2xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Tabela grupy {group.name}</h2>
            <table className="w-full text-sm text-white">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-1">Gracz</th>
                  <th>Pkt</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>+/-</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-1 flex items-center gap-2">
                      <Image src={`/logos/${s.player.logo}`} alt={s.player.name} width={20} height={20} />
                      {s.player.name}
                    </td>
                    <td className="text-center">{s.points}</td>
                    <td className="text-center">{s.goalsFor}</td>
                    <td className="text-center">{s.goalsAgainst}</td>
                    <td className="text-center">{s.goalDiff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {groups && matches.every((m) => m.scoreHome !== null && m.scoreAway !== null) && knockoutMatches.length === 0 && (
        <div className="mt-8 text-center">
          <button
            className="px-6 py-3 bg-purple-600 rounded text-white hover:bg-purple-700 font-bold"
            onClick={() => {
              const standingsA = calculateGroupStandings(groups[0].players, matches.filter((m) => m.group === 'A'));
              const standingsB = calculateGroupStandings(groups[1].players, matches.filter((m) => m.group === 'B'));
              const generated = generateKnockoutMatches(groups, standingsA, standingsB);
              setKnockoutMatches(generated);
            }}
          >
            Rozpocznij fazę pucharową
          </button>
        </div>
      )}

{knockoutMatches.length > 0 && (
  <div className="mt-12">
    <h2 className="text-2xl font-bold mb-4">Faza pucharowa</h2>

    {['Ćwierćfinał', 'Półfinał', 'Finał'].map((round) => {
      const roundMatches = knockoutMatches.filter((m) => m.round === round);
      if (roundMatches.length === 0) return null;

      return (
        <div key={round} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{round}</h3>
          <ul className="space-y-2">
            {roundMatches.map((match, index) => (
              <li
                key={index}
                className="bg-gray-800 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-700"
                onClick={() => handleKnockoutClick(match)}
              >
                <span className="flex items-center gap-2">
                  <Image src={`/logos/${match.home.logo}`} alt={match.home.name} width={24} height={24} />
                  {match.home.name} vs {match.away.name}
                  <Image src={`/logos/${match.away.logo}`} alt={match.away.name} width={24} height={24} />
                </span>
                <span>
                  {match.scoreHome ?? '-'} : {match.scoreAway ?? '-'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    })}

    {knockoutMatches.find((m) => m.round === 'Finał' && m.winner) && (
      <div className="mt-8 p-4 bg-green-700 text-center rounded-lg text-xl font-bold">
        🏆 Zwycięzca turnieju: {knockoutMatches.find((m) => m.round === 'Finał')?.winner?.name} 🏆
      </div>
    )}
  </div>
)}


      <MatchModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMatch(null);
          setSelectedKnockout(null);
        }}
        match={selectedMatch ?? selectedKnockout}
        onSave={(home, away) => {
          if (selectedMatch) handleSaveScore(home, away);
          if (selectedKnockout) handleKnockoutScore(home, away);
        }}
      />
    </main>
  );
}