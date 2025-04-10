import { Match, Player, Group, KnockoutMatch } from './types';

export type Standing = {
  player: Player;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
};

export function generateGroupMatches(players: Player[], groupName: 'A' | 'B'): Match[] {
  const matches: Match[] = [];

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        home: players[i],
        away: players[j],
        group: groupName,
        scoreHome: null,
        scoreAway: null,
      });
    }
  }

  return matches;
}

export function calculateGroupStandings(players: Player[], matches: Match[]): Standing[] {
  const standings: Standing[] = players.map((player) => ({
    player,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
  }));

  for (const match of matches) {
    if (match.scoreHome === null || match.scoreAway === null) continue;

    const home = standings.find((s) => s.player.name === match.home.name);
    const away = standings.find((s) => s.player.name === match.away.name);

    if (!home || !away) continue;

    home.goalsFor += match.scoreHome;
    home.goalsAgainst += match.scoreAway;
    away.goalsFor += match.scoreAway;
    away.goalsAgainst += match.scoreHome;

    if (match.scoreHome > match.scoreAway) {
      home.points += 3;
    } else if (match.scoreHome < match.scoreAway) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  standings.forEach((s) => {
    s.goalDiff = s.goalsFor - s.goalsAgainst;
  });

  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });
}

export function generateKnockoutMatches(
  groups: Group[],
  standingsA: Standing[],
  standingsB: Standing[]
): KnockoutMatch[] {
  return [
    {
      round: 'Ćwierćfinał',
      home: standingsA[0].player,
      away: standingsB[3].player,
      scoreHome: null,
      scoreAway: null,
      winner: null,
    },
    {
      round: 'Ćwierćfinał',
      home: standingsA[1].player,
      away: standingsB[2].player,
      scoreHome: null,
      scoreAway: null,
      winner: null,
    },
    {
      round: 'Ćwierćfinał',
      home: standingsB[0].player,
      away: standingsA[3].player,
      scoreHome: null,
      scoreAway: null,
      winner: null,
    },
    {
      round: 'Ćwierćfinał',
      home: standingsB[1].player,
      away: standingsA[2].player,
      scoreHome: null,
      scoreAway: null,
      winner: null,
    },
  ];
}

export function generateNextRound(
  currentMatches: KnockoutMatch[],
  round: 'Półfinał' | 'Finał' 
): KnockoutMatch[] {
  const finished = currentMatches.filter(
    (m) => m.scoreHome !== null && m.scoreAway !== null
  );

  if (round === 'Półfinał') {
    return [
      {
        round,
        home: finished[0].winner!,
        away: finished[1].winner!,
        scoreHome: null,
        scoreAway: null,
        winner: null,
      },
      {
        round,
        home: finished[2].winner!,
        away: finished[3].winner!,
        scoreHome: null,
        scoreAway: null,
        winner: null,
      },
    ];
  }

  if (round === 'Finał') {
    return [
      {
        round,
        home: finished[0].winner!,
        away: finished[1].winner!,
        scoreHome: null,
        scoreAway: null,
        winner: null,
      },
    ];
  }
  

  return [];
}
export function scheduleMatchesSmartly(matches: Match[]): Match[] {
  const result: Match[] = [];
  const queue = [...matches];
  let lastPlayers: string[] = [];

  while (queue.length > 0) {
    let index = queue.findIndex(
      (m) =>
        !lastPlayers.includes(m.home.name) &&
        !lastPlayers.includes(m.away.name)
    );

    if (index === -1) index = 0; // nie da się lepiej, bierz co jest

    const match = queue.splice(index, 1)[0];
    result.push(match);
    lastPlayers = [match.home.name, match.away.name];
  }

  return result;
}
