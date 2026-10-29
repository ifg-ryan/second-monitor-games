// Leaderboards for every Claude Games kit game (server component), one card each in the front
// page's look (LeaderboardCard). Each card has an anchor (#<game id>) so games can link straight
// to it; games with several boards (Putt Party's courses) read every board and tab between them.
import { prisma } from '@/lib/prisma';
import { KIT_GAMES, kitUrl, kitBoards, type KitGame, type BoardRef } from '@/lib/kitGames';
import { typeStripe } from '@/lib/gameTypes';
import LeaderboardCard, { type BoardData } from './LeaderboardCard';

async function top10(game: KitGame, board: BoardRef): Promise<BoardData> {
  const base = { id: board.id, name: board.name };
  try {
    const rows = await prisma.kitScore.findMany({
      where: { game: board.key },
      orderBy: [{ score: game.score.lowerIsBetter ? 'asc' : 'desc' }, { updatedAt: 'asc' }],
      take: 10,
      select: { playerId: true, name: true, score: true, isGuest: true },
    });
    return { ...base, rows, ok: true };
  } catch {
    return { ...base, rows: [], ok: false };
  }
}

export default async function KitLeaderboards({ userId }: { userId: string | null }) {
  const cards = await Promise.all(
    KIT_GAMES.map(async (game) => ({ game, boards: await Promise.all(kitBoards(game).map((b) => top10(game, b))) })),
  );

  return (
    <div style={{ display: 'grid', gap: '20px', marginBottom: '48px' }}>
      {cards.map(({ game, boards }) => (
        <LeaderboardCard
          key={game.id}
          userId={userId}
          boards={boards}
          game={{ id: game.id, title: game.title, tag: game.tag, href: kitUrl(game.id), stripe: typeStripe(game.type), preview: game.preview, minutes: game.minutes, label: game.score.label }}
        />
      ))}
    </div>
  );
}
