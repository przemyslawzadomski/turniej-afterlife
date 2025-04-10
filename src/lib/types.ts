export type Player = {
  name: string;
  logo: string;
};

export type Group = {
  name: 'A' | 'B';
  players: Player[];
};

export type Match = {
  home: Player;
  away: Player;
  group: 'A' | 'B';
  scoreHome: number | null;
  scoreAway: number | null;
};

export type KnockoutMatch = {
  round: 'Ćwierćfinał' | 'Półfinał' | 'Finał' | 'Mecz o 3. miejsce';
  home: Player;
  away: Player;
  scoreHome: number | null;
  scoreAway: number | null;
  winner: Player | null;
};
