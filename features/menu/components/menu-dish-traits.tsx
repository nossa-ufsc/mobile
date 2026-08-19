import type { ComponentProps } from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { Text } from '@/ui/text';
import { cn } from '@/utils/cn';
import { MenuCategory, MenuDish } from '@/types';

type MCIName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * `risk`  → o prato CONTÉM algo (glúten/lácteos). É a única informação que
 *           precisa chamar atenção — recebe cor.
 * `muted` → reforço/informativo ("sem glúten", "vegano"). Fica discreto em
 *           texto terciário, numa única linha, sem pílulas.
 */
type TraitKind = 'risk' | 'muted';

interface Trait {
  key: string;
  label: string;
  icon: MCIName;
  kind: TraitKind;
}

const RISK = { light: '#b45309', dark: '#fbbf24' };
const MUTED = { light: 'rgb(142, 142, 147)', dark: 'rgb(142, 142, 147)' };

export const useDishTraits = (dish: MenuDish, category?: MenuCategory): Trait[] => {
  const { t } = useTranslation();
  const a = dish.alergenos;
  if (!a) return [];

  const traits: Trait[] = [];
  const cat = category ?? dish.categoria;

  // Riscos primeiro — são o que o usuário alérgico precisa ver.
  if (a.gluten === true)
    traits.push({ key: 'gluten', label: t('menu.allergens.gluten'), icon: 'barley', kind: 'risk' });
  if (a.lacteos === true)
    traits.push({ key: 'lacteos', label: t('menu.allergens.dairy'), icon: 'cheese', kind: 'risk' });

  // Informativos, discretos.
  if (a.origemAnimal === false)
    traits.push({
      key: 'vegan',
      label: t('menu.allergens.noAnimalOrigin'),
      icon: 'sprout',
      kind: 'muted',
    });
  if (a.gluten === false)
    traits.push({
      key: 'gluten',
      label: t('menu.allergens.glutenFree'),
      icon: 'barley-off',
      kind: 'muted',
    });
  // Vegano já implica sem lácteos — não repete.
  if (a.lacteos === false && a.origemAnimal !== false)
    traits.push({
      key: 'lacteos',
      label: t('menu.allergens.dairyFree'),
      icon: 'cheese-off',
      kind: 'muted',
    });
  // "Origem animal" num prato de carne é redundante — só mostra fora da seção de carne.
  if (a.origemAnimal === true && cat !== 'carne')
    traits.push({
      key: 'animal',
      label: t('menu.allergens.animalOrigin'),
      icon: 'cow',
      kind: 'muted',
    });

  return traits;
};

interface MenuDishTraitsProps {
  traits: Trait[];
  className?: string;
}

/** Linha discreta "ícone + texto · ícone + texto". Só os riscos ("contém X") recebem cor. */
export const MenuDishTraits = ({ traits, className }: MenuDishTraitsProps) => {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  if (traits.length === 0) return null;

  return (
    <View
      className={cn('flex-row flex-wrap items-center gap-x-2 gap-y-1.5', className)}
      accessibilityLabel={traits.map((tr) => tr.label).join(', ')}>
      {traits.map((tr, i) => {
        const isRisk = tr.kind === 'risk';
        const color = isRisk ? RISK[scheme] : MUTED[scheme];
        return (
          <View key={tr.key} className="flex-row items-center gap-x-2">
            {i > 0 && (
              <Text
                variant="footnote"
                className="text-muted-foreground/40"
                accessibilityElementsHidden>
                ·
              </Text>
            )}
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name={tr.icon} size={13} color={color} />
              <Text
                variant="footnote"
                className={cn(
                  isRisk
                    ? 'font-semibold text-amber-700 dark:text-amber-400'
                    : 'text-muted-foreground/90'
                )}>
                {tr.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

interface MenuDishTraitIconsProps {
  traits: Trait[];
  className?: string;
}

/** Versão compacta, só ícones — vai à direita da linha do prato, ao lado do chevron. */
export const MenuDishTraitIcons = ({ traits, className }: MenuDishTraitIconsProps) => {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  if (traits.length === 0) return null;

  return (
    <View
      className={cn('flex-row items-center gap-1.5', className)}
      accessibilityLabel={traits.map((tr) => tr.label).join(', ')}>
      {traits.map((tr) => {
        const isRisk = tr.kind === 'risk';
        return (
          <MaterialCommunityIcons
            key={tr.key}
            name={tr.icon}
            size={13}
            color={isRisk ? RISK[scheme] : MUTED[scheme]}
            style={isRisk ? undefined : { opacity: 0.7 }}
          />
        );
      })}
    </View>
  );
};
