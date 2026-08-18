/**
 * Lotes/preços de festas vendidas na Cheers, lidos AO VIVO da API pública (sem auth).
 * Não guardamos no banco porque lote vira em dias e o sync roda uma vez por semana.
 * Vale pra qualquer evento cujo `ticket_url` aponte pra cheers.com.br (importado ou de aluno).
 * Se a Cheers mudar a API, o app só deixa de mostrar os lotes — nada quebra.
 */

const CHEERS_BATCHES = (slug: string) =>
  `https://ticket.cheersapp.com.br/api/v2/events/${slug}/batches/`;

/** "https://cheers.com.br/evento/patoloko-47o-edicao-33849?utm_source=…" → "patoloko-47o-edicao-33849" */
export const getCheersSlug = (ticketUrl: string | null | undefined): string | null => {
  if (!ticketUrl) return null;
  const match = ticketUrl.match(/^https?:\/\/(?:www\.)?cheers\.com\.br\/evento\/([^/?#]+)/i);
  return match ? match[1] : null;
};

/** Só o que a gente usa da resposta de /batches/. */
type CheersBatch = {
  id: number;
  title: string;
  price: number;
  /** "2026-08-22T15:00:00" em horário de Brasília, sem offset. */
  end_date: string | null;
  soldout: boolean;
  sale_blocked: boolean;
  show: boolean;
  exclusive_club_member?: boolean;
  exclusive_student?: boolean;
  exclusive_member?: boolean;
  exclusive_athlete?: boolean;
};

export type TicketLotStatus = 'available' | 'sold_out' | 'unavailable';

export interface TicketLot {
  id: number;
  title: string;
  /** Em reais; 0 = gratuito. */
  price: number;
  status: TicketLotStatus;
  /** Fim das vendas do lote (instante), quando a Cheers informa. */
  endsAt: Date | null;
  /** Lote restrito (Clube Cheers, sócio, atleta, estudante). */
  restricted: boolean;
}

export interface TicketLots {
  lots: TicketLot[];
  /** Menor preço entre os lotes disponíveis (null se nenhum disponível). */
  fromPrice: number | null;
  /** Maior preço entre os lotes disponíveis. */
  toPrice: number | null;
  /** Havia lotes mas todos esgotaram. */
  soldOut: boolean;
}

const BRT_OFFSET = '-03:00';

const parseBrt = (local: string | null): Date | null => {
  if (!local) return null;
  const date = new Date(`${local}${BRT_OFFSET}`);
  return isNaN(date.getTime()) ? null : date;
};

const lotStatus = (b: CheersBatch, now: number): TicketLotStatus => {
  if (b.soldout) return 'sold_out';
  const end = parseBrt(b.end_date);
  if (b.sale_blocked || (end && end.getTime() < now)) return 'unavailable';
  return 'available';
};

export const summarizeLots = (batches: CheersBatch[], now = Date.now()): TicketLots => {
  const lots: TicketLot[] = batches
    .filter((b) => b.show !== false)
    .map((b) => ({
      id: b.id,
      title: b.title.trim(),
      price: Number(b.price) || 0,
      status: lotStatus(b, now),
      endsAt: parseBrt(b.end_date),
      restricted: !!(
        b.exclusive_club_member ||
        b.exclusive_student ||
        b.exclusive_member ||
        b.exclusive_athlete
      ),
    }));
  const available = lots.filter((l) => l.status === 'available' && !l.restricted);
  const prices = available.map((l) => l.price);
  return {
    lots,
    fromPrice: prices.length ? Math.min(...prices) : null,
    toPrice: prices.length ? Math.max(...prices) : null,
    soldOut: lots.length > 0 && lots.every((l) => l.status === 'sold_out'),
  };
};

export const fetchCheersLots = async (slug: string, signal?: AbortSignal): Promise<TicketLots> => {
  const res = await fetch(CHEERS_BATCHES(slug), {
    headers: { accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw new Error(`Cheers batches HTTP ${res.status}`);
  const json = (await res.json()) as { data?: { lotes?: CheersBatch[] } };
  return summarizeLots(json.data?.lotes ?? []);
};

/** "R$ 85" / "R$ 38,50". A Cheers só vende em real. */
export const formatBrl = (value: number) => {
  const fixed = Number.isInteger(value) ? String(value) : value.toFixed(2).replace('.', ',');
  return `R$ ${fixed}`;
};
