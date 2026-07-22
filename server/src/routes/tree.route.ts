import { Elysia } from 'elysia';
import { TreeService } from '../services/tree.service';

export const treeRoute = new Elysia({ prefix: '/api/trees' })
  .get('/:treeId', async ({ params, set }) => {
    try {
      const tree = await TreeService.getTreeDetails(params.treeId);
      
      if (!tree) {
        set.status = 404;
        return { error: 'Tree not found' };
      }
      
      return tree;
    } catch (error: any) {
      set.status = 500;
      return { error: 'Failed to retrieve tree data', details: error.message };
    }
  });
