import { defineConfig } from 'orval';

export default defineConfig({
  taiApi: {
    input: './swagger.json',
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: 'src/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
