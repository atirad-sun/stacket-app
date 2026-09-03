import type { Meta, StoryObj } from '@storybook/react';
import { FilterChip } from './filter-chip';
import { FilterSheet } from './filter-sheet';
import { FilterRail } from './filter-rail';

const groups = [
  { key: 'game', label: 'เกม', children: <div className="text-body text-text-2">Pokémon, One Piece, Yu-Gi-Oh!</div> },
  { key: 'condition', label: 'สภาพ', children: <div className="text-body text-text-2">NM, LP, MP, HP, DMG</div> },
];

const meta: Meta = { title: 'Forms/Filter' };
export default meta;

export const Chip: StoryObj = { render: () => <FilterChip label="โปเกมอน" onRemove={() => {}} /> };
export const Sheet: StoryObj = {
  render: () => <FilterSheet open groups={groups} onClose={() => {}} onApply={() => {}} onReset={() => {}} />,
};
export const Rail: StoryObj = {
  render: () => <FilterRail groups={groups} onApply={() => {}} onReset={() => {}} />,
};
