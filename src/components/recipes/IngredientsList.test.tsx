import { render, screen } from '@testing-library/react';
import IngredientsList from './IngredientsList';

describe('IngredientsList (Einsteiger-Tests)', () => {
  const familyId = 'test-family';
  const onClose = () => {};

  it('rendert ohne Fehler', () => {
    render(<IngredientsList familyId={familyId} onClose={onClose} />);
  });

  it('zeigt den Zurück-Button', () => {
    render(<IngredientsList familyId={familyId} onClose={onClose} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
