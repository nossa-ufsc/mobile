import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { Badge } from '@/ui/badge';
import { getDateLocale } from '@/utils/i18n/get-date-locale';
import { cn } from '@/utils/cn';
import { formatBrl, type TicketLot, type TicketLots } from '../utils/cheers-tickets';

interface EventTicketsProps {
  tickets: TicketLots;
}

/** "sáb, 22 ago · 15:00" — quando o lote fecha. */
const formatEndsAt = (date: Date) => {
  const locale = getDateLocale();
  const day = date
    .toLocaleDateString(locale, { weekday: 'short', day: '2-digit', month: 'short' })
    .replace(/\./g, '')
    .replace(/ de /g, ' ');
  const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${time}`;
};

const LotRow = ({ lot }: { lot: TicketLot }) => {
  const { t } = useTranslation();
  const soldOut = lot.status === 'sold_out';
  const endsSoon = lot.status === 'available' && lot.endsAt;

  return (
    <View className="flex-row items-center py-3">
      <View className="flex-1 pr-3">
        <Text
          variant="subhead"
          numberOfLines={1}
          className={cn('font-medium', soldOut && 'text-muted-foreground line-through')}>
          {lot.title || t('events.lot')}
        </Text>
        {endsSoon && (
          <Text variant="caption1" color="tertiary" numberOfLines={1}>
            {t('events.lotUntil', { date: formatEndsAt(lot.endsAt!) })}
          </Text>
        )}
      </View>
      {soldOut ? (
        <Badge tone="neutral" label={t('events.soldOut')} />
      ) : (
        <Text variant="heading" className="text-primary">
          {lot.price === 0 ? t('events.free') : formatBrl(lot.price)}
        </Text>
      )}
    </View>
  );
};

/**
 * Lotes da Cheers ao vivo: disponíveis (com preço e prazo) e esgotados (riscados, pra
 * mostrar a progressão). Lotes encerrados/bloqueados e restritos (Clube Cheers, sócio)
 * ficam de fora — o aluno não consegue comprar. Sem nada pra mostrar, não renderiza.
 */
export const EventTickets = ({ tickets }: EventTicketsProps) => {
  const { t } = useTranslation();
  const lots = tickets.lots.filter(
    (lot) => !lot.restricted && (lot.status === 'available' || lot.status === 'sold_out')
  );
  if (lots.length === 0) return null;

  return (
    <View className="mt-6">
      <View className="mb-2 flex-row items-center justify-between">
        <Text variant="heading">{t('events.tickets')}</Text>
        {tickets.soldOut && <Badge tone="warning" label={t('events.soldOut')} />}
      </View>
      <View className="rounded-2xl bg-card px-4" style={{ borderCurve: 'continuous' }}>
        {lots.map((lot, i) => (
          <View key={lot.id}>
            {i > 0 && <View className="h-px bg-border" />}
            <LotRow lot={lot} />
          </View>
        ))}
      </View>
      <Text variant="caption2" color="quarternary" className="mt-2 text-center">
        {t('events.pricesFromCheers')}
      </Text>
    </View>
  );
};
