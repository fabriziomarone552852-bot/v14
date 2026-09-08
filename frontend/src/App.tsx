import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import AppRouter from '@/router/AppRouter';
import { ConfirmProvider } from '@/context/ConfirmContext';
import { DayProvider } from '@/context/DayContext';
import { TaskModalProvider } from '@/context/TaskModalContext';
import { EventModalProvider } from '@/context/EventModalContext';
import { RoutineModalProvider } from '@/context/RoutineModalContext';
import { ShoppingModalProvider } from '@/context/ShoppingModalContext';
import { ArchiveHeaderProvider } from '@/context/ArchiveHeaderContext';
import { TailscaleGate } from '@/components/TailscaleGate';
import AppErrorBoundary from '@/components/AppErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <AppErrorBoundary>
        <TailscaleGate>
          <AuthProvider>
            <ConfirmProvider>
              <DayProvider>
                <EventModalProvider>
                  <TaskModalProvider>
                    <RoutineModalProvider>
                      <ShoppingModalProvider>
                        <ArchiveHeaderProvider>
                          <AppRouter />
                        </ArchiveHeaderProvider>
                      </ShoppingModalProvider>
                    </RoutineModalProvider>
                  </TaskModalProvider>
                </EventModalProvider>
              </DayProvider>
            </ConfirmProvider>
          </AuthProvider>
        </TailscaleGate>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}

export default App;