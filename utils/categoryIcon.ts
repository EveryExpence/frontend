import { MaterialCommunityIcons } from "@expo/vector-icons";

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export const getCategoryIcon = (name: string): IconName => {
    const n = name.toLowerCase();

    if (n.includes('salary') || n.includes('work') || n.includes('pay')) return 'briefcase';
    if (n.includes('invest') || n.includes('stock') || n.includes('dividend')) return 'cash-multiple';
    if (n.includes('return') || n.includes('refund')) return 'history';
    if (n.includes('gift')) return 'gift';
    if (n.includes('sell') || n.includes('sale')) return 'tag-outline';

    if (n.includes('food') || n.includes('rest') || n.includes('eat') || n.includes('grocery')) return 'food';
    if (n.includes('transport') || n.includes('car') || n.includes('bus') || n.includes('taxi') || n.includes('fuel')) return 'bus';
    if (n.includes('shop') || n.includes('cloth') || n.includes('buy')) return 'cart';
    if (n.includes('bill') || n.includes('rent') || n.includes('utilit') || n.includes('tax')) return 'file-document';
    if (n.includes('health') || n.includes('pharm') || n.includes('doctor')) return 'medical-bag';
    if (n.includes('fun') || n.includes('entert') || n.includes('game') || n.includes('movie')) return 'controller-classic';
    if (n.includes('edu') || n.includes('school') || n.includes('book')) return 'school';
    if (n.includes('home') || n.includes('house') || n.includes('furnit')) return 'home';

    return 'label-outline';
};
