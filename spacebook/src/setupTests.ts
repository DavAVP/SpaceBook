<<<<<<< HEAD
import '@testing-library/jest-dom'
=======
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});

>>>>>>> 5ef04a4db080e9f245fa97e828b31512bdc65211
