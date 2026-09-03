import type { Meta, StoryObj } from '@storybook/react';
import { CardTile } from './card-tile';
import { CardRow } from './card-row';

const meta: Meta = { title: 'Cards/CardTile+CardRow' };
export default meta;

export const Tile: StoryObj = {
  render: () => (
    <div className="w-40">
      <CardTile imageAlt="Charizard VMAX" name="Charizard VMAX" subtitle="Champion's Path" price="฿42,000" />
    </div>
  ),
};

export const Row: StoryObj = {
  render: () => (
    <CardRow
      imageAlt="Charizard VMAX"
      name="Charizard VMAX (Rainbow Rare)"
      subtitle="Champion's Path · No.074/073"
      price="฿42,000"
      conditionLabel="PSA 10"
      deltaLabel="8.2%"
      deltaDirection="up"
    />
  ),
};
