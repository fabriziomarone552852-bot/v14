import re

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\hooks\mutations\useTrackersMutations.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old_mut = r'''  const addQuoteMutation = useMutation\(\{
    mutationFn: async \(payload: \{ episode_id: number; quote_text: string \}\) => \{
      const data = await api\.post<any>\('/trackers/quotes', payload\);
      return data;
    \},
    onSuccess: \(\) => \{
      queryClient\.invalidateQueries\(\{ queryKey: \['trackers', 'series'\] \}\);
    \},
  \}\);'''

new_mut = '''  const addQuoteMutation = useMutation({
    mutationFn: async (payload: { episode_id: number; quote_text: string }) => {
      const data = await api.post<any>('/trackers/quotes', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ quote_id, payload }: { quote_id: number; payload: { quote_text: string } }) => {
      const data = await api.patch<any>(/trackers/quotes/ + quote_id, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (quote_id: number) => {
      const data = await api.delete<any>(/trackers/quotes/ + quote_id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });'''

content = re.sub(old_mut, new_mut, content, flags=re.MULTILINE)

old_return = r'''    addQuote: addQuoteMutation\.mutate,
    isAddingQuote: addQuoteMutation\.isPending,'''

new_return = '''    addQuote: addQuoteMutation.mutate,
    isAddingQuote: addQuoteMutation.isPending,
    updateQuote: updateQuoteMutation.mutate,
    isUpdatingQuote: updateQuoteMutation.isPending,
    deleteQuote: deleteQuoteMutation.mutate,
    isDeletingQuote: deleteQuoteMutation.isPending,'''

content = re.sub(old_return, new_return, content, flags=re.MULTILINE)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\hooks\mutations\useTrackersMutations.ts', 'w', encoding='utf-8') as f:
    f.write(content)
