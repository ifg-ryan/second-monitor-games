import { describe, expect, it } from 'vitest';
import { checkUsername, isBannedName } from '../usernames';

const BANNED = [
  'fuck', 'FuckYou', 'f_u_c_k', 'fuuuuck', 'fvck_off', 'b1tch', 'BigDick', 'big_dick', 'b1gd1ck', 'xXslutXx', 'shit_head', 'shithead', 'xXshitXx',
  'nigger', 'n1gg3r', 'faggot', 'retard', 'kike', 'cunt99', 'pornstar', 'whore', 'Hitler88', 'kkk_member', 'pussy', 'penis',
  'cock', 'dickhead', 'asshole', 'a55hole', 'wanker',
];
const FINE = [
  'Ryan', 'Ryan_F', 'PEI_Golfer', 'classic', 'Classic_Gamer', 'titan', 'TitanFall', 'therapist', 'Peacock', 'Cocktail_Hour', 'Dickens',
  'Scunthorpe', 'assassin', 'Sussex', 'analyst', 'bass_player', 'grass', 'cucumber', 'shitake', 'Hancock', 'pass', 'Matsushita', 'Yamashita', 'Kinoshita', 'Kirk', 'Hacker',
  'grape', 'Pawn_Star', 'GodOfWar', 'hellokitty', 'butterfly', 'Spaceman', 'spicy', 'document', 'circumstance', 'Penistone',
];

describe('ban list', () => {
  it.each(BANNED)('blocks %s', (n) => expect(isBannedName(n)).toBe(true));
  it.each(FINE)('allows %s', (n) => expect(isBannedName(n)).toBe(false));
  it('blocks nicknames with spaces', () => {
    expect(isBannedName('big dick')).toBe(true);
    expect(isBannedName('Ryan F')).toBe(false);
  });
});

describe('checkUsername', () => {
  it('accepts a clean name and gives a lowercase key', () => {
    expect(checkUsername(' Ryan_F ')).toEqual({ ok: true, name: 'Ryan_F', key: 'ryan_f' });
  });
  it('enforces length and characters', () => {
    expect(checkUsername('ab').ok).toBe(false);
    expect(checkUsername('a'.repeat(21)).ok).toBe(false);
    expect(checkUsername('has space').ok).toBe(false);
    expect(checkUsername(42).ok).toBe(false);
  });
  it('reserves staff-looking names', () => {
    for (const n of ['admin', 'Admin_1', 'moderator', 'IronFoxGames', 'secondmonitor', 'guest', 'support_team']) expect(checkUsername(n).ok).toBe(false);
  });
});
