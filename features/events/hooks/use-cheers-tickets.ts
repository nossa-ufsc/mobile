import { useQuery } from '@tanstack/react-query';
import { fetchCheersLots, getCheersSlug } from '../utils/cheers-tickets';

/**
 * Lotes/preços ao vivo da Cheers pra um evento cujo `ticket_url` é da Cheers.
 * Desabilitado (data undefined) pra qualquer outro link. Falha silenciosa: a tela
 * simplesmente não mostra a seção de ingressos.
 */
export const useCheersTickets = (ticketUrl: string | null | undefined) => {
  const slug = getCheersSlug(ticketUrl);
  return useQuery({
    queryKey: ['cheers-tickets', slug],
    enabled: !!slug,
    queryFn: ({ signal }) => fetchCheersLots(slug!, signal),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
