import { Loan } from '@/types/loan';
import { mockLoans } from '@/data/mockLoans';

const STORAGE_KEY = 'lma_edge_loans';

export const loanService = {
    getLoans: (): Loan[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                // Initialize with mock loans if empty
                localStorage.setItem(STORAGE_KEY, JSON.stringify(mockLoans));
                return mockLoans;
            }
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error reading loans from storage:', error);
            return mockLoans;
        }
    },

    getLoanById: (id: string): Loan | undefined => {
        const loans = loanService.getLoans();
        return loans.find(l => l.id === id);
    },

    saveLoan: (loan: Loan): void => {
        try {
            const loans = loanService.getLoans();
            const existingIndex = loans.findIndex(l => l.id === loan.id);

            if (existingIndex >= 0) {
                loans[existingIndex] = loan;
            } else {
                loans.unshift(loan); // Add to top
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
        } catch (error) {
            console.error('Error saving loan:', error);
        }
    },

    deleteLoan: (id: string): void => {
        try {
            const loans = loanService.getLoans();
            const filtered = loans.filter(l => l.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error('Error deleting loan:', error);
        }
    },

    clearAll: (): void => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
