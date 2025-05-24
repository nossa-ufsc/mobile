import { Text } from '@/ui/text';

export const HeaderTitle = ({
  title,
  withMarginLeft = true,
}: {
  title: string;
  withMarginLeft?: boolean;
}) => {
  return (
    <Text style={{ marginLeft: withMarginLeft ? 15 : 0, fontSize: 22, fontWeight: 'bold' }}>
      {title}
    </Text>
  );
};
