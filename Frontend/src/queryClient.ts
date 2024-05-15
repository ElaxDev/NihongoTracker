import { QueryClient, QueryCache } from '@tanstack/react-query';
import { toast } from 'react-toastify';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error.message ? error.message : 'An error occurred');
    },
  }),
});

export default queryClient;
