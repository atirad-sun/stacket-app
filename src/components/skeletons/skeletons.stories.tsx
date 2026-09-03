import type { Meta, StoryObj } from '@storybook/react';
import { DataBoundary } from '@/primitives/data-boundary';
import { SkeletonRow } from './skeleton-row';
import { SkeletonCard } from './skeleton-card';
import { SkeletonStatRow } from './skeleton-stat-row';

const meta: Meta = { title: 'Skeletons/SkeletonSet' };
export default meta;

export const ListLoading: StoryObj = {
  render: () => (
    <DataBoundary
      state={{ status: 'loading' }}
      skeleton={
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonStatRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      }
      empty={<p>empty</p>}
    >
      {() => null}
    </DataBoundary>
  ),
};
