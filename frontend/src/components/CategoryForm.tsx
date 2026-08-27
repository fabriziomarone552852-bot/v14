// src/components/CategoryForm.tsx
import React, { useEffect, useState } from 'react';
import { CategoryGenre } from '@/types';

export interface CategoryFormValues {
  name: string;
  color: string;
  genre: CategoryGenre;
}

interface CategoryFormProps {
  mode: 'create' | 'edit';
  initialValues?: CategoryFormValues;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const defaultValues: CategoryFormValues = {
  name: '',
  color: '#cccccc',
  genre: CategoryGenre.TASKS,
};

const CategoryForm: React.FC<CategoryFormProps> = ({
  mode,
  initialValues,
  onSubmit,
  isSubmitting = false,
}) => {
  const [values, setValues] = useState<CategoryFormValues>(defaultValues);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialize form state from props
      setValues(initialValues);
    } else {
      setValues(defaultValues);
    }
  }, [initialValues]);

  const handleChange =
    (field: keyof CategoryFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        field === 'genre'
          ? Number(e.target.value) as CategoryGenre
          : e.target.value;

      setValues((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        color: values.color || '#cccccc',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || isSubmitting;
  const isInvalid = !values.name.trim();

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'grid', gap: 12, maxWidth: 500 }}
    >
      <div>
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Nome
        </label>
        <input
          value={values.name}
          onChange={handleChange('name')}
          placeholder="Es. Casa, Lavoro..."
          required
          disabled={isBusy}
        />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Colore
        </label>
        <input
          type="color"
          value={values.color}
          onChange={handleChange('color')}
          disabled={isBusy}
        />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontWeight: 600,
            marginBottom: 4,
          }}
        >
          Tipo
        </label>
        <select
          value={values.genre}
          onChange={handleChange('genre')}
          disabled={isBusy}
        >
          <option value={CategoryGenre.TASKS}>Tasks</option>
          <option value={CategoryGenre.EVENTS}>Events</option>
          <option value={CategoryGenre.COMMON}>Comune</option>
        </select>
      </div>

      <button type="submit" disabled={isBusy || isInvalid}>
        {isBusy
          ? 'Salvataggio...'
          : mode === 'create'
            ? 'Salva categoria'
            : 'Salva modifiche'}
      </button>
    </form>
  );
};

export default CategoryForm;