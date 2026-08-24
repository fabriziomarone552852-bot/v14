import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import AppRouter from '@/router/AppRouter';
import { ConfirmProvider } from '@/context/ConfirmContext';
import { DayProvider } from '@/context/DayContext';
import { TaskModalProvider } from '@/context/TaskModalContext';
import { EventModalProvider } from '@/context/EventModalContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
          <DayProvider>
            <EventModalProvider>
              <TaskModalProvider>
                <AppRouter />
              </TaskModalProvider>
            </EventModalProvider>
          </DayProvider>
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;